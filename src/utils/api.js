import axios from "axios";
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api", // backend URL
  withCredentials: true,                 // cookies ke liye
});

export default API;
