"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

import { AuthFormType } from "@/types/auth.types";
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams";
import CollapseContainer from "@/components/CollapseContainer";
import Image from "next/image";
import { useSearchParamsContext } from "@/providers/SearchParamsProvider";
import signInWithEmailAction from "@/actions/signInWithEmailAction";
import signUpWithEmailAction from "@/actions/signUpWithEmailAction";
import forgotPasswordAction from "@/actions/forgotPasswordAction";
import resetPasswordAction from "@/actions/resetPasswordAction";
import useNotification from "@/hooks/useNotification";
import {
  NotificationPosition,
  NotificationStyle,
  Notifications,
} from "@/types/notification.types";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const { SignIn, SignUp, ForgotPassword, ResetPassword } = AuthFormType;

const AuthFormSchema = z.object({
  email: z.string().email("Please input a valid Email."),
  password: z.string().min(6, "Please input your Password."),
  remember: z.boolean().optional(),
});

export type AuthFormValues = z.infer<typeof AuthFormSchema>;

const AuthForm = ({ formType: formTypeProp }: { formType?: AuthFormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParamsContext();
  const formTypeParam = searchParams.searchParams?.get("form");
  const [formType, setFormType] = useState<AuthFormType>(
    formTypeProp || SignIn
  );

  const { showNotification } = useNotification();

  const isSignUp = formType === SignUp;
  const isSignIn = formType === SignIn;
  const isForgotPassword = formType === ForgotPassword;
  const isResetPassword = formType === ResetPassword;

  const headerText = isSignUp
    ? "Sign up"
    : isForgotPassword
    ? "Forgot password"
    : "Sign in";

  const submitButtonText = isSignUp
    ? "Sign up"
    : isForgotPassword
    ? "Send Link"
    : "Sign in";

  const updateSearchParams = useUpdateSearchParams();
  const onChangeForm = (formType: AuthFormType) => {
    if (formTypeProp) return;
    setFormType(formType);
    updateSearchParams({
      key: "form",
      value: formType,
    });
  };

  const form = useForm<z.infer<typeof AuthFormSchema>>({
    resolver: zodResolver(AuthFormSchema),
  });

  const onSubmit = async (values: z.infer<typeof AuthFormSchema>) => {
    setIsLoading(true);

    let res = null;
    let successMessage = Notifications.Success;
    if (isResetPassword) {
      res = await resetPasswordAction(values);
      successMessage = Notifications.ResetPasswordSuccess;
    }
    if (isSignIn) {
      res = await signInWithEmailAction(values);
      successMessage = Notifications.SignInSuccess;
    }
    if (isSignUp) {
      res = await signUpWithEmailAction(values);
      successMessage = Notifications.SignUpSuccess;
    }
    if (isForgotPassword) {
      res = await forgotPasswordAction(values);
      successMessage = Notifications.ForgotPasswordSuccess;
    }
    setIsLoading(false);
    if (res?.error) {
      console.error(res.error);
      showNotification({
        message: res.error || Notifications.Error,
        style: NotificationStyle.Error,
        position: NotificationPosition.TopRight,
      });
      return;
    }

    showNotification({
      message: successMessage,
      style: NotificationStyle.Success,
      position: NotificationPosition.TopRight,
    });
  };

  useEffect(() => {
    if (formTypeProp || formTypeParam) return;
    setFormType(SignIn);
    updateSearchParams({
      key: "form",
      value: SignIn,
    });
  }, [formTypeParam, updateSearchParams, formTypeProp]);

  return (
    <main className="flex flex-col items-center flex-grow justify-center py-10 sm:py-16 ">
      <Image
        alt="Quick.Win logo"
        height={738}
        width={738}
        src="/images/logo.png"
        className="w-16 h-16"
      />
      <h1 className="capitalize text-xl py-2 my-6">{headerText}</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-[320px] space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <CollapseContainer isCollapsed={isForgotPassword}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapseContainer>
          <FormItem className="space-y-4">
            <div className="flex justify-between items-center ">
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="">
                    <div className="h-full w-full flex items-center">
                      <Checkbox
                        id="remember-me"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      <FormLabel
                        htmlFor="remember-me"
                        className="p-1 px-3 cursor-pointer"
                      >
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <button
                className={cn(
                  `text-blue-500 transition-opacity text-sm font-semibold`,
                  isForgotPassword ? "opacity-0" : ""
                )}
                onClick={() => onChangeForm(ForgotPassword)}
              >
                Forgot password
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full "
            >
              <div
                className={cn(
                  "transition-all duration-1000 origin-center",
                  !isLoading && "opacity-0 scale-0 w-0 -mr-4"
                )}
              >
                <Loader2 className={cn("mr-2 h-4 w-4 animate-spin")} />
              </div>
              {submitButtonText}
            </Button>

            <div className="flex">
              <button
                type="button"
                className="text-sm font-semibold"
                onClick={() => onChangeForm(isSignIn ? SignUp : SignIn)}
              >
                Or{" "}
                <span className="text-blue-500">
                  {isSignIn ? "sign up!" : "sign in?"}
                </span>
              </button>
            </div>
          </FormItem>
        </form>
      </Form>
    </main>
  );
};

export default AuthForm;
