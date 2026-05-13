import { useState, useEffect, useRef, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSubmissionStore } from "../store/useSubmissionStore";
import {
  Camera, Mail, User, ShieldCheck, Globe, Save,
  Loader, Trophy, Target, X,
  Trash2, Lock, Eye, EyeOff, Check,
  Calendar, Hash, LogIn,
} from "lucide-react";
import toast from "react-hot-toast";
import AvatarPlaceholder from "../components/AvatarPlaceholder";

const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const PROVIDER_ICONS = {
  GOOGLE: "G",
  GITHUB: <GitHubIcon />,
  LOCAL: <Lock className="w-3.5 h-3.5" />,
};

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, changePassword, deleteAccount } = useAuthStore();
  const { submissions, getAllSubmissions } = useSubmissionStore();
  const fetchedRef = useRef(false);

  const [selectedImg, setSelectedImg] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [links, setLinks] = useState({ github: "", website: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authUser) {
      setLinks({ github: authUser.github || "", website: authUser.website || "" });
      setNameInput(authUser.name || "");
      setSelectedImg(null);
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser && submissions.length === 0 && !fetchedRef.current) {
      fetchedRef.current = true;
      getAllSubmissions();
    }
  }, [authUser, getAllSubmissions, submissions.length]);

  const hasUnsavedChanges = useMemo(() => {
    if (!authUser) return false;
    const nameChanged = nameInput.trim() !== (authUser.name || "");
    const githubChanged = links.github !== (authUser.github || "");
    const websiteChanged = links.website !== (authUser.website || "");
    const imageChanged = selectedImg !== null && selectedImg !== authUser.image;
    return nameChanged || githubChanged || websiteChanged || imageChanged;
  }, [authUser, nameInput, links, selectedImg]);

  const pendingCount = useMemo(() => {
    if (!authUser) return 0;
    let count = 0;
    if (nameInput.trim() !== (authUser.name || "")) count++;
    if (links.github !== (authUser.github || "")) count++;
    if (links.website !== (authUser.website || "")) count++;
    if (selectedImg !== null && selectedImg !== authUser.image) count++;
    return count;
  }, [authUser, nameInput, links, selectedImg]);

  const solvedCount = [...new Set(
    submissions.filter(s => s.status === "Accepted").map(s => s.problemId)
  )].length;
  const acceptedCount = submissions.filter(s => s.status === "Accepted").length;
  const accuracy = submissions.length > 0
    ? ((acceptedCount / submissions.length) * 100).toFixed(1)
    : 0;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) return toast.error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
    if (file.size > 1024 * 1024) return toast.error("File is too large (>1MB)");
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setSelectedImg(reader.result);
      setImgError(false);
    };
  };

  const handleSaveAll = async () => {
    if (!authUser || !hasUnsavedChanges) {
      return toast.error("No changes detected");
    }

    const payload = {};
    const nameTrimmed = nameInput.trim();
    if (nameTrimmed !== (authUser.name || "")) payload.name = nameTrimmed;
    if (links.github !== (authUser.github || "")) payload.github = links.github;
    if (links.website !== (authUser.website || "")) payload.website = links.website;
    if (selectedImg !== null && selectedImg !== authUser.image) payload.profilePic = selectedImg;

    if (Object.keys(payload).length === 0) {
      return toast.error("No changes detected");
    }

    await updateProfile(payload);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      return toast.error("Fill in both fields");
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }
    setChangingPassword(true);
    const ok = await changePassword(passwordForm);
    setChangingPassword(false);
    if (ok) {
      setPasswordForm({ oldPassword: "", newPassword: "" });
      setShowPasswordForm(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await deleteAccount();
    setDeleting(false);
    setShowDeleteModal(false);
  };

  const provider = authUser?.provider || "LOCAL";
  const isLocalUser = provider === "LOCAL";
  const providerLabel = provider === "GOOGLE" ? "Google" : provider === "GITHUB" ? "GitHub" : "Email";

  return (
    <div className="min-h-screen pt-10 pb-32 px-4 animate-in fade-in duration-700 relative">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ========== HERO ========== */}
        <div className="bg-base-100 rounded-3xl p-8 shadow-2xl border border-base-content/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <div className="indicator">
                {isUpdatingProfile && (
                  <span className="indicator-item indicator-middle indicator-center z-10">
                    <span className="loading loading-ring loading-lg text-primary" />
                  </span>
                )}
                <div className={`w-28 h-28 rounded-full ring-4 p-1 bg-base-200 overflow-hidden flex items-center justify-center transition-all ${isUpdatingProfile ? "ring-primary/50 blur-sm" : "ring-primary/10"}`}>
                  {!imgError ? (
                    <img
                      src={selectedImg || authUser?.image || `https://ui-avatars.com/api/?name=${authUser?.name}&background=4f46e5&color=fff`}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover transition-transform group-hover:scale-110"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <AvatarPlaceholder className="w-full h-full" />
                  )}
                </div>
              </div>
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer shadow-lg transition-all ${isUpdatingProfile ? "bg-base-300 pointer-events-none" : "bg-primary hover:scale-110 active:scale-95"}`}
              >
                {isUpdatingProfile ? <Loader className="w-4 h-4 animate-spin text-base-content" /> : <Camera className="w-4 h-4 text-primary-content" />}
                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUpdatingProfile} />
              </label>
              {selectedImg && !isUpdatingProfile && (
                <button
                  onClick={() => setSelectedImg(null)}
                  className="absolute -top-1 -right-1 bg-error text-error-content rounded-full w-5 h-5 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{authUser?.name}</h1>
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <div className="badge badge-primary badge-outline font-mono text-[10px] uppercase tracking-tighter">
                  {authUser?.role || "USER"}
                </div>
                <div className={`badge gap-1 font-mono text-[10px] ${isLocalUser ? "badge-ghost" : "badge-secondary badge-outline"}`}>
                  {PROVIDER_ICONS[provider] || null}
                  {providerLabel}
                </div>
              </div>
              <p className="text-sm opacity-60 flex items-center gap-1.5 justify-center sm:justify-start">
                <Mail className="w-3.5 h-3.5" />
                {authUser?.email}
              </p>
            </div>
          </div>
        </div>

        {/* ========== STATS ROW ========== */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-base-100 rounded-2xl p-5 shadow-xl border-b-4 border-primary text-center">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-black text-primary">{solvedCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Solved</p>
          </div>
          <div className="bg-base-100 rounded-2xl p-5 shadow-xl border-b-4 border-secondary text-center">
            <Hash className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-2xl font-black text-secondary">{submissions.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Submissions</p>
          </div>
          <div className="bg-base-100 rounded-2xl p-5 shadow-xl border-b-4 border-accent text-center">
            <Target className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-2xl font-black text-accent">{accuracy}%</p>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Accuracy</p>
          </div>
        </div>

        {/* ========== TWO-COLUMN LAYOUT ========== */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

          {/* LEFT COLUMN (3/5) */}
          <div className="md:col-span-3 space-y-6">

            {/* --- Personal Info --- */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-content/5 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Personal Information
              </h2>
              <div className="grid gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-bold opacity-50 uppercase text-[10px]">Full Name</span></label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className={`input input-bordered w-full pl-11 ${nameInput.trim() !== (authUser?.name || "") ? "input-warning" : ""}`}
                    />
                    {nameInput.trim() !== (authUser?.name || "") && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <span className="badge badge-warning badge-xs">edited</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-bold opacity-50 uppercase text-[10px]">Email Address</span></label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                    <input type="email" value={authUser?.email || ""} readOnly className="input input-bordered w-full pl-11 bg-base-200/50 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </div>

            {/* --- Professional Links --- */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-content/5 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" /> Professional Links
              </h2>
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-2xl group transition-colors hover:bg-base-200">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:text-primary transition-colors shrink-0">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  <input
                    type="text"
                    value={links.github}
                    onChange={(e) => setLinks({ ...links, github: e.target.value })}
                    placeholder="github.com/username"
                    className="bg-transparent border-none outline-none text-sm flex-1"
                  />
                  {links.github !== (authUser?.github || "") && (
                    <span className="badge badge-warning badge-xs shrink-0">edited</span>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-2xl group transition-colors hover:bg-base-200">
                  <Globe className="w-5 h-5 opacity-50 group-hover:text-primary transition-colors shrink-0" />
                  <input
                    type="text"
                    value={links.website}
                    onChange={(e) => setLinks({ ...links, website: e.target.value })}
                    placeholder="yourportfolio.com"
                    className="bg-transparent border-none outline-none text-sm flex-1"
                  />
                  {links.website !== (authUser?.website || "") && (
                    <span className="badge badge-warning badge-xs shrink-0">edited</span>
                  )}
                </div>
              </div>
            </div>

            {/* --- Password Change (local users only) --- */}
            {isLocalUser && (
              <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-content/5 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-warning" /> Password
                </h2>
                {showPasswordForm ? (
                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Current password"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        className="input input-bordered w-full pl-11 pr-11"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New password (min 6 chars)"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="input input-bordered w-full pl-11 pr-11"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={changingPassword} className="btn btn-primary btn-sm rounded-xl">
                        {changingPassword ? <Loader className="w-4 h-4 animate-spin" /> : null}
                        Update Password
                      </button>
                      <button type="button" onClick={() => { setShowPasswordForm(false); setPasswordForm({ oldPassword: "", newPassword: "" }); }} className="btn btn-ghost btn-sm rounded-xl">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowPasswordForm(true)} className="btn btn-outline btn-sm rounded-xl">
                    Change Password
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (2/5) */}
          <div className="md:col-span-2 space-y-6">

            {/* --- Account Info --- */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-content/5 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-success" /> Account
              </h2>
              <div className="p-4 bg-success/5 border border-success/10 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-success">Verified</p>
                  <p className="text-xs opacity-60">Signed in via {providerLabel}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 opacity-60">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                  <LogIn className="w-4 h-4" />
                  <span>Provider: {providerLabel}</span>
                </div>
              </div>
            </div>

            {/* --- Danger Zone --- */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-error/10 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-error">
                <Trash2 className="w-5 h-5" /> Danger Zone
              </h2>
              <p className="text-xs opacity-60">Once deleted, your account and all data are permanently removed.</p>
              <button onClick={() => setShowDeleteModal(true)} className="btn btn-outline btn-error btn-sm w-full rounded-xl">
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== STICKY SAVE FOOTER ========== */}
      <div className="sticky bottom-0 z-40 mt-8 -mx-4 px-4 py-4 bg-base-300/80 backdrop-blur-md border-t border-base-content/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <>
                <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                <p className="text-sm font-bold">
                  <span className="text-warning">{pendingCount}</span> unsaved change{pendingCount > 1 ? "s" : ""}
                </p>
              </>
            )}
            {!hasUnsavedChanges && (
              <p className="text-xs opacity-40">All changes saved</p>
            )}
          </div>
          <button
            onClick={handleSaveAll}
            disabled={isUpdatingProfile}
            className="btn btn-primary rounded-xl"
          >
            {isUpdatingProfile ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-base-100 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 border border-error/20 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-xl font-black">Delete Account</h3>
              <p className="text-sm opacity-70">
                This action is <span className="text-error font-bold">irreversible</span>. All your submissions, problems, playlists, and account data will be permanently deleted.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-ghost flex-1 rounded-xl"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-error flex-1 rounded-xl"
                  disabled={deleting}
                >
                  {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
