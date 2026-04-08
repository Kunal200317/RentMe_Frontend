"use client";
import { useEffect, useState } from "react";
import API from "@/utils/api";
import { VehiclemainCard } from "@/components/VehiclemainCard";
import { useSearchParams } from "next/navigation";
import { MapPin, Search, Navigation } from "lucide-react";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [findbyKM, setfindbyKM] = useState("1000");
  const [distanceValue, setDistanceValue] = useState("1");
  const [distanceUnit, setDistanceUnit] = useState("km");
  const [showCards, setShowCards] = useState(false);

  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const freshParam = searchParams.get("fresh");
    const firstLoginFlag = localStorage.getItem("firstLogin");
    
    console.log("🔍 Checking first login:", { freshParam, firstLoginFlag });
    
    if (freshParam === "true" || firstLoginFlag === "true") {
      console.log("🔄 First login detected, setting up auto refresh...");
      setIsFirstLogin(true);

      localStorage.removeItem("firstLogin");
      
      if (window.history.replaceState) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [searchParams]);

    // ✅ Auto Refresh Effect
  useEffect(() => {
    if (isFirstLogin) {
      console.log("⏳ Waiting 1 second before refresh...");
      
      const timer = setTimeout(() => {
        console.log("🔄 Refreshing page...");
        window.location.reload();
      }, 300); // 0.3 second delay
      
      return () => clearTimeout(timer);
    }
  }, [isFirstLogin]);


  useEffect(() => {
    // Convert to meters for API — added safety fallback to 0
    const val = parseInt(distanceValue) || 0;
    const meters = distanceUnit === "km" ? val * 1000 : val;
    setfindbyKM(meters.toString());
  }, [distanceValue, distanceUnit]);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        setLoading(true);

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;

            const res = await API.get(
              `/vehicles/nearby?lat=${latitude}&lng=${longitude}&maxDistance=${findbyKM}`
            );

            if (res.data && Array.isArray(res.data.vehicles)) {
              setVehicles(res.data.vehicles);
              setTimeout(() => setShowCards(true), 100);
            } else {
              console.error("Unexpected response format:", res.data);
              setError("Invalid data format received");
              setVehicles([]);
            }

            setLoading(false);
          },
          (err) => {
            console.error("Location error:", err);
            if (err.code === 1) {
              setError("Location access denied. Please enable it in your browser settings to see vehicles near you.");
            } else {
              setError("Unable to get your location. Please check your connection and try again.");
            }
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Something went wrong while fetching vehicles. Please refresh the page.");
        setLoading(false);
      }
    }

    fetchVehicles();
  }, [findbyKM]);

  // Loading UI
  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading nearby vehicles...</p>
        </div>
      </div>
    );

  // Error UI
  if (error)
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-xl shadow-md max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  // Empty UI
  if (!vehicles || vehicles.length === 0)
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8 md:p-10 pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto mb-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-black">Nearby Vehicles 🚗</h1>
            
            {/* Dynamic Distance Selector - Compact & Right Aligned (Empty UI) */}
            <div className="flex items-center justify-end gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-fit ml-auto mb-6">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Radius:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  value={distanceValue}
                  onChange={(e) => setDistanceValue(e.target.value)}
                  className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
                />
                
                <select 
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-xs text-black cursor-pointer font-medium"
                >
                  <option value="km">KM</option>
                  <option value="m">M</option>
                </select>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">No Vehicles Found</h2>
              <p className="text-gray-600">No vehicles available within {distanceValue}{distanceUnit}. Try increasing your radius!</p>
            </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-10 pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-center text-gray-900 tracking-tight">
          Nearby Vehicles 🚗
        </h1>

        {/* Dynamic Distance Selector - Compact & Right Aligned */}
        <div className="flex items-center justify-end gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-fit ml-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>Radius:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="number"
              value={distanceValue}
              onChange={(e) => setDistanceValue(e.target.value)}
              className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
            />
            
            <select 
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-xs text-black cursor-pointer font-medium"
            >
              <option value="km">KM</option>
              <option value="m">M</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {vehicles.map((vehicle, index) => (
          <VehiclemainCard
            key={vehicle._id}
            vehicle={vehicle}
            index={index}
            showCards={showCards}
          />
        ))}
      </div>
    </div>
  );
}