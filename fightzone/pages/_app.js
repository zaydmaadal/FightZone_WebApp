"use client";
// pages/_app.js
import "@/styles/globals.css";
import { AuthProvider } from "./services/auth";
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
