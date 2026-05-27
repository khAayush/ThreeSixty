import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const ChatContext = createContext(null);

export const ChatProvider = ({ currentUser, children }) => {
  const socketRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [messages, setMessages] = useState({});
  const [typing, setTyping] = useState({});
  const typingTimers = useRef({});
  const conversationsRef = useRef([]);

  // Socket handlers close over this ref, not the state, so it must stay in sync
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    setConversations([]);
    setMessages({});
    setActiveUserId(null);
    setTyping({});

    if (!currentUser) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const token = localStorage.getItem("token") || "";
    const socketUrl = new URL(import.meta.env.VITE_API_URL).origin;
    const socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect_error", (err) => {
      toast.error(`Chat connection failed: ${err.message}`);
    });

    socket.on("message:sent", (msg) => {
      setMessages((prev) => {
        const partnerId = msg.receiver.toString();
        const list = (prev[partnerId] || []).map((m) =>
          m.tempId === msg.tempId ? { ...msg, status: msg.status } : m,
        );
        return { ...prev, [partnerId]: list };
      });
      updateConvLastMessage(msg.receiver.toString(), msg);
    });

    socket.on("message:new", (msg) => {
      const partnerId = msg.sender.toString();
      setMessages((prev) => ({
        ...prev,
        [partnerId]: [...(prev[partnerId] || []), msg],
      }));

      const exists = conversationsRef.current.find(
        (c) => c.userId.toString() === partnerId,
      );
      if (exists) {
        setConversations((prev) =>
          prev.map((c) =>
            c.userId.toString() === partnerId
              ? { ...c, lastMessage: msg, unreadCount: (c.unreadCount || 0) + 1 }
              : c,
          ),
        );
      } else {
        // First message from this person
        loadConversations();
      }
    });

    socket.on("message:status", ({ messageId, status }) => {
      setMessages((prev) => {
        const updated = {};
        for (const [uid, list] of Object.entries(prev)) {
          updated[uid] = list.map((m) =>
            m._id === messageId ? { ...m, status } : m,
          );
        }
        return updated;
      });
    });

    socket.on("message:updated", (updatedMsg) => {
      const partnerId =
        updatedMsg.sender.toString() === currentUser._id.toString()
          ? updatedMsg.receiver.toString()
          : updatedMsg.sender.toString();

      setMessages((prev) => ({
        ...prev,
        [partnerId]: (prev[partnerId] || []).map((m) =>
          m._id === updatedMsg._id ? updatedMsg : m,
        ),
      }));
    });

    socket.on("typing", ({ fromUserId }) => {
      setTyping((prev) => ({ ...prev, [fromUserId]: true }));
      clearTimeout(typingTimers.current[fromUserId]);
      typingTimers.current[fromUserId] = setTimeout(() => {
        setTyping((prev) => ({ ...prev, [fromUserId]: false }));
      }, 3000);
    });

    socket.on("stopTyping", ({ fromUserId }) => {
      setTyping((prev) => ({ ...prev, [fromUserId]: false }));
    });

    socket.on("message:error", ({ error }) =>
      toast.error(error || "Chat error"),
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser?._id]); // keyed to user ID so a role/profile update doesn't re-init the socket

  const updateConvLastMessage = (partnerId, msg) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.userId.toString() === partnerId ? { ...c, lastMessage: msg } : c,
      ),
    );
  };

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/conversations`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();
      setConversations(Array.isArray(data.data) ? data.data : data);
    } catch {
      toast.error("Failed to load conversations");
    }
  }, []);

  useEffect(() => {
    if (currentUser?._id) loadConversations();
  }, [currentUser?._id, loadConversations]);

  const loadMessages = useCallback(async (userId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/messages/${userId}?limit=50`,
        { credentials: "include" },
      );
      const data = await res.json();
      setMessages((prev) => ({
        ...prev,
        [userId]: Array.isArray(data.data) ? data.data : data,
      }));
    } catch {
      toast.error("Failed to load messages");
    }
  }, []);

  const setActiveConversation = useCallback(
    (userId) => {
      setActiveUserId(userId);
      if (!messages[userId]) loadMessages(userId);
      setConversations((prev) =>
        prev.map((c) =>
          c.userId.toString() === userId ? { ...c, unreadCount: 0 } : c,
        ),
      );
    },
    [messages, loadMessages],
  );

  const sendMessage = useCallback(
    (receiverId, content, type = "text") => {
      const tempId = `temp_${crypto.randomUUID()}`;
      const optimistic = {
        _id: tempId,
        tempId,
        sender: currentUser._id,
        receiver: receiverId,
        content,
        type,
        status: "sending",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), optimistic],
      }));
      socketRef.current?.emit("message:send", { receiverId, content, tempId, type });
    },
    [currentUser],
  );

  const editMessage = useCallback((messageId, newContent, partnerId) => {
    socketRef.current?.emit("message:edit", { messageId, newContent });
  }, []);

  const deleteMessage = useCallback((messageId) => {
    socketRef.current?.emit("message:delete", { messageId });
  }, []);

  const markMessagesSeen = useCallback((messageIds, fromUserId) => {
    if (!messageIds.length) return;
    socketRef.current?.emit("message:seen", { messageIds });
    setConversations((prev) =>
      prev.map((c) =>
        c.userId.toString() === fromUserId ? { ...c, unreadCount: 0 } : c,
      ),
    );
  }, []);

  const emitTyping = useCallback((toUserId) => {
    socketRef.current?.emit("typing", { toUserId });
  }, []);

  const emitStopTyping = useCallback((toUserId) => {
    socketRef.current?.emit("stopTyping", { toUserId });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeUserId,
        messages,
        typing,
        loadConversations,
        setActiveConversation,
        sendMessage,
        editMessage,
        deleteMessage,
        markMessagesSeen,
        emitTyping,
        emitStopTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);