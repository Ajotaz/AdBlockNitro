<!--
  ╔═══════════════════════════════════════════════════════════════╗
  ║  AdBlockNitro v1.0.0                                          ║
  ║  Copyright (c) 2026 Ajotaz — https://ajotaz.com             ║
  ║  Contact: contact@ajotaz.com                                  ║
  ║  GitHub: https://github.com/Ajotaz/AdBlockNitro              ║
  ║  Licensed under the AdBlockNitro License Agreement.          ║
  ║  See LICENSE for full terms.                                  ║
  ╚═══════════════════════════════════════════════════════════════╝
-->

# 🤝 Guía de Contribución

¡Gracias por tu interés en mejorar AdBlockNitro! Este documento explica cómo puedes colaborar.

---

## 📋 Código de Conducta

- Sé respetuoso en todas las interacciones
- Acepta críticas constructivas
- Enfócate en lo que es mejor para la comunidad

---

## 🐛 Reportar Bugs

Antes de reportar, verifica:

1. Que no exista ya un issue abierto sobre el mismo problema
2. Que uses la última versión de la extensión
3. Que el bug sea reproducible

### Plantilla de reporte

```markdown
**Descripción:** Breve descripción del bug

**Pasos para reproducir:**
1. Ir a '...'
2. Hacer clic en '...'
3. Scroll hasta '...'
4. Ver error

**Comportamiento esperado:** Qué debería pasar

**Comportamiento actual:** Qué pasa realmente

**Entorno:**
- Versión de Chrome: [ej. 126.0.6478.63]
- Versión de AdBlockNitro: [ej. 1.0.0]
- Sistema operativo: [ej. Windows 11 / macOS 14 / Ubuntu 24.04]
- URL donde ocurre: [ej. https://ejemplo.com]

**Capturas de pantalla:** (si aplica)
```

## 💡 Sugerir Mejoras

Las sugerencias son bienvenidas. Abre un issue con la etiqueta `enhancement` y describe:

- El problema que resuelve
- La solución propuesta
- Alternativas consideradas

## 🔧 Configuración del Entorno de Desarrollo

### Requisitos

- Google Chrome (última versión estable)
- Node.js 18+ (opcional, para linting)

### Pasos

1. **Fork** el repositorio

2. **Clona** tu fork:

```bash
git clone https://github.com/Ajotaz/AdBlockNitro.git
cd AdBlockNitro
```

3. **Carga la extensión en Chrome:**

   - Abre `chrome://extensions/`
   - Activa "Modo de desarrollador"
   - Haz clic en "Cargar descomprimida"
   - Selecciona la carpeta del proyecto

4. **Crea una rama** para tu cambio:

```bash
git checkout -b feature/nombre-de-tu-feature
# o
git checkout -b fix/nombre-del-bug
```

## 📝 Estilo de Código

### JavaScript

- Usa `const` y `let`, evita `var`
- Punto y coma obligatorio
- Comillas simples para strings
- Indentación: 4 espacios
- Máximo 120 caracteres por línea

```javascript
// ✅ Correcto
const DOMAIN_LIST = ['example.com', 'ads.com'];

function isAdDomain(url) {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return DOMAIN_LIST.includes(parsed.hostname);
    } catch {
        return false;
    }
}

// ❌ Incorrecto
var domain_list = ["example.com", "ads.com"]
function isAdDomain(url){
    if(!url)return false
    try{
        var parsed=new URL(url)
        return domain_list.includes(parsed.hostname)
    }catch(e){return false}
}
```

### CSS

- Propiedades en orden alfabético dentro de cada bloque
- Usa variables CSS del `:root` para colores
- Prefijo de clase: `ab-` para evitar conflictos (ej. `.ab-popup`)

```css
/* ✅ Correcto */
.ab-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
}

/* ❌ Incorrecto */
.card{
    padding:16px;
    background:#0f1729;
    border-radius:16px;
    border:1px solid #1e293b;
}
```

### Commits

Formato: `tipo(ámbito): descripción`

Tipos permitidos:
- `feat` — Nueva funcionalidad
- `fix` — Corrección de bug
- `docs` — Documentación
- `style` — Cambios de formato (espacios, comas, etc.)
- `refactor` — Refactorización de código
- `perf` — Mejora de rendimiento
- `test` — Tests
- `chore` — Tareas de mantenimiento

Ejemplos:

```bash
git commit -m "feat(popup): añadir panel de configuración de listas"
git commit -m "fix(content): evitar bloqueo de iframes de Gmail"
git commit -m "docs(readme): actualizar instrucciones de instalación"
```

## 🧪 Testing

Antes de enviar un PR, verifica manualmente:

- [ ] La extensión carga sin errores en `chrome://extensions/`
- [ ] El popup se abre y muestra datos correctos
- [ ] El toggle de activación/desactivación funciona
- [ ] Los modos (Estricto/Relajado/Custom) cambian correctamente
- [ ] La lista blanca/negra funciona
- [ ] Gmail, YouTube y Google Images funcionan correctamente
- [ ] Los anuncios se bloquean en sitios de prueba
- [ ] No hay errores en la consola del service worker
- [ ] No hay errores en la consola del content script

### Sitios de prueba recomendados

| Sitio | Qué verificar |
|---|---|
| `https://www.google.com/search?q=shoes&tbm=isch` | Imágenes de Google no se bloquean |
| `https://mail.google.com` | Gmail funciona completamente |
| `https://www.youtube.com` | YouTube reproduce videos |
| `https://www.reddit.com` | No hay overlays bloqueantes |
| `https://news.ycombinator.com` | Sin anuncios de Outbrain/Taboola |

## 📤 Pull Requests

1. Asegúrate de que tu código pasa todas las verificaciones manuales
2. Actualiza el `README.md` si tu cambio afecta la funcionalidad documentada
3. Añade una descripción clara de qué cambia y por qué
4. Referencia los issues relacionados con `Closes #123`

### Plantilla de PR

```markdown
## Descripción
Breve descripción del cambio

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Cómo probar
Pasos para verificar que funciona

## Issues relacionados
Closes #123
```

## 📜 Licencia de Contribución

Al contribuir a este proyecto, aceptas que tu código se distribuirá bajo la misma licencia que el proyecto principal. Consulta el archivo `LICENSE` para más detalles.

**Importante:** Si tu contribución incluye código de terceros, debes asegurarte de que sea compatible con la licencia del proyecto y documentar la fuente.

## ❓ Preguntas

¿Tienes dudas? Abre un issue con la etiqueta `question` o contacta al mantenedor en **contact@ajotaz.com**.

¡Gracias por contribuir! 🚀
