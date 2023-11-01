import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth/next";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ]
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };