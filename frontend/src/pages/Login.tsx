import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserData } from "../context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { loginUser, btnLoading } = useUserData();

  async function submitHandler(e: any) {
    e.preventDefault();
    loginUser(email, password, navigate);
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "#1db954" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full blur-3xl opacity-15 animate-orb-pulse delay-300"
          style={{ background: "#7c3aed" }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 text-center">
        <div className="text-4xl font-black text-white tracking-tight">
          <span style={{ color: "#1db954" }}>♫</span> Spotify
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[400px] rounded-2xl p-8 shadow-2xl" style={{ background: "#121212" }}>
        <h1 className="text-3xl font-bold text-white text-center mb-8">Log in to Spotify</h1>

        <form onSubmit={submitHandler} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Email address</label>
            <input
              type="email"
              placeholder="name@domain.com"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button disabled={btnLoading} className="auth-btn mt-2">
            {btnLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-white/50 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-white font-semibold hover:text-green-400 transition-colors underline underline-offset-2">
              Sign up for Spotify
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
