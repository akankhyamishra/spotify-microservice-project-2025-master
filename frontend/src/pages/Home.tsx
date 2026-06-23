import { useNavigate } from "react-router-dom";
import AlbumCard from "../components/AlbumCard";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import SongCard from "../components/SongCard";
import { useSongData } from "../context/SongContext";
import { useUserData } from "../context/UserContext";
import { FaPlay } from "react-icons/fa";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const Home = () => {
  const { albums, songs, loading } = useSongData();
  const { user } = useUserData();
  const navigate = useNavigate();

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <Layout>
          {/* Greeting */}
          <div className="mt-2 mb-6 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-white">
              {getGreeting()}
              {user && (
                <span
                  className="ml-2"
                  style={{
                    background: "linear-gradient(135deg, #1db954, #7c3aed)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {user.name}
                </span>
              )}
            </h1>
          </div>

          {/* Quick access grid — Spotify-style pill grid */}
          {albums.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-8 animate-fade-in-up delay-50">
              {albums.slice(0, 6).map((album, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/album/${album.id}`)}
                  className="flex items-center gap-3 rounded-lg overflow-hidden group relative transition-all duration-200 hover:bg-white/20 text-left"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <img
                    src={album.thumbnail}
                    alt={album.title}
                    className="w-14 h-14 object-cover flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/download.jpeg"; }}
                  />
                  <span className="font-bold text-sm text-white truncate pr-12">{album.title}</span>
                  <div
                    className="absolute right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200"
                    style={{ background: "#1db954", boxShadow: "0 6px 20px rgba(29,185,84,0.5)" }}
                  >
                    <FaPlay className="text-black text-xs ml-0.5" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Featured Charts */}
          {albums.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4 animate-fade-in-up delay-100">
                <h2 className="text-xl font-bold text-white">Featured Charts</h2>
                <button className="text-xs font-bold text-white/40 hover:text-white transition-colors duration-200 uppercase tracking-widest">
                  See all
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {albums.map((e, i) => (
                  <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${150 + i * 60}ms` }}>
                    <AlbumCard image={e.thumbnail} name={e.title} desc={e.description} id={e.id} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Today's biggest hits */}
          {songs.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4 animate-fade-in-up delay-200">
                <h2 className="text-xl font-bold text-white">Today's biggest hits</h2>
                <button className="text-xs font-bold text-white/40 hover:text-white transition-colors duration-200 uppercase tracking-widest">
                  See all
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {songs.map((e, i) => (
                  <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${240 + i * 60}ms` }}>
                    <SongCard image={e.thumbnail} name={e.title} desc={e.description} id={e.id} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {albums.length === 0 && songs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(29,185,84,0.1)" }}>
                <span className="text-2xl">🎵</span>
              </div>
              <p className="text-white/50 text-sm font-medium">No music yet</p>
              <p className="text-white/25 text-xs mt-1">Add songs via the Admin dashboard</p>
            </div>
          )}
        </Layout>
      )}
    </div>
  );
};

export default Home;
