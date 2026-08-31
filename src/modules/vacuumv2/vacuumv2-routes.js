const express = require("express");
const verifyToken = require("../../core/middleware/verify-token");
const vacuumV2Controller = require("./vacuumv2-controller");

const router = express.Router();
router.use(express.json());

router.get("/masters", verifyToken, vacuumV2Controller.getMasters);
router.get("/header", verifyToken, vacuumV2Controller.getHeader);
router.get("/detail", verifyToken, vacuumV2Controller.getDetail);
router.get("/", verifyToken, vacuumV2Controller.getAll);
router.post("/", verifyToken, vacuumV2Controller.create);
router.put("/", verifyToken, vacuumV2Controller.update);
router.delete("/", verifyToken, vacuumV2Controller.remove);

module.exports = router;