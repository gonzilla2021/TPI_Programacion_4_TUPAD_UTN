# Food Store

Trabajo Práctico Integrador de **Programación 4 — TUPAD, UTN**.

Una aplicación para pedir comida. El cliente puede recorrer el catálogo, armar un carrito, confirmar una compra y consultar sus pedidos. El administrador gestiona categorías, productos, stock, pedidos y usuarios.

- **Alumno:** Castellini Gonzalo
- **Repositorio:** https://github.com/gonzilla2021/TPI_Programacion_4_TUPAD_UTN
- **Video de demostración:** https://youtu.be/Keik9VvdpDk

## Qué necesitás

- **Python 3.11 a 3.13**, según la consigna. Las dependencias fijadas también permiten usar Python 3.14.
- **PostgreSQL 15 o superior**, instalado y en ejecución.
- **Node.js 20.19 o superior** y **pnpm 9 o superior**.
- Dos terminales: una para el backend y otra para el frontend.

Los comandos de esta guía son para **PowerShell en Windows** y parten desde la carpeta del proyecto.

## 1. Crear la base de datos

En pgAdmin, creá una base llamada **foodstore_tpi**. También podés ejecutar:

```sql
CREATE DATABASE foodstore_tpi;
```

La aplicación crea las tablas al iniciarse; la base de datos debe existir primero.

## 2. Preparar el backend

En la primera terminal:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Si todavía no existe `backend/.env`, copiá el archivo de ejemplo:

```powershell
Copy-Item .env.example .env
```

Abrí `backend/.env`, completá la contraseña de PostgreSQL y elegí una clave propia de al menos 32 caracteres:

```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/foodstore_tpi
SECRET_KEY=REEMPLAZAR_POR_UNA_CLAVE_PROPIA_DE_AL_MENOS_32_CARACTERES
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
```

Podés generar la clave con `python -c "import secrets; print(secrets.token_urlsafe(48))"`.

| Variable | Para qué sirve |
| --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL. |
| `SECRET_KEY` | Firma las sesiones de los usuarios. |
| `ALGORITHM` | Algoritmo del token: `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión en minutos. |
| `FRONTEND_ORIGIN` | Dirección del frontend permitida por CORS. |

Cargá los datos de ejemplo y arrancá la API:

```powershell
cd backend
python -m app.db.seed
python -m uvicorn app.main:app --reload
```

El seed crea **3 categorías, 8 productos y el administrador**. Podés repetirlo sin duplicar los datos; conserva el stock y las contraseñas existentes.

- Documentación de la API: http://localhost:8000/docs
- Documentación alternativa: http://localhost:8000/redoc
- Dirección base de la API: http://localhost:8000/api/v1

## 3. Preparar el frontend

En una segunda terminal, desde la carpeta del proyecto:

```powershell
cd frontend
pnpm install
```

Si todavía no existe `frontend/.env`, copialo:

```powershell
Copy-Item .env.example .env
```

Su única variable es la dirección de la API:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Comprobá la compilación e iniciá la página:

```powershell
cd frontend
pnpm build
pnpm dev
```

Abrí **http://localhost:5173**. Mantené las dos terminales abiertas. Para detener cada servicio, usá `Ctrl+C`.

## Cómo iniciarlo las próximas veces

No hace falta reinstalar ni volver a cargar el seed.

**Terminal 1 — backend:**

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

**Terminal 2 — frontend:**

```powershell
cd frontend
pnpm dev
```

## Cómo probar la aplicación

Ingresá con **usuario `admin` y contraseña `Admin1234!`** para acceder al panel. Para comprar como cliente, creá una cuenta desde **Registrarse**.

1. Buscá productos y filtrá por categoría.
2. Agregá productos al carrito, cambiá cantidades y recargá la página para comprobar que se conserva.
3. Confirmá el pedido con dirección y forma de pago: efectivo o transferencia. El pago es manual.
4. Consultá el detalle desde **Mis pedidos**. El cliente puede cancelar sus pedidos pendientes.
5. Como administrador, usá **Administración** para gestionar el catálogo, el stock y los usuarios.
6. Avanzá un pedido de **Pendiente → En preparación → Entregado**. También podés cancelarlo antes de que sea entregado: el stock se devuelve una sola vez.

## Dónde está cada cosa

| Carpeta | Contenido |
| --- | --- |
| `backend/app/core` | Configuración, base de datos, seguridad, permisos y clases comunes. |
| `backend/app/modules` | Módulos de autenticación, usuarios, categorías, productos y pedidos. |
| `backend/app/db/seed.py` | Datos de ejemplo. |
| `frontend/src/features` | Pantallas, componentes, hooks, llamadas a la API y tipos de cada módulo. |
| `frontend/src/shared` | Componentes reutilizables, layout y cliente HTTP. |
| `frontend/src/store` | Sesión y carrito con Zustand. |
| `frontend/src/routes` | Navegación y protección de pantallas por sesión y rol. |

En el backend, cada petición pasa por **Router → Service → Unit of Work → Repository → Model**. El servicio aplica las reglas y el Unit of Work confirma los cambios juntos o los revierte si algo falla. Al crear un pedido, sus líneas guardan el nombre y el precio de ese momento.

En el frontend, **TanStack Query** maneja los datos de la API; **Zustand**, la sesión y el carrito; **TanStack Form**, los formularios; y **TanStack Table**, las tablas del panel. El token viaja en una cookie HttpOnly y no se guarda en el navegador mediante JavaScript.

## Si algo no arranca

| Problema | Qué revisar |
| --- | --- |
| PowerShell bloquea `Activate.ps1` | Ejecutá `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` y volvé a activar el entorno. |
| No encuentra `fastapi` o `uvicorn` | Activá `.venv` y ejecutá `python -m pip install -r requirements.txt`. |
| No conecta a PostgreSQL | Revisá que el servicio esté iniciado, exista `foodstore_tpi` y los datos de `DATABASE_URL` sean correctos. Si la contraseña contiene `@`, escribilo como `%40` en la URL. |
| Rechaza `SECRET_KEY` | Usá una clave de al menos 32 caracteres. |
| La sesión no se mantiene | Usá `localhost` en ambas direcciones. El puerto del frontend debe coincidir con `FRONTEND_ORIGIN`; si cambia, ajustá esa variable y reiniciá el backend. |
| Un puerto está ocupado | Cerrá la instancia anterior con `Ctrl+C`. |

Para una prueba local sin PostgreSQL, podés usar `DATABASE_URL=sqlite:///./foodstore.db` en `backend/.env` y ejecutar el seed. Los datos de ambas bases son independientes. **La entrega usa PostgreSQL.**

