# 04 · UML de clases

Los diagramas están en Mermaid (en VS Code: extensión *Markdown Preview Mermaid Support*, `Ctrl+Shift+V`).

## Backend

```mermaid
classDiagram
    direction LR
    class PrestamoController {
        -PrestamoService service
        +listar(req, socioId, estado) List~PrestamoResponse~
        +obtener(req, id) PrestamoResponse
        +prestar(req, request) ResponseEntity
        +devolver(req, id) PrestamoResponse
    }
    class PrestamoService {
        <<interface>>
        +listar(socioId, estado) List~PrestamoResponse~
        +obtener(id) PrestamoResponse
        +prestar(request) PrestamoResponse
        +devolver(id) PrestamoResponse
    }
    class PrestamoServiceImpl {
        ~LIMITE_PRESTAMOS_ACTIVOS = 3
        ~DIAS_PRESTAMO = 14
        -PrestamoRepository prestamoRepository
        -LibroRepository libroRepository
        -SocioRepository socioRepository
        -PrestamoMapper mapper
    }
    class PrestamoMapper {
        +aRespuesta(Prestamo) PrestamoResponse
    }
    class PrestamoRepository {
        <<interface>>
        +countBySocioIdAndEstado(socioId, estado) long
        +existsBySocioIdAndLibroIdAndEstado(...) boolean
        +findFirstByLibroIdAndEstadoOrderByFechaVencimientoAsc(...) Optional
    }
    class LibroRepository {
        <<interface>>
        +existsByIsbn(isbn) boolean
        +buscar(texto, soloDisponibles) List~Libro~
        +buscarParaActualizar(id) Optional~Libro~
    }
    class SocioRepository {
        <<interface>>
        +existsByEmail(email) boolean
    }
    class JpaRepository {
        <<interface>>
    }
    class Libro {
        -Long id
        -String titulo
        -String autor
        -String isbn
        -String categoria
        -Integer anioPublicacion
        -Integer ejemplaresTotales
        -Integer ejemplaresDisponibles
        -LocalDateTime creadoEn
        -LocalDateTime actualizadoEn
    }
    class Socio {
        -Long id
        -String nombre
        -String email
        -LocalDateTime creadoEn
    }
    class Prestamo {
        -Long id
        -LocalDate fechaPrestamo
        -LocalDate fechaVencimiento
        -LocalDate fechaDevolucion
        -EstadoPrestamo estado
    }
    class EstadoPrestamo {
        <<enumeration>>
        ACTIVO
        DEVUELTO
    }
    PrestamoController --> PrestamoService
    PrestamoServiceImpl ..|> PrestamoService
    PrestamoServiceImpl --> PrestamoRepository
    PrestamoServiceImpl --> LibroRepository
    PrestamoServiceImpl --> SocioRepository
    PrestamoServiceImpl --> PrestamoMapper
    PrestamoRepository --|> JpaRepository
    LibroRepository --|> JpaRepository
    SocioRepository --|> JpaRepository
    Prestamo "*" --> "1" Libro
    Prestamo "*" --> "1" Socio
    Prestamo --> EstadoPrestamo
    PrestamoMapper ..> Prestamo
```

Vista parcial centrada en **préstamos**. `LibroController`/`LibroService`/`LibroServiceImpl`/`LibroMapper` y `SocioController`/`SocioService`/`SocioServiceImpl`/`SocioMapper` siguen exactamente el mismo esquema controller → service (interface + impl) → repository + mapper.

```mermaid
classDiagram
    direction LR
    class LibroController {
        -LibroService service
        +buscar(req, q, soloDisponibles) List~LibroResponse~
        +obtener(req, id) LibroResponse
        +disponibilidad(req, id) DisponibilidadResponse
        +crear(req, request) ResponseEntity
    }
    class LibroService {
        <<interface>>
        +buscar(texto, soloDisponibles) List~LibroResponse~
        +obtener(id) LibroResponse
        +consultarDisponibilidad(id) DisponibilidadResponse
        +crear(request) LibroResponse
    }
    class LibroServiceImpl {
        -LibroRepository libroRepository
        -PrestamoRepository prestamoRepository
        -LibroMapper mapper
    }
    class LibroMapper {
        +aEntidad(CrearLibroRequest) Libro
        +aRespuesta(Libro) LibroResponse
        +aDisponibilidad(Libro, LocalDate) DisponibilidadResponse
    }
    LibroController --> LibroService
    LibroServiceImpl ..|> LibroService
    LibroServiceImpl --> LibroMapper
```

## Controllers web (Thymeleaf, opcional)

```mermaid
classDiagram
    direction LR
    class LibroWebController {
        <<Controller>>
        +catalogo(q, soloDisponibles, socioId, model) String
        +disponibilidad(id, socioId, model, flash) String
    }
    class PrestamoWebController {
        <<Controller>>
        +prestamos(socioId, model) String
        +prestar(libroId, socioId, flash) String
        +devolver(id, socioId, flash) String
    }
    class LibroService {
        <<interface>>
    }
    class PrestamoService {
        <<interface>>
    }
    class SocioService {
        <<interface>>
    }
    LibroWebController --> LibroService
    LibroWebController --> SocioService
    PrestamoWebController --> PrestamoService
    PrestamoWebController --> SocioService
```

Usan los **mismos services** que los controllers REST; devuelven el nombre de una plantilla (`libros`, `prestamos`, `disponibilidad`) o una redirección.

## DTO

```mermaid
classDiagram
    class CrearLibroRequest {
        <<record>>
        titulo
        autor
        isbn
        categoria
        anioPublicacion
        ejemplares
    }
    class CrearSocioRequest {
        <<record>>
        nombre
        email
    }
    class CrearPrestamoRequest {
        <<record>>
        libroId
        socioId
    }
    class LibroResponse {
        <<record>>
        id
        titulo
        autor
        isbn
        categoria
        anioPublicacion
        ejemplaresTotales
        ejemplaresDisponibles
        disponible
        creadoEn
    }
    class DisponibilidadResponse {
        <<record>>
        libroId
        titulo
        ejemplaresTotales
        ejemplaresDisponibles
        disponible
        proximaDevolucion
    }
    class SocioResponse {
        <<record>>
        id
        nombre
        email
        creadoEn
    }
    class PrestamoResponse {
        <<record>>
        id
        libroId
        tituloLibro
        socioId
        nombreSocio
        fechaPrestamo
        fechaVencimiento
        fechaDevolucion
        estado
        vencido
    }
    class ApiError {
        <<record>>
        fecha
        status
        error
        mensaje
        detalles
    }
```

## Excepciones

```mermaid
classDiagram
    RuntimeException <|-- RecursoNoEncontradoException
    RuntimeException <|-- LibroSinEjemplaresException
    RuntimeException <|-- LimitePrestamosExcedidoException
    RuntimeException <|-- PrestamoDuplicadoException
    RuntimeException <|-- PrestamoYaDevueltoException
    RuntimeException <|-- DatoDuplicadoException
    class GlobalExceptionHandler {
        <<RestControllerAdvice>>
        +noEncontrado() 404
        +conflicto() 409
        +validacion() 400
        +solicitudMalFormada() 400
        +inesperado() 500
    }
    GlobalExceptionHandler ..> ApiError
```

## Frontend (Angular)

```mermaid
classDiagram
    direction LR
    class App {
        -SociosStore socios
        +cambiarSocio(evento)
    }
    class CatalogoPage {
        -CatalogoStore store
        -PrestamosStore prestamos
        +consultar(libro)
        +prestar(libro)
        +guardar(request)
    }
    class PrestamosPage {
        -PrestamosStore store
        +devolver(prestamo)
    }
    class LibroCard {
        <<input>> libro, disponibilidad
        <<output>> prestar, consultar
    }
    class LibroForm {
        <<input>> guardando
        <<output>> guardar, cancelar
    }
    class PrestamoCard {
        <<input>> prestamo
        <<output>> devolver
    }
    class CatalogoStore {
        +libros signal
        +resumen computed
        +buscar()
        +cargar()
        +consultarDisponibilidad() Observable
        +crear() Observable
    }
    class PrestamosStore {
        +prestamos signal
        +activos computed
        +historial computed
        +resumen computed
        +cargar(socioId)
        +prestar() Observable
        +devolver() Observable
    }
    class SociosStore {
        +socios signal
        +socioActual computed
        +seleccionar(id)
    }
    class LibroApi
    class PrestamoApi
    class SocioApi
    class ToastService
    class errorInterceptor
    App --> SociosStore
    CatalogoPage --> CatalogoStore
    CatalogoPage --> PrestamosStore
    CatalogoPage --> SociosStore
    CatalogoPage *-- LibroCard
    CatalogoPage *-- LibroForm
    PrestamosPage --> PrestamosStore
    PrestamosPage *-- PrestamoCard
    CatalogoStore --> LibroApi
    PrestamosStore --> PrestamoApi
    SociosStore --> SocioApi
    CatalogoStore --> ToastService
    PrestamosStore --> ToastService
    LibroApi ..> errorInterceptor : HttpClient
```
