"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Merchant } from "@/types";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { CATEGORIES } from "@/lib/constants";

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[600px] bg-slate-800 animate-pulse rounded-lg flex items-center justify-center text-slate-500">Loading Map Engine...</div>
});

export default function CustomerMapPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  useEffect(() => {
    api.getMerchants().then(mRes => setMerchants(mRes)).catch(() => []);
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredMerchants = merchants.filter(m => 
    selectedCategories.length === 0 || selectedCategories.includes(m.category)
  );

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Hyperlocal Map</h1>
        <p className="text-slate-400">Discover top-rated merchants around you.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <Card className="lg:w-72 flex-shrink-0 p-5 flex flex-col h-[300px] lg:h-auto overflow-hidden">
          <h3 className="font-bold mb-4 text-slate-200 border-b border-slate-700 pb-2">Filters</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Categories</h4>
            <div className="space-y-2">
              {CATEGORIES.slice(0, 15).map(cat => ( // Just show top 15 for brevity
                <label key={cat.name} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    selectedCategories.includes(cat.name) 
                      ? 'bg-indigo-500 border-indigo-500' 
                      : 'border-slate-500 group-hover:border-slate-400'
                  }`}>
                    {selectedCategories.includes(cat.name) && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-slate-300 group-hover:text-slate-100">{cat.name}</span>
                </label>
              ))}
            </div>
            
            <button 
              onClick={() => setSelectedCategories([])}
              className="text-indigo-400 text-sm mt-4 hover:underline"
              disabled={selectedCategories.length === 0}
            >
              Clear filters
            </button>
          </div>
        </Card>
        
        <div className="flex-1 h-[500px] lg:h-auto relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
          <MapView merchants={filteredMerchants} />
        </div>
      </div>
    </div>
  );
}
