"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    MapPin, Package, LogIn, User, Car, PlusCircle, Menu,
    ClipboardList, Settings, LogOut, Edit3, List, Home,
    Map, Calendar, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "@/components/UserProfile";
import API from "@/utils/api";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { data, loading, error } = UserProfile();

    // Scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/verify")) {
        return null;
    }

    const isOwner = data?.role === "owner";

    const handleLogout = async () => {
        try {
            // ✅ Method 1: Using your existing API instance
            await API.post('/auth/logout', {}, {
                withCredentials: true // This is important for cookies
            });

        } catch (error) {
            // ✅ Ignore errors - just log and continue
            console.log("Logout API call completed (proceeding with cleanup)");
        }

        // ✅ ALWAYS do client-side cleanup
        localStorage.clear();
        sessionStorage.clear();

        // Clear cookies client-side
        document.cookie.split(';').forEach(cookie => {
            const cookieName = cookie.split('=')[0].trim();
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        // Close profile drawer
        if (setProfileOpen) setProfileOpen(false);

        // Redirect to login
        window.location.href = '/login';
    };

    // Check if link is active
    const isActive = (path) => {
        if (path === "/") return pathname === "/";
        return pathname.startsWith(path);
    };

    const navLinks = [
        { href: "/", label: "Home", icon: <Home size={18} /> },
        { href: "/vehicles", label: "Vehicles", icon: <Car size={18} /> },
        { href: "/dashboard", label: "Map View", icon: <Map size={18} /> },
        ...(!isOwner ? [{ href: "/your-bookings", label: "Bookings", icon: <Calendar size={18} /> }] : [])
    ];

    return (
        <>
            {/* Navbar */}
            <nav className={`sticky top-0 left-0 w-full z-[1000] transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'} border-b border-gray-200/50`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
                    {/* Left: Logo with better styling */}
                    <Link href="/" className="flex items-center gap-2 group hover:scale-105 transition-transform duration-300">
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg transform group-hover:rotate-12 transition-all duration-300 shadow-md"></div>
                            <Car className="relative z-10 w-6 h-6 text-white m-1 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <span className="text-xl font-bold text-orange-600">
                            RentMe
                        </span>
                    </Link>

                    {/* Center: Navigation Links */}
                    <div className="hidden md:flex items-center gap-1 bg-gray-100/80 rounded-full p-1 backdrop-blur-sm">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${isActive(link.href)
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                                    : 'text-gray-700 hover:bg-white hover:text-orange-500'
                                    }`}
                            >
                                <span className={`transition-transform duration-300 ${isActive(link.href) ? 'scale-110' : ''}`}>
                                    {link.icon}
                                </span>
                                <span className="font-medium">{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Right: User Actions */}
                    <div className="flex items-center gap-4">
                        {data && (
                            <>
                                {/* Owner Panel Dropdown */}
                                {isOwner && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpen(!open)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${open
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-orange-500'
                                                }`}
                                        >
                                            <Shield size={18} />
                                            <span className="font-medium">Owner Panel</span>
                                            <motion.div
                                                animate={{ rotate: open ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                ▼
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {open && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute right-0 mt-2 bg-white shadow-xl rounded-xl border border-gray-200 p-2 w-48 z-50"
                                                >
                                                    <Link
                                                        href="/owner/booking-order"
                                                        onClick={() => setOpen(false)}
                                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 text-gray-500"
                                                    >
                                                        <ClipboardList size={18} />
                                                        <span>Booking Orders</span>
                                                    </Link>
                                                    <Link
                                                        href="/owner/my-vehicles"
                                                        onClick={() => setOpen(false)}
                                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 text-gray-500"
                                                    >
                                                        <Car size={18} />
                                                        <span>My Vehicles</span>
                                                    </Link>
                                                    <Link
                                                        href="/owner/add-vehicle"
                                                        onClick={() => setOpen(false)}
                                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 text-gray-500"
                                                    >
                                                        <PlusCircle size={18} />
                                                        <span>Add Vehicle</span>
                                                    </Link>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Profile Button with Avatar - Simple Orange Theme */}
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 hover:bg-orange-100 transition-all duration-300 group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                                            {data?.name?.charAt(0).toUpperCase() || <User size={18} />}
                                        </div>
                                        <span className="font-medium text-gray-700 group-hover:text-orange-600">
                                            {data?.name?.split(' ')[0] || 'Profile'}
                                        </span>
                                    </button>

                                    {/* Active indicator */}
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden border-t border-gray-100 mt-2 pt-2">
                    <div className="flex justify-around items-center px-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${isActive(link.href)
                                    ? 'text-orange-500 bg-orange-50'
                                    : 'text-gray-600 hover:text-orange-500'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${isActive(link.href) ? 'bg-orange-100' : ''}`}>
                                    {link.icon}
                                </div>
                                <span className="text-xs mt-1 font-medium">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Profile Drawer - Improved */}
            <AnimatePresence>
                {profileOpen && (
                    <>
                        {/* Overlay with blur */}
                        <motion.div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setProfileOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            className="fixed top-0 right-0 w-80 h-full bg-gradient-to-b from-white to-gray-50 shadow-2xl z-[1000] flex flex-col"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            {/* Drawer Header with User Info */}
                            <div className=" p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold">Your Profile</h3>
                                        <p className="text-white/90 text-sm">Manage your account</p>
                                    </div>
                                    <button
                                        onClick={() => setProfileOpen(false)}
                                        className="text-white hover:text-orange-100 text-lg p-1 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* User Info */}
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center text-2xl font-bold">
                                        {data?.name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">{data?.name || "User"}</h4>
                                        <p className="text-white/90 text-sm">{data?.email || "user@example.com"}</p>
                                        <span className="text-xs bg-white/30 px-2 py-1 rounded-full mt-1">
                                            {isOwner ? "Owner" : "Customer"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Menu Items */}
                            <div className="flex-1 p-5 space-y-2 overflow-y-auto">
                                <Link
                                    href="/editprofile"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50 hover:text-orange-600 transition-all duration-300 group"
                                >
                                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-orange-100 group-hover:text-orange-600">
                                        <Edit3 size={18} />
                                    </div>
                                    <span className="font-medium">Update Profile</span>
                                </Link>

                                <Link
                                    href="/orders"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50 hover:text-orange-600 transition-all duration-300 group"
                                >
                                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-orange-100 group-hover:text-orange-600">
                                        <List size={18} />
                                    </div>
                                    <span className="font-medium">Your Orders</span>
                                </Link>

                                <Link
                                    href="/settings"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50 hover:text-orange-600 transition-all duration-300 group"
                                >
                                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-orange-100 group-hover:text-orange-600">
                                        <Settings size={18} />
                                    </div>
                                    <span className="font-medium">Settings</span>
                                </Link>

                                <div className="pt-4 mt-4 border-t border-gray-200">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center justify-center gap-3 w-full p-3 rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-300 group"
                                    >
                                        <LogOut size={18} />
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t border-gray-200 text-center">
                                <p className="text-gray-500 text-sm">
                                    © 2024 RentMe. All rights reserved.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
