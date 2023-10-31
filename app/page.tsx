import { signIn } from 'next-auth/react'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="">
      <div className='h-screen flex items-center justify-center flex-col'>
          <div className=' text-lg pb-6'>Market Pulse</div>
          <button className='btn btn-primary' onClick={()=>signIn()}>Sign In</button>
      </div>
    </main>
  )
}