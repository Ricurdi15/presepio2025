// Create 16-bit pixel stars effect
        function createPixelStars() {
            const container = document.getElementById('starsContainer');
            const starCount = 60;
            const sizes = ['small', 'small', 'small', 'medium', 'medium', 'large'];
            const animations = ['anim-1', 'anim-2', 'anim-3', 'anim-pulse', ''];

            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.className = 'pixel-star';
                
                // Dimensione casuale (più probabilità di stelle piccole)
                const size = sizes[Math.floor(Math.random() * sizes.length)];
                star.classList.add(size);
                
                // Animazione casuale
                const anim = animations[Math.floor(Math.random() * animations.length)];
                if (anim) star.classList.add(anim);
                
                // Posizione casuale
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 60 + '%'; // Solo nella parte alta
                
                // Delay casuale per l'animazione
                star.style.animationDelay = (Math.random() * 3) + 's';
                
                container.appendChild(star);
            }

            // Aggiungi alcune stelle dorate speciali
            for (let i = 0; i < 3; i++) {
                const goldenStar = document.createElement('div');
                goldenStar.className = 'pixel-star golden anim-pulse';
                goldenStar.style.left = (20 + Math.random() * 60) + '%';
                goldenStar.style.top = (5 + Math.random() * 25) + '%';
                goldenStar.style.animationDelay = (Math.random() * 2) + 's';
                container.appendChild(goldenStar);
            }
        }
        createPixelStars();

        // Create snowfall effect
        function createSnowfall() {
            const snowfall = document.getElementById('snowfall');
            const snowflakes = ['❄', '❅', '❆', '•'];

            for (let i = 0; i < 50; i++) {
                const snowflake = document.createElement('div');
                snowflake.className = 'snowflake';
                snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
                snowflake.style.left = Math.random() * 100 + '%';
                snowflake.style.animationDuration = (Math.random() * 3 + 5) + 's';
                snowflake.style.animationDelay = Math.random() * 5 + 's';
                snowflake.style.fontSize = (Math.random() * 10 + 8) + 'px';
                snowflake.style.opacity = Math.random() * 0.6 + 0.4;
                snowfall.appendChild(snowflake);
            }
        }
        createSnowfall();

        const SPRITE_CONFIG = {
            player: {
                sprites: ['img/player01.png', 'img/player02.png', 'img/player025.png', 'img/player03.png', 'img/player04.png', 'img/player025.png'],
                useColor: false,
                color: '#daa520',
                width: 70,
                height: 70,
                animationSpeed:6,
                hitbox: { width: 30, height: 50, offsetX: 30, offsetY: 10 }
            },
            obstacles: [
                { sprite: 'img/pecora.png', useColor: false, color: '#fff', width: 50, height: 50, heightOffset: 0 },
                { sprite: 'img/cammello.png', useColor: false, color: '#8b4513', width: 95, height: 95, heightOffset: 0 },
                { sprite: 'img/uccello.png', sprites: ['img/uccello.png', 'img/uccello2.png'], animationSpeed: 8, useColor: false, color: '#4169e1', width: 50, height: 40, heightOffset: 40 },
                { sprite: 'img/uccello.png', sprites: ['img/uccello.png', 'img/uccello2.png'], animationSpeed: 8, useColor: false, color: '#4169e1', width: 50, height: 40, heightOffset: 80 },
                { sprite: 'img/uccello.png', sprites: ['img/uccello.png', 'img/uccello2.png'], animationSpeed: 8, useColor: false, color: '#4169e1', width: 50, height: 40, heightOffset: 130 },
                { sprite: 'img/pastore.png', useColor: false, color: '#4169e1', width: 50, height: 70, heightOffset: 0 },
                { sprite: 'img/pastore1.png', useColor: false, color: '#4169e1', width: 50, height: 70, heightOffset: 0 },
                { sprite: 'img/cactus.png', useColor: false, color: '#4169e1', width: 60, height: 110, heightOffset: 0 },
            ],
            collectibles: {
                star: {
                    sprite: 'img/stella.png',
                    width: 40,
                    height: 40,
                    points: 300,
                    minHeightOffset: 40,
                    maxHeightOffset: 130,
                    spawnChance: 0.3
                }
            },
            ground: { useColor: false, color: '#362c26ff', sprite: 'img/ground.png', tileSize: 50 },
            background: { sprite: 'img/background.png', useColor: false, color: '#21243bff' }
        };

        const GOAL_SCORE = 5500;
        const API_URL = window.location.origin + '/api';

        const spriteLoader = {
            images: {},
            load(config) {
                const promises = [];
                if (config.player.sprites) config.player.sprites.forEach((src, i) => promises.push(this.loadImage(`player${i}`, src)));
                config.obstacles.forEach((obs, i) => { 
                    if (obs.sprite) promises.push(this.loadImage(`obstacle${i}`, obs.sprite));
                    // Carica frame animati se presenti
                    if (obs.sprites) {
                        obs.sprites.forEach((src, frameIndex) => {
                            promises.push(this.loadImage(`obstacle${i}_frame${frameIndex}`, src));
                        });
                    }
                });
                // Carica sprite collezionabili
                if (config.collectibles) {
                    Object.keys(config.collectibles).forEach(key => {
                        if (config.collectibles[key].sprite) {
                            promises.push(this.loadImage(`collectible_${key}`, config.collectibles[key].sprite));
                        }
                    });
                }
                if (config.ground.sprite) promises.push(this.loadImage('ground', config.ground.sprite));
                if (config.background.sprite) promises.push(this.loadImage('background', config.background.sprite));
                return Promise.all(promises);
            },
            loadImage(key, src) {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => { this.images[key] = img; resolve(); };
                    img.onerror = () => { console.warn(`Impossibile caricare: ${src}`); resolve(); };
                    img.src = src;
                });
            },
            get(key) { return this.images[key]; }
        };

        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        let isFullscreen = false, gameRunning = false, gameStarted = false, score = 0;
        let highScore = localStorage.getItem('magiHighScore') || 0;
        let gameSpeed = 10, gravity = 0.87, goalReached = false;

        const player = {
            x: 100, y: 0, width: SPRITE_CONFIG.player.width, height: SPRITE_CONFIG.player.height,
            dy: 0, jumpPower: -16, grounded: false, currentFrame: 0, frameCounter: 0,
            totalFrames: SPRITE_CONFIG.player.sprites.length || 1,
            draw() {
                if (SPRITE_CONFIG.player.sprites.length > 0 && spriteLoader.get(`player${this.currentFrame}`)) {
                    ctx.drawImage(spriteLoader.get(`player${this.currentFrame}`), this.x, this.y, this.width, this.height);
                } else {
                    ctx.fillStyle = SPRITE_CONFIG.player.color;
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            },
            updateAnimation(correction) {
                if (this.grounded && this.totalFrames > 1) {
                    this.frameCounter += correction;
                    if (this.frameCounter >= SPRITE_CONFIG.player.animationSpeed) {
                        this.frameCounter = 0;
                        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
                    }
                }
            }
        };

        const ground = {
            y: canvas.height - 50, height: 50,
            scrollOffset: 0,
            draw() {
                const groundSprite = spriteLoader.get('ground');
                if (!SPRITE_CONFIG.ground.useColor && groundSprite) {
                    const tileSize = SPRITE_CONFIG.ground.tileSize || 50;
                    // Calcola quanti tile servono (più uno extra per lo scroll)
                    const tilesNeeded = Math.ceil(canvas.width / tileSize) + 2;
                    
                    for (let i = 0; i < tilesNeeded; i++) {
                        const x = (i * tileSize) - (this.scrollOffset % tileSize);
                        ctx.drawImage(groundSprite, x, this.y, tileSize, this.height);
                    }
                } else {
                    ctx.fillStyle = SPRITE_CONFIG.ground.color;
                    ctx.fillRect(0, this.y, canvas.width, this.height);
                }
            },
            update(correction) {
                // Scroll del terreno sincronizzato con la velocità di gioco
                this.scrollOffset += gameSpeed * correction;
            }
        };

        player.y = ground.y - player.height;

        let obstacles = [], obstacleTimer = 0, obstacleInterval = 150;
        let collectibles = [], collectibleTimer = 0, collectibleInterval = 200;

        // Stella cometa
        let comet = null;
        const COMET_CONFIG = {
            width: 60,
            height: 60,
            tailLength: 150,
            speed: 4,
            startY: 80
        };

        function startComet() {
            comet = {
                x: -COMET_CONFIG.width - COMET_CONFIG.tailLength,
                y: COMET_CONFIG.startY,
                active: true,
                opacity: 1
            };
        }

        function updateComet(correction) {
            if (!comet || !comet.active) return;
            
            comet.x += COMET_CONFIG.speed * correction;
            // Leggero movimento ondulatorio
            comet.y = COMET_CONFIG.startY + Math.sin(comet.x * 0.02) * 15;
            
            // Quando esce dallo schermo, disattiva la cometa (solo effetto visivo)
            if (comet.x > canvas.width + 100) {
                comet.active = false;
            }
        }

        function drawComet() {
            if (!comet || !comet.active) return;
            
            ctx.save();
            
            // Coda della cometa (gradient)
            const tailGradient = ctx.createLinearGradient(
                comet.x - COMET_CONFIG.tailLength, comet.y + COMET_CONFIG.height / 2,
                comet.x + COMET_CONFIG.width / 2, comet.y + COMET_CONFIG.height / 2
            );
            tailGradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
            tailGradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.3)');
            tailGradient.addColorStop(0.6, 'rgba(255, 180, 0, 0.6)');
            tailGradient.addColorStop(1, 'rgba(255, 255, 200, 1)');
            
            ctx.beginPath();
            ctx.moveTo(comet.x - COMET_CONFIG.tailLength, comet.y + COMET_CONFIG.height / 2 - 5);
            ctx.lineTo(comet.x + COMET_CONFIG.width / 2, comet.y + COMET_CONFIG.height / 2);
            ctx.lineTo(comet.x - COMET_CONFIG.tailLength, comet.y + COMET_CONFIG.height / 2 + 5);
            ctx.closePath();
            ctx.fillStyle = tailGradient;
            ctx.fill();
            
            // Coda secondaria più larga e tenue
            const tailGradient2 = ctx.createLinearGradient(
                comet.x - COMET_CONFIG.tailLength * 0.8, comet.y + COMET_CONFIG.height / 2,
                comet.x, comet.y + COMET_CONFIG.height / 2
            );
            tailGradient2.addColorStop(0, 'rgba(255, 255, 255, 0)');
            tailGradient2.addColorStop(1, 'rgba(255, 255, 200, 0.5)');
            
            ctx.beginPath();
            ctx.moveTo(comet.x - COMET_CONFIG.tailLength * 0.8, comet.y + COMET_CONFIG.height / 2 - 15);
            ctx.lineTo(comet.x + COMET_CONFIG.width / 4, comet.y + COMET_CONFIG.height / 2);
            ctx.lineTo(comet.x - COMET_CONFIG.tailLength * 0.8, comet.y + COMET_CONFIG.height / 2 + 15);
            ctx.closePath();
            ctx.fillStyle = tailGradient2;
            ctx.fill();
            
            // Glow attorno alla stella
            const glowGradient = ctx.createRadialGradient(
                comet.x + COMET_CONFIG.width / 2, comet.y + COMET_CONFIG.height / 2, 0,
                comet.x + COMET_CONFIG.width / 2, comet.y + COMET_CONFIG.height / 2, COMET_CONFIG.width
            );
            glowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
            glowGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)');
            glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            ctx.beginPath();
            ctx.arc(comet.x + COMET_CONFIG.width / 2, comet.y + COMET_CONFIG.height / 2, COMET_CONFIG.width, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();
            
            // Stella centrale (forma a stella)
            drawStar(comet.x + COMET_CONFIG.width / 2, comet.y + COMET_CONFIG.height / 2, 5, 20, 10);
            
            ctx.restore();
        }

        function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;
            
            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);
            
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;
                
                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            
            // Riempimento stella
            const starGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerRadius);
            starGradient.addColorStop(0, '#fff');
            starGradient.addColorStop(0.5, '#ffd700');
            starGradient.addColorStop(1, '#ffaa00');
            
            ctx.fillStyle = starGradient;
            ctx.fill();
            
            // Bordo luminoso
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        document.getElementById('highScoreValue').textContent = highScore;

        async function enterFullscreen() {
            try {
                const elem = document.documentElement;
                if (elem.requestFullscreen) await elem.requestFullscreen();
                else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
                document.body.classList.add('fullscreen');
                isFullscreen = true;
                if (screen.orientation && screen.orientation.lock) {
                    try { await screen.orientation.lock('landscape'); } catch (err) { }
                }
                resizeCanvas();
            } catch (err) { resizeCanvas(); }
        }

        async function exitFullscreen() {
            try {
                if (document.exitFullscreen) await document.exitFullscreen();
                else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
            } catch (err) { }
            document.body.classList.remove('fullscreen');
            isFullscreen = false;
            if (screen.orientation && screen.orientation.unlock) {
                try { screen.orientation.unlock(); } catch (err) { }
            }
        }

        function backToMainMenu() {
            // Ferma il gioco
            gameRunning = false;
            gameStarted = false;
            
            // Chiudi tutte le schermate aperte
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('nativityEnding').classList.remove('show');
            document.getElementById('leaderboardModal').style.display = 'none';
            
            // Esci dal fullscreen
            exitFullscreen();
            
            // Reset dello stato del gioco
            score = 0;
            obstacles = [];
            obstacleTimer = 0;
            player.y = ground.y - player.height;
            player.dy = 0;
            player.currentFrame = 0;
            player.frameCounter = 0;
            
            // Mostra il menu principale
            document.getElementById('startScreen').classList.remove('hidden');
            
            // Resize canvas per adattarsi
            setTimeout(() => resizeCanvas(), 100);
        }

        function resizeCanvas() {
            if (isFullscreen) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            } else {
                if (window.innerWidth >= 768) {
                    canvas.width = 1080;
                    canvas.height = 720;
                } else {
                    const aspectRatio = 1080 / 720;
                    const maxWidth = window.innerWidth - 20;
                    const maxHeight = window.innerHeight * 0.65;

                    if (maxWidth / aspectRatio <= maxHeight) {
                        canvas.width = 1080;
                        canvas.height = 720;
                        canvas.style.width = maxWidth + 'px';
                        canvas.style.height = (maxWidth / aspectRatio) + 'px';
                    } else {
                        canvas.width = 1080;
                        canvas.height = 720;
                        canvas.style.width = (maxHeight * aspectRatio) + 'px';
                        canvas.style.height = maxHeight + 'px';
                    }
                }
            }
            ground.y = canvas.height - 50;
            player.y = ground.y - player.height;
        }

        function checkOrientation() {
            const rotateMsg = document.getElementById('rotateMessage');
            if (isMobile && window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
                rotateMsg.classList.add('show', 'mobile-portrait');
            } else {
                rotateMsg.classList.remove('show', 'mobile-portrait');
            }
        }

        function createRipple(x, y) {
            const ripple = document.createElement('div');
            ripple.className = 'touch-ripple';
            ripple.style.left = (x - 100) + 'px';
            ripple.style.top = (y - 100) + 'px';
            document.body.appendChild(ripple);
            setTimeout(() => document.body.removeChild(ripple), 600);
        }

        async function loadLeaderboard() {
            try {
                const response = await fetch(`${API_URL}/scores`);
                const scores = await response.json();
                displayLeaderboard(scores);
            } catch (error) {
                document.getElementById('loading').textContent = 'Impossibile caricare la classifica';
            }
        }

        function displayLeaderboard(scores) {
            const list = document.getElementById('leaderboardList');
            const loading = document.getElementById('loading');
            loading.style.display = 'none';
            list.innerHTML = '';
            if (scores.length === 0) {
                list.innerHTML = '<li style="text-align: center; padding: 20px; color: #666; font-style: italic;">Nessun punteggio ancora!</li>';
                return;
            }
            scores.forEach((entry, index) => {
                const li = document.createElement('li');
                li.className = 'leaderboard-item';
                if (index === 0) li.classList.add('top1');
                else if (index === 1) li.classList.add('top2');
                else if (index === 2) li.classList.add('top3');
                const rank = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                li.innerHTML = `<span class="rank">${rank}</span><span class="player-name">${entry.name}</span><span class="player-score">${entry.score}</span>`;
                list.appendChild(li);
            });
        }

        async function submitScore() {
            const nameInput = document.getElementById('nameInput');
            const name = nameInput.value.trim();
            if (!name) { alert('Inserisci il tuo nome!'); return; }
            const submitBtn = document.getElementById('submitScoreBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvataggio...';
            try {
                const response = await fetch(`${API_URL}/scores`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, score: Math.floor(score) })
                });
                const data = await response.json();
                if (data.success) {
                    submitBtn.textContent = '✓ SALVATO!';
                    submitBtn.style.background = 'var(--forest)';
                    nameInput.disabled = true;
                    displayLeaderboard(data.leaderboard);
                } else throw new Error();
            } catch (error) {
                alert('Server non disponibile');
                submitBtn.disabled = false;
                submitBtn.textContent = 'RIPROVA';
            }
        }

        document.getElementById('startButton').addEventListener('click', async () => {
            document.getElementById('startScreen').classList.add('hidden');
            await spriteLoader.load(SPRITE_CONFIG);
            if (isMobile) await enterFullscreen();
            setTimeout(() => { gameStarted = true; startGame(); }, 300);
        });

        // PULSANTE ESCI - Torna al menu principale
        document.getElementById('exitFullscreen').addEventListener('click', () => {
            backToMainMenu();
        });

        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            document.getElementById('leaderboardOverlay').classList.add('show');
            document.getElementById('leaderboardModal').style.display = 'block';
            loadLeaderboard();
        });

        document.getElementById('startLeaderboardBtn').addEventListener('click', () => {
            document.getElementById('leaderboardOverlay').classList.add('show');
            document.getElementById('leaderboardModal').style.display = 'block';
            loadLeaderboard();
        });

        document.getElementById('nativityLeaderboardBtn').addEventListener('click', () => {
            document.getElementById('leaderboardOverlay').classList.add('show');
            document.getElementById('leaderboardModal').style.display = 'block';
            loadLeaderboard();
        });

        document.getElementById('closeLeaderboard').addEventListener('click', () => {
            document.getElementById('leaderboardOverlay').classList.remove('show');
            document.getElementById('leaderboardModal').style.display = 'none';
        });

        document.getElementById('leaderboardOverlay').addEventListener('click', () => {
            document.getElementById('leaderboardOverlay').classList.remove('show');
            document.getElementById('leaderboardModal').style.display = 'none';
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            document.getElementById('gameOver').style.display = 'none';
            startGame();
        });

        document.getElementById('nativityRestartBtn').addEventListener('click', () => {
            document.getElementById('nativityEnding').classList.remove('show');
            startGame();
        });

        document.getElementById('nativitySubmitBtn').addEventListener('click', async () => {
            const nameInput = document.getElementById('nativityNameInput');
            const name = nameInput.value.trim();
            if (!name) { alert('Inserisci il tuo nome!'); return; }
            const submitBtn = document.getElementById('nativitySubmitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvataggio...';
            try {
                const response = await fetch(`${API_URL}/scores`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, score: Math.floor(score) })
                });
                const data = await response.json();
                if (data.success) {
                    submitBtn.textContent = '✓ SALVATO!';
                    submitBtn.style.background = 'var(--forest)';
                    nameInput.disabled = true;
                } else throw new Error();
            } catch (error) {
                alert('Server non disponibile');
                submitBtn.disabled = false;
                submitBtn.textContent = 'RIPROVA';
            }
        });

        document.getElementById('submitScoreBtn').addEventListener('click', submitScore);

        // ===== CONDIVISIONE =====
        const shareBtn = document.getElementById('shareBtn');
        const shareModal = document.getElementById('shareModal');
        const shareCloseBtn = document.getElementById('shareCloseBtn');
        
        const shareText = '🌟 Ho raggiunto il Presepio nel gioco Presepio 2020 II! 🎄';
        const shareUrl = window.location.href;

        shareBtn.addEventListener('click', async () => {
            // Prova prima la Web Share API (funziona su mobile)
            if (navigator.share) {
                try {
                    // Prova a condividere con l'immagine
                    const img = document.getElementById('presepioImg');
                    const response = await fetch(img.src);
                    const blob = await response.blob();
                    const file = new File([blob], 'presepio.png', { type: 'image/png' });
                    
                    await navigator.share({
                        title: 'Presepio 2020 II',
                        text: shareText + ` Punteggio: ${Math.floor(score)}`,
                        files: [file]
                    });
                } catch (err) {
                    // Se fallisce con i file, prova senza
                    try {
                        await navigator.share({
                            title: 'Presepio 2020 II',
                            text: shareText + ` Punteggio: ${Math.floor(score)}`,
                            url: shareUrl
                        });
                    } catch (e) {
                        // Se anche questo fallisce, mostra il modal
                        showShareModal();
                    }
                }
            } else {
                // Fallback: mostra il modal con le opzioni
                showShareModal();
            }
        });

        function showShareModal() {
            const scoreText = Math.floor(score);
            const fullText = encodeURIComponent(`${shareText} Punteggio: ${scoreText}`);
            const encodedUrl = encodeURIComponent(shareUrl);
            
            document.getElementById('shareFacebook').href = 
                `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${fullText}`;
            document.getElementById('shareTwitter').href = 
                `https://twitter.com/intent/tweet?text=${fullText}&url=${encodedUrl}`;
            document.getElementById('shareWhatsapp').href = 
                `https://wa.me/?text=${fullText}%20${encodedUrl}`;
            
            shareModal.classList.add('show');
        }

        shareCloseBtn.addEventListener('click', () => {
            shareModal.classList.remove('show');
        });

        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.classList.remove('show');
            }
        });

        document.getElementById('shareCopy').addEventListener('click', async () => {
            const textToCopy = `${shareText} Punteggio: ${Math.floor(score)} - ${shareUrl}`;
            try {
                await navigator.clipboard.writeText(textToCopy);
                alert('Link copiato! 📋');
            } catch (err) {
                // Fallback per browser più vecchi
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('Link copiato! 📋');
            }
        });

        document.getElementById('shareDownload').addEventListener('click', () => {
            const img = document.getElementById('presepioImg');
            const link = document.createElement('a');
            link.href = img.src;
            link.download = 'presepio-2020-II.png';
            link.click();
        });

        function handleInput(e) {
            if (e) {
                e.preventDefault();
                let x, y;
                if (e.touches && e.touches[0]) {
                    x = e.touches[0].clientX;
                    y = e.touches[0].clientY;
                } else {
                    x = e.clientX;
                    y = e.clientY;
                }
                createRipple(x, y);
            }
            if (gameRunning && player.grounded) jump();
        }

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleInput();
            }
        });

        canvas.addEventListener('touchstart', handleInput, { passive: false });
        canvas.addEventListener('click', handleInput);

        function startGame() {
            gameRunning = true;
            score = 0;
            gameSpeed = 10;
            obstacles = [];
            obstacleTimer = 0;
            collectibles = [];
            collectibleTimer = 0;
            lastTime = 0;
            player.y = ground.y - player.height;
            player.dy = 0;
            player.currentFrame = 0;
            player.frameCounter = 0;
            goalReached = false;
            comet = null; // Reset cometa
            const submitBtn = document.getElementById('submitScoreBtn');
            const nameInput = document.getElementById('nameInput');
            submitBtn.disabled = false;
            submitBtn.textContent = 'SALVA CLASSIFICA';
            submitBtn.style.background = 'linear-gradient(135deg, #4169E1 0%, #000080 100%)';
            nameInput.disabled = false;
            nameInput.value = '';
        }

        function jump() {
            if (player.grounded) {
                player.dy = player.jumpPower;
                player.grounded = false;
                if (navigator.vibrate) navigator.vibrate(50);
            }
        }

        function updatePlayer(correction) {
            player.dy += gravity * correction;
            player.y += player.dy * correction;

            if (player.y + player.height >= ground.y) {
                player.y = ground.y - player.height;
                player.dy = 0;
                player.grounded = true;
            }

            player.updateAnimation(correction);
        }

        function spawnObstacle() {
            const obstacleIndex = Math.floor(Math.random() * SPRITE_CONFIG.obstacles.length);
            const obstacleConfig = SPRITE_CONFIG.obstacles[obstacleIndex];
            obstacles.push({
                x: canvas.width,
                y: ground.y - obstacleConfig.height - (obstacleConfig.heightOffset || 0),
                width: obstacleConfig.width,
                height: obstacleConfig.height,
                sprite: obstacleConfig.sprite,
                color: obstacleConfig.color,
                useColor: obstacleConfig.useColor,
                // Dati animazione
                configIndex: obstacleIndex,
                animated: !!obstacleConfig.sprites,
                totalFrames: obstacleConfig.sprites ? obstacleConfig.sprites.length : 1,
                currentFrame: 0,
                frameCounter: 0,
                animationSpeed: obstacleConfig.animationSpeed || 10
            });
        }

        function updateObstacles(correction) {
            obstacleTimer += correction; 
            
            if (obstacleTimer > obstacleInterval) {
                spawnObstacle();
                obstacleTimer = 0;

                const minGap = 45; 
                const startGap = 70; 
                const difficultyCurve = 150;

                const baseInterval = Math.max(minGap, startGap - Math.floor(score / difficultyCurve));

                const randomness = baseInterval * 0.3;
                obstacleInterval = baseInterval + (Math.random() * randomness * 2 - randomness);
            }
            
            for (let i = obstacles.length - 1; i >= 0; i--) {
                obstacles[i].x -= gameSpeed * correction;
                
                // Aggiorna animazione ostacoli animati
                if (obstacles[i].animated) {
                    obstacles[i].frameCounter += correction;
                    if (obstacles[i].frameCounter >= obstacles[i].animationSpeed) {
                        obstacles[i].frameCounter = 0;
                        obstacles[i].currentFrame = (obstacles[i].currentFrame + 1) % obstacles[i].totalFrames;
                    }
                }
                
                if (obstacles[i].x + obstacles[i].width < 0) {
                    obstacles.splice(i, 1);
                    score += 10 * correction;
                }
            }
            
            if (score > 0 && Math.floor(score) % 100 === 0) gameSpeed += 0.4 * correction; 
        }

        function checkCollisions() {
            const playerHitbox = {
                x: player.x + (SPRITE_CONFIG.player.hitbox?.offsetX || 0),
                y: player.y + (SPRITE_CONFIG.player.hitbox?.offsetY || 0),
                width: SPRITE_CONFIG.player.hitbox?.width || player.width,
                height: SPRITE_CONFIG.player.hitbox?.height || player.height
            };
            for (let obstacle of obstacles) {
                if (playerHitbox.x < obstacle.x + obstacle.width &&
                    playerHitbox.x + playerHitbox.width > obstacle.x &&
                    playerHitbox.y < obstacle.y + obstacle.height &&
                    playerHitbox.y + playerHitbox.height > obstacle.y) {
                    gameOver();
                }
            }
        }

        // ===== COLLEZIONABILI (STELLE) =====
        function spawnCollectible() {
            const starConfig = SPRITE_CONFIG.collectibles.star;
            // Altezza casuale tra min e max offset
            const heightOffset = starConfig.minHeightOffset + 
                Math.random() * (starConfig.maxHeightOffset - starConfig.minHeightOffset);
            
            collectibles.push({
                x: canvas.width,
                y: ground.y - starConfig.height - heightOffset,
                width: starConfig.width,
                height: starConfig.height,
                points: starConfig.points,
                type: 'star',
                collected: false,
                // Animazione fluttuante
                baseY: ground.y - starConfig.height - heightOffset,
                floatOffset: 0,
                floatSpeed: 0.1
            });
        }

        function updateCollectibles(correction) {
            collectibleTimer += correction;
            
            // Spawn con probabilità
            if (collectibleTimer > collectibleInterval) {
                if (Math.random() < SPRITE_CONFIG.collectibles.star.spawnChance) {
                    spawnCollectible();
                }
                collectibleTimer = 0;
                // Intervallo variabile
                collectibleInterval = 150 + Math.random() * 100;
            }
            
            const playerHitbox = {
                x: player.x + (SPRITE_CONFIG.player.hitbox?.offsetX || 0),
                y: player.y + (SPRITE_CONFIG.player.hitbox?.offsetY || 0),
                width: SPRITE_CONFIG.player.hitbox?.width || player.width,
                height: SPRITE_CONFIG.player.hitbox?.height || player.height
            };
            
            for (let i = collectibles.length - 1; i >= 0; i--) {
                const col = collectibles[i];
                col.x -= gameSpeed * correction;
                
                // Animazione fluttuante
                col.floatOffset += col.floatSpeed * correction;
                col.y = col.baseY + Math.sin(col.floatOffset) * 8;
                
                // Controlla collisione con player
                if (!col.collected &&
                    playerHitbox.x < col.x + col.width &&
                    playerHitbox.x + playerHitbox.width > col.x &&
                    playerHitbox.y < col.y + col.height &&
                    playerHitbox.y + playerHitbox.height > col.y) {
                    // Raccolto!
                    col.collected = true;
                    score += col.points;
                    if (navigator.vibrate) navigator.vibrate(30);
                    // Rimuovi subito
                    collectibles.splice(i, 1);
                    continue;
                }
                
                // Rimuovi se fuori schermo
                if (col.x + col.width < 0) {
                    collectibles.splice(i, 1);
                }
            }
        }

        function drawCollectibles() {
            for (let col of collectibles) {
                const sprite = spriteLoader.get(`collectible_${col.type}`);
                if (sprite) {
                    // Leggero glow dorato
                    ctx.save();
                    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
                    ctx.shadowBlur = 15;
                    ctx.drawImage(sprite, col.x, col.y, col.width, col.height);
                    ctx.restore();
                } else {
                    // Fallback: stella disegnata
                    ctx.fillStyle = '#ffd700';
                    ctx.beginPath();
                    ctx.arc(col.x + col.width/2, col.y + col.height/2, col.width/2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        function checkGoal() {
            // Goal check handled in gameOver()
        }

        function showNativityEnding() {
            document.getElementById('nativityFinalScore').textContent = Math.floor(score);

            const submitBtn = document.getElementById('nativitySubmitBtn');
            const nameInput = document.getElementById('nativityNameInput');
            submitBtn.disabled = false;
            submitBtn.textContent = 'SALVA NELLA CLASSIFICA';
            submitBtn.style.background = 'linear-gradient(135deg, var(--forest) 0%, var(--forest-dark) 100%)';
            nameInput.disabled = false;
            nameInput.value = '';

            document.getElementById('nativityEnding').classList.add('show');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
        }

        function gameOver() {
            gameRunning = false;
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

            if (score > highScore) {
                highScore = Math.floor(score);
                localStorage.setItem('magiHighScore', highScore);
                document.getElementById('highScoreValue').textContent = highScore;
            }

            if (score >= GOAL_SCORE) {
                showNativityEnding();
            } else {
                const goalMessage = document.getElementById('goalMessage');
                goalMessage.textContent = `Mancavano ${GOAL_SCORE - Math.floor(score)} passi per il Presepio`;
                goalMessage.style.color = '#ff8a8a';

                if (score > highScore) {
                    document.getElementById('newRecord').style.display = 'block';
                } else {
                    document.getElementById('newRecord').style.display = 'none';
                }

                document.getElementById('finalScore').textContent = Math.floor(score);
                document.getElementById('gameOver').style.display = 'block';
            }
        }

        function drawObstacles() {
            for (let obstacle of obstacles) {
                let spriteKey;
                
                // Se l'ostacolo è animato, usa il frame corrente
                if (obstacle.animated) {
                    spriteKey = `obstacle${obstacle.configIndex}_frame${obstacle.currentFrame}`;
                } else {
                    spriteKey = `obstacle${obstacle.configIndex}`;
                }
                
                if (!obstacle.useColor && spriteLoader.get(spriteKey)) {
                    ctx.drawImage(spriteLoader.get(spriteKey), obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                } else {
                    ctx.fillStyle = obstacle.color;
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
            }
        }

        function drawStars() {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            const stars = [
                { x: canvas.width * 0.1, y: canvas.height * 0.1 },
                { x: canvas.width * 0.3, y: canvas.height * 0.15 },
                { x: canvas.width * 0.5, y: canvas.height * 0.08 },
                { x: canvas.width * 0.7, y: canvas.height * 0.12 },
                { x: canvas.width * 0.9, y: canvas.height * 0.1 }
            ];
            for (let star of stars) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function update(correction) {
            if (gameRunning) {
                updatePlayer(correction);
                updateObstacles(correction);
                updateCollectibles(correction);
                ground.update(correction);

                checkCollisions();
                
                // Aggiorna cometa se attiva
                if (comet && comet.active) {
                    updateComet(correction);
                }

                score += 2 * correction;

                document.getElementById('score').textContent = Math.floor(score);

                const remaining = Math.max(0, GOAL_SCORE - Math.floor(score));
                document.getElementById('goalProgress').textContent = remaining > 0 ? `Meta: ${remaining} passi` : '✨ META RAGGIUNTA! ✨';
                
                // Quando raggiungi il goal, avvia la cometa
                if (score >= GOAL_SCORE && !goalReached) {
                    goalReached = true;
                    startComet();
                }
            }
        }

        function draw() {
            if (SPRITE_CONFIG.background.sprite && spriteLoader.get('background')) {
                ctx.drawImage(spriteLoader.get('background'), 0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = SPRITE_CONFIG.background.color;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            drawStars();
            
            // Disegna la cometa (dietro al terreno e ostacoli)
            drawComet();
            
            ground.draw();
            drawCollectibles();
            drawObstacles();
            player.draw();
        }

        let lastTime = 0;

        function gameLoop(timestamp) {
            if (!lastTime) lastTime = timestamp;

            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            const correction = Math.min(deltaTime, 100) / (1000 / 60);

            update(correction);
            
            // Continua ad aggiornare e disegnare la cometa anche se il gioco è fermo
            if (!gameRunning && comet && comet.active) {
                updateComet(correction);
            }
            
            draw();
            requestAnimationFrame(gameLoop);
        }

        window.addEventListener('resize', () => { resizeCanvas(); checkOrientation(); });
        window.addEventListener('orientationchange', () => setTimeout(() => { resizeCanvas(); checkOrientation(); }, 100));

        resizeCanvas();
        checkOrientation();
        gameLoop();