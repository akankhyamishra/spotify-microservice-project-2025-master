import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Song, useSongData } from "../context/SongContext";
import { useUserData } from "../context/UserContext";
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaArrowLeft } from "react-icons/fa";
import axios from "axios";

interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
}

const Artist = () => {
  const { name: encodedName } = useParams<{ name: string }>();
  const artistName = decodeURIComponent(encodedName || "");
  const navigate = useNavigate();

  const [tracks, setTracks] = useState<ItunesTrack[]>([]);
  const [artistArt, setArtistArt] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const { setSelectedSong, setIsPlaying, addExternalSong, isPlaying, selectedSong } = useSongData();
  const { user, followArtist, addToPlaylist, isAuth } = useUserData();

  const isFollowing = user?.followedArtists?.includes(artistName) ?? false;

  useEffect(() => {
    if (!artistName) return;
    setLoading(true);
    axios
      .get("https://itunes.apple.com/search", {
        params: {
          term: artistName,
          entity: "musicTrack",
          limit: 50,
          media: "music",
          attribute: "artistTerm",
        },
      })
      .then(({ data }) => {
        const results: ItunesTrack[] = (data.results as ItunesTrack[]).filter(
          (t) =>
            t.previewUrl &&
            t.artistName.toLowerCase() === artistName.toLowerCase()
        );
        // Fallback: if exact match gives nothing, take all results
        const final =
          results.length > 0
            ? results
            : (data.results as ItunesTrack[]).filter((t) => t.previewUrl);
        setTracks(final);
        if (final.length > 0) {
          setArtistArt(
            final[0].artworkUrl100.replace("100x100bb", "600x600bb")
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [artistName]);

  function playTrack(track: ItunesTrack) {
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

  function playAll() {
    if (tracks.length === 0) return;
    playTrack(tracks[0]);
  }

  return (
    <Layout>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors"
      >
        <FaArrowLeft className="w-3 h-3" />
        Back
      </button>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Hero header */}
          <div className="relative rounded-2xl overflow-hidden mb-8" style={{ minHeight: 280 }}>
            {/* Blurred background */}
            {artistArt && (
              <>
                <img
                  src={artistArt}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "blur(40px) brightness(0.35) saturate(1.4)", transform: "scale(1.1)" }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(18,18,18,0.95) 100%)" }}
                />
              </>
            )}

            {/* Content */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 p-8">
              {/* Artist image */}
              <div
                className="w-44 h-44 rounded-full overflow-hidden flex-shrink-0 shadow-2xl border-4 border-white/10"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}
              >
                {artistArt ? (
                  <img
                    src={artistArt}
                    alt={artistName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-5xl font-black text-white"
                    style={{ background: "linear-gradient(135deg, #1db954, #7c3aed)" }}
                  >
                    {artistName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col items-center sm:items-start gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-widest opacity-70">
                  Artist
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight text-center sm:text-left">
                  {artistName}
                </h1>
                <p className="text-white/50 text-sm">
                  {tracks.length} song{tracks.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6 px-2">
            <button
              onClick={playAll}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              style={{ background: "#1db954", boxShadow: "0 8px 24px rgba(29,185,84,0.4)" }}
            >
              <FaPlay className="text-black text-lg ml-1" />
            </button>
            {isAuth && (
              <button
                onClick={() => followArtist(artistName)}
                className={`px-6 py-2 text-sm font-bold rounded-full border transition-all hover:scale-105 active:scale-95 ${
                  isFollowing
                    ? "bg-green-500 text-black border-green-500"
                    : "text-white border-white/40 hover:border-white"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Song list */}
          {tracks.length > 0 ? (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[2rem_1fr_1fr_5rem] gap-4 px-4 py-2 mb-1 border-b border-white/10">
                <span className="text-white/40 text-xs uppercase tracking-wider text-center">#</span>
                <span className="text-white/40 text-xs uppercase tracking-wider">Title</span>
                <span className="text-white/40 text-xs uppercase tracking-wider hidden sm:block">Album</span>
                <span className="text-white/40 text-xs uppercase tracking-wider text-right">Actions</span>
              </div>

              {tracks.map((track, i) => {
                const songId = `itunes_${track.trackId}`;
                const isActive = selectedSong === songId;
                const isLiked = user?.playlist?.includes(songId) ?? false;

                return (
                  <div
                    key={track.trackId}
                    className="grid grid-cols-[2rem_1fr_1fr_5rem] gap-4 px-4 py-3 rounded-lg group cursor-pointer transition-all duration-150 song-row"
                    style={{ background: isActive ? "rgba(255,255,255,0.1)" : undefined }}
                    onClick={() => playTrack(track)}
                  >
                    {/* Index / eq */}
                    <div className="flex items-center justify-center">
                      {isActive && isPlaying ? (
                        <div className="flex items-end gap-[2px] h-4">
                          <div className="eq-bar" />
                          <div className="eq-bar" />
                          <div className="eq-bar" />
                        </div>
                      ) : (
                        <>
                          <span className={`text-sm group-hover:hidden ${isActive ? "text-green-500" : "text-white/40"}`}>
                            {i + 1}
                          </span>
                          <FaPlay className="text-white text-xs hidden group-hover:block" />
                        </>
                      )}
                    </div>

                    {/* Title + art */}
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={track.artworkUrl100.replace("100x100bb", "60x60bb")}
                        alt={track.trackName}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                      <span
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-green-400" : "text-white"
                        }`}
                      >
                        {track.trackName}
                      </span>
                    </div>

                    {/* Album */}
                    <div className="hidden sm:flex items-center">
                      <p className="text-white/40 text-sm truncate">{track.collectionName}</p>
                    </div>

                    {/* Actions */}
                    <div
                      className="flex items-center gap-3 justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isAuth && (
                        <button
                          className={`transition-colors ${isLiked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          onClick={() => addToPlaylist(songId)}
                          title={isLiked ? "Unlike" : "Like"}
                        >
                          {isLiked ? (
                            <FaHeart className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <FaRegHeart className="w-3.5 h-3.5 text-white/50 hover:text-white" />
                          )}
                        </button>
                      )}
                      <button
                        className="text-white/30 hover:text-green-500 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => playTrack(track)}
                      >
                        {isActive && isPlaying ? (
                          <FaPause className="w-3.5 h-3.5" />
                        ) : (
                          <FaPlay className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-white/40 text-sm">No preview tracks found for {artistName}</p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default Artist;
