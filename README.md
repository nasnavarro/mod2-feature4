# Módulo 2 | Feature 4 — Autenticación + Autorización + Seguridad

## Objetivo

Añadir autenticación y autorización de usuarios a la API. Hasta ahora todos los endpoints eran públicos. A partir de este sprint se implementa un sistema que permite:

- Registrar usuarios
- Iniciar sesión
- Generar tokens de autenticación
- Proteger rutas
- Controlar permisos mediante roles

Además se refuerza la seguridad añadiendo cabeceras seguras, control de dominios y limitación de peticiones.

## Tech / Dependencias

- Node.js 18+
- Express
- Prisma ORM
- Supabase (PostgreSQL)

Nuevas dependencias:

```bash
npm install jsonwebtoken bcrypt cors helmet express-rate-limit
```

## Variables de entorno

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="tu_clave_secreta_super_segura"
JWT_EXPIRES_IN="7d"
PORT=3000
```

> Si `JWT_SECRET` no está definido, el servidor **no debe arrancar**.

## Estructura del proyecto

```
src/
├── config/
├── controllers/
│   ├── auth.controller.js
│   └── users.controller.js
├── services/
│   ├── auth.service.js
│   └── users.service.js
├── routes/
│   ├── auth.routes.js
│   ├── users.routes.js
│   └── products.routes.js
├── middlewares/
│   ├── authenticate.js
│   ├── requireRole.js
│   ├── validateProduct.js
│   ├── errorHandler.js
│   └── notFound.js
├── app.js
└── server.js

prisma/
└── schema.prisma

.env
```

## Endpoints

### Auth (públicos)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Login y generación de token |

### Productos

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/products` | Público |
| GET | `/api/products/:id` | Público |
| POST | `/api/products` | ADMIN |
| PUT | `/api/products/:id` | ADMIN |
| DELETE | `/api/products/:id` | ADMIN |

### Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users/profile` | Perfil del usuario autenticado |

## Qué hay que implementar

### 1. Registro de usuario — `POST /api/auth/register`

- Recibe `email` y `password`
- Aplica `bcrypt.hash()` a la contraseña
- Guarda el usuario en la base de datos

> Nunca guardar la contraseña en texto plano.

### 2. Login — `POST /api/auth/login`

1. Buscar usuario por email
2. Comparar password con `bcrypt.compare()`
3. Generar token JWT:

```js
jwt.sign(payload, JWT_SECRET, { expiresIn })
```

### 3. Middleware `authenticate`

- Lee el header `Authorization: Bearer TOKEN`
- Verifica el token con `jwt.verify()`
- Añade el usuario al request como `req.user`
- Si el token es inválido → **401 Unauthorized**

### 4. Middleware `requireRole`

Restringe rutas por rol. Ejemplo de uso:

```js
requireRole("ADMIN")
```

- Si el usuario no tiene el rol requerido → **403 Forbidden**
- Puede aceptar múltiples roles

### 5. Proteger rutas de productos

`POST`, `PUT` y `DELETE` en `/api/products` solo accesibles para usuarios **ADMIN**.

Orden correcto de middlewares:

```
authenticate → requireRole → controller
```

## Seguridad Web

### Helmet

Añade cabeceras HTTP seguras automáticamente:

```js
app.use(helmet())
```

Cabeceras que añade: `X-DNS-Prefetch-Control`, `X-Frame-Options`, `X-XSS-Protection`, etc.

### CORS

Controla qué dominios pueden acceder a la API:

```js
app.use(cors())
```

En producción se debe restringir a dominios concretos.

### Rate Limit

Limita peticiones por IP para evitar ataques de fuerza bruta:

```
100 requests / 15 minutos
```

## Cómo usar Authorization Bearer

1. Hacer login en `POST /api/auth/login`
2. Copiar el token recibido
3. Enviarlo en la cabecera de cada petición protegida:

```
Authorization: Bearer <TOKEN>
```

## Pistas

1. **No guardar passwords en texto plano** — siempre `bcrypt.hash()`
2. **El token no guarda la contraseña** — el payload JWT debe contener solo `userId`, `role` y `email`
3. **Los middlewares se ejecutan en orden** — `authenticate → requireRole → controller`
4. **Los tokens expiran** — usar `JWT_EXPIRES_IN="7d"` u otro valor
5. **La arquitectura sigue igual** — `routes → controllers → services → prisma`

## Checks de autoevaluación

- [ ] `POST /api/auth/register` crea usuario con contraseña hasheada
- [ ] `POST /api/auth/login` devuelve token JWT
- [ ] El token funciona en rutas protegidas
- [ ] Un usuario `USER` no puede crear/editar/eliminar productos → **403**
- [ ] Un `ADMIN` sí puede crear/editar/eliminar productos
- [ ] Sin token → **401**
- [ ] Sin permisos → **403**

## Ejemplos cURL

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Login (guarda el token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

TOKEN="eyJhbGci..."

# Ver perfil (autenticado)
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# Crear producto (ADMIN)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -d '{"name":"Cazadora Cuero","price":129.99,"stock":15}'

# Intentar crear sin token → 401
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":10}'

# Intentar crear con rol USER → 403
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_USER" \
  -d '{"name":"Test","price":10}'
```

## Notas

- `passwordHash` es obligatorio en el modelo `User` de Prisma.
- `authenticate` añade `req.user` al objeto request.
- `requireRole()` puede aceptar múltiples roles.
- Si `JWT_SECRET` no existe el servidor **no debe arrancar**.
- Nunca subir `.env` al repositorio.
