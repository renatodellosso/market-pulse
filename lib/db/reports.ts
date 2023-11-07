import { ObjectId, WithId } from "mongodb";
import { getReports } from "./db";
import { Report, ReportFrequency, Watchlist } from '../types';
import { removeReport, removeWatchlist, updateReportName, updateWatchlistName } from "./users";

export async function createNewReport(ownerEmail: string, watchlist: ObjectId): Promise<ObjectId | string | null> {
    const reports = await getReports();

    const inserted = await reports.insertOne({
        _id: new ObjectId(),
        ownerEmail: ownerEmail,
        name: "New Report",
        watchlist: watchlist,
        frequency: ReportFrequency.Daily
    });

    return inserted.insertedId;
}

export async function getReport(id: string): Promise<WithId<Report> | null> {
    const reports = await getReports();

    return reports.findOne({ _id: new ObjectId(id) });
}

export async function updateName(userEmail: string, id: ObjectId, name: string) {
    const reports = await getReports();

    await reports.updateOne({ _id: id }, { $set: { name: name } });
    updateReportName(userEmail, id, name);
}

export async function deleteReport(userEmail: string, id: ObjectId) {
    const reports = await getReports();

    await reports.deleteOne({ _id: id });
    removeReport(userEmail, id);
}