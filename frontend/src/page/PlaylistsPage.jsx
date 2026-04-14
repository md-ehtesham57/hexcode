import React, { useEffect } from "react";
import { usePlaylistStore } from "../store/usePlaylistStore";
import { Library, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const PlaylistsPage = () => {
  const { playlists, getAllPlaylists, deletePlaylist, isLoading } = usePlaylistStore();

  useEffect(() => {
    getAllPlaylists();
  }, [getAllPlaylists]);

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Library className="text-primary" /> My Playlists
        </h1>
      </div>

      {isLoading && <span className="loading loading-dots loading-lg"></span>}

      {!isLoading && playlists.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <p>You haven't created any playlists yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="bg-base-200 p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all">
            <h2 className="text-xl font-bold mb-2">{playlist.name}</h2>
            <p className="text-sm opacity-60 line-clamp-2 mb-4">{playlist.description}</p>
            
            <div className="flex justify-between items-center">
              <Link to={`/playlists/${playlist.id}`} className="text-primary hover:underline font-semibold">
                View Problems
              </Link>
              <button onClick={() => deletePlaylist(playlist.id)} className="text-error hover:scale-110 transition-transform">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistsPage;