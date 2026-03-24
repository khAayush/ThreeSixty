import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// GET /api/conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all users this user has exchanged messages with
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Build a map: partnerId -> { lastMessage, unreadCount }
    const partnerMap = new Map();

    for (const msg of messages) {
      const partnerId = msg.sender.toString() === userId.toString()
        ? msg.receiver.toString()
        : msg.sender.toString();

      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, { lastMessage: msg, unreadCount: 0 });
      }

      // Count unread (receiver is me, not seen)
      if (
        msg.receiver.toString() === userId.toString() &&
        msg.status !== "seen"
      ) {
        partnerMap.get(partnerId).unreadCount++;
      }
    }

    // Fetch partner user details
    const partnerIds = [...partnerMap.keys()];
    const users = await User.find({ _id: { $in: partnerIds } })
      .select("name email profileImage")
      .lean();

    const conversations = users.map((user) => {
      const data = partnerMap.get(user._id.toString());
      return {
        userId: user._id,
        name: user.name,
        profileImage: user.profileImage,
        lastMessage: data.lastMessage,
        unreadCount: data.unreadCount,
      };
    });

    // Sort by last message time descending
    conversations.sort(
      (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Failed to load conversations" });
  }
};

// GET /api/messages/:userId?limit=30&offset=0
export const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;
    const limit  = parseInt(req.query.limit)  || 30;
    const offset = parseInt(req.query.offset) || 0;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(offset)
      .limit(limit)
      .lean();

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to load messages" });
  }
};

// GET /api/users/search?q=
export const searchUsers = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("name email profileImage")
      .limit(10)
      .lean();

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
};