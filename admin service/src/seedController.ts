import { Request } from "express";
import TryCatch from "./TryCatch.js";
import { sql } from "./config/db.js";
import { redisClient } from "./index.js";
import { publishInvalidation } from "./config/rabbitmq.js";
import axios from "axios";

interface AuthencatedRequest extends Request {
  user?: { _id: string; role: string };
}

interface ItunesTrack {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  trackName: string;
  previewUrl: string;
}

export const seedFromItunes = TryCatch(async (req: AuthencatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(401).json({ message: "You are not admin" });
    return;
  }

  const { query = "pop hits", limit = 20 } = req.body;

  const { data } = await axios.get("https://itunes.apple.com/search", {
    params: {
      term: query,
      entity: "musicTrack",
      limit: Math.min(Number(limit), 50),
      media: "music",
    },
  });

  const tracks: ItunesTrack[] = (data.results as any[]).filter(
    (t: any) => t.previewUrl && t.artworkUrl100 && t.collectionName && t.trackName
  );

  if (tracks.length === 0) {
    res.status(404).json({ message: "No tracks found. Try a different search term." });
    return;
  }

  // Group by iTunes collectionId so tracks from the same album share one DB row
  const albumMap = new Map<
    number,
    { name: string; artist: string; artwork: string; tracks: ItunesTrack[] }
  >();

  for (const track of tracks) {
    if (!albumMap.has(track.collectionId)) {
      albumMap.set(track.collectionId, {
        name: track.collectionName,
        artist: track.artistName,
        artwork: track.artworkUrl100.replace("100x100bb", "600x600bb"),
        tracks: [],
      });
    }
    albumMap.get(track.collectionId)!.tracks.push(track);
  }

  let albumsCreated = 0;
  let songsCreated = 0;

  for (const [, albumData] of albumMap.entries()) {
    const existing = await sql`SELECT id FROM albums WHERE title = ${albumData.name} LIMIT 1`;

    let albumId: number;
    if (existing.length > 0) {
      albumId = existing[0].id as number;
    } else {
      const created = await sql`
        INSERT INTO albums (title, description, thumbnail)
        VALUES (${albumData.name}, ${albumData.artist}, ${albumData.artwork})
        RETURNING id
      `;
      albumId = created[0].id as number;
      albumsCreated++;
    }

    for (const track of albumData.tracks) {
      const thumbnail = track.artworkUrl100.replace("100x100bb", "300x300bb");
      await sql`
        INSERT INTO songs (title, description, thumbnail, audio, album_id)
        VALUES (${track.trackName}, ${track.artistName}, ${thumbnail}, ${track.previewUrl}, ${albumId})
      `;
      songsCreated++;
    }
  }

  if (redisClient.isReady) {
    await redisClient.del("albums");
    await redisClient.del("songs");
  }
  publishInvalidation(["albums", "songs"]);

  res.json({
    message: `Imported ${songsCreated} songs across ${albumsCreated} new albums`,
    albumsCreated,
    songsCreated,
  });
});
