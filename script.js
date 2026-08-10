    /* ================= DATA ================= */
    const PRODUCTS = {
      sheet: {
        id: 'sheet', name: 'ملاية استيك استرايب قطن', category: 'مفارش',
        colors: [
          { key: 'navy', label: 'كحلي', hex: '#1c2742', main: 'images/nomara_img_09.jpg', thumbs: ['images/nomara_img_10.jpg', 'images/nomara_img_11.jpg'] },
          { key: 'grey', label: 'رمادي', hex: '#6b6b6e', main: 'images/nomara_img_12.jpg', thumbs: ['images/nomara_img_13.jpg', 'images/nomara_img_14.jpg'] },
          { key: 'white', label: 'أبيض', hex: '#f3f1ea', main: 'images/nomara_img_15.jpg', thumbs: ['images/nomara_img_16.jpg'] },
          { key: 'burgundy', label: 'نبيتي', hex: '#5c1c30', main: 'images/nomara_img_17.jpg', thumbs: ['images/nomara_img_18.jpg', 'images/nomara_img_19.jpg'] },
          { key: 'beige', label: 'بيج', hex: '#cdbb95', main: 'images/nomara_img_20.jpg', thumbs: ['images/nomara_img_21.jpg', 'images/nomara_img_22.jpg'] }
        ],
        sizes: [
          { key: '160', label: 'مقاس 160 سم (4 قطع)', price: 400, old: 500, contents: 'المحتويات: ملاية 160×200×30 + 2 خدادية 75×55 + مخدة طويلة 160×45' },
          { key: '180', label: 'مقاس 180 سم (4 قطع)', price: 450, old: 550, contents: 'المحتويات: ملاية 180×200×30 + 2 خدادية 75×55 + مخدة طويلة 180×45' },
          { key: '120', label: 'مقاس 120 سم (6 قطع)', price: 550, old: 650, contents: 'المحتويات: 2 ملاية 120×200×30 + 2 خدادية 75×55 + 2 مخدة طويلة 120×45' }
        ]
      },
      duvet: {
        id: 'duvet', name: 'لحاف فرو بابلز', category: 'لحاف',
        colors: [
          { key: 'brown', label: 'بني', hex: '#5b3a2e', main: 'images/nomara_img_23.jpg', thumbs: ['images/nomara_img_24.jpg', 'images/nomara_img_25.jpg', 'images/nomara_img_26.jpg'] },
          { key: 'black', label: 'أسود', hex: '#141414', main: 'images/nomara_img_27.jpg', thumbs: ['images/nomara_img_28.jpg', 'images/nomara_img_29.jpg'] },
          { key: 'cream', label: 'كريمي', hex: '#efe6d8', main: 'images/nomara_img_30.jpg', thumbs: ['images/nomara_img_31.jpg', 'images/nomara_img_32.jpg'] },
          { key: 'skyblue', label: 'سماوي', hex: '#4f9fd6', main: 'images/nomara_img_33.jpg', thumbs: ['images/nomara_img_34.jpg', 'images/nomara_img_35.jpg', 'images/nomara_img_36.jpg'] }
        ],
        sizes: [
          { key: 'big', label: 'الطقم الكبير (3 قطع)', price: 2350, old: 2900, contents: 'المحتويات: لحاف 240×260 + 2 خدادية 60×80' }
        ]
      }
    };

    const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyBta70gAGYKKFtg0ZxpRPsRJi4XQjykkidtM318DcMXuffPwcTS35aGXL5RlpPMaag/exec';
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xnjevpeb';

    function sendToBoth(payload) {
      return Promise.allSettled([
        fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        }),
        fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      ]).then(results => {
        const anyOk = results.some(r => r.status === 'fulfilled' && r.value.ok);
        return { ok: anyOk };
      });
    }

    // cart replaces orderState

    /* ================= PRODUCT RENDERING ================= */
    function initProduct(key) {
      const p = PRODUCTS[key];
      const state = { color: p.colors[0].key, size: p.sizes[0].key, qty: 1 };

      const mainImg = document.getElementById(key + '-main-img');
      const thumbsBox = document.getElementById(key + '-thumbs');
      const colorsBox = document.getElementById(key + '-colors');
      const colorName = document.getElementById(key + '-color-name');
      const sizeSel = document.getElementById(key + '-size');
      const qtyLabel = document.getElementById(key + '-qty');
      const priceEl = document.getElementById(key + '-price');
      const oldEl = document.getElementById(key + '-old');
      const contentsEl = document.getElementById(key + '-contents');

      function currentColor() { return p.colors.find(c => c.key === state.color); }
      function currentSize() { return p.sizes.find(s => s.key === state.size); }

      function renderColors() {
        colorsBox.innerHTML = p.colors.map(c =>
          `<div class="color-swatch ${c.key === state.color ? 'active' : ''}" style="background:${c.hex}" data-color="${c.key}" title="${c.label}"></div>`
        ).join('');
        colorsBox.querySelectorAll('.color-swatch').forEach(el => {
          el.addEventListener('click', () => { state.color = el.dataset.color; render(); });
        });
      }

      function renderSizes() {
        sizeSel.innerHTML = p.sizes.map(s => `<option value="${s.key}">${s.label} — ${s.price.toLocaleString('en-US')} ج.م</option>`).join('');
        sizeSel.value = state.size;
        sizeSel.addEventListener('change', e => { state.size = e.target.value; render(); });
        if (p.sizes.length <= 1) { sizeSel.closest('.option-group').style.display = 'none'; }
      }

      function renderThumbs(color) {
        thumbsBox.innerHTML = color.thumbs.map((t, i) => `<img src="${t}" class="${i === 0 ? 'active' : ''}" data-src="${t}">`).join('');
        thumbsBox.querySelectorAll('img').forEach(im => {
          im.addEventListener('click', () => {
            mainImg.src = im.dataset.src;
            thumbsBox.querySelectorAll('img').forEach(x => x.classList.remove('active'));
            im.classList.add('active');
          });
        });
      }

      function render() {
        const c = currentColor();
        const s = currentSize();

        if (mainImg.getAttribute('data-current') !== c.key) {
          mainImg.classList.add('fading');
          setTimeout(() => {
            mainImg.src = c.main;
            mainImg.setAttribute('data-current', c.key);
            mainImg.classList.remove('fading');
          }, 180);
        } else {
          mainImg.src = c.main;
        }
        mainImg.setAttribute('data-loaded', '1');

        colorName.textContent = c.label;
        renderThumbs(c);
        renderColors();

        const newPriceText = s.price.toLocaleString('en-US') + ' ج.م';
        if (priceEl.textContent !== newPriceText) {
          priceEl.textContent = newPriceText;
          priceEl.classList.remove('bump');
          void priceEl.offsetWidth; // restart animation
          priceEl.classList.add('bump');
        }
        if (s.old) { oldEl.textContent = s.old.toLocaleString('en-US') + ' ج.م'; oldEl.style.display = 'inline'; }
        else { oldEl.style.display = 'none'; }
        contentsEl.textContent = s.contents;
        qtyLabel.textContent = state.qty;
        // cart auto-updates on qty/color/size change
      }

      document.getElementById(key + '-qty-minus').addEventListener('click', () => { if (state.qty > 1) { state.qty--; render(); } });
      document.getElementById(key + '-qty-plus').addEventListener('click', () => { state.qty++; render(); });
      document.getElementById(key + '-order-btn').addEventListener('click', function () { addToCart(key, state); });

      renderSizes();
      renderColors();
      render();
    }

    /* ================= ORDER FLOW ================= */

        /* ---- Cart (supports multiple products & Drawer) ---- */
    let cart = [];

    function showToast(message) {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = 'toast-message';
      toast.innerHTML = '<span>✨</span> ' + message;
      container.appendChild(toast);
      setTimeout(function () {
        toast.classList.add('toast-out');
        setTimeout(function () { toast.remove(); }, 350);
      }, 3000);
    }

    function openCartDrawer() {
      document.getElementById('cartDrawer').classList.add('active');
    }
    function closeCartDrawer() {
      document.getElementById('cartDrawer').classList.remove('active');
    }

    function updateCartBadge() {
      const totalCount = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
      const badge = document.getElementById('floatingCartBadge');
      badge.textContent = totalCount;
      document.getElementById('drawerCartCount').textContent = totalCount;
      badge.classList.remove('pop');
      void badge.offsetWidth; // trigger reflow
      badge.classList.add('pop');
    }

    function renderCart() {
      const summary = document.getElementById('order-summary');
      const drawerItems = document.getElementById('drawerCartItems');
      const drawerSubtotal = document.getElementById('drawerCartSubtotal');
      
      updateCartBadge();

      


      if (cart.length === 0) {
        summary.innerHTML = '<div class="cart-empty-msg">السلة فارغة – اضغط "أضف للسلة" بجانب أي منتج.</div>';
        summary.classList.add('empty');
        drawerItems.innerHTML = '<div class="cart-empty-msg" style="text-align:center;padding:40px 0;color:#888;">السلة فارغة حالياً. تسوق الآن وأضف منتجاتك المفضلة!</div>';
        drawerSubtotal.textContent = '0 ج.م';
      } else {
        summary.classList.remove('empty');
        let html = '';
        let drawerHtml = '';
        let cartSubtotal = 0;

        cart.forEach(function (item, i) {
          const subtotal = item.unitPrice * item.qty;
          cartSubtotal += subtotal;

          // Main page order summary html
          html += '<div class="cart-item">' +
            '<div>' +
            '<div class="cart-item-name">' + item.product + '</div>' +
            '<div class="cart-item-detail">' + item.color + (item.size ? ' / ' + item.size : '') + ' × ' + item.qty + '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
            '<span class="cart-item-price">' + subtotal.toLocaleString('en-US') + ' ج.م</span>' +
            '<button class="cart-item-remove" onclick="removeFromCart(' + i + ')" title="حذف">×</button>' +
            '</div>' +
            '</div>';

          // Drawer items html
          drawerHtml += '<div class="drawer-item">' +
            '<div>' +
            '<div class="drawer-item-title">' + item.product + '</div>' +
            '<div class="drawer-item-sub">' + item.color + (item.size ? ' / ' + item.size : '') + '</div>' +
            '<div class="drawer-item-actions">' +
            '<button onclick="changeCartQty(' + i + ', -1)">-</button>' +
            '<span>' + item.qty + '</span>' +
            '<button onclick="changeCartQty(' + i + ', 1)">+</button>' +
            '<button class="drawer-item-remove" onclick="removeFromCart(' + i + ')" title="حذف">🗑️</button>' +
            '</div>' +
            '</div>' +
            '<div class="drawer-item-price">' + subtotal.toLocaleString('en-US') + ' ج.م</div>' +
            '</div>';
        });

        html += '<div class="cart-subtotal"><span>إجمالي المنتجات</span><span>' + cartSubtotal.toLocaleString('en-US') + ' ج.م</span></div>';
        summary.innerHTML = html;
        drawerItems.innerHTML = drawerHtml;
        drawerSubtotal.textContent = cartSubtotal.toLocaleString('en-US') + ' ج.م';
      }
      updateTotal();
    }

    function changeCartQty(index, delta) {
      if (cart[index]) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
          cart.splice(index, 1);
        }
        renderCart();
      }
    }

    function removeFromCart(index) {
      cart.splice(index, 1);
      renderCart();
    }

    function addToCart(key, state) {
      const p = PRODUCTS[key];
      const c = p.colors.find(function (x) { return x.key === state.color; });
      const s = p.sizes.find(function (x) { return x.key === state.size; });
      const existing = cart.find(function (item) { return item.productKey === key && item.color === c.label && item.size === s.label; });
      if (existing) {
        existing.qty += state.qty;
      } else {
        cart.push({ productKey: key, product: p.name, color: c.label, size: s.label, qty: state.qty, unitPrice: s.price });
      }
      renderCart();

      const btn = document.getElementById(key + '-order-btn');
      if (btn) {
        const origText = btn.textContent;
        btn.textContent = '✓ تمت الإضافة!';
        btn.style.background = 'var(--gold)';
        btn.style.color = 'var(--black)';
        setTimeout(function () { btn.textContent = 'أضف للسلة'; btn.style.background = ''; btn.style.color = ''; }, 1800);
      }

      showToast('تمت إضافة ' + p.name + ' إلى سلة التسوق!');
      openCartDrawer();
    }

    function checkoutFromDrawer() {
      closeCartDrawer();
      


      if (cart.length === 0) {
        showToast('سلتك فارغة حالياً!');
        return;
      }
      document.getElementById('order-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    
    function updateTotal() {
      const govSel = document.getElementById('gov-select');
      const opt = govSel.selectedOptions[0];
      const fee = (opt && opt.dataset.fee) ? Number(opt.dataset.fee) : 0;
      const cartSubtotal = cart.reduce(function (sum, it) { return sum + it.unitPrice * it.qty; }, 0);
      document.getElementById('shipping-fee').textContent = fee ? (fee.toLocaleString('en-US') + ' ج.م') : '-';
      document.getElementById('order-total').textContent = (cartSubtotal + fee).toLocaleString('en-US') + ' ج.م';
    }
    document.getElementById('gov-select').addEventListener('change', updateTotal);

    document.getElementById('orderForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const form = e.target;
      const phoneInput = form['الهاتف'];
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';
      const phoneRegex = /^01[0125][0-9]{8}$/;
      if (!phoneRegex.test(phoneVal)) {
        alert('برجاء إدخال رقم هاتف مصري صحيح يتكون من 11 رقماً ويبدأ بـ 01 (مثال: 01012345678)');
        if (phoneInput) phoneInput.focus();
        return;
      }

      if (cart.length === 0) {
        alert('من فضلك اختر منتجاً واحداً على الأقل واضغط أضف للسلة.');
        return;
      }
      const govSel = document.getElementById('gov-select');
      const fee = govSel.selectedOptions[0] ? Number(govSel.selectedOptions[0].dataset.fee || 0) : 0;
      const cartSubtotal = cart.reduce(function (sum, it) { return sum + it.unitPrice * it.qty; }, 0);
      const total = cartSubtotal + fee;
      const itemsSummary = cart.map(function (it) {
        return it.product + ' (' + it.color + (it.size ? ' / ' + it.size : '') + ') x' + it.qty + ' = ' + (it.unitPrice * it.qty).toLocaleString('en-US') + ' ج.م';
      }).join(' | ');
      const payload = {
        'نوع السجل': 'طلب شراء',
        'المنتجات': itemsSummary,
        'عدد الأصناف': cart.length,
        'إجمالي المنتجات': cartSubtotal,
        'مصاريف الشحن': fee,
        'الإجمالي': total,
        'الاسم': form['الاسم'].value,
        'الهاتف': form['الهاتف'].value,
        'العنوان': form['العنوان'].value,
        'المحافظة': govSel.value,
        'طريقة الدفع': 'الدفع عند الاستلام'
      };
      const btn = document.getElementById('submitOrderBtn');
      btn.disabled = true; btn.textContent = 'جاري إرسال الطلب...';
      const savedCart = cart.slice();
      const savedName = form['الاسم'].value;
      const savedPhone = form['الهاتف'].value;
      const savedAddress = form['العنوان'].value;
      const savedGov = govSel.value;
      function doShowConfirm() {
        showConfirmation({ items: savedCart, name: savedName, phone: savedPhone, address: savedAddress, gov: savedGov, fee: fee, total: total });
      }
      sendToBoth(payload).then(function (res) {
        doShowConfirm();
      }).catch(function () {
        doShowConfirm();
      }).finally(function () {
        btn.disabled = false; btn.textContent = 'تأكيد الطلب';
      });
    });

    function showConfirmation(order) {
      let itemsHtml = order.items.map(function (it) {
        return '<div class="confirm-detail-row">' +
          '<span>' + (it.unitPrice * it.qty).toLocaleString('en-US') + ' ج.م</span>' +
          '<span>' + it.product + ' – ' + it.color + (it.size ? ' / ' + it.size : '') + ' ×' + it.qty + '</span>' +
          '</div>';
      }).join('');
      document.getElementById('confirm-items').innerHTML = itemsHtml;
      document.getElementById('confirm-name').textContent = order.name;
      document.getElementById('confirm-phone').textContent = order.phone;
      document.getElementById('confirm-gov').textContent = order.gov;
      document.getElementById('confirm-fee').textContent = order.fee ? order.fee.toLocaleString('en-US') + ' ج.م' : 'مجاني';
      document.getElementById('confirm-total').textContent = order.total.toLocaleString('en-US') + ' ج.م';
      cart = [];
      renderCart();
      goTo('confirm');
    }

    document.getElementById('contactForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const form = e.target;
      const payload = {
        'نوع السجل': 'رسالة تواصل',
        'الاسم': form['الاسم'].value,
        'الهاتف': form['الهاتف'].value,
        'الرسالة': form['الرسالة'].value
      };
      const btn = document.getElementById('submitContactBtn');
      btn.disabled = true; btn.textContent = 'جاري الإرسال...';
      sendToBoth(payload).then(function (res) {
        if (res.ok) { alert('تم إرسال رسالتك بنجاح! سنرد عليك قريباً!'); form.reset(); }
        else { alert('حدث خطأ، من فضلك حاول مرة أخرى.'); }
      }).catch(function () { alert('حدث خطأ في الاتصال، من فضلك حاول مرة أخرى.'); })
        .finally(function () { btn.disabled = false; btn.textContent = 'إرسال الرسالة'; });
    });

    /* ================= THEME TOGGLE ================= */
    function applyThemeUI(theme) {
      document.querySelectorAll('.theme-icon').forEach(el => el.textContent = theme === 'dark' ? '☀️' : '🌙');
      document.querySelectorAll('.theme-label, .theme-text').forEach(el => el.textContent = theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الليلي');
    }

    function toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('nomara-theme', newTheme);
      applyThemeUI(newTheme);
      showToast(newTheme === 'dark' ? 'تم تفعيل الوضع الليلي 🌙' : 'تم تفعيل الوضع الفاتح ☀️');
    }

    document.addEventListener('DOMContentLoaded', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyThemeUI(currentTheme);
    });

    /* ================= NAV ================= */
    function goTo(page) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('page-' + page).classList.add('active');
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`.nav-links a[data-page="${page}"]`);
      if (link) link.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      closeMobileNav();
      revealObserveAll();
    }
    function goToProduct(key) {
      goTo('products');
      setTimeout(() => {
        const el = document.getElementById(key + '-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
    document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); goTo(a.dataset.page); });
    });
    function toggleMobileNav() {
      const nav = document.getElementById('navLinks');
      if (nav.classList.contains('mobile-open')) { closeMobileNav(); }
      else {
        nav.classList.remove('mobile-closing');
        nav.classList.add('mobile-open');
      }
    }
    function closeMobileNav() {
      const nav = document.getElementById('navLinks');
      if (nav.classList.contains('mobile-open')) {
        nav.classList.remove('mobile-open');
        nav.classList.add('mobile-closing');
        setTimeout(() => nav.classList.remove('mobile-closing'), 350);
      }
    }

    /* ================= 1. SCROLL REVEAL ================= */
    let revealObserver;
    function revealObserveAll() {
      if (!revealObserver) {
        revealObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: .15, rootMargin: '0px 0px -60px 0px' });
      }
      document.querySelectorAll('.reveal:not(.in-view), .reveal-stagger:not(.in-view)').forEach(el => {
        revealObserver.observe(el);
      });
    }
    revealObserveAll();

    /* ================= 3. HEADER SHRINK + PARALLAX ================= */
    const headerEl = document.querySelector('header');
    const heroImgEl = document.querySelector('.hero img');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (headerEl) headerEl.classList.toggle('scrolled', y > 40);
          if (heroImgEl && y < window.innerHeight) {
            heroImgEl.style.transform = `translateY(${y * 0.25}px) scale(1.06)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    /* ================= INIT ================= */
    initProduct('sheet');
    initProduct('duvet');