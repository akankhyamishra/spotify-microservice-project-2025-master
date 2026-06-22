import React from "react";
import { FaBookmark, FaPlay } from "react-icons/fa";
import { useUserData } from "../context/UserContext";
import { useSongData } from "../context/SongContext";

interface SongCardProps {
  image: string;
  name: string;
  desc: string;
  id: string;
}

const SongCard: React.FC<SongCardProps> = ({ image, name, desc, id }) => {
  const { addToPlaylist, isAuth } = useUserData();
  const { setSelectedSong, setIsPlaying } = useSongData();

  return (
    <div
      className="card-lift min-w-[160px] p-3 rounded-2xl cursor-pointer group flex-shrink-0"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      {/* Image + overlay */}
      <div className="relative overflow-hidden rounded-xl mb-3">
        <img
          src={image ? image : "/download.jpeg"}
          className="w-[148px] h-[148px] object-cover transition-transform duration-500 group-hover:scale-110"
          alt={name}
        />
        {/* Bottom gradient on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)",
          }}
        />
        {/* Action buttons */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-end gap-2 px-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {isAuth && (
            <button
              onClick={(e) => { e.stopPropagation(); addToPlaylist(id); }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
              title="Save to playlist"
            >
              <FaBookmark className="text-white/80 text-xs" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSong(id);
              setIsPlaying(true);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-90"
            style={{
              background: "#1db954",
              boxShadow: "0 6px 20px rgba(29,185,84,0.5)",
            }}
            title="Play"
          >
            <FaPlay className="text-black text-sm ml-0.5" />
          </button>
        </div>
      </div>

      <p className="font-bold text-sm text-white truncate mb-1">{name}</p>
      <p className="text-xs text-white/45 truncate">{desc}</p>
    </div>
  );
};

export default SongCard;
