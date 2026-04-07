"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import API from "@/utils/api";
import { UserProfile } from "@/components/UserProfile";
import { FiSend, FiArrowLeft, FiUser, FiCar, FiCalendar } from "react-icons/fi";
import { BsDot } from "react-icons/bs";

export default function OwnerChatPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [renterName, setRenterName] = useState("Renter");
  const [renterAvatar, setRenterAvatar] = useState("");
  const messagesEndRef = useRef(null);

  const { data: userData, loading: userLoading } = UserProfile();
  const currentUserId = userData?._id;

  // Sound effects
  const playSendSound = () => {
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('/sounds/send.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log("Sound play failed:", e));
    }
  };

  const playReceiveSound = () => {
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('/sounds/receive.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log("Sound play failed:", e));
    }
  };

  // Fetch booking details and renter info
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingResponse = await API.get(`/bookings/${bookingId}`);
        if (bookingResponse.data.success) {
          const bookingData = bookingResponse.data.booking || bookingResponse.data.data;
          setBooking(bookingData);

          // Extract renter details
          if (bookingData.userId) {
            const renter = bookingData.userId;
            console.log(renter);

            setRenterName(renter.name || "Car Renter");
            setRenterAvatar(
              renter.profileImage ||
              renter.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${renter.name || renter._id}`
            );
          }
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      }
    };

    if (bookingId) fetchBooking();
  }, [bookingId]);

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await API.get(`/chat/${bookingId}`);
        if (response.data.success) {
          setMessages(response.data.messages);

          // Try to extract renter name from messages if not already set
          if (!renterName || renterName === "Renter") {
            const otherUserMessage = response.data.messages.find(
              msg => msg.senderId?._id !== currentUserId
            );
            if (otherUserMessage?.senderId?.name) {
              setRenterName(otherUserMessage.senderId.name);
              if (otherUserMessage.senderId.profileImage) {
                setRenterAvatar(otherUserMessage.senderId.profileImage);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId && currentUserId) fetchMessages();
  }, [bookingId, currentUserId, renterName]);

  // Socket connection
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const newSocket = io(backendUrl.replace("/api", ""));
    setSocket(newSocket);

    newSocket.emit("join-chat", bookingId);

    newSocket.on("receive-message", (message) => {
      // Update renter name if we receive message from them
      if (message.senderId && message.senderId._id !== currentUserId) {
        if (message.senderId.name && message.senderId.name !== renterName) {
          setRenterName(message.senderId.name);
        }
        if (message.senderId.profileImage && !renterAvatar.includes('dicebear')) {
          setRenterAvatar(message.senderId.profileImage);
        }
        playReceiveSound();
      }
      setMessages(prev => [...prev, message]);
    });

    newSocket.on("message-sent", (message) => {
      if (message.senderId?._id === currentUserId) {
        playSendSound();
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [bookingId, currentUserId, renterName, renterAvatar]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !socket || !booking || !currentUserId) return;

    try {
      const response = await API.post("/chat/send", {
        bookingId,
        receiverId: booking.userId?._id || booking.userId,
        message: newMessage
      });

      if (response.data.success) {
        playSendSound();
        socket.emit("send-message", response.data.message);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/patterns/chat-bg.svg')] opacity-5"></div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <FiArrowLeft className="text-xl" />
            </button>

            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                <img
                  src={renterAvatar}
                  alt={renterName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${renterName || 'renter'}`;
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-white font-semibold text-lg truncate">
                  Chat with {renterName}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <BsDot className="text-green-300 text-sm" />
                    <span className="text-white/80 text-sm">Online</span>
                  </div>
                  {booking && (
                    <>
                      <span className="text-white/60">•</span>
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        {/* <FiCar className="text-xs" /> */}
                        <span className="truncate">
                          {booking.vehicleId?.brand} {booking.vehicleId?.model}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Info Card */}
      {booking && (
        <div className="max-w-4xl mx-auto px-4 py-4 relative z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/20 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {/* <FiCar className="text-blue-600" /> */}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vehicle</p>
                  <p className="font-medium text-gray-500">
                    {booking.vehicleId?.brand} {booking.vehicleId?.model} • {booking.vehicleId?.year}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiCalendar className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking Dates</p>
                  <p className="font-medium text-gray-500">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Messages Container */}
        <div className="px-4 py-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 h-[65vh] overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FiSend className="text-blue-500 text-3xl" />
                </div>
                <p className="text-lg font-medium mb-2">Start a conversation</p>
                <p className="text-gray-400 text-center max-w-sm">
                  Send a message to {renterName} to discuss booking details
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {date}
                      </div>
                    </div>

                    {/* Messages for this date */}
                    {dateMessages.map((message) => {
                      const isOwnMessage = message.senderId?._id === currentUserId;
                      const time = formatTime(message.timestamp);

                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-3`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? "ml-auto" : ""}`}>
                            {/* Message Bubble */}
                            <div className={`relative px-4 py-3 rounded-2xl ${isOwnMessage
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                              : "bg-gray-100 text-gray-800 rounded-bl-none"
                              }`}>
                              <p className="text-sm leading-relaxed">{message.message}</p>
                              <p className={`text-xs mt-1 ${isOwnMessage
                                ? "text-blue-100/80"
                                : "text-gray-500"
                                }`}>
                                {time}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Message ${renterName}...`}
                className="flex-1 bg-transparent border-none text-gray-800 px-4 py-3 focus:outline-none focus:ring-0 placeholder-gray-400"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !booking || !currentUserId}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                <FiSend className="text-xl" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 px-4">
              Press Enter to send • Messages are end-to-end encrypted
            </p>
          </div>
        </div>
      </div>

      {/* Owner Badge */}
      <div className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-3 py-2 rounded-full shadow-lg z-20">
        <div className="flex items-center gap-2">
          <FiUser className="text-xs" />
          <span>Owner</span>
        </div>
      </div>
    </div>
  );
}