document.addEventListener('DOMContentLoaded', () => {

    const homepageData = window.CHYK_DATA && window.CHYK_DATA.homepage;

    // Responsive layouts share the desktop content so future edits cannot
    // drift between desktop, tablet, and mobile.
    const syncResponsiveHomepageContent = () => {
        const desktopTitle = document.querySelector('.hero-title');
        const mobileTitle = document.querySelector('.m-hero-title');
        if (desktopTitle && mobileTitle) {
            mobileTitle.innerHTML = desktopTitle.innerHTML.replace(/gold-text/g, 'm-gold');
        }

        const desktopSubtitle = document.querySelector('.hero-subtitle');
        const mobileSubtitle = document.querySelector('.m-hero-sub');
        if (desktopSubtitle && mobileSubtitle) {
            mobileSubtitle.textContent = desktopSubtitle.textContent.trim();
        }

        const desktopStats = Array.from(document.querySelectorAll('.floating-node'));
        const mobileStats = Array.from(document.querySelectorAll('.m-hero-chips .m-chip'));
        desktopStats.forEach((stat, index) => {
            if (mobileStats[index]) mobileStats[index].textContent = stat.textContent.trim();
        });

        const desktopImages = Array.from(document.querySelectorAll('.horizontal-track .scrapbook-item img'));
        const mobileImages = Array.from(document.querySelectorAll('#m-deck .m-deck-card:not(.m-deck-quote) img'));
        desktopImages.forEach((sourceImage, index) => {
            const responsiveImage = mobileImages[index];
            if (!responsiveImage) return;
            responsiveImage.src = sourceImage.currentSrc || sourceImage.getAttribute('src');
            responsiveImage.alt = sourceImage.alt;
        });

        const goldWordCounts = [1, 2, 2, 1, 2, 1, 1, 2];
        const desktopGoals = Array.from(document.querySelectorAll('.horizontal-track .text-holder'));
        const mobileGoals = Array.from(document.querySelectorAll('#m-deck .m-deck-quote'));
        desktopGoals.forEach((goal, index) => {
            const sourceTitle = goal.querySelector('h2');
            const sourceDescription = goal.querySelector('p');
            const responsiveTitle = mobileGoals[index] && mobileGoals[index].querySelector('h3');
            const responsiveDescription = mobileGoals[index] && mobileGoals[index].querySelector('p');

            if (sourceTitle && responsiveTitle) {
                const words = sourceTitle.textContent.trim().split(/\s+/);
                const goldCount = Math.min(goldWordCounts[index] || 1, words.length);
                const regularWords = words.slice(0, -goldCount).join(' ');
                const goldWords = words.slice(-goldCount).join(' ');
                responsiveTitle.replaceChildren();
                if (regularWords) responsiveTitle.append(`${regularWords} `);
                const accent = document.createElement('span');
                accent.className = 'm-gold';
                accent.textContent = goldWords;
                responsiveTitle.append(accent);
            }

            if (sourceDescription && responsiveDescription) {
                responsiveDescription.textContent = sourceDescription.textContent.trim();
            }
        });
    };

    syncResponsiveHomepageContent();

    const responsiveSources = [
        document.querySelector('.hero-content'),
        document.querySelector('.horizontal-track')
    ].filter(Boolean);
    if (responsiveSources.length && window.MutationObserver) {
        let syncFrame = 0;
        const responsiveObserver = new MutationObserver(() => {
            cancelAnimationFrame(syncFrame);
            syncFrame = requestAnimationFrame(syncResponsiveHomepageContent);
        });
        responsiveSources.forEach((source) => responsiveObserver.observe(source, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['src', 'alt']
        }));
    }

    if (homepageData && Array.isArray(homepageData.milestones)) {
        const carousel = document.querySelector('.carousel-container');
        const rope = carousel && carousel.querySelector('.golden-rope');
        if (carousel && rope) {
            carousel.querySelectorAll('.deck-card').forEach((card) => card.remove());
            homepageData.milestones.forEach((milestone, index) => {
                const card = document.createElement('div');
                card.className = 'deck-card';
                card.dataset.description = milestone.description;

                const imageWrap = document.createElement('div');
                imageWrap.className = 'deck-img-wrapper';
                const image = document.createElement('img');
                image.src = milestone.image || 'assets/site/home/images/milestone-fallback.jpeg';
                image.dataset.thumbnailSrc = milestone.image || 'assets/site/home/images/milestone-fallback.jpeg';
                image.dataset.detailSrc = milestone.detailImage || milestone.image || 'assets/site/home/images/milestone-fallback.jpeg';
                image.style.objectPosition = milestone.imagePosition || 'center 30%';
                image.alt = milestone.title;
                image.loading = 'lazy';
                image.decoding = 'async';
                image.onerror = () => { image.src = 'assets/site/home/images/milestone-fallback.jpeg'; };
                imageWrap.appendChild(image);

                const content = document.createElement('div');
                content.className = 'deck-content';
                const title = document.createElement('h4');
                title.textContent = milestone.title;
                const subtitle = document.createElement('p');
                subtitle.textContent = `${milestone.tagline} // ${milestone.year}`;
                content.append(title, subtitle);
                card.append(imageWrap, content);
                carousel.insertBefore(card, rope);
            });
        }
    }

    const ascentQuestion = document.getElementById('void-game-question');
    if (ascentQuestion && homepageData && homepageData.ascentPrompts.length) {
        const prompts = homepageData.ascentPrompts;
        const previousIndex = Number(sessionStorage.getItem('chyk-ascent-prompt'));
        let promptIndex = Math.floor(Math.random() * prompts.length);
        if (prompts.length > 1 && promptIndex === previousIndex) {
            promptIndex = (promptIndex + 1 + Math.floor(Math.random() * (prompts.length - 1))) % prompts.length;
        }

        const showPrompt = (nextIndex, animate = false) => {
            promptIndex = nextIndex;
            sessionStorage.setItem('chyk-ascent-prompt', String(promptIndex));
            if (animate && window.gsap) {
                gsap.to(ascentQuestion, {
                    opacity: 0, y: 5, duration: 0.16,
                    onComplete: () => {
                        ascentQuestion.textContent = prompts[promptIndex].question;
                        gsap.to(ascentQuestion, { opacity: 1, y: 0, duration: 0.24 });
                    }
                });
            } else {
                ascentQuestion.textContent = prompts[promptIndex].question;
            }
        };

        const nextPrompt = () => {
            const step = prompts.length > 2 ? 1 + Math.floor(Math.random() * (prompts.length - 1)) : 1;
            showPrompt((promptIndex + step) % prompts.length, true);
        };

        showPrompt(promptIndex);
        const voidContent = document.querySelector('.void-content');
        const promptCard = document.querySelector('.void-game-card');
        const nextQuestionButton = document.getElementById('void-next-question');
        if (voidContent) voidContent.addEventListener('click', nextPrompt);
        if (promptCard) promptCard.addEventListener('click', (event) => event.stopPropagation());
        if (nextQuestionButton) {
            nextQuestionButton.addEventListener('click', (event) => {
                event.stopPropagation();
                nextPrompt();
            });
        }
    }

    // View Background Button Logic
    const viewBgBtn = document.getElementById('view-bg-btn');
    if (viewBgBtn) {
        let isBgMode = false;
        let bgContext = 'hero';
        const heroElements = ['.site-header', '.hero-tag', '.hero-main', '.scroll-indicator', '.hero-darkness', '.floating-node', '.logo.top-left'];
        const voidElements = ['.site-header', '.persistent-chyk-logo', '.void-darkness', '.void-center-text'];

        const restoreBgView = () => {
            if (!isBgMode) return;
            isBgMode = false;
            document.body.classList.remove('viewing-home-bg', 'viewing-void-bg');
            gsap.to([...heroElements, ...voidElements], { opacity: 1, pointerEvents: 'auto', duration: 0.35, overwrite: true });
        };

        window.setViewBgContext = (context) => {
            if (context !== bgContext) restoreBgView();
            bgContext = context;
            const visible = context === 'hero' || context === 'void';
            viewBgBtn.classList.toggle('is-visible', visible);
            viewBgBtn.innerText = context === 'void' ? 'VIEW GURUDEV ARCHIVE' : 'VIEW BG';
        };

        viewBgBtn.addEventListener('click', () => {
            isBgMode = !isBgMode;
            const elementsToHide = bgContext === 'void' ? voidElements : heroElements;
            if (isBgMode) {
                viewBgBtn.innerText = 'RESTORE VIEW';
                document.body.classList.add(bgContext === 'void' ? 'viewing-void-bg' : 'viewing-home-bg');
                gsap.to(elementsToHide, {
                    opacity: 0,
                    pointerEvents: 'none',
                    duration: 0.5,
                    ease: "power2.inOut"
                });
            } else {
                document.body.classList.remove('viewing-home-bg', 'viewing-void-bg');
                viewBgBtn.innerText = bgContext === 'void' ? 'VIEW GURUDEV ARCHIVE' : 'VIEW BG';
                gsap.to(elementsToHide, {
                    opacity: 1,
                    pointerEvents: 'auto',
                    duration: 0.5,
                    ease: "power2.inOut",
                    clearProps: "pointerEvents"
                });
            }
        });

        const updateHeroBgButton = () => {
            if (bgContext === 'void') return;
            window.setViewBgContext(window.scrollY < window.innerHeight * 1.15 ? 'hero' : 'hidden');
        };
        window.addEventListener('scroll', updateHeroBgButton, { passive: true });
        updateHeroBgButton();
    }

    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    // Device detection (set once at load; viewport resize doesn't reinit heavy GSAP)
    // isMobile now covers both phones AND tablets (≤1024px) — CSS horizontal snap-scroll
    // handles the milestone carousel on these devices instead of GSAP.
    const isMobile = window.innerWidth <= 1024;
    const isTouch  = window.innerWidth <= 1024;

    // ── ADAPTIVE PERFORMANCE TIERS ──────────────────────────────────────
    // Capability + network detection, not just viewport width.
    //   high     → full cinematic experience (unchanged)
    //   balanced → same visuals, lighter loops / windowed tunnel loading
    //   low      → static fallbacks, native scroll, no heavy media
    const PERF = (function () {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const conn = navigator.connection || navigator.webkitConnection || {};
        const saveData = !!conn.saveData;
        const net = String(conn.effectiveType || '');
        const mem = navigator.deviceMemory || 8;       // undefined → assume capable
        const cores = navigator.hardwareConcurrency || 8;
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        let tier = 'high';
        if (mem <= 4 || cores <= 4 || net === '3g' || coarse) tier = 'balanced';
        if (reducedMotion || saveData || net === 'slow-2g' || net === '2g' || mem <= 2 || cores <= 2) tier = 'low';
        // Manual override for testing: index.html?perf=low|balanced|high
        const forced = new URLSearchParams(window.location.search).get('perf');
        if (forced === 'low' || forced === 'balanced' || forced === 'high') tier = forced;
        return {
            tier: tier,
            reducedMotion: reducedMotion,
            slowNet: saveData || net === 'slow-2g' || net === '2g' || net === '3g',
            fx: tier === 'high',            // decorative loops, tilt, mouse parallax
            nativeScroll: tier === 'low',   // reduced-motion / low-power → no Lenis
            dpr: tier === 'high' ? Math.min(window.devicePixelRatio || 1, 2) : 1
        };
    })();
    window.CHYK_PERF = PERF;
    document.documentElement.classList.add('perf-' + PERF.tier);

    // scrub helper: low tier maps scroll 1:1 (no damping work on weak CPUs)
    const scrubFor = (v) => (PERF.nativeScroll ? true : v);

    // Fully cancels a <video> the current layout/tier never shows —
    // display:none alone does NOT stop the bytes from downloading.
    function neutralizeVideo(video) {
        if (!video) return;
        try {
            video.removeAttribute('autoplay');
            video.pause();
            video.querySelectorAll('source').forEach(s => s.removeAttribute('src'));
            video.removeAttribute('src');
            video.load();
        } catch (e) { /* ignore */ }
    }
    // Attaches a deferred data-src source — the bytes are only requested on
    // tiers/viewports that actually play the video.
    function hydrateVideo(video, preload) {
        if (!video) return;
        let attached = false;
        video.querySelectorAll('source[data-src]').forEach(s => {
            s.src = s.dataset.src;
            attached = true;
        });
        if (attached) {
            video.preload = preload || 'auto';
            video.load();
        }
    }
    if (isMobile) {
        // Desktop-only media hidden by CSS on ≤1024px (sources never attached
        // for preloader/main; final video gets cancelled outright)
        document.querySelectorAll('.preloader-vid, .main-vid, .final-hover-vid').forEach(neutralizeVideo);
        if (PERF.tier === 'low') {
            document.querySelectorAll('.m-hero-vid').forEach(neutralizeVideo);
        } else {
            const mobileVideos = document.querySelectorAll('.m-hero-vid');
            mobileVideos.forEach((video, index) => hydrateVideo(video, index === 0 ? 'auto' : 'metadata'));
            const activeMobileVideo = mobileVideos[0];
            if (activeMobileVideo) {
                const playback = activeMobileVideo.play();
                if (playback && playback.catch) playback.catch(() => {});
            }
        }
    } else {
        // Mobile hero videos hidden by CSS on desktop
        document.querySelectorAll('.m-hero-vid').forEach(neutralizeVideo);
        if (PERF.tier !== 'low') {
            // Capable desktop: attach + buffer the hero/preloader videos now
            const preloaderSource = document.querySelector('.preloader-vid source[data-src]');
            if (preloaderSource) {
                preloaderSource.dataset.src = PERF.tier === 'high'
                    ? './assets/site/home/video/preloader-main.mp4'
                    : './pre loader half.mp4';
            }
            hydrateVideo(document.querySelector('.preloader-vid'), 'auto');
            hydrateVideo(document.querySelector('.main-vid'), 'auto');
        } else {
            neutralizeVideo(document.querySelector('.final-hover-vid'));
        }
        // Low tier: sources stay detached — static poster fallback via CSS
    }

    // Global Interactive Physics State (Hoisted for timeline access)
    let spotlightObj = { r: 0, stretch: 0, angle: 0 }; 
    
    // Canvas Map Reveal State
    let isVoidRevealing = false;
    let voidCtx = null;
    let voidRevealRadius = { val: 0 };

    // 1. Smooth scroll — Lenis driven by gsap.ticker (single rAF source).
    // The old setup ran two independent rAF loops (Lenis + GSAP) and a 1.2 s
    // inertia curve, which read as touchpad lag. Low tier keeps native scroll.
    let lenis = null;
    if (!PERF.nativeScroll) {
        lenis = new Lenis({
            duration: 0.8,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            wheelMultiplier: 1,
            touchMultiplier: 1.4
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        lenis.stop(); // Stop during load
        window.__CHYK_LENIS = lenis; // debug/testing handle
    }

    const preloaderVid = document.querySelector('.preloader-vid');
    const mainVid = document.querySelector('.main-vid');
    const heroContent = document.querySelector('.hero-content');

    // 7. Unified Horizontal Experience Animation
    const horizontalSection = document.querySelector('.horizontal-experience');
    const horizontalTrack = document.querySelector('.horizontal-track');

    if (horizontalSection && horizontalTrack && !isMobile) {
        let horizontalTl = gsap.timeline({
            scrollTrigger: {
                trigger: horizontalSection,
                start: "top top",
                // Low tier travels the same distance with less scroll work
                end: () => "+=" + (horizontalTrack.scrollWidth * (PERF.tier === 'low' ? 1.6 : 2.4)),
                scrub: scrubFor(0.7), // was 1.2 — heavy damping delayed touchpad response
                pin: true,
                invalidateOnRefresh: true
            }
        });

        // 1. Ensure content is visible and at zero position before animation starts
        gsap.set('.hero-content', { autoAlpha: 1, x: 0 });

        // Move hero content away with a POWERFUL SLIDE
        // Simplified transition for hero elements: move them together without parallax
        horizontalTl.to('.hero-content, .hero-main, .hero-tag, .floating-node', {
            x: () => -window.innerWidth * 1.2,
            autoAlpha: 0,
            duration: 1.5,
            ease: "power2.inOut"
        }, 0);

        // Fade in the persistent CHYK logo exactly as the hero content fades out
        horizontalTl.to('.persistent-chyk-logo', {
            autoAlpha: 1,
            duration: 1.5,
            ease: "power2.inOut"
        }, 0);

        horizontalTl.to('.chyk-objective-panel', {
            autoAlpha: 1,
            duration: 0.45,
            ease: 'power2.out'
        }, 0.7);
        horizontalTl.to('.chyk-objective-panel', {
            autoAlpha: 0,
            duration: 0.45,
            ease: 'power2.in'
        }, 2.25);

        // Fade out hero background completely to reveal the solid black container
        // Fade out hero background and video completely
        horizontalTl.to('.hero-darkness, .hero-bg, .main-vid', {
            opacity: 0,
            autoAlpha: 0,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                // Completely hide hero to save performance and prevent flashing
                gsap.set('.hero-bg, .hero-darkness, .hero-content', { autoAlpha: 0 });
                // Off-screen: stop the looping hero video and the flashlight physics loop
                if (mainVid) mainVid.pause();
                setPhysicsActive(false);
            },
            onReverseComplete: () => {
                // Restore hero when scrolling back to start
                gsap.set('.hero-bg, .hero-darkness, .hero-content', { autoAlpha: 1 });
                if (mainVid && mainVid.currentSrc) {
                    const p = mainVid.play();
                    if (p && p.catch) p.catch(() => {});
                }
                setPhysicsActive(true);
            }
        }, 0);

        // REVEAL THE TOPOGRAPHIC LINES (Fixed visibility)
        horizontalTl.to('.scrapbook-svg', {
            opacity: 1,
            duration: 1.5,
            ease: "power2.out"
        }, 0.5);

        // Finalize the horizontal track movement to take up the rest of the timeline
        // Using a slightly longer duration to ensure it reaches the very end
        // The track's CSS width (900vw) under-measures the real content: the
        // final scrapbook item sits at 750vw INSIDE a track that starts after
        // a 150vw spacer, so its right edge lies past scrollWidth and the
        // closing image never fully entered the viewport. Measure the actual
        // extent of the items instead.
        const trackContentExtent = () => {
            let max = horizontalTrack.scrollWidth;
            horizontalTrack.querySelectorAll('.scrapbook-item, .text-holder').forEach(el => {
                let left = el.offsetLeft;
                if (el.offsetParent && el.offsetParent !== horizontalTrack) {
                    left += el.offsetParent.offsetLeft;
                }
                max = Math.max(max, left + el.offsetWidth);
            });
            return max;
        };

        horizontalTl.to(horizontalTrack, {
            x: () => -(trackContentExtent() + 60 - window.innerWidth),
            duration: 10,
            ease: "none"
        }, 0.5);

        // READABLE ENDING: hold the final state ("The Final Frontier" + closing
        // image) for ~10% of the pin before unpinning, instead of cutting away
        // the instant the movement completes. Reverse scrolling still works —
        // the hold is just timeline space at the end.
        horizontalTl.to({}, { duration: 1.1 });

        // REMOVED parallax from bg-stuff to prevent dizziness
        gsap.set('.bg-stuff', { x: 0 });

        // Ensure background is solid black throughout the first half
        horizontalTl.to('.horizontal-sticky', {
            backgroundColor: "#000",
            duration: 0.1 
        }, 0);

        // --- THEME SHIFT: BLACK TO WHITE ---
        // Triggered halfway through the horizontal journey to match the Story Section
        horizontalTl.to('.horizontal-sticky', {
            backgroundColor: "#ffffff",
            duration: 2,
            ease: "power2.inOut"
        }, 5);

        horizontalTl.to('.scrapbook-track', {
            '--gold': '#000000',
            color: "#000000",
            duration: 2
        }, 5);

        horizontalTl.to('.text-holder h2, .text-holder p, .scrapbook-text, .bg-stuff', {
            color: "#000000",
            duration: 2
        }, 5);

        // Topographic lines also shift color
        horizontalTl.to('.topo-line', {
            stroke: "#000000",
            duration: 2
        }, 5);

        // Transition to White theme to match the final gallery state
        horizontalTl.to('.horizontal-sticky', {
            backgroundColor: '#fff',
            duration: 2
        }, 5);

        // Fade in Story Art and Red Sun
        horizontalTl.from('.story-art-container, .story-red-sun', {
            opacity: 0,
            duration: 2
        }, 5.5);
    }

    // 8. Milestone Text Reveal (Now part of chyk-core)
    const chykCore = document.querySelector('.chyk-core');
    if (chykCore) {
        const textTl = gsap.timeline({
            scrollTrigger: {
                trigger: chykCore,
                start: "top center", // Text reveals before pinning
                toggleActions: "play none none reverse"
            }
        });

        textTl.from(".core-text-vertical .core-title", {
            y: 100,
            opacity: 0,
            duration: 1.2,
            ease: "power4.out"
        })
        .from(".core-text-vertical .core-line", {
            scaleX: 0,
            transformOrigin: "left",
            duration: 1,
            ease: "power4.out"
        }, "-=0.8")
        .from(".core-text-vertical .core-desc p", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        }, "-=0.6");
    }

        // --- IMMERSIVE 3D CAROUSEL ---
        const coreSection = document.querySelector('.chyk-core');
        const carouselContainer = document.querySelector('.carousel-container');
        const cards = document.querySelectorAll('.deck-card');
        
        if (coreSection && carouselContainer && cards.length > 0) {
            
            let activeIndex = 0;
            let isOverlayOpen = false;

            // Function to update all cards based on activeIndex
            function updateCarousel(hoverIndex = -1) {
                if (isMobile) return; // CSS handles card layout on mobile
                if (cards.length === 0) return;

                let lastCardXPush = 0;

                cards.forEach((card, i) => {
                    if (isOverlayOpen && i === activeIndex) {
                        // DO NOT UPDATE THE ACTIVE CARD IF IT IS EXPANDED!
                        return; 
                    }

                    const offset = i - activeIndex;
                    const absOffset = Math.abs(offset);
                    
                    // 1. Z-Depth: Deep immersive push into 3D space (Increased for less flatness)
                    let zPush = -absOffset * 250; 
                    
                    // 2. X-Axis Fan: Shift cards perfectly so they overlap (Increased spread)
                    let xPush = offset * (window.innerWidth * (isMobile ? 0.06 : 0.12));
                    
                    // 3. Y-Axis Arc: Drop down slightly as they go back
                    let yPush = absOffset * 25; 
                    
                    // 4. Rotation: Gentle tilt towards center (Increased tilt)
                    let rotY = -offset * 18; 
                    rotY = Math.max(-60, Math.min(60, rotY));
                    card.dataset.baseRotY = rotY; // Store base rotation for mouse parallax
                    
                    // Track the last card's position for the golden rope
                    // We will do this inside the GSAP onUpdate to perfectly track the 3D bounding box!
                    
                    // Center card pops out of the screen
                    let scale = 1;
                    if (offset === 0) {
                        zPush += 250; // Massively pull it towards the user!
                        scale = 1.35; // Larger center card
                    }
                    
                    // Handle hover interactions purely in JS for smooth GSAP transitions
                    if (i === hoverIndex && offset !== 0) {
                        yPush -= 40;
                        zPush += 120; // Jump forward out of the stack
                        scale += 0.15;
                    } else if (i === hoverIndex && offset === 0) {
                        zPush += 80;
                        scale += 0.05;
                    }

                    // Apply layout with GSAP
                    gsap.to(card, {
                        x: xPush,
                        y: yPush,
                        z: zPush,
                        rotationY: rotY,
                        rotationX: 0,
                        rotationZ: 0, 
                        scale: scale, 
                        zIndex: 100 - absOffset,
                        duration: 0.6,
                        ease: "power3.out"
                    });
                    
                    if (offset === 0) {
                        card.classList.add('active');
                    } else {
                        card.classList.remove('active');
                    }
                });
                
                // Calculate EXACT 3D position for the golden rope so it sits physically behind the last card!
                const lastIndex = cards.length - 1;
                const lastOffset = lastIndex - activeIndex;
                const lastX = lastOffset * (window.innerWidth * 0.12);
                const lastY = lastOffset * 25;
                const lastZ = -lastOffset * 250;
                
                // Compensate for perspective scaling so the line remains exactly 2px thick visually
                const p = 1200; // Match CSS perspective
                const scaleComp = (p - (lastZ - 50)) / p; 

                gsap.to('.golden-rope', {
                    x: lastX, // Start exactly at the card's horizontal center
                    y: lastY, // Match the card's vertical dip
                    z: lastZ - 50, // Push 50px deeper into the screen so the card perfectly occludes the start of the line!
                    scaleY: scaleComp, // Maintain 2px visual thickness
                    scaleX: scaleComp, // Maintain infinite length
                    duration: 0.6,
                    ease: "power3.out"
                });
            }

            // Initialize Layout
            updateCarousel();

            // Create a single master timeline for the entire core section
            let masterCoreTl = gsap.timeline();

            // Setup interaction
            cards.forEach((card, i) => {
                const imgWrap = card.querySelector('.deck-img-wrapper');
                const img = imgWrap.querySelector('img');
                const contentWrap = card.querySelector('.deck-content');

                if (!isTouch && PERF.fx) {
                card.addEventListener('mouseenter', () => updateCarousel(i));
                card.addEventListener('mouseleave', () => {
                    updateCarousel(-1);
                    const baseRotY = parseFloat(card.dataset.baseRotY || 0);
                    gsap.to(card, { rotationY: baseRotY, rotationX: 0, duration: 0.8, ease: "power2.out" });
                    gsap.to(img, { x: 0, y: 0, scale: 1, duration: 0.8, ease: "power2.out" });
                });
                // Immersive Mousemove Parallax inside the card itself
                card.addEventListener('mousemove', (e) => {
                    const intensity = (i === activeIndex) ? 2.5 : 1.0;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const normX = (x / rect.width) - 0.5;
                    const normY = (y / rect.height) - 0.5;
                    const baseRotY = parseFloat(card.dataset.baseRotY || 0);
                    const targetRotY = baseRotY + (normX * 15 * intensity);
                    const targetRotX = -normY * 15 * intensity;
                    gsap.to(card, { rotationY: targetRotY, rotationX: targetRotX, duration: 0.3, ease: "power2.out" });
                    gsap.to(img, { x: normX * -10 * intensity, y: normY * -10 * intensity, scale: 1.15, duration: 0.3, ease: "power2.out" });
                });
                } // end !isTouch

                card.addEventListener('click', () => {
                    activeIndex = i;
                    updateCarousel();
                });
            });

            let isGlobalTiltEnabled = true;

            // GLOBAL Cursor Reactiveness: Tilt the entire carousel container based on mouse position
            // Disabled on mobile (no mouse, saves battery) and below the high tier
            if (!isTouch && PERF.fx) {
            document.addEventListener('mousemove', (e) => {
                if (!isGlobalTiltEnabled) return;
                const xVal = (e.clientX / window.innerWidth - 0.5) * 15; // -7.5 to 7.5 deg
                const yVal = (e.clientY / window.innerHeight - 0.5) * -15;
                gsap.to('.carousel-container', {
                    rotationY: xVal,
                    rotationX: yVal,
                    duration: 1.5,
                    ease: "power2.out"
                });
            });
            }

            // We use a dummy object to animate progress from 0 to 1 over the timeline
            let carouselProgress = { val: 0 };

            if (isMobile) {
                // Mobile: carousel visible immediately, CSS handles stacked layout
                gsap.set('.carousel-container', { x: 0, y: 0, autoAlpha: 1, scale: 1,
                    rotationY: 0, rotationX: 0, rotationZ: 0, perspective: 'none' });
                gsap.set('.golden-rope', { opacity: 0 });
                // Make all cards visible + reset GSAP 3D props
                cards.forEach((card) => {
                    gsap.set(card, {
                        clearProps: 'x,y,z,rotationX,rotationY,rotationZ,scale,zIndex,opacity,visibility,filter,top,width,height'
                    });
                });
            } else {
            // ─── DESKTOP carousel: off-screen start → scroll-scrub timeline ───

            // 0. Initial Setup
            gsap.set('.carousel-container', { x: '100vw', autoAlpha: 1, scale: 1 }); // Start off-screen right
            gsap.set('.golden-rope', { opacity: 1 });

            // PHASE 1: Carousel slides in smoothly (no text fade yet)
            masterCoreTl.to('.carousel-container', { x: '0vw', duration: 1.5, ease: "power2.out" }, 0);

            // PHASE 2: Cycle Carousel AND simultaneously fade text!
            // Text fades out smoothly and gradually over the first 2 seconds of the scroll
            masterCoreTl.to('.core-text-vertical, .core-bg-text', { opacity: 0, x: -50, duration: 2, ease: "none" }, 1.5);
            
            masterCoreTl.to(carouselProgress, {
                val: 1,
                duration: 8, // Massively increased duration relative to timeline for incredibly precise scroll control
                ease: "none", // 1-to-1 linear scrolling. No getting stuck at the start/end!
                onUpdate: () => {
                    if (isOverlayOpen) return; // Bulletproof check: Do NOT update activeIndex if the card is open!
                    let newIndex = Math.round(carouselProgress.val * (cards.length - 1));
                    if (newIndex !== activeIndex) {
                        activeIndex = newIndex;
                        updateCarousel();
                    }
                }
            }, 1.5);

            // PHASE 3: Carousel leaves to the left, dragging the rope!
            // (Compressed: the gate/void reveal now begins right after the
            // carousel exits instead of leaving ~2 timeline-seconds of dead scroll.)
            masterCoreTl.to('.carousel-container', { x: '-150vw', duration: 1.5, ease: "power2.inOut" }, 9.5);

            // PHASE 4: Gates Open into the Void, triggered by the rope
            masterCoreTl.set('.chyk-gate-top, .chyk-gate-bottom', { opacity: 1, immediateRender: false }, 10.8);
            masterCoreTl.to('.golden-rope', { opacity: 0, duration: 0.1 }, 10.8); // Instantly swap rope for the gate borders

            // Cinematic Shutter Reveal
            masterCoreTl.to('.chyk-gate-top', { yPercent: -100, duration: 2.2, ease: "expo.inOut" }, 10.8);
            masterCoreTl.to('.chyk-gate-bottom', { yPercent: 100, duration: 2.2, ease: "expo.inOut" }, 10.8);

            // Map Scratch-off Reveal (Behind the gates)
            masterCoreTl.add(() => {
                isVoidRevealing = true;
                if (typeof mouseGridX !== 'undefined' && mouseGridX === -1) {
                    mouseGridX = window.innerWidth / 2;
                    mouseGridY = window.innerHeight / 2;
                }
            }, 11.2);

            // Cinematic Flash effect from behind the crack (Optional, applied to the text/content wrapper)
            masterCoreTl.fromTo('.void-content',
                { filter: "brightness(5) contrast(2)", opacity: 0, scale: 1.05 },
                { filter: "brightness(1) contrast(1)", opacity: 1, scale: 1, duration: 2.2, ease: "expo.out" }, 10.8);

            const riftVoid = document.querySelector('.void-center-text');
            if (riftVoid) {
                masterCoreTl.fromTo(riftVoid,
                    { xPercent: -50, y: 24, opacity: 0 },
                    { xPercent: -50, y: 0, opacity: 1, duration: 1.5, ease: "power3.out" },
                    11.2
                );
            }

            // Single unified ScrollTrigger to pin the section and scrub the timeline (desktop only)
            // Timeline is now 16.2 long (was 19.5); pin distance shrinks to match
            // so the section unpins shortly after the void text completes.
            ScrollTrigger.create({
                trigger: coreSection,
                start: "top top",
                end: () => `+=${window.innerHeight * (PERF.tier === 'low' ? 9 : 12)}`,
                pin: true,
                scrub: scrubFor(0.8),
                animation: masterCoreTl,
                onUpdate: (self) => {
                    const voidActive = self.progress >= 0.78;
                    document.body.classList.toggle('void-game-active', voidActive);
                    if (window.setViewBgContext) {
                        window.setViewBgContext(voidActive ? 'void' : 'hidden');
                    }
                },
                onLeave: () => {
                    document.body.classList.remove('void-game-active');
                    if (window.setViewBgContext) window.setViewBgContext('hidden');
                },
                onLeaveBack: () => {
                    document.body.classList.remove('void-game-active');
                    if (window.setViewBgContext) window.setViewBgContext('hidden');
                }
            });

            } // end !isMobile carousel block

            // 3. Interactive Detail View Logic (GSAP Animated)
            const detailOverlay = document.getElementById('card-detail-overlay');
            const detailImg = document.getElementById('detail-img');
            const detailTitle = document.getElementById('detail-title');
            const detailSubtitle = document.getElementById('detail-subtitle');
            const detailDesc = document.getElementById('detail-desc');
            const closeBtn = document.getElementById('detail-close-btn');

            if (detailOverlay) {
                // Initialize hidden state
                gsap.set(detailOverlay, { display: 'none', opacity: 0 });
                gsap.set('.overlay-content', { scale: 0.2, opacity: 0 }); // Start small like the tile!

                const openOverlay = () => {
                    if (isOverlayOpen) return;
                    isOverlayOpen = true;
                    isGlobalTiltEnabled = false; // Disable global tilt so the card is perfectly flat!
                    document.documentElement.style.overflow = 'hidden'; // Lock root HTML scroll!
                    document.body.style.overflow = 'hidden'; // Lock page scroll while expanded!
                    if (lenis) lenis.stop(); // Lock Lenis smooth scroll specifically!
                    
                    const activeCard = cards[activeIndex];
                    const activeImage = activeCard.querySelector('.deck-img-wrapper img');
                    if (activeImage && activeImage.dataset.detailSrc) activeImage.src = activeImage.dataset.detailSrc;
                    
                    // Mark it as expanded so updateCarousel doesn't interfere
                    activeCard.classList.add('expanded');

                    // Flatten the container's 3D tilt instantly
                    gsap.to('.carousel-container', { rotationY: 0, rotationX: 0, duration: 0.6, ease: "power3.out" });

                    // Lock flexbox boundaries to percentages to prevent any wobble during transition!
                    const imgWrap = activeCard.querySelector('.deck-img-wrapper');
                    const contentWrap = activeCard.querySelector('.deck-content');
                    const startImgPct = (imgWrap.offsetHeight / activeCard.offsetHeight) * 100;
                    const startContentPct = (contentWrap.offsetHeight / activeCard.offsetHeight) * 100;
                    
                    // Store exact original proportions so we can restore perfectly without a jump!
                    activeCard.dataset.origImgPct = startImgPct;
                    activeCard.dataset.origContentPct = startContentPct;
                    
                    gsap.set(imgWrap, { position: 'absolute', top: 0, left: 0, width: '100%', height: `${startImgPct}%`, boxSizing: 'border-box' });
                    gsap.set(contentWrap, { position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${startContentPct}%`, boxSizing: 'border-box', overflow: 'hidden' });

                    // Dynamically add the paragraph exactly matching the mockup
                    let extDesc = activeCard.querySelector('.deck-extended-desc');
                    if (!extDesc) {
                        extDesc = document.createElement('div');
                        extDesc.className = 'deck-extended-desc';
                        extDesc.textContent = activeCard.dataset.description || '';
                        extDesc.style.marginTop = "0.5vh";
                        extDesc.style.fontSize = "1.1vw";
                        extDesc.style.fontWeight = "400"; // Standard body weight
                        extDesc.style.fontFamily = "'Inter', sans-serif"; // Standard readable sans-serif
                        extDesc.style.color = "#444"; // Dark text for white background
                        extDesc.style.lineHeight = "1.5"; // Standard optimal paragraph line height
                        extDesc.style.letterSpacing = "0.2px"; // Standard body letter spacing
                        extDesc.style.textTransform = "none"; // Explicitly ensure it's not forced to uppercase by CSS
                        extDesc.style.maxWidth = "70%";
                        activeCard.querySelector('.deck-content').appendChild(extDesc);
                    }
                    
                    // Fade it in smoothly
                    gsap.set(extDesc, { display: 'block', opacity: 0 });
                    gsap.to(extDesc, { opacity: 1, duration: 0.8, ease: "expo.out", delay: 0.2 });

                    // Hide the original subtitle to match mockup smoothly
                    const subtitle = activeCard.querySelector('.deck-content p:not(.deck-extended-desc)');
                    if (subtitle) {
                        subtitle.dataset.origDisplay = subtitle.style.display || '';
                        gsap.to(subtitle, { opacity: 0, height: 0, overflow: 'hidden', duration: 0.4, ease: "power3.out" });
                    }

                    gsap.to(imgWrap, { height: '65%', duration: 0.6, ease: "power3.out" });
                    
                    // The content restores to a clean white block matching the mockup
                    gsap.to(contentWrap, { 
                        height: '35%',
                        padding: '2.5vh', 
                        background: '#fff',
                        duration: 0.6, 
                        ease: "power3.out" 
                    });

                    gsap.to(activeCard.querySelector('.deck-content h4'), { 
                        color: '#111', 
                        fontSize: '3vh', 
                        marginBottom: '1vh', 
                        lineHeight: 1, 
                        duration: 0.6, 
                        ease: "power3.out" 
                    });
                    
                    let extDescEl = activeCard.querySelector('.deck-extended-desc');
                    if (extDescEl) {
                        gsap.to(extDescEl, {
                            color: '#444',
                            fontSize: '1.2vh',
                            maxWidth: '70%',
                            duration: 0.6,
                            ease: "power3.out"
                        });
                    }

                    // CENTERED MODAL EXPANSION
                    if (isMobile) {
                        // Mobile: expand as a fixed full-screen sheet
                        gsap.set(activeCard, { position: 'fixed', zIndex: 9500 });
                        gsap.to(activeCard, {
                            width: '92vw',
                            height: '78vh',
                            top: '50%',
                            left: '50%',
                            xPercent: -50,
                            yPercent: -50,
                            scale: 1,
                            z: 0,
                            rotationY: 0,
                            rotationX: 0,
                            duration: 0.45,
                            ease: "power3.out"
                        });
                        // Inject a close button for mobile tap target
                        if (!activeCard.querySelector('.mobile-card-close')) {
                            const mCloseBtn = document.createElement('button');
                            mCloseBtn.className = 'mobile-card-close';
                            mCloseBtn.innerHTML = '&times;';
                            mCloseBtn.style.cssText = 'position:absolute;top:0.5rem;right:0.5rem;width:40px;height:40px;border-radius:50%;border:none;background:rgba(0,0,0,0.35);color:#fff;font-size:1.5rem;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9999;line-height:1;';
                            mCloseBtn.addEventListener('click', (e) => { e.stopPropagation(); closeOverlay(); });
                            activeCard.appendChild(mCloseBtn);
                        } else {
                            activeCard.querySelector('.mobile-card-close').style.display = 'flex';
                        }
                    } else {
                        gsap.to(activeCard, {
                            width: '85vh',
                            height: '55vh',
                            top: '50vh',
                            yPercent: -50,
                            scale: 1,
                            z: 500,
                            x: 0,
                            y: 0,
                            rotationY: 0,
                            rotationX: 0,
                            duration: 0.6,
                            ease: "power3.out"
                        });
                    }
                    
                    // Blur the background and other cards
                    gsap.to('.core-bg-text, .core-title, .core-desc, .section-label', { filter: "blur(15px)", duration: 0.8 });
                    cards.forEach(card => {
                        if (card !== activeCard) {
                            gsap.to(card, { filter: "blur(15px)", opacity: 0.5, duration: 0.8 });
                        }
                    });
                };

                const closeOverlay = () => {
                    if (!isOverlayOpen) return;
                    isOverlayOpen = false;
                    isGlobalTiltEnabled = true; // Re-enable global tilt
                    document.documentElement.style.overflow = ''; // Unlock root HTML scroll!
                    document.body.style.overflow = ''; // Unlock page scroll!
                    if (lenis) lenis.start(); // Unlock Lenis smooth scroll!

                    const activeCard = cards[activeIndex];
                    activeCard.classList.remove('expanded');
                    const activeImage = activeCard.querySelector('.deck-img-wrapper img');
                    if (activeImage && activeImage.dataset.thumbnailSrc) activeImage.src = activeImage.dataset.thumbnailSrc;

                    // Unblur everything
                    gsap.to('.core-bg-text, .core-title, .core-desc, .section-label', { filter: "blur(0px)", duration: 0.8 });
                    cards.forEach(card => {
                        if (card !== activeCard) {
                            gsap.to(card, { filter: "blur(0px)", opacity: 1, duration: 0.8 });
                        }
                    });

                    const extDesc = activeCard.querySelector('.deck-extended-desc');
                    if (extDesc) {
                        // Fade out without animating height
                        gsap.to(extDesc, { opacity: 0, duration: 0.6, ease: "power3.out", onComplete: () => {
                            gsap.set(extDesc, { display: 'none' });
                        }});
                    }

                    // Restore the original subtitle smoothly without string-value jumps
                    const subtitle = activeCard.querySelector('.deck-content p:not(.deck-extended-desc)');
                    if (subtitle) {
                        gsap.to(subtitle, { opacity: 1, height: 'auto', duration: 0.6, ease: "power3.out", onComplete: () => {
                            gsap.set(subtitle, { clearProps: "height,overflow" });
                        }});
                    }

                    // Explicitly target exact original proportions for perfect mathematical reversal
                    const imgWrap = activeCard.querySelector('.deck-img-wrapper');
                    const contentWrap = activeCard.querySelector('.deck-content');
                    const origImgPct = activeCard.dataset.origImgPct || 80;
                    const origContentPct = activeCard.dataset.origContentPct || 20;
                    
                    // Animate back to exact percentage to prevent the 'pop' when clearProps releases flexbox
                    gsap.to(imgWrap, { height: `${origImgPct}%`, duration: 0.6, ease: "power3.out" });
                    gsap.to(contentWrap, { 
                        height: `${origContentPct}%`, 
                        padding: '1.5vw', 
                        background: '#fff',
                        duration: 0.6, 
                        ease: "power3.out", 
                        onComplete: () => {
                            gsap.set(imgWrap, { clearProps: "position,top,left,width,height,boxSizing" });
                            gsap.set(contentWrap, { clearProps: "position,bottom,left,width,height,boxSizing,overflow,background" });
                        }
                    });
                    
                    gsap.to(activeCard.querySelector('.deck-content h4'), { 
                        color: '#111', 
                        fontSize: '1.1vw', 
                        marginBottom: '0.5vw', 
                        duration: 0.6, 
                        ease: "power3.out", 
                        onComplete: () => {
                            gsap.set(activeCard.querySelector('.deck-content h4'), { clearProps: "lineHeight,color" });
                        }
                    });

                    // Reshape the card back to its original size
                    if (isMobile) {
                        // Hide the injected close button
                        const mCloseBtn = activeCard.querySelector('.mobile-card-close');
                        if (mCloseBtn) mCloseBtn.style.display = 'none';
                        // Mobile: fade/scale card down, then reset to CSS-managed layout
                        gsap.to(activeCard, {
                            opacity: 0,
                            scale: 0.92,
                            duration: 0.3,
                            ease: "power2.in",
                            onComplete: () => {
                                gsap.set(activeCard, {
                                    clearProps: 'all'
                                });
                            }
                        });
                    } else {
                        gsap.to(activeCard, {
                            width: '14vw',
                            height: '20vw',
                            top: 'calc(50vh - 10vw)',
                            yPercent: 0,
                            duration: 0.6,
                            ease: "power3.out"
                        });
                        // Immediately trigger updateCarousel so x, y, z, rotation animate back smoothly
                        updateCarousel();
                    }
                    
                    // Unblur everything
                    gsap.to('.core-bg-text, .core-title, .core-desc, .section-label', { filter: "blur(0px)", duration: 0.6, ease: "power3.out" });
                    cards.forEach(card => {
                        if (card !== activeCard) {
                            gsap.to(card, { filter: "blur(0px)", opacity: 1, duration: 0.6, ease: "power3.out" });
                        }
                    });
                };

                cards.forEach(card => {
                    card.style.cursor = 'pointer';
                    card.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent the document click listener from catching this
                        if (isOverlayOpen) return; // Prevent re-triggering if already open
                        
                        const img = card.querySelector('img').src;
                        const title = card.querySelector('h4').innerText;
                        const subtitle = card.querySelector('p').innerText;

                        detailImg.src = img;
                        detailTitle.innerText = title;
                        detailSubtitle.innerText = subtitle;
                        detailDesc.innerText = card.dataset.description || '';

                        openOverlay();
                    });
                });

                closeBtn.addEventListener('click', closeOverlay);

                // Add ESC key listener to close overlay
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && isOverlayOpen) {
                        closeOverlay();
                    }
                });

                // Add "Click Outside to Close" listener
                document.addEventListener('click', (e) => {
                    if (isOverlayOpen) {
                        const activeCard = cards[activeIndex];
                        // If the user clicks anywhere that is NOT inside the active card, close it.
                        if (activeCard && !activeCard.contains(e.target)) {
                            closeOverlay();
                        }
                    }
                });
            }

            // Refresh measurements once everything (images/videos) has loaded
            window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
        }

        // Background Typography Parallax
        const chykCoreParallax = document.querySelector('.chyk-core');
        if (chykCoreParallax) {
            gsap.to(".core-bg-text", {
                y: -200,
                scrollTrigger: {
                    trigger: chykCoreParallax,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: scrubFor(0.7)
                }
            });
        }



    // 9. THE INFINITY TUNNEL — THE CANVAS IMAGE SEQUENCE VORTEX
    // Skipped on mobile: 542 JPEG frames are too heavy; show static black BG instead.
    const tunnelSection = document.querySelector('.tunnel-finale');
    const tunnelCanvas = document.getElementById('tunnel-canvas');
    if (tunnelSection && tunnelCanvas && !isMobile) {
        const tunnelCtx = tunnelCanvas.getContext('2d');
        const tunnelWalls = document.querySelector('.tunnel-walls');
        const tunnelEnd = document.querySelector('.tunnel-end');
        const distalLight = document.querySelector('.distal-light');
        const wallImages = document.querySelectorAll('.wall-item img');

        const frameCount = 542;
        const currentFrame = index => (
            `assets/site/home/tunnel/image1_${index.toString().padStart(5, '0')}.jpg`
        );

        const images = [];          // sparse: only requested frames exist
        const air = { frame: 0 };
        // Low tier never downloads the 36 MB frame sequence — the section
        // still plays its text narrative and fades straight to the final video.
        const useFrames = PERF.tier !== 'low';
        // Animated blur is GPU-expensive; low tier swaps it for plain fades
        const BLUR_IN  = PERF.fx ? "blur(12px)" : "blur(0px)";
        const BLUR_OUT = PERF.fx ? "blur(20px)" : "blur(0px)";

        // Split text for CHYK-style reveal
        function splitJourneyText() {
            const texts = document.querySelectorAll('.journey-text');
            texts.forEach(text => {
                const content = text.innerText;
                text.innerHTML = '';
                content.split('').forEach(char => {
                    if (char === ' ') {
                        text.innerHTML += '<span>&nbsp;</span>';
                    } else {
                        text.innerHTML += `<span class="journey-char" style="display:inline-block;">${char}</span>`;
                    }
                });
            });
        }
        splitJourneyText();

        // PROGRESSIVE FRAME LOADING
        // Frames download in a window around the current scrub position instead
        // of all 542 (36 MB) up front. High tier on a fast connection still
        // trickle-loads the full set once the user nears the section, so the
        // original instant-scrub experience is preserved there.
        let firstFrameDrawn = false;
        let tunnelArmed = false; // no frame request until the user nears the section

        function requestFrame(i) {
            if (i < 0 || i >= frameCount || images[i]) return;
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => {
                if (!firstFrameDrawn) { firstFrameDrawn = true; render(); }
            };
            img.src = currentFrame(i);
            images[i] = img;
        }

        function requestWindow(center, behind, ahead) {
            const from = Math.max(0, center - behind);
            const to = Math.min(frameCount, center + ahead);
            for (let i = from; i < to; i++) requestFrame(i);
        }

        let fullPreloadStarted = false;
        function preloadAllFrames() {
            if (fullPreloadStarted) return;
            fullPreloadStarted = true;
            const batchSize = 12;
            let next = 0;
            (function loadBatch() {
                if (next >= frameCount) return;
                let pending = 0;
                const end = Math.min(next + batchSize, frameCount);
                for (let i = next; i < end; i++) {
                    if (images[i]) continue;
                    pending++;
                    const img = new Image();
                    img.decoding = 'async';
                    img.onload = img.onerror = () => { if (--pending <= 0) loadBatch(); };
                    img.src = currentFrame(i);
                    images[i] = img;
                }
                next = end;
                if (pending === 0) loadBatch(); // whole batch was already cached
            })();
        }

        // Prime the opening frames one section ahead of the tunnel; never on page load.
        if (useFrames) {
            ScrollTrigger.create({
                trigger: ".chyk-core",
                start: "top 60%",
                onEnter: () => {
                    tunnelArmed = true;
                    requestWindow(0, 0, 40);
                    if (PERF.tier === 'high' && !PERF.slowNet) preloadAllFrames();
                }
            });
        }

        const tunnelTl = gsap.timeline({
            scrollTrigger: {
                trigger: tunnelSection,
                start: "top top",
                // Viewport-relative pin distance (was a fixed +=15000):
                // high ≈ 8 screens, balanced ≈ 6.5, low ≈ 4 (no frame sequence).
                end: () => "+=" + Math.round(window.innerHeight *
                    (PERF.tier === 'high' ? 18 : PERF.tier === 'balanced' ? 16 : 12)),
                pin: true,
                scrub: scrubFor(0.4),
                // progress > 0 guard: the initial ScrollTrigger refresh fires
                // one onUpdate at page load — without it the first ~45 frames
                // downloaded before the user ever scrolled.
                onUpdate: (self) => {
                    if (!useFrames || self.progress <= 0) return;
                    tunnelArmed = true; // covers scroll restoration straight into the section
                    render();
                }
            }
        });

        // 0. Smooth Entrance Crossfade — starts at 1.2 so the screen stays
        // pure black while "THE JOURNEY BEGINS" plays (the pre-tunnel beat).
        tunnelTl.from(tunnelCanvas, {
            opacity: 0,
            duration: 2.2,
            ease: "power2.inOut"
        }, 1.2);

        // 1. Scrub the Image Sequence
        // Now starts at 0 but the frame only starts moving when the user scrolls further
        if (useFrames) {
            tunnelTl.to(air, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                // Ends with the canvas fade-out at 10 (was 11.5 — the last
                // 30% of frames used to play invisibly behind the final video)
                duration: 14.4
            }, 1.5); // DELAYED START so we don't skip the first frames during the fade-in
        }

        // 2. Cinematic Pulse Fade
        tunnelTl.to(distalLight, {
            opacity: 1,
            duration: 5,
            ease: "power2.inOut"
        }, 1.5);

        // 3. "THE JOURNEY BEGINS" on the black screen, then the mantra in six
        // beats through the tunnel. The last beat has no auto-exit — it
        // dissolves together with the canvas into the mountain reveal.
        const tunnelSteps = [
            { selector: '.text-transition', at: 0.1 },              // on black, pre-tunnel
            { selector: '.text-1', at: 2.1 },                       // INTROSPECT DAILY
            { selector: '.text-2', at: 4.25 },                      // DETECT DILIGENTLY
            { selector: '.text-3', at: 6.4 },                       // NEGATE RUTHLESSLY
            { selector: '.text-4', at: 8.55 },                      // SUBSTITUTE WISELY
            { selector: '.text-5', at: 10.7 },                      // GROW STEADILY
            { selector: '.text-6', at: 12.85, holdToReveal: true }  // AND BE FREE
        ];

        tunnelSteps.forEach(({ selector, at, holdToReveal }) => {
            const chars = document.querySelectorAll(`${selector} .journey-char`);
            tunnelTl.fromTo(chars,
                { opacity: 0, filter: BLUR_IN, y: 12 },
                { opacity: 1, filter: 'blur(0px)', y: 0, stagger: 0.018, duration: 0.55, ease: 'power2.out' },
                at
            );
            tunnelTl.fromTo(`${selector} .journey-text`,
                { letterSpacing: '0.12em', z: -340, scale: 0.72, opacity: 0 },
                { letterSpacing: '0.2em', z: 80, scale: 1.04, opacity: 1, duration: 1.65, ease: 'power2.out' },
                at
            );
            if (!holdToReveal) {
                tunnelTl.to(selector, { opacity: 0, filter: BLUR_OUT, scale: 1.06, duration: 0.55 }, at + 1.82);
            }
        });

        // "...AND BE FREE!" fades out with the tunnel as the destination appears
        tunnelTl.to('.text-6', { opacity: 0, filter: BLUR_OUT, scale: 1.08, duration: 1.4, ease: 'power2.inOut' }, 15.15);

        // 6. SEAMLESS TRANSITION TO MAIN HOVER
        // Fades out the tunnel canvas to reveal the background video matching the last frame
        tunnelTl.to("#tunnel-canvas, .distal-light", {
            opacity: 0,
            duration: 2,
            ease: "power2.inOut"
        }, 15.15);
        
        // Reveal the final experience background video and container
        tunnelTl.to('.final-experience', {
            autoAlpha: 1, // Handles both opacity and visibility
            duration: 2,
            ease: "power2.inOut"
        }, 15.15);

        // Hide the distal light completely to remove any darkening
        tunnelTl.to('.distal-light', {
            autoAlpha: 0,
            duration: 1,
            ease: "power2.inOut"
        }, 15.15);

        // FINAL HOLD: keep the revealed destination video on screen for a
        // moment before unpinning into the next section.
        tunnelTl.to({}, { duration: 0.8 });



        // CLEANUP: Hide preceding sections to prevent any background flashing
        ScrollTrigger.create({
            trigger: ".tunnel-finale",
            start: "top bottom",
            onEnter: () => {
                // Completely hide preceding sections so they don't show through the tunnel
                const gallery = document.querySelector('.horizontal-experience');
                const story = document.querySelector('.chyk-core');
                const voidSect = document.querySelector('.void-transition');
                if(gallery) gallery.style.visibility = 'hidden';
                if(story) story.style.visibility = 'hidden';
                if(voidSect) voidSect.style.visibility = 'hidden';
            },
            onLeaveBack: () => {
                const gallery = document.querySelector('.horizontal-experience');
                const story = document.querySelector('.chyk-core');
                const voidSect = document.querySelector('.void-transition');
                if(gallery) gallery.style.visibility = 'visible';
                if(story) story.style.visibility = 'visible';
                if(voidSect) voidSect.style.visibility = 'visible';
            }
        });

        // Canvas Responsive Logic with High-Resolution Support
        function setCanvasSize() {
            // Tier-capped DPR. The old code used Math.MAX(dpr, 2), which forced
            // a 2× backing store even on 1× screens — 4× the pixels to paint.
            const dpr = PERF.dpr;

            tunnelCanvas.width = window.innerWidth * dpr;
            tunnelCanvas.height = window.innerHeight * dpr;
            
            // Set display size
            tunnelCanvas.style.width = window.innerWidth + 'px';
            tunnelCanvas.style.height = window.innerHeight + 'px';
            
            // Use High-Quality smoothing for PNGs
            tunnelCtx.imageSmoothingEnabled = true;
            tunnelCtx.imageSmoothingQuality = 'high';
            
            render();
        }

        function render() {
            if (!useFrames || !tunnelArmed) return;
            const want = Math.max(0, Math.min(frameCount - 1, Math.round(air.frame)));
            // Keep a sliding download window around the scrub position
            requestWindow(want, 5, 45);

            // Draw the nearest already-decoded frame at or below the target so
            // fast scrolling never blanks the canvas while frames stream in.
            let img = null;
            for (let i = want; i >= 0 && i > want - 30; i--) {
                const candidate = images[i];
                if (candidate && candidate.complete && candidate.naturalWidth) { img = candidate; break; }
            }
            if (!img) return;

            const targetWidth = tunnelCanvas.width;
            const targetHeight = tunnelCanvas.height;
            const canvasAspect = targetWidth / targetHeight;
            const imgAspect = img.width / img.height;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            // Cover logic in PHYSICAL pixels
            if (canvasAspect > imgAspect) {
                drawWidth = targetWidth;
                drawHeight = targetWidth / imgAspect;
                offsetX = 0;
                offsetY = (targetHeight - drawHeight) / 2;
            } else {
                drawHeight = targetHeight;
                drawWidth = targetHeight * imgAspect;
                offsetX = (targetWidth - drawWidth) / 2;
                offsetY = 0;
            }
            
            // Ensure high-quality interpolation every frame
            tunnelCtx.imageSmoothingQuality = 'high';
            tunnelCtx.clearRect(0, 0, targetWidth, targetHeight);
            tunnelCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }

        window.addEventListener('resize', setCanvasSize);

        // Ensure canvas is sized correctly from the start to avoid 300x150 default
        setCanvasSize();

        // Destination video: download/play only while the tunnel is on screen
        // (it used to autoplay+loop from page load, fully off-screen).
        const finalVid = document.querySelector('.final-hover-vid');
        if (finalVid && 'IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (PERF.tier === 'low') return;
                        hydrateVideo(finalVid, 'auto');
                        const p = finalVid.play();
                        if (p && p.catch) p.catch(() => {});
                    } else {
                        finalVid.pause();
                    }
                });
            }, { rootMargin: '300px' }).observe(tunnelSection);
        }
    }

    // (Removed redundant flashlight trigger)

    // 2. Custom Cursor & Spotlight Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const heroDarkness = document.querySelector('.hero-darkness');

    // Center the cursor elements
    gsap.set(cursorDot, { xPercent: -50, yPercent: -50 });
    gsap.set(cursorRing, { xPercent: -50, yPercent: -50 });

    // High performance, buttery smooth followers
    const xDot = gsap.quickTo(cursorDot, "x", {duration: 0.1, ease: "power2.out"});
    const yDot = gsap.quickTo(cursorDot, "y", {duration: 0.1, ease: "power2.out"});
    const xRing = gsap.quickTo(cursorRing, "x", {duration: 0.4, ease: "power3.out"});
    const yRing = gsap.quickTo(cursorRing, "y", {duration: 0.4, ease: "power3.out"});

    // Interactive hover states
    const interactives = document.querySelectorAll('a, button, .scroll-indicator');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursorRing, { scale: 1.8, backgroundColor: "rgba(255,255,255,0.2)", duration: 0.3 });
            gsap.to(cursorDot, { scale: 0, duration: 0.2 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursorRing, { scale: 1, backgroundColor: "transparent", duration: 0.3 });
            gsap.to(cursorDot, { scale: 1, duration: 0.2 });
        });
    });

    // Flashlight initial state is pitch black (r: 0)
    // Flashlight initial state is pitch black (r: 0)
    const flashlightDOM = document.querySelector('#flashlight');
    
    // Setup Canvas for Digital Decryption Grid
    const voidCanvas = document.getElementById('void-canvas');
    let mouseGridX = -1;
    let mouseGridY = -1;
    let currentGridX = -1;
    let currentGridY = -1;

    if (voidCanvas) {
        voidCtx = voidCanvas.getContext('2d');
        let cols, rows;
        const size = 12; // Fine, high-resolution pixel blocks
        let blocks = [];
        
        const resizeCanvas = () => {
            voidCanvas.width = window.innerWidth;
            voidCanvas.height = window.innerHeight;
            cols = Math.ceil(voidCanvas.width / size);
            rows = Math.ceil(voidCanvas.height / size);
            
            blocks = [];
            for(let i=0; i<cols; i++) {
                blocks[i] = [];
                for(let j=0; j<rows; j++) {
                    blocks[i][j] = { 
                        o: 1, 
                        t: 1
                    };
                }
            }
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        document.addEventListener('mousemove', (e) => {
            if (!isVoidRevealing) return;
            mouseGridX = e.clientX;
            mouseGridY = e.clientY;
        });

        function updateGrid() {
            if (!voidCtx) return;
            
            if (!isVoidRevealing) {
                // Ensure the void is completely black before timeline hits phase 4
                voidCtx.fillStyle = '#050505';
                voidCtx.fillRect(0, 0, voidCanvas.width, voidCanvas.height);
            } else {
                voidCtx.clearRect(0, 0, voidCanvas.width, voidCanvas.height);
                
                let time = performance.now() * 0.002;
                
                // Heavy Inertia Calculation
                if (mouseGridX !== -1) {
                    if (currentGridX === -1) {
                        currentGridX = mouseGridX;
                        currentGridY = mouseGridY;
                    }
                    // Low interpolation factor creates heavy drag
                    currentGridX += (mouseGridX - currentGridX) * 0.04;
                    currentGridY += (mouseGridY - currentGridY) * 0.04;
                }
                
                // Speed calculation
                let vx = mouseGridX - currentGridX;
                let vy = mouseGridY - currentGridY;
                let speed = Math.sqrt(vx*vx + vy*vy);
                let speedStretch = Math.min(speed * 0.4, 60); // Blob stretches and warps based on speed
                
                for(let i=0; i<cols; i++) {
                    for(let j=0; j<rows; j++) {
                        const block = blocks[i][j];
                        const cx = i * size + size/2;
                        const cy = j * size + size/2;
                        
                        let dist = 9999;
                        if(currentGridX !== -1) {
                            const dx = currentGridX - cx;
                            const dy = currentGridY - cy;
                            dist = Math.sqrt(dx*dx + dy*dy);
                        }
                        
                        // Extremely subtle, smooth wobble
                        let noiseAmt = 5 + speedStretch * 0.1;
                        let noiseSpeed = time * 0.5;
                        let noise = Math.sin(i * 0.1 + noiseSpeed) * noiseAmt + Math.cos(j * 0.1 - noiseSpeed * 0.7) * noiseAmt;
                        let effectiveDist = dist + noise;
                        
                        let radius = window.innerWidth * 0.06; // Core radius
                        let falloff = 40; // Soft edge gradient distance
                        
                        if(effectiveDist <= radius) {
                            block.t = 0; // Fully revealed
                        } else if (effectiveDist >= radius + falloff) {
                            block.t = 1; // Fully encrypted
                        } else {
                            // Smooth linear gradient for the edges eliminates ALL jitter!
                            block.t = Math.max(0, Math.min(1, (effectiveDist - radius) / falloff));
                        }
                        
                        // Smooth, uniform transition eliminates block delay jitter
                        block.o += (block.t - block.o) * 0.2;
                        
                        // Draw Darkness Block Overlay
                        if(block.o > 0.01) {
                            voidCtx.fillStyle = `rgba(5, 5, 5, ${block.o})`;
                            // size + 1 prevents ANY subpixel gridline gaps! 
                            voidCtx.fillRect(i * size, j * size, size + 1, size + 1);
                        }
                    }
                }
                
                // Draw warm glowing light in the revealed area
                if (currentGridX !== -1) {
                    voidCtx.globalCompositeOperation = 'lighter';
                    let glowRadius = (window.innerWidth * 0.06) * 1.5 + speedStretch;
                    const lightGrad = voidCtx.createRadialGradient(currentGridX, currentGridY, 0, currentGridX, currentGridY, glowRadius);
                    lightGrad.addColorStop(0, 'rgba(255, 230, 180, 0.25)'); // Warm gold light
                    lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    voidCtx.fillStyle = lightGrad;
                    voidCtx.beginPath();
                    voidCtx.arc(currentGridX, currentGridY, glowRadius, 0, Math.PI * 2);
                    voidCtx.fill();
                    voidCtx.globalCompositeOperation = 'source-over'; // reset
                }
            }
            if (voidLoopOn) requestAnimationFrame(updateGrid);
        }

        // Run the scratch-off grid only while the milestones section is on
        // screen (it used to repaint every frame for the whole session).
        let voidLoopOn = false;
        const voidHost = document.querySelector('.chyk-core');
        if (!isMobile && PERF.tier !== 'low' && voidHost && 'IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const wasOn = voidLoopOn;
                    voidLoopOn = entry.isIntersecting;
                    if (voidLoopOn && !wasOn) updateGrid();
                });
            }).observe(voidHost);
        } else if (!isMobile && PERF.tier !== 'low') {
            voidLoopOn = true;
            updateGrid();
        }
        // Low tier: canvas is hidden by CSS (html.perf-low #void-canvas),
        // the void background and text show directly with no per-frame work.
    }

    let realMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let smoothMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Handheld wobble physics
    let wobble = { x: 0, y: 0, vx: 0, vy: 0 };

    // 6. Interactive Element Physics (Parallax & Highlights)
    const floatingNodes = document.querySelectorAll('.floating-node');

    function updateElementsPhysics() {
        if (!floatingNodes.length) return;
        
        const mouseX = smoothMouse.x + wobble.x;
        const mouseY = smoothMouse.y + wobble.y;
        const spotlightR = spotlightObj.r;

        floatingNodes.forEach((node, i) => {
            // Get center position relative to the viewport
            const rect = node.getBoundingClientRect();
            const nodeX = rect.left + rect.width / 2;
            const nodeY = rect.top + rect.height / 2;
            
            // Distance from flashlight center
            const dx = mouseX - nodeX;
            const dy = mouseY - nodeY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            // 1. Subtle 3D Parallax Drift
            const driftX = (mouseX - window.innerWidth/2) * (0.03 + i * 0.01);
            const driftY = (mouseY - window.innerHeight/2) * (0.03 + i * 0.01);
            
            // 2. Proximity Reveal Effect
            // When the flashlight "hits" the node, it wakes up
            const isRevealed = dist < (spotlightR + 30);
            
            gsap.to(node, {
                x: driftX,
                y: driftY,
                scale: isRevealed ? 1.1 : 1,
                opacity: isRevealed ? 0.9 : 0.4,
                borderColor: isRevealed ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)",
                backgroundColor: isRevealed ? "rgba(255,255,255,0.05)" : "transparent",
                duration: 0.5,
                overwrite: "auto"
            });
        });
    }

    function updatePhysics(timestamp) {
        if (!timestamp) timestamp = 0;
        let time = timestamp * 0.002;

        // Heavy inertial drag
        smoothMouse.x += (realMouse.x - smoothMouse.x) * 0.12; 
        smoothMouse.y += (realMouse.y - smoothMouse.y) * 0.12;
        
        let vx = realMouse.x - smoothMouse.x;
        let vy = realMouse.y - smoothMouse.y;
        let speed = Math.sqrt(vx*vx + vy*vy);

        // 1. Elastic Stretch
        let targetStretch = Math.min(speed * 0.5, spotlightObj.r * 0.8);
        spotlightObj.stretch += (targetStretch - spotlightObj.stretch) * 0.1;
        
        // 2. Directional Alignment
        if (speed > 2) {
            let targetAngle = Math.atan2(vy, vx) * 180 / Math.PI;
            let diff = targetAngle - spotlightObj.angle;
            while (diff < -180) diff += 360;
            while (diff > 180) diff -= 360;
            spotlightObj.angle += diff * 0.15;
        }

        // 3. Bulb Flicker
        let flicker = (Math.random() - 0.5) * (spotlightObj.r * 0.015);

        // Handheld Flashlight Wobble
        let driftIntensity = Math.max(0, 1 - speed * 0.02);
        wobble.vx += (Math.sin(time * 1.5) * 15 * driftIntensity - wobble.x) * 0.03;
        wobble.vy += (Math.cos(time * 1.1) * 15 * driftIntensity - wobble.y) * 0.03;
        wobble.vx *= 0.92;
        wobble.vy *= 0.92;
        wobble.x += wobble.vx;
        wobble.y += wobble.vy;

        if (flashlightDOM) {
            let rx = spotlightObj.r + spotlightObj.stretch + flicker;
            let ry = spotlightObj.r - (spotlightObj.stretch * 0.4) + flicker;
            
            const cx = smoothMouse.x + wobble.x;
            const cy = smoothMouse.y + wobble.y;

            flashlightDOM.setAttribute('cx', cx);
            flashlightDOM.setAttribute('cy', cy);
            flashlightDOM.setAttribute('rx', Math.max(0, rx));
            flashlightDOM.setAttribute('ry', Math.max(0, ry));
            flashlightDOM.setAttribute('transform', `rotate(${spotlightObj.angle}, ${cx}, ${cy})`);
        }
        
        // Update interactive elements
        updateElementsPhysics();

        if (physicsActive) {
            physicsRafId = requestAnimationFrame(updatePhysics);
        } else {
            physicsRafId = null;
        }
    }

    // Flashlight/node physics only run while the hero is actually visible —
    // the horizontal timeline toggles this off once the hero has faded out.
    let physicsActive = false;
    let physicsRafId = null;
    function setPhysicsActive(on) {
        if (isMobile || PERF.tier === 'low') return;
        if (on && !physicsActive) {
            physicsActive = true;
            if (!physicsRafId) physicsRafId = requestAnimationFrame(updatePhysics);
        } else if (!on) {
            physicsActive = false;
        }
    }

    // Start the physics loop (skip on mobile/low tier — saves battery/CPU)
    if (!isMobile && PERF.tier !== 'low') {
        setPhysicsActive(true);
    } else if (!isMobile) {
        // Low tier: no spotlight physics — the darkness layer is removed by
        // CSS (html.perf-low .hero-darkness) so the hero is statically visible.
        gsap.set('.floating-node', { opacity: 0.4 });
    }

    const parallaxTexts = document.querySelectorAll('.hero-title, .hero-subtitle, .text-holder h2, .core-title');

    if (!isTouch) {
    // Prebuilt quickTo setters: one reusable tween per element/property
    // instead of allocating fresh gsap.to() tweens on EVERY mousemove
    // (that allocation churn made the cursor stutter while scrolling).
    // 3D text parallax is a high-tier decoration; cursor + flashlight stay on
    const parallaxSetters = !PERF.fx ? [] : Array.prototype.map.call(parallaxTexts, el => {
        gsap.set(el, { transformPerspective: 500 });
        return {
            x:  gsap.quickTo(el, 'x',         { duration: 1.5, ease: 'power2.out' }),
            y:  gsap.quickTo(el, 'y',         { duration: 1.5, ease: 'power2.out' }),
            rx: gsap.quickTo(el, 'rotationX', { duration: 1.5, ease: 'power2.out' }),
            ry: gsap.quickTo(el, 'rotationY', { duration: 1.5, ease: 'power2.out' })
        };
    });

    document.addEventListener('mousemove', (e) => {
        // Standard cursor followers
        xDot(e.clientX);
        yDot(e.clientY);
        xRing(e.clientX);
        yRing(e.clientY);

        // Update target for the flashlight beam
        realMouse.x = e.clientX;
        realMouse.y = e.clientY;

        // Subtle Text Parallax
        const xOffset = (e.clientX / window.innerWidth - 0.5) * 30; // max 15px shift
        const yOffset = (e.clientY / window.innerHeight - 0.5) * 30;

        for (let i = 0; i < parallaxSetters.length; i++) {
            const s = parallaxSetters[i];
            s.x(xOffset);
            s.y(yOffset);
            s.rx(-yOffset * 0.2);
            s.ry(xOffset * 0.2);
        }
    }, { passive: true });
    }

    // 3. Loading & Preloader Sequence
    if(mainVid) mainVid.pause();
    if(preloaderVid) preloaderVid.pause();

    const masterTl = gsap.timeline({ paused: true });

    // --- Particle System --- (skip on mobile for performance)
    // NOTE: #bg-particles ships with inline opacity:0 and nothing ever fades it
    // in, so the old loop drew 60 particles per frame into an invisible canvas.
    // The system only starts if the canvas is actually visible (and high tier).
    const canvas = document.getElementById('bg-particles');
    if (canvas && !isMobile && PERF.fx && parseFloat(getComputedStyle(canvas).opacity) > 0) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.1
            });
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.fill();
            });
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }

    masterTl
        // 1. Immediately make hero content and nav technically 'visible' behind the preloader
        .set('.nav, .hero-content', { autoAlpha: 1 })

        // 2. OPEN the spotlight as the preloader crossfades out (the preloader
        // fade itself is owned by startSite so there is exactly one fade path)
        .to(spotlightObj, {
            r: window.innerWidth * 0.15,
            duration: 2,
            ease: "power3.out"
        }, 0.2)

        // 3. Elements like tags and titles are already 'there', just hidden by darkness
        .from('.logo', { opacity: 0, filter: "blur(10px)", y: -10, duration: 1.5, ease: "power2.out" }, 0.5)
        .from('.hero-tag', { opacity: 0, y: -20, filter: "blur(5px)", duration: 1.2, ease: "power2.out" }, 0.5)
        .from('.hero-title', { opacity: 0, scale: 0.95, filter: "blur(15px)", duration: 1.5, ease: "expo.out" }, 0.5)
        .from('.hero-subtitle', { opacity: 0, y: 10, filter: "blur(5px)", duration: 1.2, ease: "power2.out" }, 0.8)
        .from('.scroll-indicator', { opacity: 0, duration: 1 }, 1.2);

    // If the tab loads in the background, browsers keep muted videos paused —
    // resume the hero video when the tab becomes visible (while hero on screen).
    if (!isMobile && mainVid) {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) return;
            if (mainVid.currentSrc && mainVid.paused && Number(gsap.getProperty('.hero-bg', 'opacity')) > 0) {
                const p = mainVid.play();
                if (p && p.catch) p.catch(() => {});
            }
        });
    }

    // Continuous floating breathing effect for the main text
    gsap.to('.hero-main', {
        y: -15,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2
    });

    // Session Storage Check: Skip Preloader ONLY on internal navigation, play it on Refresh
    const isReload = performance.getEntriesByType("navigation")[0]?.type === 'reload';
    
    if (sessionStorage.getItem('chyk-loaded') === 'true' && !isReload) {
        const loadingScreen = document.querySelector('.loading-screen');
        if(loadingScreen) loadingScreen.style.display = 'none';

        if(preloaderVid) {
            preloaderVid.style.display = 'none';
            preloaderVid.pause();
        }
        if(mainVid && mainVid.currentSrc) {
            gsap.set(mainVid, { autoAlpha: 1 });
            const p = mainVid.play();
            if (p && p.catch) p.catch(() => {});
        }

        masterTl.progress(1); // Instantly jump to end of preloader timeline
        if (lenis) lenis.start();

        return; // Exit here, skipping the rest of the loading logic below
    }

    // Mark as loaded for future navigation
    sessionStorage.setItem('chyk-loaded', 'true');

    // MOBILE/TABLET (≤1024px): desktop hero & preloader video are hidden —
    // show a quick brand flash then start the site immediately (no video wait).
    if (window.innerWidth <= 1024) {
        const lsMobile = document.querySelector('.loading-screen');
        if (preloaderVid) { preloaderVid.pause(); preloaderVid.style.display = 'none'; }
        gsap.to(lsMobile, {
            opacity: 0, duration: 0.7, delay: 1.1, ease: 'power2.inOut',
            onComplete: () => { if (lsMobile) lsMobile.style.display = 'none'; }
        });
        masterTl.progress(1);
        if (lenis) lenis.start();
        return;
    }

    // LOW TIER (desktop): the preloader video was never downloaded — quick
    // brand flash, instant hero state, native scrolling. Nothing can strand
    // the loader because no media is awaited.
    if (PERF.tier === 'low') {
        const lsLow = document.querySelector('.loading-screen');
        if (preloaderVid) preloaderVid.style.display = 'none';
        gsap.to(lsLow, {
            opacity: 0, duration: 0.6, delay: 0.9, ease: 'power2.inOut',
            onComplete: () => { if (lsLow) lsLow.style.display = 'none'; }
        });
        masterTl.progress(1);
        gsap.delayedCall(0.5, () => ScrollTrigger.refresh());
        return;
    }

    // Loading Text Sequence
    const loadingText = document.querySelector('.loading-text');
    if(loadingText) {
        const loadChars = loadingText.innerText.split('');
        loadingText.innerHTML = '';
        loadChars.forEach(char => {
            loadingText.innerHTML += `<span class="load-char" style="display:inline-block; opacity:0;">${char}</span>`;
        });

        const loadingTl = gsap.timeline();
        loadingTl
            .fromTo('.load-char', 
                { opacity: 0, filter: "blur(12px)", y: 15 },
                { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.5, stagger: 0.15, ease: "power2.out" }
            )
            .fromTo('.loading-text', 
                { letterSpacing: '1vw' },
                { letterSpacing: '3.5vw', duration: 3, ease: "power1.inOut" }, 
                "-=1.5"
            )
            .to('.load-char', {
                opacity: 0,
                filter: "blur(10px)",
                scale: 1.05,
                duration: 1,
                stagger: 0.08,
                ease: "power2.inOut"
            }, "-=0.8")
            .to('.loading-screen', { 
                opacity: 0, 
                duration: 1, 
                ease: "power2.inOut",
                onComplete: () => {
                    document.querySelector('.loading-screen').style.display = 'none';
                    if (preloaderVid) {
                        const p = preloaderVid.play();
                        // Autoplay blocked → skip straight to the reveal
                        if (p && p.catch) p.catch(() => startSite('autoplay-blocked'));
                    }
                }
            }, "-=0.8");
    }

    // ── SINGLE GUARDED COMPLETION PATH ─────────────────────────────────
    // Every signal (timeupdate near-end, ended, error, blocked autoplay,
    // global timeout) funnels into startSite(). The guard means the master
    // timeline can only ever start once, from progress 0 — the black
    // spotlight reveal can no longer be re-triggered mid-flight or jump.
    let siteStarted = false;
    function startSite(reason) {
        if (siteStarted) return;
        siteStarted = true;

        // The loading text screen can never be left behind
        const ls = document.querySelector('.loading-screen');
        if (ls && ls.style.display !== 'none') {
            gsap.to(ls, { opacity: 0, duration: 0.5, ease: 'power2.inOut',
                onComplete: () => { ls.style.display = 'none'; } });
        }

        // Crossfade: main video starts underneath while the preloader fades above
        if (mainVid && mainVid.currentSrc) {
            gsap.set(mainVid, { autoAlpha: 1 });
            const p = mainVid.play();
            if (p && p.catch) p.catch(() => {});
        }
        if (preloaderVid && preloaderVid.style.display !== 'none') {
            gsap.to(preloaderVid, {
                autoAlpha: 0,
                duration: 1.5,
                ease: 'power2.inOut',
                onComplete: () => { preloaderVid.style.display = 'none'; }
            });
        }

        // The reveal timeline starts exactly once, always from 0
        masterTl.play();

        // Scrolling starts once layout/media state has settled; one refresh
        // after the reveal finishes corrects any pin measurements.
        gsap.delayedCall(0.35, () => { if (lenis) lenis.start(); });
        gsap.delayedCall(2.6, () => ScrollTrigger.refresh());
    }

    if (preloaderVid) {
        preloaderVid.addEventListener('timeupdate', () => {
            // Crossfade 1.2 s before the video ends to prevent a freeze-frame
            if (preloaderVid.duration && preloaderVid.currentTime >= preloaderVid.duration - 1.2) {
                startSite('timeupdate');
            }
        });
        preloaderVid.addEventListener('ended', () => startSite('ended'));
        preloaderVid.addEventListener('error', () => startSite('error'));
        // Dependable fallback: a stalled video or slow connection can never
        // strand the loader.
        setTimeout(() => startSite('timeout'), 10000);
    } else {
        setTimeout(() => startSite('no-preloader'), 800);
    }

});

