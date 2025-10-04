import { verifySession } from "@/lib/session.utils";
import { TakeQuizPageContent } from "./page.content";

export default async function TakeQuizPage() {
  await verifySession();

  return <TakeQuizPageContent />;
}
