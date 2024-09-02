import * as dotenv from "dotenv";

export function loadEnv() {
  console.log("Loading environment variables from ./../.env.backend");

  dotenv.config({
    path: [".env", "../.env"]
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
