import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  const { t } = useTranslation("auth");
  return (
    <>
      <PageMeta
        title={t("signUp.pageTitle")}
        description={t("signUp.pageDesc")} />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
