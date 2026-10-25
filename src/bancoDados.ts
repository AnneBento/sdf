import dotenv from 'dotenv';
import { Pool } from 'pg';


dotenv.config(); 

export const conexaoBanco = new Pool({
    host: process.env.BD_HOSPEDEIRO,
    port: Number(process.env.BD_PORTA),
    user: process.env.BD_USUARIO,
    password: String(process.env.BD_SENHA),
    database: process.env.BD_NOME,
});


/*async function testarConx(){
    try{
        const resposta = await conexaoBanco.query('SELECT NOW()');
        console.log('CONEXÃO COM O POSTGRES FOI UM SUCESSO!');
        console.log('DATA/HORA NO BANCO DE DADOS: ', resposta.rows[0].now);

    }catch(erro){
        console.error('ERRO DE CONEXÃO:', erro)
    }finally{
        await conexaoBanco.end();
    }
}
testarConx();*/