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

<div align="center">

# ⚡ AdBlockNitro

**Navega sin anuncios. A velocidad Nitro.**

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Disponible%20pronto-4285F4?logo=googlechrome&logoColor=white&style=for-the-badge)](https://chrome.google.com/webstore)
[![Versión](https://img.shields.io/badge/versión-1.0.0-00e5cc?style=for-the-badge)](https://github.com/Ajotaz/AdBlockNitro/releases)
[![Licencia](https://img.shields.io/badge/licencia-Comercial%20%7C%20Pago%20para%20Distribuir-ff4d6d?style=for-the-badge)](LICENSE)
[![Manifest](https://img.shields.io/badge/Manifest-V3-1e293b?style=for-the-badge&logo=googlechrome)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Autor](https://img.shields.io/badge/by-Ajotaz-00e5cc?style=for-the-badge)](https://ajotaz.com)

</div>

---

Bloqueador de publicidad ligero, rápido y respetuoso con tu privacidad para **Google Chrome** (Manifest V3). Diseñado por [Ajotaz](https://ajotaz.com) para bloquear anuncios intrusivos sin romper las aplicaciones web que usas a diario.

---

## 🚀 Instalación

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa **"Modo de desarrollador"** (esquina superior derecha)
3. Haz clic en **"Cargar descomprimida"**
4. Selecciona la carpeta de la extensión

---

## ✨ Características

| Característica | Descripción |
|---|---|
| ⚡ **Bloqueo en red** | `declarativeNetRequest` intercepta requests antes de que lleguen al navegador |
| 🛡️ **Bloqueo en DOM** | `content.js` + `inject.css` eliminan elementos de anuncios en tiempo real |
| 🔒 **Neutralización de APIs** | `injected.js` desactiva APIs de publicidad antes de que los scripts del sitio las usen |
| 🎛️ **3 modos de operación** | Estricto / Relajado / Custom |
| 📋 **Listas blanca y negra** | Permite o bloquea sitios específicos desde el panel de configuración |
| 🔴 **Toggle de activación** | Activa o desactiva la extensión sin necesidad de desinstalar |
| 📊 **Estadísticas en vivo** | Contador de anuncios y dominios bloqueados |

---

## 🎯 Capas de bloqueo

```
┌─────────────────────────────────────────┐
│ 1. RED ── declarativeNetRequest         │ ← Bloquea requests
├─────────────────────────────────────────┤
│ 2. DOM ── content.js + inject.css       │ ← Elimina elementos
├─────────────────────────────────────────┤
│ 3. API ── injected.js                   │ ← Neutraliza APIs globales
└─────────────────────────────────────────┘
```

---

## 🛠️ Configuración

Haz clic en el icono de **⚙️ ajustes** dentro del popup para abrir el panel de configuración:

- **Sitios protegidos (blacklist)** — La extensión siempre estará activa en estos dominios
- **Sitios permitidos (whitelist)** — La extensión se desactivará completamente en estos dominios

> 💡 **Consejo:** Si una web deja de funcionar correctamente (como Gmail o YouTube), añade su dominio a la lista de sitios permitidos.

---

## 📁 Estructura del proyecto

```
AdBlockNitro/
├── manifest.json              # Manifest V3
├── rules.json                 # Reglas declarativas de red
├── background.js              # Service worker: estado, modos, estadísticas, listas
├── content.js                 # Content script: limpieza del DOM
├── injected.js                # Script inyectado: neutralización de APIs
├── inject.css                 # CSS de ocultación de anuncios
├── popup.html                 # Interfaz del popup
├── popup.css                  # Estilos del popup
├── popup.js                   # Lógica del popup
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── .gitignore
```

---

## 🔐 Permisos

La extensión solo solicita los permisos mínimos necesarios:

| Permiso | Uso |
|---|---|
| `declarativeNetRequest` | Bloqueo de requests a dominios de publicidad |
| `declarativeNetRequestWithHostAccess` | Acceso a hosts para reglas de red |
| `storage` | Almacenamiento de preferencias y estadísticas |

**No requiere** permisos de lectura de historial, cookies ni datos personales.

---

## 🐛 Solución de problemas

| Problema | Solución |
|---|---|
| Gmail / YouTube no funcionan correctamente | Añade `gmail.com` o `youtube.com` a la lista de **Sitios permitidos** en el panel de configuración |
| El toggle de activación no hace nada | Recarga la página activa después de cambiar el estado |
| No se bloquean ciertos anuncios | Cambia al modo **Estricto** o añade el dominio a la **blacklist** |

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para más información.

---

## 📄 Licencia

**Este software está protegido por una licencia comercial.**

- ✅ **Uso personal:** Gratuito
- ❌ **Distribución:** Requiere pago y autorización previa
- ❌ **Uso comercial:** Requiere licencia de pago
- ❌ **Modificación y redistribución:** Prohibida sin autorización

Consulta el archivo [LICENSE](LICENSE) para los términos completos.

Para licencias comerciales, distribución o consultas de uso empresarial: **contact@ajotaz.com**

---

<div align="center">

**AdBlockNitro** — Navega sin anuncios. A velocidad Nitro. ⚡

Made with 💚 by [Ajotaz](https://ajotaz.com)

</div>
