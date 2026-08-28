const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const ctrl = require("./ccakhir-controller");

router.use(express.json());

router.get("/ccakhir-stock", verifyToken, ctrl.getCCAkhirStock);
router.get("/ccakhir-labels", verifyToken, ctrl.getCCAkhirLabels);

module.exports = router;
