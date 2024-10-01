const express = require('express');
const snmp = require('net-snmp');

// Configuração da API
const app = express();
const port = 3000; // Defina a porta que desejar

// Função para realizar o SNMP walk
function snmpWalk(target, community, oid, callback) {
    const options = {
        port: 161,
        retries: 1,
        timeout: 5000,
        version: snmp.Version2c
    };

    const session = snmp.createSession(target, community, options);

    let results = [];

    // Função callback para processar os resultados do walk
    function feedCb(varbinds) {
        for (let i = 0; i < varbinds.length; i++) {
            let value;

            if (snmp.isVarbindError(varbinds[i])) {
                value = `Error: ${snmp.varbindError(varbinds[i])}`;
            } else if (Buffer.isBuffer(varbinds[i].value)) {
                // Converter Buffer para string
                value = varbinds[i].value.toString();
            } else {
                value = varbinds[i].value;
            }

            results.push({ oid: varbinds[i].oid, value: value });
        }
    }

    // Iniciar o walk
    session.walk(oid, 20, feedCb, function (error) {
        session.close();
        callback(error, results);
    });
}

// Rota para realizar o SNMP walk
app.get('/snmp-walk', (req, res) => {
    const target = '192.10.9.192'; // IP do MikroTik
    const community = 'elias'; // Community string
    const oid = '1.3.6.1.2.1'; // OID inicial para o walk

    snmpWalk(target, community, oid, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Erro durante o SNMP walk', details: error });
        } else {
            res.json(results);
        }
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});
