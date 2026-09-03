const labelFjService = require("./label-fj-service");
const { generateLabelPdf } = require("../../../core/utils/pdf/label-generator");
const {
  buildFjLabelHtml,
} = require("../../../core/utils/pdf/templates/fj-label-pdf/fj-label-pdf");

/**
 * GET /api/labels/fj/:nofj/pdf
 * Frontend cukup memanggil endpoint ini dengan noFJ; PDF di-render di server
 * (Puppeteer + template HTML), lalu dikirim sebagai file application/pdf.
 */
exports.generatePdf = async (req, res) => {
  try {
    const NoFJ = String(req.params.nofj || "").trim();
    if (!NoFJ) {
      return res
        .status(400)
        .json({ success: false, message: "nofj wajib diisi" });
    }

    const data = await labelFjService.getLabelData(NoFJ);

    // label-generator memakai data.noLabel untuk isi QR code
    const pdfBuffer = await generateLabelPdf(
      { ...data, noLabel: data.noFJ },
      buildFjLabelHtml,
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="label-fj-${NoFJ}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("FJ PDF Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Gagal generate PDF label FJ",
    });
  }
};

/**
 * GET /api/labels/fj/:nofj  -> data mentah label (debug / preview non-PDF).
 */
exports.getLabelData = async (req, res) => {
  try {
    const NoFJ = String(req.params.nofj || "").trim();
    if (!NoFJ) {
      return res
        .status(400)
        .json({ success: false, message: "nofj wajib diisi" });
    }

    const data = await labelFjService.getLabelData(NoFJ);
    return res.status(200).json({
      success: true,
      message: "Data label FJ berhasil diambil",
      data,
    });
  } catch (err) {
    console.error("FJ Label Data Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Terjadi kesalahan server",
    });
  }
};
