import SignIn from "@/components/signin";
import { getUserByEmail } from "@/lib/db/users";
import { getServerSession } from "next-auth";
import authOptions from "../app/api/auth/authoptions";
import Dashboard from "@/components/dashboard";
import { stringifyUser } from "@/lib/utils";

export default async function Home() {
  function mainPage() {
    return (
      <div className="h-screen flex items-center justify-center flex-col">
        <div className="h-1/2 flex flex-col justify-center items-center">
          <div className="text-xl font-medium pb-6">Market Pulse</div>
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
  if (!session) return mainPage();

  let user = await getUserByEmail(session.user.email!);
  if (!user) return mainPage();

  user = stringifyUser(user);

  return <Dashboard user={user!} />;
}
