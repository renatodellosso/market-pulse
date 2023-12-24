"use server";

import { getUser } from "@/lib/db/users";
import { stringifyUser } from "../../../lib/utils";
import ClientPage from "./clientpage";

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

  user = stringifyUser(user);

  return <ClientPage user={user} />;
}
