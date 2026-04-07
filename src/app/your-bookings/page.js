"use client";
import { useEffect, useState, useCallback } from "react"; // ✅ useCallback add karein
import Image from 'next/image'; // ✅ Image component import
import API from "@/utils/api";
import { useRouter } from "next/navigation";

export default function YourBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [userAddresses, setUserAddresses] = useState({});
  const router = useRouter();

  // ✅ Fixed address fetch function with useCallback
  const fetchUserAddress = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address");
      }

      const data = await response.json();

      if (data && data.display_name) {
        return data.display_name;
      } else if (data && data.address) {
        // Fallback: manually format address
        const addr = data.address;
        const parts = [];
        if (addr.road) parts.push(addr.road);
        if (addr.neighbourhood) parts.push(addr.neighbourhood);
        if (addr.suburb) parts.push(addr.suburb);
        if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
        if (addr.state) parts.push(addr.state);

        return parts.length > 0 ? parts.join(", ") : "Address available";
      } else {
        return "Address not found";
      }
    } catch (error) {
      console.error("Address fetch error:", error);
      return "Location coordinates saved";
    }
  }, []); // ✅ No dependencies needed

  // ✅ Fixed address fetching with useCallback
  const fetchAllUserAddresses = useCallback(async (bookingsData) => {
    const addresses = {};

    for (const booking of bookingsData) {
      if (booking.userLocation?.coordinates && booking.userLocation.coordinates.length === 2) {
        try {
          const [lng, lat] = booking.userLocation.coordinates;
          const address = await fetchUserAddress(lat, lng);
          addresses[booking._id] = address;
        } catch (error) {
          console.error(`Error fetching address for booking ${booking._id}:`, error);
          addresses[booking._id] = "Location not available";
        }
      } else {
        addresses[booking._id] = "Location not specified";
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setUserAddresses(addresses);
  }, [fetchUserAddress]); // ✅ fetchUserAddress dependency

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await API.get("/bookings/my-bookings");
        if (response?.data?.success) {
          const bookingsData = response.data.bookings;
          setBookings(bookingsData);

          // Initialize image index for each vehicle
          const initialIndex = {};
          bookingsData.forEach(booking => {
            if (booking.vehicleId?._id) {
              initialIndex[booking.vehicleId._id] = 0;
            }
          });
          setCurrentImageIndex(initialIndex);

          // Fetch addresses for all bookings
          fetchAllUserAddresses(bookingsData);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [fetchAllUserAddresses]); // ✅ fetchAllUserAddresses dependency added

  const handleRemainingPayment = (booking) => {
    console.log("Process remaining payment for:", booking._id);
  };

  const openOwnerLocation = (vehicle) => {
    if (vehicle?.locationGeo?.coordinates) {
      const [lng, lat] = vehicle.locationGeo.coordinates;
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      alert("Owner location not available");
    }
  };

  // ✅ Open user location in Google Maps
  const openUserLocation = (booking) => {
    if (booking?.userLocation?.coordinates) {
      const [lng, lat] = booking.userLocation.coordinates;
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      alert("Your location not available");
    }
  };

  const nextImage = (vehicleId) => {
    setCurrentImageIndex(prev => {
      const currentIndex = prev[vehicleId] || 0;
      const vehicle = bookings.find(b => b.vehicleId?._id === vehicleId)?.vehicleId;
      const totalImages = vehicle?.images?.length || 0;

      if (totalImages <= 1) return prev;

      return {
        ...prev,
        [vehicleId]: (currentIndex + 1) % totalImages
      };
    });
  };

  const prevImage = (vehicleId) => {
    setCurrentImageIndex(prev => {
      const currentIndex = prev[vehicleId] || 0;
      const vehicle = bookings.find(b => b.vehicleId?._id === vehicleId)?.vehicleId;
      const totalImages = vehicle?.images?.length || 0;

      if (totalImages <= 1) return prev;

      return {
        ...prev,
        [vehicleId]: (currentIndex - 1 + totalImages) % totalImages
      };
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'half_paid': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto mt-14">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Bookings</h1>
        <p className="text-gray-600 mb-5">Manage and track all your vehicle bookings</p>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h2>
            <p className="text-gray-500">You haven&apos;t  made any bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const vehicleId = booking.vehicleId?._id;
              const currentIndex = currentImageIndex[vehicleId] || 0;
              const totalImages = booking.vehicleId?.images?.length || 0;
              const hasMultipleImages = totalImages > 1;
              const userAddress = userAddresses[booking._id] || "Loading location...";

              return (
                <div key={booking._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  {/* Booking Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {booking.vehicleId?.brand} {booking.vehicleId?.model}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Booking ID: {booking._id}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status?.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus?.toUpperCase()?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Vehicle Image Section - FIXED with Image component */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 mb-3">🚗 Vehicle Images</h4>
                      <div className="relative rounded-lg overflow-hidden bg-gray-100">
                        <div className="relative w-full h-64 overflow-hidden">
                          <Image
                            src={booking.vehicleId?.images?.[currentIndex] || "/car-placeholder.jpg"}
                            alt={`${booking.vehicleId?.brand} ${booking.vehicleId?.model}`}
                            width={800}
                            height={256}
                            className="w-full h-64 object-cover"
                            unoptimized={true}
                            priority={false}
                          />

                          {/* Navigation Arrows */}
                          {hasMultipleImages && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  prevImage(vehicleId);
                                }}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                              >
                                ‹
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  nextImage(vehicleId);
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                              >
                                ›
                              </button>
                            </>
                          )}

                          {/* Image Counter */}
                          {hasMultipleImages && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                              {currentIndex + 1} / {totalImages}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column - Booking Details */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">📅 Booking Period</h4>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium text-gray-600">Start Date</div>
                              <div className="text-gray-800 font-semibold">{formatDate(booking.startDate)}</div>
                            </div>
                            <div className="text-gray-400">→</div>
                            <div className="text-center">
                              <div className="font-medium text-gray-600">End Date</div>
                              <div className="text-gray-800 font-semibold">{formatDate(booking.endDate)}</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">👤 Owner Details</h4>
                          <div className="text-sm text-gray-600">
                            <p><span className="font-medium">Name:</span> {booking.ownerId?.name || 'N/A'}</p>
                            <p><span className="font-medium">Mobile:</span> {booking.ownerId?.mobile || 'N/A'}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">📍 Your Pickup Location</h4>
                          <div className="flex items-start gap-2">
                            <p className="text-sm text-gray-600 flex-1">
                              {userAddress}
                            </p>
                            <button
                              onClick={() => openUserLocation(booking)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
                              title="Open in Google Maps"
                            >
                              <span>🗺️</span>
                              View Map
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Payment & Actions */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">💰 Payment Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Amount:</span>
                              <span className="font-semibold text-gray-600">₹{booking.totalPrice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Advance Paid:</span>
                              <span className="font-semibold text-green-600">₹{booking.advancePaid || 0}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-gray-600">Remaining Amount:</span>
                              <span className="font-semibold text-orange-600">
                                ₹{booking.totalPrice - (booking.advancePaid || 0)}
                              </span>
                            </div>
                            {booking?.razorpay && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Order ID:</span>
                                <span className="font-mono text-xs text-gray-500">{booking?.razorpay?.orderId}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4">
                          {booking.paymentStatus === 'half_paid' && (
                            <button
                              onClick={() => handleRemainingPayment(booking)}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Pay Remaining ₹{booking.totalPrice - (booking.advancePaid || 0)}
                            </button>
                          )}

                          {/* ✅ CHAT BUTTON ADDED HERE */}
                          {booking.status === 'approved' && booking.paymentStatus === 'half_paid' && (
                            <button
                              onClick={() => router.push(`/chat/${booking._id}?ownerId=${booking.ownerId._id}`)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                            >
                              💬 Chat with Owner
                            </button>
                          )}

                          <button
                            onClick={() => openOwnerLocation(booking.vehicleId)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <span>🗺️</span>
                            View Owner Location
                          </button>

                          {booking?.status === 'approved' && (
                            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                              Contact Owner
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}