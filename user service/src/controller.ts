import { AuthenticatedRequest } from "./middleware.js";
import { User, IPlaylistSong } from "./model.js";
import TryCatch from "./TryCatch.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cacheGet, cacheSet, cacheDel } from "./redis.js";
import { publishEvent } from "./events.js";

// ─── Listening history ────────────────────────────────────────────────────────

export const logListen = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  const { songId, songTitle, artistName, albumName, thumbnail, platform, listenedFor } =
    req.body as {
      songId: string; songTitle: string; artistName: string;
      albumName: string; thumbnail: string; platform: string; listenedFor: number;
    };

  const user = await User.findById(userId);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  // Keep history capped at 200 entries (drop oldest)
  if (user.listeningHistory.length >= 200) {
    user.listeningHistory.splice(0, user.listeningHistory.length - 199);
  }

  user.listeningHistory.push({
    songId, songTitle, artistName, albumName, thumbnail,
    playedAt: new Date(),
    platform: platform || "web",
    listenedFor: listenedFor || 0,
  });

  await user.save();
  res.json({ message: "Listen logged" });
});

export const getListenHistory = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.user?._id).select("listeningHistory");
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  // Return newest first
  res.json([...user.listeningHistory].reverse());
});

export const getListenStats = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.user?._id).select("listeningHistory");
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  const history = user.listeningHistory;
  const totalTime = history.reduce((sum, e) => sum + (e.listenedFor || 0), 0);

  // Most played artists
  const artistCount: Record<string, number> = {};
  history.forEach((e) => {
    if (e.artistName) artistCount[e.artistName] = (artistCount[e.artistName] || 0) + 1;
  });
  const topArtists = Object.entries(artistCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Hour distribution (when do they listen?)
  const hourDist: number[] = Array(24).fill(0);
  history.forEach((e) => {
    if (e.playedAt) hourDist[new Date(e.playedAt).getHours()]++;
  });

  res.json({ totalSongsPlayed: history.length, totalListenTime: totalTime, topArtists, hourDist });
});

// ─── Saved albums ─────────────────────────────────────────────────────────────

export const toggleSaveAlbum = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  const { albumId, albumTitle, artistName, thumbnail } = req.body as {
    albumId: string; albumTitle: string; artistName: string; thumbnail: string;
  };

  const idx = user.savedAlbums.findIndex((a) => a.albumId === albumId);
  if (idx > -1) {
    user.savedAlbums.splice(idx, 1);
    await user.save();
    res.json({ message: "Album removed from library", saved: false });
  } else {
    user.savedAlbums.push({ albumId, albumTitle, artistName, thumbnail, savedAt: new Date() });
    await user.save();
    res.json({ message: "Album saved to library", saved: true });
  }
});

export const getSavedAlbums = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.user?._id).select("savedAlbums");
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  res.json([...user.savedAlbums].reverse());
});

// ─── Custom playlists ─────────────────────────────────────────────────────────

const PLAYLIST_CACHE_KEY = (uid: string) => `user:playlists:${uid}`;

export const getMyPlaylists = TryCatch(async (req: AuthenticatedRequest, res) => {
  const uid = req.user?._id?.toString()!;
  const cached = await cacheGet(PLAYLIST_CACHE_KEY(uid));
  if (cached) { res.json(JSON.parse(cached)); return; }

  const user = await User.findById(uid).select("customPlaylists");
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  const result = [...user.customPlaylists].reverse();
  await cacheSet(PLAYLIST_CACHE_KEY(uid), JSON.stringify(result), 300);
  res.json(result);
});

export const createPlaylist = TryCatch(async (req: AuthenticatedRequest, res) => {
  const uid = req.user?._id?.toString()!;
  const { name } = req.body as { name: string };
  if (!name?.trim()) { res.status(400).json({ message: "Playlist name required" }); return; }

  const user = await User.findById(uid);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  user.customPlaylists.push({ name: name.trim(), songs: [], createdAt: new Date() } as any);
  await user.save();
  await cacheDel(PLAYLIST_CACHE_KEY(uid));

  const created = user.customPlaylists[user.customPlaylists.length - 1];
  await publishEvent("user.playlist.created", { userId: uid, playlistId: created._id, name });
  res.status(201).json(created);
});

export const deletePlaylist = TryCatch(async (req: AuthenticatedRequest, res) => {
  const uid = req.user?._id?.toString()!;
  const { id } = req.params;

  const user = await User.findById(uid);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  const idx = user.customPlaylists.findIndex((p) => p._id.toString() === id);
  if (idx === -1) { res.status(404).json({ message: "Playlist not found" }); return; }

  user.customPlaylists.splice(idx, 1);
  await user.save();
  await cacheDel(PLAYLIST_CACHE_KEY(uid));
  await publishEvent("user.playlist.deleted", { userId: uid, playlistId: id });
  res.json({ message: "Playlist deleted" });
});

export const renamePlaylist = TryCatch(async (req: AuthenticatedRequest, res) => {
  const uid = req.user?._id?.toString()!;
  const { id } = req.params;
  const { name } = req.body as { name: string };

  const user = await User.findById(uid);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  const pl = user.customPlaylists.find((p) => p._id.toString() === id);
  if (!pl) { res.status(404).json({ message: "Playlist not found" }); return; }

  pl.name = name.trim();
  await user.save();
  await cacheDel(PLAYLIST_CACHE_KEY(uid));
  res.json(pl);
});

export const addSongToPlaylist = TryCatch(async (req: AuthenticatedRequest, res) => {
  const uid = req.user?._id?.toString()!;
  const { id } = req.params;
  const song = req.body as IPlaylistSong;

  const user = await User.findById(uid);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  const pl = user.customPlaylists.find((p) => p._id.toString() === id);
  if (!pl) { res.status(404).json({ message: "Playlist not found" }); return; }

  // Avoid duplicates
  if (pl.songs.some((s) => s.id === song.id)) {
    res.json({ message: "Song already in playlist" }); return;
  }
  pl.songs.push(song);
  await user.save();
  await cacheDel(PLAYLIST_CACHE_KEY(uid));
  res.json({ message: "Song added", playlist: pl });
});

export const removeSongFromPlaylist = TryCatch(async (req: AuthenticatedRequest, res) => {
  const uid = req.user?._id?.toString()!;
  const { id, songId } = req.params;

  const user = await User.findById(uid);
  if (!user) { res.status(404).json({ message: "User not found" }); return; }

  const pl = user.customPlaylists.find((p) => p._id.toString() === id);
  if (!pl) { res.status(404).json({ message: "Playlist not found" }); return; }

  pl.songs = pl.songs.filter((s) => s.id !== songId);
  await user.save();
  await cacheDel(PLAYLIST_CACHE_KEY(uid));
  res.json({ message: "Song removed", playlist: pl });
});

export const registerUser = TryCatch(async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({ email });

  if (user) {
    res.status(400).json({
      message: "User Already exists",
    });

    return;
  }

  const hashPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashPassword,
  });

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC as string, {
    expiresIn: "7d",
  });

  res.status(201).json({
    message: "User Registered",
    user,
    token,
  });
});

export const loginUser = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({
      message: "User not exists",
    });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(400).json({
      message: "Invalid Password",
    });
    return;
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC as string, {
    expiresIn: "7d",
  });

  res.status(200).json({
    message: "Logged IN",
    user,
    token,
  });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  res.json(user);
});

export const toggleFollowArtist = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { name } = req.body as { name: string };

    if (!name) {
      res.status(400).json({ message: "Artist name required" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.followedArtists) user.followedArtists = [];

    const idx = user.followedArtists.indexOf(name);
    if (idx > -1) {
      user.followedArtists.splice(idx, 1);
      await user.save();
      res.json({ message: "Unfollowed artist" });
    } else {
      user.followedArtists.push(name);
      await user.save();
      res.json({ message: "Now following " + name });
    }
  }
);

export const addToPlaylist = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        message: "NO user with this id",
      });
      return;
    }

    if (user?.playlist.includes(req.params.id)) {
      const index = user.playlist.indexOf(req.params.id);

      user.playlist.splice(index, 1);

      await user.save();

      res.json({
        message: " Removed from playlist",
      });
      return;
    }

    user.playlist.push(req.params.id);

    await user.save();

    res.json({
      message: "Added to PlayList",
    });
  }
);
