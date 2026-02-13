/* ============================================
   VALENTINE - CHERRY BLOSSOM HEART
   + Music + Typing + Photo Slideshow
   ============================================ */

/* ======= 📸 CẤU HÌNH ẢNH Ở ĐÂY ======= */
/* Thêm tên file ảnh vào đây (hỗ trợ .jpg, .png, .gif) */
/* Đặt các file ảnh vào cùng thư mục valentine            */
const PHOTOS = [
    'photo1.jpg',
    'photo2.jpg',
    'photo3.jpg',
    'photo4.jpg',
    'photo3.gif',
    'photo7.gif',
    'photo5.gif',
    'photo6.gif',
    'photo8.gif',
    'photo9.gif',
    'photo10.gif',
    'photo11.gif',
    'photo12.gif',
    'photo13.gif'
];
/* ======================================== */

(function () {
    const startScreen = document.getElementById('startScreen');
    const loadingScreen = document.getElementById('loadingScreen');
    const startBtn = document.getElementById('startBtn');
    const webcam = document.getElementById('webcam');
    const bgCanvas = document.getElementById('bgCanvas');
    const fxCanvas = document.getElementById('fxCanvas');
    const sceneContainer = document.getElementById('sceneContainer');
    const heartWrapper = document.getElementById('heartWrapper');
    const instruction = document.getElementById('instruction');
    const handIndicator = document.getElementById('handIndicator');
    const handStatus = document.getElementById('handStatus');
    const messageContainer = document.getElementById('messageContainer');
    const bgMusic = document.getElementById('bgMusic');
    const bgCtx = bgCanvas.getContext('2d');
    const fxCtx = fxCanvas.getContext('2d');

    const S = { IDLE: 0, HAND_SEEN: 1, FIST: 2, BLOOM: 3, DONE: 4 };
    let state = S.IDLE;
    let gestureFrames = 0;
    const CONFIRM = 8;
    let fistHoldTimer = 0;
    const FIST_HOLD_NEED = 25;
    let hasRevealedOnce = false;

    const CHERRY_COLS = ['#ffb3c6', '#ff8fab', '#ffc2d1', '#ffccd5', '#ff99ac', '#ffa5b8', '#ff85a1', '#ffd6e0', '#ff7096', '#ffadc6'];
    const PINKS = ['#ffb3c6', '#ff8fab', '#ff6b8a', '#ff4d6d', '#ffccd5', '#ff99ac', '#ffc2d1', '#ff85a1'];

    // ============================================
    //  TYPING EFFECT DATA
    // ============================================
    const TYPING_STEPS = [
        { el: 'valentineText', text: 'Happy Valentine\'s Day', delay: 0 },
        { el: 'nameText', text: 'Trần Đỗ My', delay: 600 },
        { el: 'heartDivider', skip: true, delay: 400 },
        { el: 'loveMessage', text: 'Helu Zợ iu, lại là anh nè. Thì hôm nay là ngày đặc biệt đối zới em nên anh mún tặng món quà nì cho em hehe, tuy là nó không được xịn xò như người ta nhưng mà trông cũng ra gì phết keke. Thứ nhất là anh củm ưn zợ đã đến với anh khi trong tay anh chẳng có gì, ngoài ra còn báo đời zợ phải lo ngược lại cho anh về những vấn đề của anh nữa, thậm chí nhiều lúc anh cũng tự hỏi là sao em có thể làm được điều đó hay zị, zợ thương iu quan tâm anh nhìu lúm, nhất là mấy lúc anh ốm bệnh thì zợ lo hoàn toàn lun, nên là anh iu zợ nhiều lúm, nói đi cũng phải nói lại, anh cũng xin lỗi zợ vì những lần anh đã làm em bùn, nhưng mà em yên tâm đi vì hiện giờ anh đang cố gắng thay đổi để có thể đem lại nìm zui cho em, mặc dù nhiều lần anh chọc em chửi nhưng đó là anh mún :)) tại chọc em chửi dui lúm. Nói tóm lại là anh iu em gấc nhìu, siu nhìu, cực kì nhìu, iu em cỡ vô cực không có giới hạn hehe. Chúc em một ngày Valentine thiệc là dui và hạnh phúc, đừng buồn vì những chuyện không đáng nhe zợ, có anh gòi. 💕', delay: 500 },
        { el: 'dateText', text: '14 ✦ 02 ✦ 2026', delay: 400 },
    ];

    // ============================================
    //  PHOTO SLIDESHOW
    // ============================================
    let slideIndex = 0;
    let slideTimer = null;
    let loadedPhotos = [];

    function initSlideshow() {
        const border = document.getElementById('photoBorder');
        const dots = document.getElementById('photoDots');
        const frame = document.getElementById('photoFrame');
        if (!border || PHOTOS.length === 0) { if (frame) frame.style.display = 'none'; return; }

        let loaded = 0, failed = 0;
        PHOTOS.forEach((src, i) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'My Love ' + (i + 1);
            img.onload = () => {
                loaded++;
                loadedPhotos.push({ img, index: i });
                border.appendChild(img);
                if (loaded === 1) img.classList.add('active'); // first loaded = show
                buildDots();
            };
            img.onerror = () => {
                failed++;
                if (failed === PHOTOS.length) frame.style.display = 'none';
            };
        });
    }

    function buildDots() {
        const dots = document.getElementById('photoDots');
        dots.innerHTML = '';
        if (loadedPhotos.length <= 1) return;
        loadedPhotos.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'photo-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(i));
            dots.appendChild(dot);
        });
    }

    function goToSlide(i) {
        if (loadedPhotos.length <= 1) return;
        const border = document.getElementById('photoBorder');
        const imgs = border.querySelectorAll('img');
        const dots = document.querySelectorAll('.photo-dot');
        imgs.forEach(img => img.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slideIndex = i % loadedPhotos.length;
        loadedPhotos[slideIndex].img.classList.add('active');
        if (dots[slideIndex]) dots[slideIndex].classList.add('active');
    }

    function nextSlide() { goToSlide(slideIndex + 1); }

    function startSlideshow() {
        if (loadedPhotos.length <= 1) return;
        slideTimer = setInterval(nextSlide, 3500);
        // Click to advance
        const border = document.getElementById('photoBorder');
        border.addEventListener('click', () => {
            clearInterval(slideTimer);
            nextSlide();
            slideTimer = setInterval(nextSlide, 3500);
        });
    }

    // ============================================
    //  PARAMETRIC HEART
    // ============================================
    let cherries = [];
    let heartTargets = [];

    function heartPoint(t, r) {
        return {
            x: 16 * Math.pow(Math.sin(t), 3) * r,
            y: (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r
        };
    }

    function recomputeTargets() {
        const cx = fxCanvas.width / 2;
        const cy = fxCanvas.height / 2;
        const scale = Math.min(fxCanvas.width, fxCanvas.height) * 0.013;
        const yOff = -6 * scale;
        heartTargets = [];

        const LAYERS = 25;
        for (let li = 1; li <= LAYERS; li++) {
            const r = li / LAYERS;
            const pts = Math.max(12, Math.round(55 * r));
            for (let i = 0; i < pts; i++) {
                const t = (i / pts) * Math.PI * 2;
                const p = heartPoint(t, r);
                heartTargets.push({
                    x: cx + p.x * scale + (Math.random() - 0.5) * 2,
                    y: cy - p.y * scale - yOff + (Math.random() - 0.5) * 2
                });
            }
        }
        for (let i = 0; i < 80; i++) {
            const t = (i / 80) * Math.PI * 2;
            const r = 0.94 + Math.random() * 0.06;
            const p = heartPoint(t, r);
            heartTargets.push({
                x: cx + p.x * scale + (Math.random() - 0.5) * 1.5,
                y: cy - p.y * scale - yOff + (Math.random() - 0.5) * 1.5
            });
        }

        cherries.forEach((c, i) => {
            if (heartTargets[i]) { c.tx = heartTargets[i].x; c.ty = heartTargets[i].y; }
        });
    }

    function resize() {
        bgCanvas.width = fxCanvas.width = window.innerWidth;
        bgCanvas.height = fxCanvas.height = window.innerHeight;
        recomputeTargets();
    }
    resize();
    window.addEventListener('resize', resize);

    function spawnCherries() {
        const w = fxCanvas.width, h = fxCanvas.height;
        recomputeTargets();
        cherries = [];
        for (let i = 0; i < heartTargets.length; i++) {
            cherries.push({
                x: Math.random() * w, y: Math.random() * h,
                tx: heartTargets[i].x, ty: heartTargets[i].y,
                vx: (Math.random() - 0.5) * 0.5, vy: -(Math.random() * 0.3 + 0.08),
                size: Math.random() * 4 + 7, rot: Math.random() * Math.PI * 2,
                rotSpd: (Math.random() - 0.5) * 0.018,
                color: CHERRY_COLS[Math.floor(Math.random() * CHERRY_COLS.length)],
                opacity: Math.random() * 0.1 + 0.9, wobble: Math.random() * Math.PI * 2, conv: 0
            });
        }
    }

    // ============================================
    //  CHERRY UPDATE & DRAW
    // ============================================
    let cherryVisible = true;

    function updateCherries() {
        if (!cherryVisible || cherries.length === 0) return;
        const w = fxCanvas.width, h = fxCanvas.height;
        const cx = w / 2, cy = h / 2;
        const converging = (state === S.FIST);
        const now = Date.now() * 0.005;
        const beat = 1 + 0.045 * Math.sin(now);

        for (const c of cherries) {
            if (converging) c.conv = Math.min(1, c.conv + 0.012);
            else if (state < S.BLOOM) c.conv = Math.max(0, c.conv - 0.018);

            if (c.conv > 0.01) {
                const btx = cx + (c.tx - cx) * beat, bty = cy + (c.ty - cy) * beat;
                const dx = btx - c.x, dy = bty - c.y;
                const d = Math.sqrt(dx * dx + dy * dy) || 1;
                const spd = 0.01 + c.conv * 0.04, spiral = (1 - c.conv * c.conv) * 0.5;
                c.x += dx * spd + (-dy / d) * spiral;
                c.y += dy * spd + (dx / d) * spiral;
            } else {
                c.wobble += 0.006;
                c.x += c.vx + Math.sin(c.wobble) * 0.3; c.y += c.vy;
                if (c.y < -25) { c.y = h + 25; c.x = Math.random() * w; }
                if (c.x < -30) c.x = w + 25; if (c.x > w + 30) c.x = -25;
            }

            c.rot += c.rotSpd * (1 - c.conv * 0.85);

            fxCtx.save(); fxCtx.translate(c.x, c.y); fxCtx.rotate(c.rot);
            fxCtx.globalAlpha = c.opacity; fxCtx.fillStyle = c.color;
            const s = c.size;
            fxCtx.beginPath(); fxCtx.moveTo(0, 0);
            fxCtx.bezierCurveTo(s * 0.5, -s * 0.3, s * 0.6, -s * 0.9, 0, -s * 1.05);
            fxCtx.bezierCurveTo(-s * 0.6, -s * 0.9, -s * 0.5, -s * 0.3, 0, 0); fxCtx.fill();
            fxCtx.globalAlpha = c.opacity * 0.2; fxCtx.fillStyle = '#fff';
            fxCtx.beginPath(); fxCtx.arc(s * 0.07, -s * 0.38, s * 0.12, 0, Math.PI * 2); fxCtx.fill();
            fxCtx.restore();
        }

        if (converging && cherries.length && cherries[0].conv > 0.5) {
            const p = cherries[0].conv;
            const glowR = Math.min(w, h) * 0.22 * beat;
            fxCtx.save();
            const g = fxCtx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
            g.addColorStop(0, `rgba(255,77,109,${0.2 * p})`);
            g.addColorStop(0.5, `rgba(255,143,171,${0.07 * p})`);
            g.addColorStop(1, 'transparent');
            fxCtx.fillStyle = g; fxCtx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
            fxCtx.restore();

            for (let i = 0; i < 12; i++) {
                const a = now * 0.5 + (i / 12) * Math.PI * 2;
                const r = glowR * 0.65 + Math.sin(now + i * 1.2) * 12;
                const sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * r;
                const sz = 1.5 + Math.sin(now * 0.8 + i * 2) * 1.5;
                if (sz < 0.5) continue;
                fxCtx.save(); fxCtx.globalAlpha = (0.25 + Math.sin(now + i) * 0.25) * p;
                fxCtx.fillStyle = '#fff'; fxCtx.shadowColor = '#fff'; fxCtx.shadowBlur = 5;
                fxCtx.beginPath(); fxCtx.arc(sx, sy, sz, 0, Math.PI * 2); fxCtx.fill(); fxCtx.restore();
            }
        }
    }

    // ============================================
    //  EXPLOSION + RAIN
    // ============================================
    let exPetals = [], heartRain = [];

    class ExPetal {
        constructor(x, y) {
            this.x = x; this.y = y; const a = Math.random() * Math.PI * 2, sp = Math.random() * 12 + 4;
            this.vx = Math.cos(a) * sp; this.vy = Math.sin(a) * sp - 3; this.rot = Math.random() * Math.PI * 2;
            this.rSpd = (Math.random() - 0.5) * 0.15; this.sz = Math.random() * 18 + 6; this.life = 1;
            this.decay = Math.random() * 0.004 + 0.001; this.col = PINKS[Math.floor(Math.random() * PINKS.length)];
            this.w = Math.random() * Math.PI * 2;
        }
        update() {
            this.vy += 0.05; this.vx *= 0.993; this.vy *= 0.993; this.w += 0.02; this.vx += Math.sin(this.w) * 0.06;
            this.x += this.vx; this.y += this.vy; this.rot += this.rSpd; this.life -= this.decay;
        }
        draw() {
            if (this.life <= 0) return; fxCtx.save(); fxCtx.translate(this.x, this.y); fxCtx.rotate(this.rot);
            fxCtx.globalAlpha = Math.max(0, this.life); fxCtx.fillStyle = this.col; const s = this.sz;
            fxCtx.beginPath(); fxCtx.moveTo(0, 0);
            fxCtx.bezierCurveTo(s * 0.35, -s * 0.5, s, -s * 0.25, s * 0.5, s * 0.35);
            fxCtx.bezierCurveTo(s * 0.15, s * 0.55, -s * 0.25, s * 0.35, 0, 0); fxCtx.fill(); fxCtx.restore();
        }
        get alive() { return this.life > 0; }
    }

    class HDrop {
        constructor() {
            this.x = Math.random() * fxCanvas.width; this.y = -Math.random() * 50 - 10;
            this.sz = Math.random() * 10 + 4; this.sp = Math.random() * 1 + 0.4;
            this.wb = Math.random() * Math.PI * 2; this.ws = Math.random() * 0.015 + 0.005;
            this.op = Math.random() * 0.3 + 0.1; this.col = PINKS[Math.floor(Math.random() * PINKS.length)];
        }
        update() { this.y += this.sp; this.wb += this.ws; this.x += Math.sin(this.wb) * 0.5; return this.y < fxCanvas.height + 30; }
        draw() {
            fxCtx.save(); fxCtx.translate(this.x, this.y); fxCtx.globalAlpha = this.op; fxCtx.fillStyle = this.col;
            drawSmallHeart(fxCtx, 0, 0, this.sz); fxCtx.restore();
        }
    }

    function drawSmallHeart(c, cx, cy, s) {
        c.beginPath(); c.moveTo(cx, cy + s * 0.3);
        c.bezierCurveTo(cx, cy, cx - s / 2, cy, cx - s / 2, cy + s * 0.3);
        c.bezierCurveTo(cx - s / 2, cy + s * 0.6, cx, cy + s * 0.85, cx, cy + s);
        c.bezierCurveTo(cx, cy + s * 0.85, cx + s / 2, cy + s * 0.6, cx + s / 2, cy + s * 0.3);
        c.bezierCurveTo(cx + s / 2, cy, cx, cy, cx, cy + s * 0.3); c.fill();
    }

    // ============================================
    //  POST-REVEAL INTERACTIVE
    // ============================================
    let tapBursts = [], sparkles = [];

    class TapHeart {
        constructor(x, y) {
            this.x = x; this.y = y; const a = Math.random() * Math.PI * 2, sp = Math.random() * 5 + 2;
            this.vx = Math.cos(a) * sp; this.vy = Math.sin(a) * sp - 2; this.sz = Math.random() * 14 + 6;
            this.life = 1; this.decay = Math.random() * 0.015 + 0.005; this.rot = (Math.random() - 0.5) * 0.6;
            this.col = PINKS[Math.floor(Math.random() * PINKS.length)];
        }
        update() { this.vy += 0.06; this.x += this.vx; this.y += this.vy; this.vx *= 0.98; this.vy *= 0.98; this.life -= this.decay; }
        draw() {
            if (this.life <= 0) return; fxCtx.save(); fxCtx.translate(this.x, this.y); fxCtx.rotate(this.rot);
            fxCtx.globalAlpha = Math.max(0, this.life); fxCtx.fillStyle = this.col;
            drawSmallHeart(fxCtx, 0, 0, this.sz); fxCtx.restore();
        }
        get alive() { return this.life > 0; }
    }

    class Sparkle {
        constructor(x, y) {
            this.x = x + (Math.random() - 0.5) * 20; this.y = y + (Math.random() - 0.5) * 20;
            this.sz = Math.random() * 3 + 1; this.life = 1; this.decay = Math.random() * 0.03 + 0.015;
            this.col = CHERRY_COLS[Math.floor(Math.random() * CHERRY_COLS.length)];
        }
        update() { this.life -= this.decay; this.y -= 0.3; }
        draw() {
            if (this.life <= 0) return; fxCtx.save(); fxCtx.globalAlpha = this.life; fxCtx.fillStyle = this.col;
            fxCtx.shadowColor = '#fff'; fxCtx.shadowBlur = 4;
            fxCtx.beginPath(); fxCtx.arc(this.x, this.y, this.sz, 0, Math.PI * 2); fxCtx.fill(); fxCtx.restore();
        }
        get alive() { return this.life > 0; }
    }

    let interactiveEnabled = false;
    function initInteractive() {
        if (interactiveEnabled) return; interactiveEnabled = true;
        fxCanvas.style.pointerEvents = 'auto'; fxCanvas.style.cursor = 'pointer';
        function tap(x, y) { for (let i = 0; i < 12; i++) tapBursts.push(new TapHeart(x, y)); }
        fxCanvas.addEventListener('click', e => { if (state === S.DONE) tap(e.clientX, e.clientY); });
        fxCanvas.addEventListener('touchstart', e => {
            if (state !== S.DONE) return;
            for (const t of e.touches) tap(t.clientX, t.clientY);
        }, { passive: true });
        function spk(x, y) { if (state === S.DONE) for (let i = 0; i < 3; i++)sparkles.push(new Sparkle(x, y)); }
        fxCanvas.addEventListener('mousemove', e => spk(e.clientX, e.clientY));
        fxCanvas.addEventListener('touchmove', e => { for (const t of e.touches) spk(t.clientX, t.clientY); }, { passive: true });
    }

    // ============================================
    //  FX LOOP
    // ============================================
    function animFx() {
        fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
        updateCherries();
        exPetals = exPetals.filter(p => p.alive); exPetals.forEach(p => { p.update(); p.draw(); });
        if (state === S.DONE && !cherryVisible) {
            if (Math.random() > 0.9) heartRain.push(new HDrop());
            heartRain = heartRain.filter(h => h.update()); heartRain.forEach(h => h.draw());
        }
        tapBursts = tapBursts.filter(p => p.alive); tapBursts.forEach(p => { p.update(); p.draw(); });
        sparkles = sparkles.filter(p => p.alive); sparkles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animFx);
    }

    // ============================================
    //  BACKGROUND
    // ============================================
    let bgPs = [];
    class BgP {
        constructor() { this.init(); }
        init() {
            this.x = Math.random() * bgCanvas.width; this.y = Math.random() * bgCanvas.height;
            this.sz = Math.random() * 3 + 0.5; this.vy = -(Math.random() * 0.2 + 0.05);
            this.op = Math.random() * 0.12 + 0.03; this.col = PINKS[Math.floor(Math.random() * PINKS.length)];
            this.wb = Math.random() * Math.PI * 2;
        }
        update() {
            this.y += this.vy; this.wb += 0.005; this.x += Math.sin(this.wb) * 0.15;
            if (this.y < -10) { this.init(); this.y = bgCanvas.height + 10; }
        }
        draw() {
            bgCtx.save(); bgCtx.globalAlpha = this.op; bgCtx.fillStyle = this.col;
            bgCtx.beginPath(); bgCtx.arc(this.x, this.y, this.sz, 0, Math.PI * 2); bgCtx.fill(); bgCtx.restore();
        }
    }
    function initBg() {
        const n = Math.min(40, Math.floor(window.innerWidth * window.innerHeight / 25000));
        for (let i = 0; i < n; i++)bgPs.push(new BgP());
    }
    function animBg() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        bgPs.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animBg);
    }

    // ============================================
    //  MUSIC
    // ============================================
    function playMusic() {
        if (!bgMusic) return;
        bgMusic.volume = 0;
        const playPromise = bgMusic.play();
        if (playPromise) {
            playPromise.then(() => {
                // Fade in
                let vol = 0;
                const fadeIn = setInterval(() => {
                    vol += 0.02;
                    if (vol >= 0.5) { vol = 0.5; clearInterval(fadeIn); }
                    bgMusic.volume = vol;
                }, 100);
            }).catch(() => {
                // Browser blocked autoplay, try again on next user gesture
                document.addEventListener('click', () => bgMusic.play(), { once: true });
            });
        }
    }

    // ============================================
    //  TYPING ANIMATION
    // ============================================
    function typeText(element, text, speed, callback) {
        let i = 0;
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        element.appendChild(cursor);

        function type() {
            if (i < text.length) {
                const char = text[i];
                if (char === '\n') {
                    element.insertBefore(document.createElement('br'), cursor);
                } else {
                    element.insertBefore(document.createTextNode(char), cursor);
                }
                i++;
                setTimeout(type, speed);
            } else {
                // Remove cursor after done
                setTimeout(() => {
                    cursor.remove();
                    if (callback) callback();
                }, 500);
            }
        }
        type();
    }

    function revealMessage() {
        const items = messageContainer.querySelectorAll('.msg-item');
        let stepIndex = 0;

        function nextStep() {
            if (stepIndex >= TYPING_STEPS.length) return;
            const step = TYPING_STEPS[stepIndex];
            const el = document.getElementById(step.el);
            stepIndex++;

            // Show the element first
            el.classList.add('show');

            if (step.skip) {
                // Just reveal (like the heart divider)
                setTimeout(nextStep, step.delay || 300);
            } else {
                // Adjust speed for long messages
                const speed = step.text.length > 100 ? 25 : 55;
                typeText(el, step.text, speed, () => {
                    setTimeout(nextStep, step.delay || 300);
                });
            }
        }

        // Show photo first with fade in
        const photoFrame = document.getElementById('photoFrame');
        photoFrame.classList.add('show');
        startSlideshow(); // Start auto-rotating photos
        setTimeout(nextStep, 800);
    }

    // ============================================
    //  CAMERA + MEDIAPIPE
    // ============================================
    startBtn.addEventListener('click', async () => {
        startScreen.classList.add('hidden'); loadingScreen.classList.remove('hidden');
        playMusic(); // Start music on user gesture
        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } });
            webcam.srcObject = stream; await webcam.play(); initMediaPipe();
        } catch (err) {
            console.error('Camera error:', err); loadingScreen.classList.add('hidden');
            instruction.textContent = 'Camera không khả dụng — chạm vào trái tim 💕';
            heartWrapper.style.cursor = 'pointer';
            heartWrapper.addEventListener('click', () => triggerBloom());
        }
    });

    function initMediaPipe() {
        const hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
        hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.6, minTrackingConfidence: 0.5 });
        hands.onResults(onResults);
        const camera = new Camera(webcam, { onFrame: async () => { await hands.send({ image: webcam }); }, width: 640, height: 480 });
        camera.start().then(() => { loadingScreen.classList.add('hidden'); handIndicator.classList.add('visible'); });
    }

    // ============================================
    //  GESTURE
    // ============================================
    function countFingers(lm) {
        let n = 0;
        for (const [tip, pip] of [[8, 6], [12, 10], [16, 14], [20, 18]]) if (lm[tip].y < lm[pip].y) n++;
        if (Math.abs(lm[4].x - lm[2].x) > 0.04) n++; return n;
    }
    function isOpen(lm) { return countFingers(lm) >= 4; }
    function isFist(lm) { return countFingers(lm) <= 1; }

    // ============================================
    //  PROCESS RESULTS (repeatable!)
    // ============================================
    function onResults(results) {
        if (state === S.BLOOM) return;
        const lm = results.multiHandLandmarks;
        if (!lm || lm.length === 0) { handStatus.textContent = 'Đang chờ nhận diện...'; handIndicator.classList.remove('detected'); return; }
        const hand = lm[0];
        handStatus.textContent = '✓ Nhận diện được tay'; handIndicator.classList.add('detected');
        const open = isOpen(hand), fist = isFist(hand);

        switch (state) {
            case S.IDLE:
                if (open) {
                    gestureFrames++; if (gestureFrames >= CONFIRM) {
                        state = S.HAND_SEEN; gestureFrames = 0;
                        instruction.textContent = 'Nắm bàn tay lại ✊';
                        instruction.style.animation = 'none'; instruction.style.opacity = '1';
                    }
                } else gestureFrames = Math.max(0, gestureFrames - 1);
                break;
            case S.HAND_SEEN:
                if (fist) {
                    gestureFrames++; if (gestureFrames >= CONFIRM) {
                        state = S.FIST; gestureFrames = 0; fistHoldTimer = 0;
                        sceneContainer.classList.add('forming'); cherryVisible = true;
                        instruction.textContent = '💖 Hoa đang gộp thành trái tim...';
                    }
                } else gestureFrames = Math.max(0, gestureFrames - 1);
                break;
            case S.FIST:
                if (fist) {
                    fistHoldTimer++;
                    if (fistHoldTimer >= FIST_HOLD_NEED && cherries.length && cherries[0].conv > 0.7)
                        instruction.textContent = '✨ Bung tay ra nào! ✨';
                }
                if (open && fistHoldTimer >= FIST_HOLD_NEED && cherries.length && cherries[0].conv > 0.6) {
                    gestureFrames++; if (gestureFrames >= 5) triggerBloom();
                } else if (open && fistHoldTimer < FIST_HOLD_NEED) gestureFrames = 0;
                if (!fist && !open) gestureFrames = 0;
                break;
            case S.DONE:
                if (fist) {
                    gestureFrames++; if (gestureFrames >= CONFIRM) {
                        spawnCherries(); cherryVisible = true;
                        state = S.FIST; gestureFrames = 0; fistHoldTimer = 0;
                        handIndicator.classList.add('visible');
                        instruction.style.opacity = '1';
                        instruction.textContent = '💖 Hoa đang gộp thành trái tim...';
                    }
                } else gestureFrames = 0;
                break;
        }
    }

    // ============================================
    //  BLOOM
    // ============================================
    function triggerBloom() {
        if (state === S.BLOOM) return; state = S.BLOOM;
        instruction.style.opacity = '0'; handIndicator.classList.remove('visible');
        for (const c of cherries) exPetals.push(new ExPetal(c.x, c.y));
        const cx = fxCanvas.width / 2, cy = fxCanvas.height / 2;
        for (let i = 0; i < 120; i++) exPetals.push(new ExPetal(cx, cy));
        cherries = []; cherryVisible = false;
        setTimeout(() => {
            state = S.DONE; gestureFrames = 0;
            if (!hasRevealedOnce) {
                hasRevealedOnce = true;
                sceneContainer.classList.add('hidden');
                messageContainer.classList.add('visible');
                revealMessage(); initInteractive();
            }
        }, 900);
    }

    // ============================================
    //  INIT
    // ============================================
    initBg(); animBg();
    spawnCherries(); animFx();
    initSlideshow(); // Preload photos early
})();
