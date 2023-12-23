import SignIn from "@/components/signin";
import { getUser, getUserByEmail } from "@/lib/db/users";
import { NamedId } from "@/lib/types";
import { getServerSession } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Dashboard from "@/components/dashboard";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session)
    return (
      <div className="h-screen flex items-center justify-center flex-col">
        <div className=" text-lg pb-6">Market Pulse</div>
        <SignIn />
      </div>
    );

  const user = await getUserByEmail(session.user.email!);

  if (!user)
    return (
      <div className="h-screen flex items-center justify-center flex-col">
        <div className=" text-lg pb-6">Market Pulse</div>
        <SignIn />
      </div>
    );

  const stringifyNamedIdArray = (arr: NamedId[]) => {
    return arr.map((item) => ({
      _id: item._id.toString(),
      name: item.name,
    }));
  };

  user.watchlists = stringifyNamedIdArray(user?.watchlists);
  user.reports = stringifyNamedIdArray(user?.reports);
  user.friends = stringifyNamedIdArray(user?.friends);
  user.incomingFriendRequests = stringifyNamedIdArray(
    user.incomingFriendRequests
  );
  user.outgoingFriendRequests = stringifyNamedIdArray(
    user.outgoingFriendRequests
  );

  user._id = user._id.toString();

  return <Dashboard user={user} />;
}
