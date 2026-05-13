import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useSubmissionStore } from "./useSubmissionStore";

const syncToken = (token) => {
  window.__ZUSTAND_AUTH_TOKEN = token;
};

export const useAuthStore = create((set, get) => ({
  authUser: null,
  accessToken: null,
  isSigninUp: false,
  isLoggingIn: false,
  isCheckingAuth: false,
  isUpdatingProfile: false,

  setAccessToken: (token) => {
    syncToken(token);
    set({ accessToken: token });
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.user });
    } catch (error) {
      syncToken(null);
      set({ authUser: null, accessToken: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigninUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);

      const token = res.data.accessToken;
      syncToken(token);
      set({ authUser: res.data.user, accessToken: token });

      toast.success(res.data.message);
    } catch (error) {
      toast.error("Error signing up");
    } finally {
      set({ isSigninUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

      const token = res.data.accessToken;
      syncToken(token);
      set({ authUser: res.data.user, accessToken: token });

      toast.success(res.data.message);
    } catch (error) {
      toast.error("Error logging in");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      syncToken(null);
      set({ authUser: null, accessToken: null });

      useSubmissionStore.getState().reset();

      toast.success("Logout successful");
    } catch (error) {
      toast.error("Error logging out");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);

      const updatedUser = res.data.user || res.data;

      set({ authUser: updatedUser });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  changePassword: async (data) => {
    try {
      await axiosInstance.put("/auth/change-password", data);
      toast.success("Password changed successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password");
      return false;
    }
  },

  deleteAccount: async () => {
    try {
      await axiosInstance.delete("/auth/delete-account");
      syncToken(null);
      set({ authUser: null, accessToken: null });
      toast.success("Account deleted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete account");
    }
  }
}));