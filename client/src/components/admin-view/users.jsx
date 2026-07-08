import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import {
  getAllUsersForAdmin,
  getOrdersByUserForAdmin,
  resetSelectedUserOrders,
} from "@/store/admin/users-slice";

function UsersOrdersDialog({ open, onOpenChange, user, orders }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user?.userName ? `${user.userName}'s Orders` : "User Orders"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Customer:</span> {user?.userName || "-"}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user?.email || "-"}
          </p>
          <p>
            <span className="font-medium">Total Orders:</span> {orders.length}
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((orderItem) => (
                <TableRow key={orderItem._id}>
                  <TableCell>{orderItem._id}</TableCell>
                  <TableCell>{orderItem?.orderDate?.split("T")[0] || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      className={`py-1 px-3 ${
                        orderItem?.orderStatus === "confirmed"
                          ? "bg-green-500"
                          : orderItem?.orderStatus === "rejected"
                          ? "bg-red-600"
                          : "bg-black"
                      }`}
                    >
                      {orderItem?.orderStatus || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>{orderItem?.paymentStatus || "-"}</TableCell>
                  <TableCell>Rs {orderItem?.totalAmount || 0}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No orders found for this customer.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}

function AdminUsersView() {
  const dispatch = useDispatch();
  const { usersList, selectedUser, selectedUserOrders } = useSelector(
    (state) => state.adminUsers
  );
  const [openOrdersDialog, setOpenOrdersDialog] = useState(false);

  useEffect(() => {
    dispatch(getAllUsersForAdmin());
  }, [dispatch]);

  function handleViewOrders(userId) {
    dispatch(getOrdersByUserForAdmin(userId)).then((data) => {
      if (data?.payload?.success) {
        setOpenOrdersDialog(true);
      }
    });
  }

  function handleDialogChange(open) {
    setOpenOrdersDialog(open);
    if (!open) {
      dispatch(resetSelectedUserOrders());
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersList && usersList.length > 0 ? (
              usersList.map((userItem) => (
                <TableRow key={userItem._id}>
                  <TableCell>{userItem._id}</TableCell>
                  <TableCell>{userItem.userName}</TableCell>
                  <TableCell>{userItem.email}</TableCell>
                  <TableCell>{userItem.totalOrders || 0}</TableCell>
                  <TableCell>Rs {userItem.totalSpent || 0}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleViewOrders(userItem._id)}>
                      View Orders
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <UsersOrdersDialog
        open={openOrdersDialog}
        onOpenChange={handleDialogChange}
        user={selectedUser}
        orders={selectedUserOrders}
      />
    </Card>
  );
}

export default AdminUsersView;
