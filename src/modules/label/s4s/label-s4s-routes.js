const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const attachPermissions = require("../../../core/middleware/attach-permissions");
const requirePermission = require("../../../core/middleware/require-permission");
const ctrl = require("./label-s4s-controller");

router.use(express.json());
// urutan penting: verify → attach → require → controller
router.use(verifyToken, attachPermissions);

// GET /api/labels/s4s/:nos4s/pdf  -> file PDF label (Puppeteer)
router.get(
  "/label/s4s/:nos4s/pdf",
  requirePermission("label_s4s:read"),
  ctrl.generatePdf,
);

// GET /api/labels/s4s/:nos4s  -> data mentah label (debug/preview)
router.get(
  "/label/s4s/:nos4s",
  requirePermission("label_s4s:read"),
  ctrl.getLabelData,
);

module.exports = router;
