import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useSubmissionStore } from "./useSubmissionStore";



export const useExecutionStore = create((set)=>({
    isExecuting:false,
    executionResult: null,

       executeCode:async ( source_code, language_id, stdin, expected_outputs, problemId)=>{
        try {
            set({isExecuting:true});
            console.log("Submission:",JSON.stringify({
                source_code,
                language_id,
                stdin,
                expected_outputs,
                problemId
            }));
            const res = await axiosInstance.post("/execute-code" , { source_code, language_id, stdin, expected_outputs, problemId });

            set({ executionResult:res.data.submission });

            useSubmissionStore.getState().setSubmission(res.data.submission);
      
            toast.success(res.data.message);
        } catch (error) {
            console.log("Error executing code",error);
            toast.error("Error executing code");
        }
        finally{
            set({isExecuting:false});
        }
    }
}))