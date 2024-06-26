export enum AuthFormType {
  SignIn = "sign-in",
  SignUp = "sign-up",
  ForgotPassword = "forgot-password",
  ResetPassword = "reset-password",
}

export interface AuthFormValues {
  email: string;
  password: string;
}
