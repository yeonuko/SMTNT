gsap.registerPlugin(ScrollTrigger);

gsap.registerPlugin(ScrollTrigger, Flip);

/* ── Lenis 스무스 스크롤 ── */
const lenis = new Lenis({
    duration: 0.9,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    wheelMultiplier: 1,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

/* Lenis와 같이 쓸 때는 꺼두는 걸 권장: 안 꺼두면 브라우저가 잠깐
   멈췄다 돌아올 때(영상 디코딩/이미지 로딩 등) GSAP이 밀린 시간을
   한 번에 따라잡으려 하면서 순간적으로 튀는 현상이 생길 수 있음 */
gsap.ticker.lagSmoothing(0);

/* 데스크탑 전용 스크롤 애니메이션 분기
   → 768px 이상에서만 GSAP pin/scrub 애니메이션 실행,
     모바일에서는 해당 콜백이 아예 실행되지 않고 일반 스크롤로 동작함 */
const mm = gsap.matchMedia();


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









/* ── 메인 영상 슬라이더 (2초마다 크로스페이드) ── */
// function initMainVideoSlider() {
//     const wrap = document.querySelector(".main_video_wrap");
//     if (!wrap) return;

//     const videos = wrap.querySelectorAll(".main_video");
//     if (videos.length < 2) return;

//     const DURATION = 2000; // 각 영상 노출 시간 (ms)
//     const FADE_MS = 1000;  // main_video의 opacity transition 시간과 동일하게
//     let current = 0;

//     // 처음 활성 영상 빼고는 전부 정지 → 동시 디코딩 부담 최소화
//     videos.forEach((v, i) => {
//         if (i !== current) v.pause();
//     });

//     setInterval(() => {
//         const prev = videos[current];

//         current = (current + 1) % videos.length;
//         const next = videos[current];

//         next.currentTime = 0;
//         next.play();

//         prev.classList.remove("is_active");
//         next.classList.add("is_active");

//         setTimeout(() => {
//             prev.pause();
//         }, FADE_MS);
//     }, DURATION);
// }

// initMainVideoSlider();


/* ── 메인 타이틀 슬라이더 (등장: 위에서 드롭 / 퇴장: 디졸브) ── */
function initMainTitleSlider() {
    const wrap = document.querySelector(".main_title_slider");
    if (!wrap) return;

    const titles = wrap.querySelectorAll(".main_title");
    if (titles.length < 2) return;

    const DURATION = 3000; // 각 문구 노출 시간 (ms)
    const LEAVE_MS = 700; // mainTitleLeave 애니메이션 길이와 동일하게
    let current = 0;

    setInterval(() => {
        const prev = titles[current];

        prev.classList.remove("is_active");
        prev.classList.add("is_leaving");

        setTimeout(() => {
            prev.classList.remove("is_leaving");
        }, LEAVE_MS);

        current = (current + 1) % titles.length;
        titles[current].classList.add("is_active");
    }, DURATION);
}

initMainTitleSlider();


/* ── nav 패밀리사이트 Dropdown ── */
// function initFamilySite() {
//     const wrap = document.querySelector(".family_site_wrap");
//     const btn = document.querySelector(".family_site");

//     if (!wrap || !btn) return;

//     btn.addEventListener("click", (e) => {
//         e.stopPropagation();
//         wrap.classList.toggle("is_open");
//     });

//     document.addEventListener("click", (e) => {
//         if (!wrap.contains(e.target)) {
//             wrap.classList.remove("is_open");
//         }
//     });

//     window.addEventListener("scroll", () => {
//         wrap.classList.remove("is_open");
//     });
// }

// initFamilySite();


/* ── 모바일 GNB 토글 ── */
function initMobileNav() {
    const header = document.querySelector("#header");
    const toggle = document.querySelector(".gnb_toggle");
    const gnbItems = document.querySelectorAll(".gnb_item");
    const mq = window.matchMedia("(max-width: 767px)");

    if (!header || !toggle) return;

    function closeMenu() {
        header.classList.remove("menu_open");
        toggle.setAttribute("aria-expanded", "false");
        gnbItems.forEach((item) => item.classList.remove("is_open"));
        lenis.start();
    }

    function openMenu() {
        header.classList.add("menu_open");
        toggle.setAttribute("aria-expanded", "true");
        lenis.stop();
    }

    toggle.addEventListener("click", () => {
        const isOpen = header.classList.contains("menu_open");
        isOpen ? closeMenu() : openMenu();
    });

    /* 모바일에서는 gnb_link 탭 → 하위메뉴 아코디언 오픈 (데스크탑은 기존 hover 유지) */
    gnbItems.forEach((item) => {
        const link = item.querySelector(".gnb_link");
        const depth = item.querySelector(".gnb_depth");

        if (!link || !depth) return;

        link.addEventListener("click", (e) => {
            if (!mq.matches) return;

            e.preventDefault();
            const isOpen = item.classList.contains("is_open");

            gnbItems.forEach((el) => el.classList.remove("is_open"));
            if (!isOpen) item.classList.add("is_open");
        });
    });

    /* 뎁스 링크 클릭 시 메뉴 닫기 */
    document.querySelectorAll(".gnb_depth a").forEach((a) => {
        a.addEventListener("click", closeMenu);
    });

    /* 데스크탑 크기로 리사이즈되면 메뉴 상태 초기화 */
    mq.addEventListener("change", (e) => {
        if (!e.matches) closeMenu();
    });

    /* ESC로 닫기 */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
    });
}

initMobileNav();




/* ── 메인화면 스크롤 (데스크탑 전용) ── */
mm.add("(min-width: 768px)", () => {
    ScrollTrigger.create({
        trigger: ".main_visual",
        start: "top top",
        end: "bottom bottom",
        pin: ".main_bg",
        pinSpacing: false
    });

    initMainIntro();
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
            opacity: 0.8,
            ease: "none",
        }, 0)
        .to(chars, {
            color: "rgba(255, 255, 255, 1)",
            stagger: 0.08,
            ease: "none",
        }, 0);
}



/* ── Vision 강조 문장 스크롤 연동 ── */
function initVisionHighlight() {
    const highlights = gsap.utils.toArray(".vision_highlight");

    if (!highlights.length) return;

    highlights.forEach((highlight) => {
        gsap.fromTo(
            highlight,
            {
                fontWeight: 400
            },
            {
                fontWeight: 800,
                ease: "none",

                scrollTrigger: {
                    trigger: highlight,
                    start: "top 75%",
                    end: "top 45%",
                    scrub: true
                }
            }
        );

        gsap.fromTo(
            highlight,
            {
                "--vision-line": 0
            },
            {
                "--vision-line": 1,
                ease: "none",

                scrollTrigger: {
                    trigger: highlight,
                    start: "top 75%",
                    end: "top 45%",
                    scrub: true
                }
            }
        );
    });
}

initVisionHighlight();




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
            scrub: true,
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
                scrub: true,
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

    const invertTime = 0.08; // 색 반전 타이밍
    const cardStartTime = 0.1; // 카드 시작 타이밍
    const cardGap = 0.05; // 카드 간격
    const cardDuration = 0.28; // 카드 속도
    const focusDelay = cardDuration * 0.35; // data-group 단어가 더 빨리 바뀌게
    const totalTime = cardStartTime + orbitCards.length * cardGap + cardDuration;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=7500",
            pin: true,
            scrub: true,
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





/* ── Our Solution Floating Deco ── */
function initSolutionFloating() {
    const section = document.querySelector(".solution_section");
    const items = gsap.utils.toArray(".solution_deco_item");

    if (!section || !items.length) return;

    items.forEach((item, index) => {
        const depth = Number(item.dataset.depth) || 0.5;

        /*
            depth가 클수록:
            - 이동 범위가 커짐
            - 움직임이 조금 더 빠름
            - 가까이 떠 있는 느낌이 강해짐
        */
        const moveX = 18 + depth * 18;
        const moveY = 22 + depth * 22;
        const rotateAmount = 2 + depth * 3;

        const durationX = 6.5 + index * 1.1;
        const durationY = 5.5 + index * 1.3;
        const durationRotate = 8 + index * 1.4;

        /*
            처음부터 요소들이 같은 타이밍으로 움직이지 않도록
            각각 다른 위치에서 시작
        */
        gsap.set(item, {
            x: index % 2 === 0 ? -moveX * 0.4 : moveX * 0.4,
            y: index % 2 === 0 ? moveY * 0.25 : -moveY * 0.25,
            rotation: index % 2 === 0 ? -rotateAmount : rotateAmount
        });

        /*
            좌우 움직임
        */
        gsap.to(item, {
            x: index % 2 === 0 ? moveX : -moveX,
            duration: durationX,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: index * -1.4
        });

        /*
            상하 움직임
        */
        gsap.to(item, {
            y: index % 2 === 0 ? -moveY : moveY,
            duration: durationY,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: index * -1.8
        });

        /*
            아주 느린 회전
        */
        gsap.to(item, {
            rotation: index % 2 === 0 ?
                rotateAmount :
                -rotateAmount,

            duration: durationRotate,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: index * -2
        });
    });
}

initSolutionFloating();






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
        scrub: true,
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






/* ── Keyword 큰 텍스트 분리 + 가로 피슝 라인 ── */
function initKeywordSplit() {
    const section = document.querySelector(".keyword_section");
    const items = gsap.utils.toArray(".keyword_item");

    if (!section || !items.length) return;


    /* ==============================
       라인 자동 생성
    ============================== */

    items.forEach((item) => {
        const pin = item.querySelector(".keyword_pin");

        if (!pin) return;

        if (!pin.querySelector(".keyword_motion_line")) {
            const glowLine = document.createElement("span");
            const mainLine = document.createElement("span");

            glowLine.className = "keyword_motion_line line_glow";
            mainLine.className = "keyword_motion_line line_main";

            pin.prepend(glowLine);
            pin.prepend(mainLine);
        }
    });


    /* ==============================
       초기 상태
    ============================== */

    gsap.set(items, {
        autoAlpha: 0,
        x: 0,
        y: 0
    });

    items.forEach((item) => {
        const parts = item.querySelectorAll(".keyword_title span");
        const desc = item.querySelector(".keyword_desc");
        const lines = item.querySelectorAll(".keyword_motion_line");

        gsap.set(parts, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0
        });

        gsap.set(desc, {
            opacity: 0,
            scale: 0.96
        });

        /* 모든 라인은 가로 */
        gsap.set(lines, {
            scaleX: 0,
            scaleY: 1,
            opacity: 0
        });
    });


    gsap.set(items[0], {
        autoAlpha: 1
    });


    /* ==============================
       메인 타임라인
    ============================== */

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `+=${items.length * 1400}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });


    items.forEach((item, index) => {
        const isLR = item.classList.contains("keyword_lr");

        const left = item.querySelector(".keyword_left");
        const right = item.querySelector(".keyword_right");

        const top = item.querySelector(".keyword_top");
        const bottom = item.querySelector(".keyword_bottom");

        const desc = item.querySelector(".keyword_desc");

        const mainLine = item.querySelector(".line_main");
        const glowLine = item.querySelector(".line_glow");


        const start = index * 1.6;

        const enterDuration =
            index === 0 ? 0 : 0.38;


        /*
            중앙 도착 후 피슝 시작
        */

        const focusStart =
            start +
            enterDuration +
            0.18;


        const enterAxis =
            index % 2 === 0 ? "y" : "x";

        const enterValue =
            index % 2 === 0 ? "100vh" : "100vw";


        /* ==============================
           아이템 등장
        ============================== */

        tl.set(item, {
            autoAlpha: 1,
            x: 0,
            y: 0
        }, start);


        if (index !== 0) {
            tl.fromTo(
                item,

                {
                    [enterAxis]: enterValue
                },

                {
                    [enterAxis]: 0,
                    duration: enterDuration,
                    ease: "none"
                },

                start
            );
        }


        /* ==============================
           가로 피슝 라인
        ============================== */

        tl.fromTo(
            glowLine,

            {
                scaleX: 0.02,
                opacity: 0,
                filter: "blur(12px)"
            },

            {
                scaleX: 1,
                opacity: 0.9,
                filter: "blur(6px)",
                duration: 0.12,
                ease: "power4.out"
            },

            focusStart
        );


        tl.fromTo(
            mainLine,

            {
                scaleX: 0,
                opacity: 0
            },

            {
                scaleX: 1,
                opacity: 1,
                duration: 0.1,
                ease: "power4.out"
            },

            focusStart + 0.02
        );


        /* ==============================
           텍스트 분리
        ============================== */

        if (isLR) {

            tl.to(left, {
                x: "-18vw",
                duration: 0.45,
                ease: "power2.out"
            }, focusStart + 0.06);


            tl.to(right, {
                x: "18vw",
                duration: 0.45,
                ease: "power2.out"
            }, focusStart + 0.06);

        } else {

            tl.to(top, {
                y: "-8rem",
                duration: 0.45,
                ease: "power2.out"
            }, focusStart + 0.06);


            tl.to(bottom, {
                y: "8rem",
                duration: 0.45,
                ease: "power2.out"
            }, focusStart + 0.06);
        }


        /* ==============================
           설명 등장
        ============================== */

        tl.to(desc, {
            opacity: 1,
            scale: 1,
            duration: 0.24,
            ease: "power2.out"
        }, focusStart + 0.22);


        /* ==============================
           라인 소멸
        ============================== */

        tl.to(mainLine, {
            scaleX: 1.15,
            opacity: 0,
            duration: 0.18,
            ease: "power2.in"
        }, focusStart + 0.15);


        tl.to(glowLine, {
            scaleX: 1.25,
            opacity: 0,
            filter: "blur(14px)",
            duration: 0.24,
            ease: "power2.out"
        }, focusStart + 0.14);


        /* ==============================
           다음 키워드로 퇴장
        ============================== */

        if (index !== items.length - 1) {

            const exitAxis =
                index % 2 === 0 ? "y" : "x";

            const exitValue =
                index % 2 === 0 ?
                "-100vh" :
                "-100vw";


            const exitStart =
                focusStart + 0.95;


            tl.to(item, {
                [exitAxis]: exitValue,
                duration: 0.45,
                ease: "none"
            }, exitStart);


            tl.set(item, {
                autoAlpha: 0
            }, exitStart + 0.45);
        }
    });
}


initKeywordSplit();








/* ── Scatter Text ── */
function initScatterText() {
    const section = document.querySelector(".scatter_section");
    const words = gsap.utils.toArray(".scatter_word");

    if (!section || !words.length) return;

    const bg = section.querySelector(".scatter_bg");

    const startScale = 1.6;
    const endScale = 1;

    gsap.set(words, {
        x: 0,
        y: 0,
        scale: startScale,
        transformOrigin: "center center"
    });

    if (bg) {
        gsap.set(bg, {
            opacity: 0
        });
    }

    function getTarget(word) {
        const line = Number(word.dataset.line);

        const lineWords = words.filter(
            item => Number(item.dataset.line) === line
        );

        const gap = window.innerWidth * 0.015;
        const lineGap = window.innerHeight * 0.09;

        const targetStartX = window.innerWidth * 0.13;
        const targetStartY = window.innerHeight * 0.58;

        let targetLeft = targetStartX;

        lineWords.forEach((item) => {
            if (lineWords.indexOf(item) < lineWords.indexOf(word)) {
                targetLeft += item.offsetWidth + gap;
            }
        });

        const targetTop =
            targetStartY +
            (line - 1) * lineGap;

        return {
            x: targetLeft - word.offsetLeft,
            y: targetTop - word.offsetTop
        };
    }

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "top+=800 top",
            scrub: true,
            invalidateOnRefresh: true
        }
    });

    words.forEach((word) => {
        tl.to(word, {
            x: () => getTarget(word).x,
            y: () => getTarget(word).y,
            scale: endScale,
            color: word.dataset.word === "connecting" ?
                "#FF6200" : "#000000",
            duration: 1,
            ease: "none"
        }, 0);
    });

    if (bg) {
        tl.to(bg, {
            opacity: 1,
            duration: 0.3,
            ease: "none"
        }, 0.5); //배경 나타나는 타이밍
    }
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
                scrub: true,
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
            scrub: true,
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





/* ── 문의하기 팝업 ── */
(() => {
    const popup = document.querySelector(".contact_popup");
    if (!popup) return;

    const panel = popup.querySelector(".contact_popup_panel");
    const form = popup.querySelector(".contact_form");
    const openTriggers = document.querySelectorAll('a[href="#contact"]');
    const closeTriggers = popup.querySelectorAll("[data-popup-close]");

    const openPopup = () => {
        popup.classList.add("is_active");
        document.body.style.overflow = "hidden";
        if (typeof lenis !== "undefined") lenis.stop();
    };

    const closePopup = () => {
        popup.classList.remove("is_active");
        document.body.style.overflow = "";
        if (typeof lenis !== "undefined") lenis.start();
    };

    openTriggers.forEach((trigger) => {
        trigger.addEventListener("click", (e) => {
            e.preventDefault();
            openPopup();
        });
    });

    closeTriggers.forEach((trigger) => {
        trigger.addEventListener("click", closePopup);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && popup.classList.contains("is_active")) closePopup();
    });

    if (panel) {
        panel.addEventListener("click", (e) => e.stopPropagation());
    }

    /* 서비스 선택 태그: 중복 선택 가능 */
    const tagButtons = popup.querySelectorAll(".contact_tag");
    const serviceInput = popup.querySelector("#contact_service");

    const syncServiceInput = () => {
        const selected = [...tagButtons]
            .filter((b) => b.classList.contains("is_active"))
            .map((b) => b.dataset.value);
        serviceInput.value = selected.join(", ");
    };

    tagButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("is_active");
            syncServiceInput();
        });
    });

    /* 이메일 도메인: 직접 입력 전환 */
    const domainWrap = popup.querySelector(".contact_email_domain");
    const domainSelect = popup.querySelector("#contact_email_domain");
    const domainCustom = popup.querySelector("#contact_email_domain_custom");

    if (domainSelect) {
        domainSelect.addEventListener("change", () => {
            if (domainSelect.value === "direct") {
                domainWrap.classList.add("is_custom");
                domainCustom.value = "";
                domainCustom.focus();
            } else {
                domainWrap.classList.remove("is_custom");
            }
        });
    }

    /* 휴대폰번호: 숫자만 입력 + 자동 하이픈 */
    const phoneInput = popup.querySelector("#contact_phone");

    if (phoneInput) {
        phoneInput.addEventListener("input", () => {
            const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
            let formatted = digits;

            if (digits.length > 7) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
            } else if (digits.length > 3) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
            }

            phoneInput.value = formatted;
        });
    }


    /* 제출 */
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const requiredFields = form.querySelectorAll("[required]");
            let isValid = true;

            requiredFields.forEach((field) => {
                if (field.type === "checkbox" ? !field.checked : !field.value.trim()) {
                    isValid = false;
                }
            });

            if (!isValid) {
                if (typeof Swal !== "undefined") {
                    Swal.fire({
                        icon: "warning",
                        title: "필수 항목을 확인해주세요",
                        confirmButtonColor: "#FF6200",
                    });
                } else {
                    alert("필수 항목을 확인해주세요.");
                }
                return;
            }

            const emailDomain = domainWrap.classList.contains("is_custom") ?
                domainCustom.value :
                domainSelect.value;

            const payload = {
                service: serviceInput.value,
                name: form.name.value,
                company: form.company.value,
                email: `${form.email_id.value}@${emailDomain}`,
                phone: form.phone.value,
                message: form.message.value,
            };

            // TODO: 실제 전송 API 연동 위치
            console.log("contact form submit", payload);

            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: "success",
                    title: "문의가 접수되었습니다",
                    text: "담당자가 빠르게 연락드리겠습니다.",
                    confirmButtonColor: "#FF6200",
                }).then(() => {
                    form.reset();
                    tagButtons.forEach((b) => b.classList.remove("is_active"));
                    domainWrap.classList.remove("is_custom");
                    closePopup();
                });
            } else {
                alert("문의가 접수되었습니다.");
                form.reset();
                tagButtons.forEach((b) => b.classList.remove("is_active"));
                domainWrap.classList.remove("is_custom");
                closePopup();
            }
        });
    }
})();