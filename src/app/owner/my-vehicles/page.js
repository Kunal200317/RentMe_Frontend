"use client";
import { useEffect, useState } from "react";
import API from "@/utils/api";
import VehicleCard from "@/components/VehicleCard";

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await API.get("/vehicles/my");
        const data = res.data?.vehicles || res.data?.data || res.data || [];
        setVehicles(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load vehicles");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600 bg-red-50 px-6 py-3 rounded-lg">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24 md:pt-28">
      <div className="max-w-4xl mx-auto mt-15">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Vehicles</h1>
          <span className="text-gray-600">
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}
          </span>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-1">
              No Vehicles Found
            </h2>
            <p className="text-gray-500">
              You haven’t added any vehicles yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
