import * as dotenv from "dotenv";
import path from "path";

export function loadEnv() {
  console.log("Loading environment variables...");

  dotenv.config({
    path: path.resolve(__dirname, "../.env"),
    debug: true
  });

  // Check if all environment variables are set
  if (!process.env.MONGODB_URI)
    throw new Error("MONGO_URI environment variable not set");
  if (!process.env.EMAIL_USERNAME)
    throw new Error("EMAIL_USERNAME environment variable not set");
  if (!process.env.EMAIL_PASSWORD)
    throw new Error("EMAIL_PASSWORD environment variable not set");

  console.log("Environment variables loaded.");
}
