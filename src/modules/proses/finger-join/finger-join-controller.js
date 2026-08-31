const fingerJoinService = require("./finger-join-service");

exports.getFJStock = async (req, res) => {
  try {
    const tgl = req.query.tgl ? new Date(req.query.tgl) : new Date();
    const [stock, oldestDate] = await Promise.all([
      fingerJoinService.getStock(tgl),
      fingerJoinService.getOldestDate(),
    ]);
    res.status(200).json({
      success: true,
      message: "Stock FJ berhasil diambil",
      data: stock,
      meta: { tgl: tgl.toISOString().slice(0, 10), oldestDate },
    });
  } catch (err) {
    console.error("Error getFJStock:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan di server" });
  }
};

exports.getFJLabels = async (req, res) => {
  try {
    const tgl = req.query.tgl ? new Date(req.query.tgl) : new Date();
    const jenis = req.query.jenis || "";
    const [labels, oldestDate] = await Promise.all([
      fingerJoinService.getLabels(jenis, tgl),
      fingerJoinService.getOldestDate(),
    ]);
    res.status(200).json({
      success: true,
      message: "Label FJ berhasil diambil",
      data: labels,
      meta: { tgl: tgl.toISOString().slice(0, 10), oldestDate },
    });
  } catch (err) {
    console.error("Error getFJLabels:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan di server" });
  }
};
