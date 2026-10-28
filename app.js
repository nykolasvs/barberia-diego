/**
 * BARBERÍA DIEGO — SPA INTERACTIVA TOPE DE GAMA
 * Motor de Animaciones, Comparador Antes/Después, Simulador de Turnos,
 * Gestión de 1 o 2 Aliases de Mercado Pago y Muestrario de 4 Diseños en Vivo.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ========================================================================
     1. PRELOADER DE ENTRADA
     ======================================================================== */
  const preloader = document.getElementById('preloader');
  window.setTimeout(() => {
    if (preloader) preloader.classList.add('is-hidden');
  }, 650);

  /* ========================================================================
     2. CURSOR MAGNÉTICO PERSONALIZADO (DESKTOP)
     ======================================================================== */
  const cursor = document.getElementById('customCursor');
  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursor.classList.add('is-active');
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });

    const interactiveElements = document.querySelectorAll('a, button, select, input, .price-row, .ba-slider');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
    });
  }

  /* ========================================================================
     3. ESTADO EN VIVO DEL LOCAL (ABIERTO / CERRADO SEGÚN DÍA Y HORA)
     ======================================================================== */
  const liveStatusBadge = document.getElementById('liveStatusBadge');
  const liveStatusText = document.getElementById('liveStatusText');

  function updateShopStatus() {
    if (!liveStatusBadge || !liveStatusText) return;
    const now = new Date();
    const day = now.getDay(); // 0 Dom, 1 Lun, 2 Mar ... 6 Sab
    const hour = now.getHours() + now.getMinutes() / 60;

    const isOpenDay = day >= 2 && day <= 6;
    const isOpenHour = (day === 6) ? (hour >= 9 && hour < 19.5) : (hour >= 9.5 && hour < 20);

    if (isOpenDay && isOpenHour) {
      liveStatusBadge.classList.remove('is-closed');
      liveStatusText.textContent = 'Abierto ahora · Atendiendo hasta las 20:00 hs';
    } else {
      liveStatusBadge.classList.add('is-closed');
      liveStatusText.textContent = 'Cerrado ahora · Reservá tu turno online 24 hs';
    }
  }
  updateShopStatus();

  /* ========================================================================
     4. NAVBAR STICKY + MENÚ MÓVIL + SCROLL SPY
     ======================================================================== */
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const navAnchors = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar?.classList.add('is-scrolled');
    } else {
      navbar?.classList.remove('is-scrolled');
    }
  }, { passive: true });

  mobileMenuBtn?.addEventListener('click', () => {
    navLinks?.classList.toggle('is-open');
  });

  navAnchors.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks?.classList.remove('is-open');
      navAnchors.forEach((a) => a.classList.remove('active'));
      link.classList.add('active');
    });
  });

  /* ========================================================================
     5. EFECTO 3D TILT EN LA TARJETA PRINCIPAL DEL HERO
     ======================================================================== */
  const heroTiltCard = document.getElementById('heroTiltCard');
  if (heroTiltCard && window.matchMedia('(hover: hover)').matches) {
    heroTiltCard.addEventListener('mousemove', (e) => {
      const rect = heroTiltCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      heroTiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroTiltCard.addEventListener('mouseleave', () => {
      heroTiltCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

  /* ========================================================================
     6. INTERSECTION OBSERVER PARA ANIMACIONES DE APARICIÓN (SCROLL REVEAL)
     ======================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ========================================================================
     7. FILTRO DINÁMICO DEL CATÁLOGO DE CORTES (30 A 60 AÑOS)
     ======================================================================== */
  const filterButtons = document.querySelectorAll('#styleFilters .filter-btn');
  const styleCards = document.querySelectorAll('#stylesGrid .style-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      styleCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('is-filtered-out');
          card.animate([
            { opacity: 0, transform: 'translateY(14px) scale(0.98)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' }
          ], { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        } else {
          card.classList.add('is-filtered-out');
        }
      });
    });
  });

  /* ========================================================================
     8. COMPARADOR INTERACTIVO ANTES / DESPUÉS (MOUSE + TOUCH)
     ======================================================================== */
  const baSlider = document.getElementById('baSlider');
  const baBeforeWrap = document.getElementById('baBeforeWrap');
  const baBeforeImg = document.getElementById('baBeforeImg');
  const baHandle = document.getElementById('baHandle');

  function syncBeforeImageWidth() {
    if (baSlider && baBeforeImg) {
      baBeforeImg.style.width = `${baSlider.offsetWidth}px`;
    }
  }
  syncBeforeImageWidth();
  window.addEventListener('resize', syncBeforeImageWidth);

  let isDraggingSlider = false;

  function moveBeforeAfter(clientX) {
    if (!baSlider || !baBeforeWrap || !baHandle) return;
    const rect = baSlider.getBoundingClientRect();
    let pos = ((clientX - rect.left) / rect.width) * 100;
    pos = Math.max(8, Math.min(92, pos));
    baBeforeWrap.style.width = `${pos}%`;
    baHandle.style.left = `${pos}%`;
  }

  if (baSlider) {
    baSlider.addEventListener('mousedown', (e) => {
      isDraggingSlider = true;
      moveBeforeAfter(e.clientX);
    });
    window.addEventListener('mousemove', (e) => {
      if (isDraggingSlider) moveBeforeAfter(e.clientX);
    });
    window.addEventListener('mouseup', () => {
      isDraggingSlider = false;
    });

    baSlider.addEventListener('touchstart', (e) => {
      isDraggingSlider = true;
      moveBeforeAfter(e.touches[0].clientX);
    }, { passive: true });

    baSlider.addEventListener('touchmove', (e) => {
      if (isDraggingSlider) moveBeforeAfter(e.touches[0].clientX);
    }, { passive: true });

    baSlider.addEventListener('touchend', () => {
      isDraggingSlider = false;
    });
  }

  /* ========================================================================
     9. TOAST NOTIFICATION & COPIADO DE ALIAS EN 1 TOQUE
     ======================================================================== */
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimeout = null;

  function showToast(message) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add('is-visible');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3200);
  }

  function bindCopyAliasButtons() {
    const copyBtns = document.querySelectorAll('.copy-alias-btn');
    copyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const alias = btn.getAttribute('data-copy-alias') || 'barberia.diego.mp';
        const owner = btn.getAttribute('data-owner') || 'la barbería';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(alias).catch(() => {});
        }
        const originalText = btn.textContent;
        btn.textContent = '¡Copiado!';
        showToast(`Alias "${alias}" (${owner}) copiado para transferir en Mercado Pago.`);
        setTimeout(() => {
          btn.textContent = originalText;
        }, 1800);
      });
    });
  }
  bindCopyAliasButtons();

  /* ========================================================================
     10. SIMULADOR DE TURNOS + TICKET EN VIVO + WHATSAPP
     ======================================================================== */
  const serviceSelect = document.getElementById('bookingServiceSelect');
  const barberPills = document.querySelectorAll('#barberChoices .choice-pill');
  const daySelect = document.getElementById('bookingDaySelect');
  const timeSlots = document.querySelectorAll('#timeSlotsGrid .time-slot');
  const clientNameInput = document.getElementById('clientNameInput');

  const summaryService = document.getElementById('summaryService');
  const summaryBarber = document.getElementById('summaryBarber');
  const summaryDateTime = document.getElementById('summaryDateTime');
  const summaryPrice = document.getElementById('summaryPrice');
  const summaryAlias = document.getElementById('summaryAlias');
  const summaryCopyAliasBtn = document.getElementById('summaryCopyAliasBtn');
  const confirmWhatsappBtn = document.getElementById('confirmWhatsappBtn');

  let bookingState = {
    service: 'El Completo (Corte + Barba con Toalla Caliente)',
    price: '$20.000',
    barber: 'Diego (Sillón 1)',
    alias: 'barberia.diego.mp',
    day: 'Hoy',
    time: '16:30 hs'
  };

  function renderBookingSummary() {
    if (summaryService) summaryService.textContent = bookingState.service;
    if (summaryBarber) summaryBarber.textContent = bookingState.barber;
    if (summaryDateTime) summaryDateTime.textContent = `${bookingState.day} a las ${bookingState.time}`;
    if (summaryPrice) summaryPrice.textContent = bookingState.price;
    if (summaryAlias) summaryAlias.textContent = bookingState.alias;
    if (summaryCopyAliasBtn) {
      summaryCopyAliasBtn.setAttribute('data-copy-alias', bookingState.alias);
      summaryCopyAliasBtn.setAttribute('data-owner', bookingState.barber);
    }
  }

  serviceSelect?.addEventListener('change', (e) => {
    const [srv, prc] = e.target.value.split('|');
    bookingState.service = srv;
    bookingState.price = prc;
    renderBookingSummary();
  });

  barberPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      barberPills.forEach((p) => p.classList.remove('is-selected'));
      pill.classList.add('is-selected');
      bookingState.barber = pill.getAttribute('data-barber') || 'Diego (Sillón 1)';
      bookingState.alias = pill.getAttribute('data-alias') || 'barberia.diego.mp';
      renderBookingSummary();
    });
  });

  daySelect?.addEventListener('change', (e) => {
    bookingState.day = e.target.value;
    renderBookingSummary();
  });

  timeSlots.forEach((slot) => {
    slot.addEventListener('click', () => {
      timeSlots.forEach((s) => s.classList.remove('is-selected'));
      slot.classList.add('is-selected');
      bookingState.time = slot.getAttribute('data-time') || '16:30 hs';
      renderBookingSummary();
    });
  });

  // Botones "Pedir este corte" en el catálogo y en la pizarra de precios
  const selectServiceBtns = document.querySelectorAll('.select-service-btn');
  selectServiceBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const srv = btn.getAttribute('data-service');
      const prc = btn.getAttribute('data-price');
      if (srv && prc) {
        bookingState.service = srv;
        bookingState.price = prc;
        if (serviceSelect) {
          const targetVal = `${srv}|${prc}`;
          Array.from(serviceSelect.options).forEach((opt) => {
            if (opt.value === targetVal) serviceSelect.value = targetVal;
          });
        }
        renderBookingSummary();
        document.getElementById('turnos')?.scrollIntoView({ behavior: 'smooth' });
        showToast(`Seleccionaste: ${srv} (${prc}). Elegí tu horario.`);
      }
    });
  });

  // Botones "Reservar con Diego / Martín" en tarjetas de barberos
  const selectBarberBtns = document.querySelectorAll('.select-barber-btn');
  selectBarberBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetBarber = btn.getAttribute('data-barber');
      const targetAlias = btn.getAttribute('data-alias');
      if (targetBarber && targetAlias) {
        bookingState.barber = targetBarber;
        bookingState.alias = targetAlias;
        barberPills.forEach((p) => {
          if (p.getAttribute('data-barber') === targetBarber) {
            p.classList.add('is-selected');
          } else {
            p.classList.remove('is-selected');
          }
        });
        renderBookingSummary();
        document.getElementById('turnos')?.scrollIntoView({ behavior: 'smooth' });
        showToast(`Barbero elegido: ${targetBarber} (Alias: ${targetAlias})`);
      }
    });
  });

  // Confirmar turno por WhatsApp
  confirmWhatsappBtn?.addEventListener('click', () => {
    const clientName = clientNameInput?.value.trim() || 'Vecino';
    const msg = `¡Hola Barbería Diego! Soy *${clientName}*. Quiero reservar un turno:\n` +
      `✂️ *Servicio:* ${bookingState.service} (${bookingState.price})\n` +
      `💈 *Barbero:* ${bookingState.barber}\n` +
      `📅 *Día y Hora:* ${bookingState.day} a las ${bookingState.time}\n` +
      `💳 *Alias agendado para el local:* ${bookingState.alias}`;

    showToast(`¡Turno preparado para ${clientName}! Abriendo WhatsApp...`);
    // Demo: sin número, WhatsApp pide elegir a quién mandarlo. Poner el de turnos cuando esté.
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });

  /* ========================================================================
     11. ESTUDIO DE DISEÑO EN VIVO (SELECTOR DE 4 PROPUESTAS PARA EL CLIENTE)
     ======================================================================== */
  const studioDock = document.getElementById('designStudioDock');
  const studioHeaderToggle = document.getElementById('studioHeaderToggle');
  const studioMinimizeBtn = document.getElementById('studioMinimizeBtn');
  const themeButtons = document.querySelectorAll('[data-set-theme]');
  const heroButtons = document.querySelectorAll('[data-set-hero]');
  const aliasModeButtons = document.querySelectorAll('[data-set-alias-mode]');
  const activeThemeFooterIndicator = document.getElementById('activeThemeFooterIndicator');

  studioHeaderToggle?.addEventListener('click', () => {
    if (!studioDock || !studioMinimizeBtn) return;
    studioDock.classList.toggle('is-minimized');
    studioMinimizeBtn.textContent = studioDock.classList.contains('is-minimized') ? '+' : '−';
  });

  // Cambio de Tema Estético (4 Propuestas Completas)
  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const themeName = btn.getAttribute('data-set-theme') || 'roble';
      const themeLabel = btn.getAttribute('data-theme-label') || themeName;

      document.documentElement.setAttribute('data-theme', themeName);
      themeButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      if (activeThemeFooterIndicator) {
        activeThemeFooterIndicator.textContent = `Propuesta Activa: ${themeLabel}`;
      }
      showToast(`Diseño cambiado a: ${themeLabel}`);
    });
  });

  // Cambio de Disposición de Portada (Hero Dividido vs Centrado)
  heroButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const heroLayout = btn.getAttribute('data-set-hero') || 'split';
      document.body.setAttribute('data-hero-layout', heroLayout);
      heroButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      showToast(heroLayout === 'centered'
        ? 'Portada cambiada a: Monumental Centrada'
        : 'Portada cambiada a: Editorial Dividida con Foto 3D');
    });
  });

  // Cambio de Modo de Cobro (2 Aliases individuales vs 1 Alias único del local)
  const aliasMartinLabel = document.getElementById('aliasMartinLabel');
  const aliasMartinText = document.getElementById('aliasMartinText');
  const copyMartinBtn = document.getElementById('copyMartinBtn');
  const bookMartinBtn = document.getElementById('bookMartinBtn');
  const martinChoicePill = document.getElementById('martinChoicePill');
  const martinChoiceAliasSub = document.getElementById('martinChoiceAliasSub');

  aliasModeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-set-alias-mode') || 'dual';
      document.body.setAttribute('data-alias-mode', mode);
      aliasModeButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      if (mode === 'single') {
        const unifiedAlias = 'barberia.diego.mp';
        if (aliasMartinLabel) aliasMartinLabel.textContent = 'Alias Único del Local (Mercado Pago)';
        if (aliasMartinText) aliasMartinText.textContent = unifiedAlias;
        copyMartinBtn?.setAttribute('data-copy-alias', unifiedAlias);
        bookMartinBtn?.setAttribute('data-alias', unifiedAlias);
        martinChoicePill?.setAttribute('data-alias', unifiedAlias);
        if (martinChoiceAliasSub) martinChoiceAliasSub.textContent = `Alias del local: ${unifiedAlias}`;
        bookingState.alias = unifiedAlias;
        renderBookingSummary();
        showToast('Modo activado: 1 solo Alias unificado para toda la barbería.');
      } else {
        const secondAlias = 'martin.barbero.mp';
        if (aliasMartinLabel) aliasMartinLabel.textContent = 'Alias Mercado Pago / Transferencia (Martín)';
        if (aliasMartinText) aliasMartinText.textContent = secondAlias;
        copyMartinBtn?.setAttribute('data-copy-alias', secondAlias);
        bookMartinBtn?.setAttribute('data-alias', secondAlias);
        martinChoicePill?.setAttribute('data-alias', secondAlias);
        if (martinChoiceAliasSub) martinChoiceAliasSub.textContent = `Alias: ${secondAlias}`;
        if (bookingState.barber.includes('Martín')) {
          bookingState.alias = secondAlias;
        }
        renderBookingSummary();
        showToast('Modo activado: 2 Aliases separados (cada barbero cobra en su cuenta).');
      }
    });
  });
});
