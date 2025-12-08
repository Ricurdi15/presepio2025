const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
// Usa process.env.PORT, che è la porta corretta fornita da Railway (solitamente 8080)
const PORT = process.env.PORT || 3000; 

// 1. Connessione al Database (MongoDB)
const MONGO_URL = process.env.MONGO_URL; 

if (!MONGO_URL) {
    console.error("ERRORE CRITICO: Variabile d'ambiente MONGO_URL non trovata. Il database non sarà utilizzabile.");
    // Lasciamo l'applicazione continuare, ma le rotte DB falliranno con 500
} else {
    mongoose.connect(MONGO_URL)
        .then(() => console.log('✅ Connesso al database MongoDB'))
        .catch(err => {
            console.error('❌ Errore di connessione al DB:', err.message);
            // IMPORTANTE: Rimuoviamo process.exit(1) per evitare il crash immediato su Railway (e l'errore 502)
        });
}

// 2. Schema per i punteggi
const scoreSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 20 },
    score: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', scoreSchema);

// Middleware
app.use(cors());
app.use(express.json());

// 🛑 IMPORTANTE: Per servire la tua pagina HTML all'URL radice '/', devi avere una cartella 'public'
// contenente il file 'index.html' nella root del tuo progetto.
app.use(express.static('public')); 

// GET - Ottieni classifica
app.get('/api/scores', async (req, res) => {
    if (mongoose.connection.readyState !== 1) { // 1 = connected
        return res.status(503).json({ error: 'Database non connesso o non disponibile.' });
    }
    try {
        const topScores = await Score.find()
            .sort({ score: -1 })
            .limit(50)
            .select('name score date -_id');
        
        res.json(topScores);
    } catch (error) {
        console.error('Errore lettura punteggi:', error);
        res.status(500).json({ error: 'Errore server interno' });
    }
});

// POST - Salva nuovo punteggio
app.post('/api/scores', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: 'Database non connesso o non disponibile.' });
    }
    try {
        const { name, score } = req.body;
        
        if (!name || typeof score !== 'number' || name.length > 20) {
             return res.status(400).json({ error: 'Dati non validi o nome troppo lungo' });
        }

        const newScore = new Score({ name, score });
        await newScore.save();

        const topScores = await Score.find()
            .sort({ score: -1 })
            .limit(50)
            .select('name score date -_id');
        
        res.json({ 
            success: true, 
            leaderboard: topScores 
        });
        
    } catch (error) {
        console.error('Errore salvataggio punteggio:', error);
        res.status(500).json({ error: 'Errore server interno' });
    }
});

// DELETE - Reset classifica
app.delete('/api/scores', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: 'Database non connesso o non disponibile.' });
    }
    try {
        await Score.deleteMany({});
        res.json({ success: true, message: 'Classifica resettata' });
    } catch (error) {
        console.error('Errore reset:', error);
        res.status(500).json({ error: 'Errore server interno' });
    }
});

// Avvia server
app.listen(PORT, () => {
    console.log(`🚀 Server avviato sulla porta ${PORT}`);
});