"use client";
import React, { useEffect } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import { useSearchParams } from "next/navigation";
import { AuthFormType } from "@/types/auth.types";
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams";
import cn from "classnames";

const { SignIn, SignUp, ForgotPassword } = AuthFormType;

const AuthForm: React.FC = () => {
  const searchParams = useSearchParams();
  const formTypeParam = searchParams.get("form");
  const formType = (formTypeParam || SignIn) as AuthFormType;

  const isSignUp = formType === SignUp;
  const isSignIn = formType === SignIn;
  const isForgotPassword = formType === ForgotPassword;

  const submitButtonText = isSignUp
    ? "Sign up"
    : isForgotPassword
    ? "Send Link"
    : "Sign in";

  const updateSearchParams = useUpdateSearchParams();
  const onChangeForm = (formType: AuthFormType) =>
    updateSearchParams({
      key: "form",
      value: formType,
    });
  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
  };
  useEffect(() => {
    if (!formTypeParam)
      updateSearchParams({
        key: "form",
        value: SignIn,
      });
  }, [formTypeParam, updateSearchParams]);

  return (
    <Form
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
          type="primary"
          htmlType="submit"
          className="w-full mb-1"
        >
          {submitButtonText}
        </Button>
        Or{" "}
        <button
          onClick={() => onChangeForm(isSignIn ? SignUp : SignIn)}
          className="text-blue-500"
        >
          {isSignIn ? "register now!" : "sign in"}
        </button>
      </Form.Item>
    </Form>
  );
};

export default AuthForm;
