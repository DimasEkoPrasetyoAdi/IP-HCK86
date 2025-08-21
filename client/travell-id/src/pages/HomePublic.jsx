import { Link } from "react-router";

// Sederhana: hanya hero seperti desain referensi (biru) + login & join
export default function HomePublic() {
  // Gambar tetap (tidak random) sesuai tema liburan Indonesia
  const bgImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80'; // Pantai / ombak tropis
  return (
    <div className="min-h-screen bg-[#0a3356] text-white overflow-hidden relative">
      {/* Gradient outer frame */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0d5fa9] via-[#0c4e86] to-[#082b48] opacity-90" />

      {/* NAVBAR */}
      <nav className="absolute top-0 left-0 w-full z-30">
        <div className="max-w-7xl mx-auto px-8 pt-8 flex justify-between items-center text-sm tracking-wide font-medium">
          <div className="flex items-center gap-3 select-none">
            <span className="text-xl md:text-2xl font-extrabold tracking-wider">TRAVELL<span className="text-cyan-300">ID</span></span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              to="/login"
              className="relative px-6 py-2 rounded-full font-medium text-cyan-100/90 bg-white/5 border border-white/30 backdrop-blur-md hover:bg-white/10 hover:text-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="relative px-7 py-2 rounded-full font-semibold text-[#06253d] bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200 hover:from-cyan-200 hover:to-blue-100 shadow-lg shadow-cyan-900/30 ring-1 ring-white/40 hover:shadow-cyan-800/40 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
            >
              Join
              <span className="absolute inset-0 rounded-full pointer-events-none ring-1 ring-white/30 mix-blend-overlay" />
            </Link>
          </div>
        </div>
      </nav>

      {/* BACKGROUND IMAGE */}
      <img
        src={bgImage}
        alt="Indonesia Travel"
        className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.85] contrast-110 saturate-125"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#061a2d]/90 via-[#06253d]/70 to-[#0d5fa9]/40" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-40 md:pt-48">
        <div className="max-w-3xl">
          <h1 className="leading-[0.92] font-extrabold text-5xl sm:text-6xl md:text-7xl">
            <span className="block">WORLD</span>
            <span className="block">OF <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-200 drop-shadow">PARADISE</span>,</span>
            <span className="block">INDONESIA</span>
          </h1>
          <p className="mt-8 text-sm sm:text-base text-cyan-100/80 leading-relaxed max-w-xl">
            Let's explore one of the third largest countries in the world, namely Indonesia. Enjoy vacation packages at
            competitive prices and a strong soul.
          </p>
        </div>

  {/* INFO ROW removed: sebelumnya hanya garis dekorasi */}
      </div>

      {/* Bottom subtle gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#061a2d] to-transparent" />
    </div>
  );
}
