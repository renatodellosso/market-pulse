import { User } from "next-auth";
import Link from "next/link";

export default function ClientPage(props: { user: User }) {
  const { user } = props;

  return (
    <div className=" w-96">
      <h1 className="text-2xl pb-4 text-primary">{user.name}</h1>
      <div className="pb-4">
        <h2 className="text-xl text-secondary">Watchlists</h2>
        <ul>
          {user.watchlists.map((watchlist) => (
            <li key={watchlist._id.toString()}>
              <Link className="link" href={`/watchlist/${watchlist._id}`}>
                {watchlist.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="pb-4">
        <h2 className="text-xl text-secondary">Reports</h2>
        <ul>
          {user.reports.map((report) => (
            <li key={report._id.toString()}>
              <Link className="link" href={`/report/${report._id}`}>
                {report.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="pb-4">
        <h2 className="text-xl text-secondary">Friends</h2>
        <ul>
          {user.friends.map((friend) => (
            <li key={friend._id.toString()}>
              <Link className="link" href={`/profile/${friend._id}`}>
                {friend.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
