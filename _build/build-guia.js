// Genera docs/GUIA-COMPLETA-PASO-A-PASO.md y docs/08-guia-angular-paso-a-paso.md leyendo los bloques de código
// de los archivos REALES de biblioteca-backend y biblioteca-frontend.
// Uso:  node docs/_build/build-guia.js          (genera)
//       node docs/_build/build-guia.js --check  (verifica que las guías coinciden con los archivos)
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..', '..');
const src = path.join(raiz, 'biblioteca-backend', 'src');
const salida = path.join(raiz, 'docs', 'GUIA-COMPLETA-PASO-A-PASO.md');
const plantilla = fs.readFileSync(path.join(__dirname, 'guia.template.md'), 'utf8');
const salidaNg = path.join(raiz, 'docs', '08-guia-angular-paso-a-paso.md');
const plantillaNg = fs.readFileSync(path.join(__dirname, 'guia-angular.template.md'), 'utf8');

const leer = (ruta) => fs.readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n').replace(/\n$/, '');

const M = 'main/java/cl/ipss/biblioteca/';
const T = 'test/java/cl/ipss/biblioteca/';

/* paso -> archivos. Cada uno: n (número), ruta, tipo, teoria, expl */
const archivos = {
  2: [
    { n: '2.1', ruta: M + 'enums/EstadoPrestamo.java', tipo: 'enum',
      teoria: 'Un **enum** es un conjunto **cerrado** de valores constantes. Evita "strings mágicos" como `"activo"` o `"Activo "`: el compilador solo acepta valores que existen.',
      expl: 'Un préstamo está `ACTIVO` mientras el libro sigue con el socio y pasa a `DEVUELTO` al registrar la devolución. Es el único estado que necesita el negocio: la **disponibilidad** de un libro no es un enum, es un número (`ejemplaresDisponibles`). Si el cliente envía otro valor (`?estado=PERDIDO`), Spring no puede convertirlo y el handler responde **400**.' },
    { n: '2.2', ruta: M + 'entity/Libro.java', tipo: 'class',
      teoria: 'Una **entity** es una clase cuyas instancias se guardan como filas de una tabla (JPA). Debe ser un **JavaBean**: constructor vacío + getters/setters. **Sin Lombok**, los escribimos a mano. Solo ponemos setters de lo que realmente se modifica: el `id` y las fechas de auditoría los maneja JPA.',
      expl: '- `@Entity` y `@Table(name = "libro")`: la clase es la tabla `libro`.\n- `@Id @GeneratedValue(strategy = IDENTITY)`: el `id` lo genera la base (columna `GENERATED ALWAYS AS IDENTITY`).\n- `@Column(nullable, length, unique)`: refleja las restricciones de la tabla; Hibernate las **valida** al arrancar.\n- `@Column(name = "anio_publicacion")`: mapea el nombre `camelCase` al `snake_case` de la columna.\n- **`ejemplaresTotales` y `ejemplaresDisponibles`**: el catálogo guarda cuántas copias hay y cuántas están libres. La disponibilidad se consulta y se actualiza con estos dos números.\n- `updatable = false` en `creadoEn`: la fecha de creación nunca cambia.\n- `@PrePersist` / `@PreUpdate`: JPA los llama justo antes del INSERT / UPDATE para fijar las fechas.\n- Constructor vacío: JPA lo exige para crear la entidad al leer de la base.' },
    { n: '2.3', ruta: M + 'entity/Socio.java', tipo: 'class',
      teoria: 'Otra **entity**. Un **socio** es la persona inscrita en la biblioteca. No es un usuario con clave: el sistema no tiene login (igual que el proyecto de referencia).',
      expl: '- `unique = true` en `email`: no puede haber dos socios con el mismo correo (la tabla lo repite con `UNIQUE`).\n- No hay `@PreUpdate` porque un socio no se edita en este alcance; solo `@PrePersist` para `creadoEn`.' },
    { n: '2.4', ruta: M + 'entity/Prestamo.java', tipo: 'class',
      teoria: 'Una entity con **relaciones**. `@ManyToOne` dice "muchos préstamos pertenecen a un libro (y a un socio)". En la tabla es una **clave foránea** (`libro_id`, `socio_id`). `FetchType.LAZY` significa que el libro o el socio **se leen de la base solo cuando se piden**.',
      expl: '- `@ManyToOne(fetch = LAZY, optional = false)` + `@JoinColumn(name = "libro_id")`: relación obligatoria con el libro.\n- `fechaPrestamo`, `fechaVencimiento` y `fechaDevolucion` son `LocalDate` (solo fecha, sin hora). `fechaDevolucion` es `null` mientras el préstamo esté activo.\n- `@Enumerated(EnumType.STRING)`: guarda `"ACTIVO"` y no el número 0.\n- Como la relación es `LAZY` y `open-in-view: false`, el mapper debe ejecutarse **dentro de la transacción del service** (por eso el service lo llama antes de terminar).' },
    { n: '2.5', ruta: M + 'repository/LibroRepository.java', tipo: 'interface',
      teoria: 'Un **repository** es la capa de acceso a datos. Es una **interface**: tú declaras qué quieres y **Spring Data genera la implementación**. Los *métodos derivados* se construyen leyendo el nombre del método; para consultas más complejas se escribe **JPQL** con `@Query`.',
      expl: '- `extends JpaRepository<Libro, Long>`: hereda `save`, `findById`, `findAll`, `deleteById`, `existsById`…\n- `existsByIsbn`: método derivado → `SELECT ... WHERE isbn = ?`. Evita crear dos libros con el mismo ISBN.\n- **`buscar`**: consulta **JPQL** (texto entre `"""`) que busca el texto en título, autor, ISBN y categoría con `like` y `lower(...)` (sin distinguir mayúsculas). `:soloDisponibles = false or l.ejemplaresDisponibles > 0` activa o desactiva el filtro. El texto nunca llega `null`: el service lo cambia por `""`.\n- **`buscarParaActualizar`**: `@Lock(PESSIMISTIC_WRITE)` genera `SELECT ... FOR UPDATE`. Bloquea la fila del libro hasta que termina la transacción, así **dos préstamos simultáneos no pueden gastar la misma última copia**.' },
    { n: '2.6', ruta: M + 'repository/SocioRepository.java', tipo: 'interface',
      teoria: 'Un repository mínimo: solo agrega lo que el negocio necesita además del CRUD heredado.',
      expl: '`existsByEmail` sirve para rechazar un correo repetido con **409** antes de intentar guardar.' },
    { n: '2.7', ruta: M + 'repository/PrestamoRepository.java', tipo: 'interface',
      teoria: 'Los **métodos derivados** pueden combinar varias propiedades con `And`, ordenar con `OrderBy` y recorrer relaciones (`SocioId` = `socio.id`). `@EntityGraph` indica qué relaciones LAZY deben cargarse **en la misma consulta**.',
      expl: '- `countBySocioIdAndEstado`: cuántos préstamos activos tiene un socio → regla del **límite de 3**.\n- `existsBySocioIdAndLibroIdAndEstado`: ¿ya tiene prestado este libro? → regla del **duplicado**.\n- `findFirstByLibroIdAndEstadoOrderByFechaVencimientoAsc`: el préstamo activo que vence primero → dice **cuándo vuelve la próxima copia**.\n- `findAllByOrderByIdDesc` / `findBySocioIdOrderByIdDesc` / `findConDetalleById` con `@EntityGraph(attributePaths = {"libro", "socio"})`: traen libro y socio juntos (sin una consulta extra por cada fila).' },
  ],
  3: [
    { n: '3.1', ruta: M + 'dto/CrearLibroRequest.java', tipo: 'record',
      teoria: 'Un **record** es una clase **inmutable** que Java completa por ti (constructor, getters con el nombre del campo, `equals`, `toString`). Ideal para DTO. Las anotaciones de **Bean Validation** (`@NotBlank`, `@Size`, `@Pattern`…) declaran las reglas que el controller aplica con `@Valid`.',
      expl: '- `@NotBlank`: no nulo, no vacío y no solo espacios. `@Size(max = 150)`: igual que `VARCHAR(150)`.\n- `@Pattern` en `isbn`: 10 a 17 caracteres entre dígitos, `X` y guiones.\n- `@NotNull` + `@Min` / `@Max` en `anioPublicacion` y `ejemplares`: obligatorios y dentro de un rango.\n- **No hay `ejemplaresDisponibles`**: el cliente indica cuántas copias llegan y el sistema las deja **todas disponibles**.\n- El `message` es el texto que verá el usuario en el 400.' },
    { n: '3.2', ruta: M + 'dto/CrearSocioRequest.java', tipo: 'record',
      teoria: 'Un DTO distinto por operación: cada una declara **exactamente** los datos que acepta.',
      expl: '`@Email` valida el formato del correo. Nombre y correo son obligatorios.' },
    { n: '3.3', ruta: M + 'dto/CrearPrestamoRequest.java', tipo: 'record',
      teoria: 'El DTO de **un préstamo** solo lleva **referencias** (ids), no datos copiados del libro o del socio.',
      expl: '`@NotNull` en ambos ids evita que llegue `{}`. **No hay fechas ni estado**: el sistema pone la fecha de hoy, el vencimiento a 14 días y el estado `ACTIVO`. El cliente no decide esas cosas.' },
    { n: '3.4', ruta: M + 'dto/LibroResponse.java', tipo: 'record',
      teoria: 'El DTO de **salida**: lo que se serializa a JSON hacia Angular. Es la "Vista" de MVC en una API REST.',
      expl: 'Incluye `disponible` (un `boolean` calculado: hay al menos una copia libre) para que Angular no repita esa cuenta. Nunca se devuelve la entity directamente: así la API no queda atada a la tabla.' },
    { n: '3.5', ruta: M + 'dto/DisponibilidadResponse.java', tipo: 'record',
      teoria: 'Un DTO **hecho a la medida de una consulta**: responde exactamente a "¿puedo pedir este libro?".',
      expl: '`proximaDevolucion` es `null` si hay copias libres; si no queda ninguna, es el vencimiento del préstamo activo que vence primero.' },
    { n: '3.6', ruta: M + 'dto/SocioResponse.java', tipo: 'record',
      teoria: 'DTO de salida de un socio.',
      expl: 'Solo expone lo necesario: `id`, `nombre`, `email` y `creadoEn`.' },
    { n: '3.7', ruta: M + 'dto/PrestamoResponse.java', tipo: 'record',
      teoria: 'Un DTO puede **aplanar** relaciones: en lugar de anidar el libro y el socio completos, entrega sus ids y los textos que la pantalla necesita.',
      expl: '`tituloLibro` y `nombreSocio` evitan que Angular tenga que pedir cada libro aparte. `vencido` es un dato **calculado** por el mapper: préstamo `ACTIVO` con la fecha de vencimiento ya pasada.' },
    { n: '3.8', ruta: M + 'exception/RecursoNoEncontradoException.java', tipo: 'class',
      teoria: 'Una **excepción propia** representa un error de negocio con nombre. Extiende `RuntimeException` (no obliga a `try/catch`). **Siempre** declara `serialVersionUID`: sin él, Eclipse muestra una advertencia.',
      expl: 'Una sola excepción para "no existe el libro / socio / préstamo": recibe el nombre del recurso y el id, y arma el mensaje (`No existe un libro con id 99`). El handler la traduce a **404**.' },
    { n: '3.9', ruta: M + 'exception/LibroSinEjemplaresException.java', tipo: 'class',
      teoria: 'Excepción de negocio: modela la regla **"sin copias no hay préstamo"**.',
      expl: 'Se lanza al prestar un libro cuyas copias están todas prestadas. Recibe el título para armar un mensaje claro. El handler la traduce a **409 Conflict**.' },
    { n: '3.10', ruta: M + 'exception/LimitePrestamosExcedidoException.java', tipo: 'class',
      teoria: 'Excepción de negocio: modela el **límite de préstamos por socio**.',
      expl: 'Se lanza cuando el socio ya tiene 3 préstamos activos. Recibe el límite para que el mensaje no repita un número escrito a mano. **409**.' },
    { n: '3.11', ruta: M + 'exception/PrestamoDuplicadoException.java', tipo: 'class',
      teoria: 'Excepción para la regla **"no se pide dos veces el mismo libro"**.',
      expl: 'Se lanza si el socio ya tiene ese libro prestado y sin devolver. **409**.' },
    { n: '3.12', ruta: M + 'exception/PrestamoYaDevueltoException.java', tipo: 'class',
      teoria: 'Excepción para la regla **"una devolución se registra una sola vez"**.',
      expl: 'Se lanza al devolver un préstamo que ya está `DEVUELTO`. Sin esta regla, devolver dos veces **sumaría una copia de más** al libro. **409**.' },
    { n: '3.13', ruta: M + 'exception/DatoDuplicadoException.java', tipo: 'class',
      teoria: 'Una excepción **genérica y reutilizable**: sirve para cualquier dato que debe ser único.',
      expl: 'Se usa para el ISBN repetido de un libro y para el correo repetido de un socio. El mensaje lo arma con el nombre del campo y el valor. **409**.' },
    { n: '3.14', ruta: M + 'exception/ApiError.java', tipo: 'record',
      teoria: 'Un **formato único de error**: así Angular siempre sabe cómo leer una falla, sea cual sea.',
      expl: 'Campos: `fecha`, `status`, `error`, `mensaje` y `detalles` (lista; se usa en los 400 para listar cada campo inválido). `de(...)` es un método estático de ayuda que pone la fecha actual.' },
    { n: '3.15', ruta: M + 'exception/GlobalExceptionHandler.java', tipo: 'class',
      teoria: '`@RestControllerAdvice` es un **Advice**: una clase que "aconseja" a **todos** los controllers sobre qué hacer cuando se lanza una excepción. Centraliza el manejo de errores.',
      expl: '- Cada `@ExceptionHandler` captura un tipo de excepción y devuelve un `ApiError`.\n- `@ResponseStatus` **no cambia** la respuesta (la arma `ResponseEntity`); sirve para que **Swagger documente** cada error **una sola vez** aquí, en lugar de repetirlo en cada endpoint.\n- **404** → `RecursoNoEncontradoException` y `NoResourceFoundException` (un archivo o ruta inexistente, como el `favicon.ico` que pide el navegador: sin este handler caería en el de `Exception` y daría un 500 con traza en el log). **409** → las cinco excepciones de regla de negocio. **400** → validación (`MethodArgumentNotValidException`, con la lista en `detalles`), JSON mal formado y parámetros de URL inválidos (`?estado=PERDIDO`). **500** → cualquier otra (`Exception`), con `log.error` y la excepción completa.\n- 404 y 409 se registran en `debug` porque el service ya los dejó en `warn`.' },
  ],
  4: [
    { n: '4.1', ruta: M + 'mapper/LibroMapper.java', tipo: 'class',
      teoria: 'El patrón **Mapper** convierte entre DTO y Entity en un único lugar. Hay librerías que lo generan (MapStruct); aquí está **escrito a mano**, sin generación de código. `@Component` lo registra como **bean** de Spring.',
      expl: '- `aEntidad`: DTO de creación → `Libro`. Limpia con `trim()` y **deja todas las copias disponibles** (`ejemplaresDisponibles = ejemplares`).\n- `aRespuesta`: `Libro` → `LibroResponse`, calculando `disponible`.\n- `aDisponibilidad`: arma la respuesta de la consulta de disponibilidad.' },
    { n: '4.2', ruta: M + 'mapper/SocioMapper.java', tipo: 'class',
      teoria: 'Un mapper por entidad mantiene cada conversión en un lugar predecible.',
      expl: 'Normaliza el correo (`trim` + `toLowerCase`) para que `Ana@IPSS.cl` y `ana@ipss.cl` se consideren el mismo.' },
    { n: '4.3', ruta: M + 'mapper/PrestamoMapper.java', tipo: 'class',
      teoria: 'Este mapper **lee relaciones LAZY** (`getLibro().getTitulo()`), por eso solo puede usarse dentro de una transacción abierta.',
      expl: 'Calcula `vencido`: `estado == ACTIVO` **y** `fechaVencimiento` anterior a hoy. Un préstamo ya devuelto nunca está vencido.' },
    { n: '4.4', ruta: M + 'service/LibroService.java', tipo: 'interface',
      teoria: 'Una **interface** es un contrato: lista **qué** operaciones existen sin decir **cómo**. El controller dependerá de esta interface (principio de inversión de dependencias).',
      expl: 'Cuatro operaciones: **buscar**, obtener, **consultar disponibilidad** y crear. El service no sabe de HTTP: recibe texto y un `boolean`, no un `HttpServletRequest`.' },
    { n: '4.5', ruta: M + 'service/SocioService.java', tipo: 'interface',
      teoria: 'Un contrato pequeño para una responsabilidad pequeña.',
      expl: 'Listar, obtener y crear socios.' },
    { n: '4.6', ruta: M + 'service/PrestamoService.java', tipo: 'interface',
      teoria: 'El contrato del corazón del sistema: **préstamos y devoluciones**.',
      expl: '`listar` acepta filtros opcionales (`null` = sin filtrar). `prestar` y `devolver` son los dos casos de uso con reglas de negocio.' },
    { n: '4.7', ruta: M + 'service/impl/LibroServiceImpl.java', tipo: 'class',
      teoria: 'El **Service** es donde viven las **reglas de negocio**. `@Service` lo hace un bean (Singleton). Recibe sus dependencias por **constructor** (*inyección de dependencias*): Spring las entrega, tú no haces `new`. `@Transactional` ejecuta cada método en una transacción: si algo falla, se revierte.',
      expl: '- `buscar`: cambia `null` por `""` y recorta espacios antes de llamar al repository.\n- `consultarDisponibilidad`: si `ejemplaresDisponibles == 0`, busca el préstamo activo que vence primero; si hay copias, **no consulta préstamos** (una consulta menos).\n- `crear`: rechaza un ISBN repetido (`DatoDuplicadoException`) antes de guardar.\n- `@Transactional(readOnly = true)` en las consultas: solo leen.' },
    { n: '4.8', ruta: M + 'service/impl/SocioServiceImpl.java', tipo: 'class',
      teoria: 'Mismo patrón: interface + implementación + logs.',
      expl: '`crear` normaliza el correo con el mapper y rechaza duplicados. `listar` ordena por nombre.' },
    { n: '4.9', ruta: M + 'service/impl/PrestamoServiceImpl.java', tipo: 'class',
      teoria: 'Un service que coordina **tres repositories** en una sola transacción: o se guarda el préstamo **y** se descuenta la copia, o no se guarda nada. `static final` define las constantes de negocio en un solo lugar.',
      expl: '- **`prestar` aplica tres reglas, en este orden**:\n  1. *No duplicar*: `existsBySocioIdAndLibroIdAndEstado(..., ACTIVO)` → `PrestamoDuplicadoException`.\n  2. *Límite*: `countBySocioIdAndEstado(..., ACTIVO) >= 3` → `LimitePrestamosExcedidoException`.\n  3. *Copias*: `ejemplaresDisponibles <= 0` → `LibroSinEjemplaresException`.\n  Si todo pasa: descuenta una copia, guarda el libro y crea el préstamo con vencimiento a 14 días.\n- El libro se lee con **`buscarParaActualizar`** (bloqueo `FOR UPDATE`): evita que dos socios se lleven la última copia a la vez.\n- **`devolver`**: si ya está `DEVUELTO` → `PrestamoYaDevueltoException`; si no, suma una copia y marca el préstamo `DEVUELTO` con la fecha de hoy.\n- `listar`: elige el repository según haya o no `socioId` y filtra por `estado` en memoria.\n- **Logs**: `info` en `command receive to ...` / `finish ...`; `warn` cuando rechaza algo.' },
  ],
  '4B': [
    { n: '4B.1', ruta: M + 'controller/web/LibroWebController.java', tipo: 'class',
      teoria: '**Thymeleaf** es un motor de plantillas: el servidor arma una página **HTML** con los datos y la envía lista al navegador. Es otra forma de hacer la "V" de MVC. Un `@Controller` (a diferencia de `@RestController`) **no devuelve JSON**: devuelve el **nombre de una plantilla** y Spring la dibuja con los datos que le dejaste en el `Model`.',
      expl: '- `@Controller` + `@RequestMapping("/web")`: las páginas viven bajo `/web/...`, separadas de la API (`/api/...`).\n- Recibe **los mismos services** que la API REST: no se repite ninguna regla de negocio.\n- `Model model`: la "mochila" con los datos que usará la plantilla (`model.addAttribute("libros", ...)`).\n- `return "libros"`: Thymeleaf busca `templates/libros.html`. `return "redirect:/web/libros"` manda al navegador a otra dirección.\n- `RedirectAttributes` + `addFlashAttribute`: guardan un mensaje que sobrevive **una sola redirección** (así se muestra el error o el éxito en la página siguiente).\n- `@ConditionalOnProperty(name = "app.web.enabled", ...)`: el controller solo existe si la propiedad está activa. Con `WEB_THYMELEAF=false` las páginas desaparecen y se usa solo Angular, **sin comentar código**.\n- `@Hidden`: Swagger no intenta documentar páginas HTML.' },
    { n: '4B.2', ruta: M + 'controller/web/PrestamoWebController.java', tipo: 'class',
      teoria: 'Los formularios HTML solo envían **GET** y **POST**. Después de un POST se responde con una **redirección** (patrón **Post/Redirect/Get**): así, si el usuario refresca la página, el navegador **no repite** el préstamo.',
      expl: '- `@PostMapping("/prestamos")` recibe los campos del formulario con `@RequestParam` (`libroId`, `socioId`).\n- **`try / catch`**: el `GlobalExceptionHandler` está pensado para JSON; aquí las reglas de negocio (`LibroSinEjemplaresException`, `LimitePrestamosExcedidoException`, `PrestamoDuplicadoException`…) se capturan y se convierten en un mensaje dentro de la página.\n- El service es **el mismo** que usa la API: las reglas (3 préstamos, sin copias, duplicado, devolver una vez) funcionan igual en HTML y en Angular.\n- `prestamos()` pide al service los préstamos `ACTIVO` y `DEVUELTO` del socio elegido.' },
  ],
  5: [
    { n: '5.1', ruta: M + 'config/SwaggerConfig.java', tipo: 'class',
      teoria: '`@Configuration` marca una clase que **define beans**. `@Bean` indica que el valor devuelto por el método se registra en Spring. springdoc lee el bean `OpenAPI` para dibujar Swagger UI.',
      expl: 'Solo personaliza la cabecera de Swagger: título, descripción y versión. Los endpoints los descubre solo springdoc a partir de los controllers.' },
    { n: '5.2', ruta: M + 'config/CorsConfig.java', tipo: 'class',
      teoria: '**CORS** es una protección del navegador: una página en `localhost:4201` no puede llamar a `localhost:8084` salvo que el servidor lo permita. (Con el proxy de Angular no hace falta, pero se deja configurado.)',
      expl: '- `@Value("${app.cors.allowed-origins}")`: lee el origen permitido del `application.yml` (variable `CORS_ORIGINS`).\n- Se permite `/api/**` con los verbos `GET, POST, PUT, **PATCH**, DELETE, OPTIONS`. **`PATCH` es imprescindible** aquí: es el verbo de la devolución.' },
  ],
  6: [
    { n: '6.1', ruta: M + 'controller/LibroController.java', tipo: 'class',
      teoria: 'El **Controller** (la "C" de MVC) recibe la petición HTTP, **delega en el service** y devuelve el código correcto. **No contiene reglas de negocio.** `@RestController` = `@Controller` + `@ResponseBody` (devuelve JSON).',
      expl: '- `@RequestMapping("/api/libros")`: prefijo común. `@GetMapping`, `@PostMapping`: un verbo HTTP cada uno.\n- `@RequestParam(required = false) String q`: parámetro **opcional** de la URL (`/api/libros?q=clean`). `defaultValue = "false"` para `soloDisponibles`.\n- `@PathVariable Long id`: toma el `{id}` de la URL. `@RequestBody` convierte el JSON en el DTO y `@Valid` ejecuta sus validaciones (si fallan → 400).\n- `GET /{id}/disponibilidad` es el endpoint de **consultar disponibilidad**.\n- `HttpServletRequest requestServlet` va **primero** en cada método y sirve para los logs: `start process endpoint`, `response ...`, `end process endpoint` (si hay error no llega a "end").\n- `crear` devuelve **201** con la cabecera `Location`.\n- `@Operation` documenta cada endpoint; `@ApiResponse` solo para el 201. Los errores se documentan **una vez** en el handler.' },
    { n: '6.2', ruta: M + 'controller/SocioController.java', tipo: 'class',
      teoria: 'Mismo patrón: el controller solo traduce HTTP.',
      expl: 'Tres endpoints: listar (lo usa Angular para el selector de socio), obtener y crear.' },
    { n: '6.3', ruta: M + 'controller/PrestamoController.java', tipo: 'class',
      teoria: 'Los **filtros** de una lista son parámetros opcionales de la URL. Spring convierte `?estado=ACTIVO` en el enum automáticamente; si el valor no existe lanza `MethodArgumentTypeMismatchException` (→ 400).',
      expl: '- `GET /api/prestamos?socioId=1&estado=ACTIVO`: los dos filtros son opcionales.\n- `POST /api/prestamos` → **realizar un préstamo**, devuelve **201** con `Location`.\n- `PATCH /api/prestamos/{id}/devolucion` → **registrar la devolución**. Es `PATCH` y no `PUT` porque cambia una parte del préstamo y **no lleva cuerpo**: la acción está en la URL.' },
  ],
  7: [
    { n: '7.1', ruta: T + 'service/PrestamoServiceImplTest.java', tipo: 'class',
      teoria: 'Un **test unitario** prueba una sola clase aislada. **Mockito** crea repositories *falsos* (`@Mock`) para no necesitar base de datos. `@ExtendWith(MockitoExtension.class)` activa Mockito en JUnit 5. `ReflectionTestUtils.setField(t, "id", 1L)` simula el `id` que asignaría la base (las entities no tienen `setId`).',
      expl: 'Cada `@Test` cubre una regla: préstamo feliz (descuenta una copia, vence en 14 días), **sin ejemplares**, **cuarto préstamo del socio**, **tercer préstamo permitido**, **mismo libro dos veces**, socio o libro inexistente, **devolución** que libera la copia, **devolver dos veces**, `vencido` y los filtros del listado. `verify(repository, never()).save(any())` comprueba que **no** se guardó nada al rechazar.' },
    { n: '7.2', ruta: T + 'service/LibroServiceImplTest.java', tipo: 'class',
      teoria: 'Un test también puede comprobar **qué NO se llamó**: `verify(..., never())`.',
      expl: 'Cubre la **búsqueda** (texto nulo, texto recortado, filtro de disponibles), la **disponibilidad** (con copias no consulta préstamos; sin copias informa la próxima devolución) y el alta de libros con ISBN repetido.' },
    { n: '7.3', ruta: T + 'service/SocioServiceImplTest.java', tipo: 'class',
      teoria: 'Los tests de un service pequeño siguen el mismo esquema: preparar mocks, ejecutar, comprobar.',
      expl: 'Normalización del correo, correo repetido y socio inexistente.' },
    { n: '7.4', ruta: T + 'controller/PrestamoControllerTest.java', tipo: 'class',
      teoria: '`@WebMvcTest` levanta **solo la capa web** (rutas, validaciones, JSON y códigos HTTP). El service se reemplaza con `@MockitoBean`. `MockMvc` simula peticiones sin abrir un puerto.',
      expl: 'Verifica **200** al listar y devolver, **201** con `Location` al prestar, **400** (falta el socio, estado de filtro desconocido), **404** (libro inexistente) y los tres **409** de préstamo (sin ejemplares, límite, duplicado) más el de devolver dos veces, además del formato `ApiError` (`$.mensaje`, `$.status`, `$.detalles[0]`).' },
    { n: '7.5', ruta: T + 'controller/LibroControllerTest.java', tipo: 'class',
      teoria: 'Los parámetros opcionales de la URL también se prueban: `get("/api/libros?q=clean&soloDisponibles=true")`.',
      expl: 'Búsqueda con y sin parámetros, **consulta de disponibilidad**, 404, 201 con `Location`, 400 por ISBN inválido y 409 por ISBN repetido.' },
    { n: '7.6', ruta: T + 'controller/SocioControllerTest.java', tipo: 'class',
      teoria: 'Cada controller tiene su propia clase de test web.',
      expl: 'Listar, crear (201 + `Location`) y correo inválido (400).' },
    { n: '7.7', ruta: T + 'controller/web/LibroWebControllerTest.java', tipo: 'class',
      teoria: 'Con `@WebMvcTest` las páginas Thymeleaf **se renderizan de verdad**: se puede comprobar el HTML que recibiría el navegador con `content().string(containsString(...))`, la plantilla elegida con `view().name(...)` y los mensajes de redirección con `flash()`.',
      expl: 'El catálogo muestra los libros y su disponibilidad, un libro agotado, la próxima devolución en formato `dd-MM-yyyy`, el libro inexistente que vuelve al catálogo con un mensaje, y la redirección de `/web`.' },
    { n: '7.8', ruta: T + 'controller/web/PrestamoWebControllerTest.java', tipo: 'class',
      teoria: 'Un POST de formulario no devuelve HTML sino una **redirección**; el test comprueba la dirección (`redirectedUrl`) y el mensaje flash.',
      expl: 'Prestar con éxito, sin ejemplares, **límite de 3**, devolver, devolver dos veces y la página *Mis préstamos* con activos e historial.' },
  ],
};

function paquete(ruta) {
  const m = ruta.match(/java\/(cl\/ipss\/biblioteca(?:\/[a-z]+)*)\//);
  return m[1].replace(/\//g, '.');
}

function bloqueArchivo(a) {
  const codigo = leer(path.join(src, a.ruta));
  const pkg = paquete(a.ruta);
  const carpeta = 'src/' + a.ruta.replace(/\/[^/]+$/, '');
  const nombre = path.basename(a.ruta, '.java');
  const tipoIde = { class: 'Class', interface: 'Interface', enum: 'Enum', record: 'Record' }[a.tipo];
  const esTest = a.ruta.startsWith('test/');
  return [
    `### 🧩 Archivo ${a.n} · \`${nombre}\` (${a.tipo})`,
    '',
    `**① Crear el paquete** (si aún no existe): \`${pkg}\``,
    '',
    `- IntelliJ: clic derecho sobre \`${esTest ? 'src/test/java' : 'src/main/java'}\` → *New → Package*.`,
    `- VS Code: en el explorador, clic derecho en \`${esTest ? 'src/test/java' : 'src/main/java'}\` → *New Folder* y escribe la ruta con \`/\` (\`${pkg.replace(/\./g, '/')}\`).`,
    '',
    `**② Crear el archivo** \`${nombre}.java\` en \`${carpeta}\`:`,
    '',
    '| IDE | Cómo |',
    '|---|---|',
    `| **IntelliJ** | Clic derecho en el paquete → *New → Java Class* → nombre \`${nombre}\` → elige **${tipoIde}** |`,
    `| **VS Code** | Clic derecho en la carpeta → *New File* → \`${nombre}.java\` (el servicio de Java sugiere la estructura) |`,
    '',
    '**③ Código completo** (primera línea: `package`):',
    '',
    `<!-- archivo: ${a.ruta} -->`,
    '```java',
    codigo,
    '```',
    '',
    '**④ Teoría**',
    '',
    a.teoria,
    '',
    '**⑤ Explicación del código**',
    '',
    a.expl,
    '',
  ].join('\n');
}

function expandir(texto) {
  texto = texto.replace(/\{\{FILES:([0-9A-Za-z]+)\}\}/g, (_, p) => archivos[p].map(bloqueArchivo).join('\n'));
  texto = texto.replace(/\{\{CODE:([^}]+)\}\}/g, (_, rel) => {
    const ruta = rel.startsWith('../') ? path.join(raiz, 'biblioteca-backend', rel.slice(3)) : path.join(src, rel);
    const ext = path.extname(ruta).slice(1);
    const lang = { yml: 'yaml', sql: 'sql', java: 'java', html: 'html', css: 'css', xml: 'xml' }[ext] || '';
    return `<!-- archivo: ${path.relative(path.join(raiz, 'biblioteca-backend'), ruta).replace(/\\/g, '/')} -->\n\`\`\`${lang}\n${leer(ruta)}\n\`\`\``;
  });
  return texto;
}

function expandirNg(texto) {
  return texto.replace(/\{\{NG:([^}]+)\}\}/g, (_, rel) => {
    const ruta = path.join(raiz, 'biblioteca-frontend', rel);
    const lang = { ts: 'typescript', html: 'html', css: 'css', json: 'json' }[path.extname(ruta).slice(1)] || '';
    return `<!-- archivo: ${rel} -->\n\`\`\`${lang}\n${leer(ruta)}\n\`\`\``;
  });
}

function bloquesDe(md) {
  const re = /<!-- archivo: ([^\n]+) -->\n```[a-z]*\n([\s\S]*?)\n```/g;
  const out = [];
  let m;
  while ((m = re.exec(md))) out.push({ ruta: m[1], codigo: m[2] });
  return out;
}

if (process.argv.includes('--check')) {
  let mal = 0, total = 0;
  for (const [archivo, esNg] of [[salida, false], [salidaNg, true]]) {
    const bloques = bloquesDe(fs.readFileSync(archivo, 'utf8').replace(/\r\n/g, '\n'));
    for (const b of bloques) {
      const real = esNg ? path.join(raiz, 'biblioteca-frontend', b.ruta)
        : (b.ruta.startsWith('src/') || /^crear-bd[\w-]*\.sql$/.test(b.ruta) ? path.join(raiz, 'biblioteca-backend', b.ruta) : path.join(src, b.ruta));
      const ok = leer(real) === b.codigo;
      total++;
      if (!ok) mal++;
      console.log((ok ? 'IGUAL    ' : 'DISTINTO ') + b.ruta);
    }
  }
  console.log(`\n${total} bloques comprobados, ${mal} distintos`);
  process.exit(mal ? 1 : 0);
} else {
  fs.writeFileSync(salida, expandir(plantilla), 'utf8');
  fs.writeFileSync(salidaNg, expandirNg(plantillaNg), 'utf8');
  console.log('Guías generadas');
}
