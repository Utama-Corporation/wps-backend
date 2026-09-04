const moment = require("moment");
const { sql, poolPromise } = require("../../../core/config/db");

const MASTER_TABLE = "BarangJadi_h";
const DETAIL_TABLE = "BarangJadi_d";
const KEY_COLUMN = "NoBJ";

/* ============================================================
 * QUERY
 * ==========================================================*/

async function getHeader(noBJ) {
  const pool = await poolPromise;
  const req = pool.request();
  req.input("noBJ", sql.VarChar(50), noBJ);

  const result = await req.query(`
    SELECT
      h.${KEY_COLUMN}      AS NoBJ,
      h.DateCreate,
      h.Jam,
      h.NoSPK,
      h.Remark,
      h.IsReject,
      h.IsLembur,
      h.HasBeenPrinted,
      h.DateUsage,
      k.Jenis              AS JenisKayu,
      g.NamaBarangJadi     AS NamaBJ,
      t.NamaOrgTelly       AS Telly,      
      m.NamaMesin          AS NamaMesin,
      o.NoProduksi         AS NoProduksi,
      s.NoBongkarSusun     AS NoBongkarSusun
    FROM ${MASTER_TABLE} h
    LEFT JOIN (
      SELECT NoProduksi, NoBJ FROM PackingProduksiOutput      
    ) o ON o.NoBJ = h.${KEY_COLUMN}
    LEFT JOIN (
      SELECT NoProduksi, IdMesin FROM PackingProduksi_h
    ) p ON p.NoProduksi = o.NoProduksi
    LEFT JOIN BongkarSusunOutputBarangJadi s ON s.NoBJ = h.${KEY_COLUMN}
    LEFT JOIN MstMesin m       ON m.IdMesin = p.IdMesin
    LEFT JOIN MstBarangJadi g  ON g.IdBarangJadi = h.IdBarangJadi
    LEFT JOIN MstOrgTelly t    ON t.IdOrgTelly = h.IdOrgTelly
    LEFT JOIN MstJenisKayu k   ON k.IdJenisKayu = h.IdJenisKayu
    WHERE h.${KEY_COLUMN} = @noBJ
  `);

  return result.recordset[0] || null;
}

async function getDetail(noBJ) {
  const pool = await poolPromise;
  const req = pool.request();
  req.input("noBJ", sql.VarChar(50), noBJ);

  const result = await req.query(`
    SELECT Tebal, Lebar, Panjang, JmlhBatang
    FROM ${DETAIL_TABLE}
    WHERE ${KEY_COLUMN} = @noBJ
    ORDER BY NoUrut
  `);

  return result.recordset;
}

/* ============================================================
 * PERHITUNGAN (samakan dengan Packing.java: m3() & jumlahpcs())
 * ==========================================================*/

function toNumber(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

// Mirror Packing.java m3(): per baris floor 4 desimal, lalu dijumlahkan, format "0.0000".
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

// Mirror Packing.java jumlahpcs(): jumlah kolom pcs.
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

async function getLabelData(noBJ) {
  const header = await getHeader(noBJ);
  if (!header) {
    const err = new Error(`Label BJ ${noBJ} tidak ditemukan`);
    err.statusCode = 404;
    throw err;
  }

  const detail = await getDetail(noBJ);
  if (!detail.length) {
    const err = new Error(`Detail label BJ ${noBJ} tidak ditemukan`);
    err.statusCode = 404;
    throw err;
  }

  return {
    noBJ: header.NoBJ,
    jenisKayu: header.JenisKayu || "-",
    //grade: header.Grade || "-",
    namaBJ: header.NamaBJ || '-',
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
