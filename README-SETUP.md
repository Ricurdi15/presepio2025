# 🦖 Dino Runner - Setup Rapido

## 📦 FILE NECESSARI

```
progetto/
├── game.html          # 🎮 IL GIOCO (frontend completo)
├── server.js          # 🔧 Backend per classifica
└── package.json       # 📋 Dipendenze
```

---

## 🚀 AVVIO IN 3 PASSI

### 1. Installa Node.js
Scarica da [nodejs.org](https://nodejs.org) se non ce l'hai

### 2. Installa dipendenze
```bash
npm install
```

### 3. Avvia server
```bash
npm start
```

Poi apri: **http://localhost:3000/game.html**

---

## 🌐 DEPLOY ONLINE

### Opzione A: Frontend + Backend separati

**Frontend (Netlify - GRATIS):**
1. Carica solo `game.html` su [netlify.com](https://netlify.com)
2. Ottieni URL tipo: `https://tuo-gioco.netlify.app`

**Backend (Render - GRATIS):**
1. Carica `server.js` + `package.json` su [render.com](https://render.com)
2. Deploy come "Web Service"
3. Ottieni URL tipo: `https://tuo-api.onrender.com`

**IMPORTANTE:** Cambia in `game.html`:
```javascript
// Riga 416 circa
const API_URL = 'https://tuo-api.onrender.com/api';
```

---

### Opzione B: Tutto insieme (Render/Railway)

**Render.com:**
1. Push tutto su GitHub
2. New Web Service → Connect repository
3. Build: `npm install`
4. Start: `npm start`
5. Aggiungi in `server.js`:
```javascript
// PRIMA di app.listen()
app.use(express.static(__dirname));
```

Fatto! Il gioco sarà su: `https://tuo-app.onrender.com/game.html`

---

## 📱 CARATTERISTICHE MOBILE

✅ **Fullscreen automatico** al tap "GIOCA"  
✅ **Prompt rotazione** se in portrait  
✅ **Lock landscape** (Android)  
✅ **Touch ovunque** per saltare  
✅ **Pulsante classifica** 🏆  
✅ **Vibrazione** feedback  
✅ **Salvataggio locale** + online  

---

## 🎮 COME GIOCARE

1. Apri su mobile
2. Tap "GIOCA ORA"
3. Entra in fullscreen
4. Ruota in orizzontale (se richiesto)
5. Tocca per saltare
6. Game over → Inserisci nome
7. Salva nella classifica
8. Tap 🏆 per vedere top 10

---

## 🔧 TROUBLESHOOTING

### "Impossibile caricare classifica"
- Server non avviato → `npm start`
- Cambia `API_URL` se hai deployato separatamente

### "Server non disponibile"
- Il gioco funziona lo stesso!
- Punteggi salvati in locale
- Classifica non aggiornata

### Fullscreen non funziona
- iOS: limitato, usa solo prompt rotazione
- Assicurati HTTPS se deployato online

---

## 💡 TIPS

**Solo frontend senza backend?**
```javascript
// In game.html, commenta righe 418-445 (funzioni API)
// Il gioco funzionerà solo con record locale
```

**Cambia colori:**
```css
/* Cerca in <style> */
#startScreen {
    background: linear-gradient(135deg, #TUO_COLORE1, #TUO_COLORE2);
}
```

**Regola difficoltà:**
```javascript
// In game.html cerca:
player.jumpPower = -15;  // Aumenta per salti più alti
gameSpeed = 5;           // Diminuisci per più facile
```

---

## 📊 TESTARE IN LOCALE SU MOBILE

1. Avvia server: `npm start`
2. Trova IP computer:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`
3. Sul telefono (stessa WiFi): `http://192.168.X.X:3000/game.html`

---

Buon divertimento! 🦖📱
