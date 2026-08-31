const { sql, poolPromise } = require("../../../core/config/db");

async function getStock(tgl) {
  const pool = await poolPromise;
  const req = pool.request();
  req.input("tgl", sql.Date, tgl);
  const result = await req.query(`
    SELECT
      CASE WHEN B.Jenis LIKE '%KAYU LAT%' THEN B.Jenis ELSE 'ST ' + B.Jenis END AS Jenis,
      SUM(CASE
        WHEN (A.IdUOMTblLebar = 1 AND A.IdUOMPanjang = 4)
          THEN ROUND((C.Tebal * C.Lebar * C.Panjang * C.JmlhBatang * 215.2542 / 100000) / 10000, 4, 1)
        WHEN (A.IdUOMTblLebar = 3 AND A.IdUOMPanjang = 4)
          THEN ROUND((C.Tebal * C.Lebar * C.Panjang * C.JmlhBatang / 7200.8 * 10000) / 10000, 4, 1)
      END) AS TotalM3,
      MIN(A.DateCreate) AS TglTerlama
    FROM ST_h A
    INNER JOIN MstJenisKayu B ON B.IdJenisKayu = A.IdJenisKayu
    INNER JOIN ST_d C ON C.NoST = A.NoST
    WHERE A.DateCreate <= @tgl
      AND (A.DateUsage IS NULL OR A.DateUsage > @tgl)
      AND (A.IsUpah IS NULL OR A.IsUpah = 0)
    GROUP BY B.Jenis
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
      A.NoST AS NoLabel,
      A.DateCreate,
      CASE WHEN B.Jenis LIKE '%KAYU LAT%' THEN B.Jenis ELSE 'ST ' + B.Jenis END AS Jenis,
      MIN(C.Tebal) AS Tebal,
      MIN(C.Lebar) AS Lebar,
      MIN(C.Panjang) AS Panjang,
      SUM(C.JmlhBatang) AS JmlhBatang,
      ROUND(SUM(CASE
        WHEN (A.IdUOMTblLebar = 1 AND A.IdUOMPanjang = 4)
          THEN (C.Tebal * C.Lebar * C.Panjang * C.JmlhBatang * 215.2542 / 100000) / 10000
        WHEN (A.IdUOMTblLebar = 3 AND A.IdUOMPanjang = 4)
          THEN (C.Tebal * C.Lebar * C.Panjang * C.JmlhBatang / 7200.8 * 10000) / 10000
      END), 4, 1) AS M3
    FROM ST_h A
    INNER JOIN MstJenisKayu B ON B.IdJenisKayu = A.IdJenisKayu
    INNER JOIN ST_d C ON C.NoST = A.NoST
    WHERE (CASE WHEN B.Jenis LIKE '%KAYU LAT%' THEN B.Jenis ELSE 'ST ' + B.Jenis END) = @jenis
      AND A.DateCreate <= @tgl
      AND (A.DateUsage IS NULL OR A.DateUsage > @tgl)
      AND (A.IsUpah IS NULL OR A.IsUpah = 0)
    GROUP BY A.NoST, A.DateCreate, CASE WHEN B.Jenis LIKE '%KAYU LAT%' THEN B.Jenis ELSE 'ST ' + B.Jenis END
    ORDER BY A.DateCreate ASC, A.NoST
  `);
  return result.recordset;
}

async function getOldestDate() {
  const pool = await poolPromise;
  const result = await pool.request().query(
    `SELECT MIN(DateCreate) AS oldestDate FROM ST_h`
  );
  return result.recordset[0] ? result.recordset[0].oldestDate : null;
}

module.exports = { getStock, getLabels, getOldestDate };
