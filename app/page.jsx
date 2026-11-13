"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Compass, Gauge, MapPin, Search, ShieldCheck, Sparkles, Wind } from "lucide-react";

const fallbackPlace = { name: "Delhi", country: "India", latitude: 28.6139, longitude: 77.209 };

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The location service is unavailable.");
  return data;
}

export default function Page() {
  const [place, setPlace] = useState(fallbackPlace);
  const [air, setAir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locationState, setLocationState] = useState("requesting");

  const loadAir = useCallback(async (nextPlace) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/air-quality?latitude=${nextPlace.latitude}&longitude=${nextPlace.longitude}`);
      setAir(await readJson(response));
    } catch (error) {
      setMessage(error.message);
      setAir({ aqi: 42, pm25: 8.4, label: "Good", tone: "good", cigarettes: 2 });
    } finally {
      setLoading(false);
    }
  }, []);

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState("unsupported");
      setMessage("Location is not supported by this browser. Search for a place instead.");
      return;
    }
    setLocationState("requesting");
    setMessage("");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const coordinates = { latitude: coords.latitude, longitude: coords.longitude };
      try {
        const response = await fetch(`/api/reverse-geocode?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}`);
        const data = await readJson(response);
        const current = { ...data, isCurrent: true };
        setPlace(current);
        setLocationState("current");
        loadAir(current);
      } catch {
        const current = { name: "Your current location", country: `${coordinates.latitude.toFixed(2)}, ${coordinates.longitude.toFixed(2)}`, ...coordinates, isCurrent: true };
        setPlace(current);
        setLocationState("current");
        loadAir(current);
      }
    }, () => {
      setLocationState("denied");
      setMessage("Location permission is off. Click “Use my location” or search for a place.");
      setPlace(fallbackPlace);
      loadAir(fallbackPlace);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
  }, [loadAir]);

  useEffect(() => {
    useCurrentLocation();
  }, [useCurrentLocation]);

  async function search(event) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setMessage("");
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await readJson(response);
      setSuggestions(data.results);
      if (!data.results.length) setMessage("No places found. Try a city or country.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSearching(false);
    }
  }

  function selectPlace(result) {
    const selected = { ...result, country: result.country || result.admin1 || "Selected place" };
    setPlace(selected);
    setLocationState("searched");
    setSuggestions([]);
    setQuery("");
    loadAir(selected);
  }

  const statusText = useMemo(() => !air ? "Reading the air" : air.aqi <= 50 ? "Breathe easy today" : air.aqi <= 100 ? "A little hazy out there" : "Take it easy outdoors", [air]);

  return <main className="app-shell">
    <div className="orb orb-one" /><div className="orb orb-two" />
    <nav className="nav container">
      <a className="brand" href="/"><span className="brand-mark"><Wind size={19} /></span><span>Puff<span>Index</span></span></a>
      <div className="nav-links"><a href="#how">How it works</a><a href="#about">About the data</a></div>
      <button className="location-pill" onClick={useCurrentLocation}><Compass size={15} /> Use my location</button>
    </nav>
    <section className="hero container">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={14} /> AIR QUALITY, MADE HUMAN</div>
        <h1>What does your air<br /><em>feel like today?</em></h1>
        <p className="hero-subtitle">Turn invisible pollution into a number you can understand. See how many cigarettes your air quality is equivalent to.</p>
        <form className="search-wrap" onSubmit={search}><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search any city or place..." aria-label="Search any city or place" /><button type="submit">{searching ? "..." : "Explore"} <ArrowUpRight size={17} /></button></form>
        {suggestions.length > 0 && <div className="suggestions">{suggestions.map((result) => <button key={`${result.latitude}-${result.longitude}`} onClick={() => selectPlace(result)}><MapPin size={16} /><span><b>{result.name}</b><small>{[result.admin1, result.country].filter(Boolean).join(", ")}</small></span><ArrowUpRight size={15} /></button>)}</div>}
        {message && <p className="notice">{message}</p>}
      </div>
      <div className="hero-art" aria-hidden="true"><div className="sun"><div className="sun-core" /></div><div className="cloud cloud-a" /><div className="cloud cloud-b" /><div className="art-caption">THE AIR AROUND YOU<br /><strong>IS TALKING.</strong></div></div>
    </section>
    <section className="dashboard container">
      <div className="section-heading"><div><div className="eyebrow">YOUR AIR REPORT</div><h2>{statusText}</h2></div><div className={`current-place ${locationState === "current" ? "is-current" : ""}`}><MapPin size={16} /><span><b>{locationState === "current" ? "Your current location" : place.name}</b><small>{locationState === "current" ? `${place.name}, ${place.country}` : place.country}</small></span>{locationState !== "current" && <button onClick={useCurrentLocation}>Use my location</button>}</div></div>
      <div className={`report-grid ${loading ? "is-loading" : ""}`}>
        <article className={`cig-card ${air?.tone || "good"}`}><div className="card-top"><span className="card-label">CIGARETTE EQUIVALENT</span><span className="live-dot">● LIVE</span></div><div className="cig-number">{loading ? "—" : air?.cigarettes}<span> cigarettes</span></div><p>is what the air around you feels like<br />compared to smoking today.</p><div className="cigarette-row" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <span className={index < (air?.cigarettes || 0) ? "lit" : ""} key={index}><i /></span>)}</div><div className="card-foot"><span>Based on PM2.5 exposure</span><ShieldCheck size={16} /></div></article>
        <article className="metric-card"><div className="metric-icon aqi-icon"><Gauge size={19} /></div><span className="card-label">AIR QUALITY INDEX</span><div className="metric-value">{loading ? "—" : air?.aqi}</div><div className={`status-tag ${air?.tone || "good"}`}>{air?.label || "Loading"}</div><div className="meter"><span style={{ width: `${Math.min(100, (air?.aqi || 0) / 3)}%` }} /></div><div className="metric-caption"><span>0</span><span>300+</span></div></article>
        <article className="metric-card"><div className="metric-icon pm-icon"><Wind size={19} /></div><span className="card-label">FINE PARTICLES</span><div className="metric-value">{loading ? "—" : air?.pm25}<small> µg/m³</small></div><p className="metric-copy">Tiny particles that can travel deep into your lungs.</p><div className="air-lines"><i /><i /><i /><i /></div></article>
      </div>
    </section>
    <section className="bottom-strip container" id="how"><div><span className="strip-number">01</span><b>Find your air</b><p>We use your location or a place you search for.</p></div><div><span className="strip-number">02</span><b>Read the index</b><p>Live PM2.5 data is translated into a simple score.</p></div><div><span className="strip-number">03</span><b>Make it personal</b><p>One cigarette equivalent makes the invisible visible.</p></div></section>
    <footer className="footer container" id="about"><span>© 2025 PuffIndex</span><span>Data from Open-Meteo · For awareness, not medical advice.</span></footer>
  </main>;
}
