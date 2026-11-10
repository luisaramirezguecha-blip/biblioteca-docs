# 02 · Teoría: arquitectura MVC en capas

## ¿Qué es una arquitectura en capas?

Organizar el programa por responsabilidades y definir qué dependencias se permiten. En este proyecto el controller delega al service y este usa repository y mapper. Esto limita el impacto de los cambios, pero cambiar de base de datos puede exigir adaptar consultas, migraciones y tipos. La separación debe comprobarse en el código.

```mermaid
flowchart TB
    subgraph Cliente
        A["Angular (navegador)"]
    end
    subgraph Backend["Backend Spring Boot"]
        C["controller<br/>HTTP: rutas, validación, códigos"]
        S["service<br/>reglas de negocio"]
        R["repository<br/>acceso a datos"]
        E["entity<br/>objeto persistente"]
        M["mapper<br/>DTO ↔ Entity"]
        C --> S --> R
        S --> M
        R -. "opera con" .-> E
    end
    DB[("PostgreSQL")]
    A -- "JSON" --> C
    R --> DB
```

| Capa | Paquete | Responsabilidad | NO debe hacer |
|---|---|---|---|
| Controller | `controller` | Recibir la petición HTTP, validar (`@Valid`), llamar al service, devolver el código HTTP | Reglas de negocio, consultas a la BD |
| Service | `service`, `service.impl` | **Reglas de negocio** (copias disponibles, límite de 3, no duplicar, devolver una vez) | Saber de HTTP |
| Repository | `repository` | Leer y guardar en la base | Reglas de negocio |
| Entity | `entity` | Representar los datos persistentes | Depender de HTTP. En este ejercicio las reglas están en el service; otros diseños permiten comportamiento de dominio en entidades |
| DTO | `dto` | Datos que **entran y salen** por HTTP | Persistirse |
| Mapper | `mapper` | Convertir DTO ↔ Entity | Reglas de negocio |
| Exception | `exception` | Errores propios y su traducción a HTTP | — |
| Config | `config` | Swagger y CORS | — |

> El backend usa Spring MVC como infraestructura web y una arquitectura por capas. MVC y capas describen aspectos diferentes del diseño. La arquitectura hexagonal se presenta como evolución posible en [09-fundamentos-ingenieria-software.md](09-fundamentos-ingenieria-software.md).

## MVC: Modelo – Vista – Controlador

| Letra | En una API REST | En este proyecto |
|---|---|---|
| **M**odelo | Los datos y sus reglas | `Libro`, `Socio`, `Prestamo` (entities) + los `*Service` |
| **V**ista | Una API REST serializa representaciones en lugar de renderizar una vista HTML tradicional | JSON con `LibroResponse`, `PrestamoResponse`…; Angular es el cliente que presenta la interfaz |
| **C**ontrolador | Recibe y decide a quién llamar | `LibroController`, `SocioController`, `PrestamoController` |

## Viaje de una petición: realizar un préstamo

```mermaid
sequenceDiagram
    participant N as Angular
    participant C as PrestamoController
    participant S as PrestamoServiceImpl
    participant R as Repositories
    participant B as PostgreSQL
    N->>C: POST /api/prestamos {"libroId":2,"socioId":1}
    C->>C: @Valid CrearPrestamoRequest
    C->>S: prestar(request)
    S->>R: socio findById + libro buscarParaActualizar
    R->>B: SELECT ... FOR UPDATE (libro)
    S->>S: ¿duplicado? ¿límite de 3? ¿hay copias?
    S->>R: save(libro) y save(prestamo)
    R->>B: UPDATE libro / INSERT prestamo
    S-->>C: PrestamoResponse
    C-->>N: 201 Created + Location + JSON
```

## Dos formas de hacer la Vista: Thymeleaf y Angular

La "V" de MVC puede resolverse de dos maneras en este proyecto, usando **los mismos services**:

| | Thymeleaf (opcional) | Angular |
|---|---|---|
| Dónde se arma la pantalla | En el **servidor**: devuelve HTML listo | En el **navegador**, a partir del JSON |
| Controller | `@Controller` → nombre de plantilla (`libros`) | `@RestController` → JSON |
| Rutas | `/web/...` | `/api/...` |
| Cuándo usarlo | Probar front y back desde el inicio, sin Node | Interfaz definitiva |

Thymeleaf se enciende o apaga con `app.web.enabled` (variable `WEB_THYMELEAF`): al pasar a Angular no hace falta comentar código.

## ¿Por qué DTO y Entity son clases distintas?

| | Entity (`Libro`, `Prestamo`) | DTO (`LibroResponse`, `CrearPrestamoRequest`…) |
|---|---|---|
| Para qué | Hablar con la base | Hablar con el cliente HTTP |
| Cambia cuando | Cambia la tabla | Cambia el contrato de la API |
| Validaciones | Puede tener invariantes y restricciones de mapeo; la base también impone restricciones | Valida la entrada HTTP con `@NotBlank`, `@Size`… |
| Riesgo si se mezclan | El cliente podría fijar `id`, `ejemplaresDisponibles` o las fechas del préstamo | — |

Ejemplo: `CrearPrestamoRequest` **solo trae `libroId` y `socioId`**: el cliente no puede escribir un vencimiento a un año ni marcar el préstamo como devuelto. Y `CrearLibroRequest` **no tiene** `ejemplaresDisponibles`: no se puede crear un libro con más copias libres que totales.

## Programar contra interfaces

Los controllers dependen de las **interfaces** `LibroService`, `SocioService` y `PrestamoService`. Un contrato explícito permite sustituir la implementación si conserva el comportamiento esperado. Mockito también puede simular clases: tener una interfaz no es requisito universal para probar ni demuestra por sí solo SOLID.

## SOLID en pocas líneas

| Principio | Dónde se ve |
|---|---|
| **S**ingle Responsibility | Agrupar responsabilidades que cambian por la misma razón: catálogo (`LibroService`), personas (`SocioService`) y préstamos (`PrestamoService`) son servicios distintos |
| **O**pen/Closed | Aislar puntos de variación cuando existe una necesidad real. Editar un handler no demuestra este principio |
| **L**iskov | Una sustitución debe conservar precondiciones, resultados e invariantes del contrato |
| **I**nterface Segregation | Evitar que un cliente dependa de operaciones que no necesita |
| **D**ependency Inversion | Orientar dependencias hacia abstracciones apropiadas. Inyección por constructor es un mecanismo, no una prueba suficiente de inversión |

La secuencia anterior es simplificada: JPA puede diferir el SQL hasta el flush. El inventario de copias requiere además coordinación concurrente (el bloqueo `FOR UPDATE`). Consultar [10-atlas-diagramas-biblioteca.md](10-atlas-diagramas-biblioteca.md) para las vistas y su lectura.
