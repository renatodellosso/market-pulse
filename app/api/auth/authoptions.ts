import { initUser } from "@/lib/db/users";
import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { AuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

const authOptions: AuthOptions = {
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

      return true;
    },
  },
};

export { authOptions as default };
