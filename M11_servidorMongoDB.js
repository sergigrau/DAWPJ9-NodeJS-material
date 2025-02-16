/*
 * Servidor HTTP millorat amb Node JS. 
 * Connecta amb MongoDB i realitza diverses operacions CRUD
 * @author sergi grau, sergi.grau@fje.edu
 * @version 2.0
 * date 06.04.2017
 * format del document UTF-8
 *
 * CHANGELOG
 * 08.04.2016
 * - Connecta amb MongoDB i realitza diverses operacions CRUD
 * 06.04.2017
 * - millora la sortida de les operacions realitzades amb mongodb
 * 01.11.2021
 * - actualització a client MongoDB 4.x
 * 01.02.2025
 * - actualització a client MongoDB 8.x  
 * NOTES
 * ORIGEN
 * Desenvolupament Aplicacions Web. Jesuïtes el Clot
 */
let http = require("http");
let fs = require('fs');

const { MongoClient, ServerApiVersion } = require("mongodb");
let cadenaConnexio = 'mongodb://127.0.0.1:27017/daw2';
let assert = require('assert'); //utilitzem assercions
let ObjectId = require('mongodb').ObjectID;

let crud = {};

crud.afegirDocument = async function (alumne, db) {
    try {
        const result = await db.collection('usuaris').insertOne(alumne);
        console.log("Afegit document a col·lecció usuaris", result);
    } catch (err) {
        console.error("Error afegint document:", err);
    }
};

crud.consultarDocuments = async function (db) {
    try {
        const usuaris = await db.collection('usuaris').find({}).toArray();
        return usuaris;
    } catch (err) {
        console.error("Error consultant documents:", err);
    }
};

crud.actualitzarDocument = async function (id, alumne, db) {
    try {
        const result = await db.collection('usuaris').updateOne({ _id: new ObjectId(id) }, { $set: alumne });
        console.log("Actualitzat document a col·lecció usuaris", result);
    } catch (err) {
        console.error("Error actualitzant document:", err);
    }
};

crud.eliminarDocument = async function (id, db) {
    try {
        const result = await db.collection('usuaris').deleteOne({ _id: new ObjectId(id) });
        console.log("Eliminat document de col·lecció usuaris", result);
    } catch (err) {
        console.error("Error eliminant document:", err);
    }
};

function iniciar() {

    const client = new MongoClient(cadenaConnexio, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
    );

    async function run() {
        try {
            // Connecta el client al servidor (opcional a partir de la versió 4.7)
            await client.connect();
            // Envia un ping per confirmar una connexió exitosa
            await client.db("admin").command({ ping: 1 });
            console.log("Ping al teu desplegament. T'has connectat correctament a MongoDB!");
        } finally {
            // Assegura que el client es tancarà quan acabis/error
            await client.close();
        }
    }
    run().catch(console.dir);

    function onRequest(request, response) {
        let sortida;
        const baseURL = request.protocol + '://' + request.headers.host + '/';
        const reqUrl = new URL(request.url, baseURL);
        console.log("Petició per a  " + reqUrl.pathname + " rebuda.");
        const ruta = reqUrl.pathname;

        if (ruta == '/inici') {
            fs.readFile('./M11_mongoDB.html', function (err, sortida) {
                response.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8"
                });
                response.write(sortida);
                response.end();
            });
        }
        else if (ruta == '/desa') {


            async function run() {
                try {
                    // Connecta el client al servidor (opcional a partir de la versió 4.7)
                    await client.connect();
                    const db = client.db('daw2');

                    await crud.afegirDocument({
                        "nom": reqUrl.searchParams.get('nom')
                    }, db);

                    console.log("Afegit document a col·lecció usuaris");

                } finally {
                    // Assegura que el client es tancarà quan acabis/error
                    await client.close();
                }
            }
            run().catch(console.dir);
        }
        else if (ruta == '/consulta') {
            response.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8"
            });
            console.log("consulta document a col·lecció usuaris");
            async function run() {
                try {
                    // Connecta el client al servidor (opcional a partir de la versió 4.7)
                    await client.connect();
                    const db = client.db('daw2');
                    const usuaris = await crud.consultarDocuments(db);
                    response.write(JSON.stringify(usuaris));
                    response.end();

                } finally {
                    // Assegura que el client es tancarà quan acabis/error
                    await client.close();
                }
            }
            run().catch(console.dir)

        }

        else {
            response.writeHead(404, {
                "Content-Type": "text/html; charset=utf-8"
            });
            sortida = "404 NOT FOUND";
            response.write(sortida);
            response.end();
        }


    }

    http.createServer(onRequest).listen(8888);
    console.log("Servidor iniciat.");
}

exports.iniciar = iniciar;