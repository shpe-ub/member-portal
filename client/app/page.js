import { redirect } from "next/navigation";

// "/" has no page of its own. The portal layout sends signed-out users to /login.
export default function RootPage() {
  redirect("/home");
}
