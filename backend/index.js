const express = require("express")
const compression = require("compression")
const multer = require('multer')
const path = require("path")
const crypto = require("crypto");
const cors = require('cors');
const CSV = require("csv-parse");
const sqlite3 = require('sqlite3').verbose();
const XlsxPopulate = require('xlsx-populate');
const XLSX = require("xlsx");
const axios = require('axios');

// the unbreakable filter 🤪
const filter = function (_, file, cb) {
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        cb(null, true)
    } else {
        cb(new Error('The file format is not supported'))
    }
}

// for MVP purposes, file mapping will be stored in memory
let files = {}
const db = new sqlite3.Database(':memory:');
const storage = multer.memoryStorage()

const upload = multer({
    storage,
    // dest: path.join(__dirname, "uploads/"),
    fileFilter: filter,
    limits: {
        fieldSize: 10 * 1024 * 1024,
    }
})

const app = express()

app.use(compression())
app.use(cors())
app.use(express.json())

/*{
    id: 855126,
    CIF: 'B92478296',
    RazonSocial: 'Angulo Anaya S.L.',
    CodigoPlanta: 'ANGULOANAYA',
    CIL: 'ES0031000000400038QB1F001',
    'Año': 2024,
    Mes: 1,
    FechaInicio: 45292,
    FechaFin: 45351,
    GarantiaSolicitada: 1,
    TipoCesion: 'Ced_NX',
    idContratoGDO: 21491,
    idDatosGestion: 572127,
    Potencia: 0.15,
    Tecnologia: 'HIDRAULICA',
    NombreFicheroExcel: 'Expedicion_638557050605449585_01',
    ID_Datatable: 855126
}*/
function createTableBuilder(uuid) {
    return `CREATE TABLE ${uuid} (
        'id' TEXT,
        'CIF' TEXT,
        'RazonSocial' TEXT,
        'CodigoPlanta' TEXT,
        'CIL' TEXT,
        'Año' TEXT,
        'Mes' TEXT,
        'FechaInicio' TEXT,
        'FechaFin' TEXT,
        'GarantiaSolicitada' REAL,
        'TipoCesion' TEXT,
        'idContratoGDO' TEXT,
        'idDatosGestion' TEXT,
        'Potencia' REAL,
        'Tecnologia' TEXT
    )`;
}

function createfilterTableBuilder(uuid) {
    return `
    CREATE TABLE ${uuid}_filter (
    'TipoCesion' TEXT,
    'Tecnologia' TEXT
); `
}
app.route("/files")
    .get(function (_, res) {
        res.status(200).json(Object.values(files).map(toJSON)).end()
    })
    .post(upload.single("table"), function (req, res) {
        const uuid = crypto.randomUUID()
        const file = { uuid, filename: req.file.originalname, size: req.file.size, table_id: makeid(10) }
        const workbook = XLSX.read(req.file.buffer);
        const json = XLSX.utils.sheet_to_json(workbook.Sheets["Hoja1"],{range: 2});
        const filter = XLSX.utils.sheet_to_json(workbook.Sheets["filtros"]).map(item => Object.values(item));


        db.run(createTableBuilder(file.table_id), (err) => {
            if (err) throw err;
            const stmt = db.prepare(`INSERT INTO ${file.table_id}  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            for (const row of json.map(e => ({ ...e, FechaInicio: XlsxPopulate.numberToDate(e.FechaInicio).getTime(), FechaFin: XlsxPopulate.numberToDate(e.FechaFin).getTime() }))) {
                stmt.run(Object.values(row).slice(0, -2));
            }
            stmt.finalize();
            db.run(createfilterTableBuilder(file.table_id), (err) => {
                if (err) throw err;
                const filtersInsertStmt = db.prepare(`INSERT INTO ${file.table_id}_filter (TipoCesion, Tecnologia) VALUES (?, ?)`);
                for (const filterRow of filter.map(item => Object.values(item).slice(0, -1))) {
                filtersInsertStmt.run(filterRow);
                console.log(filterRow);
            }
                filtersInsertStmt.finalize();
            });
            
            files[uuid] = file
            const response = {
                file: toJSON(file), // Assuming `toJSON(file)` processes the file data
                filters: filter,   // The filters array
            };
            res.status(201).json(response).end()
        })
    })

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


app.route("/files/:uuid")
    .get(function (req, res, next) {
        const file = files[req.params.uuid];
        if (!file) {
            return next(new Error("File not found"));
        }

        // Fetch filter data from the filters table
        db.all(`SELECT * FROM ${file.table_id}_filter`, (err, filterRows) => {
            if (err) throw err;

            // Fetch file data from the file table
            db.all(`SELECT * FROM ${file.table_id}`, (err, rows) => {
                if (err) throw err;

                // Apply filtering logic: only keep rows that match filters
                const filteredData = filterRows.map(filter => {
                    return {
                        filter: {
                            TipoCesion: filter.TipoCesion,
                            Tecnologia: filter.Tecnologia,
                        },
                        data: rows.filter(row =>
                            row.TipoCesion === filter.TipoCesion && row.Tecnologia === filter.Tecnologia
                        ).map(r => ({ ...r, key: r.id }))
                    };
                });

                console.log('Filtered Data:', JSON.stringify(filteredData, null, 2));

                // Send the filtered data to the Flask server
                axios.post('http://localhost:5000/receive-data', { filteredData })
                    .then(response => {
                        console.log('Data sent to Flask server:', response.data);
                    })
                    .catch(error => {
                        console.error('Error sending data to Flask server:', error);
                    });

                // Return the structured data
                res.status(200).json({ filteredData }).end();
            });
        });
    });
app.get("/", function (_, res) {
    res.sendFile(path.join(__dirname, "views", "index.html"))
})


function toJSON({ uuid, filename, size }) {
    return { uuid, filename, size, key: uuid }
}

function all_p(f) {
    return new Promise((res, rej) => {
        f.all((err, rec) => {
            if (err) rej(err);
            res(rec)
        })
    })
}

function get_p(f, r) {
    return new Promise((res, rej) => {
        f.all(r, (err, rec) => {
            if (err) rej(err);
            res(rec)
        })
    })
}

app.post("/download", (req, res, next) => {
    const file_path = path.join(__dirname, "template.xlsm")
    const { keys, uuid, rows } = req.body
    if (!keys) res.status(401).end()
    XlsxPopulate.fromFileAsync(file_path)
        .then(async workbook => {
            const file = files[uuid]
            if (!file) {
                next(new Error("File not found"))
            }

            const today = new Date();
            const yyyy = today.getFullYear();
            let mm = today.getMonth() + 1;
            let dd = today.getDate();
            if (dd < 10) dd = '0' + dd;
            if (mm < 10) mm = '0' + mm;

            const formattedToday = dd + '/' + mm + '/' + yyyy;
            workbook.sheet("Datos_Comunes").cell("D21").value("Barcelone")
            workbook.sheet("Datos_Comunes").cell("F21").value(formattedToday)
            workbook.sheet("Datos_Comunes").cell("E11").value("42")
            workbook.sheet("Datos_Comunes").cell("C11").value("cosel de cent")
            workbook.sheet("Datos_Comunes").cell("G11").value("08014")
            workbook.sheet("Datos_Comunes").cell("H11").value("Barcelona")
            workbook.sheet("Datos_Comunes").cell("I11").value("Barcelona")
            workbook.sheet("Datos_Comunes").cell("J11").value("Espana")
            workbook.sheet("Datos_Comunes").cell("K11").value("932289972")
            workbook.sheet("Datos_Comunes").cell("L11").value("contratacionsolar@nexusenergia.com")

            //TODO: maybe an SQL Injection. switch to SEQUELIZE ORM
            const stmt_exp = db.prepare(`select *, SUM(GarantiaSolicitada) as sum from ${file.table_id} where id in (${keys.toString()}) group by CodigoPlanta`)
            const recs_exp = (await all_p(stmt_exp))

            const stmt_prod = db.prepare(`select * from ${file.table_id} where id in (${keys.toString()})`)
            const recs_prod = (await all_p(stmt_prod))

            let i = 14
            for (const rec of recs_exp) {
                const stmt_init = db.prepare(`select FechaInicio from ${file.table_id} where CIF=? and CIL=? and id in (${keys.toString()}) order by FechaInicio limit 1`)
                const f_i = (await get_p(stmt_init, [rec.CIF, rec.CIL]))[0]
                const fecha_inicio = new Date(Number(f_i.FechaInicio))

                const stmt_f = db.prepare(`select FechaFin from ${file.table_id} where CIF=? and CIL=? and id in (${keys.toString()}) order by FechaFin DESC limit 1`)
                const f_f = (await get_p(stmt_f, [rec.CIF, rec.CIL]))[0]
                const fecha_fin = new Date(Number(f_f.FechaFin))

                workbook.sheet("EXPEDICION").cell('A' + i).value(rec.CIF)
                workbook.sheet("EXPEDICION").cell("B" + i).value(rec.RazonSocial)
                workbook.sheet("EXPEDICION").cell("C" + i).value(rec.CodigoPlanta)
                workbook.sheet("EXPEDICION").cell("D" + i).value(rec.CIL)
                workbook.sheet("EXPEDICION").cell("E" + i).value(Number(rec.Potencia) * 1000)
                workbook.sheet("EXPEDICION").cell("F" + i).value(fecha_inicio).style("numberFormat", "mm-yyyy")
                workbook.sheet("EXPEDICION").cell("G" + i).value(fecha_fin).style("numberFormat", "mm-yyyy")
                workbook.sheet("EXPEDICION").cell("H" + i).value(Number(rec.sum) / 1000)

                i++
            }

            i = 12
            for (const rec of recs_prod) {
                workbook.sheet("Produccion_Mensual").cell("A" + (i)).value(rec.CIL)
                workbook.sheet("Produccion_Mensual").cell("B" + (i)).value(Number(rec.GarantiaSolicitada) / 1000)
                workbook.sheet("Produccion_Mensual").cell("C" + (i)).value(Number(rec.Mes)).style("numberFormat", "00")
                workbook.sheet("Produccion_Mensual").cell("D" + (i)).value(Number(rec["Año"]))
                i++
            }

            workbook.outputAsync({
                type: "nodebuffer"
            }).then((buf) => {
                res.send(buf)
            })




        });


})

app.use(function (err, req, res, next) {
    console.error(err)
    res.status(402).json({ error: err.message })
})

app.listen(3000, function () {
    console.log("Server is running on port 3000")
})
