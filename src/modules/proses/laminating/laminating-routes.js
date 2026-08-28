const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const ctrl = require("./laminating-controller");

router.use(express.json());

router.get("/laminating-stock", verifyToken, ctrl.getLaminatingStock);
router.get("/laminating-labels", verifyToken, ctrl.getLaminatingLabels);

module.exports = router;
