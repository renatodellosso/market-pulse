import SignIn from '@/components/signin';
import { getUser, getUserByEmail } from '@/lib/db/users';
import { NamedId } from '@/lib/types';
import { getServerSession } from 'next-auth';
import { getSession, useSession } from 'next-auth/react';
import { authOptions } from './api/auth/[...nextauth]/route';
import Dashboard from '@/components/dashboard';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if(!session)
    return (
        <div className='h-screen flex items-center justify-center flex-col'>
            <div className=' text-lg pb-6'>Market Pulse</div>
            <SignIn />
        </div>
    );

  const user = await getUserByEmail(session.user.email!);

  if(!user)
    return <div className='h-screen flex items-center justify-center flex-col'>
        <div className=' text-lg pb-6'>Market Pulse</div>
        <SignIn />
    </div>;

  const watchlists = user?.watchlists.map(w => ({ _id: w._id.toString(), name: w.name }));
  const reports = user?.reports.map(r => ({ _id: r._id.toString(), name: r.name }));

  return <Dashboard watchlists={watchlists} reports={reports} />
}