import mongoose, { Document, Schema } from "mongoose";

export interface IListenEvent {
  songId: string;
  songTitle: string;
  artistName: string;
  albumName: string;
  thumbnail: string;
  playedAt: Date;
  platform: string;
  listenedFor: number;
}

export interface ISavedAlbum {
  albumId: string;
  albumTitle: string;
  artistName: string;
  thumbnail: string;
  savedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  playlist: string[];
  followedArtists: string[];
  listeningHistory: IListenEvent[];
  savedAlbums: ISavedAlbum[];
  customPlaylists: ICustomPlaylist[];
}

const listenEventSchema = new Schema<IListenEvent>(
  {
    songId:      { type: String },
    songTitle:   { type: String },
    artistName:  { type: String },
    albumName:   { type: String },
    thumbnail:   { type: String },
    playedAt:    { type: Date, default: Date.now },
    platform:    { type: String },
    listenedFor: { type: Number, default: 0 },
  },
  { _id: false }
);

// ─── Custom playlists ────────────────────────────────────────────────────────

export interface IPlaylistSong {
  id: string;
  title: string;
  artistName: string;
  thumbnail: string;
  audio: string; // empty string for DB songs; iTunes preview URL for external tracks
}

export interface ICustomPlaylist {
  _id: mongoose.Types.ObjectId;
  name: string;
  songs: IPlaylistSong[];
  createdAt: Date;
}

const playlistSongSchema = new Schema<IPlaylistSong>(
  { id: String, title: String, artistName: String, thumbnail: String, audio: String },
  { _id: false }
);

const customPlaylistSchema = new Schema<ICustomPlaylist>(
  {
    name:    { type: String, required: true },
    songs:   { type: [playlistSongSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ─────────────────────────────────────────────────────────────────────────────

const savedAlbumSchema = new Schema<ISavedAlbum>(
  {
    albumId:    { type: String },
    albumTitle: { type: String },
    artistName: { type: String },
    thumbnail:  { type: String },
    savedAt:    { type: Date, default: Date.now },
  },
  { _id: false }
);

const schema: Schema<IUser> = new Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, default: "user" },
    playlist: [{ type: String }],
    followedArtists:  [{ type: String }],
    listeningHistory: { type: [listenEventSchema],     default: [] },
    savedAlbums:      { type: [savedAlbumSchema],      default: [] },
    customPlaylists:  { type: [customPlaylistSchema],  default: [] },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", schema);
