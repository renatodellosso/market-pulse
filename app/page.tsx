import SignIn from "@/components/signin";
import { getUser, getUserByEmail } from "@/lib/db/users";
import { NamedId } from "@/lib/types";
import { getServerSession } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Dashboard from "@/components/dashboard";

export default async function Home() {
  function mainPage() {
    return (
      <div className="h-screen flex items-center justify-center flex-col">
        <div className=" h-1/2 flex flex-col justify-center items-center">
          <div className=" text-xl font-medium pb-6">Market Pulse</div>
          <SignIn />
          <div className="pt-3 text-center text-lg">
            Stay up to date on the pulse of the market with Market Pulse
          </div>
        </div>
        <div className="pt-12">
          <div className="text-xl font-medium">Features:</div>
          <br />
          <div className="collapse collapse-plus">
            <input type="radio" name="feature-list" />
            <div className="collapse-title text-xl font-medium">Watchlists</div>
            <div className="collapse-content">
              Create watchlists and use them across multiple reports.
            </div>
          </div>
          <div className="collapse collapse-plus">
            <input type="radio" name="feature-list" />
            <div className="collapse-title text-xl font-medium">
              Customizable Reports
            </div>
            <div className="collapse-content">
              Create reports that are delivered at custom intervals with just
              the data you want.
            </div>
          </div>
          <div className="collapse collapse-plus">
            <input type="radio" name="feature-list" />
            <div className="collapse-title text-xl font-medium">
              Stocks, ETF, & Mutual Funds
            </div>
            <div className="collapse-content">
              Market Pulse supports stocks, ETFs, and mutual funds, with more to
              come.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);

  if (!session)
    return (
      <div className="h-screen flex items-center justify-center flex-col">
        <div className=" text-lg pb-6">Market Pulse</div>
        <SignIn />
      </div>
    );

  let user = await getUserByEmail(session.user.email!);

  if (!user) return mainPage();

  const stringifyNamedIdArray = (arr: NamedId[] | undefined) => {
    return (
      arr?.map((item) => ({
        _id: item._id.toString(),
        name: item.name,
      })) ?? []
    );
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
