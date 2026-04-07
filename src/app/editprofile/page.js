"use client";
import { useState, useEffect, useRef } from "react";
import Image from 'next/image';
import API from "@/utils/api";
import { UserProfile } from "@/components/UserProfile";
import { FiCamera, FiMapPin, FiUser, FiMail, FiPhone, FiHome, FiNavigation, FiCheckCircle } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function UpdateProfile() {
    const { data: userData, loading: userLoading, error: userError } = UserProfile();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        address: "",
        pincode: "",
        city: "",
        state: "",
        landmark: "",
        profileImage: null,
        latitude: "",
        longitude: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState("");
    const fileInputRef = useRef(null);

    const getAvatarUrl = (name) => {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'user'}&backgroundColor=65c9ff`;
    };

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported"));
                return;
            }

            setLocationLoading(true);
            setLocationStatus("Getting your location...");

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocationLoading(false);
                    resolve({ latitude, longitude });
                },
                (error) => {
                    setLocationLoading(false);
                    let errorMessage = "Location detection failed";

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Location access denied. Please allow location access.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "Location request timed out.";
                            break;
                        default:
                            errorMessage = "Unknown location error.";
                            break;
                    }

                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 60000
                }
            );
        });
    };

    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            setLocationStatus("Fetching address details...");

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch address");
            }

            const data = await response.json();
            if (data && data.address) {
                const address = data.address;

                setFormData(prev => ({
                    ...prev,
                    address: prev.address || data.display_name || "",
                    city: prev.city || address.city || address.town || address.village || "",
                    state: prev.state || address.state || address.city || "",
                    pincode: prev.pincode || address.postcode || "",
                    landmark: prev.landmark || address.amenity || address.suburb || "",
                    latitude: lat.toString(),
                    longitude: lng.toString()
                }));

                setLocationStatus(`Address detected successfully`);
            } else {
                throw new Error("No address found");
            }
        } catch (error) {
            console.error("Address fetch error:", error);
            setFormData(prev => ({
                ...prev,
                latitude: lat.toString(),
                longitude: lng.toString()
            }));
            setLocationStatus("Location saved (address incomplete)");
        }
    };

    const handleAutoDetectLocation = async () => {
        try {
            setError("");
            const { latitude, longitude } = await getCurrentLocation();
            setLocationStatus(`Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            await getAddressFromCoordinates(latitude, longitude);
        } catch (error) {
            setError(error.message);
            setLocationStatus(`${error.message}`);
        }
    };

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                mobile: userData.mobile || "",
                address: userData.address || "",
                pincode: userData.pincode || "",
                city: userData.city || "",
                state: userData.state || "",
                landmark: userData.landmark || "",
                profileImage: null,
                latitude: userData.latitude || "",
                longitude: userData.longitude || ""
            });

            if (userData.profileImage) {
                setImagePreview(userData.profileImage);
            } else {
                setImagePreview(getAvatarUrl(userData.name));
            }
        }
    }, [userData]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError("Please select a valid image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size should be less than 5MB");
            return;
        }

        setFormData(prev => ({
            ...prev,
            profileImage: file
        }));

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "mobile") {
            if (!/^\d*$/.test(value) || value.length > 10) return;
        }

        if (name === "pincode") {
            if (!/^\d*$/.test(value) || value.length > 6) return;
        }

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            if (!formData.name.trim()) {
                setError("Name is required");
                return;
            }

            if (!formData.email.trim()) {
                setError("Email is required");
                return;
            }

            const submitFormData = new FormData();
            submitFormData.append("name", formData.name);
            submitFormData.append("email", formData.email);
            submitFormData.append("mobile", formData.mobile || "");
            submitFormData.append("address", formData.address || "");
            submitFormData.append("pincode", formData.pincode || "");
            submitFormData.append("city", formData.city || "");
            submitFormData.append("state", formData.state || "");
            submitFormData.append("landmark", formData.landmark || "");
            submitFormData.append("latitude", formData.latitude || "");
            submitFormData.append("longitude", formData.longitude || "");

            if (formData.profileImage) {
                submitFormData.append("profileImage", formData.profileImage);
            }

            const response = await API.put("/auth/update-user", submitFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setMessage("Profile updated successfully!");
                setTimeout(() => setMessage(""), 3000);

                if (formData.profileImage && response.data.user?.profileImage) {
                    setImagePreview(response.data.user.profileImage);
                }
            } else {
                setError(response.data.message || "Failed to update profile");
            }
        } catch (err) {
            console.error("Update error:", err);
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (userLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (userError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Error Loading Profile</h2>
                    <p className="text-gray-600 mb-6">{userError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Update Profile
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Manage your personal information and customize your profile settings
                    </p>
                </div>

                {/* Messages */}
                {message && (
                    <div className="mb-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <FiCheckCircle className="text-green-500 text-xl" />
                            <p className="text-green-700 font-medium">{message}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-8 p-5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="text-red-500 text-xl">⚠️</div>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="md:flex">
                        {/* Left Side - Profile Image Card */}
                        <div className="md:w-1/3 bg-gradient-to-b from-blue-50 to-indigo-50 p-8 flex flex-col items-center justify-center border-r border-gray-200">
                            <div className="relative mb-6">
                                <div className="w-40 h-40 rounded-2xl overflow-hidden border-8 border-white shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    <Image
                                        src={imagePreview || getAvatarUrl(formData.name)}
                                        alt="Profile"
                                        width={160}
                                        height={160}
                                        className="w-full h-full object-cover"
                                        unoptimized={true}
                                        priority={true}
                                        onError={(e) => {
                                            e.target.src = getAvatarUrl(formData.name);
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-full shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    <FiCamera className="text-xl" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{formData.name || "User"}</h3>
                                <p className="text-gray-600 text-sm mb-1">{formData.email}</p>
                                <p className="text-gray-500 text-sm">
                                    {formData.profileImage ? "New image selected" : "Click camera to update photo"}
                                </p>
                            </div>

                            {/* Location Card */}
                            <div className="mt-8 w-full">
                                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FiMapPin className="text-blue-600 text-lg" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">Location</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {locationStatus || "Click below to detect"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAutoDetectLocation}
                                        disabled={locationLoading}
                                        className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 px-4 py-3 rounded-xl text-sm font-medium disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        {locationLoading ? (
                                            <>
                                                <AiOutlineLoading3Quarters className="animate-spin" />
                                                Detecting...
                                            </>
                                        ) : (
                                            <>
                                                <FiNavigation className="text-lg" />
                                                Detect Location
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="md:w-2/3 p-8">
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-8">
                                    {/* Personal Information Section */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <FiUser className="text-blue-600 text-xl" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800">Personal Information</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Full Name *
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                        <FiUser />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-800"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email *
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                        <FiMail />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        readOnly
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Mobile Number
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                        <FiPhone />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        name="mobile"
                                                        value={formData.mobile}
                                                        onChange={handleChange}
                                                        maxLength="10"
                                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-800"
                                                        placeholder="10-digit mobile number"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information Section */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                <FiHome className="text-indigo-600 text-xl" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800">Address Information</h3>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Complete Address
                                                </label>
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    rows="3"
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-800 resize-none"
                                                    placeholder="Enter your complete address"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Pincode
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="pincode"
                                                        value={formData.pincode}
                                                        onChange={handleChange}
                                                        maxLength="6"
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-800"
                                                        placeholder="6-digit pincode"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        City
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-800"
                                                        placeholder="Enter city"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        State
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-800"
                                                        placeholder="Enter state"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Landmark (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="landmark"
                                                    value={formData.landmark}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-800"
                                                    placeholder="Nearby landmark or reference point"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="mt-10 pt-6 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-4 rounded-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <>
                                                <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                                                <span className="text-lg">Updating Profile...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiCheckCircle className="text-xl" />
                                                <span className="text-lg">Update Profile</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center mt-8">
                    <p className="text-gray-500 text-sm">
                        All fields marked with * are required. Your information is securely stored.
                    </p>
                </div>
            </div>
        </div>
    );
}