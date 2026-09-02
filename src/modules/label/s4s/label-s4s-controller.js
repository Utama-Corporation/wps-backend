const labelS4sService = require("./label-s4s-service");
const { generateLabelPdf } = require("../../../core/utils/pdf/label-generator");
const {
  buildS4sLabelHtml,
} = require("../../../core/utils/pdf/templates/s4s-label-pdf/s4s-label-pdf");

/**
 * GET /api/labels/s4s/:nos4s/pdf
 * Frontend cukup memanggil endpoint ini dengan noS4S; PDF di-render di server
 * (Puppeteer + template HTML), lalu dikirim sebagai file application/pdf.
 */
exports.generatePdf = async (req, res) => {
  try {
    const NoS4S = String(req.params.nos4s || "").trim();
    if (!NoS4S) {
      return res
        .status(400)
        .json({ success: false, message: "nos4s wajib diisi" });
    }

    const data = await labelS4sService.getLabelData(NoS4S);

    // label-generator memakai data.noLabel untuk isi QR code
    const pdfBuffer = await generateLabelPdf(
      { ...data, noLabel: data.noS4S },
      buildS4sLabelHtml,
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="label-s4s-${NoS4S}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("S4S PDF Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Gagal generate PDF label S4S",
    });
  }
};

/**
 * GET /api/labels/s4s/:nos4s  -> data mentah label (debug / preview non-PDF).
 */
exports.getLabelData = async (req, res) => {
  try {
    const NoS4S = String(req.params.nos4s || "").trim();
    if (!NoS4S) {
      return res
        .status(400)
        .json({ success: false, message: "nos4s wajib diisi" });
    }

    const data = await labelS4sService.getLabelData(NoS4S);
    return res.status(200).json({
      success: true,
      message: "Data label S4S berhasil diambil",
      data,
    });
  } catch (err) {
    console.error("S4S Label Data Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Terjadi kesalahan server",
    });
  }
};
