import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Telao from "./Telao";
import logoDellut from "./logo-dellut.png";
import "./App.css";

// --- TELA DE VOTAÇÃO ---
function Votacao() {
  const [categorias, setCategorias] = useState([]);
  const [votos, setVotos] = useState({});
  const [votante, setVotante] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    fetch("https://noite-de-estrelas-dellut.onrender.com/api/categorias")
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
        return fetch(
          "https://noite-de-estrelas-dellut.onrender.com/api/votos",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ indicado_id: indicadoId, votante: votante }),
          },
        );
      });

      await Promise.all(promessas);
      setMensagem("Votos enviados com sucesso! 🎉");
      setVotos({});
      setVotante("");

      // Limpa os campos de busca após o envio
      const inputs = document.querySelectorAll(".input-busca");
      inputs.forEach((input) => (input.value = ""));

      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Erro ao enviar votos:", error);
      setMensagem("Erro ao enviar os votos. Tente novamente.");
    }
  };

  return (
    <div className="container">
      <header className="cabecalho">
        <img src={logoDellut} alt="Dellut Engenharia" className="logo-dellut" />
        <h1>🏆 Oscar 16 Anos</h1>
        <p>Vote nos grandes destaques do ano!</p>
      </header>

      {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}
      <form onSubmit={enviarVotos}>
        <div className="card votante-card">
          <label>
            <strong>Identificação (Nome ou Setor):</strong>
          </label>
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

            {/* --- NOVO CAMPO DE BUSCA COM DATALIST --- */}
            <div className="busca-indicado" style={{ marginTop: "15px" }}>
              <input
                type="text"
                list={`lista-${categoria.id}`}
                placeholder="Clique aqui e pesquise o nome..."
                className="input-busca"
                onChange={(e) => {
                  const nomeDigitado = e.target.value;
                  // Procura na lista o indicado que tem exatamente esse nome
                  const indicadoEncontrado = categoria.indicados.find(
                    (ind) => ind.nome === nomeDigitado,
                  );

                  if (indicadoEncontrado) {
                    handleVotoChange(categoria.id, indicadoEncontrado.id);
                  } else {
                    // Se o usuário apagar ou digitar errado, o voto temporário é removido
                    const novosVotos = { ...votos };
                    delete novosVotos[categoria.id];
                    setVotos(novosVotos);
                  }
                }}
              />

              {/* O datalist cria a lista suspensa com filtro automático */}
              <datalist id={`lista-${categoria.id}`}>
                {categoria.indicados.map((indicado) => (
                  <option key={indicado.id} value={indicado.nome} />
                ))}
              </datalist>
            </div>
            {/* ---------------------------------------- */}
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
        <Route path="/" element={<Votacao />} />
        <Route path="/telao" element={<Telao />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
