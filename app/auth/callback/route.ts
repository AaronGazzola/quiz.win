import getSupabaseRouteHandlerClient from "@/clients/route-handler-client";
import configuration from "@/lib/configuration";
import { getAuthErrorMessage } from "@/lib/util/errorUtil";
import { Notifications } from "@/types/notification.types";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const authCode = requestUrl.searchParams.get("code");

  if (authCode) {
    const client = getSupabaseRouteHandlerClient();

    try {
      const { error: sessionError, data: sessionData } =
        await client.auth.exchangeCodeForSession(authCode);

      if (sessionError) {
        await client.auth.signOut();
        return onError({
          error: sessionError?.message,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : error;

      return onError({
        error: message as string,
      });
    }
  }

  // TODO: set path from auth callback
  const queryParam = `?success=${encodeURIComponent(
    Notifications.SignInSuccess
  )}`;
  redirect(`${configuration.paths.appHome}${queryParam}`);
}

function onError({ error }: { error: string }) {
  const errorMessage = getAuthErrorMessage(error);

  console.error(`An error occurred while signing user in`);

  const queryParam = `?error=${encodeURIComponent(errorMessage)}`;
  redirect(`${configuration.paths.appHome}${queryParam}`);
}
