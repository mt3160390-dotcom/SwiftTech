import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  console.log(orderDetails, "orderDetailsorderDetails");

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

    return (
        <DialogContent className="sm:max-w-[600px]  max-h-[150vh] overflow-y-auto ">
            <div className="grid gap-4"> {/* Reduced gap */}
                <div className="grid gap-1"> {/* Reduced gap */}
                    <div className="flex mt-2 items-center justify-between"> {/* Reduced mt */}
                        <p className="font-medium text-sm">Order ID</p>{/* Reduced text size */}
                        <Label className="text-sm">{orderDetails?._id}</Label>{/* Reduced text size */}
                    </div>
                    <div className="flex mt-1 items-center justify-between"> {/* Reduced mt */}
                        <p className="font-medium text-sm">Order Date</p>{/* Reduced text size */}
                        <Label className="text-sm">{orderDetails?.orderDate.split("T")[0]}</Label>{/* Reduced text size */}
                    </div>
                    <div className="flex mt-1 items-center justify-between"> {/* Reduced mt */}
                        <p className="font-medium text-sm">Order Price</p>{/* Reduced text size */}
                        <Label className="text-sm">Rs {orderDetails?.totalAmount}</Label>{/* Reduced text size */}
                    </div>
                    <div className="flex mt-1 items-center justify-between"> {/* Reduced mt */}
                        <p className="font-medium text-sm">Payment method</p>{/* Reduced text size */}
                        <Label className="text-sm">{orderDetails?.paymentMethod}</Label>{/* Reduced text size */}
                    </div>
                    <div className="flex mt-1 items-center justify-between"> {/* Reduced mt */}
                        <p className="font-medium text-sm">Payment Status</p>{/* Reduced text size */}
                        <Label className="text-sm">{orderDetails?.paymentStatus}</Label>{/* Reduced text size */}
                    </div>
                    <div className="flex mt-1 items-center justify-between"> {/* Reduced mt */}
                        <p className="font-medium text-sm">Order Status</p>{/* Reduced text size */}
                        <Label className="text-sm"> {/* Reduced text size */}
                            <Badge
                                className={`py-0.5 px-2 text-xs ${ /* Reduced padding, reduced text size */
                                    orderDetails?.orderStatus === "confirmed"
                                        ? "bg-green-500"
                                        : orderDetails?.orderStatus === "rejected"
                                            ? "bg-red-600"
                                            : "bg-black"
                                    }`}
                            >
                                {orderDetails?.orderStatus}
                            </Badge>
                        </Label>
                    </div>
                </div>
                <Separator />
                <div className="grid gap-2">  {/* Reduced gap */}
                    <div className="font-medium text-sm">Order Details</div>{/* Reduced text size */}
                    <ul className="grid gap-1 text-sm"> {/* Reduced gap and text size */}
                        {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                            ? orderDetails?.cartItems.map((item, index) => (
                                <li key={index} className="flex items-center justify-between">
                                    <span>Title: {item.title}</span>
                                    <span>Quantity: {item.quantity}</span>
                                    <span>Price: Rs {item.price}</span>
                                </li>
                            ))
                            : null}
                    </ul>
                </div>
                <div className="grid gap-2"> {/* Reduced gap */}
                    <div className="font-medium text-sm">Shipping Info</div> {/* Reduced text size */}
                    <div className="grid gap-0.5 text-muted-foreground text-sm"> {/* Reduced gap, text size */}
                        <span>{user.userName}</span>
                        <span>{orderDetails?.addressInfo?.address}</span>
                        <span>{orderDetails?.addressInfo?.city}</span>
                        <span>{orderDetails?.addressInfo?.pincode}</span>
                        <span>{orderDetails?.addressInfo?.phone}</span>
                        <span>{orderDetails?.addressInfo?.notes}</span>
                    </div>
                </div>

                <div>
                    <CommonForm
                        formControls={[
                            {
                                label: "Order Status",
                                name: "status",
                                componentType: "select",
                                options: [
                                    { id: "pending", label: "Pending" },
                                    { id: "inProcess", label: "In Process" },
                                    { id: "inShipping", label: "In Shipping" },
                                    { id: "delivered", label: "Delivered" },
                                    { id: "rejected", label: "Rejected" },
                                ],
                            },
                        ]}
                        formData={formData}
                        setFormData={setFormData}
                        buttonText={"Update Order Status"}
                        onSubmit={handleUpdateStatus}
                    />
                </div>
            </div>
        </DialogContent>
    );
}

export default AdminOrderDetailsView;