async function apiReq(path: string) {
  const res = await fetch(
    `https://api.polygon.io/v2/${path}?apiKey=${process.env.POLYGON_API_KEY}`
  );

  if (res.status != 200) {
    if (res.status == 429) {
      console.log("Polygon API limit reached. Waiting 1 minute...");
      await new Promise((resolve) => setTimeout(resolve, 60000));
    } else {
      throw new Error(`Polygon API error: ${res.status}: ${res.statusText}`);
    }
  }

  return res;
}

export async function dailyChange(symbol: string): Promise<number> {
  let date = new Date() as Date;
  date.setDate(date.getDate() - 2);

  let dateString = date.toISOString();
  dateString = dateString.split("T")[0];

  let response = await apiReq(
    `aggs/ticker/${symbol}/range/1/day/${dateString}/${dateString}`
  );

  let data = await response.json();
  const o = data.results[0].c;

  response = await apiReq(`aggs/ticker/${symbol}/prev`);
  data = await response.json();
  const { c } = data.results[0];

  return 1 - o / c;
}

async function changeOverTime(
  symbol: string,
  timeframe: string
): Promise<number> {
  let date = new Date() as Date;

  // If it's before 6pm, use yesterday's data
  if (date.getHours() < 18) date.setDate(date.getDate() - 1);

  let dateString = date.toISOString();
  dateString = dateString.split("T")[0];

  let response = await fetch(
    `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/${timeframe}/${dateString}/${dateString}?apiKey=${process.env.POLYGON_API_KEY}`
  );

  let data = await response.json();
  const { o, c } = data.results[0];

  console.log(data);

  return 1 - o / c;
}

export async function weeklyChange(symbol: string): Promise<number> {
  return changeOverTime(symbol, "week");
}

export async function monthlyChange(symbol: string): Promise<number> {
  return changeOverTime(symbol, "month");
}
