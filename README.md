# Pokédex Web App

Una aplicación web que consume la [PokéAPI](https://pokeapi.co) para mostrar información detallada de todos los Pokémon, incluyendo búsqueda, filtrado por tipo y generación, favoritos y línea evolutiva.

---

## ⚙️ Funcionalidades

- Listado paginado de Pokémon.
- Búsqueda por nombre.
- Filtro por tipo y generación.
- Favoritos persistentes con localStorage.
- Modal con información detallada.
- Línea evolutiva completa, con comportamiento especial para Eevee.
- Modo scroll infinito para carga de datos.

---

## 🗂️ Estructura del Proyecto

```
📁 src/
├── index.html                  # HTML principal con la estructura base
├── css/
│   └── style.css               # Estilos generales de la app
├── js/
│   ├── main.js                 # Punto de entrada, inicia la app
│   ├── api.js                  # Lógica para consumir PokéAPI
│   ├── state.js                # Estado global de la app y carga de Pokémon
│   └── interface.js            # Lógica para los filtros
│   ├── doom.js                 # Referencias a elementos del DOM
│   ├── render.js               # Renderizado de tarjetas y actualizaciones visuales
│   ├── events.js               # Manejo de eventos (clics, scroll, filtros, favoritos)
│   ├── constants.js            # Constantes reutilizables (tipos, límites, etc.)
│   └── filters.js              # Lógica de filtrado por tipo y generación
└── assets/                     # Imágenes 
```

---

## 🚀 Instalación y uso

1. Clona el repositorio:

```bash
git clone https://github.com/razquinmateo/pokedex-app.git
```

2. Abre `index.html` directamente en tu navegador.

---

## 📦 Tecnologías utilizadas

- HTML5 + CSS3
- JavaScript (Vanilla)
- Bootstrap 5 (solo clases utilitarias)
- [PokéAPI](https://pokeapi.co)

---

## 📄 Licencia

Este proyecto es solo con fines educativos y de práctica.
La información proviene de PokéAPI.

---

## 🧑‍💻 Autor

Mateo Razquin -> 🔗 Portfolio Web