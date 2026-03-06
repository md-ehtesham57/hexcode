import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import { createProblem, deleteProblem, getAllProblems, getProblemById, updateProblemById, getAllProblemsSolvedByUser} from "../controllers/problem.controller.js"

const problemRoutes = express.Router();

problemRoutes.post("/create-problem" , authMiddleware , checkAdmin , createProblem )

problemRoutes.get("/get-all-problem" , authMiddleware , getAllProblems)

problemRoutes.get("/get-problem/:id" , authMiddleware , getProblemById);

problemRoutes.put("/update-problem/:id" , authMiddleware , checkAdmin , updateProblemById);

problemRoutes.delete("/delete-problem/:id" , authMiddleware , checkAdmin , deleteProblem);

problemRoutes.get("/get-solved-problems" , authMiddleware , getAllProblemsSolvedByUser);


export default problemRoutes;