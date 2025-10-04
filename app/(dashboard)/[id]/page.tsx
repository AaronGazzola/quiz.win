import { verifySession } from "@/lib/session.utils";
import { QuizResultPageContent } from "./page.content";

export default async function QuizResultPage() {
  await verifySession();

  return <QuizResultPageContent />;
}
