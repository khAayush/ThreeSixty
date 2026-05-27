import { useEffect, useRef, useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import MessageBubble from "./MessageBubble";
import { ChevronLeft } from "lucide-react";
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

const getId = (field) => field?._id?.toString() ?? field?.toString() ?? "";

const getInitials = (name) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

// Compress image to base64 JPEG (max 800px wide, 75% quality)
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const MessageWindow = ({ currentUser, activeUser, onBack }) => {
  const {
    messages,
    typing,
    sendMessage,
    markMessagesSeen,
    emitTyping,
    emitStopTyping,
    activeUserId,
  } = useChat();

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null); // base64 of staged image
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const isTyping = useRef(false);
  const imageInputRef = useRef(null);

  const msgs = messages[activeUserId] || [];
  const partnerTyping = typing[activeUserId];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (!activeUserId) return;
    const currentUserId = currentUser._id?.toString();
    const unread = msgs
      .filter(
        (m) =>
          getId(m.receiver) === currentUserId &&
          m.status !== "seen" &&
          m._id &&
          !m.tempId
      )
      .map((m) => m._id);

    if (unread.length) markMessagesSeen(unread, activeUserId);
  }, [msgs, activeUserId, currentUser, markMessagesSeen]);

  const handleSend = () => {
    const content = text.trim();
    if (!content) return;
    sendMessage(activeUserId, content, "text");
    setText("");
    emitStopTyping(activeUserId);
    isTyping.current = false;
    clearTimeout(typingTimer.current);
  };

  // Send button: dispatch text (if any) then image (if staged)
  const handleSendAll = () => {
    if (text.trim()) handleSend();
    if (imagePreview) handleSendImage();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendAll();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (!isTyping.current) {
      isTyping.current = true;
      emitTyping(activeUserId);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
      emitStopTyping(activeUserId);
    }, 2000);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be smaller than 10 MB");
      return;
    }

    try {
      const base64 = await compressImage(file);
      setImagePreview(base64);
    } catch {
      alert("Failed to process image");
    }
  };

  const handleSendImage = () => {
    if (!imagePreview) return;
    sendMessage(activeUserId, imagePreview, "image");
    setImagePreview(null);
  };

  const displayName = activeUser?.name || "User";
  const displayImg = activeUser?.profileImage;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 shrink-0">
        <button
          onClick={onBack}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-brand hover:bg-brand/10 transition-colors"
          aria-label="Back to conversations"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {displayImg ? (
          <img src={displayImg} alt={displayName} referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-brand/10 text-brand text-sm font-semibold flex items-center justify-center shrink-0">
            {getInitials(displayName)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
          {partnerTyping ? (
            <p className="text-xs text-brand animate-pulse">typing…</p>
          ) : (
            <p className="text-xs text-slate-400">
              {activeUser?.department || activeUser?.role || ""}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 space-y-1">
        {msgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <PaperAirplaneIcon className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No messages yet</p>
            <p className="text-xs text-slate-400 mt-1">Send a message to start the conversation.</p>
          </div>
        ) : (
          msgs.map((msg, index) => {
            const currentSenderId = getId(msg.sender);
            const nextMsg = msgs[index + 1];
            const nextSenderId = nextMsg ? getId(nextMsg.sender) : null;
            const isLastInGroup = !nextMsg || currentSenderId !== nextSenderId;

            return (
              <MessageBubble
                key={msg._id || msg.tempId}
                message={msg}
                currentUser={currentUser}
                activeUser={activeUser}
                isLastInGroup={isLastInGroup}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Image preview - thumbnail + cancel only; the main send button handles sending */}
      {imagePreview && (
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 shrink-0">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-40 max-w-50 rounded-xl object-contain border border-slate-200 shadow-sm"
            />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-slate-100 shrink-0">
        {/* Image attach button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="shrink-0 w-10 h-10 rounded-xl text-slate-400 hover:text-brand hover:bg-brand/10 flex items-center justify-center transition-all"
          title="Send image"
        >
          <PhotoIcon className="w-5 h-5" />
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        <textarea
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${displayName}…`}
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:bg-white transition-all resize-none max-h-32 overflow-y-auto leading-relaxed"
          style={{ minHeight: "42px" }}
        />
        <button
          onClick={handleSendAll}
          disabled={!text.trim() && !imagePreview}
          aria-label="Send message"
          className="shrink-0 w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageWindow;
