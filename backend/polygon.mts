function apiReq(path: string) {
  return fetch(
    `https://api.polygon.io/v2/${path}?apiKey=${process.env.POLYGON_API_KEY}`
  );
}

export async function dailyChange(symbol: string): Promise<number> {
  let date = new Date() as Date;
  date.setDate(date.getDate() - 2);

  let dateString = date.toISOString();
  dateString = dateString.split("T")[0];

  let response = await fetch(
    `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${dateString}/${dateString}?apiKey=${process.env.POLYGON_API_KEY}`
  );

  if (response.status != 200)
    throw new Error(
      `Polygon API error: ${response.status}: ${response.statusText}`
    );

  let data = await response.json();
  const o = data.results[0].c;

  response = await apiReq(`aggs/ticker/${symbol}/prev`);
  data = await response.json();
  const { c } = data.results[0];

  return 1 - o / c;
}

export async function weeklyChange(symbol: string): Promise<number> {
  let date = new Date() as Date;
  date.setDate(date.getDate() - 1);

  let dateString = date.toISOString();
  dateString = dateString.split("T")[0];

  let response = await fetch(
    `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/week/${dateString}/${dateString}?apiKey=${process.env.POLYGON_API_KEY}`
  );

  if (response.status != 200)
    throw new Error(
      `Polygon API error: ${response.status}: ${response.statusText}`
    );

  let data = await response.json();
  const { o, c } = data.results[0];

  return 1 - o / c;
}
