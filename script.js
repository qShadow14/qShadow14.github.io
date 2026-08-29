const countdownState = {
  totalSeconds: (158 * 24 * 60 * 60) + (8 * 60 * 60) + (32 * 60) + 45
};

const canvas = document.getElementById('space-canvas');
const canvasContext = canvas?.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let particles = [];
let shootingStars = [];
let animationFrame;
let lastShootingStar = 0;
let lastStarBurst = 0;
let mouseX = 0;
let mouseY = 0;
let timeOffset = 0;

// Mouse-responsive background elements
let mouseParticles = [];
const mouseRepelStrength = 0.05;

// Background pulse effect for nebulae
let backgroundPulse = 0;

function resizeCanvas() {
  if (!canvas || !canvasContext) return;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * pixelRatio;
  canvas.height = window.innerHeight * pixelRatio;
  canvasContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function createParticles() {
  const count = Math.min(110, Math.max(55, Math.floor(window.innerWidth / 10)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.5 + 0.35,
    speed: Math.random() * 0.16 + 0.04,
    phase: Math.random() * Math.PI * 2,
    color: getRandomColor(),
    // Add velocity for smoother movement
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    // Add individual oscillation for more natural movement
    oscillationOffset: Math.random() * Math.PI * 2,
    oscillationSpeed: Math.random() * 0.0005 + 0.0002
  }));
}

function getRandomColor() {
  const rand = Math.random();
  if (rand > 0.85) return '255, 188, 73'; // Gold
  if (rand > 0.7) return '110, 218, 192'; // Teal
  if (rand > 0.5) return '147, 112, 219'; // Purple
  if (rand > 0.3) return '72, 209, 204'; // Light teal
  return '224, 235, 229'; // Light gray/green
}

function createShootingStar() {
  const size = Math.random() * 1.2 + 0.3; // Even smaller, more delicate stars
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight * 0.25, // Start in upper quarter
    size: size,
    speed: Math.random() * 3 + 1, // Slower, more graceful
    angle: Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 4, // More focused downward
    life: 0,
    maxLife: Math.random() * 0.4 + 0.2, // 0.2-0.6 seconds
    color: Math.random() > 0.85 ? '255, 255, 255' : // Mostly white (rarer)
           Math.random() > 0.6 ? '255, 230, 200' : // Warm white
           '220, 240, 255', // Cool white
    trail: []
  };
}

function createStarBurst() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: 0,
    maxRadius: Math.random() * 80 + 40, // 40-120px
    life: 0,
    maxLife: Math.random() * 0.6 + 0.4, // 0.4-1.0 seconds
    color: Math.random() > 0.7 ?
           [255, 200, 100, 0.3] : // Gold burst
           [150, 100, 255, 0.3],   // Purple burst
    expansionSpeed: Math.random() * 2 + 1
  };
}

function createMouseParticle() {
  return {
    x: mouseX,
    y: mouseY,
    radius: Math.random() * 1.5 + 0.5,
    life: 0,
    maxLife: Math.random() * 0.6 + 0.4, // 0.4-1.0 seconds
    color: Math.random() > 0.7 ? '255, 188, 73' : '147, 112, 219', // Gold or purple
    opacity: 0.6
  };
}

function updateShootingStars(time) {
  // Add new shooting star occasionally - less frequent for more magic
  if (time - lastShootingStar > 5000 + Math.random() * 8000) { // Every 5-13 seconds
    shootingStars.push(createShootingStar());
    lastShootingStar = time;
  }

  // Update existing shooting stars
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];
    star.life += 16 / 1000; // Assuming ~60fps

    if (star.life > star.maxLife) {
      shootingStars.splice(i, 1);
      continue;
    }

    // Add current position to trail
    star.trail.push({x: star.x, y: star.y});
    if (star.trail.length > 12) star.trail.shift(); // Limit trail length

    // Move star
    star.x += Math.cos(star.angle) * star.speed;
    star.y += Math.sin(star.angle) * star.speed;

    // Remove if off screen
    if (star.x < -20 || star.x > window.innerWidth + 20 ||
        star.y < -20 || star.y > window.innerHeight + 20) {
      shootingStars.splice(i, 1);
    }
  }
}

function updateStarBursts(time) {
  // Add occasional star bursts
  if (time - lastStarBurst > 8000 + Math.random() * 7000) { // Every 8-15 seconds
    // We'll handle star bursts in the draw function for simplicity
    lastStarBurst = time;
  }
}

function updateMouseParticles(time) {
  // Add mouse particles occasionally when mouse moves
  if (Math.random() < 0.2) { // 20% chance per frame when mouse is moving
    mouseParticles.push(createMouseParticle());
  }

  // Update existing mouse particles
  for (let i = mouseParticles.length - 1; i >= 0; i--) {
    const particle = mouseParticles[i];
    particle.life += 16 / 1000; // Assuming ~60fps

    if (particle.life > particle.maxLife) {
      mouseParticles.splice(i, 1);
      continue;
    }

    // Fade out
    particle.opacity = 0.6 * (1 - particle.life / particle.maxLife);

    // Move slightly outward from mouse
    const angle = Math.atan2(particle.y - mouseY, particle.x - mouseX);
    particle.x += Math.cos(angle) * 0.3;
    particle.y += Math.sin(angle) * 0.3;
  }
}

function applyMouseRepulsion(particles, time) {
  // Apply repulsive force from mouse to make particles avoid cursor
  if (reduceMotion) return particles;

  return particles.map(particle => {
    const dx = particle.x - mouseX;
    const dy = particle.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only affect particles within certain radius
    if (distance < 120 && distance > 0) {
      const force = mouseRepelStrength * (1 - distance / 120);
      const angle = Math.atan2(dy, dx);

      // Apply force with some randomness for natural movement
      particle.vx += Math.cos(angle) * force + (Math.random() - 0.5) * 0.015;
      particle.vy += Math.sin(angle) * force + (Math.random() - 0.5) * 0.015;
    }

    // Apply individual oscillation
    const oscillation = Math.sin(time * particle.oscillationSpeed + particle.oscillationOffset) * 0.3;
    particle.x += Math.cos(particle.phase) * oscillation;
    particle.y += Math.sin(particle.phase) * oscillation;

    // Apply velocity with damping
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.97; // Slightly less damping for more float
    particle.vy *= 0.97;

    // Keep particles within bounds with soft bounce
    if (particle.x < 0) {
      particle.x = 0;
      particle.vx = Math.max(0, particle.vx) * 0.3;
    } else if (particle.x > window.innerWidth) {
      particle.x = window.innerWidth;
      particle.vx = Math.min(0, particle.vx) * 0.3;
    }

    if (particle.y < 0) {
      particle.y = 0;
      particle.vy = Math.max(0, particle.vy) * 0.3;
    } else if (particle.y > window.innerHeight) {
      particle.y = window.innerHeight;
      particle.vy = Math.min(0, particle.vy) * 0.3;
    }

    return particle;
  });
}

function drawShootingStars(time) {
  shootingStars.forEach(star => {
    // Draw trail with gradient effect - more subtle and ethereal
    for (let i = 0; i < star.trail.length; i++) {
      const progress = i / star.trail.length;
      const alpha = progress * 0.3 * (1 - star.life / star.maxLife); // More subtle
      // Fade out trail and make it slightly wider at the head
      const trailSize = star.size * (0.1 + progress * 0.9);
      canvasContext.beginPath();
      canvasContext.arc(star.trail[i].x, star.trail[i].y, trailSize, 0, Math.PI * 2);

      // Color based on star type
      let colorStr = '';
      if (star.color === '255, 255, 255') {
        colorStr = '255, 255, 255';
      } else if (star.color === '255, 230, 200') {
        colorStr = '255, 230, 200';
      } else {
        colorStr = '220, 240, 255';
      }

      canvasContext.fillStyle = `rgba(${colorStr}, ${alpha})`;
      canvasContext.fill();
    }

    // Draw main star with glow - more delicate
    const pulse = 0.5 + Math.sin(time * 0.03) * 0.3; // Slower, more subtle pulse
    const glowSize = star.size * (0.3 + pulse * 0.7);

    // Outer glow - very subtle
    canvasContext.beginPath();
    canvasContext.arc(star.x, star.y, glowSize * 2.5, 0, Math.PI * 2);
    canvasContext.fillStyle = `rgba(255, 255, 255, ${0.05 * pulse * (1 - star.life / star.maxLife)})`;
    canvasContext.fill();

    // Inner glow
    canvasContext.beginPath();
    canvasContext.arc(star.x, star.y, glowSize * 1.5, 0, Math.PI * 2);
    canvasContext.fillStyle = `rgba(255, 255, 255, ${0.1 * pulse * (1 - star.life / star.maxLife)})`;
    canvasContext.fill();

    // Main star - tiny and bright
    canvasContext.beginPath();
    canvasContext.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    canvasContext.fillStyle = `rgba(255, 255, 255, ${0.8 * pulse * (1 - star.life / star.maxLife)})`;
    canvasContext.fill();
  });
}

function drawMouseParticles() {
  mouseParticles.forEach(particle => {
    canvasContext.beginPath();
    canvasContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    const [r, g, b] = particle.color.split(',').map(Number);
    canvasContext.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity})`;
    canvasContext.fill();

    // Add slight glow
    canvasContext.beginPath();
    canvasContext.arc(particle.x, particle.y, particle.radius * 1.5, 0, Math.PI * 2);
    canvasContext.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity * 0.3})`;
    canvasContext.fill();
  });
}

function drawParticles(time = 0) {
  if (!canvas || !canvasContext) return;
  canvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // Update time offset for background effects
  timeOffset = time * 0.0005;

  // Update and draw mouse-responsive particles
  updateMouseParticles(time);
  drawMouseParticles();

  // Apply mouse repulsion to main particles and draw them
  particles = applyMouseRepulsion(particles, time);

  particles.forEach((particle) => {
    const pulse = 0.3 + Math.sin(time * 0.001 + particle.phase) * 0.25; // Slower, more subtle pulse
    canvasContext.beginPath();
    canvasContext.fillStyle = `rgba(${particle.color}, ${pulse})`;
    canvasContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    canvasContext.fill();
  });

  // Draw connections between particles (even more subtle and dynamic)
  for (let first = 0; first < particles.length; first += 1) {
    for (let second = first + 1; second < particles.length; second += 1) {
      const distanceX = particles[first].x - particles[second].x;
      const distanceY = particles[first].y - particles[second].y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      if (distance > 100) continue; // Even shorter range for more intimacy

      // Make connections pulse with background
      const connectionPulse = 0.03 + Math.sin(timeOffset + first * 0.1 + second * 0.1) * 0.02;
      const opacity = connectionPulse * (1 - distance / 100);

      canvasContext.beginPath();
      canvasContext.strokeStyle = `rgba(130, 190, 174, ${opacity})`;
      canvasContext.lineWidth = 0.2;
      canvasContext.moveTo(particles[first].x, particles[first].y);
      canvasContext.lineTo(particles[second].x, particles[second].y);
      canvasContext.stroke();
    }
  }

  // Draw shooting stars
  drawShootingStars(time);

  if (!reduceMotion) animationFrame = window.requestAnimationFrame(drawParticles);
}

resizeCanvas();
createParticles();
drawParticles();

// Mouse movement listener
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
  shootingStars = []; // Reset shooting stars on resize
  mouseParticles = []; // Reset mouse particles on resize
  if (reduceMotion) drawParticles();
});

// Animation loop for shooting stars (separate from particles to reduce load)
function updateAnimation(time) {
  updateShootingStars(time);
  if (!reduceMotion) requestAnimationFrame(updateAnimation);
}
requestAnimationFrame(updateAnimation);

const pad = (value) => String(value).padStart(2, '0');

function setValue(id, value) {
  const box = document.getElementById(id);
  const output = box?.querySelector('span');
  const nextValue = pad(value);

  if (!output || output.textContent === nextValue) return;
  output.textContent = nextValue;
  box.classList.remove('tick');
  void box.offsetWidth;
  box.classList.add('tick');
}

function renderCountdown() {
  const { totalSeconds } = countdownState;
  setValue('days', Math.floor(totalSeconds / 86400));
  setValue('hours', Math.floor((totalSeconds % 86400) / 3600));
  setValue('minutes', Math.floor((totalSeconds % 3600) / 60));
  setValue('seconds', totalSeconds % 60);
}

renderCountdown();
window.setInterval(() => {
  countdownState.totalSeconds += 1;
  renderCountdown();
}, 1000);
