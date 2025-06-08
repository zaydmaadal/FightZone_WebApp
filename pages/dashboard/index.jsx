"use client";

import { useAuth } from "../../src/services/auth";
import { useRouter } from "next/navigation";
import VechterDashboard from "../../components/dashboards/VechterDashboard";
import VKBMODashboard from "../../components/dashboards/VKBMODashboard";
import TrainerDashboard from "../../components/dashboards/TrainerDashboard";
import Loading from "../../components/Loading";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  if (loading) return <Loading />;
  if (!user) return null;
  if (user.role === "Vechter") return <VechterDashboard />;
  if (user.role === "VKBMO-lid") return <VKBMODashboard />;
  if (user.role === "Trainer") return <TrainerDashboard />;
  return null;
}