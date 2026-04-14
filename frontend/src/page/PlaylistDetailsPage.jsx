import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePlaylistStore } from "../store/usePlaylistStore";
import { Play, ChevronLeft, Clock, BarChart3, LayoutGrid } from "lucide-react";

const PlaylistDetailsPage = () => {
  const { id } = useParams();
  const { currentPlaylist, getPlaylistDetails, isLoading } = usePlaylistStore();

  useEffect(() => {
    if (id) getPlaylistDetails(id);
  }, [id]);

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <span className="loading loading-ring loading-lg text-primary"></span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      
      {/* NAVIGATION BREADCRUMB */}
      <nav className="flex items-center gap-2">
        <Link to="/playlists" className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-base-content/40 hover:text-primary transition-all">
          <ChevronLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
          Back to Collections
        </Link>
      </nav>

      {/* GLASS HEADER SECTION */}
      <header className="relative p-8 rounded-3xl bg-black/10 border border-white/5 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <LayoutGrid className="w-24 h-24 text-primary" />
        </div>
        
        <div className="relative z-10">
          <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-[0.2em] font-bold mb-4 inline-block">
            Curated Playlist
          </span>
          <h1 className="text-5xl font-light tracking-tight text-base-content mb-3 uppercase font-sans">
            {currentPlaylist?.name}
          </h1>
          <p className="text-base-content/50 max-w-xl font-medium leading-relaxed">
            {currentPlaylist?.description || "No description provided for this collection."}
          </p>
        </div>
      </header>

      {/* PROBLEM LIST SECTION */}
      <div className="space-y-3">
        {currentPlaylist?.problems?.length > 0 ? (
          currentPlaylist.problems.map((item) => (
            <div 
              key={item.id} 
              className="group flex items-center justify-between p-4 bg-black/5 hover:bg-white/[0.02] border border-white/5 hover:border-primary/30 rounded-2xl transition-all duration-500 shadow-sm"
            >
              <div className="flex items-center gap-5">
                {/* Difficulty Indicator Dot */}
                <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                  item.problem.difficulty === 'EASY' ? 'bg-emerald-400' : 
                  item.problem.difficulty === 'MEDIUM' ? 'bg-amber-400' : 'bg-rose-500'
                }`} />
                
                <div>
                  <h3 className="text-lg font-medium text-base-content/90 group-hover:text-white transition-colors">
                    {item.problem.title}
                  </h3>
                  <div className="flex gap-4 mt-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-base-content/30">
                    <span className="flex items-center gap-1.5"><BarChart3 className="w-3 h-3"/> {item.problem.difficulty}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3"/> {new Date(item.problem.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON - HEXCODE STYLE */}
              <Link 
                to={`/problem/${item.problem.id}`} 
                className="relative overflow-hidden group/btn px-6 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all duration-300 border border-primary/20"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest">Begin</span>
                  <Play className="w-3 h-3 fill-current" />
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl opacity-30">
            <p className="uppercase tracking-[0.4em] text-xs">Collection is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetailsPage;