# 📝 NOTE IMPORTANTI

## ⚡ Test Rapido (Senza Server)

Puoi aprire `game.html` direttamente nel browser per testare:
- ✅ Gioco funziona perfettamente
- ✅ Record locale salvato
- ❌ Classifica online NON disponibile

Vedrai "Impossibile caricare classifica" ma è normale!

---

## 🌐 Con Classifica Online

Serve il server Node.js:
```bash
npm install
npm start
```
Poi apri: http://localhost:3000/game.html

---

## 🚀 Deploy Consigliato

**FACILE - Frontend Only (Netlify):**
- Carica solo `game.html`
- Funziona subito ma senza classifica online
- Perfetto per test

**COMPLETO - Con Backend (Render):**
- Carica tutti i file
- Classifica online funzionante
- Segui README-SETUP.md

---

## 🎮 Modifiche Senza Server

Se vuoi deployare SOLO il frontend senza backend:

In `game.html` cerca la riga 416:
```javascript
const API_URL = 'http://localhost:3000/api';
```

Cambia in:
```javascript
const API_URL = ''; // Disabilita API
```

Poi commenta le chiamate fetch (righe 418-445) o lascia così:
il gioco gestisce automaticamente l'errore e continua a funzionare!

---

## 📱 Test su Mobile da Computer

1. Avvia server: `npm start`
2. Trova IP computer in rete locale
3. Su telefono: `http://TUO-IP:3000/game.html`

Esempio: `http://192.168.1.100:3000/game.html`
