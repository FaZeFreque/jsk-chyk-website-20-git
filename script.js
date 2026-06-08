document.addEventListener('DOMContentLoaded', () => {

    // View Background Button Logic
    const viewBgBtn = document.getElementById('view-bg-btn');
    if (viewBgBtn) {
        let isBgMode = false;
        viewBgBtn.addEventListener('click', () => {
            isBgMode = !isBgMode;
            const elementsToHide = ['.site-header', '.hero-tag', '.hero-main', '.scroll-indicator', '.hero-darkness', '.floating-node'];
            
            if (isBgMode) {
                viewBgBtn.innerText = 'RESTORE VIEW';
                gsap.to(elementsToHide, {
                    opacity: 0,
                    pointerEvents: 'none',
                    duration: 0.5,
                    ease: "power2.inOut"
                });
            } else {
                viewBgBtn.innerText = 'VIEW BG';
                gsap.to(elementsToHide, {
                    opacity: 1,
                    pointerEvents: 'auto',
                    duration: 0.5,
                    ease: "power2.inOut",
                    clearProps: "pointerEvents"
                });
            }
        });
    }

    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    // Device detection (set once at load; viewport resize doesn't reinit heavy GSAP)
    // isMobile now covers both phones AND tablets (≤1024px) — CSS horizontal snap-scroll
    // handles the milestone carousel on these devices instead of GSAP.
    const isMobile = window.innerWidth <= 1024;
    const isTouch  = window.innerWidth <= 1024;

    // Global Interactive Physics State (Hoisted for timeline access)
    let spotlightObj = { r: 0, stretch: 0, angle: 0 }; 
    
    // Canvas Map Reveal State
    let isVoidRevealing = false;
    let voidCtx = null;
    let voidRevealRadius = { val: 0 };

    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.stop(); // Stop during load

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
                end: () => "+=" + (horizontalTrack.scrollWidth * 2.5), // Even slower speed for maximum comfort
                scrub: 1.2, // Smoother, slightly more damped scroll
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
            },
            onReverseComplete: () => {
                // Restore hero when scrolling back to start
                gsap.set('.hero-bg, .hero-darkness, .hero-content', { autoAlpha: 1 });
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
        horizontalTl.to(horizontalTrack, {
            x: () => -(horizontalTrack.scrollWidth - window.innerWidth),
            duration: 10,
            ease: "none"
        }, 0.5);

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

                if (!isTouch) {
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
            // Disabled on mobile (no mouse, saves battery)
            if (!isTouch) {
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
            masterCoreTl.to('.carousel-container', { x: '-150vw', duration: 2, ease: "power2.inOut" }, 9.5);
            
            // PHASE 4: Gates Open into the Void, triggered by the rope
            masterCoreTl.set('.chyk-gate-top, .chyk-gate-bottom', { opacity: 1, immediateRender: false }, 11.5);
            masterCoreTl.to('.golden-rope', { opacity: 0, duration: 0.1 }, 11.5); // Instantly swap rope for the gate borders
            
            // Cinematic Shutter Reveal
            masterCoreTl.to('.chyk-gate-top', { yPercent: -100, duration: 3, ease: "expo.inOut" }, 11.5);
            masterCoreTl.to('.chyk-gate-bottom', { yPercent: 100, duration: 3, ease: "expo.inOut" }, 11.5);
            
            // Map Scratch-off Reveal (Behind the gates)
            masterCoreTl.add(() => { 
                isVoidRevealing = true; 
                if (typeof mouseGridX !== 'undefined' && mouseGridX === -1) {
                    mouseGridX = window.innerWidth / 2;
                    mouseGridY = window.innerHeight / 2;
                }
            }, 12.0);

            // Cinematic Flash effect from behind the crack (Optional, applied to the text/content wrapper)
            masterCoreTl.fromTo('.void-content', 
                { filter: "brightness(5) contrast(2)", opacity: 0, scale: 1.05 }, 
                { filter: "brightness(1) contrast(1)", opacity: 1, scale: 1, duration: 3, ease: "expo.out" }, 11.5);

            const riftVoid = document.querySelector('.void-center-text');
            if (riftVoid) {
                // Drift in slowly and dramatically
                masterCoreTl.fromTo(riftVoid, { scale: 0.8, y: 50, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 3, ease: "power3.out" }, 12.0);
                
                // Hold for a LONG time, then blur out very slowly!
                masterCoreTl.to(riftVoid, { scale: 0.9, opacity: 0, filter: "blur(20px)", duration: 2.5, ease: "power2.inOut" }, 17.0); 
            }

            // Single unified ScrollTrigger to pin the section and scrub the timeline (desktop only)
            ScrollTrigger.create({
                trigger: coreSection,
                start: "top top",
                end: () => `+=${window.innerHeight * 16}`,
                pin: true,
                scrub: 1.5,
                animation: masterCoreTl
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
                    if (typeof lenis !== 'undefined') lenis.stop(); // Lock Lenis smooth scroll specifically!
                    
                    const activeCard = cards[activeIndex];
                    
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
                        extDesc.innerHTML = "This milestone represents a pivotal moment in our journey, marking significant progress and innovation. By overcoming complex challenges and pushing the boundaries of what is possible, we have established a new standard for excellence. The commitment and vision driving this phase will serve as the foundation for all future endeavors, ensuring sustained growth and impact.";
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

                    // SPLIT PROPORTIONS: 65% Image, 35% White Text Block
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
                    if (typeof lenis !== 'undefined') lenis.start(); // Unlock Lenis smooth scroll!

                    const activeCard = cards[activeIndex];
                    activeCard.classList.remove('expanded');

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
                        detailDesc.innerText = "Detailed information about this milestone. This represents a massive leap forward in our journey. The expansion and synthesis phases converged to create an entirely new paradigm.";

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

            // Refresh scroll trigger after a delay to ensure images loaded properly
            setTimeout(() => ScrollTrigger.refresh(), 500);
            setTimeout(() => ScrollTrigger.refresh(), 2000);
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
                    scrub: 1
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
            `FINAL TUNEL SEQUNCE SURE/image1_${index.toString().padStart(5, '0')}.jpg`
        );

        const images = [];
        const air = { frame: 0 };

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

        // High-Performance Sequential Background Loading (OPTIMIZED: Batched & Deferred)
        let loadedCount = 0;
        let imagesStarted = false;
        
        function preloadImages() {
            if (imagesStarted) return;
            imagesStarted = true;
            console.log("Starting Tunnel Frame Preload in batches...");
            
            const batchSize = 15; // Load 15 at a time
            let currentBatchStart = 0;

            function loadNextBatch() {
                if (currentBatchStart >= frameCount) return;
                
                let batchLoadedCount = 0;
                const end = Math.min(currentBatchStart + batchSize, frameCount);
                
                for (let i = currentBatchStart; i < end; i++) {
                    const img = new Image();
                    img.onload = () => {
                        loadedCount++;
                        batchLoadedCount++;
                        if (loadedCount === 1) render();
                        
                        // Trigger next batch when current one is mostly done
                        if (batchLoadedCount === Math.floor(batchSize * 0.8)) {
                            loadNextBatch();
                        }
                    };
                    img.onerror = () => {
                        loadedCount++;
                        batchLoadedCount++;
                        if (batchLoadedCount === Math.floor(batchSize * 0.8)) {
                            loadNextBatch();
                        }
                    };
                    img.src = currentFrame(i);
                    images.push(img);
                }
                currentBatchStart += batchSize;
            }
            loadNextBatch();
        }

        // Only start preloading when the user scrolls near the tunnel, 
        // OR after a long delay to prioritize initial videos.
        ScrollTrigger.create({
            trigger: ".horizontal-experience",
            start: "top 20%",
            onEnter: preloadImages
        });
        setTimeout(preloadImages, 12000); 

        const tunnelTl = gsap.timeline({
            scrollTrigger: {
                trigger: tunnelSection,
                start: "top top",
                end: "+=15000",
                pin: true,
                scrub: 0.5, 
                onUpdate: () => render()
            }
        });

        // 0. Smooth Entrance Crossfade
        tunnelTl.from(tunnelCanvas, {
            opacity: 0,
            duration: 3,
            ease: "power2.inOut"
        }, 0);

        // 1. Scrub the Image Sequence
        // Now starts at 0 but the frame only starts moving when the user scrolls further
        tunnelTl.to(air, {
            frame: frameCount - 1,
            snap: "frame",
            ease: "none",
            duration: 10
        }, 1.5); // DELAYED START so we don't skip the first frames during the fade-in

        // 2. Cinematic Pulse Fade
        tunnelTl.to(distalLight, {
            opacity: 1,
            duration: 5,
            ease: "power2.inOut"
        }, 1.5);

        // 3. TRANSITION TEXT: "PREPARE FOR IMPACT" (CHYK LOADER STYLE)
        const transitionChars = document.querySelectorAll('.text-transition .journey-char');
        tunnelTl.fromTo(transitionChars, 
            { opacity: 0, filter: "blur(12px)", y: 20 },
            { 
                opacity: 1, 
                filter: "blur(0px)", 
                y: 0, 
                stagger: 0.05, 
                duration: 1.5, 
                ease: "power2.out" 
            }, 
            0.2
        );
        tunnelTl.fromTo(".text-transition .journey-text", 
            { letterSpacing: "0.5vw" },
            { letterSpacing: "1.8vw", duration: 3, ease: "power1.inOut" },
            0.2
        );
        tunnelTl.to(".text-transition", { opacity: 0, filter: "blur(20px)", scale: 1.1, duration: 1.5 }, 1.8);

        // 4. JOURNEY TEXT 1: "BEYOND THE HORIZON"
        const text1Chars = document.querySelectorAll('.text-1 .journey-char');
        tunnelTl.fromTo(text1Chars, 
            { opacity: 0, filter: "blur(12px)", y: 20 },
            { 
                opacity: 1, 
                filter: "blur(0px)", 
                y: 0, 
                stagger: 0.05, 
                duration: 1.5, 
                ease: "power2.out" 
            }, 
            2
        );
        tunnelTl.fromTo(".text-1 .journey-text", 
            { letterSpacing: "0.5vw" },
            { letterSpacing: "1.8vw", duration: 3, ease: "power1.inOut" },
            2
        );
        tunnelTl.to(".text-1", { z: 4000, opacity: 0, filter: "blur(20px)", duration: 2 }, 4.5);

        // 5. JOURNEY TEXT 2: "THE ASCENT IS INFINITE"
        const text2Chars = document.querySelectorAll('.text-2 .journey-char');
        tunnelTl.fromTo(text2Chars, 
            { opacity: 0, filter: "blur(12px)", y: 20 },
            { 
                opacity: 1, 
                filter: "blur(0px)", 
                y: 0, 
                stagger: 0.05, 
                duration: 1.5, 
                ease: "power2.out" 
            }, 
            6
        );
        tunnelTl.fromTo(".text-2 .journey-text", 
            { letterSpacing: "0.5vw" },
            { letterSpacing: "1.8vw", duration: 3, ease: "power1.inOut" },
            6
        );
        // Ends exactly with the cave sequence (10)
        tunnelTl.to(".text-2", { z: 4000, opacity: 0, filter: "blur(20px)", duration: 2.5 }, 7.5);

        // 6. SEAMLESS TRANSITION TO MAIN HOVER
        // Fades out the tunnel canvas to reveal the background video matching the last frame
        tunnelTl.to("#tunnel-canvas, .distal-light", {
            opacity: 0,
            duration: 2,
            ease: "power2.inOut"
        }, 8); 
        
        // Reveal the final experience background video and container
        tunnelTl.to('.final-experience', {
            autoAlpha: 1, // Handles both opacity and visibility
            duration: 2,
            ease: "power2.inOut"
        }, 8);

        // Hide the distal light completely to remove any darkening
        tunnelTl.to('.distal-light', {
            autoAlpha: 0,
            duration: 1,
            ease: "power2.inOut"
        }, 8);



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
            // Cap DPR at 1 on mobile (performance), max 2 on desktop
            const dpr = isMobile ? 1 : Math.max(window.devicePixelRatio || 1, 2);
            
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
            if (!images[air.frame]) return;
            
            const img = images[air.frame];
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
            requestAnimationFrame(updateGrid);
        }
        if (!isMobile) updateGrid();
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
        
        requestAnimationFrame(updatePhysics);
    }

    // Start the physics loop (skip on mobile — no mouse, saves battery/CPU)
    if (!isMobile) updatePhysics();

    const parallaxTexts = document.querySelectorAll('.hero-title, .hero-subtitle, .text-holder h2, .core-title');

    if (!isTouch) {
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

        parallaxTexts.forEach(el => {
            gsap.to(el, {
                x: xOffset,
                y: yOffset,
                rotationX: -yOffset * 0.2,
                rotationY: xOffset * 0.2,
                transformPerspective: 500,
                duration: 1.5,
                ease: "power2.out"
            });
        });
    });
    }

    // 3. Loading & Preloader Sequence
    if(mainVid) mainVid.pause();
    if(preloaderVid) preloaderVid.pause();

    const masterTl = gsap.timeline({ paused: true });

    // --- Particle System --- (skip on mobile for performance)
    const canvas = document.getElementById('bg-particles');
    if (canvas && !isMobile) {
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
        
        // 2. Fade out preloader and OPEN the spotlight simultaneously
        .to('.preloader', {
            autoAlpha: 0,
            duration: 1.2,
            ease: "power2.inOut"
        }, 0)
        
        .to(spotlightObj, { 
            r: window.innerWidth * 0.15, 
            duration: 2, 
            ease: "power3.out"
        }, 0.2) // Start opening just as preloader begins to fade

        // 3. Elements like tags and titles are already 'there', just hidden by darkness
        .from('.logo', { opacity: 0, filter: "blur(10px)", y: -10, duration: 1.5, ease: "power2.out" }, 0.5)
        .from('.hero-tag', { opacity: 0, y: -20, filter: "blur(5px)", duration: 1.2, ease: "power2.out" }, 0.5)
        .from('.hero-title', { opacity: 0, scale: 0.95, filter: "blur(15px)", duration: 1.5, ease: "expo.out" }, 0.5)
        .from('.hero-subtitle', { opacity: 0, y: 10, filter: "blur(5px)", duration: 1.2, ease: "power2.out" }, 0.8)
        .from('.scroll-indicator', { opacity: 0, duration: 1 }, 1.2)
        .from('.scrapbook-line', { opacity: 0, stagger: 0.2, duration: 1 }, 1.5);

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
        if(mainVid) {
            gsap.set(mainVid, { autoAlpha: 1 });
            mainVid.play();
        }
        
        masterTl.progress(1); // Instantly jump to end of preloader timeline
        if(typeof lenis !== 'undefined') lenis.start();
        
        return; // Exit here, skipping the rest of the loading logic below
    }
    
    // Mark as loaded for future navigation
    sessionStorage.setItem('chyk-loaded', 'true');

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
                    if(preloaderVid) preloaderVid.play();
                }
            }, "-=0.8");
    }

    if(preloaderVid) {
        let transitionStarted = false;
        
        preloaderVid.addEventListener('timeupdate', () => {
            // Start the crossfade 1.2 seconds before the video ends to prevent freezing
            if (!transitionStarted && preloaderVid.duration && preloaderVid.currentTime >= preloaderVid.duration - 1.2) {
                console.log("Preloader video near end, starting transition...");
                transitionStarted = true;
                
                // Instantly show main video underneath
                if(mainVid) {
                    gsap.set(mainVid, { autoAlpha: 1 });
                    mainVid.play();
                }
                
                // Crossfade out the preloader to reveal the main video/darkness
                gsap.to(preloaderVid, { 
                    autoAlpha: 0, 
                    duration: 1.5, 
                    ease: "power2.inOut",
                    onComplete: () => {
                        preloaderVid.style.display = 'none';
                    }
                });

                // Trigger the Iris Shrink / Master Reveal transition simultaneously
                masterTl.play();
                if(typeof lenis !== 'undefined') lenis.start();
            }
        });

        preloaderVid.addEventListener('ended', () => {
            // Backup in case timeupdate fails to trigger
            if (!transitionStarted) {
                preloaderVid.style.display = 'none';
                if(mainVid) {
                    gsap.set(mainVid, { autoAlpha: 1 });
                    mainVid.play();
                }
                masterTl.play();
                lenis.start();
            }
        });

        preloaderVid.addEventListener('error', () => {
            document.querySelector('.loading-screen').style.display = 'none';
            preloaderVid.style.display = 'none';
            if(mainVid) {
                gsap.set(mainVid, { autoAlpha: 1 });
                mainVid.play();
            }
            masterTl.play();
            if(typeof lenis !== 'undefined') lenis.start();
        });

        // GLOBAL FALLBACK: If video stalls or connection is too slow, force start.
        // On mobile, autoplay is often blocked so reduce to 3.5 s.
        setTimeout(() => {
            if (!transitionStarted) {
                console.log("Global fallback triggered: Starting site...");
                transitionStarted = true;
                const ls = document.querySelector('.loading-screen');
                if (ls) ls.style.display = 'none';
                if(preloaderVid) preloaderVid.style.display = 'none';
                if(mainVid) {
                    gsap.set(mainVid, { autoAlpha: 1 });
                    mainVid.play();
                }
                masterTl.play();
                if(typeof lenis !== 'undefined') lenis.start();
            }
        }, isMobile ? 3500 : 10000);
    }

});
