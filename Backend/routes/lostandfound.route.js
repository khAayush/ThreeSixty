import express from 'express';
import {
  createReport,
  getReports,
  resolveReport,
  cancelReport
} from '../controllers/lostandfound.controller.js';

const lostAndFoundRoutes = express.Router();

import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

lostAndFoundRoutes.route('/')
  .post(verifyToken, createReport)
  .get(verifyToken, getReports); 

lostAndFoundRoutes.route('/:id/resolve')
  .patch(verifyToken, requireAdmin, resolveReport); 

lostAndFoundRoutes.route('/:id/cancel')
  .patch(verifyToken, cancelReport); 

export default lostAndFoundRoutes;