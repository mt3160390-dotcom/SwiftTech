import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  const getStatusDescription = (status) => {
    const descriptions = {
      pending: "Your order has been placed and is awaiting confirmation.",
      confirmed: "Your order has been confirmed and is being processed.",
      rejected: "Your order has been cancelled.",
      "in-process": "Your order is being prepared for shipment.",
      "in-shipping": "Your order is on the way to you.",
      delivered: "Your order has been delivered!",
    };
    return descriptions[status] || "Order status unknown";
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      rejected: "bg-red-600",
      "in-process": "bg-purple-500",
      "in-shipping": "bg-orange-500",
      delivered: "bg-green-500",
    };
    return colors[status] || "bg-black";
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <div className="grid gap-6">
        {/* Order Status Overview */}
        <div className="grid gap-3 p-4 bg-slate-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <p className="font-bold text-lg">Order Status</p>
            <Badge className={`py-1 px-3 text-white ${getStatusColor(orderDetails?.orderStatus)}`}>
              {orderDetails?.orderStatus?.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{getStatusDescription(orderDetails?.orderStatus)}</p>
        </div>

        <div className="grid gap-2">
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label className="text-xs font-mono">{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails?.orderDate.split("T")[0]}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Last Updated</p>
            <Label>{orderDetails?.orderUpdateDate ? orderDetails?.orderUpdateDate.split("T")[0] : "N/A"}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label className="font-bold">Rs {orderDetails?.totalAmount}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Method</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label>
              <Badge className={`py-1 px-3 ${orderDetails?.paymentStatus === "paid" ? "bg-green-500" : "bg-yellow-500"}`}>
                {orderDetails?.paymentStatus}
              </Badge>
            </Label>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Order Items</div>
            <ul className="grid gap-3 p-3 bg-slate-50 rounded-lg">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                ? orderDetails?.cartItems.map((item, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex-1">
                        <span className="font-medium block">{item.title}</span>
                        <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-semibold">Rs {item.price}</span>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Shipping Address</div>
            <div className="grid gap-2 text-sm p-3 bg-slate-50 rounded-lg border">
              <span className="font-medium">{user?.userName}</span>
              <span>{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city} - {orderDetails?.addressInfo?.pincode}</span>
              <span>📞 {orderDetails?.addressInfo?.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
