gsap.registerPlugin(ScrollTrigger);


/* ── Lenis 스무스 스크롤 (데스크탑 1200px 이상에서만) ──
   태블릿/모바일은 GSAP pin·scrub를 쓰지 않기로 해서 Lenis도 끔.
   네이티브 스크롤이 터치 제스처 반응성/배터리에 더 유리함.
   ※ 로드 시점 화면 크기 기준으로 한 번만 판단하며, 브레이크포인트를
     넘나드는 실시간 리사이즈는 반영되지 않음(새로고침 시 재판단) */
const isDesktopViewport = window.matchMedia("(min-width: 1200px)").matches;

const lenis = isDesktopViewport ?
    new Lenis({
        duration: 0.9,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        wheelMultiplier: 1
    }) : {
        on() {},
        start() {},
        stop() {}
    };

if (isDesktopViewport) {
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    /* Lenis와 같이 쓸 때는 꺼두는 걸 권장: 안 꺼두면 브라우저가 잠깐
       멈췄다 돌아올 때(영상 디코딩/이미지 로딩 등) GSAP이 밀린 시간을
       한 번에 따라잡으려 하면서 순간적으로 튀는 현상이 생길 수 있음 */
    gsap.ticker.lagSmoothing(0);
}

/* 데스크탑 전용 스크롤 애니메이션 분기
   → 1200px 이상에서만 GSAP pin/scrub 애니메이션 실행,
     태블릿/모바일에서는 해당 콜백이 아예 실행되지 않고 일반 스크롤로 동작함 */
const mm = gsap.matchMedia();

/* 모션 민감 사용자 대응: 자동재생/무한반복 장식 애니메이션(영상 자동재생,
   Solution 플로팅, 마퀴)을 끄는 데 씀. 스크롤에 반응해서만 움직이는
   ScrollTrigger 애니메이션은 사용자가 유발한 동작이라 대상에서 제외 */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;



/* ── Nav 스크롤 ── */
function initHeaderScroll() {
    const header = document.querySelector("#header");

    if (!header) return;

    if (isDesktopViewport) {
        lenis.on("scroll", (e) => {
            if (e.scroll <= 0) {
                header.classList.remove("hide");
                return;
            }

            if (e.velocity > 0) {
                header.classList.add("hide");
            } else if (e.velocity < 0) {
                header.classList.remove("hide");
            }
        });

        return;
    }

    let previousScroll = window.scrollY;

    window.addEventListener(
        "scroll",
        () => {
            const currentScroll = window.scrollY;

            if (currentScroll <= 0) {
                header.classList.remove("hide");
                previousScroll = currentScroll;
                return;
            }

            if (currentScroll > previousScroll) {
                header.classList.add("hide");
            } else {
                header.classList.remove("hide");
            }

            previousScroll = currentScroll;
        }, {
            passive: true
        }
    );
}

initHeaderScroll();









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




/* ── 메인 영상 슬라이더 (영상 2개 순환 재생 + 하단 진행 바, 표시 전용) ── */
function initMainVideoSlider() {
    const videos = document.querySelectorAll(".main_video");
    const bars = document.querySelectorAll(".main_progress_bar i");
    if (videos.length < 2) return;

    let current = 0;

    function setProgress(index, ratio) {
        if (bars[index]) bars[index].style.transform = `scaleX(${ratio})`;
    }

    function playVideo(index) {
        videos.forEach((video, i) => {
            video.classList.toggle("is_active", i === index);

            if (i === index) {
                video.currentTime = 0;
                if (!prefersReducedMotion) video.play();
            } else {
                video.pause();
            }
        });
    }

    // timeupdate는 브라우저마다 실행 간격이 들쭉날쭉해서 계단식으로 보임
    // → requestAnimationFrame으로 매 프레임 진행률을 계산해 부드럽게 채움
    function tick() {
        const video = videos[current];

        if (video && video.duration) {
            setProgress(current, video.currentTime / video.duration);
        }

        requestAnimationFrame(tick);
    }

    videos.forEach((video, index) => {
        video.addEventListener("ended", () => {
            if (index !== current) return;

            setProgress(index, 0);

            current = (current + 1) % videos.length;
            setProgress(current, 0);
            playVideo(current);
        });
    });

    playVideo(current);
    tick();
}

initMainVideoSlider();

/* Scatter 섹션 배경의 autoplay/loop 데코 영상: 모션 민감 사용자는 정지 */
if (prefersReducedMotion) {
    document.querySelectorAll(".scatter_bg video").forEach((video) => video.pause());
}









/* ── 모바일 GNB 토글 ── */
function initMobileNav() {
    const header = document.querySelector("#header");
    const toggle = document.querySelector(".gnb_toggle");
    const gnbItems = document.querySelectorAll(".gnb_item");
    const mq = window.matchMedia("(max-width: 1199px)");

    if (!header || !toggle) return;

    let scrollY = 0;

    function closeMenu() {
        header.classList.remove("menu_open");
        toggle.setAttribute("aria-expanded", "false");
        gnbItems.forEach((item) => item.classList.remove("is_open"));

        /* 스크롤 잠금은 모바일 전체 오버레이에서만 걸었던 것 — PC 드롭다운은
           리스트만 열리고 닫히면 되고 스크롤엔 아무 영향도 줄 필요 없음 */
        if (document.body.style.position === "fixed") {
            lenis.start();
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            window.scrollTo(0, scrollY);
        }
    }

    function openMenu() {
        header.classList.add("menu_open");
        toggle.setAttribute("aria-expanded", "true");

        /* 모바일 전체 오버레이일 때만 스크롤 잠금. PC는 작은 드롭다운이라
           스크롤/lenis에 손댈 필요 없이 리스트만 보였다 사라지면 됨 */
        if (mq.matches) {
            lenis.stop();
            scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
        }
    }

    /* PC에서 메뉴가 열린 상태로 아래 스크롤하면
        헤더와 함께 GNB도 자동으로 닫기 */
    if (isDesktopViewport) {
        lenis.on("scroll", (e) => {
            const isMenuOpen =
                header.classList.contains("menu_open");

            if (!isMenuOpen) return;

            /* 아래 방향으로 스크롤할 때 */
            if (e.velocity > 0) {
                closeMenu();
            }
        });
    }

    /* 드래그(스크롤 제스처)로 버튼을 스쳐 지나간 경우 클릭으로 처리되지 않도록 이동량 체크 */
    let touchStartX = 0;
    let touchStartY = 0;
    let toggledByDrag = false;

    toggle.addEventListener("touchstart", (e) => {
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        toggledByDrag = false;
    }, {
        passive: true
    });

    toggle.addEventListener("touchmove", (e) => {
        const t = e.touches[0];
        const dx = Math.abs(t.clientX - touchStartX);
        const dy = Math.abs(t.clientY - touchStartY);

        if (dx > 10 || dy > 10) toggledByDrag = true;
    }, {
        passive: true
    });

    toggle.addEventListener("click", (e) => {
        if (toggledByDrag) {
            toggledByDrag = false;
            e.preventDefault();
            return;
        }

        const isOpen = header.classList.contains("menu_open");
        isOpen ? closeMenu() : openMenu();
    });

    /* 모바일에서는 gnb_link 탭 → 하위메뉴 아코디언 오픈 (데스크탑은 기존 hover 유지) */
    gnbItems.forEach((item) => {
        const link = item.querySelector(".gnb_link");
        const depth = item.querySelector(".gnb_depth");

        if (!link) return;

        /* 뎁스(하위메뉴)가 없는 링크는 클릭 즉시 해당 섹션으로 이동하는 거라
           메뉴도 같이 닫아줘야 함 */
        if (!depth) {
            link.addEventListener("click", closeMenu);
            return;
        }

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

    /* 패널(또는 토글 버튼) 바깥을 클릭하면 닫기 */
    document.addEventListener("click", (e) => {
        if (!header.classList.contains("menu_open")) return;
        if (toggle.contains(e.target)) return;
        const gnb = document.querySelector(".gnb");
        if (gnb && gnb.contains(e.target)) return;

        closeMenu();
    });
}

initMobileNav();

/* ── GNB 앵커 클릭 시 부드럽게 스크롤 이동 ──
   기존엔 href="#about" 같은 앵커를 그냥 브라우저 기본 동작으로 이동시켜서
   Lenis smooth scroll을 안 타고 순간 이동(뚝!)했음.
   데스크탑은 lenis.scrollTo, 태블릿/모바일은 네이티브 smooth scroll 사용.
   #contact는 팝업 트리거라 제외. */
function initSmoothAnchorScroll() {
    const header = document.querySelector("#header");
    const headerHeight = header ? header.offsetHeight : 0;

    /* 이동 중 화면을 아주 잠깐 덮어주는 트랜지션 오버레이.
       그 뒤에서 스크롤을 즉시 점프시키면 중간 pin/scrub 섹션들이
       빠르게 재생되며 지나가는 게 안 보이고, 오버레이만 스윽 걷히면서
       도착 지점이 자연스럽게 드러남 (ScrollTrigger를 끄고 켜는 비용 없음) */
    const overlay = document.createElement("div");
    overlay.className = "nav_transition_overlay";
    document.body.appendChild(overlay);

    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
        if (link.getAttribute("href") === "#contact") return;

        link.addEventListener("click", (e) => {
            const target = document.querySelector(link.getAttribute("href"));
            if (!target) return;

            e.preventDefault();

            overlay.classList.add("is_active");

            setTimeout(() => {
                if (isDesktopViewport) {
                    lenis.scrollTo(target, {
                        offset: -headerHeight,
                        immediate: true
                    });
                } else {
                    const y = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                    window.scrollTo({
                        top: y,
                        behavior: "auto"
                    });
                }

                requestAnimationFrame(() => {
                    overlay.classList.remove("is_active");
                });
            }, 320);
        });
    });
}

initSmoothAnchorScroll();




/* ── 메인화면 스크롤 (데스크탑 전용) ── */
mm.add("(min-width: 1200px)", () => {
    ScrollTrigger.create({
        trigger: ".main_visual",
        start: "top top",
        end: "bottom bottom",
        pin: ".main_bg",
        pinSpacing: false
    });

    initMainIntro();
});


/* ── 모바일 main_intro_text 1회성 fade-up (PC는 위 스크럽 강조 유지) ── */
function initMainIntroTextMobile() {
    const isMobile = window.matchMedia("(max-width: 1199px)").matches;
    if (!isMobile) return;

    const text = document.querySelector(".main_intro_text");
    if (!text) return;

    ScrollTrigger.create({
        trigger: text,
        start: "top 85%",
        once: true,
        onEnter: () => text.classList.add("is_visible")
    });
}

initMainIntroTextMobile();



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
            highlight, {
                fontWeight: 400
            }, {
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
            highlight, {
                "--vision-line": 0
            }, {
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


/* ── Vision : 하나의 타이틀이 중앙 대형 → 왼쪽 sticky 위치로 이동 / Outro 자연 종료 ── */
function initVisionSequence() {
    const section = document.querySelector(".vision_section");
    const inner = document.querySelector(".vision_inner");
    const sticky = document.querySelector(".vision_sticky");
    const stickyCopy = document.querySelector(".vision_sticky_copy");
    const scrollWrap = document.querySelector(".vision_scroll");
    const keywordList = document.querySelector(".vision_keyword_list");
    const outro = document.querySelector(".vision_outro");
    const outroBlock = outro ? outro.querySelector(".vision_block") : null;

    if (!section || !inner || !sticky || !stickyCopy || !scrollWrap) return;

    /*
     * 복제 타이틀을 교체하지 않는다.
     * 실제 왼쪽 sticky 안에 있는 하나의 .vision_sticky_copy 자체를
     * 처음에는 viewport 중앙으로 transform해 두었다가,
     * 첫 100vh 동안 transform: none 상태로 되돌린다.
     */
    /* ── 타이틀 중앙 → 왼쪽 sticky 이동 ── */

    /*
     * 여기서 stickyCopy는 아직 transform이 없는
     * 원래 최종 위치 상태이므로 딱 한 번만 측정한다.
     *
     * ScrollTrigger refresh 때 다시 측정하지 않는다.
     */
    const finalRect = stickyCopy.getBoundingClientRect();

    const INTRO_SCALE = 1.3;


    /*
     * transform-origin이 left center이므로
     * scale 했을 때의 위치 계산도 그 기준에 맞춘다.
     *
     * X:
     * 왼쪽 기준점은 그대로이고 폭만 오른쪽으로 커짐
     *
     * Y:
     * center 기준 scale이므로 중심 위치는 그대로 유지됨
     */
    const introX =
        (window.innerWidth / 2) -
        (finalRect.left + (finalRect.width * INTRO_SCALE) / 2);

    const introY =
        (window.innerHeight / 2) -
        (finalRect.top + finalRect.height / 2);

    /*
     * 오른쪽 전체(.vision_scroll)는 숨기지 않는다.
     * 이전처럼 컨테이너 자체를 opacity:0으로 만들면 ScrollTrigger가 꼬였을 때
     * 키워드가 통째로 사라질 수 있다. 키워드 묶음만 아주 약하게 등장시킨다.
     */
    if (keywordList) {
        gsap.fromTo(keywordList, {
            opacity: 1,
            y: 4 * 16
        }, {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: "top+=45% top",
                end: "top+=95% top",
                scrub: true
            }
        });
    }

    /*
     * Outro는 등장만 제어한다.
     * 끝에서 autoAlpha:0으로 강제 제거하지 않는다.
     * sticky 컨테이너의 끝에 도달하면 일반 문서 흐름대로 위로 밀려나며
     * 다음 solution 섹션이 올라오므로 '뿅 사라지는' 순간이 없다.
     */
    if (outro && outroBlock) {
        const outroItems = [
            document.querySelector(".vision_text:nth-of-type(1)"),
            document.querySelector(".vision_deco_01"),
            document.querySelector(".vision_text:nth-of-type(2)"),
            document.querySelector(".vision_deco_02"),
            document.querySelector(".vision_text:nth-of-type(3)"),
            document.querySelector(".vision_deco_03"),
            document.querySelector(".vision_signature")
        ].filter(Boolean);

        gsap.set(outroItems, {
            autoAlpha: 0,
            y: 60
        });

        gsap.timeline({
                scrollTrigger: {
                    trigger: outro,
                    start: "top 75%",
                    end: "top 20%",
                    scrub: 1
                }
            })
            .to(outroItems, {
                autoAlpha: 1,
                y: 0,
                stagger: 0.14,
                ease: "none"
            });
    }
}

mm.add("(min-width: 1200px)", () => {
    initVisionSequence();
});

/* ── Vision Outro 모바일 : 스크럽 대신 진입 시 1회성 fade-up ── */
function initVisionOutroMobile() {
    const outro = document.querySelector(".vision_outro");

    if (!outro) return;

    const outroItems = [
        document.querySelector(".vision_text:nth-of-type(1)"),
        document.querySelector(".vision_deco_01"),
        document.querySelector(".vision_text:nth-of-type(2)"),
        document.querySelector(".vision_deco_02"),
        document.querySelector(".vision_text:nth-of-type(3)"),
        document.querySelector(".vision_deco_03"),
        document.querySelector(".vision_signature")
    ].filter(Boolean);

    if (!outroItems.length) return;

    gsap.set(outroItems, {
        autoAlpha: 0,
        y: 40
    });

    gsap.to(outroItems, {
        autoAlpha: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
            trigger: outro,
            start: "top 40%",
            toggleActions: "play none none reverse"
        }
    });
}

if (window.innerWidth < 1200) {
    initVisionOutroMobile();
}


/* ── Vision 데스크탑 스크롤 연동 곡선
   : 첫 키워드 시작 ~ 마지막 키워드 끝까지만 라인 생성
   : 기존 베지어 형태 계산은 그대로 유지
── */
function initVisionCurve() {
    const scrollWrap = document.querySelector(".vision_scroll");
    const curveWrap = document.querySelector(".vision_curve");
    const svg = document.querySelector(".vision_curve_svg");
    const bgPath = document.querySelector(".vision_curve_path_bg");
    const fillPath = document.querySelector(".vision_curve_path_fill");

    if (!scrollWrap || !curveWrap || !svg || !bgPath || !fillPath) return;

    const anchors = gsap.utils.toArray(".vision_keyword_head");
    const keywords = gsap.utils.toArray(".vision_keyword");

    if (!anchors.length || !keywords.length) return;

    let markers = [];
    let scrubTween = null;

    /* 라인 시작/끝에 줄 여백 */
    const CURVE_PADDING_TOP = -15;
    const CURVE_PADDING_BOTTOM = 0;


    function buildMarkers(anchorPoints) {
        markers.forEach((m) => {
            if (m.trigger) m.trigger.kill();
            m.el.remove();
        });

        markers = [];

        anchorPoints.forEach((point, i) => {
            const el = document.createElement("div");

            el.className = "vision_curve_marker";
            el.style.transform = `translate(${point.x}px, ${point.y}px)`;

            curveWrap.appendChild(el);

            const trigger = ScrollTrigger.create({
                trigger: anchors[i],
                start: "top 65%",

                onEnter: () => {
                    el.classList.add("is_active");
                },

                onEnterBack: () => {
                    el.classList.add("is_active");
                },

                onLeaveBack: () => {
                    el.classList.remove("is_active");
                }
            });

            markers.push({
                el,
                trigger
            });
        });
    }


    function buildPath() {
        const wrapRect = scrollWrap.getBoundingClientRect();

        const firstKeyword = keywords[0];
        const lastKeyword = keywords[keywords.length - 1];

        const firstRect = firstKeyword.getBoundingClientRect();
        const lastRect = lastKeyword.getBoundingClientRect();


        /*
         * vision_scroll 전체 높이를 사용하지 않고
         * 실제 키워드 콘텐츠 시작/끝을 기준으로 곡선 영역을 만든다.
         */
        const curveStart =
            firstRect.top -
            wrapRect.top -
            CURVE_PADDING_TOP;

        const curveEnd =
            lastRect.bottom -
            wrapRect.top +
            CURVE_PADDING_BOTTOM;

        const height = curveEnd - curveStart;


        /*
         * curveWrap 자체를 콘텐츠 시작 위치로 이동
         */
        curveWrap.style.top = `${curveStart}px`;
        curveWrap.style.height = `${height}px`;


        const curveRect = curveWrap.getBoundingClientRect();
        const scaleX = curveRect.width / 100;

        svg.setAttribute(
            "viewBox",
            `0 0 100 ${height}`
        );


        /*
         * 키워드 타이틀 위치를
         * 새 curve 영역 기준 좌표로 변환
         */
        const anchorPoints = anchors.map((el, i) => {
            const r = el.getBoundingClientRect();

            return {
                x: i % 2 === 0 ? 30 : 70,

                y: r.top -
                    wrapRect.top -
                    curveStart +
                    r.height / 2
            };
        });


        /*
         * 시작점 / 끝점
         *
         * 기존처럼 중앙 50에서 시작하고
         * 중앙 50으로 종료.
         */
        const points = [{
                x: 50,
                y: 0
            },

            ...anchorPoints,

            {
                x: 50,
                y: height
            }
        ];


        /*
         * 기존 cubic Bézier 계산 유지
         */
        let d = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];

            const midY = (p0.y + p1.y) / 2;

            d += `
                C
                ${p0.x} ${midY},
                ${p1.x} ${midY},
                ${p1.x} ${p1.y}
            `;
        }


        bgPath.setAttribute("d", d);
        fillPath.setAttribute("d", d);


        /*
         * 진행 라인 초기화
         */
        const totalLength = fillPath.getTotalLength();

        fillPath.style.strokeDasharray = totalLength;
        fillPath.style.strokeDashoffset = totalLength;


        /*
         * 마커도 새 curve 영역 기준으로 배치
         */
        buildMarkers(
            anchorPoints.map((p) => ({
                x: p.x * scaleX,
                y: p.y
            }))
        );


        /*
         * 기존 tween 제거
         */
        if (scrubTween) {
            scrubTween.kill();
            scrubTween = null;
        }


        /*
         * 라인 진행 역시
         * vision_scroll 전체가 아니라
         * 첫 번째 키워드 → 마지막 키워드를 기준으로 한다.
         */
        scrubTween = gsap.to(fillPath, {
            strokeDashoffset: 0,
            ease: "none",

            scrollTrigger: {
                trigger: firstKeyword,

                start: "top 70%",

                endTrigger: lastKeyword,
                end: "bottom 70%",

                scrub: true
            }
        });
    }


    buildPath();


    /*
     * 화면 크기가 변하면 다시 계산
     */
    window.addEventListener("resize", buildPath);


    /*
     * 폰트 로딩 이후 텍스트 높이가 달라질 수 있으므로 재계산
     */
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(buildPath);
    }
}


mm.add("(min-width: 1200px)", () => {
    initVisionCurve();
});









/* ── Vision 모바일 스크롤 레일 (좌측 세로선 + 진행률 채움 + 하이라이트 마커) ── */
function initVisionRail() {
    const isMobile = window.matchMedia("(max-width: 1199px)").matches;
    if (!isMobile) return;

    const scrollWrap = document.querySelector(".vision_scroll");
    const rail = document.querySelector(".vision_rail");
    const fill = document.querySelector(".vision_rail_fill");
    const highlights = gsap.utils.toArray(".vision_scroll .vision_highlight");

    if (!scrollWrap || !rail || !fill || !highlights.length) return;

    /* 하이라이트 위치마다 레일 옆에 마커 생성 */
    highlights.forEach((highlight) => {
        const marker = document.createElement("span");
        marker.className = "vision_rail_marker";
        rail.appendChild(marker);

        const keyword = highlight.closest(".vision_keyword");
        const keywordHead = keyword ?
            keyword.querySelector(".vision_keyword_head") :
            null;

        /*
         * 키워드 영역이면 vision_keyword_head 기준
         * 상단 소개 문장이면 기존 highlight 기준
         */
        const target = keywordHead || highlight;

        const setPosition = () => {
            const wrapRect = scrollWrap.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();

            marker.style.top = `${
            targetRect.top -
            wrapRect.top +
            targetRect.height / 2 - 4
        }px`;
        };

        setPosition();

        window.addEventListener("resize", setPosition);

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                setPosition();
                ScrollTrigger.refresh();
            });
        }

        ScrollTrigger.create({
            /*
             * 마커 위치와 활성화 시점을 같은 요소로 통일
             */
            trigger: target,
            start: "top 65%",

            onEnter: () => {
                marker.classList.add("is_active");
            },

            onEnterBack: () => {
                marker.classList.add("is_active");
            },

            onLeaveBack: () => {
                marker.classList.remove("is_active");
            }
        });
    });

    /* 레일 채움 = vision_scroll을 지나는 진행률에 맞춰 스크럽 */
    gsap.fromTo(fill, {
        scaleY: 0
    }, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
            trigger: scrollWrap,
            start: "top 70%",
            end: "bottom 70%",
            scrub: true
        }
    });
}

initVisionRail();








/* ── Our Solution Orbit ── */
/* ── Our Solution Orbit ── */
function initSolutionOrbit() {
    var section = document.querySelector(".solution_section");

    var leftCards = gsap.utils.toArray(
        ".solution_orbit_left .solution_card"
    );

    var rightCards = gsap.utils.toArray(
        ".solution_orbit_right .solution_card"
    );

    var words = gsap.utils.toArray(".solution_word");

    if (
        !section ||
        (!leftCards.length && !rightCards.length) ||
        !words.length
    ) {
        return;
    }


    /* 화면 크기 구분 */
    var isMobile = window.innerWidth <= 767;

    var isTablet =
        window.innerWidth >= 768 &&
        window.innerWidth <= 1199;

    var scrollDistance = 7500;

    if (isMobile) {
        scrollDistance = 4800;
    } else if (isTablet) {
        scrollDistance = 6000;
    }


    /* 중앙 단어 활성화 */
    function setActiveGroup(group) {
        words.forEach(function (word) {
            var isActive =
                group &&
                word.dataset.group === group;

            word.classList.toggle(
                "is_active",
                Boolean(isActive)
            );
        });
    }


    /* 카드 궤도 좌표 계산 */
    function getOrbitValue(side, angle) {
        var rad = angle * Math.PI / 180;

        var centerOffset = 0.08;
        var radiusX = window.innerWidth * 0.8;
        var radiusY = window.innerHeight * 0.72;

        if (isMobile) {
            centerOffset = 0.18;
            radiusX = window.innerWidth * 0.78;
            radiusY = window.innerHeight * 0.42;
        } else if (isTablet) {
            centerOffset = 0.12;
            radiusX = window.innerWidth * 0.8;
            radiusY = window.innerHeight * 0.65;
        }

        var centerX;

        if (side === "left") {
            centerX =
                window.innerWidth *
                -centerOffset;
        } else {
            centerX =
                window.innerWidth *
                (1 + centerOffset);
        }

        var centerY =
            window.innerHeight * 0.5;

        return {
            x: centerX +
                Math.cos(rad) * radiusX -
                window.innerWidth / 2,

            y: centerY +
                Math.sin(rad) * radiusY -
                window.innerHeight / 2
        };
    }


    /* 좌우 카드를 번갈아 배열 */
    var orbitCards = [];

    var maxLength = Math.max(
        leftCards.length,
        rightCards.length
    );

    var i;

    for (i = 0; i < maxLength; i++) {
        if (leftCards[i]) {
            orbitCards.push({
                card: leftCards[i],
                side: "left"
            });
        }

        if (rightCards[i]) {
            orbitCards.push({
                card: rightCards[i],
                side: "right"
            });
        }
    }


    /* 카드 초기 상태 */
    var allCards = orbitCards.map(function (item) {
        return item.card;
    });

    var cardScale = 1;

    if (window.innerWidth <= 480) {
        cardScale = 0.8;
    } else if (window.innerWidth <= 767) {
        cardScale = 0.9;
    } else if (window.innerWidth <= 1199) {
        cardScale = 0.9
    }

    gsap.set(allCards, {
        xPercent: -50,
        yPercent: -50,
        scale: cardScale,
        opacity: 0,
        pointerEvents: "none"
    });

    setActiveGroup(null);


    /* 애니메이션 타이밍 */
    var invertTime = 0.08;
    var cardStartTime = 0.1;
    var cardGap = 0.07; // PC 기본
    if (isTablet) {
        cardGap = 0.11;
    }
    if (isMobile) {
        cardGap = 0.2;
    }
    var cardDuration = 0.28;
    var focusDelay = cardDuration * 0.35;

    var totalTime =
        cardStartTime +
        orbitCards.length * cardGap +
        cardDuration;


    /* 타임라인 */
    var tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",

            end: function () {
                return "+=" + scrollDistance;
            },

            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,

            onUpdate: function () {
                var time = tl.time();

                if (
                    time <
                    cardStartTime + focusDelay
                ) {
                    setActiveGroup(null);
                    return;
                }

                var activeIndex = Math.floor(
                    (
                        time -
                        cardStartTime -
                        focusDelay
                    ) / cardGap
                );

                if (activeIndex < 0) {
                    activeIndex = 0;
                }

                if (
                    activeIndex >
                    orbitCards.length - 1
                ) {
                    activeIndex =
                        orbitCards.length - 1;
                }

                var activeCard =
                    orbitCards[activeIndex].card;

                setActiveGroup(
                    activeCard.dataset.group
                );
            }
        }
    });


    /* 배경 반전 */
    tl.set(
        section, {
            backgroundColor: "#333333"
        },
        invertTime
    );


    /* 중앙 글자 색상 */
    tl.set(
        [
            ".solution_label",
            ".solution_desc",
            ".solution_word"
        ], {
            color: "#000000"
        },
        invertTime
    );


    /* 카드별 궤도 애니메이션 */
    orbitCards.forEach(function (item, index) {
        var card = item.card;
        var side = item.side;

        var start =
            cardStartTime +
            index * cardGap;

        var startAngle;
        var endAngle;

        if (side === "left") {
            startAngle = -62;
            endAngle = 72;
        } else {
            startAngle = 242;
            endAngle = 112;
        }

        var proxy = {
            angle: startAngle
        };

        var initialPosition =
            getOrbitValue(
                side,
                startAngle
            );

        gsap.set(card, {
            x: initialPosition.x,
            y: initialPosition.y
        });


        /* 궤도 이동 */
        tl.to(
            proxy, {
                angle: endAngle,
                duration: cardDuration,
                ease: "none",

                onUpdate: function () {
                    var position =
                        getOrbitValue(
                            side,
                            proxy.angle
                        );

                    gsap.set(card, {
                        x: position.x,
                        y: position.y
                    });
                }
            },
            start
        );


        /* 카드 나타남 */
        tl.to(
            card, {
                opacity: 1,
                pointerEvents: "auto",
                duration: 0.06,
                ease: "none"
            },
            start
        );


        /* 카드 사라짐 */
        tl.to(
            card, {
                opacity: 0,
                pointerEvents: "none",
                duration: 0.06,
                ease: "none"
            },
            start + cardDuration - 0.06
        );
    });


    /* 전체 타임라인 길이 확보 */
    tl.to({}, {
            duration: totalTime
        },
        0
    );
}


/* PC / 태블릿 / 모바일 모두 실행 */
initSolutionOrbit();









/* ── Our Solution Floating Deco ── */
function initSolutionFloating() {
    const section = document.querySelector(".solution_section");
    const items = gsap.utils.toArray(".solution_deco_item");

    if (!section || !items.length || prefersReducedMotion) return;

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

/* PC 전용으로 막혀있었으나, 마우스/스크롤에 의존하지 않는
   가벼운 무한 루프 애니메이션이라 모든 화면에서 실행 */
initSolutionFloating();




/* ── Why SMTNT: 타이틀/카드/장식/배경 텍스트 스크롤 진입·이탈 ──
   위로 스크롤해서 요소가 시작 지점 위로 벗어나면 다시 사라지고,
   다시 아래로 내리면 다시 나타나도록 toggleActions로 매번 반복되게 처리
   (once 없음 — play: 진입 시 등장 / leave: 그대로 유지(더 내려도 안 사라짐) /
    enterBack: 다시 진입 시 등장 / leaveBack: 위로 벗어나면 사라짐) */
function initWhySection() {
    const section = document.querySelector(".why_section");
    if (!section) return;

    const title = document.querySelector(".why_title");

    mm.add("(min-width: 1200px)", () => {
        const bgTexts = gsap.utils.toArray(".why_bg_text");
        const items = gsap.utils.toArray(".why_card, .why_deco");

        gsap.set(title, {
            opacity: 0,
            y: 40
        });
        gsap.set(bgTexts, {
            opacity: 0,
            y: 40
        });
        gsap.set(items, {
            opacity: 0,
            y: 60
        });

        gsap.to(title, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: title,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });

        bgTexts.forEach((el) => {
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        items.forEach((el) => {
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 88%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    });

    /* 태블릿/모바일: is_visible 클래스를 진입 시 붙이고, 위로 벗어나면 다시 뗌
       (mobile.css의 opacity/transform 트랜지션이 실제 등장/이탈을 처리) */
    if (!isDesktopViewport) {
        const titleEl = document.querySelector(".why_title");
        if (titleEl) {
            ScrollTrigger.create({
                trigger: titleEl,
                start: "top 90%",
                onEnter: () => titleEl.classList.add("is_visible"),
                onEnterBack: () => titleEl.classList.add("is_visible"),
                onLeaveBack: () => titleEl.classList.remove("is_visible")
            });
        }

        gsap.utils.toArray(".why_card, .why_deco, .why_bg_text").forEach((el) => {
            ScrollTrigger.create({
                trigger: el,
                start: "top 55%",
                onEnter: () => el.classList.add("is_visible"),
                onEnterBack: () => el.classList.add("is_visible"),
                onLeaveBack: () => el.classList.remove("is_visible")
            });
        });
    }
}

initWhySection();





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



/* 모바일/태블릿: 세로 스택 + 카드가 좌/우에서 45도 가량 기울어진 채
   들어오다가, 스크롤 위치가 맞춰지면(화면 중앙 근처) 정면으로 눕고
   중앙으로 정렬되는 1회성(반복 가능) 연출. pin/scrub 없음 */
function initPerformanceMobile() {
    const cards = gsap.utils.toArray(".performance_card");

    if (!cards.length) return;

    /* 회전 각도는 취향껏 조절 가능한 값 — 너무 크면(45deg) 글자가
       읽기 힘들어져서 18deg 정도로 우선 잡아둠 */
    const ROTATE_DEG = 18;

    cards.forEach((card, index) => {
        const fromLeft = index % 2 === 0;

        gsap.from(card, {
            xPercent: fromLeft ? -70 : 70,
            rotate: fromLeft ? -ROTATE_DEG : ROTATE_DEG,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
                trigger: card,
                start: "top 65%",
                end: "bottom 20%",
                toggleActions: "play reverse play reverse"
            }
        });
    });
}

if (window.innerWidth >= 1200) {
    initPerformanceMotion();
} else {
    initPerformanceMobile();
}





/* ── PC Keyword 큰 텍스트 분리 + 가로 피슝 라인 ── */
function initKeywordSplit() {
    const section = document.querySelector(".keyword_section");
    const items = gsap.utils.toArray(".keyword_item");

    if (!section || !items.length) return;


    /* ==============================
       피슝 라인 자동 생성
    ============================== */

    items.forEach((item) => {
        const pin = item.querySelector(".keyword_pin");

        if (!pin) return;

        if (!pin.querySelector(".keyword_motion_line")) {
            const glowLine = document.createElement("span");
            const mainLine = document.createElement("span");

            glowLine.className =
                "keyword_motion_line line_glow";

            mainLine.className =
                "keyword_motion_line line_main";

            pin.prepend(glowLine);
            pin.prepend(mainLine);
        }
    });


    /* ==============================
       초기 상태 설정
    ============================== */

    gsap.set(items, {
        autoAlpha: 0,
        x: 0,
        y: 0
    });

    items.forEach((item) => {
        const parts =
            item.querySelectorAll(".keyword_title span");

        const desc =
            item.querySelector(".keyword_desc");

        const lines =
            item.querySelectorAll(".keyword_motion_line");

        gsap.set(parts, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0
        });

        if (desc) {
            gsap.set(desc, {
                opacity: 0,
                scale: 0.96
            });
        }

        gsap.set(lines, {
            scaleX: 0,
            scaleY: 1,
            opacity: 0
        });
    });


    /* 첫 번째 키워드 표시 */
    gsap.set(items[0], {
        autoAlpha: 1
    });


    /* ==============================
       메인 스크롤 타임라인
    ============================== */

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",

            end: () => `+=${items.length * 1400}`,

            pin: true,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });


    items.forEach((item, index) => {
        const isLR =
            item.classList.contains("keyword_lr");

        const left =
            item.querySelector(".keyword_left");

        const right =
            item.querySelector(".keyword_right");

        const top =
            item.querySelector(".keyword_top");

        const bottom =
            item.querySelector(".keyword_bottom");

        const desc =
            item.querySelector(".keyword_desc");

        const mainLine =
            item.querySelector(".line_main");

        const glowLine =
            item.querySelector(".line_glow");


        const start = index * 1.6;

        const enterDuration =
            index === 0 ? 0 : 0.38;


        /*
         * 화면 중앙에 도착한 다음
         * 피슝 라인과 텍스트 분리 시작
         */
        const focusStart =
            start +
            enterDuration +
            0.18;


        /*
         * 키워드마다 진입 방향 교차
         *
         * 1, 3번째: 아래에서 위로
         * 2, 4번째: 오른쪽에서 왼쪽으로
         */
        const enterAxis =
            index % 2 === 0 ? "y" : "x";

        const enterValue =
            index % 2 === 0 ?
            "100vh" :
            "100vw";


        /* ==============================
           아이템 등장
        ============================== */

        tl.set(
            item, {
                autoAlpha: 1,
                x: 0,
                y: 0
            },
            start
        );


        if (index !== 0) {
            tl.fromTo(
                item, {
                    [enterAxis]: enterValue
                }, {
                    [enterAxis]: 0,
                    duration: enterDuration,
                    ease: "none"
                },
                start
            );
        }


        /* ==============================
           피슝 빛 번짐 라인
        ============================== */

        if (glowLine) {
            tl.fromTo(
                glowLine, {
                    scaleX: 0.02,
                    opacity: 0,
                    filter: "blur(12px)"
                }, {
                    scaleX: 1,
                    opacity: 0.9,
                    filter: "blur(6px)",
                    duration: 0.12,
                    ease: "power4.out"
                },
                focusStart
            );
        }


        /* ==============================
           피슝 메인 라인
        ============================== */

        if (mainLine) {
            tl.fromTo(
                mainLine, {
                    scaleX: 0,
                    opacity: 0
                }, {
                    scaleX: 1,
                    opacity: 1,
                    duration: 0.1,
                    ease: "power4.out"
                },
                focusStart + 0.02
            );
        }


        /* ==============================
           큰 키워드 텍스트 분리
        ============================== */

        if (isLR && left && right) {
            /*
             * 좌우 분리
             * Expertise / Support
             */
            tl.to(
                left, {
                    x: "-18vw",
                    duration: 0.45,
                    ease: "power2.out"
                },
                focusStart + 0.06
            );

            tl.to(
                right, {
                    x: "18vw",
                    duration: 0.45,
                    ease: "power2.out"
                },
                focusStart + 0.06
            );
        } else if (top && bottom) {
            /*
             * 상하 분리
             * ONE-STOP / Experience
             */
            tl.to(
                top, {
                    y: "-8rem",
                    duration: 0.45,
                    ease: "power2.out"
                },
                focusStart + 0.06
            );

            tl.to(
                bottom, {
                    y: "8rem",
                    duration: 0.45,
                    ease: "power2.out"
                },
                focusStart + 0.06
            );
        }


        /* ==============================
           설명 문구 등장
        ============================== */

        if (desc) {
            tl.to(
                desc, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.24,
                    ease: "power2.out"
                },
                focusStart + 0.22
            );
        }


        /* ==============================
           피슝 메인 라인 소멸
        ============================== */

        if (mainLine) {
            tl.to(
                mainLine, {
                    scaleX: 1.15,
                    opacity: 0,
                    duration: 0.18,
                    ease: "power2.in"
                },
                focusStart + 0.15
            );
        }


        /* ==============================
           빛 번짐 라인 소멸
        ============================== */

        if (glowLine) {
            tl.to(
                glowLine, {
                    scaleX: 1.25,
                    opacity: 0,
                    filter: "blur(14px)",
                    duration: 0.24,
                    ease: "power2.out"
                },
                focusStart + 0.14
            );
        }


        /* ==============================
           다음 키워드로 전환
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


            tl.to(
                item, {
                    [exitAxis]: exitValue,
                    duration: 0.45,
                    ease: "none"
                },
                exitStart
            );


            tl.set(
                item, {
                    autoAlpha: 0
                },
                exitStart + 0.45
            );
        }
    });
}





/* ── 모바일 / 태블릿 Keyword 피슝 애니메이션 ── */
function initKeywordMobile() {
    const section = document.querySelector(".keyword_section");
    const items = gsap.utils.toArray(".keyword_item");

    if (!section || !items.length) return;

    gsap.set(items, {
        autoAlpha: 1
    });

    items.forEach((item, index) => {
        const pin = item.querySelector(".keyword_pin");
        const title = item.querySelector(".keyword_title");
        const desc = item.querySelector(".keyword_desc");

        if (!pin || !title || !desc) return;

        /*
         * keyword_pin 기준으로 라인이 중앙에 위치하도록 설정
         * 기존 글자 구조에는 영향을 주지 않음
         */
        gsap.set(pin, {
            position: "relative"
        });

        /*
         * 모바일 피슝 라인 자동 생성
         */
        let lineWrap = pin.querySelector(".keyword_mobile_line_wrap");

        if (!lineWrap) {
            lineWrap = document.createElement("div");
            lineWrap.className = "keyword_mobile_line_wrap";

            const glowLine = document.createElement("span");
            glowLine.className = "keyword_mobile_glow";

            const mainLine = document.createElement("span");
            mainLine.className = "keyword_mobile_main";

            lineWrap.appendChild(glowLine);
            lineWrap.appendChild(mainLine);

            pin.appendChild(lineWrap);
        }

        const mainLine = lineWrap.querySelector(".keyword_mobile_main");
        const glowLine = lineWrap.querySelector(".keyword_mobile_glow");

        /*
         * CSS 파일 수정 없이 JS에서 피슝 라인 스타일 지정
         */
        function setLinePosition() {
            const pinRect = pin.getBoundingClientRect();
            const titleRect = title.getBoundingClientRect();

            const titleCenterY =
                titleRect.top - pinRect.top + titleRect.height / 2;

            gsap.set(lineWrap, {
                position: "absolute",
                left: "50%",
                top: titleCenterY,
                xPercent: -50,
                yPercent: -50,
                width: "100%",
                height: "16px",
                zIndex: 1,
                pointerEvents: "none",
                overflow: "visible"
            });
        }

        setLinePosition();

        window.addEventListener("resize", setLinePosition);

        gsap.set([mainLine, glowLine], {
            position: "absolute",
            left: 0,
            top: "50%",
            width: "100%",
            transformOrigin: "center center",
            scaleX: 0,
            opacity: 0,
            pointerEvents: "none"
        });

        gsap.set(mainLine, {
            height: "2px",
            yPercent: -50,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.15) 80%, transparent 100%)"
        });

        gsap.set(glowLine, {
            height: "10px",
            yPercent: -50,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 15%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.05) 85%, transparent 100%)",
            filter: "blur(7px)"
        });

        /*
         * 글자가 라인보다 위에 보이도록 설정
         */
        gsap.set([title, desc], {
            position: "relative",
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
            zIndex: 2
        });

        /*
         * 1, 3번째는 왼쪽에서
         * 2, 4번째는 오른쪽에서
         */
        const fromLeft = index % 2 === 0;
        const fromX = fromLeft ? -35 : 35;

        const lineOrigin = fromLeft ?
            "left center" :
            "right center";

        gsap.set([mainLine, glowLine], {
            transformOrigin: lineOrigin
        });

        const prevItem = index > 0 ? items[index - 1] : null;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top 72%",
                toggleActions: "play none none reverse"
            }
        });

        /* 다음 item이 등장할 때 이전 item을 같이 사라지게 하는 효과는
           별도의 scrub 트윈으로 분리 — 시간 기반 play/reverse 타임라인에 얹으면
           스크롤을 위로 되돌릴 때 트리거 시점을 정확히 되짚어 지나가야만
           역재생이 붙어서 "내릴 때만 되고 올릴 땐 안 되는" 문제가 있었음.
           scrub은 스크롤 위치에 실시간으로 물려서 방향 상관없이 항상 맞게 따라옴 */
        if (prevItem) {
            gsap.fromTo(
                prevItem, {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)"
                }, {
                    opacity: 0,
                    y: -30,
                    filter: "blur(8px)",
                    ease: "power1.inOut",

                    scrollTrigger: {
                        trigger: item,

                        /* 다음 아이템이 들어오기 시작하면 이전 아이템 퇴장 */
                        start: "top 60%",

                        /* 넉넉한 스크롤 구간에 걸쳐 자연스럽게 사라짐 */
                        end: "top 50%",

                        /* true보다 숫자를 주면 스크롤을 부드럽게 따라감 */
                        scrub: 0.5
                    }
                }
            );
        }

        /* 피슝 빛 번짐 */
        tl.fromTo(
            glowLine, {
                scaleX: 0,
                opacity: 0
            }, {
                scaleX: 1,
                opacity: 0.9,
                duration: 0.22,
                ease: "power4.out"
            }
        );

        /* 선명한 중앙 라인 */
        tl.fromTo(
            mainLine, {
                scaleX: 0,
                opacity: 0
            }, {
                scaleX: 1,
                opacity: 1,
                duration: 0.18,
                ease: "power4.out"
            },
            "<0.03"
        );

        /* 키워드 진입 */
        tl.fromTo(
            title, {
                xPercent: fromX,
                scale: 1.05,
                opacity: 0,
                filter: "blur(8px)"
            }, {
                xPercent: 0,
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.58,
                ease: "power4.out"
            },
            "-=0.08"
        );

        /* 중앙 라인 잔상 제거 */
        tl.to(
            mainLine, {
                scaleX: 1.08,
                opacity: 0,
                duration: 0.22,
                ease: "power2.in"
            },
            "-=0.3"
        );

        tl.to(
            glowLine, {
                scaleX: 1.15,
                opacity: 0,
                duration: 0.3,
                ease: "power2.out"
            },
            "<"
        );

        /* 설명 등장 */
        tl.fromTo(
            desc, {
                y: 24,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                duration: 0.48,
                ease: "power3.out"
            },
            "-=0.08"
        );
    });
}


/* PC와 태블릿·모바일 애니메이션 분리 */
if (window.innerWidth >= 1200) {
    initKeywordSplit();
} else {
    initKeywordMobile();
}







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

        const isMobileViewport = window.innerWidth <= 1199;

        const gap = window.innerWidth * 0.015;
        const lineGap = window.innerHeight * 0.09;

        const targetStartX = window.innerWidth * (isMobileViewport ? 0.05 : 0.13);
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

    // 목적 위치를 한 번만 계산
    const targets = words.map(word => getTarget(word));

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "top+=500 top",
            scrub: 0.3,
            invalidateOnRefresh: true
        }
    });

    words.forEach((word, i) => {
        tl.to(word, {
            x: targets[i].x,
            y: targets[i].y,
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

    /* 모바일/태블릿에서는 PC용 canvas + pin 애니메이션 실행 안 함 */
    if (window.innerWidth < 1200) return;

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
    // 기존 아래 코드 그대로

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

/* ===========================
    서비스가 만들어지는 과정
    모바일 타임라인 애니메이션
=========================== */

(function () {

    /* PC에서는 실행 안 함 */
    if (window.innerWidth >= 1200) return;

    if (!window.gsap || !window.ScrollTrigger) {
        console.warn("GSAP / ScrollTrigger 로드 필요");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const items = gsap.utils.toArray(".process_mobile_item");

    if (!items.length) return;

    items.forEach((item) => {
        const marker = item.querySelector(".process_mobile_marker");
        const content = item.querySelector(".process_mobile_content");

        /* 항목 전체를 왼쪽으로 숨김 */
        gsap.set(item, {
            x: -60,
            opacity: 0
        });

        /* 숫자 원은 작게 시작 */
        gsap.set(marker, {
            scale: 0.4,
            transformOrigin: "center center"
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top 70%",
                toggleActions: "play none none reverse"
            }
        });

        /* 동그라미 + 글씨 전체가 옆으로 솟아 나옴 */
        tl.to(item, {
            x: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out"
        });

        /* 숫자 원이 통 튀어나옴 */
        tl.to(marker, {
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.8)"
        }, "-=0.55");

        /* 글씨가 아래에서 살짝 올라옴 */
        tl.to(content, {
            y: 0,
            duration: 0.55,
            ease: "power3.out"
        }, "-=0.5");
    });

})();

window.addEventListener("load", () => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
});

/* 웹폰트가 window load 이후 늦게 도착하면 ScrollTrigger 시작좌표가
   폰트 적용 전 레이아웃 기준으로 고정돼버려서 scatter_section 등에서
   스크롤 싱크가 밀리는 문제가 있었음 → 폰트 로드 완료 후 강제 재계산 */
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
    });
}










/* ── News Slider ── */
function initNewsSlider() {
    const slider = document.querySelector(".news_slider");
    const currentEl = document.querySelector(".news_current");
    const totalEl = document.querySelector(".news_total");

    if (!slider || !currentEl || !totalEl) return;

    const wrapper = slider.querySelector(".swiper-wrapper");

    if (!wrapper) return;

    const DESKTOP_GROUP_SIZE = 5;

    /*
        1. 기존에 만들어진 빈 슬라이드가 있다면 제거
        2. 실제 뉴스 개수를 기준으로
        3. 5개 단위가 되도록 부족한 만큼 빈 슬라이드 추가
    */
    function createBlankSlides() {
        wrapper
            .querySelectorAll(".news_slide_blank")
            .forEach((blank) => blank.remove());

        const realSlides = wrapper.querySelectorAll(
            ".news_slide:not(.news_slide_blank)"
        );

        const remainder = realSlides.length % DESKTOP_GROUP_SIZE;

        if (remainder === 0) return;

        const blankCount = DESKTOP_GROUP_SIZE - remainder;

        for (let i = 0; i < blankCount; i++) {
            const blankSlide = document.createElement("div");

            blankSlide.className =
                "swiper-slide news_slide news_slide_blank";

            blankSlide.setAttribute("aria-hidden", "true");

            wrapper.appendChild(blankSlide);
        }
    }

    createBlankSlides();

    /*
        현재 페이지 / 전체 페이지 표시
        빈 슬라이드는 전체 뉴스 개수에서 제외
    */
    function updateNewsFraction(swiper) {
        const group = Number(swiper.params.slidesPerGroup) || 1;

        const realSlides = wrapper.querySelectorAll(
            ".news_slide:not(.news_slide_blank)"
        );

        const totalPages = Math.ceil(realSlides.length / group);

        const currentPage = Math.min(
            Math.floor(swiper.activeIndex / group) + 1,
            totalPages
        );

        currentEl.textContent = currentPage;
        totalEl.textContent = totalPages;
    }

    const newsSwiper = new Swiper(slider, {
        speed: 750,
        loop: false,
        watchOverflow: true,
        grabCursor: true,

        slidesPerView: 5,
        slidesPerGroup: 5,
        spaceBetween: 24,

        navigation: {
            prevEl: ".news_prev",
            nextEl: ".news_next"
        },

        breakpoints: {
            0: {
                slidesPerView: 2.5,
                slidesPerGroup: 1,
                spaceBetween: 16
            },

            768: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 20
            },

            1024: {
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 22
            },

            1440: {
                slidesPerView: 5,
                slidesPerGroup: 5,
                spaceBetween: 24
            }
        },

        on: {
            init(swiper) {
                updateNewsFraction(swiper);
            },

            slideChange(swiper) {
                updateNewsFraction(swiper);
            },

            breakpoint(swiper) {
                swiper.slideTo(0, 0);
                updateNewsFraction(swiper);
            },

            resize(swiper) {
                updateNewsFraction(swiper);
            }
        }
    });
}

initNewsSlider();



/* ── Footer Reveal (하단 고정 + 스크롤에 따라 공개) ── */
(() => {
    const footer = document.querySelector(".footer");
    const spacer = document.querySelector(".footer_spacer");
    if (!footer || !spacer) return;

    const setFooterHeight = () => {
        const height = footer.offsetHeight;
        document.documentElement.style.setProperty("--footer-height", `${height}px`);
        ScrollTrigger.refresh();
    };

    setFooterHeight();
    window.addEventListener("load", setFooterHeight);
    window.addEventListener("resize", setFooterHeight);

    /* 모바일 주소창 표시/숨김으로 실제 뷰포트 높이만 바뀌는 경우
       (window resize가 안 잡히는 경우가 있어) visualViewport로 별도 감지 */
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", setFooterHeight);
    }

    /* 웹폰트 로드로 footer_inner 실제 높이가 늦게 바뀌는 경우 대비 */
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(setFooterHeight);
    }

    // footer_spacer가 화면에 실제로 들어왔을 때만 footer를 클릭 가능하게 전환
    // (다른 곳에서 클릭이 새어 들어가는 걸 막기 위한 안전장치)
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            footer.classList.toggle("is_visible", entry.isIntersecting);
        });
    }, {
        threshold: 0
    });

    io.observe(spacer);
})();


/* ── Footer 배경 워터마크 패턴 ── */
function initFooterPattern() {
    const el = document.querySelector(".footer_pattern");
    if (!el) return;

    const phrase = "· SMTNT · CONNECT · PROTECT · CREATE";
    const rowCount = 9; //몇줄
    const repeatPerRow = 10;
    let html = "";
    for (let i = 0; i < rowCount; i++) {
        html += `<div class="footer_pattern_row">${phrase.repeat(repeatPerRow)}</div>`;
    }
    el.innerHTML = html;
}
initFooterPattern();





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


let previousWidth = window.innerWidth;
let resizeTimer;

window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function () {
        const currentWidth = window.innerWidth;

        if (currentWidth !== previousWidth) {
            window.location.reload();
        }
    }, 300);
});