"use client";

import { NamedId, Report, ReportData, ReportFrequency } from "@/lib/types";
import React from "react";
import toast from "react-hot-toast";

export default function ClientPage(props: {
  report: Report;
  watchlists: NamedId[];
}) {
  const { report, watchlists } = props;

  const [watchlistName, setWatchlistName] = React.useState<string>(
    report.watchlist?.name ?? "No watchlist selected"
  );
  const [frequency, setFrequency] = React.useState<string>(report.frequency);
  const [data, setData] = React.useState<string[]>(report.data);

  async function onNameChanged(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value;

    setTimeout(async () => {
      if (newName !== e.target.value) return;

      console.log("Saving name:", newName);
      const promise = fetch(
        `/api/report/updatename?id=${report._id}&name=${newName}`
      );
      toast.promise(promise, {
        loading: "Saving name...",
        success: "Saved name!",
        error: "Failed to save name.",
      });
    }, 1000);
  }

  async function deleteReport(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    // Confirm the user wants to delete the watchlist
    if (confirm("Are you sure you want to delete this report?") === false)
      return;

    const promise = fetch(`/api/report/delete?id=${report._id}`);
    toast.promise(promise, {
      loading: "Deleting report...",
      success: "Deleted report!",
      error: "Failed to delete report.",
    });

    await promise;
    window.location.href = "/";
  }

  async function setWatchlist(watchlist: NamedId) {
    console.log("Setting watchlist ID:", watchlist._id);

    setWatchlistName(watchlist.name);
    const promise = fetch(
      `/api/report/setwatchlist?id=${report._id}&watchlist=${watchlist._id}`
    );
    toast.promise(promise, {
      loading: "Setting watchlist...",
      success: "Set watchlist!",
      error: "Failed to set watchlist.",
    });
  }

  async function updateFrequency(frequency: string) {
    console.log("Setting frequency:", frequency);

    setFrequency(frequency);
    const promise = fetch(
      `/api/report/setfrequency?id=${report._id}&frequency=${frequency}`
    );
    toast.promise(promise, {
      loading: "Setting frequency...",
      success: "Set frequency!",
      error: "Failed to set frequency.",
    });
  }

  async function updateData(data: string[]) {
    console.log("Setting data:", data);

    const promise = fetch(
      `/api/report/setdata?id=${report._id}&data=${data.join(",")}`
    );
    toast.promise(promise, {
      loading: "Setting data...",
      success: "Set data!",
      error: "Failed to set data.",
    });
  }

  async function selectData(datapoint: string) {
    console.log("Selecting data:", datapoint);

    const newData = [...data, datapoint];
    setData(newData);

    updateData(newData);
  }

  async function unselectData(datapoint: string) {
    console.log("Unselecting data:", datapoint);

    const data = report.data.filter((d) => d !== datapoint);
    setData(data);

    updateData(data);
  }

  function watchlistDropdown() {
    return (
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn">
          {report.watchlist !== null
            ? `Watchlist: ${watchlistName}`
            : "Select a watchlist"}
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          {watchlists.map((watchlist) => (
            <div
              role="button"
              className="btn"
              key={watchlist._id.toString()}
              onClick={() => setWatchlist(watchlist)}
            >
              {watchlist.name}
            </div>
          ))}
        </ul>
      </div>
    );
  }

  function frequencyDropdown() {
    return (
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn"
        >{`Frequency: ${frequency}`}</div>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          {ReportFrequency.frequencies.map((frequency) => (
            <div
              role="button"
              className="btn"
              key={frequency}
              onClick={() => updateFrequency(frequency)}
            >
              {frequency}
            </div>
          ))}
        </ul>
      </div>
    );
  }

  function dataSelector() {
    const unselectedData = ReportData.data.filter((d) => !data.includes(d));

    return (
      <div className="flex flex-1 items-center justify-center flex-row pt-2">
        <div className="h-full text-center">
          Selected
          <div className="flex flex-col space-y-1 ">
            {data.map((d) => (
              <button className="btn" key={d} onClick={() => unselectData(d)}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="divider lg:divider-horizontal"></div>
        <div className="h-full text-center">
          Unselected
          <div className="flex flex-col space-y-1">
            {unselectedData.map((d) => (
              <button className="btn" key={d} onClick={() => selectData(d)}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="main"
      className="flex-1 flex items-center justify-center flex-col space-y-2"
    >
      <input
        type="text"
        placeholder="Unnamed Watchlist"
        defaultValue={report.name}
        onChange={onNameChanged}
        className="input input-bordered w-full text-primary"
      />
      <button className="btn btn-error" onClick={deleteReport}>
        Delete
      </button>
      {watchlistDropdown()}
      {frequencyDropdown()}
      {dataSelector()}
    </div>
  );
}
