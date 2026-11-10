# 01 · El problema que resuelve el sistema de biblioteca

## La situación

Una biblioteca (de un instituto, un colegio o un barrio) lleva sus libros y préstamos en cuadernos o planillas. Con el tiempo:

- Nadie sabe con certeza **qué libros hay, cuántas copias quedan y cuáles están prestados**.
- Los socios preguntan en el mesón si "está disponible" y alguien tiene que ir a mirar la estantería.
- Se prestan libros sin revisar si el socio ya tiene muchos, y **no se sabe quién tiene qué ni cuándo debía devolverlo**.
- Una devolución anotada dos veces (o ninguna) deja el inventario descuadrado.

## La solución: un sistema de información de biblioteca

El sistema centraliza tres cosas y las deja **consistentes entre sí**:

| Concepto | Significado |
|---|---|
| **Libro** | Un título del catálogo con su número de copias (`ejemplaresTotales`) y cuántas están libres (`ejemplaresDisponibles`) |
| **Socio** | Persona inscrita que puede pedir libros |
| **Préstamo** | Un socio se lleva un libro por 14 días; queda `ACTIVO` hasta que lo devuelve (`DEVUELTO`) |

El usuario puede **buscar libros**, **consultar su disponibilidad**, **realizar préstamos** y **registrar devoluciones**.

### Las reglas que dan valor al sistema

1. **Sin copias no hay préstamo:** si `ejemplaresDisponibles` es 0, el préstamo se rechaza con **409**.
2. **Máximo 3 préstamos activos por socio:** el cuarto se rechaza con **409**. Obliga a devolver antes de pedir más.
3. **Un socio no tiene el mismo libro dos veces:** pedirlo de nuevo sin devolverlo da **409**.
4. **Una devolución se registra una sola vez:** devolver dos veces daría **409** (si no, el inventario sumaría copias que no existen).
5. **El plazo es de 14 días:** el vencimiento lo calcula el sistema; un préstamo activo con fecha pasada se muestra como **vencido**.

## Qué construimos

| Pieza | Tecnología | Rol |
|---|---|---|
| Base de datos | PostgreSQL 18 + Flyway | Guarda libros, socios y préstamos |
| Backend | Java 21 + Spring Boot 3.5 (MVC en capas) | API REST y reglas de negocio |
| Frontend | Angular 21 (signals, sin librerías extra) | Catálogo con búsqueda y pantalla de préstamos |

## Alcance

**Incluye:** buscar libros (por título, autor, ISBN o categoría), filtrar por disponibles, consultar disponibilidad, agregar libros, inscribir socios (API), prestar, devolver, listar préstamos por socio, validaciones y errores uniformes (`ApiError`).
**No incluye:** login y roles (quien usa el sistema elige un socio en la cabecera), multas, reservas, renovaciones, edición o baja de libros, ni notificaciones.

## Datos de un libro

| Campo | Obligatorio | Regla |
|---|---|---|
| `titulo` | Sí | máx. 150 caracteres |
| `autor` | Sí | máx. 100 |
| `isbn` | Sí | 10 a 17 caracteres (dígitos, `X` y guiones); **único** |
| `categoria` | Sí | máx. 50 |
| `anioPublicacion` | Sí | entre 1000 y 2100 |
| `ejemplares` (al crear) | Sí | entre 1 y 100 |
| `ejemplaresTotales`, `ejemplaresDisponibles` | (los asigna el sistema) | al crear, todas las copias están disponibles |
| `creadoEn`, `actualizadoEn` | (automáticas) | las maneja JPA |

## Puntos de decisión

- ¿Quién decide las fechas de un préstamo? → **El sistema**: `fechaPrestamo` es hoy y `fechaVencimiento` es hoy + 14 días. El cliente solo envía `libroId` y `socioId`.
- ¿Qué pasa si dos socios piden la última copia a la vez? → El libro se lee con **bloqueo de fila** (`SELECT ... FOR UPDATE`): el segundo espera y recibe **409**.
- ¿Y un préstamo vencido bloquea al socio? → **No** en este alcance: solo se marca como vencido. Es una decisión que se puede cambiar con una regla nueva en el service.
