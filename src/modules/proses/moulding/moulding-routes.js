const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const ctrl = require("./moulding-controller");

router.use(express.json());

router.get("/moulding-stock", verifyToken, ctrl.getMouldingStock);
router.get("/moulding-labels", verifyToken, ctrl.getMouldingLabels);

module.exports = router;
