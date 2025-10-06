import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";


export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL || "http://localhost:3000",
  plugins: [magicLinkClient(), adminClient(), organizationClient()],
});

const originalSignIn = authClient.signIn;
authClient.signIn = {
  ...originalSignIn,
  email: async (data) => {
    try {
      const result = await originalSignIn.email(data);
      return result;
    } catch (error) {
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
