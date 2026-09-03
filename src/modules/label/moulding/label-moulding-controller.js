const labelMouldingService = require("./label-moulding-service");
const { generateLabelPdf } = require("../../../core/utils/pdf/label-generator");
const {
  buildMouldingLabelHtml,
} = require("../../../core/utils/pdf/templates/moulding-label-pdf/moulding-label-pdf");

/**
 * GET /api/labels/moulding/:nomoulding/pdf
 * Frontend cukup memanggil endpoint ini dengan noMoulding; PDF di-render di server
 * (Puppeteer + template HTML), lalu dikirim sebagai file application/pdf.
 */
exports.generatePdf = async (req, res) => {
  try {
    const NoMoulding = String(req.params.nomoulding || "").trim();
    if (!NoMoulding) {
      return res
        .status(400)
        .json({ success: false, message: "nomoulding wajib diisi" });
    }

    const data = await labelMouldingService.getLabelData(NoMoulding);

    // label-generator memakai data.noLabel untuk isi QR code
    const pdfBuffer = await generateLabelPdf(
      { ...data, noLabel: data.noMoulding },
      buildMouldingLabelHtml,
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="label-moulding-${NoMoulding}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("Moulding PDF Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Gagal generate PDF label Moulding",
    });
  }
};

/**
 * GET /api/labels/moulding/:nomoulding  -> data mentah label (debug / preview non-PDF).
 */
exports.getLabelData = async (req, res) => {
  try {
    const NoMoulding = String(req.params.nomoulding || "").trim();
    if (!NoMoulding) {
      return res
        .status(400)
        .json({ success: false, message: "nomoulding wajib diisi" });
    }

    const data = await labelMouldingService.getLabelData(NoMoulding);
    return res.status(200).json({
      success: true,
      message: "Data label Moulding berhasil diambil",
      data,
    });
  } catch (err) {
    console.error("Moulding Label Data Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Terjadi kesalahan server",
    });
  }
};
