import { useState } from "react";
import Layout from "../components/Layout";
import { useSongData } from "../context/SongContext";
import { useUserData } from "../context/UserContext";
import SongCard from "../components/SongCard";
import AlbumCard from "../components/AlbumCard";
import { FaSearch, FaUserAlt } from "react-icons/fa";

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

const Search = () => {
  const [query, setQuery] = useState("");
  const { songs, albums } = useSongData();
  const { user, followArtist } = useUserData();

  const q = query.toLowerCase().trim();

  const filteredSongs = q
    ? songs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
      )
    : [];

  const filteredAlbums = q
    ? albums.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      )
    : [];

  const allArtists = [
    ...new Set(songs.map((s) => s.description).filter(Boolean)),
  ];
  const filteredArtists = q
    ? allArtists.filter((a) => a.toLowerCase().includes(q))
    : [];

  const hasResults =
    filteredSongs.length > 0 ||
    filteredAlbums.length > 0 ||
    filteredArtists.length > 0;

  return (
    <Layout>
      {/* Search bar */}
      <div className="relative mb-8 mt-2">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
        <input
          autoFocus
          type="text"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full text-white text-sm font-medium outline-none focus:ring-2 focus:ring-green-500 transition-all"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        />
      </div>

      {/* Browse categories (when no query) */}
      {!query && (
        <>
          <h2 className="text-xl font-bold text-white mb-4">
            Browse categories
          </h2>
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
      {query && !hasResults && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-white/50 font-medium">No results for "{query}"</p>
          <p className="text-white/25 text-xs mt-1">
            Try a different search term
          </p>
        </div>
      )}

      {/* Artists */}
      {filteredArtists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Artists</h2>
          <div className="flex gap-4 flex-wrap">
            {filteredArtists.slice(0, 16).map((artist, i) => {
              const isFollowing =
                user?.followedArtists?.includes(artist) ?? false;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-default"
                  style={{ width: 152 }}
                >
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #1db954 0%, #7c3aed 100%)",
                    }}
                  >
                    <FaUserAlt className="text-white text-3xl" />
                  </div>
                  <p className="text-white text-sm font-bold text-center truncate w-full">
                    {artist}
                  </p>
                  <p className="text-white/40 text-xs">Artist</p>
                  {user && (
                    <button
                      onClick={() => followArtist(artist)}
                      className={`px-4 py-1 text-xs font-bold rounded-full border transition-all hover:scale-105 active:scale-95 ${
                        isFollowing
                          ? "bg-green-500 text-black border-green-500"
                          : "text-white border-white/40 hover:border-white bg-transparent"
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

      {/* Songs */}
      {filteredSongs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Songs</h2>
          <div className="flex gap-3 flex-wrap">
            {filteredSongs.slice(0, 20).map((s, i) => (
              <SongCard
                key={i}
                image={s.thumbnail}
                name={s.title}
                desc={s.description}
                id={s.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {filteredAlbums.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
          <div className="flex gap-3 flex-wrap">
            {filteredAlbums.slice(0, 12).map((a, i) => (
              <AlbumCard
                key={i}
                image={a.thumbnail}
                name={a.title}
                desc={a.description}
                id={a.id}
              />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Search;
