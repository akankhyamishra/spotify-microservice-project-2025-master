import express from "express";
import {
  addToPlaylist,
  loginUser,
  myProfile,
  registerUser,
  toggleFollowArtist,
} from "./controller.js";
import { isAuth } from "./middleware.js";

const router = express.Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/user/me", isAuth, myProfile);
router.post("/song/:id", isAuth, addToPlaylist);
router.post("/artist/follow", isAuth, toggleFollowArtist);

export default router;
