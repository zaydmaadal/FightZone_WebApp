"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../src/services/auth";
import Loading from "../components/Loading";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <Loading />;
  }

  // Redirect based on authentication status
  if (!user) {
    router.push("/login");
    return null;
  }

  router.push("/dashboard");
  return null;
}
