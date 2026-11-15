import {useEffect, useState} from 'react';
import {api} from './services/api';

interface movimentacao{
  id:number;
  tipo: 'despesa' | 'receita';
  valor: string | number;
  data: string;
  descricao: string;
  categoria: string;
}
interface bancos{
  idConta: number; 
  nome: string;
}
interface categorias{
  idcategoria: number;
  nome: string
}


export function App(){
  const [saldo, setSaldo] = useState<number>(0);
  const [movimentacao, setMovimentacao] = useState<movimentacao[]>([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoAdicionado, setTipoAdicionado] = useState<'despesa' | 'receita'>('despesa');

  const [bancos, setBancos] = useState<bancos[]>([]);
  const [categorias, setCategorias] = useState<categorias[]>([]);

  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [idcategoria, setIdcategoria] = useState('');
  const [idconta, setIdConta] = useState('');
  const [descricao, setDescricao] = useState('');
  


  async function carregarDashboard(){
    try{
      const resposta = await api.get('/dashboard');
      setSaldo(resposta.data.saldoTotal);
      setMovimentacao(resposta.data.ultimas_movimentacoes);
      setBancos(resposta.data.bancos);

      const resCategorias = await api.get('/categorias');
      setCategorias(resCategorias.data);
    }catch(erro){
      console.error('Erro ao buscar dados do dashboard:', erro);
    }
  }



  async function salvarMovimentacao(e: React.FormEvent){
    e.preventDefault();
    try {
      if (tipoAdicionado === 'despesa'){
        await api.post('/despesas', {
          valor: Number(valor),
          data,
          descricao,
          idcategoria: Number(idcategoria),
          idconta: Number(idconta),
        });
      } else {
        await api.post('/receitas', {
          valor: Number(valor),
          data,
          descricao,
          idcategoria: Number(idcategoria),
          idconta: Number(idconta),
        });
      }



      setModalAberto(false);
      setDescricao('');
      setValor('');
      setData('');
      setIdcategoria('');
      setIdConta('');
      carregarDashboard();
    } catch (erro){
      console.error('Erro ao salvar:', erro);
    }
  } 



  useEffect(() => {
    carregarDashboard();
  }, []);



  return (
    <div>
      <h1>Minhas Finanças</h1>
      <h2>Saldo Atual: R${saldo.toFixed(2)}</h2>



      <h3>Últimas Movimentações: </h3>
      
      <ul> 

        {movimentacao.map((x) => (

          <li key={`${x.tipo}-${x.id}`}>

            <strong>{x.tipo}</strong> - {x.descricao} - {x.categoria} R$ {x.valor}

          </li>
        ))}
      </ul>



      <button onClick={() => setModalAberto(true)}>Adicionar</button>
      
      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgb(236, 234, 212)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          
          <form onSubmit={salvarMovimentacao} style={{ background: '#fff', color: '#000', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px'}}>

            <h3>Cadastrar({tipoAdicionado})</h3>

            <div> 
              <button type="button" onClick={() => setTipoAdicionado('despesa')}> Despesa </button>
              <button type="button" onClick={() => setTipoAdicionado('receita')}> Receita </button>
            </div>

            <input type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)}required/>

            <input type="number" step="0.01" placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)}required/>

            <input type="date" value={data} onChange={(e) => setData(e.target.value)}required/>


            <select value={idcategoria} onChange={(e) => setIdcategoria(e.target.value)} required>
            <option value="">Selecione a categoria</option>
            {categorias.map((c) => (
              <option key={c.idcategoria} value={c.idcategoria}>{c.nome}</option>
            ))}
          </select>


          <select value={idconta} onChange={(e) => setIdConta(e.target.value)} required>
            <option value="">Selecione a conta</option>
            {bancos.map((b) => (
              <option key={b.idConta} value={b.idConta}>{b.nome}</option>
            ))}
          </select>
            

            <button type="submit">Salvar</button>
            <button type="button" onClick={() => setModalAberto(false)}>Cancelar</button>


          </form>
        </div>
      )}
    </div>
  );
} 

export default App;