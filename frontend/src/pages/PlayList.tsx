import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Song, useSongData } from "../context/SongContext";
import { useUserData } from "../context/UserContext";
import { FaBookmark, FaPlay, FaPause } from "react-icons/fa";
import Loading from "../components/Loading";

const PlayList = () => {
  const { songs, setIsPlaying, setSelectedSong, selectedSong, isPlaying, loading } = useSongData();
  const { user, addToPlaylist } = useUserData();
  const [myPlayList, setMyPlayList] = useState<Song[]>([]);

  useEffect(() => {
    if (songs && user?.playlist) {
      setMyPlayList(songs.filter((song) => user.playlist.includes(song.id.toString())));
    }
  }, [songs, user]);

  return (
    <Layout>
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Header */}
          <div
            className="flex gap-6 p-6 rounded-xl mb-6 mt-2 items-end"
            style={{ background: "linear-gradient(180deg, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.04) 100%)" }}
          >
            <div
              className="w-44 h-44 rounded-lg flex-shrink-0 flex items-center justify-center text-5xl"
              style={{ background: "linear-gradient(135deg, #7c3aed, #1db954)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
            >
              ♫
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">Playlist</p>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                {user?.name}'s Playlist
              </h1>
              <p className="text-white/60 text-sm mb-4">Your favourite songs</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white font-semibold">Spotify Clone</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60">
                  {myPlayList.length} song{myPlayList.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {myPlayList.length > 0 ? (
            <>
              {/* Play button */}
              <div className="flex items-center gap-6 px-2 mb-6">
                <button
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: "#1db954", boxShadow: "0 8px 24px rgba(29,185,84,0.4)" }}
                  onClick={() => { setSelectedSong(myPlayList[0].id); setIsPlaying(true); }}
                >
                  <FaPlay className="text-black text-lg ml-1" />
                </button>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[2rem_1fr_1fr_5rem] gap-4 px-4 py-2 mb-1 border-b border-white/10">
                <span className="text-white/40 text-xs uppercase tracking-wider text-center">#</span>
                <span className="text-white/40 text-xs uppercase tracking-wider">Title</span>
                <span className="text-white/40 text-xs uppercase tracking-wider hidden sm:block">Description</span>
                <span className="text-white/40 text-xs uppercase tracking-wider text-right">Actions</span>
              </div>

              {myPlayList.map((song, index) => {
                const isActive = selectedSong === song.id;
                return (
                  <div
                    key={song.id}
                    className="grid grid-cols-[2rem_1fr_1fr_5rem] gap-4 px-4 py-3 rounded-lg group cursor-pointer transition-all duration-150 song-row"
                    style={{ background: isActive ? "rgba(255,255,255,0.1)" : undefined }}
                    onClick={() => { setSelectedSong(song.id); setIsPlaying(true); }}
                  >
                    <div className="flex items-center justify-center">
                      {isActive && isPlaying ? (
                        <div className="flex items-end gap-[2px] h-4">
                          <div className="eq-bar" /><div className="eq-bar" /><div className="eq-bar" />
                        </div>
                      ) : (
                        <>
                          <span className={`text-sm group-hover:hidden ${isActive ? "text-green-500" : "text-white/40"}`}>{index + 1}</span>
                          <FaPlay className="text-white text-xs hidden group-hover:block" />
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={song.thumbnail || "/download.jpeg"}
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/download.jpeg"; }}
                      />
                      <span className={`text-sm font-medium truncate ${isActive ? "text-green-400" : "text-white"}`}>{song.title}</span>
                    </div>

                    <div className="hidden sm:flex items-center">
                      <p className="text-white/40 text-sm truncate">{song.description?.slice(0, 40)}</p>
                    </div>

                    <div className="flex items-center gap-3 justify-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => addToPlaylist(song.id)}
                        title="Remove from playlist"
                      >
                        <FaBookmark className="w-3.5 h-3.5 text-green-500" />
                      </button>
                      <button
                        className="text-white/30 hover:text-green-500 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => { setSelectedSong(song.id); setIsPlaying(true); }}
                      >
                        {isActive && isPlaying ? <FaPause className="w-3.5 h-3.5" /> : <FaPlay className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(124,58,237,0.1)" }}>
                <span className="text-2xl">♫</span>
              </div>
              <p className="text-white/50 text-sm font-medium">Your playlist is empty</p>
              <p className="text-white/25 text-xs mt-1">Save songs from the home screen</p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default PlayList;
