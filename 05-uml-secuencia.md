# 05 · UML de secuencia

Cada diagrama muestra **quién llama a quién y en qué orden**.

## 1. Buscar libros (cargar el catálogo)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant P as CatalogoPage
    participant ST as CatalogoStore
    participant C as LibroController
    participant S as LibroServiceImpl
    participant R as LibroRepository
    U->>P: escribe "clean" en el buscador
    P->>P: espera 300 ms (debounce)
    P->>ST: buscar("clean", false)
    ST->>C: GET /api/libros?q=clean&soloDisponibles=false
    C->>S: buscar("clean", false)
    S->>R: buscar("clean", false)
    R-->>S: List<Libro>
    S-->>C: List<LibroResponse>
    C-->>ST: 200 + JSON
    ST->>ST: libros.set(...) → resumen se recalcula
    ST-->>P: la vista se actualiza (tarjetas)
```

## 2. Consultar disponibilidad

```mermaid
sequenceDiagram
    actor U as Usuario
    participant P as CatalogoPage
    participant ST as CatalogoStore
    participant C as LibroController
    participant S as LibroServiceImpl
    participant R as LibroRepository
    participant PR as PrestamoRepository
    U->>P: "Ver disponibilidad" en una tarjeta
    P->>ST: consultarDisponibilidad(id)
    ST->>C: GET /api/libros/{id}/disponibilidad
    C->>S: consultarDisponibilidad(id)
    S->>R: findById(id)
    alt ejemplaresDisponibles == 0
        S->>PR: findFirst...OrderByFechaVencimientoAsc(id, ACTIVO)
        PR-->>S: préstamo que vence primero
    else hay copias libres
        S->>S: no consulta préstamos
    end
    S-->>C: DisponibilidadResponse
    C-->>ST: 200 + JSON
    ST-->>P: la tarjeta muestra "Puedes pedirlo ahora" o "La próxima vence el …"
```

## 3. Agregar un libro

```mermaid
sequenceDiagram
    actor U as Usuario
    participant P as CatalogoPage
    participant ST as CatalogoStore
    participant C as LibroController
    participant S as LibroServiceImpl
    participant M as LibroMapper
    participant R as LibroRepository
    U->>P: "+ Nuevo libro" → completa el formulario
    P->>ST: crear(request)
    ST->>C: POST /api/libros
    C->>C: @Valid CrearLibroRequest
    C->>S: crear(request)
    S->>R: existsByIsbn(isbn)
    S->>M: aEntidad(request) (todas las copias disponibles)
    S->>R: save(libro)
    R-->>S: Libro con id
    S-->>C: LibroResponse
    C-->>ST: 201 Created + Location
    ST->>C: GET /api/libros (refrescar)
    ST-->>P: emite → se cierra el formulario
```

## 4. Realizar un préstamo — camino feliz

```mermaid
sequenceDiagram
    actor U as Usuario
    participant P as CatalogoPage
    participant ST as PrestamosStore
    participant C as PrestamoController
    participant S as PrestamoServiceImpl
    participant R as Repositories
    U->>P: "Prestar" en un libro (con el socio elegido en la cabecera)
    P->>ST: prestar(libroId, socioId)
    ST->>C: POST /api/prestamos {"libroId":2,"socioId":1}
    C->>C: @Valid CrearPrestamoRequest
    C->>S: prestar(request)
    S->>R: socioRepository.findById(1)
    S->>R: libroRepository.buscarParaActualizar(2) (FOR UPDATE)
    S->>R: ¿ya lo tiene? exists... → no ✔
    S->>R: count...(socio, ACTIVO) → 1 (< 3) ✔
    S->>S: ejemplaresDisponibles > 0 ✔
    S->>R: save(libro con una copia menos)
    S->>R: save(prestamo ACTIVO, vence en 14 días)
    S-->>C: PrestamoResponse
    C-->>ST: 201 Created + Location
    ST->>C: GET /api/prestamos?socioId=1 (refrescar)
    ST-->>P: emite → el catálogo se recarga con una copia menos
```

## 4B. Realizar un préstamo desde la vista Thymeleaf (opcional)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant N as Navegador
    participant W as PrestamoWebController
    participant S as PrestamoServiceImpl
    participant T as Plantilla libros.html
    U->>N: pulsa "Prestar" (formulario HTML)
    N->>W: POST /web/prestamos (libroId, socioId)
    W->>S: prestar(request)
    alt reglas cumplidas
        S-->>W: PrestamoResponse
        W->>W: flash "exito"
    else regla rechazada (sin copias, límite o duplicado)
        S-->>W: excepción de negocio
        W->>W: catch → flash "error"
    end
    W-->>N: 302 redirect:/web/libros?socioId=1
    N->>W: GET /web/libros?socioId=1
    W->>T: Model (libros, socios, exito/error)
    T-->>N: HTML con el mensaje y la disponibilidad actualizada
```

Post/Redirect/Get: tras el POST se responde con una redirección, por lo que refrescar la página no repite el préstamo. Las reglas son las mismas que en la API (secuencias 4 y 5).

## 5. Realizar un préstamo — rechazo con 409

```mermaid
sequenceDiagram
    actor U as Usuario
    participant P as CatalogoPage
    participant ST as PrestamosStore
    participant C as PrestamoController
    participant S as PrestamoServiceImpl
    participant R as Repositories
    participant H as GlobalExceptionHandler
    U->>P: "Prestar" un libro cuando el socio ya tiene 3 préstamos
    P->>ST: prestar(libroId, socioId)
    ST->>C: POST /api/prestamos
    C->>S: prestar(request)
    S->>R: findById + buscarParaActualizar
    S->>R: exists... → no
    S->>R: count...(socio, ACTIVO) → 3
    S->>S: warn "loan limit reached"
    S-->>C: LimitePrestamosExcedidoException
    C->>H: (Spring deriva la excepción)
    H-->>ST: 409 ApiError {mensaje: "El socio ya tiene el máximo de 3 préstamos activos…"}
    ST-->>U: toast de error; el catálogo no cambia
```

> El mismo camino (409) ocurre con `PrestamoDuplicadoException` (ya tiene ese libro) y con `LibroSinEjemplaresException` (no quedan copias).

## 6. Devolver un libro

```mermaid
sequenceDiagram
    actor U as Usuario
    participant P as PrestamosPage
    participant ST as PrestamosStore
    participant C as PrestamoController
    participant S as PrestamoServiceImpl
    participant R as Repositories
    U->>P: "Devolver" en un préstamo activo
    P->>ST: devolver(id)
    ST->>C: PATCH /api/prestamos/{id}/devolucion
    C->>S: devolver(id)
    S->>R: findConDetalleById(id)
    alt el préstamo ya está DEVUELTO
        S-->>C: PrestamoYaDevueltoException
        C-->>ST: 409 ApiError
        ST-->>U: toast con el mensaje
    else está ACTIVO
        S->>R: libroRepository.buscarParaActualizar(libroId)
        S->>R: save(libro con una copia más)
        S->>R: save(prestamo DEVUELTO, fechaDevolucion = hoy)
        S-->>C: PrestamoResponse
        C-->>ST: 200 OK
        ST->>C: GET /api/prestamos?socioId=… (refrescar)
        ST-->>P: el préstamo pasa al historial
    end
```

## 7. Arranque del backend

```mermaid
sequenceDiagram
    participant J as JVM
    participant SB as Spring Boot
    participant F as Flyway
    participant DB as PostgreSQL
    participant H as Hibernate
    J->>SB: main() → BibliotecaApplication
    SB->>DB: abre conexión (DB_HOST, DB_USER…)
    SB->>F: migrate()
    F->>DB: V1 crear tablas libro, socio y prestamo, V2 datos de ejemplo
    SB->>H: ddl-auto: validate (¿las tablas coinciden con las entities?)
    SB->>SB: crea beans (controllers, services, repositories, mappers)
    SB-->>J: Tomcat escuchando en :8084
```
