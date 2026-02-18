# Tarjeta Digital

Tarjeta de presentacion digital construida con Next.js 16 y Supabase.
Comparte tu informacion de contacto con un toque o un codigo QR.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/Licencia-MIT-green)

---

## Funcionalidades

- **Tarjeta digital responsiva** con diseno dark/amber
- **PWA instalable** -- funciona offline, se agrega a la pantalla de inicio
- **Codigo QR dinamico** para compartir tu tarjeta al instante
- **Formulario de intercambio de contactos** -- captura datos de quien visita tu tarjeta
- **Sincronizacion con GoHighLevel CRM** (opcional)
- **Dashboard con analytics** -- visitas, contactos capturados, estado de sincronizacion
- **Subida de foto con recorte** -- ajusta tu foto de perfil desde el navegador
- **Video de YouTube embebido** con toggle on/off
- **Descarga VCF** -- los visitantes guardan tu contacto directo en su telefono
- **Soporte para multiples usuarios** -- cada usuario tiene su propia tarjeta en `/c/[username]`

---

## Stack Tecnologico

| Capa | Tecnologia | Descripcion |
|------|------------|-------------|
| Framework | Next.js 16 + React 19 | App Router, Server Components, Turbopack |
| Lenguaje | TypeScript 5 | Tipado estatico en todo el proyecto |
| Estilos | Tailwind CSS 3.4 | Utility-first, diseno dark/amber personalizado |
| Backend | Supabase | Auth + PostgreSQL + Storage + RLS |
| PWA | Serwist | Service Worker, soporte offline, instalable |
| QR | qrcode.react | Generacion de codigos QR en el cliente |
| Deploy | Vercel | Deploy automatico desde GitHub |

---

## Inicio Rapido

### Requisitos previos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (el plan gratuito funciona)
- (Opcional) Cuenta en [GoHighLevel](https://www.gohighlevel.com) para integracion CRM

### Instalacion

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/digital-business-card.git
cd digital-business-card

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase (ver seccion abajo)

# 4. Ejecutar en desarrollo
npm run dev
```

El servidor se levanta en `http://localhost:3000` (auto-detecta puertos disponibles si 3000 esta ocupado).

---

## Configuracion de Supabase

### 1. Crear proyecto

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Espera a que el proyecto termine de inicializarse

### 2. Ejecutar migraciones SQL

Ve a **SQL Editor** en el panel de Supabase y ejecuta los siguientes archivos **en orden**:

| Orden | Archivo | Descripcion |
|-------|---------|-------------|
| 1 | `supabase/migrations/001_initial_schema.sql` | Tablas principales, RLS, trigger de auto-creacion de perfil |
| 2 | `supabase/migrations/002_add_location_social_resources.sql` | Campos de ubicacion, redes sociales y recursos |
| 3 | `supabase/migrations/003_storage_avatars.sql` | Bucket de storage para fotos de perfil |

> **Importante:** Ejecuta cada archivo uno por uno, en el orden indicado.

### 3. Agregar columna de video

Despues de las migraciones, ejecuta esta consulta adicional en el SQL Editor:

```sql
ALTER TABLE public.profiles ADD COLUMN show_video boolean DEFAULT false;
```

### 4. Obtener credenciales

1. Ve a **Settings > API** en el panel de Supabase
2. Copia la **URL** del proyecto
3. Copia la **anon key** (clave publica)
4. Copia la **service_role key** (clave privada -- solo para el servidor)

### 5. Habilitar autenticacion por email

1. Ve a **Authentication > Providers**
2. Asegurate de que **Email** este habilitado

---

## Variables de Entorno

Crea un archivo `.env.local` en la raiz del proyecto con las siguientes variables:

| Variable | Descripcion | Donde obtenerla |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave publica (anon) de Supabase | Settings > API > Project API Keys > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada del servidor | Settings > API > Project API Keys > service_role |
| `NEXT_PUBLIC_BASE_URL` | URL base de tu aplicacion | `http://localhost:3000` en desarrollo, tu dominio en produccion |

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## GoHighLevel (Opcional)

La integracion con GoHighLevel permite sincronizar automaticamente los contactos capturados a tu CRM.

### Configuracion

1. Abre el **Dashboard** de la aplicacion
2. Ve a **Settings** (Configuracion)
3. Ingresa tu **API Key** de GoHighLevel (token de integracion privada)
4. Ingresa tu **Location ID**
5. Haz clic en **Probar Conexion** para verificar
6. Activa la sincronizacion automatica

### Campos personalizados requeridos en GHL

Para que la sincronizacion funcione correctamente, crea estos campos personalizados en tu cuenta de GoHighLevel:

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `interest_type` | Text | Tipo de interes del contacto |
| `initial_message` | Text | Mensaje inicial del visitante |
| `contact_source` | Text | Origen del contacto (tarjeta digital) |

---

## Personalizacion

### Colores

Edita las variables CSS en `src/app/globals.css`:

```css
:root {
  --bg-base: #050505;          /* Fondo principal */
  --accent: #f59e0b;           /* Color de acento (amber) */
  --accent-dim: rgba(245, 158, 11, 0.15);
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.65);
  /* ... mas variables disponibles en el archivo */
}
```

### Tipografia

Cambia la importacion de Google Fonts en la primera linea de `src/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
```

### Iconos y branding

Actualiza los iconos PWA en `public/icons/`:

| Archivo | Tamano | Uso |
|---------|--------|-----|
| `icon-192.png` | 192x192 | Icono PWA estandar |
| `icon-512.png` | 512x512 | Icono PWA splash screen |
| `app-icon.svg` | SVG | Icono vectorial de la app |

---

## Estructura del Proyecto

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Paginas de autenticacion
│   │   ├── login/              # Inicio de sesion
│   │   ├── signup/             # Registro
│   │   ├── forgot-password/    # Recuperar contrasena
│   │   └── check-email/        # Confirmacion de email
│   ├── (main)/                 # Paginas protegidas (dashboard)
│   │   └── dashboard/
│   │       ├── card/           # Editor de tarjeta
│   │       ├── contacts/       # Gestion de contactos
│   │       ├── settings/       # Configuracion (GHL)
│   │       └── qr/             # Pagina de codigo QR
│   ├── c/[username]/           # Tarjeta publica
│   │   └── vcard/              # Descarga de archivo VCF
│   └── api/                    # Rutas API
│
├── features/                    # Modulos por funcionalidad
│   ├── auth/                   # Autenticacion (LoginForm, SignupForm)
│   ├── card/                   # Tarjeta (CardView, QRCode, ExchangeForm)
│   ├── dashboard/              # Dashboard (CardEditor, PhotoUpload, Settings)
│   └── ghl/                    # Integracion GoHighLevel
│
└── shared/                      # Codigo compartido
    ├── components/             # Componentes reutilizables
    ├── hooks/                  # Hooks compartidos
    └── lib/                    # Clientes (Supabase, etc.)
```

---

## Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo (Turbopack)
npm run build      # Build de produccion
npm run start      # Servidor de produccion
npm run lint       # Ejecutar ESLint
```

---

## Deploy a Vercel

1. Sube tu repositorio a GitHub
2. Ve a [vercel.com](https://vercel.com) y haz clic en **New Project**
3. Importa tu repositorio de GitHub
4. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_BASE_URL` (usa tu dominio de Vercel, ej: `https://tu-app.vercel.app`)
5. Haz clic en **Deploy**

El service worker de la PWA se genera automaticamente durante el build de produccion.

---

## Licencia

Este proyecto esta bajo la licencia [MIT](LICENSE).

---

Construido con Next.js 16 + Supabase + Serwist PWA
