import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Thai Akha Kitchen - Admin Dashboard"
        description="Manage Booking with Thai Akha Kitchen..." />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
