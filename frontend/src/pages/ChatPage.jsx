import { useEffect, useState } from "react";
import { useChat } from "../contexts/ChatContext";
import ConversationList from "../components/chat/ConversationList";
import MessageWindow from "../components/chat/MessageWindow";
import Layout from "../components/Layout";

const getId = (field) => field?._id?.toString() ?? field?.toString() ?? "";

const ChatPage = ({ currentUser, onLogout }) => {
  const { loadConversations, activeUserId, conversations, setActiveConversation } = useChat();
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (currentUser?._id) {
      loadConversations();
    }
  }, [currentUser?._id, loadConversations]);

  const activeConv = conversations.find((c) => getId(c.userId) === activeUserId);

  const activeUser = activeConv
    ? {
        _id: getId(activeConv.userId),
        name: activeConv.name || activeConv.userId?.name || "User",
        profileImage: activeConv.profileImage || activeConv.userId?.profileImage || null,
        department: activeConv.department || activeConv.userId?.department || "",
        role: activeConv.role || activeConv.userId?.role || "",
      }
    : selectedUser;

  return (
    <Layout onLogout={onLogout}>
      <div className="p-6 flex flex-col gap-6 h-[calc(100vh-4rem)]">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
          <p className="text-sm text-slate-500 mt-1">Chat with your colleagues</p>
        </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 min-h-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-hidden">
          <ConversationList
            currentUser={currentUser}
            onSelect={(user) => {
              setSelectedUser(user);
              setActiveConversation(getId(user));
            }}
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-hidden">
          {activeUserId ? (
            <MessageWindow
              currentUser={currentUser}
              activeUser={activeUser}
              onBack={() => setActiveConversation(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-brand"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                  />
                </svg>
              </div>
              <p className="text-slate-700 font-semibold text-base">No conversation selected</p>
              <p className="text-slate-400 text-sm mt-1">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default ChatPage;