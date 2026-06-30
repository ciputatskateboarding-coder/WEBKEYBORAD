// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Responsive Guard State
const isMobile = () => window.innerWidth < 768;

/* ==========================================================================
   RANDOMIZED GENERATIVE ANIMATION SYSTEM
   ========================================================================== */

// Helper to generate a random number within range
const randomRange = (min, max) => Math.random() * (max - min) + min;

// Arrays of possible animations for elements entering/exiting viewport
const entranceVariations = [
    // Variation 1: Glitch / distorts and slides from a random direction
    (el) => {
        const xOffset = randomRange(-150, 150);
        const yOffset = randomRange(50, 150);
        const rot = randomRange(-15, 15);
        return {
            x: xOffset,
            y: yOffset,
            rotation: rot,
            scale: 0.8,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            clearProps: "all"
        };
    },
    // Variation 2: Stutter Step / Stop-motion reveal
    (el) => {
        return {
            scale: 0.6,
            rotation: randomRange(-20, 20),
            opacity: 0,
            duration: 1.2,
            ease: "steps(6)", // Stuttery movement
            clearProps: "all"
        };
    },
    // Variation 3: Heavy tilt slide-in
    (el) => {
        const direction = Math.random() > 0.5 ? 200 : -200;
        return {
            x: direction,
            skewX: randomRange(-30, 30),
            opacity: 0,
            duration: 0.9,
            ease: "back.out(1.5)",
            clearProps: "all"
        };
    }
];

// Exit animations (when scrolled out of viewport)
const exitVariations = [
    // Exit 1: Drop & Dissolve
    () => ({
        y: 100,
        rotation: randomRange(-10, 10),
        opacity: 0,
        duration: 0.5,
        ease: "power2.in"
    }),
    // Exit 2: Flying slide out
    () => ({
        x: Math.random() > 0.5 ? 250 : -250,
        rotation: randomRange(-30, 30),
        opacity: 0,
        duration: 0.6,
        ease: "power3.in"
    }),
    // Exit 3: Glitch scale down
    () => ({
        scale: 0.5,
        skewY: randomRange(-20, 20),
        opacity: 0,
        duration: 0.4,
        ease: "steps(4)"
    })
];

// Initialize scroll entrance/exit animations for marked elements
function initGenerativeScroll() {
    if (isMobile()) return; // Skip heavy layout computations on mobile

    const animElements = document.querySelectorAll('.animate-random, .spec-card');
    
    animElements.forEach((el) => {
        // Choose index randomly for entrance
        const entranceFn = entranceVariations[Math.floor(Math.random() * entranceVariations.length)];
        const startState = entranceFn(el);
        
        // Apply initial state
        gsap.set(el, {
            x: startState.x || 0,
            y: startState.y || 0,
            rotation: startState.rotation || 0,
            scale: startState.scale !== undefined ? startState.scale : 1,
            skewX: startState.skewX || 0,
            skewY: startState.skewY || 0,
            opacity: 0
        });

        // Trigger animation on scroll
        ScrollTrigger.create({
            trigger: el,
            start: "top 90%",
            end: "bottom 10%",
            onEnter: () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    rotation: el.dataset.angle ? parseFloat(el.dataset.angle) : 0,
                    scale: 1,
                    skewX: 0,
                    skewY: 0,
                    opacity: 1,
                    duration: startState.duration || 0.8,
                    ease: startState.ease || "power2.out",
                    overwrite: "auto"
                });
            },
            onLeave: () => {
                const exitFn = exitVariations[Math.floor(Math.random() * exitVariations.length)];
                gsap.to(el, { ...exitFn(), overwrite: "auto" });
            },
            onEnterBack: () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    rotation: el.dataset.angle ? parseFloat(el.dataset.angle) : 0,
                    scale: 1,
                    skewX: 0,
                    skewY: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            },
            onLeaveBack: () => {
                const exitFn = exitVariations[Math.floor(Math.random() * exitVariations.length)];
                gsap.to(el, { ...exitFn(), overwrite: "auto" });
            }
        });
    });
}

/* ==========================================================================
   HERO TITLE SHATTER ANIMATION
   ========================================================================== */
function initHeroShatter() {
    const title = document.querySelector('.hero-title');
    const chars = document.querySelectorAll('.hero-title .char');
    if (!title || chars.length === 0) return;

    // Apply scroll trigger to shatter text on scroll down
    chars.forEach((char) => {
        // Calculate random destination coordinates for shatter effect
        const randomX = randomRange(-150, 150);
        const randomY = randomRange(-200, 50);
        const randomRot = randomRange(-90, 90);
        
        gsap.to(char, {
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom 20%",
                scrub: 1
            },
            x: randomX,
            y: randomY,
            rotation: randomRot,
            opacity: 0,
            scale: randomRange(0.5, 1.2),
            ease: "none"
        });
    });
    
    // Scale logo or taglines on scroll in hero
    gsap.to('.spray-stencil-text', {
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        y: -100,
        rotation: -25,
        opacity: 0.05
    });
}

/* ==========================================================================
   INTERACTIVE SKATEBOARD DRAG SHOWCASE
   ========================================================================== */
function initDeckDrag() {
    const deck = document.getElementById('deck-card');
    const dragZone = document.querySelector('.deck-drag-zone');
    const specCards = document.querySelectorAll('.spec-card');
    if (!deck || !dragZone) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let targetTiltZ = 0;
    let currentRotationY = 0;
    let currentRotationX = 0;
    let currentTiltZ = 0;

    // Event Handlers for Dragging
    const handleDragStart = (e) => {
        isDragging = true;
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        deck.style.transition = 'none';
        document.body.style.userSelect = 'none';
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        // Map drag distances to rotation angles
        targetRotationY = deltaX * 0.35; 
        targetRotationX = -deltaY * 0.15;
        targetTiltZ = deltaX * 0.1; // Skew / tilt sideways

        // Slightly jitter/shake spec cards when dragging to make it feel interconnected
        if (!isMobile()) {
            specCards.forEach(card => {
                const baseAngle = parseFloat(card.dataset.angle) || 0;
                gsap.to(card, {
                    rotation: baseAngle + (deltaX * 0.03),
                    x: deltaX * 0.05,
                    duration: 0.1
                });
            });
        }
    };

    const handleDragEnd = () => {
        isDragging = false;
        // Snap back values
        targetRotationY = 0;
        targetRotationX = 0;
        targetTiltZ = 0;
        document.body.style.userSelect = '';
        
        // Reset specs
        specCards.forEach(card => {
            const baseAngle = parseFloat(card.dataset.angle) || 0;
            gsap.to(card, {
                rotation: baseAngle,
                x: 0,
                duration: 0.5,
                ease: "back.out(2)"
            });
        });
    };

    // Listeners
    dragZone.addEventListener('mousedown', handleDragStart);
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    dragZone.addEventListener('touchstart', handleDragStart, { passive: true });
    window.addEventListener('touchmove', handleDragMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);

    // Physics Loop for Smooth Inertial Glide back to center
    function updatePhysics() {
        // Linear Interpolation (lerp) towards target states
        currentRotationY += (targetRotationY - currentRotationY) * 0.1;
        currentRotationX += (targetRotationX - currentRotationX) * 0.1;
        currentTiltZ += (targetTiltZ - currentTiltZ) * 0.1;

        deck.style.transform = `rotateY(${currentRotationY}deg) rotateX(${currentRotationX}deg) rotateZ(${currentTiltZ}deg)`;

        requestAnimationFrame(updatePhysics);
    }
    updatePhysics();
}

/* ==========================================================================
   PRO TEAM DOODLE EFFECT ON HOVER
   ========================================================================== */

// Predefined drawing doodles (relative to canvas 0-1 coordinate space)
const doodleLibrary = [
    // Doodle 1: Devil Horns and Halo
    (ctx, w, h) => {
        ctx.strokeStyle = '#FF5500';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Halo above head (assume head is around top-center: center is w/2, h/4)
        ctx.beginPath();
        ctx.ellipse(w * 0.5, h * 0.2, w * 0.15, h * 0.03, Math.PI / 12, 0, Math.PI * 2);
        ctx.stroke();
        
        // Small halo glows
        ctx.beginPath();
        ctx.moveTo(w * 0.4, h * 0.15); ctx.lineTo(w * 0.38, h * 0.1);
        ctx.moveTo(w * 0.5, h * 0.14); ctx.lineTo(w * 0.5, h * 0.08);
        ctx.moveTo(w * 0.6, h * 0.15); ctx.lineTo(w * 0.62, h * 0.1);
        ctx.stroke();

        // Crosses on eyes (assume eyes around w*0.45, h*0.35 & w*0.55, h*0.35)
        ctx.beginPath();
        // Left Eye Cross
        ctx.moveTo(w * 0.42, h * 0.32); ctx.lineTo(w * 0.48, h * 0.38);
        ctx.moveTo(w * 0.48, h * 0.32); ctx.lineTo(w * 0.42, h * 0.38);
        // Right Eye Cross
        ctx.moveTo(w * 0.52, h * 0.32); ctx.lineTo(w * 0.58, h * 0.38);
        ctx.moveTo(w * 0.58, h * 0.32); ctx.lineTo(w * 0.52, h * 0.38);
        ctx.stroke();
    },
    // Doodle 2: Graffiti Crown and Sparkles
    (ctx, w, h) => {
        ctx.strokeStyle = '#FF5500';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Crown above head
        ctx.beginPath();
        ctx.moveTo(w * 0.35, h * 0.22);
        ctx.lineTo(w * 0.32, h * 0.12);
        ctx.lineTo(w * 0.44, h * 0.17);
        ctx.lineTo(w * 0.5, h * 0.08);
        ctx.lineTo(w * 0.56, h * 0.17);
        ctx.lineTo(w * 0.68, h * 0.12);
        ctx.lineTo(w * 0.65, h * 0.22);
        ctx.closePath();
        ctx.stroke();
        
        // Sparkle stars
        drawStar(ctx, w * 0.25, h * 0.3, 10);
        drawStar(ctx, w * 0.75, h * 0.25, 8);
        drawStar(ctx, w * 0.8, h * 0.45, 12);
    },
    // Doodle 3: Punk Skateboard Scribble (Vampire fangs, bones, and spray tag)
    (ctx, w, h) => {
        ctx.strokeStyle = '#FF5500';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Graffiti Tag "BSC" on bottom corner
        ctx.beginPath();
        ctx.font = '800 24px "Space Mono"';
        ctx.fillStyle = '#FF5500';
        ctx.fillText('BSC!', w * 0.1, h * 0.9);
        
        // Arrow pointing to skater name
        ctx.moveTo(w * 0.15, h * 0.82);
        ctx.lineTo(w * 0.25, h * 0.78);
        ctx.lineTo(w * 0.22, h * 0.75);
        ctx.moveTo(w * 0.25, h * 0.78);
        ctx.lineTo(w * 0.26, h * 0.83);
        ctx.stroke();

        // Messy vampire fangs over mouth (assume mouth is around w*0.5, h*0.48)
        ctx.beginPath();
        ctx.moveTo(w * 0.45, h * 0.46);
        ctx.lineTo(w * 0.55, h * 0.46);
        // Fangs
        ctx.moveTo(w * 0.47, h * 0.46); ctx.lineTo(w * 0.47, h * 0.50); ctx.lineTo(w * 0.49, h * 0.46);
        ctx.moveTo(w * 0.53, h * 0.46); ctx.lineTo(w * 0.53, h * 0.50); ctx.lineTo(w * 0.51, h * 0.46);
        ctx.stroke();
    }
];

// Helper to draw a graffiti sparkle star
function drawStar(ctx, cx, cy, r) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r*0.3, cy - r*0.3);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx + r*0.3, cy + r*0.3);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r*0.3, cy + r*0.3);
    ctx.lineTo(cx - r, cy);
    ctx.lineTo(cx - r*0.3, cy - r*0.3);
    ctx.closePath();
    ctx.stroke();
}

function initCrewDoodles() {
    const skaterCards = document.querySelectorAll('.skater-card');
    
    skaterCards.forEach((card, index) => {
        const canvas = card.querySelector('.doodle-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Set canvas sizing relative to actual offset bounding box
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        let drawTimer = null;
        
        card.addEventListener('mouseenter', () => {
            // Clear any old drawing
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Choose doodle function
            const doodleFn = doodleLibrary[index % doodleLibrary.length];
            
            // Draw doodle instantly with micro delay to simulate pen drawing
            let progress = 0;
            ctx.strokeStyle = '#FF5500';
            ctx.lineWidth = 3.5;
            
            // Draw the doodle
            doodleFn(ctx, canvas.width, canvas.height);
            
            // Add distortion glitch filter briefly to skater image on hover
            const img = card.querySelector('.skater-img');
            if (img) {
                img.style.filter = 'grayscale(0.3) contrast(1.3) url(#distort-glitch)';
                setTimeout(() => {
                    img.style.filter = 'grayscale(0.5) contrast(1.2)';
                }, 250);
            }
        });
        
        card.addEventListener('mouseleave', () => {
            // Fade out the doodle on mouse leave
            let opacity = 1;
            const fadeOut = () => {
                if (opacity > 0) {
                    opacity -= 0.15;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.globalAlpha = opacity;
                    const doodleFn = doodleLibrary[index % doodleLibrary.length];
                    doodleFn(ctx, canvas.width, canvas.height);
                    requestAnimationFrame(fadeOut);
                } else {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.globalAlpha = 1; // reset alpha
                }
            };
            fadeOut();
        });
    });
}

/* ==========================================================================
   INITIALIZATION TRIGGER
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
    // 1. Initialise the Generative scrolling layouts
    initGenerativeScroll();
    
    // 2. Setup hero shatter dynamics
    initHeroShatter();
    
    // 3. Setup interactive drag zone
    initDeckDrag();
    
    // 4. Setup Team Doodle drawings
    initCrewDoodles();
    
    // Refresh ScrollTrigger to sync all trigger points
    ScrollTrigger.refresh();
});

// Watch resize for adaptive layouts
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
