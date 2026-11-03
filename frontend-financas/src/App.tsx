import { useEffect, useState } from 'react';
import { api } from './services/api';

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










