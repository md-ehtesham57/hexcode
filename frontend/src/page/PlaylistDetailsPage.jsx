import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePlaylistStore } from "../store/usePlaylistStore";
import { Play, ChevronLeft, Clock, BarChart3, LayoutGrid, Code2 } from "lucide-react";

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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* NAVIGATION */}
      <nav className="flex items-center gap-2">
        <Link to="/playlists" className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-base-content/40 hover:text-primary transition-all">
          <ChevronLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
          Collections
        </Link>
      </nav>

      {/* INTEGRATED GLASS CONTAINER */}
      <div className="relative rounded-[2.5rem] bg-black/10 border border-white/5 backdrop-blur-2xl overflow-hidden shadow-2xl">
        
        {/* PLAYLIST INFO HEADER */}
        <div className="p-10 pb-8 border-b border-white/[0.03]">
          <div className="flex justify-between items-center gap-10">
            <div className="space-y-4">
              <span className="text-[9px] bg-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-[0.25em] font-black">
                Curated Playlist
              </span>
              <h1 className="text-5xl font-light tracking-tighter text-base-content uppercase">
                {currentPlaylist?.name}
              </h1>
              <p className="text-base-content/40 max-w-lg text-sm font-medium leading-relaxed">
                {currentPlaylist?.description || "No description provided."}
              </p>
            </div>
            
            {/* Minimal Stats Badge */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-4 text-center min-w-[50px]">
                <div className="text-2xl font-light text-primary">{currentPlaylist?.problems?.length || 0}</div>
                <div className="text-[8px] uppercase tracking-widest text-base-content/30 font-bold">Problems</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/[0.01]">
          <div className="space-y-2">
            {currentPlaylist?.problems?.length > 0 ? (
              currentPlaylist.problems.map((item) => (
                <Link 
                  key={item.id}
                  to={`/problem/${item.problem.id}`}
                  className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      item.problem.difficulty === 'EASY' ? 'bg-emerald-400' : 
                      item.problem.difficulty === 'MEDIUM' ? 'bg-amber-400' : 'bg-rose-500'
                    } shadow-[0_0_8px_rgba(0,0,0,0.4)]`} />
                    
                    <div>
                      <h3 className="text-md font-medium text-base-content/80 group-hover:text-primary transition-colors">
                        {item.problem.title}
                      </h3>
                      <div className="flex gap-3 mt-1 text-[8px] font-bold uppercase tracking-[0.1em] text-base-content/20">
                         <span className="flex items-center gap-1"><BarChart3 className="w-2.5 h-2.5"/> {item.problem.difficulty}</span>
                         <span className="flex items-center gap-1"><Code2 className="w-2.5 h-2.5"/> {item.problem.category || "Logic"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all text-primary">
                      Begin
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-12 text-center text-[10px] uppercase tracking-[0.3em] opacity-20">
                Playlist is empty
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailsPage;