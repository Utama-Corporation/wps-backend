/* =====================================================================
 * QC SPK Barang Jadi — tabel hasil QC per bundle.
 * Dibuat manual di SQL Server WPS_TEST3 (repo tidak memakai migrasi CREATE TABLE;
 * Flyway di db/migrations hanya untuk trigger audit).
 *
 * Identitas 1 baris SPK = (IdBarangJadi, IdJenisKayu, Tebal, Lebar, Panjang)
 * karena MstSPK_d tidak punya kolom id. Dimensi spec disimpan sebagai
 * Spk* agar data QC tidak hilang bila urutan baris MstSPK_d bergeser.
 * ===================================================================== */
IF OBJECT_ID('dbo.QcSpkBarangJadi_d', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.QcSpkBarangJadi_d (
        NoSPK        varchar(50)   NOT NULL,
        IdBarangJadi int           NOT NULL,
        IdJenisKayu  int           NOT NULL,
        SpkTebal     decimal(18,2) NOT NULL,
        SpkLebar     decimal(18,2) NOT NULL,
        SpkPanjang   decimal(18,2) NOT NULL,
        NoBundle     int           NOT NULL,   -- urut bundle 1..N (boleh > / < kolom Bundle di MstSPK_d)
        Tebal        decimal(18,2) NULL,       -- hasil ukur QC
        Lebar        decimal(18,2) NULL,
        Panjang      decimal(18,2) NULL,
        JumlahPcs    int           NULL,
        CreatedBy    varchar(50)   NULL,
        CreatedAt    datetime      NOT NULL CONSTRAINT DF_QcSpkBarangJadi_d_CreatedAt DEFAULT (GETDATE()),
        UpdatedAt    datetime      NULL,
        CONSTRAINT PK_QcSpkBarangJadi_d PRIMARY KEY
            (NoSPK, IdBarangJadi, IdJenisKayu, SpkTebal, SpkLebar, SpkPanjang, NoBundle)
    );

    CREATE INDEX IX_QcSpkBarangJadi_d_NoSPK ON dbo.QcSpkBarangJadi_d (NoSPK);
END
GO

/* Foto per bundle — menyimpan object key MinIO (bucket "wps", prefix "qc-spk-bj/").
 * Jalankan sekali. */
IF COL_LENGTH('dbo.QcSpkBarangJadi_d', 'FotoTebal') IS NULL
BEGIN
    ALTER TABLE dbo.QcSpkBarangJadi_d ADD
        FotoTebal   varchar(255) NULL,
        FotoLebar   varchar(255) NULL,
        FotoPanjang varchar(255) NULL,
        FotoBundle  varchar(255) NULL;
END
GO

/* Permission RBAC — modul ini memakai permission SPK yang sudah ada:
 *   spk:read   -> GET daftar SPK, baris SPK, dan bundle QC
 *   spk:create -> POST simpan bundle QC
 *   spk:delete -> DELETE bundle QC
 * Pastikan grup user QC sudah punya baris spk:* (Allow = 1) di
 * dbo.MstUserGroupPermission. Tidak perlu membuat permission baru.
 */
