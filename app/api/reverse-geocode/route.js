import { NextResponse } from "next/server";
import { coordinatesFromRequest } from "@/lib/air";

export async function GET(request) {
  const coordinates = coordinatesFromRequest(request);
  if (!coordinates) return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", coordinates.latitude);
    url.searchParams.set("lon", coordinates.longitude);
    url.searchParams.set("format", "jsonv2");
    const response = await fetch(url, {
      headers: { "User-Agent": "CigCount/1.0 air-quality-awareness-app" },
      next: { revalidate: 86400 }
    });
    if (!response.ok) throw new Error("Reverse geocoding request failed");
    const data = await response.json();
    const address = data.address || {};
    return NextResponse.json({
      name: address.city || address.town || address.village || address.municipality || "Your current location",
      country: address.country || "Current location",
      ...coordinates
    });
  } catch {
    return NextResponse.json({ error: "We found your coordinates, but could not name this location." }, { status: 502 });
  }
}
