import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Telao from "./Telao";
import "./App.css";

// --- TELA DE VOTAÇÃO ---
function Votacao() {
  const [categorias, setCategorias] = useState([]);
  const [votos, setVotos] = useState({});
  const [votante, setVotante] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/categorias")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error("Erro ao buscar dados:", err));
  }, []);

  const handleVotoChange = (categoriaId, indicadoId) => {
    setVotos({ ...votos, [categoriaId]: indicadoId });
  };

  const enviarVotos = async (e) => {
    e.preventDefault();

    if (Object.keys(votos).length !== categorias.length) {
      alert("Por favor, vote em todas as categorias antes de enviar!");
      return;
    }

    try {
      const promessas = Object.values(votos).map((indicadoId) => {
        return fetch("http://localhost:3000/api/votos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ indicado_id: indicadoId, votante: votante }),
        });
      });

      await Promise.all(promessas);
      setMensagem("Votos enviados com sucesso! 🎉");
      setVotos({});
      setVotante("");
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Erro ao enviar votos:", error);
      setMensagem("Erro ao enviar os votos. Tente novamente.");
    }
  };

  return (
    <div className="container">
      <header className="cabecalho">
        <h1>🏆 Oscar Dellut 16 Anos</h1>
        <p>Vote nos grandes destaques do ano!</p>
      </header>

      {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}
      <form onSubmit={enviarVotos}>
        <div className="card votante-card">
          <label>Identificação (Nome ou Setor):</label>
          <input
            type="text"
            value={votante}
            onChange={(e) => setVotante(e.target.value)}
            placeholder="Ex: João da Engenharia"
            required
          />
        </div>

        {categorias.map((categoria) => (
          <div key={categoria.id} className="card categoria-card">
            <h2>{categoria.nome}</h2>
            <p>{categoria.descricao}</p>
            <div className="indicados-lista">
              {categoria.indicados.map((indicado) => (
                <label key={indicado.id} className="indicado-opcao">
                  <input
                    type="radio"
                    name={`categoria-${categoria.id}`}
                    value={indicado.id}
                    checked={votos[categoria.id] === indicado.id}
                    onChange={() => handleVotoChange(categoria.id, indicado.id)}
                  />
                  <span>{indicado.nome}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button type="submit" className="btn-enviar">
          Confirmar Votos
        </button>
      </form>
    </div>
  );
}

// --- CONFIGURAÇÃO DAS ROTAS ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal: O pessoal acessa normal para votar */}
        <Route path="/" element={<Votacao />} />

        {/* Rota secreta: Apenas para o projetor/telão */}
        <Route path="/telao" element={<Telao />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
