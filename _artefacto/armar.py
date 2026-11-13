# Arma la versión artefacto de la maqueta: un solo HTML con el CSS y el JS adentro.
# Cambios respecto del sitio: el mapa de Google (los artefactos no pueden embeber otros
# sitios) se reemplaza por un croquis, y se agregan los márgenes seguros del visor.
# Uso: python _artefacto/armar.py <salida.html> <vista-local.html>
import base64, io, os, re, sys

base = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '')
salida, vista = sys.argv[1], sys.argv[2]

def leer(ruta):
    with io.open(ruta, encoding='utf-8') as f:
        return f.read()

html, css, js = leer(base + 'index.html'), leer(base + 'styles.css'), leer(base + 'app.js')

cuerpo = html.split('<body>', 1)[1].rsplit('</body>', 1)[0]
assert '<script src="app.js"></script>' in cuerpo
cuerpo = cuerpo.replace('<script src="app.js"></script>', '')

CROQUIS = '''<figure class="croquis">
          <p class="pizarra-titulo">El croquis</p>
          <svg viewBox="0 0 400 300" role="img" aria-label="Croquis: del Club Juventud Unida, sobre Juan Farrell, a la barbería, sobre la avenida 25 de Mayo, hay 80 metros">
            <defs>
              <marker id="punta-croquis" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#ffd21f" />
              </marker>
            </defs>
            <g fill="none" stroke="#f7f6ef" stroke-linecap="round" opacity=".28">
              <path d="M120 20 L290 290" stroke-width="22" />
              <path d="M20 235 L380 75" stroke-width="16" />
            </g>
            <g fill="#f7f6ef" font-weight="700" font-size="11" letter-spacing="1.2" text-anchor="middle" dominant-baseline="central">
              <text transform="translate(154 74) rotate(57.8)">AV. 25 DE MAYO</text>
              <text transform="translate(310 106) rotate(-23.96)">JUAN FARRELL</text>
            </g>
            <path class="pizarra-pase" d="M141 181 L204 153 L215.6 171.7" fill="none" stroke="#ffd21f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="7 7" marker-end="url(#punta-croquis)" />
            <circle cx="130" cy="186" r="10" fill="#131815" stroke="#f7f6ef" stroke-width="3" />
            <g stroke="#ffd21f" stroke-width="4" stroke-linecap="round">
              <path d="M219 182l16 16M235 182l-16 16" />
            </g>
            <g font-weight="800" font-size="16">
              <text x="256" y="180" fill="#ffd21f">BARBERÍA DIEGO</text>
              <text x="256" y="195" fill="#f7f6ef" font-weight="500" font-size="11.5">25 de Mayo 2987</text>
              <text x="118" y="218" fill="#f7f6ef" text-anchor="middle">EL CLUB</text>
              <text x="118" y="233" fill="#f7f6ef" text-anchor="middle" font-weight="500" font-size="11.5">Juventud Unida</text>
              <text x="150" y="150" fill="#ffd21f" text-anchor="middle" class="croquis-metros">80 m</text>
            </g>
          </svg>
          <figcaption>Del club a la barbería hay 80 metros. El croquis no está a escala: para el mapa de verdad, tocá «Abrir en Google Maps».</figcaption>
        </figure>'''

ini = cuerpo.index('<div class="mapa">')
fin = cuerpo.index('</div>', cuerpo.index('</iframe>', ini)) + len('</div>')
cuerpo = cuerpo[:ini] + CROQUIS + cuerpo[fin:]
assert 'iframe' not in cuerpo

# Fotos reales en las figuritas: se toman de _fotos/ (fuera del repo, ver .gitignore),
# así quedan solo en el artefacto. La figurita sin foto sigue con su sello "Nola".
FOTOS = {
    'barbero': 'El barbero cortando el pelo en el sillón',
    'sillon': 'El sillón de la barbería',
    'local': 'El local por dentro',
    'corte': 'Un corte recién hecho',
}
for clave, alt in FOTOS.items():
    ruta = os.path.join(base, '_fotos', clave + '.jpg')
    if not os.path.exists(ruta):
        continue
    with open(ruta, 'rb') as f:
        datos = base64.b64encode(f.read()).decode('ascii')
    img = ' con-foto"><img src="data:image/jpeg;base64,' + datos + '" alt="' + alt + '" /></div>'
    patron = re.compile(r'(<li class="figurita" data-figurita="%s">\s*<div class="figurita-foto)">.*?</div>' % clave, re.S)
    cuerpo, n = patron.subn(lambda m: m.group(1) + img, cuerpo)
    assert n == 1, clave

CSS_ARTEFACTO = '''
/* ---------- Ajustes para verla como artefacto ---------- */
.wrap {
  width: auto;
  max-width: calc(var(--ancho) + 2rem);
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
}
.cabecera { top: env(safe-area-inset-top, 0px); }
body::before {
  content: "";
  position: fixed;
  inset: 0 0 auto;
  height: env(safe-area-inset-top, 0px);
  z-index: 60;
  background: var(--tinta);
}
@media (max-width: 61.99rem) {
  .nav {
    padding-left: max(16px, env(safe-area-inset-left, 0px));
    padding-right: max(16px, env(safe-area-inset-right, 0px));
  }
}
.aviso { bottom: calc(1.2rem + env(safe-area-inset-bottom, 0px)); }

/* Croquis en pizarrón, en lugar del mapa de Google */
.croquis {
  align-self: center;
  margin: 12px;
  padding: 1.1rem 1.2rem 1.2rem;
  display: grid;
  gap: 0.8rem;
  background: var(--pizarron);
  color: var(--cal);
  border-radius: 4px;
  box-shadow:
    0 0 0 10px var(--pino),
    0 0 0 12px var(--pino-oscuro),
    0 8px 0 12px rgba(20, 23, 26, 0.25);
}
.croquis svg { display: block; width: 100%; height: auto; }
.croquis text { font-family: var(--titulo); font-stretch: 75%; }
.croquis .croquis-metros { font-family: var(--numeros); font-weight: 400; font-size: 18px; }
.croquis figcaption { font-size: 0.9rem; color: #c9cdc6; }
'''

JS_ARTEFACTO = '''
// En el visor de artefactos los enlaces internos se resuelven con scroll, sin tocar la URL.
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  const destino = link && document.querySelector(link.getAttribute('href'));
  if (!destino) return;
  e.preventDefault();
  destino.scrollIntoView();
});
'''

cabeza = '''<title>Maqueta Barbería Diego</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Saira+Stencil+One&display=swap">
'''

pagina = cabeza + '<style>\n' + css + CSS_ARTEFACTO + '</style>\n' + cuerpo.strip() + '\n<script>\n' + js + JS_ARTEFACTO + '</script>\n'

with io.open(salida, 'w', encoding='utf-8', newline='\n') as f:
    f.write(pagina)

# Copia envuelta en un documento completo, solo para mirarla en el navegador local.
with io.open(vista, 'w', encoding='utf-8', newline='\n') as f:
    f.write('<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n' + pagina + '</body></html>\n')

print(len(pagina), 'caracteres')
