import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useProblemStore } from "./useProblemStore";
import { id } from "zod/v4/locales";
import { usePlaylistStore } from "./usePlaylistStore";



export const useActions = create((set)=>({
    isDeletingProblem:false,

    onDeleteProblem:async(id)=>{
        try {
             set({ isDeletingProblem: true });
            const res = await axiosInstance.delete(`/problems/delete-problem/${id}`);

            useProblemStore.setState((state) => ({
                problems: state.problems.filter((p) => p.id !== id && p._id !== id)
            }));

            const playlistState = usePlaylistStore.getState();

            if (playlistState.currentPlaylist) {
                usePlaylistStore.setState({
                    currentPlaylist: {
                        ...playlistState.currentPlaylist,
                        problems: playlistState.currentPlaylist.problems.filter(
                            (item) => item.problemId !== id && item.problem?.id !== id
                        )
                    }
                });
            }
            
            toast.success(res.data.message);
        } catch (error) {
             console.log("Error deleting problem", error);
            toast.error("Error deleting problem");
        }
        finally{
            set({isDeletingProblem:false})
        }
    }
}))