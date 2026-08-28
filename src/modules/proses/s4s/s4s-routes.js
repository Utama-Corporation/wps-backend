const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const ctrl = require("./s4s-controller");

router.use(express.json());

router.get("/s4s-stock", verifyToken, ctrl.getS4SStock);
router.get("/s4s-labels", verifyToken, ctrl.getS4SLabels);

module.exports = router;
