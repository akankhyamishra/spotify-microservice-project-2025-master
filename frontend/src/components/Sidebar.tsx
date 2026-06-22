import { useNavigate } from "react-router-dom";
import PlayListCard from "./PlayListCard";
import { useUserData } from "../context/UserContext";
import { FiHome, FiSearch, FiList, FiArrowRight, FiPlus } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useUserData();

  return (
    <div
      className="w-[260px] h-full flex-col gap-2 text-white hidden lg:flex animate-slide-in-left flex-shrink-0"
    >
      {/* Top nav panel */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-1"
        style={{ background: "#111111" }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/8 transition-all duration-200 group"
        >
          <FiHome className="w-5 h-5 group-hover:text-green-400 transition-colors duration-200" />
          <span className="font-semibold text-sm">Home</span>
        </button>
        <button className="flex items-center gap-4 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/8 transition-all duration-200 group">
          <FiSearch className="w-5 h-5 group-hover:text-green-400 transition-colors duration-200" />
          <span className="font-semibold text-sm">Search</span>
        </button>
      </div>

      {/* Library panel */}
      <div
        className="rounded-2xl flex-1 flex flex-col overflow-hidden"
        style={{ background: "#111111" }}
      >
        {/* Library header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <FiList className="w-5 h-5 text-white/60" />
            <span className="font-semibold text-sm text-white/80">Your Library</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-all duration-200">
              <FiArrowRight className="w-4 h-4" />
            </button>
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-all duration-200">
              <FiPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Playlist card */}
        <div
          className="mx-3 mt-3 rounded-xl overflow-hidden cursor-pointer"
          onClick={() => navigate("/playlist")}
        >
          <PlayListCard />
        </div>

        {/* Podcast hint */}
        <div
          className="mx-3 mt-3 p-4 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <p className="font-semibold text-sm text-white/80 mb-1">
            Let's find some podcasts
          </p>
          <p className="text-xs text-white/40 mb-3 leading-relaxed">
            We'll keep you updated on new episodes
          </p>
          <button className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-green-400 transition-all duration-200 hover:scale-105">
            Browse Podcasts
          </button>
        </div>

        {/* Admin button */}
        {user && user.role === "admin" && (
          <div className="mx-3 mt-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #1db954 0%, #138c3a 100%)",
                color: "black",
                boxShadow: "0 4px 16px rgba(29,185,84,0.25)",
              }}
            >
              <MdDashboard className="w-4 h-4" />
              Admin Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
