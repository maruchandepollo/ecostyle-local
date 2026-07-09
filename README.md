# EcoStyle - Frontend

Este es el repositorio del frontend del proyecto EcoStyle, una plataforma para explorar, comprar y gestionar productos relacionados con plantas y decoración verde.

## Tecnologías usadas

- React
- Vite
- React Router DOM
- Context API
- CSS modular
- Vitest

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalación

```bash
git clone https://github.com/maruchandepollo/front-ecostyle.git
cd front-ecostyle
npm install
```

## Ejecución en local

Inicia el servidor de desarrollo con:

```bash
npm run dev
```

Luego abre en tu navegador:

```text
http://localhost:5173
```

## Credenciales de prueba

La app incluye un modo local para que puedas entrar sin backend:

- Email: `admin@ecostyle.com`
- Contraseña: `admin123`

## Scripts disponibles

```bash
npm run dev      # inicia la app en modo desarrollo
npm run build    # genera la versión lista para producción
npm test -- --run  # ejecuta las pruebas
```

## Notas

- Si tienes un backend propio, puedes configurarlo con la variable de entorno `VITE_API_URL`.
- Si no está disponible, la app usará datos locales de respaldo para que puedas probarla sin problemas.

## Desarrolladores

- Sergio Puebla
- Javiera Perez
- Matías Bórquez
