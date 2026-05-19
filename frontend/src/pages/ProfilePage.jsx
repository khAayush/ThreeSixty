import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import {
  PencilIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

// Compress an image File to a base64 JPEG (max 400px, 80% quality)
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 400;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const ProfilePage = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) { setIsLoading(false); return; }

        const parsedUser = JSON.parse(userStr);
        const userId = parsedUser._id || parsedUser.id;
        if (!userId) { setIsLoading(false); return; }

        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.user || data;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected after an error
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading("Uploading photo…");

    try {
      const base64 = await compressImage(file);

      const parsedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = parsedUser._id || parsedUser.id;

      const res = await fetch(`${API_URL}/users/${userId}/profile-image`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: base64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Profile picture updated!", { id: loadingToast });
    } catch (err) {
      toast.error(err.message || "Upload failed", { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="p-8 flex justify-center items-center h-full">
          <p className="text-slate-500 font-medium">Loading profile…</p>
        </div>
      </Layout>
    );
  }

  const userName = user?.name || "Unknown User";
  const userRole = user?.role || "Employee";
  const userEmail = user?.email || "No email provided";
  const dateJoined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : user?.joinDate || "Recently joined";
  const userImage = user?.profileImage || user?.avatar || null;
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <Layout onLogout={onLogout}>
      <Toaster position="top-right" />
      <main className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
            <p className="text-slate-500 text-sm mt-1">
              Manage your personal information and account settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
              <div className="relative group">
                {/* Avatar */}
                {userImage ? (
                  <img
                    src={userImage}
                    alt={userName}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl ring-1 ring-slate-100"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-brand flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-brand/20"
                  style={{ display: userImage ? "none" : "flex" }}
                >
                  {initials}
                </div>

                {/* Upload overlay spinner */}
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}

                {/* Upload pencil — hidden for Google accounts */}
                {!user?.isGoogleAccount && (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-2 md:bottom-2 md:right-4 bg-white p-2 rounded-full shadow-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors text-slate-600 hover:text-brand disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-800">{userName}</h3>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-1">
                {userRole}
              </p>
            </div>
          </div>

          {/* Account Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
                <h4 className="font-bold text-slate-700">Account Details</h4>
              </div>
              <div className="p-6 grid grid-cols-1 gap-8">
                <InfoItem icon={<UserIcon className="w-5 h-5" />} label="Full Name" value={userName} />
                <InfoItem icon={<EnvelopeIcon className="w-5 h-5" />} label="Email Address" value={userEmail} />
                <InfoItem icon={<CalendarDaysIcon className="w-5 h-5" />} label="Date Joined" value={dateJoined} />
              </div>
            </div>
          </div>
        </div>

        {/* Security card */}
        {user?.isGoogleAccount ? (
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4 mt-8">
            <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-slate-800 text-sm">Google Account</h5>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Your account is managed by Google. Email and password cannot be changed here.
                Profile picture is synced from your Google account.
              </p>
            </div>
          </div>
        ) : userRole.toLowerCase() === "admin" || userRole.toLowerCase() === "manager" ? (
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4 mt-8">
            <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-slate-800 text-sm">Account Security</h5>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                You can change your account information or delete your account from the{" "}
                <a href="/users" className="text-blue-500 hover:underline font-semibold">Users</a> tab.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4 mt-8">
            <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-500">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-slate-800 text-sm">Account Security</h5>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Your account is verified. Contact your IT administrator to change your account
                information or delete your account.
              </p>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1 text-slate-400">{icon}</div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

export default ProfilePage;
