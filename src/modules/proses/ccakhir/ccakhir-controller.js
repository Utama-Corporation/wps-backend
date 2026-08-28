const ccakhirService = require("./ccakhir-service");

exports.getCCAkhirStock = async (req, res) => {
  try {
    const tgl = req.query.tgl ? new Date(req.query.tgl) : new Date();
    const [stock, oldestDate] = await Promise.all([
      ccakhirService.getStock(tgl),
      ccakhirService.getOldestDate(),
    ]);
    res.status(200).json({
      success: true,
      message: "Stock CC Akhir berhasil diambil",
      data: stock,
      meta: { tgl: tgl.toISOString().slice(0, 10), oldestDate },
    });
  } catch (err) {
    console.error("Error getCCAkhirStock:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan di server" });
  }
};

exports.getCCAkhirLabels = async (req, res) => {
  try {
    const tgl = req.query.tgl ? new Date(req.query.tgl) : new Date();
    const jenis = req.query.jenis || "";
    const labels = await ccakhirService.getLabels(jenis, tgl);
    res.status(200).json({
      success: true,
      message: "Label CC Akhir berhasil diambil",
      data: labels,
      meta: { tgl: tgl.toISOString().slice(0, 10) },
    });
  } catch (err) {
    console.error("Error getCCAkhirLabels:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan di server" });
  }
};
