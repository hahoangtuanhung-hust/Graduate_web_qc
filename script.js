import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBS_hA2xSg_cafIRB0pmGevmZQ6X4gI-cU",
  authDomain: "graduate-qc.firebaseapp.com",
  projectId: "graduate-qc",
  storageBucket: "graduate-qc.firebasestorage.app",
  messagingSenderId: "326981237355",
  appId: "1:326981237355:web:86d7a7456a1fc69e69cf2e",
  measurementId: "G-BDH58YQ0HD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const wishesCol = collection(db, "wishes");

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

    // 3. Guestbook Logic (Firebase Firestore)
    const wishForm = document.getElementById('wish-form');
    const wishesList = document.getElementById('wishes-list');
    const paginationControls = document.getElementById('pagination-controls');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const pageInfo = document.getElementById('page-info');

    let allWishes = [];
    let currentPage = 1;
    const wishesPerPage = 5;

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function updatePagination() {
        const totalPages = Math.ceil(allWishes.length / wishesPerPage) || 1;
        
        pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
        
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages;

        if (totalPages <= 1) {
            paginationControls.style.display = 'none';
        } else {
            paginationControls.style.display = 'flex';
        }
    }

    function renderWishesPage() {
        wishesList.innerHTML = '';
        
        if (allWishes.length === 0) {
            wishesList.innerHTML = '<p style="text-align:center; color:var(--clr-text-secondary)">Hãy là người đầu tiên gửi lời chúc nhé! ✨</p>';
            if(paginationControls) paginationControls.style.display = 'none';
            return;
        }

        const startIndex = (currentPage - 1) * wishesPerPage;
        const endIndex = startIndex + wishesPerPage;
        const wishesToShow = allWishes.slice(startIndex, endIndex);

        wishesToShow.forEach(wish => {
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

        if(paginationControls) updatePagination();
    }

    if (btnPrev && btnNext) {
        btnPrev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderWishesPage();
                document.getElementById('wishes').scrollIntoView({ behavior: 'smooth' });
            }
        });

        btnNext.addEventListener('click', () => {
            const totalPages = Math.ceil(allWishes.length / wishesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderWishesPage();
                document.getElementById('wishes').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Real-time listener from Firestore
    wishesList.innerHTML = '<p style="text-align:center; color:var(--clr-text-secondary)">Đang tải lời chúc... 💌</p>';
    const q = query(wishesCol, orderBy("time", "desc"));
    
    onSnapshot(q, (snapshot) => {
        allWishes = [];
        snapshot.forEach((doc) => {
            allWishes.push(doc.data());
        });
        
        const newTotalPages = Math.ceil(allWishes.length / wishesPerPage) || 1;
        if (currentPage > newTotalPages) {
            currentPage = newTotalPages;
        }
        
        renderWishesPage();
    }, (error) => {
        console.error("Lỗi khi tải lời chúc từ Firebase: ", error);
        wishesList.innerHTML = '<p style="text-align:center; color:#D67D89">Chưa thể kết nối máy chủ Firebase. Bạn vui lòng thử lại sau nhé!</p>';
    });

    wishForm.addEventListener('submit', async (e) => {
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

        try {
            await addDoc(wishesCol, {
                name: name,
                message: message,
                time: new Date().toISOString()
            });

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
            
        } catch (error) {
            console.error("Lỗi khi gửi lời chúc: ", error);
            submitBtn.innerHTML = '<span>Lỗi kết nối! Thử lại</span>';
            submitBtn.style.opacity = '1';
            setTimeout(() => {
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.disabled = false;
            }, 3000);
        }
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
});
