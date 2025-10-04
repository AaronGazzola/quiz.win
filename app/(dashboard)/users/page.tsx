import { verifySession } from "@/lib/session.utils";
import { UsersPageContent } from "./page.content";

export default async function UsersPage() {
  await verifySession();

  return <UsersPageContent />;
}
