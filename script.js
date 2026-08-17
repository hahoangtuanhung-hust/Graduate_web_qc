document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Scroll Reveal
    const fadeElements = document.querySelectorAll('.fade-up');
    
    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);
    
    fadeElements.forEach(el => appearOnScroll.observe(el));

    // 2. Interactive Envelope Opening Logic
    const envelopeOverlay = document.getElementById('envelope-overlay');
    const envelopeTrigger = document.getElementById('open-envelope-trigger');
    let hasOpened = false;

    if (envelopeTrigger && envelopeOverlay) {
        envelopeTrigger.addEventListener('click', () => {
            if (hasOpened) return;
            hasOpened = true;

            // Trigger Envelope opening animation
            envelopeTrigger.classList.add('opening');

            // Play background music automatically upon opening
            if (bgMusic) {
                bgMusic.volume = 0.5;
                bgMusic.play().then(() => {
                    isPlaying = true;
                    if (musicPlayer) musicPlayer.classList.add('playing');
                }).catch(e => console.log("Music play blocked:", e));
            }

            // Confetti explosion effect
            createElegantConfetti();

            // After envelope opening animation finishes, fade out overlay
            setTimeout(() => {
                envelopeOverlay.classList.add('hide-envelope');
                
                // Trigger reveal for hero elements
                const heroElements = document.querySelectorAll('.hero .fade-up');
                heroElements.forEach(el => el.classList.add('visible'));
            }, 900);
        });
    }

    // 3. Background Music Logic
    const musicPlayer = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;
    
    // Auto-play attempt on first interaction with the document (browsers block autoplay without interaction)
    const startAudioOnFirstInteraction = () => {
        if (!isPlaying) {
            bgMusic.volume = 0.5; // Soft volume
            bgMusic.play().then(() => {
                isPlaying = true;
                musicPlayer.classList.add('playing');
            }).catch(e => console.log("Autoplay blocked. User needs to click play manually."));
        }
        document.removeEventListener('click', startAudioOnFirstInteraction);
        document.removeEventListener('scroll', startAudioOnFirstInteraction);
    };

    document.addEventListener('click', startAudioOnFirstInteraction, { once: true });
    document.addEventListener('scroll', startAudioOnFirstInteraction, { once: true });

    // Manual toggle
    musicPlayer.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent triggering the document click again
        if (isPlaying) {
            bgMusic.pause();
            musicPlayer.classList.remove('playing');
            isPlaying = false;
        } else {
            bgMusic.volume = 0.5;
            bgMusic.play();
            musicPlayer.classList.add('playing');
            isPlaying = true;
        }
    });

    // 3. Guestbook Logic (Local Storage)
    const wishForm = document.getElementById('wish-form');
    const wishesList = document.getElementById('wishes-list');
    const STORAGE_KEY = 'quynhchi_graduation_wishes_v2';

    // Mock initial data if empty
    const defaultWishes = [
        {
            name: "Anh Hùng",
            message: "Chúc mừng em gái tốt nghiệp! Chúc em chặng đường sắp tới luôn rực rỡ và thành công nhé.",
            time: new Date().toISOString()
        }
    ];

    function loadWishes() {
        const savedWishes = localStorage.getItem(STORAGE_KEY);
        let wishes = savedWishes ? JSON.parse(savedWishes) : defaultWishes;
        if (!savedWishes) localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
        renderWishes(wishes);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function renderWishes(wishes) {
        wishesList.innerHTML = '';
        const sortedWishes = [...wishes].sort((a, b) => new Date(b.time) - new Date(a.time));

        if (sortedWishes.length === 0) return;

        sortedWishes.forEach(wish => {
            const wishEl = document.createElement('div');
            wishEl.className = 'wish-item';
            wishEl.innerHTML = `
                <div class="wish-header">
                    <span class="wish-author">${escapeHTML(wish.name)}</span>
                    <span class="wish-time">${formatDate(wish.time)}</span>
                </div>
                <div class="wish-content">
                    "${escapeHTML(wish.message).replace(/\n/g, '<br>')}"
                </div>
            `;
            wishesList.appendChild(wishEl);
        });
    }

    wishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('sender-name');
        const messageInput = document.getElementById('message');
        const submitBtn = wishForm.querySelector('.btn-primary');
        const originalBtnContent = submitBtn.innerHTML;
        
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();
        
        if (!name || !message) return;

        // Loading state
        submitBtn.innerHTML = '<span>Đang gửi...</span>';
        submitBtn.style.opacity = '0.7';
        submitBtn.disabled = true;

        setTimeout(() => {
            const newWish = { name, message, time: new Date().toISOString() };
            const currentWishes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            currentWishes.push(newWish);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentWishes));

            renderWishes(currentWishes);
            wishForm.reset();
            
            // Success state
            submitBtn.innerHTML = '<span>Gửi thành công! 🎉</span>';
            submitBtn.style.opacity = '1';
            submitBtn.style.background = '#8A3B49'; // darker rose
            
            createElegantConfetti();

            setTimeout(() => {
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
            
        }, 800);
    });

    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // 4. Elegant Confetti (Rose Gold / Pastel colors)
    function createElegantConfetti() {
        const colors = ['#D67D89', '#D4AF37', '#FAF5F5', '#E8D5D8']; // Rose gold, gold, white, blush
        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = Math.random() > 0.5 ? '8px' : '12px';
            confetti.style.height = Math.random() > 0.5 ? '8px' : '12px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            confetti.style.top = '-10px';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.opacity = Math.random() + 0.6;
            confetti.style.zIndex = '9999';
            confetti.style.pointerEvents = 'none';
            document.body.appendChild(confetti);

            const duration = Math.random() * 2 + 2; // 2-4s
            confetti.animate([
                { transform: `translate3d(0, 0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate3d(${Math.random()*150 - 75}px, 100vh, 0) rotate(${Math.random()*720}deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(.37,0,.63,1)',
                fill: 'forwards'
            });

            setTimeout(() => confetti.remove(), duration * 1000);
        }
    }

    // 5. Countdown Timer Logic
    const targetDate = new Date('2026-08-22T10:00:00+07:00').getTime();
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');
    const statusEl = document.getElementById('countdown-status');

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            if (daysEl) daysEl.textContent = '00';
            if (hoursEl) hoursEl.textContent = '00';
            if (minutesEl) minutesEl.textContent = '00';
            if (secondsEl) secondsEl.textContent = '00';
            if (statusEl) statusEl.textContent = '🎉 Giây phút tốt nghiệp rực rỡ đã đến! Chúc mừng tân cử nhân! 🎓✨';
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // 6. Navigation Bar Scrollspy Logic
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('main > header, main > section');

    function updateActiveNavLink() {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 140; // Offset for floating navbar

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${currentSectionId}`) {
                    item.classList.add('active');
                }
            });
        }
    }

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });

    loadWishes();
});
