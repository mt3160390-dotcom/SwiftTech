import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function EsewaReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processEsewaPayment = async () => {
      try {
        console.log("=== Processing eSewa Return ===");
        
        // Get all parameters from eSewa
        const allParams = Object.fromEntries(searchParams.entries());
        console.log("All return parameters:", allParams);

        const { status, refId, oid, amt, transaction_uuid } = allParams;

        // Get orderId from sessionStorage
        const orderId = sessionStorage.getItem("esewaOrderId");
        
        console.log("Order ID from session:", orderId);
        console.log("eSewa Status:", status);
        console.log("Transaction Reference:", refId || oid);
        console.log("Amount:", amt);

        if (!orderId) {
          throw new Error("Order ID not found. Please try again.");
        }

        // Check if payment was successful
        if (status !== "COMPLETE") {
          console.log("Payment not completed. Status:", status);
          Swal.fire({
            icon: "error",
            title: "Payment Failed!",
            text: `Payment was not completed. Status: ${status}`,
          }).then(() => {
            sessionStorage.removeItem("esewaOrderId");
            navigate("/shop");
          });
          return;
        }

        // Verify payment with backend
        console.log("Verifying payment with backend...");
        const response = await axios.post(
          "http://localhost:5000/api/shop/order/esewa/capture",
          {
            orderId: orderId,
            transactionCode: refId || oid,
            status: status,
            totalAmount: parseFloat(amt),
            transactionUuid: transaction_uuid || refId,
          },
          { withCredentials: true }
        );

        console.log("Backend verification response:", response.data);

        if (response.data.success) {
          sessionStorage.removeItem("esewaOrderId");

          Swal.fire({
            icon: "success",
            title: "Payment Successful!",
            text: "Your order has been confirmed.",
            timer: 3000,
            showConfirmButton: false,
          }).then(() => navigate("/shop/account?tab=orders"));
        } else {
          throw new Error(response.data.message || "Payment verification failed");
        }
      } catch (error) {
        console.error("eSewa payment processing error:", error);

        Swal.fire({
          icon: "error",
          title: "Payment Processing Error!",
          text: error.message || "Something went wrong. Please contact support.",
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Processing Payment
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your eSewa payment...
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Processing Complete
            </h1>
            <p className="text-gray-600">
              Redirecting you to your account...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default EsewaReturnPage;
