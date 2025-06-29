document.addEventListener('DOMContentLoaded', function() {
  // =============================================
  // Particle Canvas Animation
  // =============================================
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let particleCount;
    let animationFrameId;
    
    // Adjust particle count based on screen size
    function calculateParticleCount() {
      return window.innerWidth < 768 ? 40 : 80;
    }

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    }

    function initParticles() {
      // Clear existing particles
      particles = [];
      particleCount = calculateParticleCount();
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    class Particle {
      constructor() {
        this.reset();
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Random opacity fluctuation
        this.opacity += (Math.random() - 0.5) * 0.02;
        this.opacity = Math.max(0.1, Math.min(0.5, this.opacity));
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    function drawLines() {
      const maxDistance = Math.min(canvas.width, canvas.height) * 0.3;
      
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * (1 - distance / maxDistance)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      drawLines();
      animationFrameId = requestAnimationFrame(animate);
    }

    // Initialize with debounced resize
    let resizeTimeout;
    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(animationFrameId);
        resizeCanvas();
        animate();
      }, 100);
    }

    // Initialize particles
    resizeCanvas();
    animate();
    
    // Event listeners
    window.addEventListener('resize', handleResize);
  }

  // =============================================
  // Portfolio Functionality
  // =============================================
  
  // Set current year in footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  
  // Navigation active state on scroll
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav__link');
  
  function setActiveNavLink() {
    let index = sections.length;
    const scrollPosition = window.scrollY;
    
    // Find which section is currently in view
    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
    
    while(--index >= 0 && scrollPosition + headerHeight + 50 < sections[index].offsetTop) {}
    
    // Update active class on nav links
    navLinks.forEach((link, i) => {
      if (i === index) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Update URL without page jump
        if (history.pushState) {
          history.pushState(null, null, targetId);
        } else {
          location.hash = targetId;
        }
      }
    });
  });
  
  // Intersection Observer for section animations
  const sectionsToAnimate = document.querySelectorAll(
    '#projects, #skills, #experience, #education, #contact'
  );
  
  if (sectionsToAnimate.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          sectionObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    sectionsToAnimate.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  // Set active navigation link on page load and on scroll
  window.addEventListener('scroll', setActiveNavLink);
  setActiveNavLink();

  // Form submission
  const contactForm = document.querySelector('.contact__form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simple form validation
      const inputs = this.querySelectorAll('[required]');
      let isValid = true;
      
      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = 'var(--danger)';
          isValid = false;
        } else {
          input.style.borderColor = '';
        }
      });
      
      if (isValid) {
        // Here you would typically send the form data to a server
        alert('Thank you for your message! I will get back to you soon.');
        this.reset();
      } else {
        alert('Please fill in all required fields.');
      }
    });
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
});