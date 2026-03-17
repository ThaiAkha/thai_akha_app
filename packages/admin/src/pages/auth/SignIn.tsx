import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("auth");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      <PageMeta
        title={t("signIn.pageTitle")}
        description={t("signIn.pageDesc")}
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
