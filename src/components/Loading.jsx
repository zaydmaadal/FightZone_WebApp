import { useTheme } from "next-themes";

const Loading = () => {
  const { theme } = useTheme();
  const primaryColor = theme === "dark" ? "#3b82f6" : "#2563eb";

  return (
    <div className="loading-container">
      <div className="logo-container">
        <div
          className="logo-placeholder"
          style={{ backgroundColor: primaryColor }}
        />
      </div>
      <div className="loading-bar-container">
        <div
          className="loading-bar"
          style={{ backgroundColor: primaryColor }}
        />
      </div>
      <p>Bezig met laden...</p>

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: ${theme === "dark" ? "#1a202c" : "#f5f5f5"};
          transition: background-color 0.3s;
        }

        .logo-container {
          width: 100px;
          height: 100px;
          margin-bottom: 2rem;
          position: relative;
        }

        .logo-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          opacity: 0.2;
          animation: pulse 2s infinite;
        }

        .loading-bar-container {
          width: 300px;
          height: 8px;
          background-color: ${theme === "dark" ? "#2d3748" : "#e2e8f0"};
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .loading-bar {
          height: 100%;
          width: 30%;
          border-radius: 4px;
          animation: loading 1.5s infinite;
        }

        p {
          color: ${theme === "dark" ? "#cbd5e0" : "#4b5563"};
          font-size: 1rem;
          margin: 0;
        }

        @keyframes pulse {
          0% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 0.2;
          }
        }

        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
