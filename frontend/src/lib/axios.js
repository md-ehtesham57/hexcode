import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:3000/api/v1"
      : "/api/v1",
  withCredentials: true, //REQUIRED globally
});

// Attach token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Access token expired → attempting refresh");

        //USE RAW AXIOS (NOT axiosInstance)
        const res = await axios.post(
          import.meta.env.MODE === "development"
            ? "http://localhost:3000/api/v1/auth/refresh"
            : "/api/v1/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;

        localStorage.setItem("token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        console.log("Token refreshed → retrying request");

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.log("Refresh failed → logging out");

        localStorage.removeItem("token");
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);