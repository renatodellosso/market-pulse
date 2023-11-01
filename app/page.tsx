"use client"

import SignIn from '@/components/signin'
import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'

export default function Home() {
  const { data: session, status } = useSession()

  if(status !== 'authenticated')
    return (
        <div className='h-screen flex items-center justify-center flex-col'>
            <div className=' text-lg pb-6'>Market Pulse</div>
            <SignIn />
        </div>
    );

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