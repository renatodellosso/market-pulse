"use server";

import { getUser, getUserByEmail } from "@/lib/db/users";
import { stringifyUser } from "../../../lib/utils";
import ClientPage from "./clientpage";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/authoptions";

export default async function Page({ params }: { params: { userId: string } }) {
  const { userId } = params;

  let user;

  try {
    user = await getUser(userId);
  } catch {}

  if (!user)
    return (
      <div className="text-center pt-64">
        <h1 className="text-xl">404</h1>
        <p>User not found</p>
      </div>
    );

  const session = await getServerSession(authOptions);
  if (session)
    session.user =
      (await getUserByEmail(session.user.email ?? "")) ?? session.user;

  

  user = stringifyUser(user);
  if (session?.user) session.user = stringifyUser(session?.user);

  return <ClientPage user={user} self={session?.user} />;
}
