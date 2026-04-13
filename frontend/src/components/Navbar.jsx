import { useState } from "react";
import { User, Code, LogOut, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import AvatarPlaceholder from "./AvatarPlaceholder";
import HexcodeLogo from "./HexcodeLogo";

const Navbar = () => {
  const { authUser } = useAuthStore();
  const [imgError, setImgError] = useState(false); // 2. Track error state

  return (
    <nav className="sticky top-0 z-50 w-full py-5">
      <div className="flex w-full justify-between mx-auto max-w-4xl bg-black/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-gray-200/10 p-4 rounded-2xl">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <HexcodeLogo className="w-9 h-9 transition-transform duration-300 group-hover:rotate-6" color="#a855f7" />

          <span className="text-xl font-light tracking-[0.4em] text-base-content/90 uppercase font-sans ml-2">
            Hexcode
          </span>
        </Link>

        {/* User Profile and Dropdown */}
        <div className="flex items-center gap-8">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full border border-primary/20 flex items-center justify-center overflow-hidden">
                {!imgError ? (
                  <img
                    src={authUser?.image || `https://ui-avatars.com/api/?name=${authUser?.name}`}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)} // 4. Set error to true on failure
                  />
                ) : (
                  <AvatarPlaceholder className="w-full h-full" /> // 5. Show offline SVG
                )}
              </div>
            </label>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-3 shadow-2xl bg-base-100 rounded-box w-60 space-y-1 border border-base-content/5"
            >
              {/* User Header Section */}
              <li className="px-4 py-3 mb-1">
                <div className="flex flex-col items-start p-0 hover:bg-transparent">
                  <span className="text-base font-black text-primary leading-none">
                    {authUser?.name}
                  </span>
                  <span className="text-[10px] opacity-50 font-medium truncate w-full mt-1">
                    {authUser?.email}
                  </span>
                </div>
              </li>

              <div className="divider my-0 opacity-10"></div>

              {/* Dashboard Link */}
              <li>
                <Link to="/dashboard" className="flex items-center gap-3 py-3 px-4 hover:bg-primary hover:text-white rounded-xl transition-all duration-200 font-semibold">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              </li>

              {/* Profile Link */}
              <li>
                <Link to="/profile" className="flex items-center gap-3 py-3 px-4 hover:bg-primary hover:text-white rounded-xl transition-all duration-200 font-semibold">
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
              </li>

              {authUser?.role === "ADMIN" && (
                <li>
                  <Link to="/add-problem" className="flex items-center gap-3 py-3 px-4 hover:bg-secondary hover:text-white rounded-xl transition-all duration-200 font-semibold text-secondary">
                    <Code className="w-4 h-4" />
                    Add Problem
                  </Link>
                </li>
              )}

              <div className="divider my-0 opacity-10"></div>

              <li>
                <LogoutButton className="flex items-center gap-3 py-3 px-4 hover:bg-error hover:text-white rounded-xl transition-all duration-200 font-semibold text-error">
                  <LogOut className="w-4 h-4" />
                  Logout
                </LogoutButton>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;