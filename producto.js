document.addEventListener('DOMContentLoaded', () => {
  const productsData = {
    'camperon-adidas': {
      title: 'Camperón Adidas',
      category: 'Abrigos',
      price: '$95.000',
      description: 'Camperón Adidas original. Ideal para el invierno, con un diseño clásico y materiales de primera calidad que garantizan abrigo y comodidad.',
      hasColors: false,
      sizes: ['M', 'XXL'],
      images: [
        'assets/Productos/Camperon Adidas/camperon1.png',
        'assets/Productos/Camperon Adidas/camperon2.png',
        'assets/Productos/Camperon Adidas/camperon3.png',
        'assets/Productos/Camperon Adidas/camperon4.png'
      ]
    },
    'conjunto-jordan': {
      title: 'Conjunto Jordan',
      category: 'Conjuntos',
      price: '$80.000',
      description: 'Conjunto Jordan de alta calidad. Incluye buzo y pantalón con un ajuste perfecto para el día a día. Disponible en varios colores.',
      hasColors: true,
      sizes: ['XL'],
      colors: [
        {
          id: 'azul',
          name: 'Azul',
          hex: '#0b345c',
          images: [
            'assets/Productos/Conjunto Jordan/Azul/conjunto azul1.jpg',
            'assets/Productos/Conjunto Jordan/Azul/conjunto azul2.png',
            'assets/Productos/Conjunto Jordan/Azul/conjunto azul3.png',
            'assets/Productos/Conjunto Jordan/Azul/conjunto azul4.png',
            'assets/Productos/Conjunto Jordan/Azul/conjunto azul5.png'
          ]
        },
        {
          id: 'gris',
          name: 'Gris',
          hex: '#8c8c8c',
          images: [
            'assets/Productos/Conjunto Jordan/Gris/conjunto gris 1.png',
            'assets/Productos/Conjunto Jordan/Gris/conjunto gris2.png',
            'assets/Productos/Conjunto Jordan/Gris/conjunto gris 3.png',
            'assets/Productos/Conjunto Jordan/Gris/conjunto gris 4.png',
            'assets/Productos/Conjunto Jordan/Gris/conjunto gris 5.png'
          ]
        }
      ]
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const productContainer = document.getElementById('product-container');
  const productNotFound = document.getElementById('product-not-found');

  if (!productId || !productsData[productId]) {
    productNotFound.style.display = 'block';
    return;
  }

  const product = productsData[productId];
  productContainer.style.display = 'flex';

  const productImagesContainer = document.getElementById('product-images');
  const productInfoContainer = document.getElementById('product-info-detail');

  // Render Info
  productInfoContainer.innerHTML = `
    <span style="color: #888; text-transform: uppercase; font-size: 0.9rem; font-weight: 600; letter-spacing: 1px;">${product.category}</span>
    <h1 style="font-size: 2.5rem; line-height: 1.2; margin: -0.5rem 0 0; font-family: 'Oswald', sans-serif; text-transform: uppercase;">${product.title}</h1>
    <span style="font-size: 1.8rem; font-weight: 600; color: var(--text-color);">${product.price}</span>
    <p style="color: #888; font-size: 1.05rem; line-height: 1.6; margin-top: 1rem;">${product.description}</p>
    
    ${product.hasColors ? `
      <div style="margin-top: 1.5rem;">
        <span style="font-weight: 600; display: block; margin-bottom: 0.8rem;">Color:</span>
        <div style="display: flex; gap: 1rem;" id="detail-color-options">
          ${product.colors.map((c, idx) => `
            <button class="detail-color-btn ${idx === 0 ? 'active' : ''}" data-target="${c.id}" aria-label="${c.name}" style="background-color: ${c.hex}; width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${idx === 0 ? 'var(--text-color)' : 'transparent'}; cursor: pointer; transition: transform 0.2s;"></button>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${product.sizes && product.sizes.length > 0 ? `
      <div style="margin-top: 1.5rem;">
        <span style="font-weight: 600; display: block; margin-bottom: 0.8rem;">Talle:</span>
        <div style="display: flex; gap: 0.5rem;" id="detail-size-options">
          ${product.sizes.map((s, idx) => `
            <button class="detail-size-btn ${idx === 0 ? 'active' : ''}" data-size="${s}" style="background: transparent; color: var(--text-color); border: 1px solid ${idx === 0 ? 'var(--text-color)' : 'var(--border-color)'}; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif;">${s}</button>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div style="margin-top: 2rem; display: flex; gap: 1rem; width: 100%;">
      <button id="add-to-cart-btn" class="btn" style="flex: 1; padding: 1rem; font-size: 1rem; border-radius: 4px;"><i class="fa-solid fa-cart-plus" style="margin-right: 0.5rem;"></i> Agregar al Carrito</button>
      <button class="btn" style="background: transparent; color: var(--text-color); border-color: var(--text-color); padding: 1rem; border-radius: 4px; width: 60px;"><i class="fa-regular fa-heart"></i></button>
    </div>
    
    <div style="margin-top: 3rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">
      <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">Características</h3>
      <ul style="color: #888; padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.5rem;">
        <li style="list-style-type: disc;">Calidad Premium</li>
        <li style="list-style-type: disc;">Envíos a todo el país</li>
        <li style="list-style-type: disc;">Garantía de fábrica</li>
      </ul>
    </div>
  `;

  // Render Images
  let activeColorId = product.hasColors ? product.colors[0].id : null;

  function renderCarousel() {
    let images = [];
    if (product.hasColors) {
      const colorData = product.colors.find(c => c.id === activeColorId);
      images = colorData.images;
    } else {
      images = product.images;
    }

    productImagesContainer.innerHTML = `
      <div class="img-container" style="height: 600px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); background-color: var(--secondary-bg);">
        <div class="carousel" id="detail-carousel">
          ${images.map((src, idx) => `
            <img src="${src}" alt="${product.title}" class="carousel-img ${idx === 0 ? 'active' : ''}" style="object-fit: cover; width: 100%; height: 100%;">
          `).join('')}
          ${images.length > 1 ? `
            <button class="carousel-btn prev" aria-label="Anterior"><i class="fa-solid fa-chevron-left"></i></button>
            <button class="carousel-btn next" aria-label="Siguiente"><i class="fa-solid fa-chevron-right"></i></button>
          ` : ''}
        </div>
      </div>
      <div class="thumbnails" style="display: flex; gap: 1rem; margin-top: 1rem; overflow-x: auto; padding-bottom: 0.5rem;">
        ${images.map((src, idx) => `
          <img src="${src}" alt="Thumbnail ${idx}" class="thumbnail-img ${idx === 0 ? 'active' : ''}" data-index="${idx}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--text-color)' : 'transparent'}; opacity: ${idx === 0 ? '1' : '0.6'}; transition: all 0.2s;">
        `).join('')}
      </div>
    `;

    // Re-attach carousel events
    const carousel = document.getElementById('detail-carousel');
    const imgs = carousel.querySelectorAll('.carousel-img');
    const thumbnails = productImagesContainer.querySelectorAll('.thumbnail-img');
    
    function updateActiveImage(index) {
      imgs.forEach(img => img.classList.remove('active'));
      imgs[index].classList.add('active');
      
      thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        thumb.style.borderColor = 'transparent';
        thumb.style.opacity = '0.6';
      });
      thumbnails[index].classList.add('active');
      thumbnails[index].style.borderColor = 'var(--text-color)';
      thumbnails[index].style.opacity = '1';
    }

    if (carousel) {
      const prevBtn = carousel.querySelector('.prev');
      const nextBtn = carousel.querySelector('.next');
      
      if (prevBtn && nextBtn && imgs.length > 1) {
        let currentIndex = 0;
        
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          currentIndex = (currentIndex - 1 + imgs.length) % imgs.length;
          updateActiveImage(currentIndex);
        });
        
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          currentIndex = (currentIndex + 1) % imgs.length;
          updateActiveImage(currentIndex);
        });
      }
    }
    
    // Thumbnail clicks
    thumbnails.forEach((thumb, idx) => {
      thumb.addEventListener('click', () => {
        updateActiveImage(idx);
      });
    });
  }

  renderCarousel();

  // Color selection logic
  if (product.hasColors) {
    const colorBtns = document.querySelectorAll('.detail-color-btn');
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'transparent';
        });
        btn.classList.add('active');
        btn.style.borderColor = 'var(--text-color)';
        
        activeColorId = btn.getAttribute('data-target');
        renderCarousel();
      });
    });
  }

  // Size selection logic
  let activeSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
  if (product.sizes) {
    const sizeBtns = document.querySelectorAll('.detail-size-btn');
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'var(--border-color)';
        });
        btn.classList.add('active');
        btn.style.borderColor = 'var(--text-color)';
        activeSize = btn.getAttribute('data-size');
      });
    });
  }

  // --- Add to Cart Logic ---
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      let colorData = null;
      if (product.hasColors) {
        colorData = product.colors.find(c => c.id === activeColorId);
      }
      
      const cartItem = {
        id: productId,
        title: product.title,
        price: product.price,
        image: colorData ? colorData.images[0] : product.images[0],
        color: colorData ? colorData.id : null,
        colorName: colorData ? colorData.name : null,
        colorHex: colorData ? colorData.hex : null,
        size: activeSize,
        quantity: 1
      };
      
      if (window.Cart) {
        window.Cart.add(cartItem);
      }
    });
  }
});
