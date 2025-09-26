import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";

console.log(
  JSON.stringify({
    auth: "client_init",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  })
);

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [magicLinkClient(), adminClient(), organizationClient()],
});

const originalSignIn = authClient.signIn;
authClient.signIn = {
  ...originalSignIn,
  email: async (data) => {
    console.log(
      JSON.stringify({
        auth: "signIn.email",
        step: "start",
        email: data.email?.substring(0, 3) + "***",
      })
    );
    try {
      const result = await originalSignIn.email(data);
      console.log(
        JSON.stringify({
          auth: "signIn.email",
          step: "success",
          ...result,
        })
      );
      return result;
    } catch (error) {
      console.log(
        JSON.stringify({
          auth: "signIn.email",
          step: "error",
          error:
            error instanceof Error
              ? { name: error.name, message: error.message }
              : error,
        })
      );
      throw error;
    }
  },
};

export const {
  signIn,
  signOut,
  useSession,
  getSession,
  signUp,
  organization,
  admin
} = authClient;
