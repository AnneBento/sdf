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
        const { nome, tipo } = resquisicao.body;

        const comandoSQL = 'INSERT INTO "categoria" (nome, tipo) VALUES ($1, $2) RETURNING *';
        const resultado = await conexaoBanco.query(comandoSQL, [nome, tipo]);

        resposta.status(201).json(resultado.rows[0]);
    } catch(erro){
        console.error('Erro ao criar categoria: ', erro);
        resposta.status(500).json({mensagem: 'Erro ao cadastrar categoria'});
    }
});


app.listen(porta, () => {
    console.log(`Servidor a rodar com porta ${porta}`);
});


