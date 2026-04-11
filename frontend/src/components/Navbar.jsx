import { User, Code, LogOut, LayoutDashboard } from "lucide-react"; // Added LayoutDashboard
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const Navbar = () => {
  const { authUser } = useAuthStore()

  return (
    <nav className="sticky top-0 z-50 w-full py-5">
      <div className="flex w-full justify-between mx-auto max-w-4xl bg-black/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-gray-200/10 p-4 rounded-2xl">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <img src="/leetlab.svg" className="h-18 w-18 bg-primary/20 text-primary border-none px-2 py-2 rounded-full" />
          <span className="text-lg md:text-2xl font-bold tracking-tight text-white hidden md:block">
            Leetlab
          </span>
        </Link>

        {/* User Profile and Dropdown */}
        <div className="flex items-center gap-8">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full border border-primary/20">
                <img
                  src={authUser?.image || "https://ui-avatars.com/api/?name=" + authUser?.name} 
                  alt="User Avatar"
                  className="object-cover"
                  onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + authUser?.name; }} 
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 space-y-2"
            >
              <li>
                <div className="flex flex-col items-start px-4 py-2">
                  <span className="text-sm font-bold text-primary">{authUser?.name}</span>
                  <span className="text-[10px] opacity-50 truncate w-full">{authUser?.email}</span>
                </div>
                <hr className="border-base-content/10 my-1" />
              </li>

              {/* NEW DASHBOARD LINK (The Stats Page) */}
              <li>
                <Link
                  to="/dashboard"
                  className="hover:bg-primary hover:text-white text-sm font-semibold py-2"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </li>

              {/* UPDATED PROFILE LINK (The Settings Page) */}
              <li>
                <Link
                  to="/profile"
                  className="hover:bg-primary hover:text-white text-sm font-semibold py-2"
                >
                  <User className="w-4 h-4 mr-2" />
                  Account Settings
                </Link>
              </li>

              {authUser?.role === "ADMIN" && (
                <li>
                  <Link
                    to="/add-problem"
                    className="hover:bg-primary hover:text-white text-sm font-semibold py-2"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Add Problem
                  </Link>
                </li>
              )}

              <li>
                <LogoutButton className="hover:bg-error hover:text-white text-sm font-semibold py-2 mt-2">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </LogoutButton>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;