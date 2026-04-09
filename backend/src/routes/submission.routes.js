import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createSubmission, getAllSubmission , getAllTheSubmissionsForProblem , getSubmissionsForProblem } from "../controllers/submission.controller.js";


const submissionRoutes = express.Router()

submissionRoutes.post("/create", authMiddleware, createSubmission);

submissionRoutes.get("/get-all-submissions" , authMiddleware , getAllSubmission);
submissionRoutes.get("/get-submission/:problemId" , authMiddleware , getSubmissionsForProblem)

submissionRoutes.get("/get-submissions-count/:problemId" , authMiddleware , getAllTheSubmissionsForProblem);

export default submissionRoutes;