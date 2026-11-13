/**
 * BARBERÍA DIEGO — "El corte del club"
 * Estado abierto/cerrado, armado del turno (la "entrada") y envío por WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP = '5491167666374';

  // Horarios de ejemplo (hora decimal). Día de Date.getDay(): 0 dom … 6 sáb. Sin entrada = fecha libre.
  const HORARIOS = {
    2: [9.5, 20],
    3: [9.5, 20],
    4: [9.5, 20],
    5: [9.5, 20],
    6: [9, 19.5]
  };
  const TURNOS = ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const DIAS_A_MOSTRAR = 6;

  const horaDecimal = (fecha) => fecha.getHours() + fecha.getMinutes() / 60;
  const horaTexto = (h) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
  const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

  /* ========================================================================
     1. ESTADO DEL LOCAL (ABIERTO / CERRADO) Y FILA DE HOY EN EL FIXTURE
     ======================================================================== */
  const estado = document.getElementById('estado');
  const estadoTexto = document.getElementById('estadoTexto');

  function actualizarEstado() {
    if (!estado || !estadoTexto) return;
    const ahora = new Date();
    const franja = HORARIOS[ahora.getDay()];
    const abierto = Boolean(franja) && horaDecimal(ahora) >= franja[0] && horaDecimal(ahora) < franja[1];

    estado.classList.toggle('cerrado', !abierto);
    estadoTexto.textContent = abierto
      ? `Abierto ahora · hasta las ${horaTexto(franja[1])}`
      : 'Cerrado ahora · pedí tu turno por WhatsApp';
  }
  actualizarEstado();
  window.setInterval(actualizarEstado, 60000);

  const hoy = String(new Date().getDay());
  document.querySelectorAll('.fixture tr[data-dias]').forEach((fila) => {
    fila.classList.toggle('hoy', fila.dataset.dias.split(',').includes(hoy));
  });

  /* ========================================================================
     2. MENÚ MÓVIL
     ======================================================================== */
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');

  function cerrarMenu() {
    nav?.classList.remove('abierto');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }

  menuBtn?.addEventListener('click', () => {
    const abierto = nav?.classList.toggle('abierto');
    menuBtn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', cerrarMenu));

  /* ========================================================================
     3. AVISO
     ======================================================================== */
  const aviso = document.getElementById('aviso');
  let avisoTimeout = null;

  function mostrarAviso(mensaje) {
    if (!aviso) return;
    aviso.textContent = mensaje;
    aviso.classList.add('visible');
    if (avisoTimeout) clearTimeout(avisoTimeout);
    avisoTimeout = setTimeout(() => aviso.classList.remove('visible'), 3200);
  }

  /* ========================================================================
     4. TURNOS: DÍAS Y HORARIOS DISPONIBLES
     ======================================================================== */
  const diasBox = document.getElementById('dias');
  const horasBox = document.getElementById('horas');
  const nombreInput = document.getElementById('nombre');
  const confirmar = document.getElementById('confirmar');

  const eServicio = document.getElementById('eServicio');
  const eDia = document.getElementById('eDia');
  const eHora = document.getElementById('eHora');
  const eNombre = document.getElementById('eNombre');
  const ePrecio = document.getElementById('ePrecio');

  // Horarios que todavía se pueden pedir para una fecha (hoy: con media hora de margen).
  function turnosDe(fecha) {
    const franja = HORARIOS[fecha.getDay()];
    if (!franja) return [];
    const ahora = new Date();
    const esHoy = fecha.toDateString() === ahora.toDateString();
    return TURNOS.filter((turno) => {
      const [h, m] = turno.split(':').map(Number);
      const valor = h + m / 60;
      return valor >= franja[0] && valor < franja[1] && (!esHoy || valor > horaDecimal(ahora) + 0.5);
    });
  }

  // Próximos días con al menos un horario libre.
  function proximosDias() {
    const dias = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    const manana = new Date(cursor);
    manana.setDate(manana.getDate() + 1);

    for (let i = 0; i < 21 && dias.length < DIAS_A_MOSTRAR; i += 1) {
      const fecha = new Date(cursor);
      fecha.setDate(cursor.getDate() + i);
      if (turnosDe(fecha).length === 0) continue;

      const corto = `${DIAS[fecha.getDay()]} ${fecha.getDate()}/${fecha.getMonth() + 1}`;
      let titulo = mayuscula(DIAS[fecha.getDay()]);
      let detalle = `${fecha.getDate()}/${fecha.getMonth() + 1}`;
      let completo = mayuscula(corto);
      if (i === 0) {
        titulo = 'Hoy';
        detalle = corto;
        completo = `Hoy, ${corto}`;
      } else if (fecha.getTime() === manana.getTime()) {
        titulo = 'Mañana';
        detalle = corto;
        completo = `Mañana, ${corto}`;
      }
      dias.push({ fecha, titulo, detalle, completo });
    }
    return dias;
  }

  const dias = proximosDias();

  function crearChip({ name, id, value, checked, contenido }) {
    const label = document.createElement('label');
    label.className = 'chip';
    label.htmlFor = id;

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.id = id;
    input.value = value;
    input.checked = checked;

    const span = document.createElement('span');
    span.append(...contenido);

    label.append(input, span);
    return label;
  }

  function pintarDias() {
    if (!diasBox) return;
    diasBox.replaceChildren(...dias.map((dia, i) => {
      const titulo = document.createElement('b');
      titulo.textContent = dia.titulo;
      const detalle = document.createElement('small');
      detalle.textContent = dia.detalle;
      const texto = document.createElement('div');
      texto.append(titulo, detalle);
      return crearChip({ name: 'dia', id: `dia-${i}`, value: String(i), checked: i === 0, contenido: [texto] });
    }));
  }

  function pintarHoras() {
    if (!horasBox) return;
    const dia = dias[Number(valorElegido('dia'))];
    const libres = dia ? turnosDe(dia.fecha) : [];
    const anterior = valorElegido('hora');
    const elegida = libres.includes(anterior) ? anterior : libres[0];

    horasBox.replaceChildren(...TURNOS.map((turno, i) => {
      const chip = crearChip({
        name: 'hora',
        id: `hora-${i}`,
        value: turno,
        checked: turno === elegida,
        contenido: [document.createTextNode(turno)]
      });
      chip.querySelector('input').disabled = !libres.includes(turno);
      return chip;
    }));
  }

  /* ========================================================================
     5. LA ENTRADA: RESUMEN EN VIVO Y LINK DE WHATSAPP
     ======================================================================== */
  function valorElegido(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value ?? '';
  }

  function ponerDato(elemento, valor, vacio) {
    if (!elemento) return;
    elemento.textContent = valor || vacio;
    elemento.classList.toggle('vacio', !valor);
  }

  function actualizarEntrada() {
    const servicio = document.querySelector('input[name="servicio"]:checked');
    const nombreServicio = servicio?.dataset.nombre ?? '';
    const precio = servicio?.dataset.precio ?? '';
    const dia = dias[Number(valorElegido('dia'))]?.completo ?? '';
    const hora = valorElegido('hora');
    const nombre = nombreInput?.value.trim() ?? '';

    ponerDato(eServicio, nombreServicio, 'A elegir');
    ponerDato(eDia, dia, 'A elegir');
    ponerDato(eHora, hora, 'A elegir');
    ponerDato(eNombre, nombre, 'Falta tu nombre');
    if (ePrecio) ePrecio.textContent = precio;

    if (confirmar) {
      const saludo = nombre ? `¡Hola Diego! Soy *${nombre}*. Quiero pedir un turno:` : '¡Hola Diego! Quiero pedir un turno:';
      const lineas = [saludo, `✂️ ${nombreServicio} (${precio})`];
      if (dia && hora) lineas.push(`📅 ${dia} a las ${hora}`);
      confirmar.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lineas.join('\n'))}`;
    }
  }

  pintarDias();
  pintarHoras();
  actualizarEntrada();

  document.getElementById('turnoForm')?.addEventListener('change', (e) => {
    if (e.target.name === 'dia') pintarHoras();
    actualizarEntrada();
  });
  document.getElementById('turnoForm')?.addEventListener('submit', (e) => e.preventDefault());
  nombreInput?.addEventListener('input', actualizarEntrada);

  /* ========================================================================
     6. "PEDIR ESTE CORTE": DESDE LAS CATEGORÍAS Y EL TABLERO
     ======================================================================== */
  document.querySelectorAll('.elegir-servicio').forEach((boton) => {
    boton.addEventListener('click', () => {
      const radio = document.getElementById(`srv-${boton.dataset.servicio}`);
      if (!radio) return;
      radio.checked = true;
      actualizarEntrada();
      document.getElementById('turnos')?.scrollIntoView();
      mostrarAviso(`Listo: ${radio.dataset.nombre} (${radio.dataset.precio}). Elegí día y horario.`);
    });
  });
});
