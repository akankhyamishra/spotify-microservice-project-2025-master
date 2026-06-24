import express from "express";
import {
  addToPlaylist,
  loginUser,
  myProfile,
  registerUser,
  toggleFollowArtist,
  logListen,
  getListenHistory,
  getListenStats,
  toggleSaveAlbum,
  getSavedAlbums,
  getMyPlaylists,
  createPlaylist,
  deletePlaylist,
  renamePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "./controller.js";
import { isAuth } from "./middleware.js";

const router = express.Router();

// Auth
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/user/me", isAuth, myProfile);

// Liked songs (playlist field on user)
router.post("/song/:id", isAuth, addToPlaylist);

// Artists
router.post("/artist/follow", isAuth, toggleFollowArtist);

// Listening history
router.post("/listen", isAuth, logListen);
router.get("/listen/history", isAuth, getListenHistory);
router.get("/listen/stats", isAuth, getListenStats);

// Saved albums
router.post("/album/save", isAuth, toggleSaveAlbum);
router.get("/album/saved", isAuth, getSavedAlbums);

// Custom playlists
router.get("/playlists", isAuth, getMyPlaylists);
router.post("/playlists", isAuth, createPlaylist);
router.delete("/playlists/:id", isAuth, deletePlaylist);
router.put("/playlists/:id/rename", isAuth, renamePlaylist);
router.post("/playlists/:id/songs", isAuth, addSongToPlaylist);
router.delete("/playlists/:id/songs/:songId", isAuth, removeSongFromPlaylist);

export default router;
