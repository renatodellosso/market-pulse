import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth/next";
import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { AuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import { initUser } from "@/lib/db/users";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
<<<<<<< HEAD
      if (
        user.reports === undefined ||
        user.watchlists === undefined ||
        user.friends === undefined ||
        user.incomingFriendRequests === undefined ||
        user.outgoingFriendRequests === undefined
      ) {
        console.log("Initializing user...");
        initUser(user);
      }
=======
      // if(user.reports === undefined) {
      //     console.log("Initializing user...");
      //     initUser(user);
      // }
>>>>>>> 3ff5ce9924251a2a24fc7dafae90ecf3c3812bbe

      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
