"use client";
import { useAuth } from "../../src/services/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import Loading from "../../components/Loading";

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profiel</h1>
      </div>

      <div className="profile-content">
        <div className="placeholder-content">
          <div className="placeholder-icon">
            <UserCircleIcon width={64} height={64} />
          </div>
          <h2>Profiel Overzicht</h2>
          <p>Deze pagina is momenteel in ontwikkeling.</p>
          <p className="placeholder-subtext">
            Hier komt binnenkort een gedetailleerd overzicht van je profiel,
            inclusief persoonlijke informatie, statistieken en instellingen.
          </p>
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          color: var(--text-color);
          font-size: 2rem;
          margin: 0;
        }

        .profile-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 3rem;
          text-align: center;
        }

        .placeholder-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .placeholder-icon {
          color: #3483fe;
          margin-bottom: 1rem;
        }

        .placeholder-content h2 {
          color: var(--text-color);
          font-size: 1.5rem;
          margin: 0;
        }

        .placeholder-content p {
          color: var(--text-color);
          margin: 0;
        }

        .placeholder-subtext {
          color: var(--placeholder-color);
          font-size: 0.9rem;
          max-width: 400px;
          line-height: 1.5;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--placeholder-color);
        }

        @media (max-width: 768px) {
          .profile-page {
            padding: 1rem;
          }

          .profile-content {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
