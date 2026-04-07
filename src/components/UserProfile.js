"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";

export const UserProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          setLoading(false);
          setData(null);
          return; // Token nahi hai to API call mat karo
        }

        const res = await API.get("/auth/user-profile");
  
        if (res.data?.profile || res.data) {
          setData(res.data?.profile || res.data);
        } else {
          // Invalid response - clear token
          localStorage.removeItem("token");
          setData(null);
        }

      } catch (err) {
        console.error("Error fetching user profile:", err);
        
        // ✅ 4. Handle 401 Unauthorized (token expired/invalid)
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setData(null);
          setError("Session expired. Please login again.");
        } else {
          setError(err.response?.data?.message || "Failed to fetch profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { data, loading, error };
};