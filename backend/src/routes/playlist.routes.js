import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { addProblemToPlaylist, createPlayList, deletePlayList, getPlayAllListDetails, getPlayListDetails, removeProblemFromPlaylist } from "../controllers/playlist.controller.js";

const router = express.Router();

router.get("/" , authMiddleware , getPlayAllListDetails)

router.get("/:playlistId" , authMiddleware , getPlayListDetails)

router.post("/create-playlist" ,authMiddleware ,  createPlayList)



router.post('/:playlistId/add-problem' , authMiddleware , addProblemToPlaylist)

router.delete("/:playlistId" , authMiddleware , deletePlayList)

router.delete("/:playlistId/remove-problem" , authMiddleware , removeProblemFromPlaylist)


export default router;