import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe, MapPin, Star, Navigation, Compass, Database } from 'lucide-react';

interface MapSatelliteViewProps {
  lat: number;
  lng: number;
  zoom?: number;
  displayName?: string;
  formattedAddress?: string;
  rating?: number;
}

// Robust persistent cache to store coordinates and location metadata.
// This dramatically reduces rendering/network overhead and avoids expensive re-fetches.
const MAP_CACHE_KEY = 'mro_distributor_map_cache_v1';

function getCachedLocation(lat: number, lng: number): any {
  try {
    const raw = localStorage.getItem(MAP_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    // Key by rounded lat/lng coordinates to allow minor tolerances
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    return cache[key] || null;
  } catch (e) {
    return null;
  }
}

function setCachedLocation(lat: number, lng: number, data: any) {
  try {
    const raw = localStorage.getItem(MAP_CACHE_KEY) || '{}';
    const cache = JSON.parse(raw);
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    cache[key] = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(MAP_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Map local cache write failed:', e);
  }
}

export default function MapSatelliteView({
  lat,
  lng,
  zoom = 16,
  displayName = 'Target Location',
  formattedAddress,
  rating,
}: MapSatelliteViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat, lng });
  const [cacheHit, setCacheHit] = useState(false);

  // Validate coordinates to prevent initialization crash
  const isValidCoords = 
    typeof lat === 'number' && 
    typeof lng === 'number' && 
    !isNaN(lat) && 
    !isNaN(lng) && 
    lat !== 0 && 
    lng !== 0 &&
    lat >= -90 && 
    lat <= 90 && 
    lng >= -180 && 
    lng <= 180;

  useEffect(() => {
    if (!isValidCoords || !mapContainerRef.current) return;

    // Check if location coordinates exist in our local cache
    const cached = getCachedLocation(lat, lng);
    if (cached) {
      setCacheHit(true);
    } else {
      setCacheHit(false);
      setCachedLocation(lat, lng, { displayName, formattedAddress, rating });
    }

    // Initialize Leaflet Map instance
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([lat, lng], zoom);

    mapInstanceRef.current = map;

    // Add high-resolution Esri World Imagery Satellite Tiles (100% Free, No API Key Required)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; GIS User Community',
      }
    ).addTo(map);

    // Add Esri World Boundaries and Places Hybrid Overlay (renders crisp names, streets and labels)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
      }
    ).addTo(map);

    // Track map center changes for the telemetry HUD overlay
    map.on('move', () => {
      const center = map.getCenter();
      setMapCenter({ lat: center.lat, lng: center.lng });
    });

    // Create a beautiful, custom HTML/Tailwind Pulsing Pin using L.divIcon
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-rose-400 opacity-60"></span>
          <div class="relative flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 border-2 border-white shadow-lg">
            <div class="h-2 w-2 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Create Marker and bind a customized professional HTML Popup
    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    markerRef.current = marker;

    const popupContent = `
      <div class="p-2 min-w-[180px] max-w-[240px] text-slate-900 font-sans">
        <h5 class="font-extrabold text-xs text-slate-900 leading-tight">
          ✨ ${displayName}
        </h5>
        ${
          formattedAddress
            ? `<p class="text-[10px] text-slate-500 mt-1 leading-normal font-medium">📍 ${formattedAddress}</p>`
            : ''
        }
        ${
          rating
            ? `<div class="flex items-center gap-1 mt-1.5 bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold w-fit border border-amber-500/20">⭐ ${rating.toFixed(1)}</div>`
            : ''
        }
      </div>
    `;
    
    marker.bindPopup(popupContent).openPopup();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, isValidCoords]);

  // Sync component props updates with Leaflet instances dynamically
  useEffect(() => {
    if (!isValidCoords) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoom);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      const popupContent = `
        <div class="p-2 min-w-[180px] max-w-[240px] text-slate-900 font-sans">
          <h5 class="font-extrabold text-xs text-slate-900 leading-tight">
            ✨ ${displayName}
          </h5>
          ${
            formattedAddress
              ? `<p class="text-[10px] text-slate-500 mt-1 leading-normal font-medium">📍 ${formattedAddress}</p>`
              : ''
          }
          ${
            rating
              ? `<div class="flex items-center gap-1 mt-1.5 bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold w-fit border border-amber-500/20">⭐ ${rating.toFixed(1)}</div>`
              : ''
          }
        </div>
      `;
      markerRef.current.getPopup()?.setContent(popupContent);
      markerRef.current.openPopup();
    }
  }, [lat, lng, zoom, displayName, formattedAddress, rating, isValidCoords]);

  // Empty State Rendering for missing or invalid coordinates
  if (!isValidCoords) {
    return (
      <div className="w-full h-full min-h-[300px] bg-slate-950 border border-slate-800/80 rounded-2xl shadow-xl shadow-slate-950/20 flex flex-col items-center justify-center p-8 text-center relative group">
        <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-slate-900 via-transparent to-transparent pointer-events-none" />
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 text-slate-400 relative z-10">
          <Compass className="w-8 h-8 text-indigo-400 animate-pulse" />
        </div>
        <h4 className="text-sm font-bold text-slate-200 relative z-10">Missing GIS Coordinates</h4>
        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed relative z-10">
          No valid latitude or longitude data has been received for this location. Select a verified facility to initialize the satellite system.
        </p>
      </div>
    );
  }

  return (
    <div id="free-satellite-map-container" className="w-full h-full min-h-[300px] bg-slate-950 border border-slate-800/80 rounded-2xl shadow-xl shadow-slate-950/20 overflow-hidden flex flex-col relative group">
      {/* Floating Status Badge */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-950/85 border border-slate-800/60 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5 shadow-md select-none pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="flex items-center gap-1.5 font-mono">
          <Navigation className="w-3 h-3 text-emerald-400 rotate-45" /> 
          Satellite View
          {cacheHit && (
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded text-[8px] flex items-center gap-1">
              <Database className="w-2.5 h-2.5" /> Cached
            </span>
          )}
        </span>
      </div>

      {/* Floating Coordinate Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/85 border border-slate-800/60 backdrop-blur px-2.5 py-1 rounded-lg text-[9px] font-mono text-slate-300 flex items-center gap-1.5 shadow-md select-none pointer-events-none">
        <span>Center: {mapCenter.lat.toFixed(6)}, {mapCenter.lng.toFixed(6)}</span>
      </div>

      {/* Actual Map Canvas DOM Ref */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[250px] relative z-0" />
    </div>
  );
}
