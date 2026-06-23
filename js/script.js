gsap.registerPlugin(ScrollTrigger);

/* ── Lenis 스무스 스크롤 ── */
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);


/* ── Nav 스크롤 ── */
lenis.on('scroll', (e) => {
    const scroll = e.scroll;
    const header = document.querySelector("#header");

    if (scroll <= 0) {
        header.classList.remove("hide");
        return;
    }

    if (e.velocity > 0) {
        header.classList.add("hide");
    } else if (e.velocity < 0) {
        header.classList.remove("hide");
    }
});

/* ── 패밀리사이트 ── */
$(function () {
    $('.family_btn').on('click', function (e) {
        e.stopPropagation();
        $('.family_site').toggleClass('is_active');
    });
    $(document).on('click', function () {
        $('.family_site').removeClass('is_active');
    });
});


/* ── DOM 준비 후 전부 실행 ── */
window.addEventListener("DOMContentLoaded", () => {

    // ScrollTrigger에게 스크롤 proxy를 Lenis로 지정 ← 핵심
    ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
            if (arguments.length) {
                lenis.scrollTo(value, {
                    immediate: true
                });
            }
            return lenis.scroll;
        },
        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
        },
    });

    lenis.on('scroll', () => ScrollTrigger.update());

    // ── about 하이라이트 ──
    const about_highlight = document.querySelector(".about_highlight");
    const about_title = document.querySelector(".about_title");

    if (about_highlight && about_title) {
        lenis.on('scroll', () => {
            const rect = about_title.getBoundingClientRect();
            const start = window.innerHeight * 0.55;
            const end = window.innerHeight * 0.2;
            let progress = (start - rect.top) / (start - end);
            progress = Math.max(0, Math.min(progress, 1));
            about_highlight.style.setProperty("--highlight_scale", progress);
        });
    }

    // ── Business ──
    const business_section = document.querySelector(".business_section");
    if (business_section) {
        lenis.on('scroll', function () {
            const rect = business_section.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.65) {
                business_section.classList.add("is_active");
            } else {
                business_section.classList.remove("is_active");
            }
        });
    }



    // ── Reason 카드 ──
    initReason();

    // ScrollTrigger 전체 새로고침 (Lenis proxy 등록 후 필수)
    ScrollTrigger.refresh();
});


/* ── reason 카드 이미지 축소 애니메이션 ── */
function initReason() {
    const cards = gsap.utils.toArray('.reason_card');
    if (!cards.length) return;

    cards.forEach((card, index) => {
        const imgWrap = card.querySelector('.reason_img');
        if (!imgWrap) return;

        // 같은 행의 첫 번째 카드를 트리거로 사용
        const rowStart = Math.floor(index / 3) * 3;
        const triggerCard = cards[rowStart];

        // 열 순서만큼 start를 늦춤 (0, 5%, 10%)
        const colOffset = (index % 3) * 5;

        gsap.fromTo(imgWrap, {
            height: '785px'
        }, {
            height: '464px',
            ease: 'none',
            scrollTrigger: {
                trigger: triggerCard,
                start: `top ${50 - colOffset}%`,
                end: `top ${20 - colOffset}%`,
                scrub: 1,
            }
        });
    });
}





/* ===========================
    서비스가 만들어지는 과정
   =========================== */

(function () {

    const STEPS = 6;
    const CANVAS_W = 1440;
    const CANVAS_H = 120;
    const DOT_COLOR = '#F5A233';
    const LINE_COLOR = 'rgba(255,255,255,4)';
    const BEND_MAX = 46;
    const BASE_Y = 68;

    const canvas = document.getElementById('process_canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const items = Array.from(document.querySelectorAll('.process_item'));
    const textItems = Array.from(document.querySelectorAll('.process_texts li'));
    const section = document.querySelector('.process_section');

    let currentStep = 0;
    let bendProgress = 0;

    function stepX(index, W) {
        const slot = W / STEPS;
        return slot * index + slot / 2;
    }

    function draw() {
        const rect = canvas.getBoundingClientRect();
        const W = rect.width;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = W * dpr;
        canvas.height = CANVAS_H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.clearRect(0, 0, W, CANVAS_H);

        const ax = stepX(currentStep, W);
        const bendH = BEND_MAX * bendProgress;
        const span = W * 0.07;

        /* ─ 라인 ─ */
        ctx.beginPath();
        ctx.moveTo(0, BASE_Y);
        ctx.lineTo(ax - span, BASE_Y);
        ctx.bezierCurveTo(
            ax - span * 0.45, BASE_Y,
            ax - span * 0.45, BASE_Y - bendH,
            ax, BASE_Y - bendH
        );
        ctx.bezierCurveTo(
            ax + span * 0.45, BASE_Y - bendH,
            ax + span * 0.45, BASE_Y,
            ax + span, BASE_Y
        );
        ctx.lineTo(W, BASE_Y);
        ctx.strokeStyle = LINE_COLOR;
        ctx.lineWidth = 3;
        ctx.stroke();

        /* ─ dots ─ */
        items.forEach((_, i) => {
            const x = stepX(i, W);
            const isActive = i === currentStep;

            if (isActive) {
                const dotY = BASE_Y - bendH;

                /* glow */
                ctx.beginPath();
                ctx.arc(x, dotY, 18 * bendProgress + 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(245, 162, 51, ${0.13 * bendProgress})`;
                ctx.fill();

                /* dot */
                ctx.beginPath();
                ctx.arc(x, dotY, 10, 0, Math.PI * 2);
                ctx.fillStyle = DOT_COLOR;
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(x, BASE_Y, 9, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(153,153,153,1)';
                ctx.fill();
            }
        });
    }

    function setStep(index) {
        currentStep = index;
        items.forEach((item, i) => item.classList.toggle('is_active', i === index));
        textItems.forEach((li, i) => li.classList.toggle('is_active', i === index));
    }

    function initScrollTrigger() {
        if (!window.gsap || !window.ScrollTrigger) {
            console.warn('GSAP / ScrollTrigger 로드 필요');
            return;
        }
        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: `+=${STEPS * 700}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.8,
            onUpdate(self) {
                const raw = self.progress * STEPS;
                const step = Math.min(Math.floor(raw), STEPS - 1);
                const frac = raw - Math.floor(raw);

                let bend;
                if (step === STEPS - 1) {
                    bend = 1;
                } else if (frac < 0.2) {
                    bend = frac / 0.2;
                } else if (frac < 0.8) {
                    bend = 1;
                } else {
                    bend = 1 - (frac - 0.8) / 0.2;
                }

                if (step !== currentStep) setStep(step);
                bendProgress = bend;
                draw();
            }
        });
    }

    function init() {
        setStep(0);
        bendProgress = 1;
        draw();
        initScrollTrigger();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('resize', draw);

})();


/* ===========================
   Contact Section JS
   =========================== */

(function () {

    /* 이메일 도메인 직접입력 토글 */
    const domainSelect = document.querySelector('select[name="email_domain"]');
    const domainDirect = document.getElementById('email_domain_direct');

    if (domainSelect && domainDirect) {
        domainSelect.addEventListener('change', function () {
            if (this.value === 'direct') {
                domainDirect.classList.add('is_visible');
                domainDirect.focus();
            } else {
                domainDirect.classList.remove('is_visible');
                domainDirect.value = '';
            }
        });
    }

})();