import express from "express";
import uploadFile, { isAuth } from "./middleware.js";
import {
  addAlbum,
  addSong,
  addThumbnail,
  deleteAlbum,
  deleteSong,
} from "./controller.js";
import { seedFromItunes } from "./seedController.js";

const router = express.Router();

router.post("/album/new", isAuth, uploadFile, addAlbum);
router.post("/song/new", isAuth, uploadFile, addSong);
router.post("/song/:id", isAuth, uploadFile, addThumbnail);
router.delete("/album/:id", isAuth, deleteAlbum);
router.delete("/song/:id", isAuth, deleteSong);
router.post("/seed", isAuth, seedFromItunes);

export default router;
