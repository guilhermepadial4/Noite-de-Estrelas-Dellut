import { useState, useEffect } from "react";

function Telao() {
  const [resultados, setResultados] = useState({});

  useEffect(() => {
    // Função que busca os votos no back-end
    const buscarResultados = () => {
      fetch("http://localhost:3000/api/resultados")
        .then((res) => res.json())
        .then((data) => setResultados(data))
        .catch((err) => console.error("Erro ao buscar telão:", err));
    };

    // Busca na mesma hora em que a tela abre
    buscarResultados();

    // Configura o "Ao Vivo": refaz a busca a cada 5 segundos
    const intervalo = setInterval(buscarResultados, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="telao-container">
      {Object.keys(resultados).map((categoria) => (
        <div key={categoria} className="card categoria-card">
          <h2>📊 {categoria}</h2>
          <div className="indicados-lista">
            {resultados[categoria].map((indicado, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                  borderRadius: "6px",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "18px", fontWeight: "500" }}>
                  {indicado.nome}
                </span>
                <strong style={{ fontSize: "18px", color: "#d4af37" }}>
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
