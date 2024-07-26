import AuthForm from "@/app/auth/components/AuthForm";
import { AuthFormType } from "@/types/auth.types";

const page = () => {
  return <AuthForm formType={AuthFormType.ResetPassword} />;
};

export default page;
