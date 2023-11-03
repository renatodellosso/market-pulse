import Dashboard, { getDashboardProps } from '@/components/dashboard';
import SignIn from '@/components/signin';
import { getUser } from '@/lib/db/users';
import { NamedId } from '@/lib/types';
import { getServerSession } from 'next-auth';
import { getSession, useSession } from 'next-auth/react';
import { authOptions } from './api/auth/[...nextauth]/route';

export default async function Home() {
  const session = await getServerSession(authOptions);

  const dashboardProps = await getDashboardProps();

  if(!session)
    return (
        <div className='h-screen flex items-center justify-center flex-col'>
            <div className=' text-lg pb-6'>Market Pulse</div>
            <SignIn />
        </div>
    );

  return <Dashboard watchlists={dashboardProps?.props.watchlists!} reports={dashboardProps?.props.reports!} />
}