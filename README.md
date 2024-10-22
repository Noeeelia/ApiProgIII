# API Rest para Gestión de Reclamos
Este repositorio contiene una API Rest para la gestión de reclamos en un sistema de concesionaria. Los usuarios pueden ser clientes, empleados o administradores, y cada uno tiene roles y permisos específicos.

## Introducción
1. Descripción
2. Características
3. Instalación
4. Uso
- Autenticación
- Endpoints para Clientes
- Endpoints para Empleados
- Endpoints para Administradores
5. Tecnologías
6. Contribuciones

## Descripción
Esta API permite gestionar reclamos en una concesionaria, brindando una solución para clientes, empleados y administradores. Los usuarios pueden registrarse, iniciar sesión, crear y actualizar reclamos, y consultar su estado. Los empleados gestionan los reclamos y los administradores controlan el sistema.

## Características
- Roles: Cliente, Empleado, Administrador.
- Autenticación: Registro e inicio de sesión con autenticación JWT.
- Gestión de Reclamos: Crear, actualizar, listar y finalizar reclamos.
- Notificaciones: Se envían correos electrónicos para ciertos eventos, como la creación de un reclamo de usuarios.
  
## Instalación
1- Clonar el repositorio:
```bash
git clone https://github.com/usuario/repositorio.git
cd repositorio
```
2. Instalar las dependencias:
```bash
npm install
```
3. Configurar variables de entorno (crear un archivo .env e incluye tus valores):
```bash
PORT=3001
DB_URL=your_database_url
JWT_SECRET=your_jwt_secret
```
4. Iniciar el servidor
```bash
npm run dev
```
## Uso
### Autenticación
Registro de Usuarios
- Método: POST 
```bash
/api/v1/auth/register
```
Body JSON:
```bash
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correoElectronico": "juan@example.com",
  "contrasenia": "123456",
  "idUsuarioTipo": 1,
  "imagen": "imagen.jpg"
```
- Roles:
  - 1 = Cliente,
  - 2 = Empleado,
  - 3 = Administrador
- Nota: Usar correos reales para recibir notificaciones por mail (Clientes)

Inicio de sesión
- Método: POST
```bash
/api/v1/auth/login
```
Body JSON:
```bash
{
  "correoElectronico": "fulanito@gmail.com",
  "contrasenia": "123456"
}
```
Obtener perfil de usuarios
- Método: GET
```bash
/api/v1/auth/perfil
```
Actualizar perfil de usuario
- Método: PATCH
```bash
/api/v1/auth/actualizarPerfil
```
Body JSON:
```bash
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez González",
  "correoElectronico": "juan@example.com",
  "contrasenia": "123456",
  "imagen": "imagen.jpg"
}
```
Cerrar sesión
- Método: POST
```bash
/api/v1/auth/logout
```

### Endpoints para Clientes
Crear un reclamo
- Método: POST
```bash
/api/v1/reclamos/crear
Authorization: Bearer <token_jwt>
```
Body JSON:
```bash
{
  "asunto": "Problema con el producto",
  "descripcion": "Descripción del problema",
  "idReclamoTipo": 3
}
```
Listar reclamos del usuario
- Método: GET
```bash
/api/v1/reclamos/misReclamos
Authorization: Bearer <token_jwt>
```
Consultar estado de un reclamo
- Método: GET
```bash
/api/v1/reclamos/estado/idReclamo
Authorization: Bearer <token_jwt>
```
Cancelar un reclamo "Creado"
- Método: PATCH
```bash
/api/v1/reclamos/cancelar/idReclamo
Authorization: Bearer <token_jwt>
```

### Endpoints para Empleados
Listar reclamos 
- Método: GET
```bash
/api/v1/empleados/reclamos/listar
Authorization: Bearer <token_jwt>
```
Atender un reclamo
- Método: PATCH
```bash
/api/v1/empleados/reclamos/atender/idReclamo
Authorization: Bearer <token_jwt>
```
Body JSON:
```bash
{
  "nuevoEstado": "En proceso"
}
```
Finalizar un reclamo
- Método: PATCH
```bash
/api/v1/empleados/reclamos/finalizar/idReclamo
Authorization: Bearer <token_jwt>
```
Body JSON:
```bash
{
  "nuevoEstado": "Finalizado"
}
```

### Endpoints para Administradores
Crear tipo de reclamo
- Método: POST
```bash
/api/v1/administradores/tiposReclamos/crear
Authorization: Bearer <token_jwt>
```
Body JSON:
```bash
{
  "descripcion": "Reclamo por facturación incorrecta"
}
```
Crear Oficina
- Método: POST
```bash
/api/v1/administradores/oficinas/crear
Authorization: Bearer <token_jwt>
```
Body JSON:
```bash
{
  "nombre": "Oficina de Facturación",
  "idReclamoTipo": 1
}
```
Crear Empleado
- Método: POST
```bash
/api/v1/administradores/empleados/crear
Authorization: Bearer <token_jwt>
```
Body JSON:
```bash
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correoElectronico": "juan@example.com",
  "contrasenia": "123456",
  "idOficina": 1
}
```
Asignar empleado a oficina
- Método: POST
```bash
/api/v1/administradores/oficinas/:idOficina/empleados
Authorization: Bearer <token_jwt>
```
Body JSON:
```bash
{
  "idEmpledo": 1
}
```
Quitar empleado de una oficina
- Método: DELETE
```bash
/api/v1/administradores/oficinas/1/empleados/2
Authorization: Bearer <token_jwt>
```
- Reemplaza 1 con el ID de la oficina y 2 con el ID del empleado.

Consultar estadisticas
- Método: GET
```bash
/api/v1/administradores/estadisticas
Authorization: Bearer <token_jwt>
```
Consultar estadisticas
- Método: GET
```bash
/api/v1/administradores/informes
Authorization: Bearer <token_jwt>
```
Nota: pegar la url en el navegador para descargar el informe.
- URL: http://localhost:3001/api/v1/administradores/informes

## Tecnologías
- Node.js
- Express
- MySQL
- JWT para autenticación
- Nodemailer y Handlebars para envio de correos.

## Contribuciones
Las contribuciones son bienvenidas. Para comenzar, haz un fork del repositorio y crea un pull request con tus cambios.

### Octubre 2024 - Córdoba, Argentina
