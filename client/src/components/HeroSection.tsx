// If you put your video in src/assets as heroVideo.mp4
import heroVideo from "../assets/heroVideo.mp4";

const HeroSection = () => {
  return (
    <div
      className="relative bg-cover bg-center h-screen"
      // keep your background style or video here
    >
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={heroVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/50 to-black/70" />

      <div className="relative flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up">
          Welcome to <span className="text-amber-400">CHRIST University</span>
        </h1>

        <p className="text-white/90 text-lg sm:text-xl md:text-2xl max-w-3xl mb-8 animate-fade-in-up animation-delay-200">
          Your hassle-free parking solution at CHRIST University
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400">
          <a
            href="/vehicle-owner-login"
            className="px-8 py-4 bg-amber-500 text-white font-semibold rounded-full hover:bg-amber-600 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
          >
            Vehicle Owner Login
          </a>
          <a
            href="/admin-login"
            className="px-8 py-4 bg-white/10 text-white font-semibold rounded-full border-2 border-amber-400 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
          >
            Admin Login
          </a>
        </div>

        {/* <div className="absolute bottom-8 animate-bounce">
          <svg
            className="w-6 h-6 text-white/70"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div> */}
      </div>
    </div>
  );
};

export default HeroSection;
