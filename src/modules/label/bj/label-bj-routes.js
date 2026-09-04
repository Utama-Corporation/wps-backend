const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const attachPermissions = require("../../../core/middleware/attach-permissions");
const requirePermission = require("../../../core/middleware/require-permission");
const ctrl = require("./label-bj-controller");

router.use(express.json());
// urutan penting: verify → attach → require → controller
router.use(verifyToken, attachPermissions);

// GET /api/labels/bj/:nobj/pdf  -> file PDF label (Puppeteer)
router.get(
  "/label/bj/:nobj/pdf",
  requirePermission("label_bj:read"),
  ctrl.generatePdf,
);

// GET /api/labels/bj/:nobj  -> data mentah label (debug/preview)
router.get(
  "/label/bj/:nobj",
  requirePermission("label_bj:read"),
  ctrl.getLabelData,
);

module.exports = router;
