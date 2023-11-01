"use client";

import { useSession } from "next-auth/react";
import Avatar from "./avatar";
import SignIn from "./signin";

export default function NavBar() {
    const { data: session, status } = useSession();

    if (status !== "authenticated")
        return <></>
    
    return <div className="w-screen flex flex-row justify-start items-center pl-2 space-x-2 sticky top-0 z-50">
        <Avatar src={session.user?.image ?? "https://cdn.britannica.com/73/103073-050-EB4992D4/Richard-M-Nixon-1969.jpg "} alt="Avatar" />
        <h1 className="text-lg">{session.user?.name?.split(" ")[0]}</h1>
        <SignIn />
    </div>
}