import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSubmissionStore = create((set, get) => ({
  isLoading: false,
  submissions: [],
  problemSubmissions: [],
  submission: null,
  submissionCount: null,

  setSubmission: (data) => set({ submission: data }),

  getAllSubmissions: async () => {
    try {
      setSubmission: (data) => set({ submission: data });

      set({ isLoading: true });
      const res = await axiosInstance.get("/submission/get-all-submissions");

      set({ submissions: res.data.submissions });

      toast.success(res.data.message);
    } catch (error) {
      console.log("Error getting all submissions", error);
      toast.error("Error getting all submissions");
    } finally {
      set({ isLoading: false });
    }
  },

  getSubmissionForProblem: async (problemId) => {
    try {
      set({ isLoading: true });

      const res = await axiosInstance.get(
        `/submission/get-submission/${problemId}`
      );

      set({
        problemSubmissions: res.data.submissions || [],
        submission: res.data.submission || null
      })



    } catch (error) {
      console.log("Error getting submissions for problem", error);

      toast.error("Error getting submissions for problem");

    } finally {
      set({ isLoading: false });
    }
  },

  getSubmissionCountForProblem: async (problemId) => {
    try {
      const res = await axiosInstance.get(
        `/submission/get-submissions-count/${problemId}`
      );

      set({ submissionCount: res.data.count });
    } catch (error) {
      console.log("Error getting submission count for problem", error);
      toast.error("Error getting submission count for problem");
    }
  },

  reset: () => set({ submissions: [], submission: null, submissionCount: null })
}));