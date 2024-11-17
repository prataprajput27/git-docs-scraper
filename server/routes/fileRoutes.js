const express = require("express");
const fileController = require("../controllers/fileController");

const router = express.Router();

router.get("/listMdFiles", fileController.listMdFiles);
router.get("/downloadCombined", fileController.downloadCombined);
router.get("/preview", fileController.preview);

module.exports = router;
