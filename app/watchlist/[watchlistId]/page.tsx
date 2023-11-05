"use client"

async function fetchWatchlist(id: string) {
    console.log("Fetching watchlist...");
    
    const res = await fetch(`/api/getwatchlist?` + new URLSearchParams({ id }));
    const data = await res.json();

    console.log("Watchlist fetched!");
}

export default function Page({ params }: { params: { watchlistId: string } }) {
    if(typeof window !== 'undefined') fetchWatchlist(params.watchlistId); // Check if on client

    return <div id="main" className='flex-1 flex items-center justify-center flex-col'>
            <span className="loading loading-ring loading-lg mb-2"></span>
            <p>Loading...</p>
        </div>
}