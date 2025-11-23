import React, { createContext, useContext, useEffect, useState } from "react";

export type Location = {
  name: string;
  lat: number;
  lng: number;
};

type LocationContextType = {
  location: Location;
  setLocationName: (name: string) => void;
  setLocationByCoords: (lat: number, lng: number) => void;
};

const DEFAULT_LOCATION: Location = {
  name: "Delhi, India",
  lat: 28.7040592,
  lng: 77.1024902,
};

// A few preset cities with lat/lng for Swiggy API
const CITY_PRESETS: Location[] = [
  { name: "Delhi, India", lat: 28.7040592, lng: 77.1024902 },
  { name: "Mumbai, Maharashtra", lat: 19.076, lng: 72.8777 },
  { name: "Pune, Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad, Telangana", lat: 17.385, lng: 78.4867 },
  { name: "Kolkata, West Bengal", lat: 22.5726, lng: 88.3639 },
];

const STORAGE_KEY = "swiggy_location_v1";

function matchLocationName(name: string, prev?: Location): Location {
  const trimmed = name.trim();
  if (!trimmed) return prev || DEFAULT_LOCATION;

  // Exact match
  const exact = CITY_PRESETS.find(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) return exact;

  // Partial match (contains)
  const partial = CITY_PRESETS.find((c) =>
    c.name.toLowerCase().includes(trimmed.toLowerCase())
  );
  if (partial) return { ...partial, name: trimmed };

  // Unknown city => keep same lat/lng, just change label
  if (prev) return { ...prev, name: trimmed };

  return { ...DEFAULT_LOCATION, name: trimmed };
}

// Very simple distance (degrees-based) for nearest-city mapping
function findNearestCity(lat: number, lng: number): Location {
  let best = CITY_PRESETS[0];
  let bestDist = Number.MAX_VALUE;

  CITY_PRESETS.forEach((c) => {
    const dLat = c.lat - lat;
    const dLng = c.lng - lng;
    const dist = dLat * dLat + dLng * dLng; // squared distance
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  });

  // Keep the real coords but use nearest city name
  return {
    name: best.name,
    lat,
    lng,
  };
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Location;
        if (parsed && parsed.lat && parsed.lng && parsed.name) {
          setLocation(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = (loc: Location) => {
    setLocation(loc);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch {
      // ignore
    }
  };

  const setLocationName = (name: string) => {
    persist(matchLocationName(name, location));
  };

  const setLocationByCoords = (lat: number, lng: number) => {
    const nearest = findNearestCity(lat, lng);
    persist(nearest);
  };

  return (
    <LocationContext.Provider
      value={{ location, setLocationName, setLocationByCoords }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = (): LocationContextType => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocationContext must be used within LocationProvider");
  }
  return ctx;
};
