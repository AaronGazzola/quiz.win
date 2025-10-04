import { verifySession } from "@/lib/session.utils";
import { InvitePageContent } from "./page.content";

export default async function InvitePage() {
  await verifySession();

  return <InvitePageContent />;
}
