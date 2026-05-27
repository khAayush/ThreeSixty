import express from 'express';
import { getTickets, createTicket, resolveTicket, closeTicket, notifyVisitDepartment } from "../controllers/ticket.controller.js";

const ticketRouter = express.Router();

ticketRouter.get("/", getTickets);
ticketRouter.post("/", createTicket);
ticketRouter.put("/:id/resolve", resolveTicket);
ticketRouter.put("/:id/close", closeTicket);
ticketRouter.post("/:id/notify-visit", notifyVisitDepartment);

export default ticketRouter;