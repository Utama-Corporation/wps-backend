const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const attachPermissions = require("../../../core/middleware/attach-permissions");
const requirePermission = require("../../../core/middleware/require-permission");
const ctrl = require("./label-snd-controller");

router.use(express.json());
// urutan penting: verify → attach → require → controller
router.use(verifyToken, attachPermissions);

// GET /api/labels/snd/:nosnd/pdf  -> file PDF label (Puppeteer)
router.get(
  "/label/snd/:nosnd/pdf",
  requirePermission("label_snd:read"),
  ctrl.generatePdf,
);

// GET /api/labels/snd/:nosnd  -> data mentah label (debug/preview)
router.get(
  "/label/snd/:nosnd",
  requirePermission("label_snd:read"),
  ctrl.getLabelData,
);

module.exports = router;
