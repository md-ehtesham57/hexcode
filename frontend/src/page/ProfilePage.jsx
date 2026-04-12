import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Camera,
  Mail,
  User,
  ShieldCheck,
  Globe,
  Save
} from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      return toast.error("Image size must be less than 1MB");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      // await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="min-h-screen pt-10 pb-20 px-4 animate-in fade-in duration-700">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* 1. Profile Hero Section */}
        <div className="bg-base-100 rounded-3xl p-8 shadow-2xl border border-base-content/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full ring-4 ring-primary/10 p-1 bg-base-200 overflow-hidden">
                <img
                  src={selectedImg || authUser?.image || `https://ui-avatars.com/api/?name=${authUser?.name}&background=6366f1&color=fff`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <Camera className="w-5 h-5 text-primary-content" />
                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUpdatingProfile} />
              </label>
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight">{authUser?.name}</h1>
              <div className="badge badge-primary badge-outline mt-1 font-mono text-[10px] uppercase tracking-tighter">
                {authUser?.role || "Standard User"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* 2. Left Column: Basic Info */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-content/5 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Personal Information
              </h2>
              <div className="grid gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-bold opacity-50 uppercase text-[10px]">Full Name</span></label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                    <input type="text" value={authUser?.name} readOnly className="input input-bordered w-full pl-11 bg-base-200/50 cursor-not-allowed" />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-bold opacity-50 uppercase text-[10px]">Email Address</span></label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                    <input type="email" value={authUser?.email} readOnly className="input input-bordered w-full pl-11 bg-base-200/50 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </div>

            {/* Links Section */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-content/5 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" /> Professional Links
              </h2>
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-2xl group transition-colors hover:bg-base-200">
                  {/* Inline GitHub SVG */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-50 group-hover:text-primary transition-colors"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>

                  <input
                    type="text"
                    placeholder="github.com/username"
                    className="bg-transparent border-none outline-none text-sm flex-1"
                  />
                </div>
                <button className="btn btn-primary btn-sm rounded-xl w-fit">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* 3. Right Column: Account Stats & Security */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-content/5 space-y-6 text-center md:text-left">
              <h2 className="text-lg font-bold flex items-center justify-center md:justify-start gap-2">
                <ShieldCheck className="w-5 h-5 text-success" /> Security
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-success/5 border border-success/10 rounded-2xl">
                  <p className="text-xs font-bold text-success uppercase">Account Verified</p>
                  <p className="text-[10px] opacity-60">Joined: {new Date(authUser?.createdAt).toLocaleDateString()}</p>
                </div>
                <button className="btn btn-outline btn-sm w-full rounded-xl">Change Password</button>
                <button className="btn btn-ghost btn-xs text-error w-full mt-4">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;