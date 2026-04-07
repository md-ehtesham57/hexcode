import axios from "axios";
import { config } from "zod";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api/v1" : "/api/v1",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("TOKEN FROM STORAGE:" , token); //debug

  if(token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});