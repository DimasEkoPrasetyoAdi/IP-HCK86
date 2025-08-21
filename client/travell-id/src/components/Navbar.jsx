import { useNavigate, useLocation } from "react-router";

export default function Navbar(){
  const navigate = useNavigate();
  const loc = useLocation();
  const link = (path,label)=>{
    const active = loc.pathname.startsWith(path);
    return (
      <button
        onClick={()=>navigate(path)}
        className={`relative px-4 py-2 text-xs md:text-sm font-medium tracking-wide rounded-full transition-colors ${active? 'text-white bg-white/15':'text-cyan-100/70 hover:text-white hover:bg-white/10'} backdrop-blur-sm`}
      >{label}</button>
    );
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-4 flex items-center justify-between bg-[#061a2d]/60 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-2 select-none">
        <span className="text-lg md:text-2xl font-extrabold tracking-wider text-white">TRAVELL<span className="text-cyan-300">ID</span></span>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {link('/trips','Trips')}
        {link('/favourites','Favourites')}
        {link('/','Home')}
        <button
          onClick={()=>{ localStorage.removeItem('access_token'); navigate('/'); }}
          className="relative px-6 py-2 rounded-full font-semibold text-[#06253d] bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200 hover:from-cyan-200 hover:to-blue-100 shadow-md shadow-cyan-900/30 ring-1 ring-white/30 text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
        >Logout</button>
      </div>
    </nav>
  );
}