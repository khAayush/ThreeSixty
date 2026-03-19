import Ticket from "../models/ticket.model.js";
import { createNotification, notifyRole } from "../utils/createNotification.js";

export const getTickets = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    
    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets", error: error.message });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { title, userName, userId, userImage, description } = req.body;
    
    const newTicket = new Ticket({
      title,
      userName,
      userImage,
      userId,
      description,
    });

    const savedTicket = await newTicket.save();

    // Notify all admins/managers of the new ticket
    await notifyRole(
      ["admin", "manager"],
      "ticket:new",
      "New Ticket Opened",
      `${savedTicket.userName} opened a ticket: "${savedTicket.title}".`,
      { ticketId: savedTicket._id.toString() },
    );

    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(500).json({ message: "Error creating ticket", error: error.message });
  }
};

export const resolveTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, resolvedBy } = req.body;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      {
        status: "Closed",
        note,
        resolvedBy,
        resolvedDate: new Date()
      },
      { new: true }
    );

    if (!updatedTicket) return res.status(404).json({ message: "Ticket not found" });

    // Notify the ticket owner that their ticket was closed
    if (updatedTicket.userId) {
      await createNotification(
        updatedTicket.userId,
        "ticket:closed",
        "Ticket Closed",
        `Your ticket "${updatedTicket.title}" has been closed.`,
        { ticketId: updatedTicket._id.toString() },
      );
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: "Error resolving ticket", error: error.message });
  }
};

export const closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, closedBy } = req.body;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      {
        status: "Closed",
        note,
        closedBy,
        resolvedDate: new Date()
      },
      { new: true }
    );

    if (!updatedTicket) return res.status(404).json({ message: "Ticket not found" });

    // Notify the ticket owner that their ticket was closed
    if (updatedTicket.userId) {
      await createNotification(
        updatedTicket.userId,
        "ticket:closed",
        "Ticket Closed",
        `Your ticket "${updatedTicket.title}" has been closed.`,
        { ticketId: updatedTicket._id.toString() },
      );
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: "Error closing ticket", error: error.message });
  }
};

