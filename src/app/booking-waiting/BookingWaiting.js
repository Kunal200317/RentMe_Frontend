"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "@/utils/api";
import { io } from "socket.io-client";

export default function BookingWaiting() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [status, setStatus] = useState("waiting");
  const [socket, setSocket] = useState(null);
  const [countdown, setCountdown] = useState(120);
  const [isClient, setIsClient] = useState(false);

  // Use refs to track redirection state
  const hasRedirected = useRef(false);
  const socketInitialized = useRef(false);

  const handleAutoReject = useCallback(async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await API.put(`${backendUrl}/api/bookings/approve/${bookingId}?action=reject`);
      if (response.ok) {
        setStatus("auto_rejected");
      }
    } catch (error) {
      console.error("Auto-reject error:", error);
    }
  }, [bookingId]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle redirection in a separate effect
  useEffect(() => {
    if (status === "approved" && !hasRedirected.current) {
      hasRedirected.current = true;
      console.log("Redirecting to confirm-payment...");
      const timer = setTimeout(() => {
        localStorage.removeItem("paymentCountdown");
        localStorage.removeItem("countdownStartTime");
        router.push("/confirm-payment");
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (status === "rejected" && !hasRedirected.current) {
      hasRedirected.current = true;
      console.log("Redirecting to booking-rejected...");
      const timer = setTimeout(() => {
        router.push("/booking-rejected");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  useEffect(() => {
    if (!isClient || !bookingId) {
      if (!bookingId && isClient) {
        router.push("/");
      }
      return;
    }

    // Prevent duplicate socket initialization
    if (socketInitialized.current) return;
    socketInitialized.current = true;

    try {
      localStorage.setItem("bookingId", bookingId);
    } catch (error) {
      console.log("localStorage error:", error);
    }

    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace("/api", "");
    const newSocket = io(backendUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    const getUserID = () => {
      try {
        const userData = localStorage.getItem("userId");
        if (userData) {
          return userData;
        }
      } catch (error) {
        console.log("Error getting user ID:", error);
      }
      return null;
    };

    const userId = getUserID();

    if (userId) {
      newSocket.emit("join-user", userId);
      console.log("📢 Joined user room:", userId);
    }

    // Only set up socket listener once
    newSocket.on("booking-status-update", (data) => {
      console.log("🎯 Booking status update received:", data);
      console.log("Current bookingId:", bookingId, "Received bookingId:", data.bookingId);

      if (data.bookingId === bookingId) {
        console.log("✅ Matching booking ID, updating status to:", data.status);
        setStatus(data.status);
      }
    });

    // Handle socket connection errors
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      console.log("Cleaning up socket connection...");
      if (newSocket) {
        newSocket.off("booking-status-update");
        newSocket.close();
      }
      clearInterval(timer);
      socketInitialized.current = false;
      hasRedirected.current = false;
    };
  }, [bookingId, router, handleAutoReject, isClient]);

  const getStatusMessage = () => {
    switch (status) {
      case "waiting":
        return "Waiting for owner approval...";
      case "approved":
        return "✅ Booking Approved! Redirecting to payment...";
      case "rejected":
        return "❌ Booking Rejected by Owner";
      case "auto_rejected":
        return "⏰ Booking Auto-Rejected (No response from owner)";
      default:
        return "Processing your request...";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "rejected":
      case "auto_rejected":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div
            className={`absolute inset-0 border-4 rounded-full animate-spin border-t-transparent ${status === "waiting"
                ? "border-blue-500"
                : status === "approved"
                  ? "border-green-500"
                  : "border-red-500"
              }`}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">
              {status === "waiting" ? "⏳" : status === "approved" ? "✅" : "❌"}
            </span>
          </div>
        </div>

        <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {getStatusMessage()}
        </h2>

        {status === "waiting" && (
          <>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Owner has{" "}
                <span className="font-bold text-orange-500">
                  {countdown} seconds
                </span>{" "}
                to respond
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(countdown / 120) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <span>⏳</span>
                <p className="text-sm">
                  We&apos;re waiting for the owner to accept your booking request
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (socket) {
                  socket.close();
                }
                router.push("/vehicles");
              }}
              className="mt-2 w-full bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel Request
            </button>
          </>
        )}

        {(status === "approved" || status === "rejected" || status === "auto_rejected") && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <span>⏳</span>
              <p className="text-sm">
                Please wait while we redirect you...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}