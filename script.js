// ================== NAVBAR TOGGLE ==================
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// ================== GSAP ANIMATIONS ==================
gsap.from(".hero h1", {
  opacity: 0,
  y: 50,
  duration: 1
});

gsap.from(".hero p", {
  opacity: 0,
  y: 30,
  delay: 0.3,
  duration: 1
});

// Typewriter effect
const roles = [
  "Software Developer",
  "AI Enthusiast",
  "Web App Builder",
  "Problem Solver"
];

let index = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  const role = roles[index];
  const display = document.getElementById("role");

  if (!isDeleting) {
    charIndex++;
    display.innerHTML = role.substring(0, charIndex) + '<span class="cursor">|</span>';

    if (charIndex === role.length) {
      setTimeout(() => {
        isDeleting = true;
        typeEffect();
      }, 1200);
      return;
    }
  } else {
    charIndex--;
    display.innerHTML = role.substring(0, charIndex) + '<span class="cursor">|</span>';

    if (charIndex === 0) {
      isDeleting = false;
      index = (index + 1) % roles.length;
    }
  }

  setTimeout(typeEffect, isDeleting ? 50 : 100);
}

typeEffect();

// Scroll animations for sections
gsap.utils.toArray("section").forEach(section => {
  gsap.from(section, {
    opacity: 0,
    y: 80,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: section,
      start: "top 85%",
      toggleActions: "play none none none"
    }
  });
});

// ================== ACTIVE NAV LINKS ==================
const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navItems.forEach(a => {
    a.classList.remove("active");
    if (a.getAttribute("href") === `#${current}`) {
      a.classList.add("active");
    }
  });
});

// ================== PROJECT TOGGLE ==================
function toggleProject(card) {
  document.querySelectorAll(".project-card").forEach(c => {
    if (c !== card) c.classList.remove("active");
  });
  card.classList.toggle("active");
}

// ================== GUIDE ROBOT (SCROLL-BASED NPC) ==================
// This robot tracks the current section and smoothly moves to it

const guideRobot    = document.getElementById("guideRobot");
const guideImg      = document.getElementById("guideRobotImg");
const guideSpeech   = document.getElementById("guideSpeech");

// Section guide points: id → message
const guidePoints = [
  { id: "about",    msg: "About me 👤"           },
  { id: "skills",   msg: "My skills 🛠"           },
  { id: "projects", msg: "Check my projects 🚀"  },
  { id: "creative", msg: "Creative work 🎨"       },
  { id: "contact",  msg: "Contact me 📩"          }
];

// State
let currentSectionId  = null;   // which section the guide is "at"
let isSpeechVisible   = false;
let speechTimeout     = null;
let idleTimeout       = null;
let scrollDebounce    = null;
let robotX            = window.innerWidth - 120; // initial X (right side)
let robotY            = window.innerHeight / 2;  // initial Y
let isIdle            = false;

// Place the robot at its initial position immediately
gsap.set(guideRobot, { left: robotX, top: robotY });

// ------ Floating idle animation ------
function startIdleFloat() {
  if (isIdle) return;
  isIdle = true;
  guideRobot.classList.add("idle");

  gsap.to(guideRobot, {
    y: "-=8",
    duration: 1.2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    id: "idleFloat"
  });
}

function stopIdleFloat() {
  if (!isIdle) return;
  isIdle = false;
  guideRobot.classList.remove("idle");
  gsap.killTweensOf(guideRobot, "y");
  gsap.set(guideRobot, { y: 0 });
}

// ------ Show speech bubble ------
function showGuideSpeech(msg) {
  // Don't spam: clear any pending hide
  clearTimeout(speechTimeout);
  guideSpeech.innerText = msg;
  guideRobot.classList.add("show");
  isSpeechVisible = true;

  speechTimeout = setTimeout(() => {
    guideRobot.classList.remove("show");
    isSpeechVisible = false;
  }, 2200);
}

// ------ Move guide robot to a section ------
function moveGuideToSection(point) {
  const section = document.getElementById(point.id);
  if (!section) return;

  const rect = section.getBoundingClientRect();

  // Target: right side of the section, vertically centred in viewport
  const targetX = Math.min(
    window.innerWidth - 90,
    rect.left + rect.width - 90
  );
  const targetY = Math.max(
    80,
    Math.min(window.innerHeight - 90, rect.top + rect.height * 0.25)
  );

  // Determine facing direction
  const movingRight = targetX > robotX;
  guideImg.classList.toggle("face-right", movingRight);
  guideImg.classList.toggle("face-left",  !movingRight);

  stopIdleFloat();
  guideRobot.classList.add("active");

  gsap.to(guideRobot, {
    left: targetX,
    top:  targetY,
    duration: 1.5,
    ease: "power2.out",
    onComplete: () => {
      robotX = targetX;
      robotY = targetY;
      showGuideSpeech(point.msg);

      // Start idle float after arriving
      idleTimeout = setTimeout(startIdleFloat, 300);
    }
  });

  robotX = targetX;
  robotY = targetY;
}

// ------ Detect current section from scroll ------
function detectCurrentSection() {
  let detected = null;
  const triggerY = window.innerHeight * 0.45; // section is "current" when it crosses ~45% of viewport

  guidePoints.forEach(point => {
    const el = document.getElementById(point.id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < triggerY && rect.bottom > 0) {
      detected = point;
    }
  });

  return detected;
}

// ------ Scroll handler with debounce to avoid spam ------
window.addEventListener("scroll", () => {
  clearTimeout(scrollDebounce);

  // Debounce: wait 150ms after scroll stops before acting
  scrollDebounce = setTimeout(() => {
    const point = detectCurrentSection();

    if (point && point.id !== currentSectionId) {
      currentSectionId = point.id;
      moveGuideToSection(point);
    }

    // If user is idle (no scroll for 2s) start floating
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(startIdleFloat, 2000);
  }, 150);

  // Stop idle float immediately when scrolling
  stopIdleFloat();
}, { passive: true });

// ================== AMBIENT ROBOTS (WANDERING) ==================
// r2 and r3 wander randomly — they are purely decorative

class AmbientRobot {
  constructor(element) {
    this.element   = element;
    this.width     = 60;
    this.height    = 60;
    this.speed     = 0.7;

    // Start at a random position
    this.x = Math.random() * (window.innerWidth  - this.width);
    this.y = Math.random() * (window.innerHeight - this.height);

    this.targetX = this.x;
    this.targetY = this.y;

    this.vx = 0;
    this.vy = 0;

    this.idleFrames   = 0;
    this.idleMax      = Math.floor(Math.random() * 120 + 60);  // ~1-2s at 60fps
    this.speechTimer  = 0;
    this.speechInterval = Math.floor(Math.random() * 300 + 360); // ~6-9s at 60fps

    this.speechMessages = [
      "Welcome 👋",
      "Check this section 👀",
      "Nice choice 😎",
      "Scroll more ↓",
      "Let's build 🚀",
      "Cool design! ✨",
      "Awesome work! 🎉"
    ];

    gsap.set(this.element, { left: this.x, top: this.y });
    this.chooseTarget();
    this.animate();
  }

  chooseTarget() {
    // Pick a random point inside the viewport (with margin)
    const margin = 60;
    this.targetX = margin + Math.random() * (window.innerWidth  - margin * 2);
    this.targetY = margin + Math.random() * (window.innerHeight - margin * 2);
    this.idleFrames = 0;
  }

  showSpeech() {
    const speech = this.element.querySelector(".speech");
    speech.innerText = this.speechMessages[
      Math.floor(Math.random() * this.speechMessages.length)
    ];
    this.element.classList.add("show");
    setTimeout(() => this.element.classList.remove("show"), 2000);
  }

  animate() {
    const step = () => {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 2) {
        const s = Math.min(this.speed, dist);
        this.vx = (dx / dist) * s;
        this.vy = (dy / dist) * s;
        this.x += this.vx;
        this.y += this.vy;
        this.idleFrames = 0;
      } else {
        this.idleFrames++;
        if (this.idleFrames > this.idleMax) {
          this.chooseTarget();
        }
      }

      // Clamp to viewport
      this.x = Math.max(0, Math.min(window.innerWidth  - this.width,  this.x));
      this.y = Math.max(0, Math.min(window.innerHeight - this.height, this.y));

      // Flip image based on movement direction
      const img = this.element.querySelector("img");
      if (Math.abs(this.vx) > 0.05) {
        img.style.transform = this.vx > 0 ? "scaleX(1)" : "scaleX(-1)";
      }

      this.element.style.left = this.x + "px";
      this.element.style.top  = this.y + "px";

      // Speech
      this.speechTimer++;
      if (this.speechTimer >= this.speechInterval) {
        this.showSpeech();
        this.speechTimer = 0;
        this.speechInterval = Math.floor(Math.random() * 300 + 360);
      }

      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }
}

// Initialise ambient robots (r2, r3 only — r1 is the guide)
document.querySelectorAll("[data-robot]").forEach(el => {
  new AmbientRobot(el);
});

// ================== LOGO ANIMATION ==================

const name = "Pranav Pawar";
const logo = document.getElementById("logoText");

function buildName() {
  logo.innerHTML = "";

  name.split("").forEach((letter, i) => {
    const span = document.createElement("span");
    span.textContent = letter;
    span.style.opacity = 0;
    span.style.display = "inline-block";
    span.style.transform = "translateY(10px)";
    logo.appendChild(span);

    gsap.to(span, {
      opacity: 1,
      y: 0,
      delay: i * 0.1,
      duration: 0.3
    });
  });
}

function destroyName() {
  const letters = logo.querySelectorAll("span");

  gsap.fromTo(logo,
    { x: -3 },
    { x: 3, repeat: 5, yoyo: true, duration: 0.05 }
  );

  gsap.to(letters, {
    y: -30,
    opacity: 0,
    stagger: 0.05,
    duration: 0.3
  });
}

function logoLoop() {
  buildName();
  setTimeout(destroyName, 2500);
  setTimeout(logoLoop, 3500);
}

logoLoop();