"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Rectangle, Tooltip } from "react-leaflet";
import L from "leaflet";
import { Merchant } from "@/types";
import { MUMBAI_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/constants";
import { getCategoryColor } from "@/lib/utils";

interface MapViewProps {
  merchants: Merchant[];
}

export default function MapView({ merchants }: MapViewProps) {
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

  if (!mounted) return <div className="w-full h-full min-h-[400px] bg-slate-800 animate-pulse rounded-lg flex items-center justify-center text-slate-500">Loading Map...</div>;

  const createCustomIcon = (color: string) => {
    const svgIcon = `
      <svg viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" class="w-8 h-8 drop-shadow-md">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="white"></circle>
      </svg>
    `;
    return L.divIcon({
      className: "custom-leaflet-icon bg-transparent border-none",
      html: svgIcon,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-slate-700/50 shadow-lg relative z-0">
      <MapContainer 
        center={MUMBAI_CENTER} 
        zoom={MAP_DEFAULT_ZOOM} 
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="map-tiles"
        />
        


        {merchants.map(merchant => (
          <Marker 
            key={merchant.id}
            position={[merchant.latitude, merchant.longitude]}
            icon={createCustomIcon(getCategoryColor(merchant.category))}
          >
            <Popup className="merchant-popup">
              <div className="text-slate-900 min-w-[200px]">
                <h3 className="font-bold text-base mb-1">{merchant.name}</h3>
                <div className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2" style={{ backgroundColor: `${getCategoryColor(merchant.category)}33`, color: getCategoryColor(merchant.category) }}>
                  {merchant.category}
                </div>
                <p className="text-sm text-slate-600 mb-2">{merchant.address}</p>
                <div className="flex justify-between items-center text-sm border-t pt-2 border-slate-200">
                  <div>
                    <span className="text-slate-500">Avg Bill</span><br/>
                    <span className="font-semibold text-slate-900">₹{merchant.average_bill}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Cashback</span><br/>
                    <span className="font-semibold text-emerald-600">{merchant.cashback_percentage}%</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
