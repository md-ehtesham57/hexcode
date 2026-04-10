import axios from "axios";

// 1. Create Instance
export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:3000/api/v1"
      : "/api/v1",
  withCredentials: true, // Required for HttpOnly Refresh Cookies
});

// 2. Variables for Refresh Logic
let isRefreshing = false;
let failedQueue = [];

// Helper to handle the request queue
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 3. Request Interceptor: Attach Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Response Interceptor: Handle 401 & Silent Refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("Access token expired. Attempting silent refresh...");

        // Use raw axios to avoid interceptor loops
        const res = await axios.post(
          import.meta.env.MODE === "development"
            ? "http://localhost:3000/api/v1/auth/refresh"
            : "/api/v1/auth/refresh",
          {},
          { withCredentials: true }
        );

        const { accessToken } = res.data;
        localStorage.setItem("token", accessToken);

        // Update headers for future requests
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        console.log("Token refreshed. Retrying original request.");
        processQueue(null, accessToken);
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh failed. Session invalid.");
        processQueue(refreshError, null);
        
        // Clean up
        localStorage.removeItem("token");
        
        // Only redirect if not already on login to avoid loops
        if (!window.location.pathname.includes("/login")) {
          window.location.replace("/login");
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);