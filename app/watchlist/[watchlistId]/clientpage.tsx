"use client"

import { Watchlist } from "@/lib/types";
import { ObjectId } from "mongodb";

async function onNameChanged(e: any, id: ObjectId | string) {
    const name = e.target.value;
    console.log(name);

    // Only save name if the user stops typing for 1 second
    setTimeout(async () => {
        if(e.target.value !== name) return;

        console.log(`Saving name: ${name}...`);
        await fetch(`/api/watchlist/updatename?name=${name}&id=${id}`);
        console.log(`Saved name: ${name}`);
    }, 1000);
}

function getSymbols() {
    // Select the div with the id "symbols", then select all input fields within it
    const symbols = document.querySelectorAll("#symbols > div > input");
    
    // Convert the NodeList to an array of strings
    return Array.from(symbols).map((symbol) => (symbol as HTMLInputElement).value);
}

async function updateWatchlist(e: any, id: string, symbols: string[] | null = null) {
    console.log("Updating watchlist...");

    // Only read symbols if they weren't passed in
    if(!symbols)
        symbols = getSymbols();

    console.log(symbols);

    if(e.target.value === "") {
        await fetch(`/api/watchlist/updatesymbols?id=${id}&symbols=${JSON.stringify(symbols)}`);
        window.location.reload();
    }
    else {
        const symbol = e.target.value;

        // Only save symbols if the user stops typing for 1 second
        setTimeout(async () => {
            if(e.target.value !== symbol) return;

            console.log(`Saving symbols: ${symbols}...`);
            await fetch(`/api/watchlist/updatesymbols?id=${id}&symbols=${JSON.stringify(symbols)}`);
            console.log(`Saved symbols: ${symbols}`);
            window.location.reload();
        }, 1000);
    
    }
}

async function addSymbol(e: any, id: string) {
    console.log("Adding symbol...");

    const symbols = getSymbols();
    symbols.push("");

    console.log(symbols);

    updateWatchlist(e, id, symbols);
}

async function deleteWatchlist(e: any, id: string) {
    // x && y() means only do y if x is true

    // Confirm the user wants to delete the watchlist
    if(confirm("Are you sure you want to delete this watchlist?") === false) return;
    await fetch(`/api/watchlist/delete?id=${id}`);
    window.location.href = "/";
}

export default function ClientPage(props: { watchlist: Watchlist }) {
    const { watchlist } = props;

    return <div id="main" className='flex-1 flex items-center justify-center flex-col space-y-2'>
            <input type="text" placeholder="Unnamed Watchlist" defaultValue={watchlist.name} onChange={(e)=>onNameChanged(e, watchlist._id)} 
                className="input input-bordered w-full text-primary" />
            <button className="btn btn-error" onClick={(e)=>deleteWatchlist(e, watchlist._id.toString())}>Delete Watchlist</button>
            <span className="text-primary">Symbols:</span>
            <div id="symbols">
                {
                    watchlist?.symbols.map((symbol, index) => 
                        <div id={symbol} key={index} className='flex flex-row items-center justify-center mb-1'>
                            <input type="text" placeholder="symbol" defaultValue={symbol} 
                                onChange={(e)=>updateWatchlist(e, watchlist._id.toString())} 
                                className="input input-bordered w-full text-primary mr-1 uppercase" />
                            <button className="btn btn-error" onClick={(e)=>updateWatchlist(e, watchlist._id.toString(), watchlist.symbols.filter((s) => s !== symbol))}>Remove</button>
                        </div>)
                }
            </div>
            <button className="btn btn-primary" onClick={(e)=>addSymbol(e, watchlist._id.toString())}>Add Symbol</button>
        </div>
}