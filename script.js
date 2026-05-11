document.addEventListener('DOMContentLoaded', () => {
  // --- Theme Toggle ---
  const themeBtn = document.getElementById('theme-toggle');
  const body = document.body;
  const icon = themeBtn.querySelector('i');

  // Check for saved theme preference or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeBtn.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if(theme === 'dark') {
      icon.className = 'fa-solid fa-sun'; // Show sun when in dark mode
    } else {
      icon.className = 'fa-solid fa-moon'; // Show moon when in light mode
    }
  }

  // --- Navbar Scroll Effect ---
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- Mobile Menu Toggle ---
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if(hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = hamburger.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });
  }

  // --- Scroll Animations (Intersection Observer) ---
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // observer.unobserve(entry.target); // Optional: stop observing once visible
      }
    });
  }, observerOptions);

  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(el => observer.observe(el));

  // --- Carousel functionality ---
  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carousel => {
    const images = carousel.querySelectorAll('.carousel-img');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    
    if(!prevBtn || !nextBtn || images.length <= 1) return;

    let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    if (currentIndex === -1) currentIndex = 0;

    function showImage(index) {
      images.forEach(img => img.classList.remove('active'));
      images[index].classList.add('active');
    }

    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(currentIndex);
    });

    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
    });
  });

  // --- Color Toggle for Conjunto Jordan ---
  const colorBtns = document.querySelectorAll('.color-btn');
  colorBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const targetColor = btn.getAttribute('data-target');
      const card = btn.closest('.product-card');
      
      // Update buttons
      card.querySelectorAll('.color-btn').forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = 'transparent';
      });
      btn.classList.add('active');
      btn.style.borderColor = 'var(--text-color)';
      
      // Update carousels
      const colorCarousels = card.querySelectorAll('.color-carousel');
      colorCarousels.forEach(c => {
        if(c.getAttribute('data-color') === targetColor) {
          c.style.display = 'block';
          // reset active image to first
          const imgs = c.querySelectorAll('.carousel-img');
          imgs.forEach((img, idx) => {
            img.classList.toggle('active', idx === 0);
          });
          // Update indices for new carousel
          const prevBtn = c.querySelector('.prev');
          const nextBtn = c.querySelector('.next');
          let currentIndex = 0;
          
          if(prevBtn && nextBtn) {
            // Remove old listeners to prevent duplication
            const newPrev = prevBtn.cloneNode(true);
            const newNext = nextBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newPrev, prevBtn);
            nextBtn.parentNode.replaceChild(newNext, nextBtn);
            
            newPrev.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              currentIndex = (currentIndex - 1 + imgs.length) % imgs.length;
              imgs.forEach(img => img.classList.remove('active'));
              imgs[currentIndex].classList.add('active');
            });
            
            newNext.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              currentIndex = (currentIndex + 1) % imgs.length;
              imgs.forEach(img => img.classList.remove('active'));
              imgs[currentIndex].classList.add('active');
            });
          }
        } else {
          c.style.display = 'none';
        }
      });
    });
  });
  // --- Cart Logic ---
  window.Cart = {
    items: [],
    init() {
      const stored = localStorage.getItem('timeless_cart');
      if (stored) {
        this.items = JSON.parse(stored);
      }
      this.injectModal();
      this.updateCount();
      this.bindEvents();
    },
    save() {
      localStorage.setItem('timeless_cart', JSON.stringify(this.items));
      this.updateCount();
      if(document.getElementById('cart-modal') && document.getElementById('cart-modal').style.display === 'flex') {
        this.renderItems();
      }
    },
    add(product) {
      // product: { id, title, price, image, color, colorHex, colorName, size, quantity }
      const existing = this.items.find(i => i.id === product.id && i.color === product.color && i.size === product.size);
      if (existing) {
        existing.quantity += product.quantity || 1;
      } else {
        this.items.push({ ...product, quantity: product.quantity || 1 });
      }
      this.save();
      this.openModal();
    },
    remove(id, color, size) {
      this.items = this.items.filter(i => !(i.id === id && i.color === color && i.size === size));
      this.save();
    },
    updateCount() {
      const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
      const btns = document.querySelectorAll('.cart-btn');
      btns.forEach(btn => {
        let badge = btn.querySelector('.cart-badge');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'cart-badge';
          badge.style.cssText = 'position: absolute; top: -5px; right: -5px; background: red; color: white; border-radius: 50%; font-size: 0.7rem; padding: 2px 6px; font-weight: bold;';
          btn.style.position = 'relative';
          btn.appendChild(badge);
        }
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
      });
    },
    injectModal() {
      if (document.getElementById('cart-modal')) return;
      const html = `
        <div id="cart-modal" class="cart-modal" style="display: none; position: fixed; top: 0; right: 0; width: 100%; max-width: 400px; height: 100vh; background: var(--secondary-bg); z-index: 9999; box-shadow: -5px 0 15px rgba(0,0,0,0.5); flex-direction: column; transform: translateX(100%); transition: transform 0.3s ease;">
          <div style="padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0; font-family: 'Oswald', sans-serif;">TU CARRITO</h2>
            <button id="close-cart" style="background: none; border: none; color: var(--text-color); font-size: 1.5rem; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div id="cart-items" style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
            <!-- Items will be rendered here -->
          </div>
          <div style="padding: 1.5rem; border-top: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 1.2rem; font-weight: bold;">
              <span>Total:</span>
              <span id="cart-total">$0</span>
            </div>
            <button id="checkout-btn" class="btn" style="width: 100%; text-align: center; font-size: 1.1rem; padding: 1rem;">Finalizar Compra</button>
          </div>
        </div>
        <div id="cart-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.5); z-index: 9998; opacity: 0; transition: opacity 0.3s ease;"></div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
    },
    bindEvents() {
      const modal = document.getElementById('cart-modal');
      const overlay = document.getElementById('cart-overlay');
      const closeBtn = document.getElementById('close-cart');
      const cartBtns = document.querySelectorAll('.cart-btn');
      
      const open = (e) => {
        if(e) e.preventDefault();
        modal.style.display = 'flex';
        overlay.style.display = 'block';
        // Trigger reflow
        void modal.offsetWidth;
        modal.style.transform = 'translateX(0)';
        overlay.style.opacity = '1';
        this.renderItems();
      };
      
      const close = () => {
        modal.style.transform = 'translateX(100%)';
        overlay.style.opacity = '0';
        setTimeout(() => {
          modal.style.display = 'none';
          overlay.style.display = 'none';
        }, 300);
      };

      cartBtns.forEach(btn => btn.addEventListener('click', open));
      closeBtn.addEventListener('click', close);
      overlay.addEventListener('click', close);
      this.openModal = open; // expose for add()
      
      // Checkout button
      document.getElementById('checkout-btn').addEventListener('click', () => {
        if(this.items.length === 0) return alert('El carrito está vacío');
        this.processCheckout();
      });
    },
    renderItems() {
      const container = document.getElementById('cart-items');
      const totalEl = document.getElementById('cart-total');
      
      if (this.items.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">Tu carrito está vacío.</p>';
        totalEl.textContent = '$0';
        return;
      }

      let total = 0;
      container.innerHTML = this.items.map(item => {
        // Parse price e.g. "$80.000" -> 80000
        const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''));
        total += priceNum * item.quantity;
        return `
          <div style="display: flex; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
            <img src="${item.image}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">${item.title}</h4>
              ${item.color ? `<span style="font-size: 0.8rem; color: #888; margin-bottom: 0.2rem;">Color: <span style="display: inline-block; width: 12px; height: 12px; background: ${item.colorHex}; border-radius: 50%; vertical-align: middle;"></span> ${item.colorName}</span>` : ''}
              ${item.size ? `<span style="font-size: 0.8rem; color: #888; margin-bottom: 0.5rem;">Talle: <strong style="color: var(--text-color);">${item.size}</strong></span>` : ''}
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold;">${item.price} x ${item.quantity}</span>
                <button onclick="window.Cart.remove('${item.id}', '${item.color || ''}', '${item.size || ''}')" style="background: none; border: none; color: #ff4444; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      totalEl.textContent = '$' + total.toLocaleString('es-AR');
    },
    async processCheckout() {
      // Redirigir a la página de checkout en lugar de llamar al backend directamente
      window.location.href = 'checkout.html';
    }
  };

  window.Cart.init();
});
