const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const attachPermissions = require("../../../core/middleware/attach-permissions");
const requirePermission = require("../../../core/middleware/require-permission");
const ctrl = require("./label-cca-controller");

router.use(express.json());
// urutan penting: verify → attach → require → controller
router.use(verifyToken, attachPermissions);

// GET /api/labels/cca/:nocca/pdf  -> file PDF label (Puppeteer)
router.get(
  "/label/cca/:nocca/pdf",
  requirePermission("label_cca:read"),
  ctrl.generatePdf,
);

// GET /api/labels/cca/:nocca  -> data mentah label (debug/preview)
router.get(
  "/label/cca/:nocca",
  requirePermission("label_cca:read"),
  ctrl.getLabelData,
);

module.exports = router;
