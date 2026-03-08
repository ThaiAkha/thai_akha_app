import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      <PageMeta
        title="Thai Akha Kitchen - Admin Dashboard"
        description="Manage Booking with Thai Akha Kitchen..."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
