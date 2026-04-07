"use client";
import { useEffect, useState } from "react";
import API from "@/utils/api";
import { VehiclemainCard } from "@/components/VehiclemainCard";
import { useSearchParams } from "next/navigation";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [findbyKM, setfindbyKM] = useState("5000");
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
            setError("Unable to get location. Please allow location access.");
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load vehicles. Please try again.");
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
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">
          Nearby Vehicles 🚗
        </h1>
        <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            No Vehicles Found
          </h2>
          <p className="text-gray-600">
            No vehicles available in your area at the moment.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-3 text-center text-black">
        Nearby Vehicles 
      </h1>

      <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6 mt-6">
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