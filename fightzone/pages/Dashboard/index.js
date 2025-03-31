"use client";
import { useAuth } from "../services/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Layout from "../../components/Layout";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="dashboard">
        <h1>Dashboard</h1>
        <p>Welcome, {user.role}!</p>
        <div className="dashboard-content">
          {/* Add role-specific dashboard content here */}
          {user.role === "Vechter" && (
            <div className="dashboard-section">
              <h2>Mijn Trainingen</h2>
              <p>Hier komen je aankomende trainingen</p>
            </div>
          )}
          {user.role === "Trainer" && (
            <div className="dashboard-section">
              <h2>Leden Overzicht</h2>
              <p>Hier komt een overzicht van je leden</p>
            </div>
          )}
          {user.role === "VKBMO-lid" && (
            <div className="dashboard-section">
              <h2>Club Statistieken</h2>
              <p>Hier komen de statistieken van je clubs</p>
            </div>
          )}
        </div>
        <style jsx>{`
          .dashboard {
            padding: 20px;
          }

          .dashboard-content {
            margin-top: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
          }

          .dashboard-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .dashboard-section h2 {
            margin-top: 0;
            color: #333;
          }
        `}</style>
      </div>
    </Layout>
  );
}
