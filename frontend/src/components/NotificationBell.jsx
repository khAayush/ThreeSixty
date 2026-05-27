import { useState, useRef, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "../contexts/NotificationContext";

// Map notification type to route for the current user's role
const getRoute = (notif) => {
  const role = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}").role; } catch { return null; }
  })();

  switch (notif.type) {
    case "chat:new_message":       return "/chat";
    case "user:pending_approval":  return "/users";
    case "asset:request_new":      return "/assignments";
    case "asset:request_updated":  return role === "employee" ? "/my-assignments" : "/assignments";
    case "ticket:new":             return "/tickets";
    case "ticket:closed":          return "/my-tickets";
    case "lostfound:new":          return "/lost-found";
    default:                       return null;
  }
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotifClick = (notif) => {
    if (!notif.isRead) markAsRead(notif._id);
    setOpen(false);
    const route = getRoute(notif);
    if (route) navigate(route);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-1 text-slate-400 hover:text-brand transition-colors duration-200"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4.5 h-4.5 text-[10px] font-bold text-white bg-brand rounded-full px-1 border-2 border-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => { markAllAsRead(); }}
                className="text-xs text-brand hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No notifications</p>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => handleNotifClick(notif)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                    !notif.isRead ? "bg-brand/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${
                        !notif.isRead ? "bg-brand" : "bg-transparent"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 wrap-break">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
