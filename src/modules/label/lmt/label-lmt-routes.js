const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const attachPermissions = require("../../../core/middleware/attach-permissions");
const requirePermission = require("../../../core/middleware/require-permission");
const ctrl = require("./label-lmt-controller");

router.use(express.json());
// urutan penting: verify → attach → require → controller
router.use(verifyToken, attachPermissions);

// GET /api/labels/lmt/:nolmt/pdf  -> file PDF label (Puppeteer)
router.get(
  "/label/lmt/:nolmt/pdf",
  requirePermission("label_lmt:read"),
  ctrl.generatePdf,
);

// GET /api/labels/lmt/:nolmt  -> data mentah label (debug/preview)
router.get(
  "/label/lmt/:nolmt",
  requirePermission("label_lmt:read"),
  ctrl.getLabelData,
);

module.exports = router;
