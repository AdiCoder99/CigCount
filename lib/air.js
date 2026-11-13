export const aqiLabel = (aqi) => {
  if (aqi <= 50) return { label: "Good", tone: "good" };
  if (aqi <= 100) return { label: "Moderate", tone: "moderate" };
  if (aqi <= 150) return { label: "Unhealthy for sensitive groups", tone: "unhealthy" };
  if (aqi <= 200) return { label: "Unhealthy", tone: "unhealthy" };
  if (aqi <= 300) return { label: "Very unhealthy", tone: "very-unhealthy" };
  return { label: "Hazardous", tone: "hazardous" };
};

export const getCigarettes = (aqi) => Math.max(0, Math.round(aqi / 22));

export const coordinatesFromRequest = (request) => {
  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("latitude"));
  const longitude = Number(searchParams.get("longitude"));
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
};
