import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // TODO: Vervang dit door je eigen authenticatie logica
        // Bijvoorbeeld: zoek gebruiker in database
        // Return user object als succesvol, anders null
        if (credentials.email && credentials.password) {
          // Dummy user voor test
          return {
            id: "1",
            name: "Test User",
            email: credentials.email,
            role: "trainer",
            club: "testclub"
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      // Voeg extra info toe aan session
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.club = token.club;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.club = user.club;
      }
      return token;
    }
  }
};

export default NextAuth(authOptions); 