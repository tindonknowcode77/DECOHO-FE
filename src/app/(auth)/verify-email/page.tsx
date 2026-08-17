import { Suspense } from "react";
import VerifyEmailView from "@/src/features/auth/components/VerifyEmailView";

export default function VerifyEmailPage() {
  return <Suspense fallback={null}><VerifyEmailView /></Suspense>;
}
