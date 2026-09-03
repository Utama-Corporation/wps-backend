const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const attachPermissions = require("../../../core/middleware/attach-permissions");
const requirePermission = require("../../../core/middleware/require-permission");
const ctrl = require("./label-fj-controller");

router.use(express.json());
// urutan penting: verify → attach → require → controller
router.use(verifyToken, attachPermissions);

// GET /api/labels/fj/:nofj/pdf  -> file PDF label (Puppeteer)
router.get(
  "/label/fj/:nofj/pdf",
  requirePermission("label_fj:read"),
  ctrl.generatePdf,
);

// GET /api/labels/fj/:nofj  -> data mentah label (debug/preview)
router.get(
  "/label/fj/:nofj",
  requirePermission("label_fj:read"),
  ctrl.getLabelData,
);

module.exports = router;
