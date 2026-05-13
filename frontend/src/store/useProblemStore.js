import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useProblemStore = create((set, get) => ({
  problems: [],
  problem: null,
  solvedProblems: [],
  isProblemsLoading: false,
  isProblemLoading: false,
  isDeletingProblem: false,

  getAllProblems: async () => {
    try {
      set({ isProblemsLoading: true });

      const res = await axiosInstance.get("/problems/get-all-problems");

      set({ problems: res.data.problems });
    } catch (error) {
      console.log("Error getting all problems", error);
      toast.error("Error in getting problems");
    } finally {
      set({ isProblemsLoading: false });
    }
  },

  getProblemById: async (id) => {
    const { isProblemLoading, problem } = get();

    if (isProblemLoading) return;

    // Standard PostgreSQL IDs are usually strings or numbers
    if (problem?.id === id) {
      set({ isProblemLoading: false });
      return;
    }

    set({ isProblemLoading: true });
    try {
      const res = await axiosInstance.get(`/problems/get-problem/${id}`);

      // Ensure we clear state if the backend sends an empty success 
      if (!res.data.problem) {
        set({ problem: null });
        toast.error("Problem not found in PostgreSQL database.");
      } else {
        set({ problem: res.data.problem });
      }
    } catch (error) {
      set({ problem: null });
      if (error.response?.status === 404) {
        toast.error("404: This challenge no longer exists.");
      }
      console.error("Prisma Fetch Error:", error);
    } finally {
      set({ isProblemLoading: false });
    }
  },

  getSolvedProblemByUser: async () => {
    try {
      const res = await axiosInstance.get("/problems/get-solved-problem");

      set({ solvedProblems: res.data.problems });
    } catch (error) {
      console.log("Error getting solved problems", error);
      toast.error("Error getting solved problems");
    }
  },

updateProblemById: async (id, updatedData) => {
  set({ isLoading: true });
  try {
    // This matches your backend endpoint: router.put("/update/:id", ...)
    const res = await axiosInstance.put(`/problems/update-problem${id}`, updatedData);

    if (res.data.success) {
      // Update local state so the UI reflects changes without a full refresh
      set((state) => ({
        problems: state.problems.map((p) => 
          (p.id === id || p._id === id) ? res.data.problem : p
        ),
        isLoading: false,
      }));
      return true;
    }
    return false;
  } catch (error) {
    set({ isLoading: false });
    console.error("Store Update Error:", error);
    // Return false so the component knows the update/validation failed
    return false; 
  }
},

}));