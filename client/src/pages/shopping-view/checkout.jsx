import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  function handleOrderPlacement(paymentMethod) {
    if (!cartItems || cartItems.items.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Your cart is empty!",
        text: "Please add items to proceed.",
      });
      return;
    }

    if (!currentSelectedAddress) {
      Swal.fire({
        icon: "error",
        title: "Address not selected!",
        text: "Please select an address before placing an order.",
      });
      return;
    }

    // Handle eSewa payment separately
    if (paymentMethod === "eSewa") {
      handleEsewaPayment();
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
      },
      orderStatus: "pending",
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        Swal.fire({
          icon: "success",
          title:
            paymentMethod === "COD"
              ? "Order placed successfully!"
              : "Payment successful!",
          text:
            paymentMethod === "COD"
              ? "Your order will be delivered soon. Pay on delivery."
              : "Thank you for your purchase.",
          timer: 3000,
          showConfirmButton: false,
        }).then(() => navigate("/"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Order failed!",
          text: "Something went wrong. Please try again.",
        });
      }
    });
  }

  async function handleEsewaPayment() {
    try {
      setIsProcessing(true);

      const orderData = {
        userId: user?.id,
        cartId: cartItems?._id,
        cartItems: cartItems.items.map((singleCartItem) => ({
          productId: singleCartItem?.productId,
          title: singleCartItem?.title,
          image: singleCartItem?.image,
          price:
            singleCartItem?.salePrice > 0
              ? singleCartItem?.salePrice
              : singleCartItem?.price,
          quantity: singleCartItem?.quantity,
        })),
        addressInfo: {
          addressId: currentSelectedAddress?._id,
          address: currentSelectedAddress?.address,
          city: currentSelectedAddress?.city,
          pincode: currentSelectedAddress?.pincode,
          phone: currentSelectedAddress?.phone,
        },
        totalAmount: totalCartAmount,
      };

      console.log("=== Initiating eSewa Payment ===");
      console.log("Order Data:", orderData);

      const response = await axios.post(
        "http://localhost:5000/api/shop/order/esewa/initiate",
        orderData,
        { withCredentials: true }
      );

      console.log("Backend Response:", response.data);

      if (response.data.success) {
        const redirectUrl = response.data.data.redirectUrl;
        const orderId = response.data.data.orderId;

        console.log("Redirect URL:", redirectUrl);
        console.log("Order ID:", orderId);

        // Store orderId for later verification
        sessionStorage.setItem("esewaOrderId", orderId);

        // Direct redirect to eSewa
        console.log("Redirecting to eSewa...");
        window.location.href = redirectUrl;
      } else {
        throw new Error(response.data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("eSewa payment error:", error);
      setIsProcessing(false);
      
      Swal.fire({
        icon: "error",
        title: "Payment Error!",
        text: error.response?.data?.message || error.message || "Failed to initiate eSewa payment",
      });
    }
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent cartItem={item} key={item.productId} />
              ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">Rs {totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-4 w-full flex flex-col gap-3">
            <Button
              onClick={() => handleOrderPlacement("eSewa")}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? "Processing..." : "Pay with eSewa"}
            </Button>
            <Button
              onClick={() => handleOrderPlacement("COD")}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white"
            >
              Cash on Delivery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
