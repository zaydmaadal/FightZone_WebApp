"use client";
import { useAuth } from "../services/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "../../styles/AgendaPage.css";

export default function Agenda() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="agenda-page">
        <div className="loading">Laden...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="agenda-page">
      <div className="page-header">
        <h1>Agenda</h1>
      </div>

      <div className="agenda-content">
        <div className="agenda-section">
          <h2>Aankomende Evenementen</h2>
          <div className="events-list">
            <p className="placeholder-text">Hier komt je agenda</p>
          </div>
        </div>
      </div>
    </div>
  );
}
