// pages/_app.js
"use client";
import "@/styles/globals.css";
import "@/styles/AddUserPage.css";
import "@/styles/AgendaPage.css";
import "@/styles/LoginPage.css";
import "@/styles/PrestatiePage.css";
import "@/styles/Ledenlijst.css";
import "@/styles/Wachtwoord.css";

import { AuthProvider } from "../src/services/auth";
import Layout from "../components/Layout";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
