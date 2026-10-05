"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { Merchant } from "@/types";
import { getCategoryColor } from "@/lib/utils";

interface TransactionMapProps {
  originMerchant: Merchant;
  candidates: Merchant[];
  radiusKm: number;
}

export default function TransactionMap({ originMerchant, candidates, radiusKm }: TransactionMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fix default icon paths in leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  if (!mounted) return <div className="w-full h-[300px] bg-slate-800 animate-pulse rounded-lg flex items-center justify-center text-slate-500">Loading Map...</div>;

  const createCustomIcon = (color: string, isOrigin: boolean = false) => {
    const svgIcon = `
      <svg viewBox="0 0 24 24" fill="${color}" stroke="${isOrigin ? 'white' : 'rgba(255,255,255,0.8)'}" stroke-width="${isOrigin ? 3 : 2}" class="w-${isOrigin ? 10 : 8} h-${isOrigin ? 10 : 8} drop-shadow-md">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="white"></circle>
      </svg>
    `;
    return L.divIcon({
      className: "custom-leaflet-icon bg-transparent border-none",
      html: svgIcon,
      iconSize: isOrigin ? [40, 40] : [32, 32],
      iconAnchor: isOrigin ? [20, 40] : [16, 32],
      popupAnchor: [0, -32],
    });
  };

  const center: [number, number] = [originMerchant.latitude, originMerchant.longitude];

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-slate-700/50 shadow-lg relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="map-tiles"
        />
        
        {/* Radius Circle */}
        <Circle 
          center={center} 
          radius={radiusKm * 1000} 
          pathOptions={{ color: '#6366F1', fillColor: '#6366F1', fillOpacity: 0.1, weight: 2, dashArray: '5, 10' }} 
        />

        {/* Origin Marker */}
        <Marker 
          position={center}
          icon={createCustomIcon('#EF4444', true)}
        >
          <Popup className="merchant-popup">
            <div className="text-slate-900 font-bold mb-1">Transaction Location</div>
            <div className="text-sm text-slate-700">{originMerchant.name}</div>
          </Popup>
        </Marker>

        {/* Candidate Markers */}
        {candidates.map(merchant => (
          <Marker 
            key={merchant.id}
            position={[merchant.latitude, merchant.longitude]}
            icon={createCustomIcon(getCategoryColor(merchant.category))}
          >
            <Popup className="merchant-popup">
              <div className="text-slate-900">
                <h3 className="font-bold text-base mb-1">{merchant.name}</h3>
                <div className="text-xs text-slate-600">{merchant.category}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
