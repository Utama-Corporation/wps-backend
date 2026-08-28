const s4sService = require("./s4s-service");

exports.getS4SStock = async (req, res) => {
  try {
    const tgl = req.query.tgl ? new Date(req.query.tgl) : new Date();
    const [stock, oldestDate] = await Promise.all([
      s4sService.getStock(tgl),
      s4sService.getOldestDate(),
    ]);
    res.status(200).json({
      success: true,
      message: "Stock S4S berhasil diambil",
      data: stock,
      meta: { tgl: tgl.toISOString().slice(0, 10), oldestDate },
    });
  } catch (err) {
    console.error("Error getS4SStock:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan di server" });
  }
};

exports.getS4SLabels = async (req, res) => {
  try {
    const tgl = req.query.tgl ? new Date(req.query.tgl) : new Date();
    const jenis = req.query.jenis || "";
    const labels = await s4sService.getLabels(jenis, tgl);
    res.status(200).json({
      success: true,
      message: "Label S4S berhasil diambil",
      data: labels,
      meta: { tgl: tgl.toISOString().slice(0, 10) },
    });
  } catch (err) {
    console.error("Error getS4SLabels:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan di server" });
  }
};
