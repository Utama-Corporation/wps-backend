const moment = require("moment");
const { sql, poolPromise } = require("../../../core/config/db");

const MASTER_TABLE = "FJ_h";
const DETAIL_TABLE = "FJ_d";
const KEY_COLUMN = "NoFJ";

/* ============================================================
 * QUERY
 * ==========================================================*/

async function getHeader(noFJ) {
  const pool = await poolPromise;
  const req = pool.request();
  req.input("noFJ", sql.VarChar(50), noFJ);

  const result = await req.query(`
    SELECT
      h.${KEY_COLUMN}      AS NoFJ,
      h.DateCreate,
      h.Jam,
      h.NoSPK,
      h.Remark,
      h.IsReject,
      h.IsLembur,
      h.HasBeenPrinted,
      h.DateUsage,
      k.Jenis              AS JenisKayu,
      g.NamaGrade          AS Grade,
      t.NamaOrgTelly       AS Telly,
      wf.Singkatan         AS FisikSingkatan,
      wf.NamaWarehouse     AS FisikNama,
      m.NamaMesin          AS NamaMesin,
      o.NoProduksi         AS NoProduksi,
      s.NoBongkarSusun     AS NoBongkarSusun
    FROM ${MASTER_TABLE} h
    LEFT JOIN (
      SELECT NoProduksi, NoFJ FROM FJProduksiOutput
      
    ) o ON o.NoFJ = h.${KEY_COLUMN}
    LEFT JOIN (
      SELECT NoProduksi, IdMesin FROM FJProduksi_h
    ) p ON p.NoProduksi = o.NoProduksi
    LEFT JOIN BongkarSusunOutputFJ s ON s.NoFJ = h.${KEY_COLUMN}
    LEFT JOIN MstMesin m       ON m.IdMesin = p.IdMesin
    LEFT JOIN MstGrade g       ON g.IdGrade = h.IdGrade
    LEFT JOIN MstOrgTelly t    ON t.IdOrgTelly = h.IdOrgTelly
    LEFT JOIN MstJenisKayu k   ON k.IdJenisKayu = h.IdJenisKayu
    LEFT JOIN MstWarehouse wf  ON wf.IdWarehouse = h.IdFisik
    WHERE h.${KEY_COLUMN} = @noFJ
  `); // UNION SELECT NoProduksi, NoFJ FROM CCAkhirProduksiOutputFJ

  return result.recordset[0] || null;
}

async function getDetail(noFJ) {
  const pool = await poolPromise;
  const req = pool.request();
  req.input("noFJ", sql.VarChar(50), noFJ);

  const result = await req.query(`
    SELECT Tebal, Lebar, Panjang, JmlhBatang
    FROM ${DETAIL_TABLE}
    WHERE ${KEY_COLUMN} = @noFJ
    ORDER BY NoUrut
  `);

  return result.recordset;
}

/* ============================================================
 * PERHITUNGAN (samakan dengan S4S.java: m3() & jumlahpcs())
 * ==========================================================*/

function toNumber(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

// Mirror S4S.java m3(): per baris floor 4 desimal, lalu dijumlahkan, format "0.0000".
function computeM3(detail) {
  let total = 0;
  for (const row of detail) {
    const tebal = toNumber(row.Tebal);
    const lebar = toNumber(row.Lebar);
    const panjang = toNumber(row.Panjang);
    const pcs = parseInt(row.JmlhBatang, 10) || 0;

    let rowM3 = (tebal * lebar * panjang * pcs) / 1000000000.0;
    rowM3 = Math.floor(rowM3 * 10000) / 10000;
    total += rowM3;
  }
  return total.toFixed(4);
}

// Mirror S4S.java jumlahpcs(): jumlah kolom pcs.
function computeTotalPcs(detail) {
  return detail.reduce((sum, row) => sum + (parseInt(row.JmlhBatang, 10) || 0), 0);
}

function firstToken(s) {
  if (!s) return "-";
  const t = String(s).trim().split(/\s+/)[0];
  return t || "-";
}

function truthy(v) {
  return v === true || v === 1 || v === "1";
}

function resolveMesinSusun(header) {
  if (header.NamaMesin) {
    return header.NoProduksi
      ? `${header.NamaMesin} - ${header.NoProduksi}`
      : header.NamaMesin;
  }
  if (header.NoBongkarSusun) return header.NoBongkarSusun;
  return "-";
}

/* ============================================================
 * DATA LABEL (bentuk siap render ke template PDF)
 * ==========================================================*/

async function getLabelData(noFJ) {
  const header = await getHeader(noFJ);
  if (!header) {
    const err = new Error(`Label FJ ${noFJ} tidak ditemukan`);
    err.statusCode = 404;
    throw err;
  }

  const detail = await getDetail(noFJ);
  if (!detail.length) {
    const err = new Error(`Detail label FJ ${noFJ} tidak ditemukan`);
    err.statusCode = 404;
    throw err;
  }

  return {
    noFJ: header.NoFJ,
    jenisKayu: header.JenisKayu || "-",
    grade: header.Grade || "-",
    fisik: header.FisikSingkatan || header.FisikNama || "-",
    tanggal: header.DateCreate ? moment(header.DateCreate).format("DD-MMM-YYYY") : "-",
    jam: header.Jam ? moment.utc(header.Jam).format("HH:mm") : "-",
    mmYY: header.DateCreate ? moment(header.DateCreate).format("MMYY") : "-",
    telly: firstToken(header.Telly),
    noSPK: header.NoSPK || "-",
    mesinSusun: resolveMesinSusun(header),
    remark: (header.Remark || "").trim(),
    isReject: truthy(header.IsReject),
    isLembur: truthy(header.IsLembur),
    hasBeenPrinted: parseInt(header.HasBeenPrinted, 10) || 0,
    dateUsage: header.DateUsage || null,
    detail: detail.map((r) => ({
      tebal: r.Tebal,
      lebar: r.Lebar,
      panjang: r.Panjang,
      pcs: r.JmlhBatang,
    })),
    totalPcs: computeTotalPcs(detail),
    totalM3: computeM3(detail),
  };
}

module.exports = { getLabelData };
