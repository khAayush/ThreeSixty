import express from 'express';
import { getTickets, createTicket, resolveTicket, closeTicket } from "../controllers/ticket.controller.js";


const ticketRouter = express.Router();

ticketRouter.get("/", getTickets);
ticketRouter.post("/", createTicket);
ticketRouter.put("/:id/resolve", resolveTicket);
ticketRouter.put("/:id/close", closeTicket);

export default ticketRouter;