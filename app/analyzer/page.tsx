"use client";

import { ChangeEvent, useState } from "react";

export default function Page() {
    const [headers, setHeaders] = useState<string[] | undefined>();

    async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) return;

        const text = await file.text();

        // Parse file as csv
        const rows = text.split("\n");
        const headers = rows[0].split(",");

        setHeaders(headers);
    }

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
                                <div className="flex flex-row">
                                    <ul>
                                        <li key="header" className="underline">
                                            Headers
                                        </li>
                                        {headers.map((header, index) => (
                                            <li key={index} className="h-6">
                                                {header}
                                            </li>
                                        ))}
                                    </ul>
                                    <ul>
                                        <li key="header" className="underline">
                                            Data
                                        </li>
                                        {headers.map((header, index) => (
                                            <li key={index}>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox h-6"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
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
