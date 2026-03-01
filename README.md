# 🏛️ LexColombia — MVP Completo (Fase 3)

Portal jurídico colombiano con consulta de leyes, autenticación Google, notas judiciales y panel de administración.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Base de datos + Auth | Supabase (PostgreSQL + Google OAuth) |
| Estilos | Tailwind CSS |
| Deploy | Vercel |

---

## 🚀 Configuración completa

### 1. Crear proyecto en Supabase
Ve a [supabase.com](https://supabase.com) → New project → copia **Project URL** y **anon key** de Settings → API.

### 2. Variables de entorno
```bash
cp .env.example .env.local
# Rellena NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Ejecutar migración de base de datos
En Supabase → **SQL Editor → New query**, pega y ejecuta **`supabase/migration.sql`**.

Esto crea:
- Tablas `profiles` y `notes`
- Row Level Security completo
- Trigger de creación automática de perfil
- Políticas de admin para gestión de usuarios

### 4. Configurar Google OAuth
1. Supabase → **Authentication → Providers → Google → Enable**
2. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client ID
3. En **Authorized redirect URIs**: `https://TUPROYECTO.supabase.co/auth/v1/callback`
4. Copia **Client ID** y **Client Secret** a Supabase

### 5. Crear el primer admin
Después de que alguien se registre con Google, ejecuta en Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu@email.com';
```

### 6. Instalar y correr
```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## 📁 Estructura completa del proyecto

```
src/
├── app/
│   ├── page.tsx                           # Landing con alertas de auth
│   ├── layout.tsx                         # Root layout + AuthProvider
│   ├── globals.css                        # Design tokens + animaciones
│   ├── auth/callback/route.ts             # OAuth callback
│   ├── dashboard/page.tsx                 # Perfil + estadísticas
│   ├── leyes/
│   │   ├── page.tsx                       # Listado de leyes
│   │   ├── LeyesClientPagination.tsx
│   │   └── [id]/page.tsx                  # Detalle de ley
│   ├── precedentes/
│   │   ├── page.tsx                       # Listado de precedentes
│   │   ├── PrecedentesClientPagination.tsx
│   │   └── [id]/page.tsx                  # Detalle de precedente
│   ├── notas/
│   │   ├── page.tsx                       # Lista de notas (client)
│   │   ├── nueva/page.tsx                 # Crear nota
│   │   └── [id]/page.tsx                  # Editar nota
│   └── admin/
│       ├── layout.tsx                     # Sidebar del panel admin
│       ├── page.tsx                       # Visión general + stats
│       ├── actions.ts                     # Server Actions para cambiar roles
│       └── usuarios/page.tsx              # Gestión completa de usuarios
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                     # Con menú de usuario, avatar y rol
│   │   └── Footer.tsx
│   ├── laws/
│   │   ├── LawCard.tsx / LawFilters.tsx
│   │   └── PrecedenteCard.tsx / PrecedenteFilters.tsx
│   ├── notes/
│   │   ├── NoteCard.tsx / NoteEditor.tsx
│   │   └── SaveNoteButton.tsx
│   ├── admin/
│   │   ├── UserTable.tsx                  # Tabla con búsqueda, filtro y orden
│   │   └── UserRoleSelector.tsx           # Dropdown inline para cambiar rol
│   └── ui/index.tsx
├── context/
│   └── AuthContext.tsx                    # Estado global de auth
├── lib/
│   ├── admin.ts                           # Queries de admin
│   ├── notes.ts                           # CRUD de notas
│   ├── utils.ts
│   ├── apis/suin.ts / precedentes.ts
│   └── supabase/client.ts / server.ts / middleware.ts
├── middleware.ts                          # Guards: auth + admin + blocked
└── types/
    ├── index.ts
    └── database.ts
```

---

## 🔐 Sistema de roles y accesos

| Rol | `/leyes` `/precedentes` | `/dashboard` `/notas` | `/admin` |
|---|---|---|---|
| Anónimo | ✅ | ❌ | ❌ |
| `user` | ✅ | ✅ | ❌ |
| `admin` | ✅ | ✅ | ✅ |
| `blocked` | ❌ (redirigido) | ❌ | ❌ |

---

## 🗓️ MVP Completo — Fases entregadas

### ✅ Fase 1 — Consulta pública
- Leyes y normas con búsqueda, filtros y paginación (SODA API)
- Precedentes judiciales curados (12 sentencias históricas)
- Diseño editorial responsivo

### ✅ Fase 2 — Auth + Notas
- Login con Google OAuth vía Supabase
- Protección de rutas con middleware
- Dashboard de perfil con estadísticas
- CRUD completo de notas con colores, etiquetas, pin y referencias

### ✅ Fase 3 — Admin Dashboard
- Panel `/admin` con sidebar de navegación
- Estadísticas globales de la plataforma
- Gestión completa de usuarios con tabla ordenable y filtrable
- Cambio de rol inline (user / admin / blocked)
- Server Actions seguras con validación de rol en servidor
- Políticas RLS de Supabase para admins

---

## ⚠️ Aviso legal
Esta plataforma no ofrece asesoría jurídica. Los datos provienen de fuentes públicas oficiales del Estado colombiano.
