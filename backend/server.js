require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// Configurações do Servidor
app.use(cors());
app.use(express.json()); // Permite receber dados em formato JSON

// Configuração da Conexão com o Banco de Dados
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Teste de Conexão
pool.connect((err, client, release) => {
  if (err) {
    return console.error("❌ Erro ao conectar no banco de dados:", err.stack);
  }
  console.log("✅ Conectado ao PostgreSQL com sucesso!");
  release();
});

// Rota de teste
app.get("/", (req, res) => {
  res.send("API do Oscar Dellut está no ar! 🏆");
});

// 1. Rota para listar as Categorias e seus Indicados
app.get('/api/categorias', async (req, res) => {
    try {
        // Busca todas as categorias
        const categoriasResult = await pool.query('SELECT * FROM categorias ORDER BY id');
        const categorias = categoriasResult.rows;

        // Busca todos os indicados
        const indicadosResult = await pool.query('SELECT * FROM indicados');
        const indicados = indicadosResult.rows;

        // Junta tudo de forma organizada para o Front-end
        const dadosCompletos = categorias.map(categoria => {
            return {
                ...categoria,
                indicados: indicados.filter(indicado => indicado.categoria_id === categoria.id)
            };
        });

        res.json(dadosCompletos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

// 2. Rota para receber e salvar o voto
app.post('/api/votos', async (req, res) => {
    const { indicado_id, votante } = req.body;
    
    try {
        await pool.query(
            'INSERT INTO votos (indicado_id, votante) VALUES ($1, $2)',
            [indicado_id, votante]
        );
        res.status(201).json({ mensagem: 'Voto registrado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao registrar voto' });
    }
});

// 3. Rota para o Telão (Resultados e Contagem de Votos)
app.get('/api/resultados', async (req, res) => {
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
        
        // Organizando os dados para o Front-end ler mais fácil
        const resultadosOrganizados = result.rows.reduce((acc, atual) => {
            // Se a categoria ainda não existe no nosso acumulador, cria ela
            if (!acc[atual.categoria]) {
                acc[atual.categoria] = [];
            }
            // Adiciona o indicado e os votos dele na categoria correspondente
            acc[atual.categoria].push({
                nome: atual.indicado,
                votos: parseInt(atual.total_votos)
            });
            return acc;
        }, {});

        res.json(resultadosOrganizados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar resultados do telão' });
    }
});

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
