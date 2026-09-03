const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const attachPermissions = require("../../../core/middleware/attach-permissions");
const requirePermission = require("../../../core/middleware/require-permission");
const ctrl = require("./label-moulding-controller");

router.use(express.json());
// urutan penting: verify → attach → require → controller
router.use(verifyToken, attachPermissions);

// GET /api/labels/moulding/:nomoulding/pdf  -> file PDF label (Puppeteer)
router.get(
  "/label/moulding/:nomoulding/pdf",
  requirePermission("label_mld:read"),
  ctrl.generatePdf,
);

// GET /api/labels/moulding/:nomoulding  -> data mentah label (debug/preview)
router.get(
  "/label/moulding/:nomoulding",
  requirePermission("label_mld:read"),
  ctrl.getLabelData,
);

module.exports = router;
