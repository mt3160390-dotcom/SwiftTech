import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

/**
 * eSewa v2 sends the result as a base64-encoded JSON string in ?data=<base64>
 * Older / flat-param style: ?status=COMPLETE&refId=...&amt=...
 * This component handles both.
 */
function EsewaReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processEsewaPayment = async () => {
      try {
        // ── decode eSewa v2 response ──────────────────────────────────────
        let status, refId, amt, transactionUuid;

        const encodedData = searchParams.get("data");

        if (encodedData) {
          // v2 style: JSON encoded as base64
          const decoded = JSON.parse(atob(encodedData));
          console.log("eSewa v2 decoded response:", decoded);

          status = decoded.status;
          refId = decoded.transaction_code;
          amt = decoded.total_amount;
          transactionUuid = decoded.transaction_uuid;
        } else {
          // fallback: flat query params (older / test environment)
          const allParams = Object.fromEntries(searchParams.entries());
          console.log("eSewa flat params:", allParams);

          status = allParams.status;
          refId = allParams.refId || allParams.oid;
          amt = allParams.amt || allParams.total_amount;
          transactionUuid = allParams.transaction_uuid || allParams.refId || allParams.oid;
        }

        const orderId = sessionStorage.getItem("esewaOrderId");

        console.log("Order ID from session:", orderId);
        console.log("Status:", status, "| Ref:", refId, "| Amount:", amt, "| UUID:", transactionUuid);

        if (!orderId) {
          throw new Error("Order ID not found in session. Please contact support.");
        }

        if (status !== "COMPLETE") {
          Swal.fire({
            icon: "error",
            title: "Payment Failed!",
            text: `eSewa payment was not completed. Status: ${status || "unknown"}`,
          }).then(() => {
            sessionStorage.removeItem("esewaOrderId");
            navigate("/shop/checkout");
          });
          return;
        }

        // ── call backend to verify + confirm the order ────────────────────
        const parsedAmount = parseFloat(String(amt || "0").replace(/,/g, ""));

        const response = await axios.post(
          "http://localhost:5000/api/shop/order/esewa/capture",
          {
            orderId,
            transactionCode: refId,
            status,
            totalAmount: parsedAmount,
            transactionUuid,
          },
          { withCredentials: true }
        );

        if (response.data.success) {
          sessionStorage.removeItem("esewaOrderId");

          Swal.fire({
            icon: "success",
            title: "Payment Successful!",
            text: "Your order has been confirmed. Thank you!",
            timer: 3000,
            showConfirmButton: false,
          }).then(() => navigate("/shop/account?tab=orders"));
        } else {
          throw new Error(response.data.message || "Payment verification failed");
        }
      } catch (error) {
        console.error("eSewa return error:", error);

        Swal.fire({
          icon: "error",
          title: "Payment Error!",
          text:
            error.response?.data?.message ||
            error.message ||
            "Something went wrong. Please contact support.",
        }).then(() => {
          sessionStorage.removeItem("esewaOrderId");
          navigate("/shop");
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processEsewaPayment();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-sm w-full">
        {isProcessing ? (
          <>
            {/* eSewa green spinner */}
            <div className="flex justify-center mb-5">
              <div className="h-14 w-14 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Verifying Payment
            </h1>
            <p className="text-gray-500 text-sm">
              Please wait while we confirm your eSewa payment…
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <svg
                className="h-14 w-14 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Done!</h1>
            <p className="text-gray-500 text-sm">Redirecting to your orders…</p>
          </>
        )}
      </div>
    </div>
  );
}

export default EsewaReturnPage;
