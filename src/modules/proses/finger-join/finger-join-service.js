const { sql, poolPromise } = require("../../../core/config/db");

async function getStock(tgl) {
  const pool = await poolPromise;
  const req = pool.request();
  req.input("tgl", sql.Date, tgl);
  const result = await req.query(`
    SELECT
      (CASE WHEN A.IdFisik IS NULL OR A.IdFisik = 0 THEN G.Singkatan ELSE H.Singkatan END + ' ' + C.Jenis + ' ' + I.NamaGrade) AS Jenis,
      SUM(ROUND(B.Tebal * B.Lebar * B.Panjang * B.JmlhBatang / 1000000000.0 *
        CASE WHEN A.IdUOMTblLebar = 3 THEN 645.16 ELSE 1 END *
        CASE WHEN A.IdUOMPanjang = 4 THEN 304.8 ELSE 1 END, 4, 1)) AS TotalM3,
      MIN(A.DateCreate) AS TglTerlama
    FROM FJ_h A
    INNER JOIN FJ_d B ON B.NoFJ = A.NoFJ
    INNER JOIN MstJenisKayu C ON C.IdJenisKayu = A.IdJenisKayu
    INNER JOIN MstWarehouse G ON G.IdWarehouse = A.IdWarehouse
    FULL JOIN MstWarehouse H ON H.IdWarehouse = A.IdFisik
    INNER JOIN MstGrade I ON I.IdGrade = A.IdGrade
    WHERE A.DateCreate <= @tgl AND (A.DateUsage > @tgl OR A.DateUsage IS NULL)
    GROUP BY (CASE WHEN A.IdFisik IS NULL OR A.IdFisik = 0 THEN G.Singkatan ELSE H.Singkatan END + ' ' + C.Jenis + ' ' + I.NamaGrade)
    ORDER BY Jenis
  `);
  return result.recordset;
}

async function getLabels(jenis, tgl) {
  const pool = await poolPromise;
  const req = pool.request();
  req.input("tgl", sql.Date, tgl);
  req.input("jenis", sql.VarChar(250), jenis);
  const result = await req.query(`
    SELECT
      A.NoFJ AS NoLabel,
      A.DateCreate,
      (CASE WHEN A.IdFisik IS NULL OR A.IdFisik = 0 THEN G.Singkatan ELSE H.Singkatan END + ' ' + C.Jenis + ' ' + I.NamaGrade) AS Jenis,
      I.NamaGrade,
      B.Tebal,
      B.Lebar,
      B.Panjang,
      B.JmlhBatang,
      ROUND(B.Tebal * B.Lebar * B.Panjang * B.JmlhBatang / 1000000000.0 *
        CASE WHEN A.IdUOMTblLebar = 3 THEN 645.16 ELSE 1 END *
        CASE WHEN A.IdUOMPanjang = 4 THEN 304.8 ELSE 1 END, 4, 1) AS M3
    FROM FJ_h A
    INNER JOIN FJ_d B ON B.NoFJ = A.NoFJ
    INNER JOIN MstJenisKayu C ON C.IdJenisKayu = A.IdJenisKayu
    INNER JOIN MstGrade I ON I.IdGrade = A.IdGrade
    INNER JOIN MstWarehouse G ON G.IdWarehouse = A.IdWarehouse
    FULL JOIN MstWarehouse H ON H.IdWarehouse = A.IdFisik
    WHERE (CASE WHEN A.IdFisik IS NULL OR A.IdFisik = 0 THEN G.Singkatan ELSE H.Singkatan END + ' ' + C.Jenis + ' ' + I.NamaGrade) = @jenis
      AND A.DateCreate <= @tgl AND (A.DateUsage > @tgl OR A.DateUsage IS NULL)
    ORDER BY A.DateCreate ASC, A.NoFJ
  `);
  return result.recordset;
}

async function getOldestDate() {
  const pool = await poolPromise;
  const result = await pool.request().query(
    `SELECT MIN(DateCreate) AS oldestDate FROM FJ_h`
  );
  return result.recordset[0] ? result.recordset[0].oldestDate : null;
}

module.exports = { getStock, getLabels, getOldestDate };
