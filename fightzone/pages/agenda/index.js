"use client";
import { useAuth } from "../services/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Layout from "../../components/Layout";

export default function Agenda() {
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
    <div className="agenda">
      <h1>Agenda</h1>
      <div className="agenda-content">
        <div className="agenda-section">
          <h2>Aankomende Evenementen</h2>
          <p>Hier komt je agenda</p>
        </div>
      </div>
      <style jsx>{`
        .agenda {
          padding: 20px;
        }

        .agenda-content {
          margin-top: 20px;
        }

        .agenda-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .agenda-section h2 {
          margin-top: 0;
          color: #333;
        }
      `}</style>
    </div>
  );
}
