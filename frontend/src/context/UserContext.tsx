import axios from "axios";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import toast, { Toaster } from "react-hot-toast";

const server = "http://localhost:5000";

export interface PlaylistSong {
  id: string;
  title: string;
  artistName: string;
  thumbnail: string;
  audio: string;
}

export interface CustomPlaylist {
  _id: string;
  name: string;
  songs: PlaylistSong[];
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  playlist: string[];
  followedArtists: string[];
  savedAlbums: { albumId: string; albumTitle: string; artistName: string; thumbnail: string }[];
  customPlaylists: CustomPlaylist[];
}

interface UserContextType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  btnLoading: boolean;
  loginUser: (
    email: string,
    password: string,
    navigate: (path: string) => void
  ) => Promise<void>;
  registerUser: (
    name: string,
    email: string,
    password: string,
    navigate: (path: string) => void
  ) => Promise<void>;
  addToPlaylist: (id: string) => void;
  logoutUser: () => Promise<void>;
  followArtist: (name: string) => Promise<void>;
  logListen: (song: { songId: string; songTitle: string; artistName: string; albumName: string; thumbnail: string; listenedFor: number }) => Promise<void>;
  toggleSaveAlbum: (album: { albumId: string; albumTitle: string; artistName: string; thumbnail: string }) => Promise<void>;
  createPlaylist: (name: string) => Promise<CustomPlaylist | null>;
  deletePlaylist: (id: string) => Promise<void>;
  renamePlaylist: (id: string, name: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, song: PlaylistSong) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  async function fetchUser() {
    try {
      const { data } = await axios.get(`${server}/api/v1/user/me`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setUser(data);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function registerUser(
    name: string,
    email: string,
    password: string,
    navigate: (path: string) => void
  ) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/v1/user/register`, {
        name,
        email,
        password,
      });

      toast.success(data.message);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAuth(true);
      setBtnLoading(false);
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occured");
      setBtnLoading(false);
    }
  }

  async function loginUser(
    email: string,
    password: string,
    navigate: (path: string) => void
  ) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/v1/user/login`, {
        email,
        password,
      });

      toast.success(data.message);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAuth(true);
      setBtnLoading(false);
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occured");
      setBtnLoading(false);
    }
  }

  async function logoutUser() {
    localStorage.clear();
    setUser(null);
    setIsAuth(false);

    toast.success("User Logged Out");
  }

  async function addToPlaylist(id: string) {
    try {
      const { data } = await axios.post(
        `${server}/api/v1/song/${id}`,
        {},
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An Error Occured");
    }
  }

  async function followArtist(name: string) {
    try {
      const { data } = await axios.post(
        `${server}/api/v1/artist/follow`,
        { name },
        { headers: { token: localStorage.getItem("token") } }
      );
      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An Error Occured");
    }
  }

  async function logListen(song: {
    songId: string; songTitle: string; artistName: string;
    albumName: string; thumbnail: string; listenedFor: number;
  }) {
    try {
      const platform = `${navigator.platform} | ${navigator.userAgent.slice(0, 80)}`;
      await axios.post(
        `${server}/api/v1/listen`,
        { ...song, platform },
        { headers: { token: localStorage.getItem("token") } }
      );
    } catch {}
  }

  async function toggleSaveAlbum(album: {
    albumId: string; albumTitle: string; artistName: string; thumbnail: string;
  }) {
    try {
      const { data } = await axios.post(
        `${server}/api/v1/album/save`,
        album,
        { headers: { token: localStorage.getItem("token") } }
      );
      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An Error Occured");
    }
  }

  async function createPlaylist(name: string): Promise<CustomPlaylist | null> {
    try {
      const { data } = await axios.post(
        `${server}/api/v1/playlists`,
        { name },
        { headers: { token: localStorage.getItem("token") } }
      );
      await fetchUser();
      return data as CustomPlaylist;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create playlist");
      return null;
    }
  }

  async function deletePlaylist(id: string) {
    try {
      const { data } = await axios.delete(`${server}/api/v1/playlists/${id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete playlist");
    }
  }

  async function renamePlaylist(id: string, name: string) {
    try {
      await axios.put(
        `${server}/api/v1/playlists/${id}/rename`,
        { name },
        { headers: { token: localStorage.getItem("token") } }
      );
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to rename playlist");
    }
  }

  async function addSongToPlaylist(playlistId: string, song: PlaylistSong) {
    try {
      await axios.post(
        `${server}/api/v1/playlists/${playlistId}/songs`,
        song,
        { headers: { token: localStorage.getItem("token") } }
      );
      toast.success("Added to playlist");
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add song");
    }
  }

  async function removeSongFromPlaylist(playlistId: string, songId: string) {
    try {
      await axios.delete(
        `${server}/api/v1/playlists/${playlistId}/songs/${encodeURIComponent(songId)}`,
        { headers: { token: localStorage.getItem("token") } }
      );
      fetchUser();
    } catch {}
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isAuth,
        btnLoading,
        loginUser,
        registerUser,
        logoutUser,
        addToPlaylist,
        followArtist,
        logListen,
        toggleSaveAlbum,
        createPlaylist,
        deletePlaylist,
        renamePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
      }}
    >
      {children}
      <Toaster />
    </UserContext.Provider>
  );
};

export const useUserData = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserProvider");
  }
  return context;
};
