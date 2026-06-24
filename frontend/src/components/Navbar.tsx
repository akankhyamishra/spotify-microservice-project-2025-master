import { useNavigate } from "react-router-dom";
import { useUserData } from "../context/UserContext";
import { FaChevronLeft, FaChevronRight, FaUser } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuth, logoutUser, user } = useUserData();
  const initials = user?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "";

  return (
    <div className="animate-fade-in">
      {/* Top row */}
      <div className="w-full flex justify-between items-center">
        {/* Nav arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90"
            style={{ background: "rgba(0,0,0,0.7)" }}
          >
            <FaChevronLeft className="text-white/70 w-3 h-3" />
          </button>
          <button
            onClick={() => navigate(+1)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90"
            style={{ background: "rgba(0,0,0,0.7)" }}
          >
            <FaChevronRight className="text-white/70 w-3 h-3" />
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-1.5 text-sm font-medium text-white/70 rounded-full border transition-all duration-200 hover:text-white hover:border-white/30 hover:bg-white/5 hidden md:block"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            Explore Premium
          </button>
          <button
            className="px-4 py-1.5 text-sm font-medium text-white/70 rounded-full border transition-all duration-200 hover:text-white hover:border-white/30 hover:bg-white/5 hidden md:block"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            Install App
          </button>

          {isAuth ? (
            <>
              {/* Avatar → profile */}
              <button
                onClick={() => navigate("/profile")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white transition-all hover:scale-110 active:scale-95"
                style={{ background: "linear-gradient(135deg,#1db954,#7c3aed)" }}
                title={user?.name}
              >
                {initials || <FaUser className="w-3 h-3" />}
              </button>
              <button
                onClick={() => logoutUser()}
                className="px-5 py-1.5 text-sm font-bold text-black bg-white rounded-full transition-all duration-200 hover:bg-green-400 hover:scale-[1.04] active:scale-[0.96]"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-1.5 text-sm font-bold text-black bg-white rounded-full transition-all duration-200 hover:bg-green-400 hover:scale-[1.04] active:scale-[0.96]"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mt-4">
        <button className="px-4 py-1 text-sm font-semibold bg-white text-black rounded-full transition-all duration-200 hover:bg-green-400 hover:scale-105">
          All
        </button>
        <button className="px-4 py-1 text-sm font-medium text-white/60 hover:text-white rounded-full transition-all duration-200 hover:bg-white/10 hover:scale-105 hidden md:block">
          Music
        </button>
        <button className="px-4 py-1 text-sm font-medium text-white/60 hover:text-white rounded-full transition-all duration-200 hover:bg-white/10 hover:scale-105 hidden md:block">
          Podcasts
        </button>
        <button
          onClick={() => navigate("/playlist")}
          className="px-4 py-1 text-sm font-medium text-white/60 hover:text-white rounded-full transition-all duration-200 hover:bg-white/10 hover:scale-105 md:hidden"
        >
          Playlist
        </button>
      </div>
    </div>
  );
};

export default Navbar;
