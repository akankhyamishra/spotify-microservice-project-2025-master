import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PlayListCard from "./PlayListCard";
import { useUserData } from "../context/UserContext";
import { useSongData } from "../context/SongContext";
import { FiHome, FiSearch, FiList, FiPlus } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { FaHeart, FaMusic, FaUser } from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, createPlaylist } = useUserData();
  const { albums, setSelectedSong, setIsPlaying, addExternalSong } = useSongData();
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const isActive = (path: string) => location.pathname === path;

  async function handleCreatePlaylist() {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName("");
    setCreatingPlaylist(false);
  }

  const initials = user?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div className="w-[260px] h-full flex-col gap-2 text-white hidden lg:flex animate-slide-in-left flex-shrink-0">
      {/* Top nav panel */}
      <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: "#111111" }}>
        <button
          onClick={() => navigate("/")}
          className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
            isActive("/") ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/8"
          }`}
        >
          <FiHome className={`w-5 h-5 ${isActive("/") ? "text-green-400" : "group-hover:text-green-400"}`} />
          <span className="font-semibold text-sm">Home</span>
        </button>
        <button
          onClick={() => navigate("/search")}
          className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
            isActive("/search") ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/8"
          }`}
        >
          <FiSearch className={`w-5 h-5 ${isActive("/search") ? "text-green-400" : "group-hover:text-green-400"}`} />
          <span className="font-semibold text-sm">Search</span>
        </button>
        {user && (
          <button
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              isActive("/profile") ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/8"
            }`}
          >
            <FaUser className={`w-4 h-4 ${isActive("/profile") ? "text-green-400" : "group-hover:text-green-400"}`} />
            <span className="font-semibold text-sm">Profile</span>
          </button>
        )}
      </div>

      {/* Library panel */}
      <div className="rounded-2xl flex-1 flex flex-col overflow-hidden" style={{ background: "#111111" }}>
        {/* Library header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <FiList className="w-5 h-5 text-white/60" />
            <span className="font-semibold text-sm text-white/80">Your Library</span>
          </div>
          {user && (
            <button
              onClick={() => setCreatingPlaylist(true)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-all duration-200"
              title="Create playlist"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto">
          {/* Create playlist inline input */}
          {creatingPlaylist && (
            <div className="mx-3 mt-3 flex flex-col gap-2 animate-fade-in">
              <input
                autoFocus
                className="auth-input text-sm py-2"
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreatePlaylist();
                  if (e.key === "Escape") { setCreatingPlaylist(false); setNewPlaylistName(""); }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setCreatingPlaylist(false); setNewPlaylistName(""); }}
                  className="flex-1 py-1.5 text-xs rounded-full border border-white/20 text-white/60 hover:text-white transition-all"
                >Cancel</button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 py-1.5 text-xs rounded-full font-bold text-black disabled:opacity-40 transition-all"
                  style={{ background: "#1db954" }}
                >Create</button>
              </div>
            </div>
          )}

          {/* Liked songs shortcut */}
          {user && (
            <button
              onClick={() => navigate("/playlist")}
              className="mx-3 mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-all group text-left w-[calc(100%-24px)]"
            >
              <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#450af5,#c4efd9)" }}>
                <FaHeart className="text-white text-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium group-hover:text-green-400 transition-colors">Liked Songs</p>
                <p className="text-white/40 text-xs">{user.playlist?.length ?? 0} songs</p>
              </div>
            </button>
          )}

          {/* Custom playlists */}
          {user && (user.customPlaylists ?? []).map((pl) => {
            const cover = pl.songs[0]?.thumbnail;
            return (
              <button
                key={pl._id}
                onClick={() => navigate(`/playlist/${pl._id}`)}
                className={`mx-3 mt-1 flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-all group text-left w-[calc(100%-24px)] ${
                  location.pathname === `/playlist/${pl._id}` ? "bg-white/10" : ""
                }`}
              >
                <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: cover ? undefined : "linear-gradient(135deg,#7c3aed,#1db954)" }}>
                  {cover
                    ? <img src={cover} className="w-full h-full object-cover" />
                    : <FaMusic className="text-white text-sm" />}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium group-hover:text-green-400 transition-colors truncate">{pl.name}</p>
                  <p className="text-white/40 text-xs">{pl.songs.length} songs</p>
                </div>
              </button>
            );
          })}

          {/* Playlist card when logged out */}
          {!user && (
            <div className="mx-3 mt-3 rounded-xl overflow-hidden cursor-pointer flex-shrink-0" onClick={() => navigate("/playlist")}>
              <PlayListCard />
            </div>
          )}

          {/* Albums in library */}
          {albums.length > 0 && (
            <div className="mx-3 mt-4 flex flex-col gap-0.5">
              <p className="text-white/30 text-xs uppercase tracking-wider px-2 py-1 mb-1">Albums</p>
              {albums.map((album, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/album/${album.id}`)}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/8 transition-all group text-left w-full"
                >
                  <img src={album.thumbnail} alt={album.title} className="w-10 h-10 rounded object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "/download.jpeg"; }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate group-hover:text-green-400 transition-colors">{album.title}</p>
                    <p className="text-white/40 text-xs truncate">{album.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Admin button */}
          {user?.role === "admin" && (
            <div className="mx-3 mt-3 mb-3">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#1db954 0%,#138c3a 100%)", color: "black", boxShadow: "0 4px 16px rgba(29,185,84,0.25)" }}
              >
                <MdDashboard className="w-4 h-4" />
                Admin Dashboard
              </button>
            </div>
          )}

          {/* Profile shortcut at bottom */}
          {user && (
            <button
              onClick={() => navigate("/profile")}
              className="mx-3 mt-3 mb-4 flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-all group text-left w-[calc(100%-24px)]"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#1db954,#7c3aed)" }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium group-hover:text-green-400 transition-colors truncate">{user.name}</p>
                <p className="text-white/40 text-xs">View profile</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
