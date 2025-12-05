// server.js - Backend Node.js per salvare punteggi online
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const SCORES_FILE = process.env.SCORES_FILE_PATH || path.join(__dirname, 'scores.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve file statici

// Inizializza file punteggi se non esiste
async function initScoresFile() {
    try {
        await fs.access(SCORES_FILE);
    } catch {
        await fs.writeFile(SCORES_FILE, JSON.stringify([]));
    }
}

// GET - Ottieni classifica
app.get('/api/scores', async (req, res) => {
    try {
        const data = await fs.readFile(SCORES_FILE, 'utf8');
        const scores = JSON.parse(data);
        
        // Ordina per punteggio decrescente e prendi top 10
        const topScores = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        
        res.json(topScores);
    } catch (error) {
        console.error('Errore lettura punteggi:', error);
        res.status(500).json({ error: 'Errore server' });
    }
});

// POST - Salva nuovo punteggio
app.post('/api/scores', async (req, res) => {
    try {
        const { name, score } = req.body;
        
        // Validazione
        if (!name || typeof score !== 'number') {
            return res.status(400).json({ error: 'Dati non validi' });
        }
        
        if (name.length > 20) {
            return res.status(400).json({ error: 'Nome troppo lungo' });
        }

        // Leggi punteggi esistenti
        const data = await fs.readFile(SCORES_FILE, 'utf8');
        const scores = JSON.parse(data);
        
        // Aggiungi nuovo punteggio
        scores.push({
            name: name.trim(),
            score: score,
            date: new Date().toISOString()
        });
        
        // Salva
        await fs.writeFile(SCORES_FILE, JSON.stringify(scores, null, 2));
        
        // Ritorna classifica aggiornata
        const topScores = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        
        res.json({ 
            success: true, 
            leaderboard: topScores 
        });
        
    } catch (error) {
        console.error('Errore salvataggio punteggio:', error);
        res.status(500).json({ error: 'Errore server' });
    }
});

// DELETE - Reset classifica (admin)
app.delete('/api/scores', async (req, res) => {
    try {
        await fs.writeFile(SCORES_FILE, JSON.stringify([]));
        res.json({ success: true, message: 'Classifica resettata' });
    } catch (error) {
        console.error('Errore reset:', error);
        res.status(500).json({ error: 'Errore server' });
    }
});

// Avvia server
async function startServer() {
    await initScoresFile();
    app.listen(PORT, () => {
        console.log(`🚀 Server avviato su http://localhost:${PORT}`);
        console.log(`📊 File punteggi: ${SCORES_FILE}`);
    });
}

startServer();