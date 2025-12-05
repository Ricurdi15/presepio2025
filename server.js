// server.js - Backend Node.js usando un database persistente
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // <--- NUOVO
// const fs = require('fs').promises; // <-- Rimosso
// const path = require('path'); // <-- Rimosso

const app = express();
const PORT = process.env.PORT || 3000; // Usa la PORTA fornita da Railway
// const SCORES_FILE = ... <-- Rimosso

// 1. Connessione al Database (MongoDB)
const MONGO_URL = process.env.MONGO_URL; // Variabile d'ambiente fornita da Railway/Atlas

if (!MONGO_URL) {
    console.error("ERRORE: Variabile d'ambiente MONGO_URL non trovata.");
    process.exit(1);
}

mongoose.connect(MONGO_URL)
    .then(() => console.log('✅ Connesso al database MongoDB'))
    .catch(err => {
        console.error('❌ Errore di connessione al DB:', err);
        process.exit(1);
    });

// 2. Schema per i punteggi
const scoreSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 20 },
    score: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', scoreSchema); // Modello per interazione DB

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

// GET - Ottieni classifica
app.get('/api/scores', async (req, res) => {
    try {
        // Usa il modello per trovare, ordinare e limitare i dati
        const topScores = await Score.find()
            .sort({ score: -1 }) // Ordina per punteggio decrescente
            .limit(10)
            .select('name score date -_id'); // Seleziona solo i campi che ti servono
        
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
        
        // La validazione rimane, ma Mongoose può aiutare
        if (!name || typeof score !== 'number' || name.length > 20) {
             return res.status(400).json({ error: 'Dati non validi o nome troppo lungo' });
        }

        // 3. Salva il nuovo punteggio nel database
        const newScore = new Score({ name, score });
        await newScore.save();

        // Ritorna classifica aggiornata
        const topScores = await Score.find()
            .sort({ score: -1 })
            .limit(10)
            .select('name score date -_id');
        
        res.json({ 
            success: true, 
            leaderboard: topScores 
        });
        
    } catch (error) {
        console.error('Errore salvataggio punteggio:', error);
        res.status(500).json({ error: 'Errore server' });
    }
});

// DELETE - Reset classifica
app.delete('/api/scores', async (req, res) => {
    try {
        await Score.deleteMany({}); // Cancella tutti i documenti
        res.json({ success: true, message: 'Classifica resettata' });
    } catch (error) {
        console.error('Errore reset:', error);
        res.status(500).json({ error: 'Errore server' });
    }
});

// Avvia server
app.listen(PORT, () => {
    console.log(`🚀 Server avviato sulla porta ${PORT}`);
});