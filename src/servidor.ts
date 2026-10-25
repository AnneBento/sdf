import express from 'express';
import dotenv from 'dotenv';
import { conexaoBanco } from './bancoDados.js';

dotenv.config();

const app = express();
const porta = process.env.PORTA || 3000;

app.use(express.json())





// todas as categoria do banco de dados
app.get('/categoria', async (requisicao, resposta) => {
    try{
        const resultado = await conexaoBanco.query('SELECT * FROM "categoria"');
        resposta.json(resultado.rows);
    }catch(erro){
        console.error('Erro ao buscar categoria: ', erro);
        resposta.status(500).json({mensagem: 'Erro interno no servidor'});
    }
});
// cadastro de categoria
app.post('/categoria', async(resquisicao, resposta) => {
    try{
        const { nome } = resquisicao.body;

        const comandoSQL = 'INSERT INTO "categoria" (nome) VALUES ($1) RETURNING *';
        const resultado = await conexaoBanco.query(comandoSQL, [nome]);

        resposta.status(201).json(resultado.rows[0]);
    } catch(erro){
        console.error('Erro ao criar categoria: ', erro);
        resposta.status(500).json({mensagem: 'Erro ao cadastrar categoria'});
    }
});





// mostrar todas as despesas
// Leitura de todas as despesas
app.get('/despesas', async (requisicao, resposta) => {
    try {
        const consultaSQL = `
            SELECT 
                d.iddespesa,
                d.valor, 
                d.data, 
                d.descricao, 
                d.idcategoria, 
                d.idconta,
                c.nome AS categoria
            FROM "Despesas" d
            LEFT JOIN "categoria" c ON c.idcategoria = d.idcategoria`;

        const resultado = await conexaoBanco.query(consultaSQL);
        resposta.status(200).json(resultado.rows);
    } catch (erro) {
        console.log('Erro ao listar as despesas', erro);
        resposta.status(500).json({ mensagem: 'Erro interno no servidor' });
    }
});
// cadastrar despesas
app.post('/despesas', async(requisicao, resposta) => {
    try{
        const { valor, data, descricao, idcategoria, idconta } = requisicao.body;

        const comandoSQL = `
            INSERT INTO "Despesas" (valor, data, descricao, idcategoria, idconta)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`;

        const valores = [ valor, data, descricao, idcategoria, idconta ];
        const resultado = await conexaoBanco.query(comandoSQL, valores);
        resposta.status(201).json(resultado.rows);
    }catch(erro){
        console.log('Erro ao cadastrar despesa: ', erro);
        resposta.status(500).json({mensagem: 'Erro ao cadastrar despesa'});
    }
});
    




// listar todas as contas cadastradas e seus respectivos saldos
app.get('/contas', async(requisicao, resposta) => {
    try{
        const comandoSQL = 
        `SELECT "idConta", nome, "saldoInicial"
        FROM "contaBancaria"`;

        const resultado = await conexaoBanco.query(comandoSQL);
        resposta.status(200).json(resultado.rows);

    }catch(erro){
        console.log('Erro ao realizar consulta: ',erro);
        resposta.status(500).json({mensagem: 'Erro ao listar contas cadastradas.'});
    }
});
// cadastrar conta
app.post('/contas', async(requisicao, resposta) => {
    try{
        const { nome, saldoInicial } = requisicao.body

        const comandoSQL = `
            INSERT INTO "contaBancaria" (nome, "saldoInicial")
            VALUES($1, $2)
            RETURNING *`;

        const valores = [nome, saldoInicial];
        const resultado = await conexaoBanco.query(comandoSQL, valores);

        resposta.status(201).json(resultado.rows[0]);
    } catch(erro: any){
        console.error('Erro ao cadastrar conta: ', erro);
        resposta.status(500).json({ mensagem: erro.message || 'Erro ao cadastrar conta Bancária.'});
    }
});





// editar despesa por ID
app.put('/despesas/:id', async (requisicao, resposta) => {
    try {
        const { id } = requisicao.params;
        const { valor, data, descricao, idcategoria, idconta } = requisicao.body;

        const comandoSQL = `
            UPDATE "Despesas"
            SET valor = $1, data = $2, descricao = $3, idcategoria = $4, idconta = $5
            WHERE iddespesa = $6
            RETURNING *`;

        const valores = [valor, data, descricao, idcategoria, idconta, id];
        const resultado = await conexaoBanco.query(comandoSQL, valores);

        if (resultado.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Despesa não encontrada.' });
        }

        resposta.status(200).json(resultado.rows[0]);
    } catch (erro: any) {
        console.error('Erro ao atualizar despesa: ', erro);
        resposta.status(500).json({ mensagem: erro.message || 'Erro ao atualizar despesa.' });
    }
});





// deletar despesa por ID
app.delete('/despesas/:id', async(requisicao, resposta) => {
    try{
        const {id} = requisicao.params;

        const comandoSQL = `
            DELETE FROM "Despesas"
            WHERE iddespesa = $1
            RETURNING *`;

        const resultado = await conexaoBanco.query(comandoSQL, [id]);
        if(resultado.rowCount === 0){
            return resposta.status(404).json({mensagem: 'Despesa não encontrada.'});

        }

        resposta.status(200).json({ mensagem: 'Despesa removida com sucesso.'});

    } catch(erro:any){
        console.error('Erro ao deletar despesa: ', erro);
        resposta.status(500).json({ mensagem: erro.message || 'Erro ao deletar despesa.'});
    }
});





app.listen(porta, () => {
    console.log(`Servidor a rodar com porta ${porta}`);
});


