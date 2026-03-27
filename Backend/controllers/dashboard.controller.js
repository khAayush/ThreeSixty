import Asset from "../models/asset.model.js";
import Ticket from "../models/ticket.model.js";
import Assignment from "../models/assignment.model.js";

export const getAdminStats = async (req, res) => {
  try {
    const [assetAgg, openTickets, pendingRequests] = await Promise.all([
      Asset.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            inStock: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$status", "Healthy"] }, { $ne: ["$isAssigned", true] }] },
                  1, 0,
                ],
              },
            },
            assigned: { $sum: { $cond: [{ $eq: ["$isAssigned", true] }, 1, 0] } },
            damagedOrRepair: {
              $sum: { $cond: [{ $in: ["$status", ["Damaged", "Out-For-Repair"]] }, 1, 0] },
            },
          },
        },
      ]),
      Ticket.countDocuments({ status: "Open" }),
      Assignment.countDocuments({ status: "Pending" }),
    ]);

    const a = assetAgg[0] || {};
    res.json({
      success: true,
      data: {
        totalAssets:     a.total           || 0,
        inStock:         a.inStock         || 0,
        assigned:        a.assigned        || 0,
        damagedOrRepair: a.damagedOrRepair || 0,
        openTickets,
        pendingRequests,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
