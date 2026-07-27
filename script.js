// WolkisTMngn - Pure Obsidian Controller with Standalone Live Activity Tracker

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initRealVisitCounter();
    initCustomCursor();
    initContextMenu();
    init3DTilt();
    initPreloader();
    initEUClock();
    initStandalonePresenceTracker();
    initAvatarBounce();
    initDiscordCopy();
    initShareLink();
    initMusicToggle();
    initKeyboardShortcuts();
    initTabVisibilityOptimizer();
});

/* =======================================================
   1. STAR DUST PARTICLES & SHOOTING STAR METEORS CANVAS
======================================================= */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const numParticles = 40;
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.6 + 0.1,
            speedY: - (Math.random() * 0.25 + 0.05),
            speedX: (Math.random() - 0.5) * 0.15,
            pulseSpeed: Math.random() * 0.02 + 0.005
        });
    }

    let meteor = null;
    function spawnMeteor() {
        if (meteor) return;
        meteor = {
            x: Math.random() * (width * 0.7),
            y: Math.random() * (height * 0.4),
            length: Math.random() * 80 + 50,
            speedX: Math.random() * 8 + 6,
            speedY: Math.random() * 5 + 3,
            opacity: 1
        };
    }

    setInterval(spawnMeteor, 9000);
    setTimeout(spawnMeteor, 2500);

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;

            if (p.y < 0) p.y = height;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;

            p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;
            p.alpha = Math.max(0.1, Math.min(0.7, p.alpha));

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#ffffff';
            ctx.fill();
        });

        if (meteor) {
            ctx.beginPath();
            const grad = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.length, meteor.y - (meteor.length * 0.6));
            grad.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.moveTo(meteor.x, meteor.y);
            ctx.lineTo(meteor.x - meteor.length, meteor.y - (meteor.length * 0.6));
            ctx.stroke();

            meteor.x += meteor.speedX;
            meteor.y += meteor.speedY;
            meteor.opacity -= 0.02;

            if (meteor.opacity <= 0 || meteor.x > width || meteor.y > height) {
                meteor = null;
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* =======================================================
   2. REAL VISITOR COUNTER (CountAPI & Local Tracker)
======================================================= */
function initRealVisitCounter() {
    const visitEl = document.getElementById('visit-count');
    if (!visitEl) return;

    let localHits = localStorage.getItem('wolkis_real_hits');
    if (!localHits) {
        localHits = 1420;
    } else {
        localHits = parseInt(localHits, 10) + 1;
    }
    localStorage.setItem('wolkis_real_hits', localHits);

    visitEl.textContent = localHits.toLocaleString('en-US');

    fetch('https://api.counterapi.dev/v1/wolkistmngn-official-profile/visits/up')
        .then(res => res.json())
        .then(data => {
            if (data && data.count) {
                const total = Math.max(localHits, data.count + 1400);
                visitEl.textContent = total.toLocaleString('en-US');
            }
        })
        .catch(() => {});
}

/* =======================================================
   3. STANDALONE LIVE PRESENCE TRACKER (NO DISCORD SERVER JOIN REQUIRED)
======================================================= */
function initStandalonePresenceTracker() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    if (!statusDot) return;

    // Check if user set a manual override state or calculate smart active time
    function computeStatus() {
        const manualStatus = localStorage.getItem('wolkis_manual_status');
        if (manualStatus) return manualStatus;

        // Smart EU Time Activity (Istanbul EEST: Active between 10:00 AM and 01:30 AM)
        const now = new Date();
        const istanbulTimeStr = now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul', hour12: false, hour: 'numeric' });
        const currentHour = parseInt(istanbulTimeStr, 10);

        if (currentHour >= 10 || currentHour < 2) {
            return 'online';
        } else if (currentHour >= 2 && currentHour < 4) {
            return 'idle';
        } else {
            return 'offline';
        }
    }

    function updateStatusUI(status) {
        statusDot.className = `status-dot ${status}`;
        let label = 'Online';
        if (status === 'online') label = 'Online';
        if (status === 'idle') label = 'Idle';
        if (status === 'dnd') label = 'Do Not Disturb';
        if (status === 'offline') label = 'Offline';

        statusDot.setAttribute('title', `Status: ${label} (Click dot to toggle state)`);
        if (statusText) {
            statusText.textContent = label;
            statusText.className = `status-label ${status}`;
        }
    }

    // Toggle states on click: online -> idle -> dnd -> offline -> auto
    const states = ['online', 'idle', 'dnd', 'offline'];
    statusDot.addEventListener('click', (e) => {
        e.stopPropagation();
        playClickChime();
        const current = computeStatus();
        const nextIndex = (states.indexOf(current) + 1) % states.length;
        const nextStatus = states[nextIndex];

        localStorage.setItem('wolkis_manual_status', nextStatus);
        updateStatusUI(nextStatus);
        showToast(`Status updated: ${nextStatus.toUpperCase()} 🟢`);
    });

    const initialStatus = computeStatus();
    updateStatusUI(initialStatus);
    setInterval(() => {
        updateStatusUI(computeStatus());
    }, 60000);
}

/* =======================================================
   4. 3D INTERACTIVE CARD TILT EFFECT
======================================================= */
function init3DTilt() {
    const tiltElements = document.querySelectorAll('.dock-item, .utility-pill');

    tiltElements.forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -14;
            const rotateY = ((x - centerX) / centerX) * 14;

            el.style.transform = `perspective(400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.08)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(400px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)`;
        });
    });
}

/* =======================================================
   5. CUSTOM OBSIDIAN RIGHT-CLICK CONTEXT MENU
======================================================= */
function initContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    if (!contextMenu) return;

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        playClickChime();

        const x = Math.min(e.clientX, window.innerWidth - 220);
        const y = Math.min(e.clientY, window.innerHeight - 200);

        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.classList.add('show');
    });

    document.addEventListener('click', () => {
        contextMenu.classList.remove('show');
    });

    document.addEventListener('scroll', () => {
        contextMenu.classList.remove('show');
    });

    document.getElementById('ctx-discord')?.addEventListener('click', () => {
        document.getElementById('discord-btn')?.click();
    });

    document.getElementById('ctx-roblox')?.addEventListener('click', () => {
        window.open('https://www.roblox.com/search/users?keyword=WolkisTMngn', '_blank');
    });

    document.getElementById('ctx-music')?.addEventListener('click', () => {
        document.getElementById('music-btn')?.click();
    });

    document.getElementById('ctx-share')?.addEventListener('click', () => {
        document.getElementById('share-btn')?.click();
    });
}

/* =======================================================
   6. LIVE EU DIGITAL CLOCK (Europe/Istanbul CEST/EEST)
======================================================= */
function initEUClock() {
    const clockEl = document.getElementById('eu-clock');
    if (!clockEl) return;

    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-GB', {
            timeZone: 'Europe/Istanbul',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        clockEl.textContent = `${timeString} EEST`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* =======================================================
   7. CUSTOM CURSOR RING TRACKER
======================================================= */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    let isVisible = false;

    document.addEventListener('mousemove', (e) => {
        if (!isVisible) {
            cursor.classList.add('active');
            isVisible = true;
        }
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    document.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        isVisible = false;
    });

    const hoverElements = document.querySelectorAll('a, button, [role="button"], .avatar-container, .context-item');
    hoverElements.forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

/* =======================================================
   8. JAKE AVATAR CLICK BOUNCE ANIMATION & REPLAY INTRO
======================================================= */
function initAvatarBounce() {
    const avatar = document.getElementById('avatar-img');
    if (!avatar) return;

    avatar.addEventListener('click', () => {
        playClickChime();
        triggerJakeBounce();
        showToast('Jake says hi! 🍵');
    });
}

function triggerJakeBounce() {
    const avatar = document.getElementById('avatar-img');
    if (!avatar) return;
    avatar.classList.remove('bounce');
    void avatar.offsetWidth;
    avatar.classList.add('bounce');
}

function triggerReplayIntro() {
    const mainWrapper = document.getElementById('main-wrapper');
    if (mainWrapper) {
        mainWrapper.classList.remove('fade-in-container');
        void mainWrapper.offsetWidth;
        mainWrapper.classList.add('fade-in-container');
    }
    triggerJakeBounce();
    showToast('Replayed Intro Animations 🔄');
}

/* =======================================================
   9. NATIVE WEB AUDIO API SYNTHESIZER CHIME
======================================================= */
let audioCtx;
function playClickChime() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
}

/* =======================================================
   10. PAGE PRELOADER CONTROLLER
======================================================= */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    function hidePreloader() {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            if (preloader.parentNode) {
                preloader.style.display = 'none';
            }
        }, 500);
    }

    if (document.readyState === 'complete') {
        setTimeout(hidePreloader, 300);
    } else {
        window.addEventListener('load', () => setTimeout(hidePreloader, 300));
        setTimeout(hidePreloader, 1800);
    }
}

/* =======================================================
   11. DISCORD TAG COPY
======================================================= */
function initDiscordCopy() {
    const discordBtn = document.getElementById('discord-btn');
    if (!discordBtn) return;

    discordBtn.addEventListener('click', () => {
        playClickChime();
        const username = discordBtn.getAttribute('data-clipboard') || 'Wolkis0001';
        navigator.clipboard.writeText(username).then(() => {
            showToast(`Copied! (${username})`);
        }).catch(err => {
            console.error('Clipboard copy failed:', err);
        });
    });

    discordBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            discordBtn.click();
        }
    });
}

/* =======================================================
   12. SHARE PAGE LINK COPY
======================================================= */
function initShareLink() {
    const shareBtn = document.getElementById('share-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', () => {
        playClickChime();
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl).then(() => {
            showToast('Page link copied to clipboard!');
        }).catch(err => {
            console.error('Share copy failed:', err);
        });
    });

    shareBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            shareBtn.click();
        }
    });
}

/* =======================================================
   13. PROMINENT LO-FI MUSIC & VOLUME STEP CONTROLLER
======================================================= */
function initMusicToggle() {
    const musicBtn = document.getElementById('music-btn');
    const musicText = document.getElementById('music-text');
    const audio = document.getElementById('lofi-audio');

    if (!musicBtn || !audio) return;

    let isPlaying = false;
    const volumes = [0.3, 0.6, 0.95];
    let volIndex = 1;
    audio.volume = volumes[volIndex];

    musicBtn.addEventListener('click', () => {
        playClickChime();
        if (!isPlaying) {
            audio.play().then(() => {
                isPlaying = true;
                musicBtn.classList.add('playing');
                updateMusicText();
                showToast(`Lo-Fi Playing 🎧 (${Math.round(audio.volume * 100)}%)`);
            }).catch(err => {
                console.log('Audio playback prevented:', err);
            });
        } else {
            volIndex = (volIndex + 1) % volumes.length;
            audio.volume = volumes[volIndex];
            updateMusicText();
            showToast(`Volume: ${Math.round(audio.volume * 100)}% 🔊`);
        }
    });

    musicBtn.addEventListener('wheel', (e) => {
        if (!isPlaying) return;
        e.preventDefault();
        if (e.deltaY < 0) {
            volIndex = Math.min(volumes.length - 1, volIndex + 1);
        } else {
            volIndex = Math.max(0, volIndex - 1);
        }
        audio.volume = volumes[volIndex];
        updateMusicText();
        showToast(`Volume: ${Math.round(audio.volume * 100)}% 🔊`);
    });

    function updateMusicText() {
        if (musicText) {
            musicText.textContent = `Playing 🎧 (${Math.round(audio.volume * 100)}%)`;
        }
    }

    musicBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            musicBtn.click();
        }
    });
}

/* =======================================================
   14. POWER-USER KEYBOARD SHORTCUTS
======================================================= */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case '1':
                document.querySelector('.roblox-item')?.click();
                break;
            case '2':
                document.getElementById('discord-btn')?.click();
                break;
            case '3':
                document.querySelector('.steam-item')?.click();
                break;
            case '4':
                document.querySelector('.youtube-item')?.click();
                break;
            case '5':
                document.getElementById('share-btn')?.click();
                break;
            case '6':
            case 'm':
            case 'M':
                document.getElementById('music-btn')?.click();
                break;
            case 'r':
            case 'R':
                playClickChime();
                triggerReplayIntro();
                break;
        }
    });
}

/* =======================================================
   15. BATTERY & CPU TAB VISIBILITY OPTIMIZER
======================================================= */
function initTabVisibilityOptimizer() {
    const bgVideo = document.getElementById('bg-video');
    if (!bgVideo) return;

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            bgVideo.pause();
        } else {
            bgVideo.play().catch(() => {});
        }
    });
}

/* =======================================================
   16. CLEAR PITCH-BLACK TOAST NOTIFICATION
======================================================= */
let toastTimer;
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');

    if (!toast) return;

    if (toastText && message) {
        toastText.textContent = message;
    }

    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}
