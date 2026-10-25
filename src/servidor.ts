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
app.get('/despesas', async(requisicao, resposta) => {
    try{
        const comandoSQL = `
            SELECT d.*, c.nome AS categoria
            FROM "Despesas" d
            LEFT JOIN "categoria" c ON c.idcategoria = d.idcategoria`;
        
        const resultado = await conexaoBanco.query(comandoSQL);
        resposta.status(200).json(resultado.rows);
    }catch(erro){
        console.log('Erro ao listar as despesas', erro);
        resposta.status(500).json({mensagem: 'Erro interno no servidor'})
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
})
    



app.listen(porta, () => {
    console.log(`Servidor a rodar com porta ${porta}`);
});


