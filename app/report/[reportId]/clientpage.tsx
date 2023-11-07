"use client"

import { Report } from "@/lib/types";
import { ObjectId } from "mongodb";
import { useState } from "react";

export default function ClientPage(props: { report: Report }) {
    const { report } = props;

    //We need to update watchlist to use state

    async function onNameChanged(e: React.ChangeEvent<HTMLInputElement>) {
        const newName = e.target.value;

        setTimeout(async () => {
            if(newName !== e.target.value) return;

            console.log("Saving name:", newName);
            await fetch(`/api/report/updatename?id=${report._id}&name=${newName}`);
            console.log("Saved name:", newName);
        }, 1000);
    }

    async function deleteReport(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        
    }

    return <div id="main" className='flex-1 flex items-center justify-center flex-col space-y-2'>
            <input type="text" placeholder="Unnamed Watchlist" defaultValue={report.name} onChange={onNameChanged} 
                className="input input-bordered w-full text-primary" />
            <button className="btn btn-error">Delete</button>
        </div>
}