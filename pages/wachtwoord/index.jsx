import React from "react";
import Link from "next/link";

const WachtwoordPage = () => {
  return (
    <div className="container">
      <div className="content">
        <h1>Wachtwoord Wijzigen</h1>
        <div className="message">
          <p>Deze functionaliteit is momenteel in ontwikkeling.</p>
          <p>
            Neem contact op met VKBMO voor hulp bij het wijzigen van je
            wachtwoord.
          </p>
        </div>
        <Link href="https://www.vkbmo.be/algemeen1.html" className="vkbmoLink">
          Contacteer VKBMO
        </Link>
        <Link href="/login" className="backLink">
          Terug naar login
        </Link>
      </div>
    </div>
  );
};

export default WachtwoordPage;
