const snmp = require('net-snmp');

// Informações da conexão
const target = '192.10.9.10';
const community = 'ELIAS';

// Configurações de sessão SNMP
const options = {
    port: 161,  // Porta SNMP padrão
    retries: 1, // Número de tentativas
    timeout: 5000, // Timeout de cada requisição em milissegundos
    version: snmp.Version2c // Utilizando SNMP versão 2c
};

// OID inicial para o SNMP walk (a partir da raiz para percorrer toda a árvore)
const oid = '1.3.6.1.2.1';

// Criar sessão SNMP
const session = snmp.createSession(target, community, options);

// Função de callback para o walk
function feedCb(varbinds) {
    for (let i = 0; i < varbinds.length; i++) {
        if (snmp.isVarbindError(varbinds[i])) {
            console.error(snmp.varbindError(varbinds[i]));
        } else {
            console.log(`${varbinds[i].oid} = ${varbinds[i].value}`);
        }
    }
}

// Iniciar o SNMP walk
session.walk(oid, 20, feedCb, function (error) {
    if (error) {
        console.error('Erro durante o SNMP walk: ', error);
    } else {
        console.log('SNMP walk concluído com sucesso.');
    }

    // Fechar a sessão
    session.close();
});
