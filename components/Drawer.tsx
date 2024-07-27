"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { AuthFormType } from "@/types/auth.types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import configuration from "@/lib/configuration";
import { comfortaa } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const { SignIn, SignUp, ForgotPassword, ResetPassword } = AuthFormType;

export const SignInSchema = z.object({
  email: z.string().email("Please input a valid Email."),
  password: z.string().min(6, "Please input your Password."),
  remember: z.boolean().optional(),
});

export const SignUpSchema = z.object({
  email: z.string().email("Please input a valid Email."),
  password: z.string().min(6, "Please input your Password."),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please input a valid Email."),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(6, "Please input your Password."),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;
export type SignUpSchemaType = z.infer<typeof SignUpSchema>;
export type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

const getSchema = (formType: AuthFormType) => {
  switch (formType) {
    case SignIn:
      return SignInSchema;
    case SignUp:
      return SignUpSchema;
    case ForgotPassword:
      return ForgotPasswordSchema;
    case ResetPassword:
      return ResetPasswordSchema;
    default:
      return SignInSchema;
  }
};

export function Drawer() {
  const [formType, setFormType] = useState<AuthFormType>(SignIn);
  const form = useForm<
    Partial<
      | SignInSchemaType
      | SignUpSchemaType
      | ForgotPasswordSchemaType
      | ResetPasswordSchemaType
    >
  >({
    resolver: zodResolver(getSchema(formType)),
  });

  const onSubmit = async (values: Partial<SignInSchemaType>) => {
    // setIsLoading(true);
    // let res = null;
    // let successMessage = Notifications.Success;
    // if (isResetPassword) {
    //   res = await resetPasswordAction(values as ResetPasswordSchemaType);
    //   successMessage = Notifications.ResetPasswordSuccess;
    // }
    // if (isSignIn) {
    //   res = await signInWithEmailAction(values as SignInSchemaType);
    //   successMessage = Notifications.SignInSuccess;
    // }
    // if (isSignUp) {
    //   res = await signUpWithEmailAction(values as SignUpSchemaType);
    //   successMessage = Notifications.SignUpSuccess;
    // }
    // if (isForgotPassword) {
    //   res = await forgotPasswordAction(values as ForgotPasswordSchemaType);
    //   successMessage = Notifications.ForgotPasswordSuccess;
    // }
    // setIsLoading(false);
    // if (res?.error) {
    //   console.error(res.error);
    //   showNotification({
    //     message: res.error || Notifications.Error,
    //     style: NotificationStyle.Error,
    //     position: NotificationPosition.TopRight,
    //   });
    //   return;
    // }
    // showNotification({
    //   message: successMessage,
    //   style: NotificationStyle.Success,
    //   position: NotificationPosition.TopRight,
    // });
    // // TODO: show success and email message on sign in
    // if (isSignIn && res?.data) setUser(res.data);
    // if (isSignIn || isResetPassword) router.push(configuration.paths.appHome);
    // if (isSignUp) onChangeForm(SignIn);
    // if (isForgotPassword) onChangeForm(SignIn);
  };

  return (
    <Sheet open={true}>
      <SheetTrigger asChild>
        <Button
          className="fixed top-2 right-2"
          variant="outline"
        >
          Open
        </Button>
      </SheetTrigger>
      <SheetContent className="!w-full !max-w-md gap-6 flex flex-col">
        <SheetHeader>
          <div className="w-full max-w-sm flex justify-between pr-5 items-center">
            <Link
              href={configuration.paths.appHome}
              className="flex items-center gap-4 "
            >
              <Image
                src="/images/logo.png"
                alt="Quiz.Win logo"
                width={738}
                height={738}
                className="w-7"
              />
              <h1
                className={cn(
                  "text-gray-100 text-2xl tracking-wider font-black",
                  comfortaa.className
                )}
              >
                Quiz.Win
              </h1>
            </Link>

            <DropdownMenu modal>
              <DropdownMenuTrigger>
                <Button
                  value="icon"
                  size="sm"
                  variant="outline"
                  className="border-none dark:text-gray-500 dark:hover:text-gray-100 border border-white h-8 mb-0.5"
                >
                  <Settings className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div>test</div>
                {/* <DropdownMenuItem className="cursor-pointer">
                  Profile
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* <SheetTitle className="text-center text-base">Welcome!</SheetTitle> */}
        </SheetHeader>
        <SheetDescription className="font-medium">
          Sign in to start creating and completing gamified quizes!
        </SheetDescription>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full  space-y-6"
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
          </form>
        </Form>
        <div className="flex justify-center w-full items-center gap-5">
          <hr className="w-1/4 border-gray-500" />
          <span className="mx-2 text-gray-500">or</span>
          <hr className="w-1/4 border-gray-500" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
