import express from 'express';
import dotenv from 'dotenv';
import { conexaoBanco } from './bancoDados.js';
import cors from 'cors';

dotenv.config();

const app = express();
const porta = process.env.PORTA || 3000;

app.use(cors());
app.use(express.json());




// todas as categoria do banco de dados
app.get('/categorias', async (requisicao, resposta) => {
    try{
        const resultado = await conexaoBanco.query('SELECT idcategoria, nome FROM "categoria"');
        resposta.status(200).json(resultado.rows);
        resposta.json(resultado.rows);
    }catch(erro){
        resposta.status(500).json({mensagem: 'Erro ao buscar categorias'});
    }
});
// cadastro de categoria
app.post('/categorias', async(resquisicao, resposta) => {
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
        resposta.status(201).json(resultado.rows[0]);
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





// resumo financeiro
app.get('/dashboard', async (requisicao, resposta) => {
    try {
        const sqlBancos = `
            SELECT "idConta", nome, "saldoInicial"
            FROM "contaBancaria"`;
        
        const resposta_Banco = await conexaoBanco.query(sqlBancos);

        const ultimas_movimentacoes = `
            SELECT
                d.iddespesa AS id,
                'despesa' AS tipo,
                d.valor,
                d.data,
                d.descricao,
                c.nome AS categoria
            FROM "Despesas" d 
            LEFT JOIN "categoria" c ON c.idcategoria = d.idcategoria
            WHERE d.data >= CURRENT_DATE - INTERVAL '15 days'
            
            UNION ALL
            
            SELECT 
                r.idreceita AS id,
                'receita' AS tipo,
                r.valornumerico AS valor,
                r.data,
                r.descricao,
                COALESCE(c.nome, 'Receita') AS categoria 
            FROM "receita" r
            LEFT JOIN "categoria" c ON c.idcategoria = r.idcategoria
            WHERE r.data >= CURRENT_DATE - INTERVAL '15 days'
            
            ORDER BY data DESC`;      
            
        const resMovimentacoes = await conexaoBanco.query(ultimas_movimentacoes);

        const sqlTotalDespesas = `
            SELECT COALESCE(SUM(valor), 0) AS total
            FROM "Despesas"`;
        const sqlTotalReceita = `
            SELECT COALESCE(SUM(valornumerico), 0) AS total
            FROM "receita"`;
        
        const resTotalDespesas = await conexaoBanco.query(sqlTotalDespesas);
        const resTotalReceita = await conexaoBanco.query(sqlTotalReceita);

        const totalInicial = resposta_Banco.rows.reduce((acc, conta) => acc + parseFloat(conta.saldoInicial), 0);
        const totalDespesas = parseFloat(resTotalDespesas.rows[0].total);
        const totalReceitas = parseFloat(resTotalReceita.rows[0].total);

        const saldoTotalReal = (totalInicial + totalReceitas) - totalDespesas;

        resposta.status(200).json({
            saldoTotal: saldoTotalReal,
            bancos: resposta_Banco.rows,
            ultimas_movimentacoes: resMovimentacoes.rows
        });
    } catch (erro: any) {
        console.error('Erro ao carregar dados do dashboard: ', erro);
        resposta.status(500).json({ mensagem: 'Erro interno ao carregar o dashboard.' });
    }
});





// Listar apenas todas as receitas
app.get('/receitas', async (requisicao, resposta) => {
    try { 
        const comandoSQL = `
            SELECT 
                r.idreceita,
                r.valornumerico AS valor,
                r.data,
                r.descricao,
                r.idconta,
                c.nome AS banco
            FROM "receita" r
            LEFT JOIN "contaBancaria" c ON c."idConta" = r.idconta
            ORDER BY r.data DESC;`;

        const resultado = await conexaoBanco.query(comandoSQL);
        resposta.status(200).json(resultado.rows);
    } catch (erro: any) {
        console.error('Erro ao listar receitas: ', erro);
        resposta.status(500).json({ mensagem: 'Erro ao listar receitas.' });
    }
});
// entrada de receitas
app.post('/receitas', async (requisicao, resposta) => {
    try {
        const { valornumerico, data, descricao, idconta, idcategoria} = requisicao.body;

        const comandoSQL = `
            INSERT INTO "receita" (valornumerico, data, descricao, idconta, idcategoria)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING idreceita, valornumerico AS valor, data, descricao, idconta, idcategoria`;

        const resultado = await conexaoBanco.query(comandoSQL, [valornumerico, data, descricao, idconta, idcategoria]);
        resposta.status(201).json(resultado.rows[0]);
    } catch (erro: any) {
        console.error('Erro ao cadastrar receita: ', erro);
        resposta.status(500).json({ mensagem: erro.message || 'Erro ao cadastrar receita.' });
    }
});





app.listen(porta, () => {
    console.log(`Servidor a rodar com porta ${porta}`);
});


