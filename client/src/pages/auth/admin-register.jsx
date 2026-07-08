import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { adminRegisterFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  userName: "",
  email: "",
  password: "",
  adminSecret: "",
};

function AdminRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    dispatch(registerUser({ ...formData, role: "admin" })).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        navigate("/admin/auth/login");
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create Admin Account
        </h1>
        <p className="mt-2">
          Already have an account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/admin/auth/login"
          >
            Login
          </Link>
        </p>
        <p className="mt-4 text-sm text-gray-600">
          Are you a customer?
          <Link
            className="font-medium ml-2 text-blue-600 hover:underline"
            to="/auth/register"
          >
            Register here
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={adminRegisterFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AdminRegister;
