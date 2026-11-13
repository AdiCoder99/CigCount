import { NextResponse } from "next/server";

export async function GET(request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ error: "Enter a place to search." }, { status: 400 });

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", query);
    url.searchParams.set("count", "5");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error("Geocoding request failed");
    const data = await response.json();
    return NextResponse.json({
      results: (data.results || []).map((place) => ({
        name: place.name,
        country: place.country,
        admin1: place.admin1,
        latitude: place.latitude,
        longitude: place.longitude
      }))
    });
  } catch {
    return NextResponse.json({ error: "The place search is unavailable right now." }, { status: 502 });
  }
}
