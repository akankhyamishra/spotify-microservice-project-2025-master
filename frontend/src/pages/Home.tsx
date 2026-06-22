import AlbumCard from "../components/AlbumCard";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import SongCard from "../components/SongCard";
import { useSongData } from "../context/SongContext";
import { useUserData } from "../context/UserContext";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const Home = () => {
  const { albums, songs, loading } = useSongData();
  const { user } = useUserData();

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
              {user ? (
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
              ) : null}
            </h1>
          </div>

          {/* Featured Charts */}
          {albums && albums.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4 animate-fade-in-up delay-100">
                <h2 className="text-xl font-bold text-white">Featured Charts</h2>
                <button className="text-xs font-bold text-white/40 hover:text-white transition-colors duration-200 uppercase tracking-widest">
                  See all
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {albums.map((e, i) => (
                  <div
                    key={i}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${120 + i * 60}ms` }}
                  >
                    <AlbumCard
                      image={e.thumbnail}
                      name={e.title}
                      desc={e.description}
                      id={e.id}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Today's biggest hits */}
          {songs && songs.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4 animate-fade-in-up delay-200">
                <h2 className="text-xl font-bold text-white">
                  Today's biggest hits
                </h2>
                <button className="text-xs font-bold text-white/40 hover:text-white transition-colors duration-200 uppercase tracking-widest">
                  See all
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {songs.map((e, i) => (
                  <div
                    key={i}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${240 + i * 60}ms` }}
                  >
                    <SongCard
                      image={e.thumbnail}
                      name={e.title}
                      desc={e.description}
                      id={e.id}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {(!albums || albums.length === 0) && (!songs || songs.length === 0) && (
            <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "rgba(29,185,84,0.1)" }}
              >
                <span className="text-2xl">🎵</span>
              </div>
              <p className="text-white/50 text-sm font-medium">No music yet</p>
              <p className="text-white/25 text-xs mt-1">
                Add songs via the Admin dashboard
              </p>
            </div>
          )}
        </Layout>
      )}
    </div>
  );
};

export default Home;
