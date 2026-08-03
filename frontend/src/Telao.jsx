import { useState, useEffect } from "react";
import logoDellut from "./logo-dellut.png";

function Telao() {
  const [resultados, setResultados] = useState({});

  useEffect(() => {
    const buscarResultados = () => {
      fetch("https://noite-de-estrelas-dellut.onrender.com/api/resultados")
        .then((res) => res.json())
        .then((data) => setResultados(data))
        .catch((err) => console.error("Erro ao buscar telão:", err));
    };

    buscarResultados();
    const intervalo = setInterval(buscarResultados, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="telao-container">
      <div className="telao-header">
        <img src={logoDellut} alt="Dellut Engenharia" className="logo-dellut" />
        <h1>Resultados ao Vivo 🏆</h1>
      </div>

      {Object.keys(resultados).map((categoria) => (
        <div key={categoria} className="telao-card">
          <h2>📊 {categoria}</h2>
          <div className="indicados-lista">
            {/* Aqui a mágica acontece: Ordenamos por votos e pegamos apenas o Top 5 */}
            {resultados[categoria]
              .sort((a, b) => b.votos - a.votos)
              .slice(0, 5)
              .map((indicado, index) => (
                <div key={index} className="resultado-item">
                  <span className="resultado-nome">
                    {/* Se for o primeiro (index 0), coloca uma coroa */}
                    {index === 0 ? "👑 " : ""}
                    {indicado.nome}
                  </span>
                  <strong className="resultado-votos">
                    {indicado.votos} votos
                  </strong>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Telao;
