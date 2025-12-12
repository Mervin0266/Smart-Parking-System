import { useNavigate } from "react-router-dom";
import bgImage from "../assets/login-bg.jpg";
import logo from "../assets/ChristLogo.png";

const AdminLoginPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add real auth here; for now just navigate
    localStorage.setItem("token", "dummy-admin-token");
    localStorage.setItem("role", "admin");
    navigate("/admin-dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-md w-full bg-white/10 border border-white/20 rounded-3xl shadow-2xl backdrop-blur-xl px-8 py-10">
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo}
            alt="Christ University Logo"
            className="w-60 h-20 mb-3"
          />
          <h2 className="text-2xl font-semibold text-white tracking-wide">
            Admin Login
          </h2>
          <p className="text-sm text-white/70 mt-1">
            Sign in to manage parking slots
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-transparent"
              placeholder="admin@christuniversity.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-white/70">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/40 bg-white/10 text-amber-400 focus:ring-amber-400"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="text-amber-300 hover:text-amber-200 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 text-white font-semibold shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-transform transform hover:-translate-y-0.5 hover:shadow-amber-500/50"
          >
            Login
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 w-full text-center text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default AdminLoginPage;
