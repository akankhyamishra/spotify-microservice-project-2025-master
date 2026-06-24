import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { Song, useSongData } from "../context/SongContext";
import { useUserData } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  FaSearch, FaPlay, FaHeart, FaRegHeart, FaUserAlt, FaSpinner,
} from "react-icons/fa";
import axios from "axios";

const GENRE_TILES = [
  { name: "Pop", color: "#e91e8c" },
  { name: "Hip-Hop", color: "#ff6437" },
  { name: "Rock", color: "#8c67ab" },
  { name: "Jazz", color: "#1e3264" },
  { name: "R&B", color: "#477d95" },
  { name: "Electronic", color: "#0d73ec" },
  { name: "Country", color: "#ba5d07" },
  { name: "Latin", color: "#dc148c" },
  { name: "Bollywood", color: "#e8115b" },
  { name: "K-Pop", color: "#148a08" },
  { name: "Metal", color: "#503750" },
  { name: "Reggae", color: "#006450" },
];

interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
  kind: string;
}

interface ItunesAlbum {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
}

const Search = () => {
  const [query, setQuery] = useState("");
  const [itunesTracks, setItunesTracks] = useState<ItunesTrack[]>([]);
  const [itunesAlbums, setItunesAlbums] = useState<ItunesAlbum[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { songs, albums, setSelectedSong, setIsPlaying, addExternalSong } = useSongData();
  const { user, followArtist, addToPlaylist, isAuth } = useUserData();
  const navigate = useNavigate();

  // Local DB results
  const q = query.toLowerCase().trim();
  const localSongs = q
    ? songs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
      )
    : [];
  const localAlbums = q
    ? albums.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      )
    : [];

  // iTunes live search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setItunesTracks([]);
      setItunesAlbums([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const [trackRes, albumRes] = await Promise.all([
          axios.get("https://itunes.apple.com/search", {
            params: { term: query, entity: "musicTrack", limit: 25, media: "music" },
          }),
          axios.get("https://itunes.apple.com/search", {
            params: { term: query, entity: "album", limit: 8, media: "music" },
          }),
        ]);

        setItunesTracks(
          (trackRes.data.results as ItunesTrack[]).filter((t) => t.previewUrl)
        );
        setItunesAlbums(albumRes.data.results as ItunesAlbum[]);
      } catch {
        // iTunes API unreachable — fall back to local only
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  }, [query]);

  // Unique artists from iTunes results
  const itunesArtists = [
    ...new Map(
      itunesTracks.map((t) => [t.artistName, t])
    ).values(),
  ].map((t) => t.artistName);

  function playItunesTrack(track: ItunesTrack) {
    const song: Song = {
      id: `itunes_${track.trackId}`,
      title: track.trackName,
      description: track.artistName,
      thumbnail: track.artworkUrl100.replace("100x100bb", "300x300bb"),
      audio: track.previewUrl,
      album: track.collectionName,
    };
    addExternalSong(song);
    setSelectedSong(song.id);
    setIsPlaying(true);
  }

  const hasResults =
    localSongs.length > 0 ||
    localAlbums.length > 0 ||
    itunesTracks.length > 0 ||
    itunesAlbums.length > 0;

  return (
    <Layout>
      {/* Search bar */}
      <div className="relative mb-8 mt-2">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
        <input
          autoFocus
          type="text"
          placeholder="Search songs, artists, albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full text-white text-sm font-medium outline-none focus:ring-2 focus:ring-green-500 transition-all"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        />
        {searchLoading && (
          <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4 animate-spin" />
        )}
      </div>

      {/* Genre tiles */}
      {!query && (
        <>
          <h2 className="text-xl font-bold text-white mb-4">Browse categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
            {GENRE_TILES.map((g, i) => (
              <button
                key={i}
                onClick={() => setQuery(g.name)}
                className="relative h-24 rounded-xl overflow-hidden text-left p-4 font-bold text-white text-base transition-all hover:scale-[1.03] active:scale-[0.98]"
                style={{ background: g.color }}
              >
                {g.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* No results */}
      {query && !searchLoading && !hasResults && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-white/50 font-medium">No results for "{query}"</p>
          <p className="text-white/25 text-xs mt-1">Try a different search term</p>
        </div>
      )}

      {/* Artists from iTunes */}
      {itunesArtists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Artists</h2>
          <div className="flex gap-4 flex-wrap">
            {itunesArtists.slice(0, 10).map((artist, i) => {
              const isFollowing = user?.followedArtists?.includes(artist) ?? false;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/5 transition-all"
                  style={{ width: 148 }}
                >
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: "linear-gradient(135deg, #1db954 0%, #7c3aed 100%)" }}
                  >
                    <FaUserAlt className="text-white text-2xl" />
                  </div>
                  <p className="text-white text-sm font-bold text-center truncate w-full">{artist}</p>
                  <p className="text-white/40 text-xs">Artist</p>
                  {isAuth && (
                    <button
                      onClick={() => followArtist(artist)}
                      className={`px-4 py-1 text-xs font-bold rounded-full border transition-all hover:scale-105 active:scale-95 ${
                        isFollowing
                          ? "bg-green-500 text-black border-green-500"
                          : "text-white border-white/40 hover:border-white"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* iTunes tracks */}
      {itunesTracks.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-white">Songs</h2>
            <span className="text-xs text-white/30 font-medium">from iTunes</span>
          </div>
          <div className="flex flex-col gap-1">
            {itunesTracks.map((track, i) => {
              const songId = `itunes_${track.trackId}`;
              const isLiked = user?.playlist?.includes(songId) ?? false;
              return (
                <div
                  key={track.trackId}
                  className="flex items-center gap-4 px-4 py-2.5 rounded-lg group hover:bg-white/5 transition-all cursor-pointer"
                  onClick={() => playItunesTrack(track)}
                >
                  <span className="text-white/30 text-sm w-5 text-right group-hover:hidden">{i + 1}</span>
                  <FaPlay className="text-white text-xs hidden group-hover:block w-5" />
                  <img
                    src={track.artworkUrl100.replace("100x100bb", "60x60bb")}
                    alt={track.trackName}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{track.trackName}</p>
                    <p className="text-white/40 text-xs truncate">{track.artistName}</p>
                  </div>
                  <p className="text-white/30 text-xs truncate hidden sm:block max-w-[180px]">{track.collectionName}</p>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {isAuth && (
                      <button
                        onClick={() => addToPlaylist(songId)}
                        title={isLiked ? "Remove from liked" : "Like"}
                      >
                        {isLiked
                          ? <FaHeart className="text-green-400 w-3.5 h-3.5" />
                          : <FaRegHeart className="text-white/50 hover:text-white w-3.5 h-3.5" />
                        }
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* iTunes albums */}
      {itunesAlbums.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-white">Albums</h2>
            <span className="text-xs text-white/30 font-medium">from iTunes</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {itunesAlbums.map((album, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl cursor-pointer group flex-shrink-0 hover:bg-white/8 transition-all"
                style={{ background: "rgba(255,255,255,0.04)", minWidth: 160 }}
              >
                <div className="relative overflow-hidden rounded-xl mb-3">
                  <img
                    src={album.artworkUrl100.replace("100x100bb", "200x200bb")}
                    alt={album.collectionName}
                    className="w-[148px] h-[148px] object-cover"
                  />
                </div>
                <p className="font-bold text-sm text-white truncate mb-1">{album.collectionName}</p>
                <p className="text-xs text-white/45 truncate">{album.artistName}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Local DB songs (if any) */}
      {localSongs.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-white">Your Library</h2>
            <span className="text-xs text-white/30 font-medium">local</span>
          </div>
          <div className="flex flex-col gap-1">
            {localSongs.slice(0, 10).map((s, i) => {
              const isLiked = user?.playlist?.includes(s.id.toString()) ?? false;
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-4 px-4 py-2.5 rounded-lg group hover:bg-white/5 transition-all cursor-pointer"
                  onClick={() => { setSelectedSong(s.id); setIsPlaying(true); }}
                >
                  <span className="text-white/30 text-sm w-5 text-right group-hover:hidden">{i + 1}</span>
                  <FaPlay className="text-white text-xs hidden group-hover:block w-5" />
                  <img
                    src={s.thumbnail || "/download.jpeg"}
                    alt={s.title}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/download.jpeg"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{s.title}</p>
                    <p className="text-white/40 text-xs truncate">{s.description}</p>
                  </div>
                  {isAuth && (
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); addToPlaylist(s.id); }}
                    >
                      {isLiked
                        ? <FaHeart className="text-green-400 w-3.5 h-3.5" />
                        : <FaRegHeart className="text-white/50 hover:text-white w-3.5 h-3.5" />
                      }
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Local DB albums */}
      {localAlbums.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-white">Albums</h2>
            <span className="text-xs text-white/30 font-medium">local</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {localAlbums.slice(0, 8).map((a, i) => (
              <div
                key={i}
                onClick={() => navigate(`/album/${a.id}`)}
                className="p-3 rounded-2xl cursor-pointer group flex-shrink-0 hover:bg-white/8 transition-all"
                style={{ background: "rgba(255,255,255,0.04)", minWidth: 160 }}
              >
                <div className="relative overflow-hidden rounded-xl mb-3">
                  <img
                    src={a.thumbnail || "/download.jpeg"}
                    alt={a.title}
                    className="w-[148px] h-[148px] object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/download.jpeg"; }}
                  />
                </div>
                <p className="font-bold text-sm text-white truncate mb-1">{a.title}</p>
                <p className="text-xs text-white/45 truncate">{a.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Search;
