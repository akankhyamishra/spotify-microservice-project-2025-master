import React, { useEffect, useRef, useState } from "react";
import { useSongData } from "../context/SongContext";
import { FaPlay, FaPause, FaVolumeUp } from "react-icons/fa";
import { GrChapterNext, GrChapterPrevious } from "react-icons/gr";

const Player = () => {
  const {
    song,
    fetchSingleSong,
    selectedSong,
    isPlaying,
    setIsPlaying,
    prevSong,
    nextSong,
  } = useSongData();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onMeta = () => setDuration(audio.duration || 0);
    const onTime = () => setProgress(audio.currentTime || 0);

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate", onTime);
    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate", onTime);
    };
  }, [song]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value) / 100;
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
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

  useEffect(() => {
    fetchSingleSong();
  }, [selectedSong]);

  if (!song) return null;

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className="h-[80px] flex items-center px-4 gap-4 border-t animate-fade-in"
      style={{
        background: "linear-gradient(to right, #0d0d0d, #111111, #0d0d0d)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Left: Album art + song info ── */}
      <div className="flex items-center gap-3 w-[220px] flex-shrink-0">
        <div className="relative flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-full overflow-hidden ring-2 transition-all duration-500 ${
              isPlaying ? "ring-green-500" : "ring-white/10"
            }`}
            style={
              isPlaying
                ? { boxShadow: "0 0 14px rgba(29,185,84,0.35)" }
                : {}
            }
          >
            <img
              src={song.thumbnail || "/download.jpeg"}
              alt={song.title}
              className={`w-full h-full object-cover ${
                isPlaying ? "animate-spin-slow" : ""
              }`}
            />
          </div>
          {/* Playing indicator dot */}
          {isPlaying && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0d0d0d]" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{song.title}</p>
          <p className="text-white/40 text-xs truncate mt-0.5">
            {song.description?.slice(0, 28)}
          </p>
        </div>
      </div>

      {/* ── Center: Controls + progress ── */}
      <div className="flex-1 flex flex-col items-center gap-2">
        {/* Eq bars + controls */}
        <div className="flex items-center gap-5">
          {isPlaying && (
            <div className="flex items-end gap-[3px] h-4 mr-1">
              <div className="eq-bar" />
              <div className="eq-bar" />
              <div className="eq-bar" />
              <div className="eq-bar" />
            </div>
          )}

          <button
            onClick={prevSong}
            className="text-white/50 hover:text-white transition-all duration-200 hover:scale-110 active:scale-90"
          >
            <GrChapterPrevious className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90"
            style={{
              background: "white",
              boxShadow: isPlaying ? "0 0 16px rgba(29,185,84,0.3)" : "none",
            }}
          >
            {isPlaying ? (
              <FaPause className="text-black text-xs" />
            ) : (
              <FaPlay className="text-black text-xs ml-0.5" />
            )}
          </button>

          <button
            onClick={nextSong}
            className="text-white/50 hover:text-white transition-all duration-200 hover:scale-110 active:scale-90"
          >
            <GrChapterNext className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar + time */}
        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-white/30 text-[10px] w-8 text-right tabular-nums">
            {fmt(progress)}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            className="progress-bar flex-1"
            value={progressPct}
            onChange={handleSeek}
          />
          <span className="text-white/30 text-[10px] w-8 tabular-nums">
            {fmt(duration)}
          </span>
        </div>

        {song.audio && (
          <audio ref={audioRef} src={song.audio} autoPlay={isPlaying} />
        )}
      </div>

      {/* ── Right: Volume ── */}
      <div className="flex items-center gap-2 w-[140px] flex-shrink-0 justify-end">
        <FaVolumeUp className="text-white/40 w-3.5 h-3.5 flex-shrink-0" />
        <input
          type="range"
          min={0}
          max={100}
          step={0.01}
          className="volume-bar w-24"
          value={volume * 100}
          onChange={handleVolume}
        />
      </div>
    </div>
  );
};

export default Player;
