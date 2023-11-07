'use client'

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUser, getUserByEmail } from "@/lib/db/users";
import { NamedId } from "@/lib/types";
import { get } from "http";
import { Session, getServerSession } from "next-auth";
import Link from "next/link";

async function newWatchlist() {
  console.log("Creating new watchlist...");
  const req = await fetch('/api/watchlist/new');

  const res = await req.json();
  window.location.href = `/watchlist/${res.id}`;
}

async function newReport() {
  console.log("Creating new report...");
  const req = await fetch('/api/report/new');

  const res = await req.json();
  window.location.href = `/report/${res.id}`;
}

export default async function Dashboard(props: { watchlists: NamedId[], reports: NamedId[] }) {
  const { watchlists, reports } = props;

  return (
      <div className='w-fit flex-1 flex items-center justify-center flex-row'>

        <div className='w-[50%] flex flex-col items-center space-y-2'>
          <h1 className='text-xl'>Watchlists</h1>
          { watchlists.length > 0 ? (
            <ul className='menu bg-neutral w-56 rounded-box'>
              {
                watchlists.map(w => 
                  <Link key={w._id.toString()} href={`/watchlist/${w._id}`} className="link">
                    <li className='menu-item'>{w.name}</li>
                  </Link>
                )
              }
            </ul>
          ) : <></> }
          <button className='btn btn-primary' onClick={newWatchlist}>New Watchlist</button>
        </div>

        <div className='divider lg:divider-horizontal'></div>

        <div className='w-[50%] flex flex-col items-center space-y-2'>
          <h1 className='text-xl'>Reports</h1>
          { reports.length > 0 ? (
            <ul className='menu bg-neutral w-56 rounded-box'>
              {
                reports.map(r => 
                  <Link key={r._id.toString()} href={`/report/${r._id}`} className="link">
                    <li className='menu-item'>{r.name}</li>
                  </Link>
                )
              
              }
            </ul>
          ) : <></> }
          <button className='btn btn-primary' onClick={newReport}>New Report</button>
        </div>

      </div>
    );
}