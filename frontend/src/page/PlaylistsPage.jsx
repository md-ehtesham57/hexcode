import React, { useEffect } from "react";
import { usePlaylistStore } from "../store/usePlaylistStore";
import { Library, Trash2, ExternalLink, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const PlaylistsPage = () => {
  const { playlists, getAllPlaylists, deletePlaylist, isLoading } = usePlaylistStore();

  useEffect(() => {
    getAllPlaylists();
  }, [getAllPlaylists]);

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-base-content">
            <Library className="text-primary w-8 h-8" /> My Playlists
          </h1>
          <p className="text-base-content/50 mt-1">Manage your curated collections of problems.</p>
        </div>
        
        <Link to="/" className="btn btn-ghost btn-sm gap-2">
          <Plus className="w-4 h-4" />
          Browse Problems
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <span className="loading loading-ring loading-lg text-primary"></span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && playlists.length === 0 && (
        <div className="text-center py-32 bg-base-200/50 rounded-3xl border-2 border-dashed border-base-content/10">
          <Library className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-semibold opacity-50">No playlists found</h3>
          <p className="opacity-40 mt-2">Create a playlist from the problems table to get started.</p>
        </div>
      )}

      {/* Playlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <div 
            key={playlist.id} 
            className="group relative bg-base-200/50 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-primary/40 transition-all duration-300 shadow-xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <Library className="w-6 h-6" />
              </div>
              <button 
                onClick={() => {
                  if(window.confirm("Are you sure you want to delete this playlist?")) {
                    deletePlaylist(playlist.id);
                  }
                }} 
                className="btn btn-ghost btn-circle btn-sm text-error opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-base-content mb-2 truncate">
              {playlist.name}
            </h2>
            
            <p className="text-sm text-base-content/60 line-clamp-2 mb-6 h-10">
              {playlist.description || "No description provided."}
            </p>
            
            <div className="pt-4 border-t border-white/5">
              <Link 
                to={`/playlists/${playlist.id}`} 
                className="flex items-center justify-between text-primary font-bold hover:gap-2 transition-all group/link"
              >
                <span>View Problems</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistsPage;