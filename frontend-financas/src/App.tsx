import { useEffect, useState } from 'react';
import { api } from './services/api';
import './App.css'; 

interface Banco {
    idConta: number;
    nome: string;
    saldoInicial: string;
}

interface Movimentacao {
    id: number;
    tipo: 'despesa' | 'receita';
    valor: string;
    data: string;
    descricao: string;
    categoria: string;
}

interface DashboardData {
    saldoTotal: number;
    bancos: Banco[];
    ultimas_movimentacoes: Movimentacao[];
}






export function App(){
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        api.get('/dashboard')
        .then((resposta) => {
            setDashboard(resposta.data);
        })

        .catch((erro) => {
            console.error('Erro ao procurar dados no dashboard: ', erro);
        })

        .finally(() => {
            setCarregando(false);
        })
    }, []);

    if(carregando){
        return <div> A carregar dados do dashboard...</div>;
    }

    /* quando o carregamento termina o react retorna na tela final: */
    return(
        <div><h1>Painel de finanças pessoais</h1></div>
    );
}





return (
    <div className="container">
        <h1>Painel de finanças Pessoais</h1>

        {/*card de saldo*/}
        <div className="card-saldo">

            <h2> Saldo total real </h2>

            <p className="saldo-valor">
                R${dashboard?.saldoTotal ? dashboard.saldoTotal.toFixed(2) : '0.00'}
            </p>
        </div>

        <h3> Últimas movimentações (15 dias) </h3>
        <table className='tabela-movimentacoes'>

            <thead>

                <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Valor</th>
                </tr>

            </thead>

    <tbody>

        {dashboard?.ultimas_movimentacoes.map((mov) => (

            <tr key={`${mov.tipo}-${mov.id}`}>
                
                <td>{new Date(mov.data).toLocaleDateString('pt-BR')}</td>
                <td className={mov.tipo === 'receita' ? 'texto-receita' : 'texto-despesa'}>
                    {mov.tipo.toUpperCase()}
                </td>
                <td>{mov.descricao}</td>
                <td>{mov.categoria}</td>
                <td> R$ {parseFloat(mov.valor).toFixed(2)}</td>

            </tr>
        ))}
    </tbody>
    </table>
</div> 
);









