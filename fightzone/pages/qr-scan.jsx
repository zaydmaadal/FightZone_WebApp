"use client";
import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/router";

export default function QRScanPage() {
  const router = useRouter();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        if (decodedText.startsWith("vechter_")) {
          const id = decodedText.replace("vechter_", "");
          router.push(`/ledenlijst/${id}`);
        } else {
          alert(`Ongeldige QR-code: ${decodedText}`);
        }
      },
      (error) => {
        console.warn("Scan mislukt", error);
      }
    );
  }, []);

  return (
    <div className="qr-container">
      <div className="qr-header">
        <h1>📷 QR Scanner</h1>
        <p>Scan de QR-code van een vechter of trainer om hun gegevens te openen.</p>
      </div>
      <div id="qr-reader" className="qr-reader"></div>

      <style jsx>{`
        .qr-container {
          max-width: 600px;
          margin: 60px auto;
          padding: 30px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          font-family: "Inter", sans-serif;
          text-align: center;
        }

        .qr-header h1 {
          font-size: 2rem;
          color: #3683fe;
          margin-bottom: 10px;
        }

        .qr-header p {
          color: #555;
          font-size: 15px;
          margin-bottom: 30px;
        }

        .qr-reader {
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
