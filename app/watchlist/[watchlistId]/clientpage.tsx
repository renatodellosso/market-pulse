"use client";

import { Watchlist } from "@/lib/types";
import { ObjectId } from "mongodb";
import router, { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import toast from "react-hot-toast";

export default function ClientPage(props: {
  watchlist: Watchlist;
  edit: boolean;
}) {
  const { watchlist } = props;

  const [symbols, setSymbols] = React.useState(watchlist.symbols);

  async function onNameChanged(e: any) {
    const name = e.target.value;
    console.log(name);

    // Only save name if the user stops typing for 1 second
    setTimeout(async () => {
      if (e.target.value !== name) return;

      console.log(`Saving name: ${name}...`);
      const promise = fetch(
        `/api/watchlist/updatename?name=${name}&id=${watchlist._id}`
      );
      toast.promise(promise, {
        loading: "Saving name...",
        success: "Saved name!",
        error: "Failed to save name.",
      });
    }, 1000);
  }

  function getSymbols() {
    // Select the div with the id "symbols", then select all input fields within it
    const symbols = document.querySelectorAll("#symbols > div > span > input");

    // Convert the NodeList to an array of strings
    return Array.from(symbols).map(
      (symbol) => (symbol as HTMLInputElement).value
    );
  }

  async function updateWatchlist(e: any, symbols: string[] = getSymbols()) {
    console.log("Updating watchlist...");

    console.log("Symbols:");
    console.log(symbols);
    console.log("E.target.value:", e.target.value);

    if (e.target.value === "") {
      setSymbols(symbols);

      const promise = fetch(
        `/api/watchlist/updatesymbols?id=${
          watchlist._id
        }&symbols=${JSON.stringify(symbols)}`
      );
      toast.promise(promise, {
        loading: "Saving symbols...",
        success: "Saved symbols!",
        error: "Failed to save symbols.",
      });
    } else {
      const symbol = e.target.value;

      // Only save symbols if the user stops typing for 1 second
      setTimeout(async () => {
        if (e.target.value !== symbol) return;
        console.log("Symbol:", symbol);
        symbols = getSymbols();
        console.log("Symbols:", symbols);

        setSymbols(symbols);

        console.log(`Saving symbols: ${symbols}...`);
        const promise = fetch(
          `/api/watchlist/updatesymbols?id=${
            watchlist._id
          }&symbols=${JSON.stringify(symbols)}`
        );
        toast.promise(promise, {
          loading: "Saving symbols...",
          success: "Saved symbols!",
          error: "Failed to save symbols.",
        });
      }, 1000);
    }
  }

  async function addSymbol(e: any) {
    console.log("Adding symbol...");

    const symbols = getSymbols();
    symbols.push("");
    setSymbols(symbols);

    console.log(symbols);

    updateWatchlist(e, symbols);
  }

  async function deleteSymbol(e: any, symbol: string) {
    // We have to get symbols. If we do setSymbols(symbols), then the page will not update
    const symbols = getSymbols();
    symbols.splice(symbols.indexOf(symbol), 1);
    updateWatchlist(e, symbols);
  }

  async function deleteWatchlist(e: any) {
    // Confirm the user wants to delete the watchlist
    if (confirm("Are you sure you want to delete this watchlist?") === false)
      return;
    const promise = fetch(`/api/watchlist/delete?id=${watchlist._id}`);
    toast.promise(promise, {
      loading: "Deleting watchlist...",
      success: "Deleted watchlist!",
      error: "Failed to delete watchlist.",
    });
    await promise;
    window.location.href = "/";
  }

  async function makeCopy() {
    console.log("Making copy...");

    const promise = fetch(`/api/watchlist/copy?id=${watchlist._id}`);
    toast.promise(promise, {
      loading: "Making copy...",
      success: "Made copy!",
      error: "Failed to make copy.",
    });

    const json = await promise.then((res) => res.json());

    window.location.href = "/watchlist/" + json.id;
  }

  // Make sure to update getSymbols if we edit the HTML!
  function symbolListElement() {
    return (
      <div id="symbols">
        {symbols.map((symbol, index) => (
          <div id={symbol} key={index}>
            {props.edit ? (
              <span className="flex flex-row items-center justify-center mb-1">
                <input
                  type="text"
                  placeholder="symbol"
                  defaultValue={symbol}
                  onChange={updateWatchlist}
                  className="input input-bordered w-full text-primary mr-1 uppercase"
                />
                <button
                  className="btn btn-error"
                  onClick={(e) => deleteSymbol(e, symbol)}
                >
                  Remove
                </button>
              </span>
            ) : (
              <p>{symbol}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  useEffect(() => {
    router.events.on("routeChangeStart", () =>
      updateWatchlist(null, getSymbols())
    );
  });

  if (props.edit)
    return (
      <div
        id="main"
        className="flex-1 flex items-center justify-center flex-col space-y-2"
      >
        <input
          type="text"
          placeholder="Unnamed Watchlist"
          defaultValue={watchlist.name}
          onChange={onNameChanged}
          className="input input-bordered w-full text-primary"
        />
        <button className="btn btn-error" onClick={deleteWatchlist}>
          Delete Watchlist
        </button>
        <button className="btn btn-primary" onClick={makeCopy}>
          Make Copy
        </button>
        <span className="text-primary">Symbols:</span>
        {symbolListElement()}
        <button className="btn btn-primary" onClick={addSymbol}>
          Add Symbol
        </button>
      </div>
    );

  return (
    <div
      id="main"
      className="flex-1 flex items-center justify-center flex-col space-y-2"
    >
      <h1 className="text-2xl text-primary">{watchlist.name}</h1>
      <button className="btn btn-primary" onClick={makeCopy}>
        Make Copy
      </button>
      <span className="text-primary">Symbols:</span>
      {symbolListElement()}
    </div>
  );
}
