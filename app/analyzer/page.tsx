"use client";

import { ChangeEvent, useState } from "react";

export default function Page() {
    const [data, setData] = useState<
        { [header: string]: string }[] | undefined
    >();
    const [holdings, setHoldings] = useState<
        { [symbol: string]: number } | undefined
    >();
    const [analyzing, setAnalyzing] = useState<boolean>(false);

    async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) return;

        const text = await file.text();

        // Parse file as csv.
        const rows = text.split("\n");
        const headers = rows[0].split(",");

        const data = rows.slice(1).map((row) => {
            const values = row.split(",");
            return headers.reduce((acc, header, index) => {
                acc[header] = values[index];
                return acc;
            }, {} as { [header: string]: string });
        });

        setData(data);
    }

    async function onHeaderSelected(event: ChangeEvent<HTMLSelectElement>) {
        const symbolColumn = (
            document.getElementById("symbol-column-select") as HTMLSelectElement
        ).value;
        const valueColumn = (
            document.getElementById("value-column-select") as HTMLSelectElement
        ).value;

        if (!symbolColumn || !valueColumn) return;

        try {
            const holdings = data?.reduce((acc, row) => {
                const value = parseFloat(row[valueColumn]);
                if (isNaN(value) || value <= 0) return acc;

                acc[row[symbolColumn]] = value;
                return acc;
            }, {} as { [symbol: string]: number });

            setHoldings(holdings);
        } catch (error) {
            console.error(error);
            alert("Invalid data or columns selected.");
        }
    }

    async function analyze() {
        setAnalyzing(true);
        console.log("Analyzing...");

        if (!holdings) {
            setAnalyzing(false);
            return;
        }

        // Post holding symbols to the server
        // and get back the analysis results.
        const response = await fetch("/api/analyzer/data", {
            method: "POST",
            body: JSON.stringify(Object.keys(holdings)),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        console.log(data);

        setAnalyzing(false);
    }

    const headers = data ? Object.keys(data?.[0]) : undefined;

    return (
        <div className="w-screen flex justify-center pt-12">
            <div className="flex flex-col w-[80%]">
                <div tabIndex={0} className="collapse collapse-plus">
                    <input type="checkbox" />
                    <div className="collapse-title text-xl">Set Up</div>
                    <div className="collapse-content">
                        <input
                            type="file"
                            onChange={onFileChange}
                            className="file-input file-input-secondary bg-black rounded-lg"
                        />
                        {headers && (
                            <div className="mt-6">
                                <div className="flex flex-row space-x-4">
                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text text-accent">
                                                Select a symbol column
                                            </span>
                                        </div>
                                        <select
                                            onChange={onHeaderSelected}
                                            className="select select-bordered bg-black rounded-lg"
                                            id="symbol-column-select"
                                            defaultValue="Select a symbol column"
                                        >
                                            {headers.map((header) => (
                                                <option key={header}>
                                                    {header}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text text-secondary">
                                                Select a value column
                                            </span>
                                        </div>
                                        <select
                                            onChange={onHeaderSelected}
                                            className="select select-bordered bg-black rounded-lg"
                                            id="value-column-select"
                                            defaultValue="Select a value column"
                                        >
                                            {headers.map((header) => (
                                                <option key={header}>
                                                    {header}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="label-text-alt text-secondary">
                                            Don't use commas in numbers.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}
                        {holdings && (
                            <button
                                className={`btn btn-${
                                    analyzing ? "disabled" : "primary"
                                } mt-6`}
                                onClick={analyze}
                            >
                                Analyze
                            </button>
                        )}
                    </div>
                </div>
                <div className="divider"></div>
                <div tabIndex={0} className="collapse collapse-plus">
                    <input type="checkbox" />
                    <div className="collapse-title text-xl">Analysis</div>
                    <div className="collapse-content"></div>
                </div>
            </div>
        </div>
    );
}
