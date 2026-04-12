import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useSubmissionStore } from "./useSubmissionStore";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigninUp: false,
  isLoggingIn: false,
  isCheckingAuth: false,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      console.log("checkauth response", res.data);

      set({ authUser: res.data.user });
    } catch (error) {
      console.log("❌ Error checking auth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigninUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);

      set({ authUser: res.data.user });

      toast.success(res.data.message);
    } catch (error) {
      console.log("Error signing up", error);
      toast.error("Error signing up");
    } finally {
      set({ isSigninUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

      set({ authUser: res.data.user });

      toast.success(res.data.message);
    } catch (error) {
      console.log("Error logging in", error);
      toast.error("Error logging in");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });

      useSubmissionStore.getState().reset();

      toast.success("Logout successful");
    } catch (error) {
      console.log("Error logging out", error);
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
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await axiosInstance.delete("/auth/delete-account");
      set({ authUser: null });
      toast.success("Account deleted");
    } catch (error) {
      toast.error("Failed to delete account");
    }
  }
}));