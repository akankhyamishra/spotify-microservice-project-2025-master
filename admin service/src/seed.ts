import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const sql = neon(process.env.DB_URL!);

const queries = [
  "pop hits 2024",
  "hip hop hits",
  "rock classics",
  "jazz",
  "bollywood 2024",
  "rap hits",
  "indie pop",
  "rnb soul",
  "electronic dance",
  "country music",
  "latin hits",
  "k-pop",
  "metal rock",
  "reggae",
  "taylor swift",
  "drake",
  "ed sheeran",
  "the weeknd",
  "ariana grande",
  "eminem",
];

interface ItunesTrack {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  trackName: string;
  previewUrl: string;
}

async function fetchTracks(query: string): Promise<ItunesTrack[]> {
  const { data } = await axios.get("https://itunes.apple.com/search", {
    params: { term: query, entity: "musicTrack", limit: 50, media: "music" },
  });
  return (data.results as any[]).filter(
    (t) => t.previewUrl && t.artworkUrl100 && t.collectionName && t.trackName
  );
}

async function main() {
  console.log("Seeding database from iTunes...\n");
  let totalAlbums = 0;
  let totalSongs = 0;

  for (const query of queries) {
    process.stdout.write(`Fetching "${query}"... `);
    try {
      const tracks = await fetchTracks(query);

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

      let querySongs = 0;
      for (const [, albumData] of albumMap.entries()) {
        const existing =
          await sql`SELECT id FROM albums WHERE title = ${albumData.name} LIMIT 1`;

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
          totalAlbums++;
        }

        for (const track of albumData.tracks) {
          const thumb = track.artworkUrl100.replace("100x100bb", "300x300bb");
          await sql`
            INSERT INTO songs (title, description, thumbnail, audio, album_id)
            VALUES (${track.trackName}, ${track.artistName}, ${thumb}, ${track.previewUrl}, ${albumId})
          `;
          querySongs++;
          totalSongs++;
        }
      }

      console.log(`${querySongs} songs`);

      // Respect iTunes rate limit
      await new Promise((r) => setTimeout(r, 400));
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  console.log(
    `\nDone! Inserted ${totalAlbums} albums and ${totalSongs} songs into Neon.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
