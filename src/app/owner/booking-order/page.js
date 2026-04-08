"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import NotificationPopup from "@/components/NotificationPopup";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await API.get("/bookings/owner-bookings");
        // Sirf approved bookings show karenge
        const approvedBookings = res.data.bookings?.filter(booking =>
          booking.status === "approved"
        ) || [];

        setBookings(approvedBookings);

        if (approvedBookings.length > 0) {
          const firstBooking = approvedBookings[0];
          const possibleOwnerId = firstBooking.ownerId || firstBooking.vehicleId?.ownerId;
          setOwnerId(possibleOwnerId);
        } else {
          const userData = localStorage.getItem("userId");
          setOwnerId(userData);
        }

      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // User ka Google Maps link generate karega
  const openUserLocation = (booking) => {
    if (booking?.userLocation?.coordinates) {
      const [lng, lat] = booking.userLocation.coordinates;
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      alert("Your location not available");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Owner Dashboard</h1>
          <p className="text-gray-600">Manage your approved vehicle bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Approved Bookings</h3>
            <p className="text-gray-500">You Don&apos;t have any approved bookings yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Approved Bookings</h2>
              <p className="text-sm text-gray-600 mt-1">{bookings.length} approved booking(s)</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Period</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => {

                    return (
                      <tr key={booking._id} className="hover:bg-blue-50 transition-colors">
                        {/* Vehicle Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-xl">🚗</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {booking.vehicleId?.brand} {booking.vehicleId?.model}
                              </p>
                              <p className="text-sm text-gray-500">{booking.vehicleId?.type}</p>
                            </div>
                          </div>
                        </td>

                        {/* Customer Info */}
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800">{booking.userId?.name || "N/A"}</p>
                          <p className="text-sm text-gray-500">{booking.userId?.mobile || "No contact"}</p>
                          <p className="text-xs text-blue-600 mt-1">{booking.userId?.email}</p>

                        </td>

                        {/* Booking Period */}
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-800">
                              {new Date(booking.startDate).toLocaleDateString()}
                            </p>
                            <p className="text-gray-400 text-xs text-center">to</p>
                            <p className="font-medium text-gray-800">
                              {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-green-600 mt-1 font-medium">
                              ✅ Approved
                            </p>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800 text-lg">₹{booking.totalPrice}</p>
                          {booking.paymentStatus === 'half_paid' ? (
                            <p className="text-xs text-green-600 font-medium">20% Advance Paid</p>
                          ) : (
                            <p className="text-xs text-yellow-600 font-medium">Payment Pending</p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {/* Chat Button - Sirf half_paid bookings ke liye */}
                            {booking.paymentStatus === 'half_paid' && (
                              <button
                                onClick={() => router.push(`/owner-chat/${booking._id}`)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center"
                              >
                                <span>💬</span>
                                Chat with User
                              </button>
                            )}

                            {/* Location Button - Agar location available hai */}

                            <a
                              onClick={() => openUserLocation(booking)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center text-center"
                            >
                              <span>📍</span>
                              View Location
                            </a>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}