import { useSate } from 'react';
import { api } from './services/api';


//-------------------------------------interfaces para definir informações do projeto
export interface movimentacao{
  id:number;
  tipo: 'despesa' | 'receita';
  valor: string | number;
  data: string;
  descricao: string;
  categoria: string;
}
export interface Conta{
    idConta: number;
    nome: string;
    saldoInicial?:number;
}

export interface Categoria {
    idcategoria: number;
    nome: string;
}
export interface Props{
    aberto: boolean;
    aoFechar: () => void;
    contas: Conta[];
    categorias: Categoria[];
    aoAtualizarDados: () => void; 
}



export function GerenciadorCadastros({ aberto, aoFechar, contas, categorias, aoAtualizarDados}: Props){
    //estados de (contabancaria, categoria)
    const [nomeConta, setNomeConta] = useState('');
    const [saldoInicial, setSaldoInicial] = useState('');
    const [idContaEditando, setIdContaEditando] = useState<number | null>(null);

    const [nomeCategoria, setNomeCategoria] = useState('');
    const [idCategoriaEditando, setIdCategoriaEditando] = useSatate('');
    
    if(!aberto) return null;


//---------------------------------------------------------------------------conta bancaria
    async function salvarConta(e: React.FormEvent){
        e.preventDefault();
        try{
            if(idContaEditando){
                await api.put(`/contas/${idContaEditando}`, {
                    nome: nomeConta,
                    saldoIncial: Number(saldoInicial) || 0,
                });
            } else {
                await api.post('/contas', {
                    nome: nomeConta,
                    saldoInicial: Number(saldoInicial) || 0,
                });
            }
            limparFormularioConta();
            aoAtualizarDados();
        }catch(erro){
            console.error('Erro ao salvar conta: ', erro);
            alert('Erro ao salvar conta Bancária.');
        }
    }
//limpar sessao conta bancaria
    function limparFormularioConta(){
        setIdContaEditando(null);
        setNomeConta('');
        setSaldoInicial('');
    }
//editar conta bancaria
    function prepararEdicaoConta(conta: Conta){
        setIdContaEditando(conta.idConta);
        setNomeConta(conta.nome);
        setSaldoInicial(string(conta.saldoInicial ?? 0));
    }
//excluir conta bancaria
    async function excluirConta(id: number){
        if(!window.confirm('Deseja excluir essa conta?')) return;
        try{
            await api.delete(`/contas/${id}`);
            aoAtualizarDados();

        } catch (erro: any){
            alert(erro.response?.data?.mensagem || 'Não é possível excluir conta com movimentações.')
        }
    }





//------------------------------------------------------------------------------------------categoria
    async function salvarCategoria(e: React.FormEvent){
        e.preventDefault();
        try{
            if(idCategoriaEditando){
                await api.put(`/categorias/${idCategoriaEditando}`, {nome: nomeCategoria});

            }else{
                await api.post('/categorias', {nome: nomeCategoria});
            }

            limparFormularioCategoria();
            aoAtualizarDados();

        }catch(erro){
            console.error('Erro ao salvar categoria:', erro),
            alert('Erro ao salvar categoria.')
        }
    }
//editar categoria 
    function prepararEdicaoCategoria(cat: Categoria){
        setIdCategoriaEditando(cat.idcategoria);
        setNomeCategoria(cat.nome);
    }
//limpar formulario categoria
    function limparFormularioCategoria(){
        setIdCategoriaEditando(null);
        setNomeCategoria('');
    }
//excluir categoria
    async function excluirCategoria(id: number){
        if(!window.confirm('Deseja excluir esta categoria?')) return;
        try{
            await api.delete(`/categorias/${id}`);
            aoAtualizarDados();
        }catch(erro: any){
            alert(erro.response?.data?.mensagem || 'Não é possível excluir categoria em uso.');
        }
    }
}
