"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

export const generateDevMagicLink = async (
  email: string,
  callbackUrl?: string
): Promise<ActionResponse<string>> => {
  console.log(JSON.stringify({generateDevMagicLink:"start",email:email?.substring(0,3)+"***",callbackUrl:callbackUrl?.substring(0,50)+"..."}));

  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify({generateDevMagicLink:"production_block"}));
    return getActionResponse({
      error: new Error("Development magic links are not available in production"),
    });
  }

  try {
    console.log(JSON.stringify({generateDevMagicLink:"finding_user",email:email?.substring(0,3)+"***"}));

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(JSON.stringify({generateDevMagicLink:"user_not_found",email:email?.substring(0,3)+"***"}));
      return getActionResponse({
        error: new Error("User not found"),
      });
    }

    console.log(JSON.stringify({generateDevMagicLink:"user_found",userId:user.id}));

    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    console.log(JSON.stringify({generateDevMagicLink:"creating_magic_link",tokenLength:token.length,expiresIn:"5min"}));

    await prisma.magicLink.create({
      data: {
        identifier: email,
        token,
        expiresAt,
      },
    });

    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    const finalCallbackUrl = callbackUrl || "/";
    const magicLinkUrl = `${baseUrl}/api/auth/sign-in/magic-link?token=${token}&callbackURL=${encodeURIComponent(finalCallbackUrl)}`;

    console.log(JSON.stringify({generateDevMagicLink:"complete",urlLength:magicLinkUrl.length,callbackUrl:finalCallbackUrl}));

    return getActionResponse({ data: magicLinkUrl });
  } catch (error) {
    console.log(JSON.stringify({generateDevMagicLink:"error",error:error instanceof Error?{name:error.name,message:error.message}:error}));
    return getActionResponse({ error });
  }
};