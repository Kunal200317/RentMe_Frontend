"use client";
import API from '@/utils/api';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function NotificationPopup({ ownerId }) {
  const [notification, setNotification] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    if (!ownerId) {
      console.log("❌ No ownerId provided");
      return;
    }

    console.log("🚀 Starting socket connection...");
    console.log("👨‍💼 Owner ID:", ownerId);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const newSocket = io(backendUrl.replace("/api", ""), {
      transports: ["websocket", "polling"],
      timeout: 10000,
      autoConnect: true
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected successfully!");
      setSocketReady(true);
      newSocket.emit('join-owner', ownerId);
      console.log("📢 Joined owner room:", ownerId);
    });

    newSocket.on('new-booking-request', (data) => {
      console.log("🎉 New booking notification received!");
      console.log("📦 Notification Data:", data);

      // ✅ Ensure bookingId is string
      if (data.bookingId) {
        data.bookingId = String(data.bookingId);
      }

      console.log("🔍 Booking ID (converted):", data.bookingId);

      setNotification(data);
      setIsClosing(false);
      setTimeout(() => setIsVisible(true), 100);
    });

    newSocket.on("connect_error", (error) => {
      console.log("❌ Socket connection failed:", error.message);
      setSocketReady(false);
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setSocketReady(false);
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [ownerId]);

  // Auto close after 2 minutes (120 seconds)
  useEffect(() => {
    if (isVisible && notification) {
      const timer = setTimeout(() => {
        console.log("⏰ Auto-closing notification after 2 minutes");
        closeNotification();
      }, 120000); // 2 minutes = 120000 milliseconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, notification]);

  const handleAccept = async () => {
    if (!notification) return;

    // Check if already processing
    if (isProcessing) {
      console.log("⏳ Already processing, please wait...");
      return;
    }

    // Small delay to ensure socket is ready
    if (!socketReady) {
      console.log("⚠️ Waiting for socket connection...");
      // Retry after 500ms
      setTimeout(() => {
        handleAccept();
      }, 500);
      return;
    }

    setIsProcessing(true);
    console.log("✅ Starting accept process...");

    try {
      console.log("✅ Accepting booking:", notification.bookingId);

      const response = await API.put(`/bookings/approve/${notification.bookingId}?action=approve`);

      console.log("Response status:", response.status);

      if (response.status === 200 || response.status === 201) {
        const result = response.data;
        console.log("👍 Booking accepted successfully:", result);

        // ✅ IMPORTANT: Delay before sending socket events
        await new Promise(resolve => setTimeout(resolve, 300));

        // ✅ FIX: bookingId ko STRING mein convert karo
        const bookingIdStr = String(notification.bookingId);

        // Send socket event to update waiting page
        if (socket && socket.connected) {
          console.log("📤 Sending socket updates...");

          // ✅ FIXED: Send MULTIPLE events for reliability

          // Event 1 - Main event
          socket.emit("booking-status-update", {
            bookingId: bookingIdStr,
            status: "approved",
            timestamp: new Date().toISOString()
          });

          console.log("📨 Socket event sent for booking:", bookingIdStr);
        }

        // Close notification without alert
        setTimeout(() => {
          closeNotification();
        }, 300);

      } else {
        const errorText = await response.text();
        console.log("❌ Accept failed:", response.status, errorText);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Accept error:', error);
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!notification) return;

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      console.log("❌ Rejecting booking:", notification.bookingId);

      const response = await API.put(`/bookings/approve/${notification.bookingId}?action=reject`);

      console.log("Response status:", response.status);

      if (response.status === 200 || response.status === 201) {
        const result = response.data;
        console.log("👎 Booking rejected successfully:", result);

        // ✅ FIX: bookingId ko STRING mein convert karo
        const bookingIdStr = String(notification.bookingId);

        // Send socket event for rejection
        if (socket && socket.connected) {
          console.log("📤 Sending rejection socket events...");

          // Event 1
          socket.emit("booking-status-update", {
            bookingId: bookingIdStr,
            status: "rejected",
            timestamp: new Date().toISOString()
          });

          console.log("📨 Rejection socket event sent for booking:", bookingIdStr);
        }

        // ✅ REJECTED BOOKING DELETE KARO
        await deleteRejectedBooking(notification.bookingId);

        // Close notification without alert
        closeNotification();
      } else {
        const errorText = await response.text();
        console.log("❌ Reject failed:", response.status, errorText);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Reject error:', error);
      setIsProcessing(false);
    }
  };

  // ✅ REJECTED BOOKING DELETE FUNCTION
  const deleteRejectedBooking = async (bookingId) => {
    try {
      console.log("🗑️ Deleting rejected booking:", bookingId);

      const response = await API.delete(`/bookings/rejected/${bookingId}`);

      if (response.data.success) {
        console.log("✅ Rejected booking deleted successfully");
      } else {
        console.log("❌ Failed to delete rejected booking");
      }
    } catch (error) {
      console.error("Error deleting rejected booking:", error);
    }
  };

  // ✅ SOCKET SE STATUS UPDATE SUNO AUR AUTOMATIC DELETE KARO
  useEffect(() => {
    if (!socket) return;

    const handleBookingStatusUpdate = (data) => {
      console.log("📢 Booking status update received:", data);

      if (data.bookingId === notification?.bookingId && data.status === "rejected") {
        console.log("🔄 Auto-deleting rejected booking...");
        deleteRejectedBooking(data.bookingId);
        closeNotification();
      }
    };

    socket.on("booking-status-update", handleBookingStatusUpdate);

    return () => {
      socket.off("booking-status-update", handleBookingStatusUpdate);
    };
  }, [socket, notification]);

  const closeNotification = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setNotification(null);
      setIsClosing(false);
      setIsProcessing(false);
    }, 400);
  };

  console.log("🔍 Current Notification:", notification);
  console.log("🔍 Booking ID Available:", notification?.bookingId);
  console.log("🔍 Booking ID Type:", typeof notification?.bookingId);
  console.log("🔌 Socket Ready:", socketReady);
  console.log("🔄 Socket Connected:", socket?.connected);

  if (!notification) return null;

  return (
    <>
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 font-medium">Processing request...</p>
          </div>
        </div>
      )}

      {/* Animated Blur Background - Click to close */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${isVisible
          ? 'bg-black bg-opacity-70 backdrop-blur-md'
          : 'bg-black bg-opacity-0 backdrop-blur-0'
          } ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={closeNotification}
      />

      {/* Animated Notification Card */}
      <div className={`fixed top-auto left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md transition-all duration-500 ${isVisible
        ? 'opacity-100 scale-100 translate-y-0'
        : 'opacity-0 scale-75 translate-y-10'
        } ${isClosing ? 'animate-slide-out' : 'animate-slide-in'}`}>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl mx-4 my-10 h-[500px] border border-white/20 overflow-hidden transform transition-all duration-300 hover:scale-105">

          {/* Glowing Header with Close Button in Top Right */}
          <div className="relative bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 p-6 overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse delay-300"></div>
            </div>

            <div className="relative flex items-center gap-4">
              {/* Animated Icon */}
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 animate-bounce">
                  <span className="text-white text-2xl">🚗</span>
                </div>
                {/* Pulsing Ring */}
                <div className="absolute inset-0 w-16 h-16 border-2 border-white/40 rounded-full animate-ping"></div>
              </div>

              <div className="flex-1">
                <h2 className="text-white font-bold text-2xl mb-1 animate-pulse">
                  New Booking!
                </h2>
                <p className="text-emerald-100 text-sm font-medium">
                  Someone wants to book your vehicle
                </p>
              </div>

              {/* Close Button - Moved to Top Right Corner */}
              <button
                onClick={closeNotification}
                className="text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 p-2 rounded-full hover:bg-white/20 absolute top-1 right-1"
                disabled={isProcessing}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Socket Status Indicator */}
            <div className="absolute bottom-2 right-4 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${socketReady ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-white/80 text-xs">
                {socketReady ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>

          {/* Content with Slide-in Animation */}
          <div className="p-6 space-y-4 transform transition-all duration-500 delay-200">
            {/* Date Row */}
            <div className="flex items-center gap-3 animate-slide-in-left">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                <span className="text-green-600 text-lg">📅</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-medium">Booking Dates</p>
                <p className="text-gray-800 font-semibold">
                  {new Date(notification.startDate).toLocaleDateString()} - {new Date(notification.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Vehicle Row */}
            <div className="flex items-center gap-3 animate-slide-in-left delay-100">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                <span className="text-blue-600 text-lg">🏍️</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-medium">Vehicle</p>
                <p className="text-gray-800 font-semibold">{notification.vehicle}</p>
              </div>
            </div>

            {/* Amount Row */}
            <div className="flex items-center gap-3 animate-slide-in-left delay-200">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                <span className="text-purple-600 text-lg">💰</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-medium">Total Amount</p>
                <p className="text-gray-800 font-semibold text-lg">₹{notification.totalPrice}</p>
              </div>
            </div>

            {/* Booking ID Row */}
            {notification.bookingId && (
              <div className="flex items-center gap-3 animate-slide-in-left delay-300">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                  <span className="text-gray-600 text-lg">🆔</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-sm font-medium">Booking ID</p>
                  <p className="text-gray-800 font-mono text-xs bg-gray-50 p-2 rounded-lg">
                    {notification.bookingId}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons with Stagger Animation */}
          {notification.bookingId && (
            <div className="p-6 pt-4 animate-slide-in-up delay-500">
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 px-6 rounded-xl text-base font-bold hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border border-red-300/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : '❌ Reject'}
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl text-base font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border border-green-300/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : '✅ Accept'}
                </button>
              </div>

              {/* Status Info */}
              {!socketReady && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700 text-sm text-center">
                    ⚠️ Connecting to server... Please wait a moment
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer - Auto close timer */}
          <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 border-t border-gray-200/50">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm font-medium">
                Auto closes in 2 minutes
              </p>
              <span className={`px-2 py-1 rounded text-xs font-medium ${socketReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {socketReady ? '🟢 Online' : '🔴 Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}