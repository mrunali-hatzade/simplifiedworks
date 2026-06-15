// Simplified Works — Premium Script (Upgraded)
document.addEventListener('DOMContentLoaded', function () {
  
  // ── Theme Management (Dark Mode) ──
  const themeToggle = document.querySelector('.theme-toggle');
  const activeTheme = localStorage.getItem('theme') || 'light';
  
  // Apply initial theme
  document.documentElement.setAttribute('data-theme', activeTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // ── Cinematic Portal Overlay Logic ──
  const portalOverlay = document.getElementById('portal-overlay');
  const portalCurtain = document.getElementById('portal-curtain');
  const zoomTarget = document.getElementById('zoom-target');
  const introUi = document.getElementById('portal-intro-ui');
  const progressBar = document.getElementById('portal-progress-bar');
  const mainWrapper = document.getElementById('main-content-wrapper');
  
  if (portalOverlay && zoomTarget) {
    const isReload = (performance.getEntriesByType("navigation")[0]?.type === "reload") || (performance.navigation && performance.navigation.type === 1);
    if (sessionStorage.getItem('portalSeen') === 'true' && !isReload) {
      portalOverlay.style.display = 'none';
      if (mainWrapper) mainWrapper.classList.add('unlocked');
      const heroContent = document.getElementById('hero-content');
      if (heroContent) heroContent.style.opacity = 1;
      document.querySelectorAll('.hero-reveal').forEach(el => el.classList.add('active'));
    } else {
      document.body.classList.add('portal-locked');
    
    let portalProgress = 0;
    let isPortalActive = true;
    let autoAdvanceTarget = null;
    let autoAdvanceStart = null;
    const duration = 3000; // 3 seconds auto-advance
    
    // Custom easing function approx. cubic-bezier(0.77, 0, 0.175, 1)
    function easeInOutQuart(t) {
      return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    }
    
    function updatePortal(progress) {
      progress = Math.max(0, Math.min(100, progress));
      
      const t = progress / 100;
      const eased = easeInOutQuart(t);
      const scale = 1 + (220 - 1) * eased;
      
      zoomTarget.style.transform = `scale(${scale})`;
      
      // Intro UI fades out by 20%
      if (introUi) {
        const uiProgress = Math.min(progress, 20) / 20;
        introUi.style.transform = `translateY(-${uiProgress * 60}px)`;
        introUi.style.opacity = 1 - uiProgress;
      }
      
      // Progress bar
      if (progressBar) progressBar.style.width = `${progress}%`;
      
      // Curtain fade out after 85%
      if (progress > 85) {
        portalCurtain.style.opacity = 1 - ((progress - 85) / 15);
      } else {
        portalCurtain.style.opacity = 1;
      }
      
      // Fade in hero content during the second half of the portal animation
      const heroContent = document.getElementById('hero-content');
      if (heroContent) {
        if (progress > 50) {
          heroContent.style.opacity = (progress - 50) / 50;
        } else {
          heroContent.style.opacity = 0;
        }
      }
      
      if (progress >= 100 && isPortalActive) {
        isPortalActive = false;
        sessionStorage.setItem('portalSeen', 'true');
        document.body.classList.remove('portal-locked');
        portalOverlay.classList.add('inactive');
        portalOverlay.style.opacity = 0;
        portalOverlay.style.transition = 'opacity 0.5s ease';
        if (mainWrapper) mainWrapper.classList.add('unlocked');
        if (heroContent) heroContent.style.opacity = 1;
        
        // Force scroll to top to prevent jumping
        setTimeout(() => {
          window.scrollTo(0, 0);
          
          // Trigger staggered Hero Reveal effects
          const heroReveals = document.querySelectorAll('.hero-reveal');
          heroReveals.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add('active');
            }, index * 150);
          });
        }, 10);
      }
    }
    
    function autoAdvance(timestamp) {
      if (!autoAdvanceStart) autoAdvanceStart = timestamp;
      const elapsed = timestamp - autoAdvanceStart;
      const completion = Math.min(elapsed / duration, 1);
      
      // Smoothly advance from current progress to 100
      const currentProgress = autoAdvanceTarget + (100 - autoAdvanceTarget) * completion;
      
      updatePortal(currentProgress);
      
      if (completion < 1) {
        requestAnimationFrame(autoAdvance);
      } else {
        portalProgress = 100;
      }
    }
    
    // Wheel event
    const handleWheel = (e) => {
      if (!isPortalActive) return;
      if (e.deltaY > 0) {
        portalProgress += 2.5;
      } else if (e.deltaY < 0) {
        portalProgress -= 2.5;
      }
      
      portalProgress = Math.max(0, portalProgress);
      updatePortal(portalProgress);
      
      if (portalProgress > 30 && autoAdvanceTarget === null) {
        autoAdvanceTarget = portalProgress;
        window.removeEventListener('wheel', handleWheel);
        requestAnimationFrame(autoAdvance);
      }
      e.preventDefault();
    };
    
    // Touch events for mobile
    let lastTouchY = null;
    const handleTouchStart = (e) => {
      lastTouchY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      if (!isPortalActive) return;
      const currentY = e.touches[0].clientY;
      const delta = lastTouchY - currentY;
      lastTouchY = currentY;
      
      portalProgress += (delta * 0.4);
      portalProgress = Math.max(0, portalProgress);
      updatePortal(portalProgress);
      
      if (portalProgress > 30 && autoAdvanceTarget === null) {
        autoAdvanceTarget = portalProgress;
        window.removeEventListener('touchmove', handleTouchMove);
        requestAnimationFrame(autoAdvance);
      }
      e.preventDefault();
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Click event to auto-advance
    const handleClick = () => {
      if (!isPortalActive || autoAdvanceTarget !== null) return;
      autoAdvanceTarget = portalProgress;
      requestAnimationFrame(autoAdvance);
    };
    portalOverlay.addEventListener('click', handleClick);
    
    // Keypress event to auto-advance
    const handleKeydown = () => {
      if (!isPortalActive || autoAdvanceTarget !== null) return;
      autoAdvanceTarget = portalProgress;
      requestAnimationFrame(autoAdvance);
    };
    window.addEventListener('keydown', handleKeydown);
    
    // Initialize
    updatePortal(0);
    } // end of else block for portalSeen
  }

  // ── Header Scroll Behavior ──
  const header = document.querySelector('header.site');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ── Mobile Menu Toggle with Accessibility ──
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.menu');
  
  if (burger && menu) {
    burger.addEventListener('click', function () {
      const isOpen = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen);
      
      // Close menu if clicking outside or on a link
      if (isOpen) {
        document.body.style.overflow = 'hidden'; // Prevents background scrolling when menu is open
      } else {
        document.body.style.overflow = '';
      }
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Reset mobile menu scroll lock if window resizes to desktop width
    window.addEventListener('resize', function () {
      if (window.innerWidth > 640 && menu.classList.contains('open')) {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ── Back to Top Button ──
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ── Button Hover Coordinate & Magnetic Effect ──
  const buttons = document.querySelectorAll('.btn, .socials a');
  buttons.forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      btn.style.setProperty('--x', x + 'px');
      btn.style.setProperty('--y', y + 'px');
      
      // Magnetic pull
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const pullX = (x - centerX) * 0.3;
      const pullY = (y - centerY) * 0.3;
      btn.style.transform = `translate(${pullX}px, ${pullY}px)`;
      btn.style.transition = 'none'; // remove transition for snappy tracking
    });
    
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = `translate(0px, 0px)`;
      btn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  });

  // ── 3D Card Tilt Effect ──
  document.querySelectorAll('.card, .portfolio-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8; // max 8 deg
      const rotateY = ((x - centerX) / centerX) * 8;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'none';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      card.style.transition = 'transform 0.5s ease';
    });
  });

  // ── Smooth Parallax Elements ──
  const parallaxEls = document.querySelectorAll('.wave-divider, .portfolio-img img');

  // 3. Footer Reveal Animations
  const footerCols = document.querySelectorAll('footer.site > div > div > div');
  footerCols.forEach((col, index) => {
    col.classList.add('reveal');
    col.style.transitionDelay = `${index * 0.15}s`;
    
    // We recreate a simple observer for the footer in case revealObserver is out of scope
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px 50px 0px' });
    
    observer.observe(col);
  });

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    parallaxEls.forEach(el => {
      // Different speed for different elements if desired, default 0.1
      const speed = el.classList.contains('wave-divider') ? 0.05 : 0.15;
      el.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });

  // ── Staggered Text Reveal Setup ──
  document.querySelectorAll('.sec-head h2').forEach(h2 => {
    const text = h2.innerText;
    h2.innerHTML = '';
    text.split(' ').forEach((word, index) => {
      const span = document.createElement('span');
      span.innerText = word + ' ';
      span.style.display = 'inline-block';
      span.style.animationDelay = `${index * 0.1}s`;
      span.classList.add('word-reveal');
      h2.appendChild(span);
    });
  });

  // ── Scroll Reveal Animations (Intersection Observer) ──
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target); // Reveal once
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ── Animated Counters ──
  const nums = document.querySelectorAll('.num[data-count]');
  if (nums.length) {
    const runCounter = function (el) {
      const target = +el.getAttribute('data-count');
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1500; // Total duration in ms
      const startTime = performance.now();
      
      const update = function (currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quadratic
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(easeProgress * target);
        
        el.textContent = currentValue + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target + suffix;
        }
      };
      
      requestAnimationFrame(update);
    };

    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    nums.forEach(function (n) {
      counterObserver.observe(n);
    });
  }

  //  Contact Form (Upgraded Interactive Demo -> Real Backend) 
  const form = document.querySelector('#contactForm');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // Extract data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending Message...';
      
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        
        const note = form.querySelector('.form-note');
        if (note) {
          if (response.ok) {
            note.innerHTML = ' <strong>Success!</strong> Your inquiry has been sent successfully. We will contact you shortly.';
            note.style.color = 'var(--teal)';
            form.reset();
          } else {
            note.innerHTML = ' <strong>Error!</strong> ' + (result.error || 'Something went wrong.');
            note.style.color = 'red';
          }
          note.style.animation = 'fadeIn 0.5s';
        }
      } catch (error) {
        const note = form.querySelector('.form-note');
        if (note) {
          note.innerHTML = ' <strong>Error!</strong> Failed to connect to server.';
          note.style.color = 'red';
          note.style.animation = 'fadeIn 0.5s';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  //  Newsletter Form (Real Backend)
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(nForm => {
    nForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      
      const submitBtn = nForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      const formData = new FormData(nForm);
      const data = Object.fromEntries(formData.entries());

      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing...';
      
      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          submitBtn.textContent = 'Subscribed!';
          submitBtn.style.backgroundColor = 'var(--teal)';
          submitBtn.style.borderColor = 'var(--teal)';
          nForm.reset();
        } else {
          submitBtn.textContent = 'Error';
          submitBtn.style.backgroundColor = 'red';
          submitBtn.style.borderColor = 'red';
        }
      } catch (error) {
        submitBtn.textContent = 'Error';
        submitBtn.style.backgroundColor = 'red';
        submitBtn.style.borderColor = 'red';
      } finally {
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          submitBtn.style.backgroundColor = '';
          submitBtn.style.borderColor = '';
        }, 3000);
      }
    });
  });

  // -- Portfolio Filtering --
  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterItems = document.querySelectorAll('.filter-item');
  if (filterBtns.length > 0 && filterItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all
        filterBtns.forEach(b => {
          b.classList.remove('active');
          
        });
        // Add active class to clicked
        btn.classList.add('active');
        

        const filterValue = btn.getAttribute('data-filter');

        filterItems.forEach(item => {
          if (filterValue === 'all' || item.classList.contains(filterValue)) {
            item.style.display = 'flex';
            setTimeout(() => item.style.opacity = '1', 50);
          } else {
            item.style.opacity = '0';
            setTimeout(() => item.style.display = 'none', 300);
          }
        });
      });
    });
  }


document.addEventListener('DOMContentLoaded', function() {
  // --- Form Validation Custom Messages ---
  const inputs = document.querySelectorAll('input[required], textarea[required], select[required]');
  inputs.forEach(input => {
    input.addEventListener('invalid', function(e) {
      if (this.validity.valueMissing) {
        this.setCustomValidity('Please fill in this required field correctly.');
      } else if (this.validity.typeMismatch) {
        this.setCustomValidity('Please enter a valid value.');
      } else {
        this.setCustomValidity('Please fill correct details.');
      }
    });

    input.addEventListener('input', function(e) {
      this.setCustomValidity('');
    });
  });

  // --- ScrollSpy for Navbar ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="index.html#"]');

  if (sections.length > 0 && navLinks.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Trigger when section crosses the middle of the screen
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          // Remove active class from all nav links
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === 'index.html#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('chatbot-toggle');
  const win = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const body = document.getElementById('chatbot-body');

  if(toggle && win) {
    toggle.addEventListener('click', () => {
      win.classList.toggle('active');
      if(win.classList.contains('active')) input.focus();
    });

    closeBtn.addEventListener('click', () => {
      win.classList.remove('active');
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if(!val) return;

      // Add user message
      const userMsg = document.createElement('div');
      userMsg.className = 'chat-msg user';
      userMsg.textContent = val;
      body.appendChild(userMsg);
      input.value = '';
      body.scrollTop = body.scrollHeight;

      // Simulate bot thinking
      setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-msg bot';
        
        const txt = val.toLowerCase();
        if(txt.includes('price') || txt.includes('cost')) {
          botMsg.innerHTML = 'Our pricing is transparent and completely tailored to your industry! Please check our <a href="pricing.html" style="color:var(--teal);text-decoration:underline;">Pricing page</a> for details.';
        } else if(txt.includes('contact') || txt.includes('hello') || txt.includes('hi ')) {
          botMsg.textContent = 'Hello! You can reach us via the Contact page or by clicking the WhatsApp icon.';
        } else if(txt.includes('service') || txt.includes('build')) {
          botMsg.textContent = 'We engineer premium websites, management dashboards, and digital branding. Navigate to our Services section to learn more.';
        } else {
          botMsg.textContent = 'I am the frontend AI Assistant! Since our backend is still under construction, please use the Contact form or WhatsApp to talk to our human team for detailed inquiries.';
        }

        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;
      }, 600);
    });
  }
});
});

// --- Advanced Content Animations ---
(function initContentAnimations() {
  // 1. 3D Tilt Effect for Cards
  const cards = document.querySelectorAll('.service-card, .price-card, .m-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'none';
      card.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      card.style.zIndex = '1';
    });
  });

  // 2. Scroll Progress Bar
  const progressBar = document.createElement('div');
  progressBar.style.position = 'fixed';
  progressBar.style.top = '0';
  progressBar.style.left = '0';
  progressBar.style.height = '4px';
  progressBar.style.background = 'linear-gradient(90deg, var(--teal), var(--gold))';
  progressBar.style.zIndex = '999999';
  progressBar.style.transition = 'width 0.1s ease';
  progressBar.style.width = '0%';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });
})();
