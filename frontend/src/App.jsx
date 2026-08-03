import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Telao from "./Telao";
import logoDellut from "./logo-dellut.png";
import "./App.css";

// --- TELA DE VOTAÇÃO ---
function Votacao() {
  const [categorias, setCategorias] = useState([]);
  const [votos, setVotos] = useState({});
  const [textosBusca, setTextosBusca] = useState({}); // O que a pessoa digitou
  const [listasAbertas, setListasAbertas] = useState({}); // Controla se a lista está visível
  const [votante, setVotante] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    fetch("https://noite-de-estrelas-dellut.onrender.com/api/categorias")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error("Erro ao buscar dados:", err));
  }, []);

  // FUNÇÃO MÁGICA: Remove acentos e deixa tudo minúsculo
  const removerAcentos = (texto) => {
    if (!texto) return "";
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const handleSelecionar = (categoriaId, indicado) => {
    // Salva o voto oficial
    setVotos({ ...votos, [categoriaId]: indicado.id });
    // Preenche a barra com o nome bonito
    setTextosBusca({ ...textosBusca, [categoriaId]: indicado.nome });
    // Fecha a lista suspensa
    setListasAbertas({ ...listasAbertas, [categoriaId]: false });
  };

  const enviarVotos = async (e) => {
    e.preventDefault();

    if (Object.keys(votos).length !== categorias.length) {
      alert("Por favor, selecione um indicado em TODAS as categorias!");
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

      // Limpa tudo depois de enviar
      setVotos({});
      setTextosBusca({});
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
        <img src={logoDellut} alt="Dellut Engenharia" className="logo-dellut" />
        <h1>🏆 Prêmio Reconhecimento Dellut – 16 Anos</h1>
        <p>Reconhecendo pessoas que constroem nossa história.</p>
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
            className="input-busca"
          />
        </div>

        {categorias.map((categoria) => {
          // Filtra a lista comparando o nome sem acento com o que foi digitado sem acento
          const indicadosFiltrados = categoria.indicados.filter((ind) =>
            removerAcentos(ind.nome).includes(
              removerAcentos(textosBusca[categoria.id]),
            ),
          );

          return (
            <div key={categoria.id} className="card categoria-card">
              <h2>{categoria.nome}</h2>
              <p>{categoria.descricao}</p>

              <div className="busca-indicado">
                <input
                  type="text"
                  className="input-busca"
                  placeholder="Toque aqui e digite o nome..."
                  value={textosBusca[categoria.id] || ""}
                  onChange={(e) => {
                    const digitado = e.target.value;
                    setTextosBusca({
                      ...textosBusca,
                      [categoria.id]: digitado,
                    });
                    setListasAbertas({
                      ...listasAbertas,
                      [categoria.id]: true,
                    });

                    // Se a pessoa mexer no texto, apaga o voto que estava salvo
                    const novosVotos = { ...votos };
                    delete novosVotos[categoria.id];
                    setVotos(novosVotos);
                  }}
                  onFocus={() =>
                    setListasAbertas({ ...listasAbertas, [categoria.id]: true })
                  }
                  onBlur={() => {
                    // Atraso de 200ms para dar tempo do celular registrar o toque na lista
                    setTimeout(() => {
                      setListasAbertas((prev) => ({
                        ...prev,
                        [categoria.id]: false,
                      }));
                    }, 200);
                  }}
                />

                {/* Nossa lista suspensa inteligente customizada */}
                {listasAbertas[categoria.id] &&
                  indicadosFiltrados.length > 0 && (
                    <ul className="lista-suspensa">
                      {indicadosFiltrados.map((indicado) => (
                        <li
                          key={indicado.id}
                          onMouseDown={() =>
                            handleSelecionar(categoria.id, indicado)
                          }
                        >
                          {indicado.nome}
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            </div>
          );
        })}
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
