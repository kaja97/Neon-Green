"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LocateFixed, Loader2 } from "lucide-react";

// Fix Leaflet's default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  value: { lat: number; lng: number };
  onChange: (lat: number, lng: number) => void;
  /**
   * If true (default), automatically request browser GPS permission on mount
   * and center the map on the user's current position if granted.
   */
  autoLocate?: boolean;
}

const DEFAULT_CENTER: [number, number] = [7.8731, 80.7718]; // Sri Lanka center

/**
 * Inner component that re-centers the map when the `center` prop changes
 * (e.g. when GPS resolves or the user types new lat/lng).
 */
function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, Math.max(map.getZoom(), 13), { duration: 0.8 });
  }, [center[0], center[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/**
 * Inner component handling click-to-drop-marker behaviour.
 */
function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange, autoLocate = true }: LocationPickerProps) {
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "denied" | "unavailable">("idle");

  const requestGps = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("unavailable");
      return;
    }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setGpsStatus("idle");
      },
      (err) => {
        setGpsStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Auto-prompt GPS once on mount
  useEffect(() => {
    if (autoLocate) requestGps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const center: [number, number] = [
    Number.isFinite(value.lat) ? value.lat : DEFAULT_CENTER[0],
    Number.isFinite(value.lng) ? value.lng : DEFAULT_CENTER[1],
  ];

  const inputClass =
    "w-full bg-surface-tertiary border border-border rounded-xl py-2.5 px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm";

  return (
    <div className="space-y-3">
      {/* GPS button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={requestGps}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all disabled:opacity-50"
        >
          {gpsStatus === "loading" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LocateFixed className="w-3.5 h-3.5" />
          )}
          {gpsStatus === "loading"
            ? "Locating..."
            : gpsStatus === "denied"
              ? "Permission denied — retry"
              : gpsStatus === "unavailable"
                ? "GPS unavailable — retry"
                : "Use my current location"}
        </button>
        <span className="text-[11px] text-text-muted">
          Click the map or use GPS to drop a pin.
        </span>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-border">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "260px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          <Recenter center={center} />
          <Marker position={center} />
        </MapContainer>
      </div>

      {/* Editable lat/lng fallback */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={value.lat}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0, value.lng)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={value.lng}
            onChange={(e) => onChange(value.lat, parseFloat(e.target.value) || 0)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
