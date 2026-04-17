import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import {
  Bars3Icon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import NotificationBell from "./NotificationBell";

const API_URL = import.meta.env.VITE_API_URL;
const INSTITUTION_NAME = import.meta.env.VITE_INSTITUTION_NAME;

const Header = ({
  onMenuClick,
  institutionName = INSTITUTION_NAME,
  onLogout,
}) => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch((err) => {
      console.error("Error during logout API call:", err);
    });

    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
    }

    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      handleLogout();
      return;
    }

    let userId = null;
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        userId = parsedUser._id || parsedUser.id;
      } catch (err) {
        console.error("Error parsing user data from localStorage:", err);
      }
    }

    if (!userId) {
      handleLogout();
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend returned an error:", errorData);
          throw new Error(errorData.message || "Failed to fetch profile");
        }

        const data = await response.json();
        const userData = data.user || data;

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();

    window.addEventListener("profileUpdated", fetchUserProfile);

    return () => {
      window.removeEventListener("profileUpdated", fetchUserProfile);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = user?.name || "User";
  const userRole = user?.role || "Administrator";
  const userImage = user?.profileImage || null;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex justify-between items-center sticky top-0 z-30 shrink-0">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-brand hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        <div className="text-slate-400 text-sm font-medium tracking-wide hidden sm:block">
          {institutionName}
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        <NotificationBell />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 group cursor-pointer focus:outline-none"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 leading-none mb-1 group-hover:text-brand transition-colors">
                {userName}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter">
                {userRole}
              </p>
            </div>

            <div className="relative">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shadow-md shadow-brand/20 ring-2 ring-transparent group-hover:ring-brand/30 transition-all"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}

              <div
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold shadow-md shadow-brand/20"
                style={{ display: userImage ? "none" : "flex" }}
              >
                {initials}
              </div>

              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm md:hidden">
                <ChevronDownIcon className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-50 md:hidden">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  {userRole}
                </p>
              </div>

              <Link
                to="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand transition-colors"
              >
                <UserCircleIcon className="w-5 h-5" />
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-slate-50 mt-1"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;