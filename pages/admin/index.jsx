"use client";
import { useAuth } from "../../src/services/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { syncVkbmoEvents } from "../../src/services/api";

export default function Admin() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState(null);

  if (loading) {
    return <div>Laden...</div>;
  }

  if (!user || user.role !== 'vkbmo') {
    router.push('/login');
    return null;
  }

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      const result = await syncVkbmoEvents();
      setSyncResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-section">
        <h2>VKBMO Events Synchronisatie</h2>
        <p>Synchroniseer events van de VKBMO kalender met de FightZone kalender.</p>
        
        <button 
          onClick={handleSync} 
          disabled={syncing}
          className="btn-primary"
        >
          {syncing ? 'Synchroniseren...' : 'Synchroniseer Events'}
        </button>

        {error && (
          <div className="error-message">
            Fout bij synchroniseren: {error}
          </div>
        )}

        {syncResult && (
          <div className="success-message">
            {syncResult.message}
          </div>
        )}
      </div>
    </div>
  );
} 