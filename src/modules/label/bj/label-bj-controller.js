const labelBjService = require("./label-bj-service");
const { generateLabelPdf } = require("../../../core/utils/pdf/label-generator");
const {
  buildBjLabelHtml,
} = require("../../../core/utils/pdf/templates/bj-label-pdf/bj-label-pdf");

/**
 * GET /api/labels/bj/:nobj/pdf
 * Frontend cukup memanggil endpoint ini dengan noBJ; PDF di-render di server
 * (Puppeteer + template HTML), lalu dikirim sebagai file application/pdf.
 */
exports.generatePdf = async (req, res) => {
  try {
    const NoBJ = String(req.params.nobj || "").trim();
    if (!NoBJ) {
      return res
        .status(400)
        .json({ success: false, message: "nobj wajib diisi" });
    }

    const data = await labelBjService.getLabelData(NoBJ);

    // label-generator memakai data.noLabel untuk isi QR code
    const pdfBuffer = await generateLabelPdf(
      { ...data, noLabel: data.noBJ },
      buildBjLabelHtml,
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="label-bj-${NoBJ}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("BJ PDF Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Gagal generate PDF label BJ",
    });
  }
};

/**
 * GET /api/labels/bj/:nobj  -> data mentah label (debug / preview non-PDF).
 */
exports.getLabelData = async (req, res) => {
  try {
    const NoBJ = String(req.params.nobj || "").trim();
    if (!NoBJ) {
      return res
        .status(400)
        .json({ success: false, message: "nobj wajib diisi" });
    }

    const data = await labelBjService.getLabelData(NoBJ);
    return res.status(200).json({
      success: true,
      message: "Data label BJ berhasil diambil",
      data,
    });
  } catch (err) {
    console.error("BJ Label Data Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Terjadi kesalahan server",
    });
  }
};
