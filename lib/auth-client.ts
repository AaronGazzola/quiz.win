import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { conditionalLog, LOG_LABELS } from "./log.util";
import { configuration } from "@/configuration";


export const authClient = createAuthClient({
  baseURL: configuration.baseURL,
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

const originalSignOut = authClient.signOut;
authClient.signOut = async (options) => {
  try {
    conditionalLog({ location: "authClient.signOut", status: "start", baseURL: configuration.baseURL }, { label: LOG_LABELS.AUTH });
    const result = await originalSignOut(options);
    conditionalLog({ location: "authClient.signOut", status: "success", result }, { label: LOG_LABELS.AUTH });
    return result;
  } catch (error) {
    conditionalLog({ location: "authClient.signOut", status: "error", error }, { label: LOG_LABELS.AUTH });
    throw error;
  }
};

export const {
  signIn,
  useSession,
  getSession,
  signUp,
  organization,
  admin
} = authClient;

export const signOut = authClient.signOut;
