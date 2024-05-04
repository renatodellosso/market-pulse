"use client";

import { ChangeEvent, useState } from "react";
import { Holding } from "../api/analyzer/data/route";

export default function Page() {
    const [data, setData] = useState<
        { [header: string]: string }[] | undefined
    >();
    const [holdings, setHoldings] = useState<
        { [symbol: string]: { value: number; category: string } } | undefined
    >();
    const [analyzing, setAnalyzing] = useState<boolean>(false);
    const [results, setResults] = useState<
        { [symbol: string]: Holding & { value: number } } | undefined
    >();
    const [individualStocks, setIndividualStocks] = useState<{
        [symbol: string]: number;
    }>({});
    const [categories, setCategories] = useState<{
        [category: string]: number;
    }>({});

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
        const categoryColumn = (
            document.getElementById(
                "category-column-select"
            ) as HTMLSelectElement
        ).value;

        if (!symbolColumn || !valueColumn) return;

        try {
            const holdings = data?.reduce((acc, row) => {
                const value = parseFloat(row[valueColumn]);
                if (isNaN(value) || value <= 0) return acc;

                acc[row[symbolColumn]] = {
                    value,
                    category: row[categoryColumn] ?? "",
                };
                return acc;
            }, {} as { [symbol: string]: { value: number; category: string } });

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

        const { status, results } = (await response.json()) as {
            status: number;
            results: { [symbol: string]: Holding & { value: number } };
        };

        // Populate values and categories
        for (const symbol in results) {
            results[symbol].value = holdings[symbol]?.value ?? 0;
            results[symbol].category ??= holdings[symbol]?.category ?? "";
        }

        console.log(results);

        setAnalyzing(false);
        document
            .getElementById("set-up-collapse")
            ?.classList.remove("collapse-open");

        // Sort results by value.
        const sortedSymbols = Object.keys(results).sort(
            (a, b) => results[b].value - results[a].value
        );

        const sortedResults = sortedSymbols.reduce((acc, symbol) => {
            acc[symbol] = results[symbol];
            return acc;
        }, {} as { [symbol: string]: Holding & { value: number } });

        setResults(sortedResults);

        // Get individual stocks from each fund's holdings and items with no holdings
        const individualStocks: { [symbol: string]: number } = {};
        for (const symbol in results) {
            const holding = results[symbol];
            if (holding.holdings.length === 0) {
                if (individualStocks[symbol])
                    individualStocks[symbol] += holding.value;
                else individualStocks[symbol] = holding.value;
            } else {
                holding.holdings.forEach((stock) => {
                    if (individualStocks[stock.symbol])
                        individualStocks[stock.symbol] +=
                            stock.percentage * holding.value;
                    else
                        individualStocks[stock.symbol] =
                            stock.percentage * holding.value;
                });
            }
        }

        // Sort individual stocks by value.
        const sortedIndividualStocksKeys = Object.keys(individualStocks).sort(
            (a, b) => individualStocks[b] - individualStocks[a]
        );
        const sortedIndividualStocks = sortedIndividualStocksKeys.reduce(
            (acc, symbol) => {
                acc[symbol] = individualStocks[symbol];
                return acc;
            },
            {} as { [symbol: string]: number }
        );

        setIndividualStocks(sortedIndividualStocks);

        // Get categories and their values
        const categories: { [category: string]: number } = {};
        for (const symbol in results) {
            const holding = results[symbol];
            if (holding.category) {
                if (categories[holding.category])
                    categories[holding.category] += holding.value;
                else categories[holding.category] = holding.value;
            }
        }

        // Sort categories by value.
        const sortedCategoriesKeys = Object.keys(categories).sort(
            (a, b) => categories[b] - categories[a]
        );

        const sortedCategories = sortedCategoriesKeys.reduce(
            (acc, category) => {
                acc[category] = categories[category];
                return acc;
            },
            {} as { [category: string]: number }
        );

        console.log(sortedCategories);
        setCategories(sortedCategories);
    }

    const headers = data ? Object.keys(data?.[0]) : undefined;
    const totalValue = Object.values(holdings ?? {}).reduce(
        (acc, holding) => acc + (holding?.value ?? 0),
        0
    );

    function formatMoney(value: number) {
        return `$${value.toLocaleString(undefined, {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        })}`;
    }

    function formatPercentage(value: number) {
        value *= 100;
        return `${value.toFixed(2)}%`;
    }

    return (
        <div className="w-screen flex justify-center pt-12 overflow-x-hidden">
            <div className="flex flex-col w-[80%]">
                <div
                    tabIndex={0}
                    className="collapse collapse-plus collapse-open"
                    id="set-up-collapse"
                >
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
                                            {"Don't use commas in numbers."}
                                        </span>
                                    </label>
                                    <label className="form-control">
                                        <div className="label">
                                            <span className="label-text text-secondary">
                                                Select a category column
                                                (optional)
                                            </span>
                                        </div>
                                        <select
                                            onChange={onHeaderSelected}
                                            className="select select-bordered bg-black rounded-lg"
                                            id="category-column-select"
                                            defaultValue="Select a category column"
                                        >
                                            {headers.map((header) => (
                                                <option key={header}>
                                                    {header}
                                                </option>
                                            ))}
                                        </select>
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
                    <div className="collapse-title text-xl">
                        Analysis{results && " - Ready!"}
                        {analyzing && (
                            <progress className="ml-4 progress w-3/4"></progress>
                        )}
                    </div>
                    <div className="collapse-content">
                        {results && (
                            <div>
                                <h3 className="text-white">Holdings</h3>
                                <table className="table">
                                    <thead>
                                        <tr className="text-white">
                                            <th>Symbol</th>
                                            <th>$ Value</th>
                                            <th>% Value</th>
                                            <th>Category</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(results).map(
                                            ([symbol, holding]) => (
                                                <tr
                                                    key={symbol}
                                                    className="hover:bg-slate-900"
                                                >
                                                    <td>{symbol}</td>
                                                    <td>
                                                        {formatMoney(
                                                            holding.value
                                                        )}
                                                    </td>
                                                    <td>
                                                        {formatPercentage(
                                                            holding.value /
                                                                totalValue
                                                        )}
                                                    </td>
                                                    <td>{holding.category}</td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                                {Object.keys(categories).length > 0 && (
                                    <div>
                                        <h3 className="text-white">
                                            Categories
                                        </h3>
                                        <table className="table">
                                            <thead>
                                                <tr className="text-white">
                                                    <th>Category</th>
                                                    <th>$ Value</th>
                                                    <th>% Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(categories).map(
                                                    ([category, value]) => (
                                                        <tr
                                                            key={category}
                                                            className="hover:bg-slate-900"
                                                        >
                                                            <td>{category}</td>
                                                            <td>
                                                                {formatMoney(
                                                                    value
                                                                )}
                                                            </td>
                                                            <td>
                                                                {formatPercentage(
                                                                    value /
                                                                        totalValue
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <h3 className="text-white">
                                    Individual Stocks
                                </h3>
                                <table className="table">
                                    <thead>
                                        <tr className="text-white">
                                            <th>Symbol</th>
                                            <th>$ Value</th>
                                            <th>% Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(individualStocks).map(
                                            ([symbol, value]) => (
                                                <tr
                                                    key={symbol}
                                                    className="hover:bg-slate-900"
                                                >
                                                    <td>{symbol}</td>
                                                    <td>
                                                        {formatMoney(value)}
                                                    </td>
                                                    <td>
                                                        {formatPercentage(
                                                            value / totalValue
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
