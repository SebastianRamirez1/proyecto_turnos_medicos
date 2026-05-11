# Frontend - Clinica San Martin

Panel web en React, TypeScript, Vite y Tailwind CSS para consumir la API REST de turnos medicos.

## Correr localmente

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

Por defecto consume la API publicada en Render:

```text
https://clinica-turnos-api.onrender.com
```

Para usar un backend local:

```bash
VITE_API_URL=http://localhost:8080 npm run dev
```

En PowerShell:

```powershell
$env:VITE_API_URL="http://localhost:8080"; npm run dev
```

## Deploy en Vercel

1. Importar el repositorio en Vercel.
2. Configurar `frontend` como Root Directory.
3. Agregar la variable `VITE_API_URL` con la URL del backend.
4. Build command: `npm run build`.
5. Output directory: `dist`.
