require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// Nova configuração de conexão adaptada para a Nuvem (com SSL e Link Direto)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("❌ Erro ao conectar no banco de dados:", err.stack);
  }
  console.log("✅ Conectado ao PostgreSQL com sucesso!");
  release();
});

// Rotas
app.get("/", (req, res) => {
  res.send("API do Oscar Dellut está no ar! 🏆");
});

app.get("/api/categorias", async (req, res) => {
  try {
    const categoriasResult = await pool.query(
      "SELECT * FROM categorias ORDER BY id",
    );
    const categorias = categoriasResult.rows;

    const indicadosResult = await pool.query("SELECT * FROM indicados");
    const indicados = indicadosResult.rows;

    const dadosCompletos = categorias.map((categoria) => {
      return {
        ...categoria,
        indicados: indicados.filter(
          (indicado) => indicado.categoria_id === categoria.id,
        ),
      };
    });

    res.json(dadosCompletos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

app.post("/api/votos", async (req, res) => {
  const { indicado_id, votante } = req.body;
  try {
    await pool.query(
      "INSERT INTO votos (indicado_id, votante) VALUES ($1, $2)",
      [indicado_id, votante],
    );
    res.status(201).json({ mensagem: "Voto registrado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao registrar voto" });
  }
});

app.get("/api/resultados", async (req, res) => {
  try {
    const query = `
            SELECT 
                c.nome AS categoria,
                i.nome AS indicado,
                COUNT(v.id) AS total_votos
            FROM categorias c
            JOIN indicados i ON c.id = i.categoria_id
            LEFT JOIN votos v ON i.id = v.indicado_id
            GROUP BY c.id, c.nome, i.id, i.nome
            ORDER BY c.id, total_votos DESC;
        `;
    const result = await pool.query(query);

    const resultadosOrganizados = result.rows.reduce((acc, atual) => {
      if (!acc[atual.categoria]) {
        acc[atual.categoria] = [];
      }
      acc[atual.categoria].push({
        nome: atual.indicado,
        votos: parseInt(atual.total_votos),
      });
      return acc;
    }, {});

    res.json(resultadosOrganizados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar resultados do telão" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
