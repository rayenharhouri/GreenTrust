const express = require("express")
const compression = require("compression")
const multer  = require('multer')
const path = require("path")
const crypto = require("crypto");
const cors = require('cors');
const CSV = require("csv-parse");
const XlsxPopulate = require('xlsx-populate');
const fs = require("fs");
const { type } = require("os");
const util = require("util")

// the unbreakable filter 🤪
const filter = function (_, file, cb) {
    if(file.mimetype === "text/csv") {
        cb(null, true)
    } else {
        cb(new Error('The file format is not supported'))
    }
}

// for MVP purposes, file mapping will be stored in memory
let files = []
const storage = multer.memoryStorage()

const upload = multer({ 
    storage,
    // dest: path.join(__dirname, "uploads/"),
    fileFilter: filter,
    limits: {
        fieldSize:  10 * 1024 * 1024,
    }
})

const app = express()

app.use(compression())
app.use(cors())
app.use(express.json())

app.route("/files")
    .get(function (_, res) {
        res.status(200).json(files.map(toJSON)).end()
    })
    .post(upload.single("table"), function (req,res) {
            const uuid = crypto.randomUUID()
            const file = { uuid, filename: req.file.originalname, size: req.file.size, buffer: req.file.buffer.toString("utf-8") }
            files.push(file)
            res.status(201).json(toJSON(file)).end()
    })

app.route("/files/:uuid")
    .get(function (req, res, next) {
        const file = files.find(f => f.uuid === req.params.uuid)
        if(!file) {
            next(new Error("File not found"))
        }

        CSVToJSON(file).then((records) => {
            res.status(200).json(records.map(rec => ({key: rec.id, ...rec})).slice(3)).end()
        }).catch(next)
    })


function CSVToJSON(file) {
    return new Promise((resolve, reject) => {
        const parser = CSV.parse(file.buffer, {
            delimiter: ';',
        })
        const records = []
        parser.on('readable', function(){
            let record;
            while ((record = parser.read()) !== null) {
              records.push({
                id: record[0],
                NumeroRegistro: record[1],
                CIF: record[2],
                RazonSocial: record[3],
                CodigoPlanta: record[4],
                CIL: record[5],
                Estado: record[6],
                Ano: record[7],
                Mes: record[8],
                FechaInicio: record[9],
                FechaFin: record[10],
                FechaPresentacion: record[11],
                GarantiaSolicitada: record[12],
                TipoCesion: record[13],
                idContratoGDO: record[14],
                idDatosGestion: record[15],
                Potencia: record[16],
                Tecnologia: record[17],
                ExpedidaAnotada: record[18],
                ExpedidaTramite: record[19],
                NombreFicheroExcel: record[20],
                ID_Datatable: record[21],
              });
            }
        });

        parser.on('end', function(){
            resolve(records)
        })

        parser.on("error", (e) => {
            reject(e)
        })
    })
}


app.get("/", function (_, res) {
    res.sendFile(path.join(__dirname, "views", "index.html"))
})


function toJSON({uuid, filename, size}) {
    return {uuid, filename, size, key:uuid}
}

app.post("/download", (req,res,next) => {
    const file_path = path.join(__dirname, "template.xlsm")
    const {keys, uuid} = req.body
    if(!keys) res.status(401).end()
    XlsxPopulate.fromFileAsync(file_path)
    .then(workbook => {

        const file = files.find(f => f.uuid === uuid)
        if(!file) {
            next(new Error("File not found"))
        }

        CSVToJSON(file).then((records) => {
            const recs = records.filter(rec => keys.includes(rec.id))
            console.log(recs)
            let i = 14
            for(const rec of recs) {
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
                
                const fecha = new Date(rec.FechaFin)
                const my = (fecha.getMonth()+1) + '-' + fecha.getFullYear()
                workbook.sheet("EXPEDICION").cell('A'+i).value(rec.CIF)
                workbook.sheet("EXPEDICION").cell("B"+i).value(rec.RazonSocial)
                workbook.sheet("EXPEDICION").cell("C"+i).value(rec.CodigoPlanta)
                workbook.sheet("EXPEDICION").cell("D"+i).value(rec.CIL)
        
                workbook.sheet("EXPEDICION").cell("F"+i).value(my)
                workbook.sheet("EXPEDICION").cell("G"+i).value(my)
                i++
            }

            workbook.outputAsync({
                type: "nodebuffer"
            }).then((buf) => {
                res.contentType("application/vnd.ms-excel.sheet.macroEnabled.12").send(buf)
            })

        }).catch(next)

    });


})

app.use(function (err, req, res, next) {
    res.status(402).json({ error: err.message })
})

app.listen(3000, function () {
    console.log("Server is running on port 3000")
})
