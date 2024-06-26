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
import useAction from "@/hooks/useAction";
import signInWithEmailAction from "@/actions/signInWithEmailAction";
import signUpWithEmailAction from "@/actions/signUpWithEmailAction";
import forgotPasswordAction from "@/actions/forgotPasswordAction";

const AuthFormComponent = ({
  onFinish,
  headerText,
  showPassword,
  showForgotPasswordButton = true,
  switchFormText,
  onSwitchForm,
}: {
  onFinish: () => void;
  onSwitchForm: (formType: AuthFormType) => void;
  onClickForgotPassword: () => void;
  switchFormText?: string;
  headerText: string;
  showPassword: boolean;
  showForgotPasswordButton: boolean;
  showSwitchFormButton: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      name="normal_login"
      className="w-full max-w-[320px]"
      initialValues={{ remember: true }}
      onFinish={onFinish}
    >
      <Image
        alt="Quick.Win logo"
        height={738}
        width={738}
        src="/images/logo.png"
        className="w-16 h-16"
      />
      <h1 className="capitalize text-xl py-2">{headerText}</h1>
      <Form.Item
        name="username"
        rules={[{ required: true, message: "Please input your Email." }]}
      >
        <Input
          prefix={<UserOutlined className="site-form-item-icon mr-1" />}
          placeholder="Email"
        />
      </Form.Item>
      <CollapseContainer isCollapsed={!showPassword}>
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
            !showForgotPasswordButton && "hidden"
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
        <Button
          loading={loading}
          onClick={onClickSwitchForm}
          className="text-blue-500"
        >
          {switchFormText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AuthFormComponent;
