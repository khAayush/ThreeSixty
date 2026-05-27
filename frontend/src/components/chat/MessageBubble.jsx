import { useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import { Check, CheckCheck, Clock, Pencil, Trash2, X } from "lucide-react";
import { format } from "date-fns";

const getId = (field) => field?._id?.toString() ?? field?.toString() ?? "";

const StatusIcon = ({ status }) => {
  if (status === "sending")   return <Clock      className="w-3 h-3 text-slate-400" />;
  if (status === "sent")      return <Check      className="w-3 h-3 text-slate-400" />;
  if (status === "delivered") return <CheckCheck className="w-3 h-3 text-slate-400" />;
  if (status === "seen")      return <CheckCheck className="w-3 h-3 text-brand"     />;
  return null;
};

const getInitials = (name) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

// Full-screen lightbox for image messages
const Lightbox = ({ src, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
    >
      <X className="w-5 h-5" />
    </button>
    <img
      src={src}
      alt="Full size"
      className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const MessageBubble = ({ message, currentUser, activeUser, isLastInGroup = false }) => {
  const { editMessage, deleteMessage } = useChat();
  const [editing, setEditing]   = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [hovering, setHovering] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const currentUserId = currentUser._id?.toString();
  const isMine = getId(message.sender) === currentUserId;
  const isImage = message.type === "image";

  const partnerId =
    getId(message.receiver) === currentUserId
      ? getId(message.sender)
      : getId(message.receiver);

  const handleEdit = () => {
    if (editText.trim() && editText !== message.content) {
      editMessage(message._id, editText.trim(), partnerId);
    }
    setEditing(false);
  };

  const handleDelete = () => deleteMessage(message._id, partnerId);

  // Deleted message placeholder
  if (message.deleted) {
    return (
      <div className={`flex items-center gap-2 mb-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
        {!isMine && isLastInGroup ? (
          <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
        ) : !isMine ? (
          <div className="w-8 h-8 shrink-0" />
        ) : null}
        <p className="text-xs text-slate-400 italic px-3 py-2 bg-slate-100 rounded-2xl">
          This message was deleted
        </p>
      </div>
    );
  }

  const timestamp = message.createdAt
    ? (() => { try { return format(new Date(message.createdAt), "h:mm a"); } catch { return ""; } })()
    : "";

  // Action buttons - not shown for image messages in edit mode (can't edit an image)
  const ActionButtons = () => (
    <div className="flex items-center gap-1 mr-1">
      {!isImage && (
        <button
          onClick={() => { setEditing(true); setEditText(message.content); }}
          className="p-1 rounded-lg text-slate-400 hover:text-brand hover:bg-brand/10 transition-colors"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        onClick={handleDelete}
        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <>
      {lightbox && <Lightbox src={message.content} onClose={() => setLightbox(false)} />}

      <div
        className={`flex items-center gap-2 mb-3 group ${isMine ? "flex-row-reverse" : "flex-row"}`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Partner avatar */}
        {!isMine && isLastInGroup &&
          (activeUser?.profileImage ? (
            <img
              src={activeUser.profileImage}
              alt={activeUser.name || ""}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center shrink-0">
              {getInitials(activeUser?.name)}
            </div>
          ))}
        {!isMine && !isLastInGroup && <div className="w-7 h-7 shrink-0" />}

        <div className={`flex flex-col max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
          {/* Edit input - only for text messages */}
          {editing && !isImage ? (
            <div className="flex gap-2 items-center w-full">
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEdit();
                  if (e.key === "Escape") setEditing(false);
                }}
                className="flex-1 px-3 py-2 text-sm bg-slate-100 border border-brand/30 rounded-xl outline-none transition-all"
              />
              <button
                onClick={handleEdit}
                className="px-3 py-2 text-xs font-semibold bg-brand text-white rounded-xl hover:bg-brand/90 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-2 text-xs font-semibold bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {/* Bubble */}
              <div
                className={`relative rounded-2xl shadow-sm overflow-hidden ${
                  isImage
                    ? "p-1 bg-white border border-slate-200"
                    : isMine
                    ? "px-4 py-2.5 bg-brand text-white rounded-br-md text-sm leading-relaxed"
                    : "px-4 py-2.5 bg-slate-100 text-slate-800 rounded-bl-md text-sm leading-relaxed"
                }`}
              >
                {isImage ? (
                  <img
                    src={message.content}
                    alt="image"
                    className="max-h-60 max-w-60 rounded-xl object-contain cursor-pointer"
                    onClick={() => setLightbox(true)}
                    title="Click to view full size"
                  />
                ) : (
                  <>
                    {typeof message.content === "string"
                      ? message.content
                      : JSON.stringify(message.content)}
                    {message.edited && (
                      <span className={`ml-1.5 text-xs italic ${isMine ? "text-white/60" : "text-slate-400"}`}>
                        (edited)
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Timestamp + status + action buttons */}
              {isLastInGroup && (
                <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                  <span className="text-xs text-slate-400">{timestamp}</span>
                  {isMine && <StatusIcon status={message.status} />}
                  {isMine && hovering && !message.deleted && <ActionButtons />}
                </div>
              )}

              {!isLastInGroup && isMine && hovering && !message.deleted && (
                <div className="flex items-center gap-1 mt-1 px-1">
                  <ActionButtons />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageBubble;
