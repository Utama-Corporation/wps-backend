const express = require("express");
const router = express.Router();
const verifyToken = require("../../../core/middleware/verify-token");
const ctrl = require("./finger-join-controller");

router.use(express.json());

router.get("/fj-stock", verifyToken, ctrl.getFJStock);
router.get("/fj-labels", verifyToken, ctrl.getFJLabels);

module.exports = router;
