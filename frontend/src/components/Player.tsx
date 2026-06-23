import React, { useEffect, useRef, useState } from "react";
import { useSongData } from "../context/SongContext";
import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";
import { GrChapterNext, GrChapterPrevious } from "react-icons/gr";
import { MdShuffle, MdRepeat, MdRepeatOne, MdVolumeUp, MdVolumeOff, MdQueueMusic } from "react-icons/md";

const Player = () => {
  const { song, fetchSingleSong, selectedSong, isPlaying, setIsPlaying, prevSong, nextSong } = useSongData();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off");
  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onMeta = () => setDuration(audio.duration || 0);
    const onTime = () => setProgress(audio.currentTime || 0);
    const onEnded = () => {
      if (repeat === "one") {
        audio.currentTime = 0;
        audio.play();
      } else if (repeat === "all") {
        nextSong();
      } else {
        setIsPlaying(false);
      }
    };
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [song, repeat, nextSong]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value) / 100;
    setVolume(v);
    setMuted(v === 0);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = false;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !muted;
    setMuted(next);
    audioRef.current.muted = next;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) audioRef.current.currentTime = t;
    setProgress(t);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const cycleRepeat = () => {
    if (repeat === "off") setRepeat("all");
    else if (repeat === "all") setRepeat("one");
    else setRepeat("off");
  };

  useEffect(() => {
    fetchSingleSong();
  }, [selectedSong]);

  if (!song) return null;

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className="h-[80px] flex items-center px-4 gap-4 border-t"
      style={{ background: "linear-gradient(to right, #0d0d0d, #111111, #0d0d0d)", borderColor: "rgba(255,255,255,0.06)" }}
    >
      {/* Left: art + info + like */}
      <div className="flex items-center gap-3 w-[240px] flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-lg overflow-hidden ring-2 flex-shrink-0 transition-all duration-500 ${isPlaying ? "ring-green-500" : "ring-white/10"}`}
          style={isPlaying ? { boxShadow: "0 0 14px rgba(29,185,84,0.35)" } : {}}
        >
          <img
            src={song.thumbnail || "/download.jpeg"}
            alt={song.title}
            className={`w-full h-full object-cover ${isPlaying ? "animate-spin-slow" : ""}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-semibold truncate">{song.title}</p>
          <p className="text-white/40 text-xs truncate mt-0.5">{song.description?.slice(0, 28)}</p>
        </div>
        <button
          onClick={() => setLiked(!liked)}
          className="flex-shrink-0 transition-all duration-200 hover:scale-110"
          title={liked ? "Remove from library" : "Save to library"}
        >
          {liked
            ? <FaHeart className="w-4 h-4 text-green-500" />
            : <FaRegHeart className="w-4 h-4 text-white/40 hover:text-white" />
          }
        </button>
      </div>

      {/* Center: controls + progress */}
      <div className="flex-1 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setShuffle(!shuffle)}
            className={`transition-all duration-200 hover:scale-110 relative ${shuffle ? "text-green-500" : "text-white/50 hover:text-white"}`}
            title="Shuffle"
          >
            <MdShuffle className="w-4 h-4" />
            {shuffle && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />}
          </button>

          <button onClick={prevSong} className="text-white/50 hover:text-white transition-all duration-200 hover:scale-110 active:scale-90">
            <GrChapterPrevious className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90"
            style={{ background: "white", boxShadow: isPlaying ? "0 0 16px rgba(29,185,84,0.3)" : "none" }}
          >
            {isPlaying ? <FaPause className="text-black text-xs" /> : <FaPlay className="text-black text-xs ml-0.5" />}
          </button>

          <button onClick={nextSong} className="text-white/50 hover:text-white transition-all duration-200 hover:scale-110 active:scale-90">
            <GrChapterNext className="w-4 h-4" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`transition-all duration-200 hover:scale-110 relative ${repeat !== "off" ? "text-green-500" : "text-white/50 hover:text-white"}`}
            title={`Repeat: ${repeat}`}
          >
            {repeat === "one" ? <MdRepeatOne className="w-4 h-4" /> : <MdRepeat className="w-4 h-4" />}
            {repeat !== "off" && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />}
          </button>
        </div>

        <div className="flex items-center gap-2 w-full max-w-lg">
          <span className="text-white/30 text-[10px] w-8 text-right tabular-nums">{fmt(progress)}</span>
          <input type="range" min={0} max={100} className="progress-bar flex-1" value={progressPct} onChange={handleSeek} />
          <span className="text-white/30 text-[10px] w-8 tabular-nums">{fmt(duration)}</span>
        </div>

        {song.audio && <audio ref={audioRef} src={song.audio} autoPlay={isPlaying} />}
      </div>

      {/* Right: eq + queue + volume */}
      <div className="flex items-center gap-3 w-[200px] flex-shrink-0 justify-end">
        {isPlaying && (
          <div className="flex items-end gap-[3px] h-4">
            <div className="eq-bar" /><div className="eq-bar" /><div className="eq-bar" /><div className="eq-bar" />
          </div>
        )}
        <button className="text-white/40 hover:text-white transition-colors" title="Queue">
          <MdQueueMusic className="w-4 h-4" />
        </button>
        <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors flex-shrink-0">
          {muted || volume === 0 ? <MdVolumeOff className="w-4 h-4" /> : <MdVolumeUp className="w-4 h-4" />}
        </button>
        <input
          type="range" min={0} max={100} step={1}
          className="volume-bar w-20"
          value={muted ? 0 : volume * 100}
          onChange={handleVolume}
        />
      </div>
    </div>
  );
};

export default Player;
