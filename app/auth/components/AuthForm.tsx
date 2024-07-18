"use client";
import React, { useEffect, useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import { AuthFormType } from "@/types/auth.types";
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams";
import cn from "classnames";
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

// TODO: add other auths

const { SignIn, SignUp, ForgotPassword, ResetPassword } = AuthFormType;

const AuthForm = ({ formType: formTypeProp }: { formType?: AuthFormType }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
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
    ? SignUp
    : isForgotPassword
    ? ForgotPassword
    : SignIn;

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

  const onFinish = async (values: any) => {
    setLoading(true);

    let res = null;
    if (isResetPassword) res = await resetPasswordAction(values);
    if (isSignIn) res = await signInWithEmailAction(values);
    if (isSignUp) res = await signUpWithEmailAction(values);
    if (isForgotPassword) res = await forgotPasswordAction(values);
    setLoading(false);
    if (res?.error) {
      console.error(res.error);
      showNotification({
        message: res.error || Notifications.Error,
        style: NotificationStyle.Error,
        position: NotificationPosition.TopRight,
      });
      return;
    }
    let successMessage = Notifications.Success;
    if (isResetPassword) successMessage = Notifications.ResetPasswordSuccess;
    if (isForgotPassword) successMessage = Notifications.ForgotPasswordSuccess;
    if (isSignIn) successMessage = Notifications.SignInSuccess;
    if (isSignUp) successMessage = Notifications.SignUpSuccess;

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

  useEffect(() => {
    // TODO: only reset empty fields
    form.resetFields();
  }, [formType, form]);

  return (
    <>
      <Image
        alt="Quick.Win logo"
        height={738}
        width={738}
        src="/images/logo.png"
        className="w-16 h-16"
      />
      <h1 className="capitalize text-xl py-2">{headerText}</h1>
      <Form
        form={form}
        name="normal_login"
        className="w-full max-w-[320px]"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your Email." }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon mr-1" />}
            placeholder="Email"
          />
        </Form.Item>
        <CollapseContainer isCollapsed={isForgotPassword}>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password." }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon mr-1" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
        </CollapseContainer>
        <Form.Item>
          <Form.Item
            name="remember"
            valuePropName="checked"
            noStyle
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <button
            className={cn(
              "float-right text-blue-500 transition-opacity",
              isForgotPassword && "opacity-0"
            )}
            onClick={() => onChangeForm(ForgotPassword)}
          >
            Forgot password
          </button>
        </Form.Item>

        <Form.Item>
          <Button
            loading={loading}
            type="primary"
            htmlType="submit"
            className="w-full mb-1"
          >
            {submitButtonText}
          </Button>
          Or{" "}
          <button
            type="button"
            onClick={() => onChangeForm(isSignIn ? SignUp : SignIn)}
            className="text-blue-500 mt-5"
          >
            {isSignIn ? "sign up!" : "sign in?"}
          </button>
        </Form.Item>
      </Form>
    </>
  );
};

export default AuthForm;
