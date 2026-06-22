const Loading = () => {
  return (
    <div
      className="flex flex-col justify-center items-center h-screen"
      style={{ background: "#0a0a0a" }}
    >
      <div className="relative w-20 h-20 mb-7">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-[3px] border-transparent animate-spin"
          style={{ borderTopColor: "#1db954", animationDuration: "1.1s" }}
        />
        {/* Inner ring (reverse) */}
        <div
          className="absolute inset-[7px] rounded-full border-[2px] border-transparent animate-spin"
          style={{
            borderBottomColor: "#7c3aed",
            animationDuration: "0.8s",
            animationDirection: "reverse",
          }}
        />
        {/* Center glow dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-4 h-4 rounded-full bg-green-500 animate-pulse"
            style={{ boxShadow: "0 0 14px rgba(29,185,84,0.7)" }}
          />
        </div>
        {/* Slow ping ring */}
        <div
          className="absolute inset-0 rounded-full border border-green-500/20 animate-ping-slow"
        />
      </div>

      <p
        className="text-white/25 text-[10px] tracking-[0.45em] uppercase font-light animate-pulse"
        style={{ animationDuration: "2s" }}
      >
        Loading
      </p>
    </div>
  );
};

export default Loading;
