const labelCcaService = require("./label-cca-service");
const { generateLabelPdf } = require("../../../core/utils/pdf/label-generator");
const {
  buildCcaLabelHtml,
} = require("../../../core/utils/pdf/templates/cca-label-pdf/cca-label-pdf");

/**
 * GET /api/labels/cca/:nocca/pdf
 * Frontend cukup memanggil endpoint ini dengan noCCA; PDF di-render di server
 * (Puppeteer + template HTML), lalu dikirim sebagai file application/pdf.
 */
exports.generatePdf = async (req, res) => {
  try {
    const NoCCA = String(req.params.nocca || "").trim();
    if (!NoCCA) {
      return res
        .status(400)
        .json({ success: false, message: "nocca wajib diisi" });
    }

    const data = await labelCcaService.getLabelData(NoCCA);

    // label-generator memakai data.noLabel untuk isi QR code
    const pdfBuffer = await generateLabelPdf(
      { ...data, noLabel: data.noCCA },
      buildCcaLabelHtml,
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="label-cca-${NoCCA}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("CCA PDF Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Gagal generate PDF label CCA",
    });
  }
};

/**
 * GET /api/labels/cca/:nocca  -> data mentah label (debug / preview non-PDF).
 */
exports.getLabelData = async (req, res) => {
  try {
    const NoCCA = String(req.params.nocca || "").trim();
    if (!NoCCA) {
      return res
        .status(400)
        .json({ success: false, message: "nocca wajib diisi" });
    }

    const data = await labelCcaService.getLabelData(NoCCA);
    return res.status(200).json({
      success: true,
      message: "Data label CCA berhasil diambil",
      data,
    });
  } catch (err) {
    console.error("CCA Label Data Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Terjadi kesalahan server",
    });
  }
};
