import { NextResponse } from "next/server";
import { aqiLabel, coordinatesFromRequest, getCigarettes } from "@/lib/air";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const coordinates = coordinatesFromRequest(request);
  if (!coordinates) return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });

  try {
    const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    url.searchParams.set("latitude", coordinates.latitude);
    url.searchParams.set("longitude", coordinates.longitude);
    url.searchParams.set("hourly", "pm2_5,us_aqi");
    url.searchParams.set("forecast_days", "1");
    url.searchParams.set("timezone", "auto");
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error("Air quality request failed");
    const data = await response.json();
    const index = Math.min(new Date().getHours(), (data.hourly?.us_aqi?.length || 1) - 1);
    const aqi = Math.round(data.hourly?.us_aqi?.[index] ?? 0);
    const pm25 = Number((data.hourly?.pm2_5?.[index] ?? 0).toFixed(1));
    return NextResponse.json({ aqi, pm25, ...aqiLabel(aqi), cigarettes: getCigarettes(aqi), updatedAt: data.hourly?.time?.[index] });
  } catch {
    return NextResponse.json({ error: "Air quality data is unavailable right now." }, { status: 502 });
  }
}
