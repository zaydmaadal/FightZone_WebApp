"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "./services/auth";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect based on authentication status
  if (!user) {
    router.push("/login");
    return null;
  }

  router.push("/dashboard");
  return null;
}
