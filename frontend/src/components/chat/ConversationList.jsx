import { useState, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext";
import { formatDistanceToNow } from "date-fns";
import { MagnifyingGlassIcon, PhotoIcon } from "@heroicons/react/24/outline";

const getId = (field) => field?._id?.toString() ?? field?.toString() ?? "";

const getInitials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

const ConversationList = ({ currentUser, onSelect }) => {
  const { conversations, activeUserId } = useChat();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/chat/users/search?q=${encodeURIComponent(query)}`,
          { credentials: "include" }
        );
        setResults(await res.json());
      } catch {
        // silent
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-800 mb-3">Conversations</h2>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people..."
            className="w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Search Results */}
      {query.trim() && (
        <div className="border-b border-slate-100">
          {searching ? (
            <div className="px-4 py-3 text-sm text-slate-400">Searching…</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">No users found</div>
          ) : (
            <div className="py-1">
              {results.map((u) => {
                const uid = getId(u);
                return (
                  <button
                    key={uid}
                    onClick={() => {
                      onSelect({
                        _id: uid,
                        name: u.name || "User",
                        profileImage: u.profileImage || null,
                        department: u.department || "",
                        role: u.role || "",
                        email: u.email || "",
                      });
                      setQuery("");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                  >
                    {u.profileImage ? (
                      <img
                        src={u.profileImage}
                        alt={u.name || ""}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand/10 text-brand text-sm font-semibold flex items-center justify-center shrink-0">
                        {getInitials(u.name)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {u.name || ""}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {u.email || u.department || ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto py-2 min-h-0">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No conversations yet</p>
            <p className="text-xs text-slate-400 mt-1">Search for a user to start chatting.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const convUserId = getId(conv.userId);
            const isActive = convUserId === activeUserId;
            const name = conv.name || conv.userId?.name || "User";
            const avatar = conv.profileImage || conv.userId?.profileImage || "";
            const isLastMsgImage = conv.lastMessage?.type === "image";
            const lastMsg =
              typeof conv.lastMessage === "string"
                ? conv.lastMessage
                : isLastMsgImage
                ? null
                : conv.lastMessage?.content || "";
            const lastMsgAt = conv.lastMessageAt
              ? typeof conv.lastMessageAt === "string" || conv.lastMessageAt instanceof Date
                ? conv.lastMessageAt
                : conv.lastMessageAt?.toString?.()
              : null;

            return (
              <button
                key={convUserId}
                onClick={() =>
                  onSelect({
                    _id: convUserId,
                    name,
                    profileImage: avatar || null,
                    department: conv.department || conv.userId?.department || "",
                    role: conv.role || conv.userId?.role || "",
                  })
                }
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-left ${
                  isActive
                    ? "bg-brand/5 border-r-2 border-brand"
                    : "hover:bg-slate-50 border-r-2 border-transparent"
                }`}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand/10 text-brand text-sm font-semibold flex items-center justify-center shrink-0">
                    {getInitials(name)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isActive ? "text-brand" : "text-slate-800"
                      }`}
                    >
                      {name}
                    </p>

                    {lastMsgAt && (
                      <span className="text-xs text-slate-400 shrink-0">
                        {formatDistanceToNow(new Date(lastMsgAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>

                  {isLastMsgImage ? (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <PhotoIcon className="w-3.5 h-3.5 shrink-0" />
                      Image
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {lastMsg || "Start a conversation"}
                    </p>
                  )}
                </div>

                {conv.unreadCount > 0 && (
                  <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;