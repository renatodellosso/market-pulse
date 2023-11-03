'use server'

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUser } from "@/lib/db/users";
import { NamedId } from "@/lib/types";
import { Session, getServerSession } from "next-auth";

export type DashboardProps = {
    watchlists: NamedId[],
    reports: NamedId[]
}

export default async function Dashboard(props: DashboardProps) {
    console.log(props);

    return (
        <div className='w-fit flex-1 flex items-center justify-center flex-row'>
          <div className='w-[50%] flex flex-col items-center space-y-2'>
            <h1 className='text-xl'>Watchlists</h1>
            <ul className='menu bg-neutral w-56 rounded-box'>
            </ul>
            <button className='btn btn-primary'>New Watchlist</button>
          </div>
          <div className='divider lg:divider-horizontal'></div>
          <div className='w-[50%] flex flex-col items-center space-y-2'>
            <h1 className='text-xl'>Reports</h1>
            <ul className='menu bg-neutral w-56 rounded-box'>
            </ul>
            <button className='btn btn-primary'>New Report</button>
          </div>
        </div>
      );
}

export async function getDashboardProps(): Promise<{props: DashboardProps} | null> {
    const session = (await getServerSession(authOptions)) as Session | null;

    if(!session) return null;

    console.log(session);
    const user = await getUser(session.user.id);
    if(!user) return null;

    const watchlists = user.watchlists;
    const reports = user.reports;

    return {
        props: {
            watchlists,
            reports
        }
    }
}