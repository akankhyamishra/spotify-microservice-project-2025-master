import { Request } from "express";
import TryCatch from "./TryCatch.js";
import getBuffer from "./config/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "./config/db.js";
import { redisClient } from "./index.js";
import { publishInvalidation } from "./config/rabbitmq.js";

interface AuthencatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

async function delCache(keys: string[]) {
  if (redisClient.isReady) {
    for (const key of keys) {
      await redisClient.del(key);
    }
  }
  publishInvalidation(keys);
}

export const addAlbum = TryCatch(async (req: AuthencatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(401).json({ message: "You are not admin" });
    return;
  }

  const { title, description } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: "No file to upload" });
    return;
  }

  const fileBuffer = getBuffer(file);
  if (!fileBuffer || !fileBuffer.content) {
    res.status(500).json({ message: "Failed to generate file buffer" });
    return;
  }

  const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
    folder: "albums",
  });

  const result = await sql`
    INSERT INTO albums (title, description, thumbnail)
    VALUES (${title}, ${description}, ${cloud.secure_url})
    RETURNING *
  `;

  await delCache(["albums"]);

  res.json({ message: "Album Created", album: result[0] });
});

export const addSong = TryCatch(async (req: AuthencatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(401).json({ message: "You are not admin" });
    return;
  }

  const { title, description, album } = req.body;
  const isAlbum = await sql`SELECT * FROM albums WHERE id = ${album}`;

  if (isAlbum.length === 0) {
    res.status(404).json({ message: "No album with this id" });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "No file to upload" });
    return;
  }

  const fileBuffer = getBuffer(file);
  if (!fileBuffer || !fileBuffer.content) {
    res.status(500).json({ message: "Failed to generate file buffer" });
    return;
  }

  const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
    folder: "songs",
    resource_type: "video",
  });

  await sql`
    INSERT INTO songs (title, description, audio, album_id)
    VALUES (${title}, ${description}, ${cloud.secure_url}, ${album})
  `;

  await delCache(["songs", `album_songs_${album}`]);

  res.json({ message: "Song Added" });
});

export const addThumbnail = TryCatch(async (req: AuthencatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(401).json({ message: "You are not admin" });
    return;
  }

  const song = await sql`SELECT * FROM songs WHERE id = ${req.params.id}`;
  if (song.length === 0) {
    res.status(404).json({ message: "No song with this id" });
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "No file to upload" });
    return;
  }

  const fileBuffer = getBuffer(file);
  if (!fileBuffer || !fileBuffer.content) {
    res.status(500).json({ message: "Failed to generate file buffer" });
    return;
  }

  const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content);

  await sql`
    UPDATE songs SET thumbnail = ${cloud.secure_url}
    WHERE id = ${req.params.id}
  `;

  await delCache(["songs", `album_songs_${song[0].album_id}`]);

  res.json({ message: "Thumbnail added" });
});

export const deleteAlbum = TryCatch(async (req: AuthencatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(401).json({ message: "You are not admin" });
    return;
  }

  const { id } = req.params;
  const isAlbum = await sql`SELECT * FROM albums WHERE id = ${id}`;

  if (isAlbum.length === 0) {
    res.status(404).json({ message: "No album with this id" });
    return;
  }

  await sql`DELETE FROM songs WHERE album_id = ${id}`;
  await sql`DELETE FROM albums WHERE id = ${id}`;

  await delCache(["albums", "songs", `album_songs_${id}`]);

  res.json({ message: "Album deleted successfully" });
});

export const deleteSong = TryCatch(async (req: AuthencatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(401).json({ message: "You are not admin" });
    return;
  }

  const { id } = req.params;
  const song = await sql`SELECT * FROM songs WHERE id = ${id}`;

  if (song.length === 0) {
    res.status(404).json({ message: "No song with this id" });
    return;
  }

  await sql`DELETE FROM songs WHERE id = ${id}`;

  await delCache(["songs", `album_songs_${song[0].album_id}`]);

  res.json({ message: "Song deleted successfully" });
});
