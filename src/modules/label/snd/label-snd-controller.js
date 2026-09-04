const labelSndService = require("./label-snd-service");
const { generateLabelPdf } = require("../../../core/utils/pdf/label-generator");
const {
  buildSndLabelHtml,
} = require("../../../core/utils/pdf/templates/snd-label-pdf/snd-label-pdf");

/**
 * GET /api/labels/snd/:nosnd/pdf
 * Frontend cukup memanggil endpoint ini dengan noSND; PDF di-render di server
 * (Puppeteer + template HTML), lalu dikirim sebagai file application/pdf.
 */
exports.generatePdf = async (req, res) => {
  try {
    const NoSND = String(req.params.nosnd || "").trim();
    if (!NoSND) {
      return res
        .status(400)
        .json({ success: false, message: "nosnd wajib diisi" });
    }

    const data = await labelSndService.getLabelData(NoSND);

    // label-generator memakai data.noLabel untuk isi QR code
    const pdfBuffer = await generateLabelPdf(
      { ...data, noLabel: data.noSND },
      buildSndLabelHtml,
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="label-snd-${NoSND}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("SND PDF Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Gagal generate PDF label SND",
    });
  }
};

/**
 * GET /api/labels/snd/:nosnd  -> data mentah label (debug / preview non-PDF).
 */
exports.getLabelData = async (req, res) => {
  try {
    const NoSND = String(req.params.nosnd || "").trim();
    if (!NoSND) {
      return res
        .status(400)
        .json({ success: false, message: "nosnd wajib diisi" });
    }

    const data = await labelSndService.getLabelData(NoSND);
    return res.status(200).json({
      success: true,
      message: "Data label SND berhasil diambil",
      data,
    });
  } catch (err) {
    console.error("SND Label Data Error:", err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: err.message || "Terjadi kesalahan server",
    });
  }
};
