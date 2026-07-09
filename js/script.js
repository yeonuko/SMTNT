gsap.registerPlugin(ScrollTrigger);

gsap.registerPlugin(ScrollTrigger, Flip);

/* ── Lenis 스무스 스크롤 ── */
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    wheelMultiplier: 0.8,
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


/* ── nav 패밀리사이트 Dropdown ── */
function initFamilySite() {
    const wrap = document.querySelector(".family_site_wrap");
    const btn = document.querySelector(".family_site");

    if (!wrap || !btn) return;

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        wrap.classList.toggle("is_open");
    });

    document.addEventListener("click", (e) => {
        if (!wrap.contains(e.target)) {
            wrap.classList.remove("is_open");
        }
    });

    window.addEventListener("scroll", () => {
        wrap.classList.remove("is_open");
    });
}

initFamilySite();




/* ── 메인화면 스크롤 ── */
ScrollTrigger.create({
    trigger: ".main_visual",
    start: "top top",
    end: "bottom bottom",
    pin: ".main_video",
    pinSpacing: false
});

ScrollTrigger.create({
    trigger: ".main_visual",
    start: "top top",
    end: "bottom bottom",
    pin: ".main_dim",
    pinSpacing: false
});

function initMainIntro() {
    const intro = document.querySelector(".main_intro");
    const mainDim = document.querySelector(".main_dim");
    const targetText = document.querySelector(".main_intro_title em");

    if (!intro || !mainDim || !targetText) return;

    const text = targetText.textContent;
    targetText.innerHTML = "";

    text.split("").forEach((char) => {
        const span = document.createElement("span");

        span.textContent = char === " " ? "\u00A0" : char;
        span.style.color = "rgba(255, 255, 255, 0.25)";

        targetText.appendChild(span);
    });

    const chars = targetText.querySelectorAll("span");

    gsap.timeline({
            scrollTrigger: {
                trigger: intro,
                start: "top center",
                end: "center center",
                scrub: true,
            },
        })
        .to(mainDim, {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            ease: "none",
        }, 0)
        .to(chars, {
            color: "rgba(255, 255, 255, 1)",
            stagger: 0.08,
            ease: "none",
        }, 0);
}

initMainIntro();




/* ── 운영중인 서비스 가로스크롤 ── */
function initServiceHorizontal() {
    const section = document.querySelector(".service_section");
    const horizontal = document.querySelector(".service_horizontal");
    const panels = gsap.utils.toArray(".service_panel:not(.service_intro)");

    if (!section || !horizontal) return;

    function getScrollAmount() {
        return horizontal.scrollWidth - window.innerWidth;
    }

    const horizontalTween = gsap.to(horizontal, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getScrollAmount()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1
        }
    });

    panels.forEach((panel) => {
        const thumb = panel.querySelector(".service_thumb");
        const info = panel.querySelector(".service_info");

        gsap.fromTo([thumb, info], {
            y: 50,
            opacity: 0.4
        }, {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
                trigger: panel,
                containerAnimation: horizontalTween,
                start: "left 95%",
                end: "left 65%",
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
    });
}

initServiceHorizontal();















/* ── Our Solution Orbit ── */
/* ── Our Solution Orbit ── */
function initSolutionOrbit() {
    const section = document.querySelector(".solution_section");
    const leftCards = gsap.utils.toArray(".solution_orbit_left .solution_card");
    const rightCards = gsap.utils.toArray(".solution_orbit_right .solution_card");
    const words = gsap.utils.toArray(".solution_word");

    if (!section || (!leftCards.length && !rightCards.length) || !words.length) return;

    function setActiveGroup(group) {
        words.forEach((word) => {
            word.classList.toggle("is_active", !!group && word.dataset.group === group);
        });
    }

    function getOrbitValue(side, angle) {
        const rad = angle * Math.PI / 180;

        const centerX = side === "left" ?
            window.innerWidth * -0.08 :
            window.innerWidth * 1.08;

        const centerY = window.innerHeight * 0.5;
        const radiusX = window.innerWidth * 0.65;
        const radiusY = window.innerHeight * 0.72;

        return {
            x: centerX + Math.cos(rad) * radiusX - window.innerWidth / 2,
            y: centerY + Math.sin(rad) * radiusY - window.innerHeight / 2
        };
    }

    const orbitCards = [];
    const maxLength = Math.max(leftCards.length, rightCards.length);

    for (let i = 0; i < maxLength; i++) {
        if (leftCards[i]) orbitCards.push({
            card: leftCards[i],
            side: "left"
        });
        if (rightCards[i]) orbitCards.push({
            card: rightCards[i],
            side: "right"
        });
    }

    gsap.set(orbitCards.map(item => item.card), {
        xPercent: -50,
        yPercent: -50,
        opacity: 0
    });

    setActiveGroup(null);

    const invertTime = 0.12; // 색 반전 타이밍
    const cardStartTime = 0.32; // 카드 시작 타이밍
    const cardGap = 0.05; // 카드 간격
    const cardDuration = 0.28; // 카드 속도
    const focusDelay = cardDuration * 0.5;
    const totalTime = cardStartTime + orbitCards.length * cardGap + cardDuration;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=7500",
            pin: true,
            scrub: 1,
            anticipatePin: 1,

            onUpdate() {
                const time = tl.time();

                if (time < cardStartTime + focusDelay) {
                    setActiveGroup(null);
                    return;
                }

                const activeIndex = Math.min(
                    orbitCards.length - 1,
                    Math.max(0, Math.floor((time - cardStartTime - focusDelay) / cardGap))
                );

                setActiveGroup(orbitCards[activeIndex].card.dataset.group);
            }
        }
    });

    tl.set(section, {
        backgroundColor: "#333333"
    }, invertTime);

    tl.set([".solution_label", ".solution_desc", ".solution_word"], {
        color: "#000000"
    }, invertTime);

    orbitCards.forEach((item, index) => {
        const card = item.card;
        const side = item.side;
        const start = cardStartTime + index * cardGap;

        const startAngle = side === "left" ? -62 : 242;
        const endAngle = side === "left" ? 72 : 112;
        const proxy = {
            angle: startAngle
        };

        tl.to(proxy, {
            angle: endAngle,
            duration: cardDuration,
            ease: "none",

            onUpdate() {
                const pos = getOrbitValue(side, proxy.angle);

                gsap.set(card, {
                    x: pos.x,
                    y: pos.y
                });
            }
        }, start);

        tl.to(card, {
            opacity: 1,
            duration: 0.06,
            ease: "none"
        }, start);

        tl.to(card, {
            opacity: 0,
            duration: 0.06,
            ease: "none"
        }, start + cardDuration - 0.06);
    });

    tl.to({}, {
        duration: totalTime
    }, 0);
}

initSolutionOrbit();


/* ── Our Solution Mouse Parallax ── */
function initSolutionParallax() {
    const section = document.querySelector(".solution_section");
    const items = gsap.utils.toArray(".solution_deco_item");

    if (!section || !items.length) return;

    const setters = items.map((item) => {
        const depth = Number(item.dataset.depth) || 0.5;

        return {
            item,
            depth,

            xTo: gsap.quickTo(item, "x", {
                duration: depth > 1 ? 0.5 : 1.4,
                ease: "power3.out"
            }),

            yTo: gsap.quickTo(item, "y", {
                duration: depth > 1 ? 0.5 : 1.4,
                ease: "power3.out"
            }),

            rotateTo: gsap.quickTo(item, "rotate", {
                duration: 1,
                ease: "power3.out"
            })
        };
    });


    section.addEventListener("mousemove", (e) => {
        const rect = section.getBoundingClientRect();

        const nx =
            (e.clientX - rect.left) / rect.width - 0.5;
        const ny =
            (e.clientY - rect.top) / rect.height - 0.5;
        setters.forEach(({
            depth,
            xTo,
            yTo,
            rotateTo
        }) => {

            let moveX;
            let moveY;


            /* 가까운 요소 */

            if (depth > 1) {
                moveX = -nx * 240 * depth;
                moveY = -ny * 180 * depth;
            }


            /* 중간 요소 */
            else if (depth > 0.4) {
                moveX = -nx * 150 * depth;
                moveY = -ny * 110 * depth;
            }


            /* 먼 요소 */
            else {
                moveX = nx * 120;
                moveY = ny * 90;
            }
            xTo(moveX);
            yTo(moveY);
            rotateTo(nx * depth * 12);

        });
    });


    section.addEventListener("mouseleave", () => {

        setters.forEach(({
            xTo,
            yTo,
            rotateTo
        }) => {
            xTo(0);
            yTo(0);
            rotateTo(0);
        });

    });
}

initSolutionParallax();






/* ── Business Performance Motion Path ── */
function initPerformanceMotion() {
    const section = document.querySelector(".performance_section");
    const path = document.querySelector(".performance_path");
    const cards = gsap.utils.toArray(".performance_card");

    if (!section || !path || !cards.length) return;

    function updateCards(progress) {
        const length = path.getTotalLength();

        cards.forEach((card, index) => {
            const gap = 0.24;

            const cardProgress =
                progress * (1 + gap * (cards.length - 1)) -
                index * gap;

            if (cardProgress < 0 || cardProgress > 1) {
                gsap.set(card, {
                    opacity: 0,
                    pointerEvents: "none"
                });

                return;
            }

            const point = path.getPointAtLength(length * cardProgress);


            /* 포커스 계산 */

            let focus;

            const focusInEnd = 0.38;
            const focusOutStart = 0.62;

            if (cardProgress < focusInEnd) {

                focus = cardProgress / focusInEnd;

            } else if (cardProgress <= focusOutStart) {

                focus = 1;

            } else {

                focus =
                    (1 - cardProgress) /
                    (1 - focusOutStart);
            }


            const scale =
                gsap.utils.interpolate(0.28, 1.15, focus);

            const opacity =
                gsap.utils.interpolate(0.12, 1, focus);

            const blur =
                gsap.utils.interpolate(24, 0, focus);

            const zIndex =
                Math.round(focus * 100);


            gsap.set(card, {
                x: point.x,
                y: point.y,

                xPercent: -50,
                yPercent: -50,

                scale: scale,
                opacity: opacity,

                zIndex: zIndex,

                filter: `blur(${blur}px)`,

                pointerEvents: focus > 0.85 ? "auto" : "none"
            });
        });
    }

    gsap.set(cards, {
        opacity: 0,
        scale: 0.28,
        filter: "blur(24px)",
        transformOrigin: "50% 50%"
    });

    ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=5000",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,

        onUpdate(self) {
            updateCards(self.progress);
        },

        onRefresh() {
            updateCards(0);
        }
    });
}

initPerformanceMotion();






/* ── Keyword 큰텍스트 벌어지는 ── */
function initKeywordSplit() {
    const section = document.querySelector(".keyword_section");
    const items = gsap.utils.toArray(".keyword_item");

    if (!section || !items.length) return;
    gsap.set(items, {
        autoAlpha: 0
    });

    items.forEach((item) => {
        const parts = item.querySelectorAll(".keyword_title span");
        const desc = item.querySelector(".keyword_desc");

        gsap.set(parts, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0
        });

        gsap.set(desc, {
            opacity: 0
        });
    });

    gsap.set(items[0], {
        autoAlpha: 1
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `+=${items.length * 1200}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1
        }
    });

    items.forEach((item, index) => {
        const isLR = item.classList.contains("keyword_lr");

        const left = item.querySelector(".keyword_left");
        const right = item.querySelector(".keyword_right");
        const top = item.querySelector(".keyword_top");
        const bottom = item.querySelector(".keyword_bottom");
        const desc = item.querySelector(".keyword_desc");
        const parts = item.querySelectorAll(".keyword_title span");

        const start = index * 1.2;

        const enterFrom = index % 2 === 0 ? "y" : "x";
        const enterValue = index % 2 === 0 ? "100vh" : "100vw";

        tl.set(item, {
            autoAlpha: 1
        }, start);

        if (index !== 0) {
            tl.fromTo(item, {
                [enterFrom]: enterValue
            }, {
                [enterFrom]: 0,
                duration: 0.35,
                ease: "none"
            }, start);
        }

        if (isLR) {
            tl.to(left, {
                x: "-18vw",
                duration: 0.45,
                ease: "none"
            }, start + 0.25);

            tl.to(right, {
                x: "18vw",
                duration: 0.45,
                ease: "none"
            }, start + 0.25);
        } else {
            tl.to(top, {
                y: "-8rem",
                duration: 0.45,
                ease: "none"
            }, start + 0.25);

            tl.to(bottom, {
                y: "8rem",
                duration: 0.45,
                ease: "none"
            }, start + 0.25);
        }

        tl.to(desc, {
            opacity: 1,
            duration: 0.25,
            ease: "none"
        }, start + 0.45);

        if (index !== items.length - 1) {
            const exitTo = index % 2 === 0 ? "y" : "x";
            const exitValue = index % 2 === 0 ? "-100vh" : "-100vw";

            tl.to(item, {
                [exitTo]: exitValue,
                duration: 0.45,
                ease: "none"
            }, start + 0.95);

            tl.set(item, {
                autoAlpha: 0
            }, start + 1.4);
        }
    });
}

initKeywordSplit();









/* ── Scatter Text ── */
function initScatterText() {
    const section = document.querySelector(".scatter_section");
    const words = gsap.utils.toArray(".scatter_word");

    if (!section || !words.length) return;

    const startScale = 1.6;
    const endScale = 1;

    const gap = window.innerWidth * 0.035;
    const lineGap = window.innerHeight * 0.18;

    gsap.set(words, {
        x: 0,
        y: 0,
        scale: startScale,
        transformOrigin: "center center"
    });

    function getTarget(word) {
        const line = Number(word.dataset.line);
        const lineWords = words.filter((item) => Number(item.dataset.line) === line);

        const gap = window.innerWidth * 0.015;
        const lineGap = window.innerHeight * 0.09;

        const targetStartX = window.innerWidth * 0.13;
        const targetStartY = window.innerHeight * 0.58;

        let targetLeft = targetStartX;

        lineWords.forEach((item) => {
            if (item === word) return;
            if (lineWords.indexOf(item) < lineWords.indexOf(word)) {
                targetLeft += item.offsetWidth + gap;
            }
        });

        const targetTop = targetStartY + (line - 1) * lineGap;

        return {
            x: targetLeft - word.offsetLeft,
            y: targetTop - word.offsetTop
        };
    }

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true
        }
    });

    words.forEach((word) => {
        tl.to(word, {
            x: () => getTarget(word).x,
            y: () => getTarget(word).y,
            scale: endScale,
            color: word.dataset.word === "connecting" ? "#FF6200" : "#000000",
            ease: "none"
        }, 0);
    });
}

initScatterText();



















/* ── Awards & Media ── */
function initNewsSection() {
    const section = document.querySelector(".news_section");
    const head = document.querySelector(".news_head");
    const items = gsap.utils.toArray(".news_item");

    if (!section || !head || !items.length) return;

    gsap.set([head, items], {
        opacity: 1,
        y: 0
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none none"
        }
    });

    tl.from(head, {
        y: 50,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out"
    });

    tl.from(items, {
        y: 70,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out"
    }, "-=0.25");
}

initNewsSection();






/* ── 커튼 전환 효과 ── */
function initCurtainSections() {
    const sections = gsap.utils.toArray(".curtain_section");
    if (!sections.length) return;
    sections.forEach((section) => {
        const stripes = gsap.utils.toArray(section.querySelectorAll(".stripe_item"));
        if (!stripes.length) return;
        gsap.set(stripes, {
            scaleY: 0,
            transformOrigin: "center bottom"
        });
        gsap.to(stripes, {
            scaleY: 1,
            ease: "none",
            stagger: {
                each: 0.08,
                from: "end"
            },
            scrollTrigger: {
                trigger: section,
                // 기존: "top top"
                // 섹션 상단이 화면 70% 지점에 왔을 때부터 시작
                start: "top 70%",
                // 기존: "+=600"
                // 너무 늘어지지 않게 짧게
                end: "top top",
                pin: false,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
    });
}

initCurtainSections();







/* ===========================
    서비스가 만들어지는 과정
   =========================== */

(function () {

    const STEPS = 6;
    const CANVAS_W = 1440;
    const CANVAS_H = 120;
    const DOT_COLOR = '#FF6200';
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

window.addEventListener("load", () => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
});