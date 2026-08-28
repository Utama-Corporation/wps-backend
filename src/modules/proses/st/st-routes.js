const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const ctrl = require("./st-controller");

router.use(express.json());

router.get("/st-stock", verifyToken, ctrl.getStStock);
router.get("/st-labels", verifyToken, ctrl.getStLabels);

module.exports = router;
