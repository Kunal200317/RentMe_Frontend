"use client";
import React, { useState, useEffect, use } from "react";
import API from "@/utils/api";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/components/UserProfile";
import Image from 'next/image';

export default function BookVehicle({ params }) {
  const router = useRouter();
  const { id } = React.use(params);

  const [vehicle, setVehicle] = useState(null);
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    totalDays: 0,
    totalPrice: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const { data: userData, loading: userLoading, error: userError } = UserProfile();


  useEffect(() => {
    if (userError) {
      setError("Failed to load user profile");
    } else if (userData) {
      const userId = userData?.id || userData?._id;
      localStorage.setItem("userId", userId);
    }
  }, [userData, userLoading,userError]);

  useEffect(() => {
    async function fetchVehicle() {
      try {
        setLoading(true);
        const res = await API.get(`/vehicles/${id}`);
        setVehicle(res.data.vehicle);
        // Vehicle load hone ke baad content show karein
        setTimeout(() => setShowContent(true), 300);
      } catch (err) {
        setError("Failed to load vehicle details");
      } finally {
        setLoading(false);
      }
    }

    fetchVehicle();
  }, [id]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }, [id]);

  // ✅ Handle date change & calculate price
  const handleDateChange = (field, value) => {
    const updatedForm = { ...form, [field]: value };

    if (updatedForm.startDate && updatedForm.endDate) {
      const start = new Date(updatedForm.startDate);
      const end = new Date(updatedForm.endDate);
      const days = Math.ceil((end - start) / (1000 * 3600 * 24));

      if (days > 0 && vehicle) {
        updatedForm.totalDays = days;
        updatedForm.totalPrice = days * (vehicle.rentPerDay || 0);
      } else {
        updatedForm.totalDays = 0;
        updatedForm.totalPrice = 0;
      }
    }

    setForm(updatedForm);
  };

  // ✅ Handle booking form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate)
      return setError("Please select both dates");

    if (form.totalDays <= 0)
      return setError("End date must be after start date");

    const bookingData = {
      vehicleId: id,
      userLocation: coords,
      ...form,
    };

    try {
      console.log(bookingData);

      localStorage.setItem("pendingBooking", JSON.stringify(bookingData));
      // ✅ NAYA: Owner ko request bhejein
      const response = await API.post("/bookings/request", bookingData);

      if (response.data.success) {
        // ✅ Loading page pe redirect karein
        router.push(`/booking-waiting?bookingId=${response.data.bookingId}`);
      }
    } catch (error) {
      setError("Booking request failed. Please try again.");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  // ✅ Loading state with animation
  if (!vehicle && !error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading vehicle details...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 ">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`
          text-center mb-4
          transform transition-all duration-1000
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
        `}>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Book Your Dream Ride 🚗
          </h1>
          <p className="text-gray-600 text-lg">Complete your booking in just a few steps</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT SIDE - Vehicle Details */}
          <div className={`
            bg-white rounded-2xl shadow-xl p-6
            transform transition-all duration-500 delay-200
            ${showContent ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
          `}>
            {/* Vehicle Image */}
            <div className="mb-6">
              <Image
                src={vehicle?.images?.[0] || "/car-placeholder.jpg"}
                alt={vehicle?.brand || "Vehicle Image"}
                width={800}  
                height={320} 
                className="w-full h-80 object-cover rounded-xl shadow-lg"
                priority={false}
                unoptimized={true} 
              />
            </div>

            {/* Vehicle Info */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {vehicle?.brand} {vehicle?.model}
                  </h2>
                  <p className="text-gray-600 text-lg capitalize">{vehicle?.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ₹{vehicle?.rentPerDay}/day
                  </p>
                  <p className="text-gray-500 text-sm">Inclusive of all taxes</p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">⛽</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fuel Type</p>
                    <p className="font-semibold text-gray-800 capitalize">{vehicle?.fuelType || "Petrol"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600">👥</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Seating Capacity</p>
                    <p className="font-semibold text-gray-800">{vehicle?.seats || 5} Seats</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600">⚙️</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transmission</p>
                    <p className="font-semibold text-gray-800 capitalize">{vehicle?.transmission || "Manual"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600">📅</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Year</p>
                    <p className="font-semibold text-gray-800">{vehicle?.year || "2023"}</p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-800">Vehicle Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {vehicle?.description || `Experience the perfect blend of comfort and performance with the ${vehicle?.brand} ${vehicle?.model}. This well-maintained vehicle offers excellent fuel efficiency and a smooth driving experience, making it ideal for both city commutes and long journeys.`}
                </p>
              </div>

              {/* Safety Features */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <span>🛡️</span>
                  Included in Rental
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Insurance Coverage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>24/7 Roadside Assistance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Free Cancellation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Clean & Sanitized</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Booking Form */}
          <div className={`
            bg-white rounded-2xl shadow-xl p-6
            transform transition-all duration-500 delay-400
            ${showContent ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}
          `}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Booking Details
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={form.startDate}
                    onChange={(e) => handleDateChange("startDate", e.target.value)}
                    className="w-full px-4 py-3 border cursor-pointer border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-500 hover:border-blue-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    min={form.startDate || today}
                    value={form.endDate}
                    onChange={(e) => handleDateChange("endDate", e.target.value)}
                    className="w-full cursor-pointer px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-500 hover:border-blue-300"
                    required
                  />
                </div>
              </div>

              {/* ✅ Booking Summary */}
              {vehicle && form.totalDays > 0 && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 text-lg">
                    Booking Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rental Duration:</span>
                      <span className="font-semibold text-gray-800">{form.totalDays} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price per day:</span>
                      <span className="text-gray-800">₹{vehicle?.rentPerDay || 0}</span>
                    </div>
                    <div className="border-t border-green-200 pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-800">Total Amount:</span>
                        <span className="text-green-600">₹{form.totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || !vehicle}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl text-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Booking...
                    </>
                  ) : (
                    "Confirm Booking 🚀"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105"
                >
                  ← Back to Vehicles
                </button>
              </div>
            </form>

            {/* Quick Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">ℹ️</span>
                </div>
                <div>
                  <p className="text-sm text-blue-700">
                    Your location will be used for vehicle delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}