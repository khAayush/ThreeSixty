import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io } from "socket.io-client";

const NotificationContext = createContext(null);
const API = import.meta.env.VITE_API_URL;

export const NotificationProvider = ({ currentUser, children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API}/notifications?limit=20`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setNotifications(data.data);
    } catch { /* silent */ }
  }, [currentUser?._id]);

  const fetchUnreadCount = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API}/notifications/unread-count`, { credentials: "include" });
      const data = await res.json();
      setUnreadCount(data.unreadCount ?? 0);
    } catch { /* silent */ }
  }, [currentUser?._id]);

  useEffect(() => {
    if (!currentUser) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
    fetchUnreadCount();

    socketRef.current?.disconnect();

    const token = localStorage.getItem("token") || "";
    const socketUrl = new URL(import.meta.env.VITE_API_URL).origin;
    const socket = io(socketUrl, { auth: { token }, withCredentials: true });
    socketRef.current = socket;

    socket.on("notification:new", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser?._id]);

  const markAsRead = useCallback(async (id) => {
    try {
      await fetch(`${API}/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to mark notification as read");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch(`${API}/notifications/mark-all-read`, {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      toast.error("Failed to mark all as read");
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
