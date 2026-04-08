"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import API from "@/utils/api";
import { Car, Navigation, MapPin, Filter } from "lucide-react";

// Client-only Map
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

// Distance calculation function
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("distance");
  const [distanceValue, setDistanceValue] = useState("1");
  const [distanceUnit, setDistanceUnit] = useState("km");
  const [findbyKM, setfindbyKM] = useState(1000);

  // ✅ Step 1 — Get user location (client-only)
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        console.error("Error getting location:", err);
        setError("Unable to get your location. Please allow location access.");
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    // Convert to meters for API — added safety fallback to 0
    const val = parseInt(distanceValue) || 0;
    const meters = distanceUnit === "km" ? val * 1000 : val;
    setfindbyKM(meters);
  }, [distanceValue, distanceUnit]);

  // ✅ Step 2 — Fetch nearby vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!coords) return;

      try {
        setLoading(true);
        const res = await API.get(
          `/vehicles/nearby?lat=${coords.latitude}&lng=${coords.longitude}&maxDistance=${findbyKM}`
        );

        const data = res.data.vehicles || [];

        const vehiclesWithDistance = data.map((v) => {
          const vehicleLat = v.locationGeo?.coordinates?.[1] || 0;
          const vehicleLng = v.locationGeo?.coordinates?.[0] || 0;
          const distance = getDistanceFromLatLonInKm(
            coords.latitude,
            coords.longitude,
            vehicleLat,
            vehicleLng
          );
          return { ...v, distance: distance.toFixed(2) };
        });

        // Sort by distance by default
        vehiclesWithDistance.sort((a, b) => a.distance - b.distance);
        setVehicles(vehiclesWithDistance);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError("Failed to fetch vehicles. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [coords, findbyKM]);

  // Filter and sort vehicles
  const filteredAndSortedVehicles = vehicles
    .filter(vehicle => {
      if (filter === "all") return true;
      return vehicle.vehicleType?.toLowerCase() === filter;
    })
    .sort((a, b) => {
      if (sortBy === "distance") return a.distance - b.distance;
      if (sortBy === "price") return a.rentPerDay - b.rentPerDay;
      return 0;
    });

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Finding vehicles near you...</p>
          <p className="text-gray-500 text-sm mt-2">Loading your location and nearby vehicles</p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">Location Access Required</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
            >
              Try Again
            </button>
            <button
              onClick={() => setError("")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Use Default Location
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 md:pt-28">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                Find Your Perfect Ride
              </h1>
              <p className="text-gray-600 mt-2">
                Discover vehicles available near your location
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6 mt-4 md:mt-0 flex-col sm:flex-row items-end sm:items-center">
              {/* Dynamic Distance Selector - Compact & Right Aligned */}
              <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 w-fit">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Radius:</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={distanceValue}
                    onChange={(e) => setDistanceValue(e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs text-black"
                  />
                  
                  <select 
                    value={distanceUnit}
                    onChange={(e) => setDistanceUnit(e.target.value)}
                    className="px-1.5 py-1 border border-gray-200 rounded-lg bg-gray-50 text-[10px] text-black cursor-pointer font-bold"
                  >
                    <option value="km">KM</option>
                    <option value="m">M</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{vehicles.length}</div>
                  <div className="text-sm text-gray-500">Vehicles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {coords ? `${vehicles.length > 0 ? vehicles[0].distance : '0'} km` : '--'}
                  </div>
                  <div className="text-sm text-gray-500">Nearest</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SIDE — Filters & Vehicle List */}
          <div className="lg:w-2/5 w-full">
            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Filters & Sort</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm text-gray-700 "
                  >
                    <option value="all">All Types</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="luxury">Luxury</option>
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm text-gray-700"
                  >
                    <option value="distance">Distance</option>
                    <option value="price">Price</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Vehicle List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-orange-500" />
                  Nearby Vehicles
                  <span className=" bg-orange-500 text-white text-sm px-2 py-1 rounded-full">
                    {filteredAndSortedVehicles.length}
                  </span>
                </h2>
              </div>

              {filteredAndSortedVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚗</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No vehicles found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search area</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto">
                  {filteredAndSortedVehicles.map((v) => (
                    <div
                      key={v._id}
                      className="p-5 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-blue-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {v.brand} {v.model}
                          </h3>
                          <p className="text-gray-600 text-sm capitalize">{v.vehicleType}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">₹{v.rentPerDay}</div>
                          <div className="text-xs text-gray-500">per day</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span>{v.distance} km</span>
                          </div>
                          <div className="text-gray-600">
                            Owner: <span className="font-medium">{v.ownerId?.name || "Local Owner"}</span>
                          </div>
                        </div>
                        
                        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE — Map */}
          <div className="lg:w-3/5 w-full">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  Live Location Map
                </h2>
              </div>
              
              {coords && <MapView vehicles={vehicles} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}