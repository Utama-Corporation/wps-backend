const labelLmtService = require("./label-lmt-service");
const { generateLabelPdf } = require("../../../core/utils/pdf/label-generator");
const {
  buildLmtLabelHtml,
} = require("../../../core/utils/pdf/templates/lmt-label-pdf/lmt-label-pdf");

/**
 * GET /api/labels/lmt/:nolmt/pdf
 * Frontend cukup memanggil endpoint ini dengan noLmt; PDF di-render di server
 * (Puppeteer + template HTML), lalu dikirim sebagai file application/pdf.
 */
exports.generatePdf = async (req, res) => {
  try {
    const NoLmt = String(req.params.nolmt || "").trim();
    if (!NoLmt) {
      return res
        .status(400)
        .json({ success: false, message: "nolmt wajib diisi" });
    }

    const data = await labelLmtService.getLabelData(NoLmt);

    // label-generator memakai data.noLabel untuk isi QR code
    const pdfBuffer = await generateLabelPdf(
      { ...data, noLabel: data.noLmt },
      buildLmtLabelHtml,
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="label-lmt-${NoLmt}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("Lmt PDF Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Gagal generate PDF label Lmt",
    });
  }
};

/**
 * GET /api/labels/lmt/:nolmt  -> data mentah label (debug / preview non-PDF).
 */
exports.getLabelData = async (req, res) => {
  try {    
    const NoLmt = String(req.params.nolmt || "").trim();
    if (!NoLmt) {
      return res
        .status(400)
        .json({ success: false, message: "nolmt wajib diisi" });
    }

    const data = await labelLmtService.getLabelData(NoLmt);
    return res.status(200).json({
      success: true,
      message: "Data label Lmt berhasil diambil",
      data,
    });
  } catch (err) {
    console.error("Lmt Label Data Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Terjadi kesalahan server",
    });
  }
};
