# 09 · Fundamentos de ingeniería de software aplicados a la Biblioteca

Banco docente para acompañar el proyecto. Los diagramas del estado actual describen el código revisado; las propuestas están rotuladas como tales.

## Cómo usar el material

Esto es un banco de temas, no cuarenta temas para leer en una sola sesión. Para una clase sobre el proyecto priorizar 1–6, 11–20, 27, 29–31 y 37–38. Usar metodología, arquitectura futura y cloud en sesiones posteriores.

## Base y criterio de construcción

Se partió de la estructura del proyecto Kanban (documentos 00–06, guía paso a paso, backend en capas y frontend Angular) y se aplicó al requerimiento: *un sistema de información para una biblioteca que permita a los usuarios buscar libros, realizar préstamos y devoluciones, y consultar disponibilidad de libros*. El criterio es trazabilidad: necesidad, aceptación, modelo, implementación y evidencia. Las simplificaciones que podían confundir se aclaran expresamente.

## 1. Ingeniería de software aplicada

Antes del código hay decisiones: qué problema se resuelve, para quién y cómo sabremos que funciona. Los diagramas de estado actual corresponden al sistema revisado; los de arquitectura futura, despliegue y organización del equipo son propuestas, no funciones instaladas.

Fuente: https://swebokwiki.org/Main_Page

## 2. Qué significa un buen resultado

- **Valor**: resuelve una necesidad verificable (encontrar un libro y saber si se puede llevar).
- **Corrección**: cumple las reglas incluso cuando una entrada falla (no se presta sin copias).
- **Mantenibilidad**: permite cambiar una regla con impacto controlado (el plazo de 14 días vive en una constante).
- **Operación**: puede desplegarse, observarse y recuperarse.

El software no se evalúa solo porque compila. En la biblioteca, impedir el cuarto préstamo es una regla, explicar un 409 es una cualidad del contrato y restaurar el inventario es una capacidad operativa. No inventar objetivos de disponibilidad o rendimiento: se acuerdan con los interesados y se miden en un entorno definido.

## 3. Cómo se construye con evidencia

Problema → criterios → modelos → código → pruebas. Es un flujo iterativo, no una cascada: una carrera detectada en pruebas obliga a revisar la transacción y el diseño de persistencia. Los modelos permiten revisar decisiones antes de programar; las pruebas buscan diferencias con lo esperado.

## 4. Requisitos y alcance de la Biblioteca

| Tipo | Ejemplo | Evidencia |
|---|---|---|
| Funcional | Buscar libros por texto | `GET /api/libros?q=` y su prueba |
| Funcional | Realizar y devolver préstamos | Petición/respuesta HTTP y estado en la base |
| Funcional | Consultar disponibilidad | `GET /api/libros/{id}/disponibilidad` |
| Regla | Máximo 3 préstamos activos por socio | Rechazo del cuarto |
| Restricción | Java 21 y PostgreSQL | Entorno reproducible |
| Fuera de alcance | Login, multas, reservas, renovaciones, edición/baja de libros | Declaración explícita |

Distinguir una necesidad de una solución técnica: Java 21 es una restricción del curso, no una necesidad del socio. La aplicación guarda préstamos con sus fechas, pero no conserva una bitácora completa de cambios. Base: [01-problema.md](01-problema.md).

## 5. Atributos de calidad medibles

| Atributo | Pregunta de diseño | Cómo comprobarlo |
|---|---|---|
| Integridad | ¿Puede `ejemplares_disponibles` quedar negativo con pedidos simultáneos? | Prueba concurrente en PostgreSQL |
| Seguridad | ¿Quién puede devolver el préstamo de otro socio? | Prueba de autorización por recurso |
| Rendimiento | ¿Qué tan rápido debe responder la búsqueda con 100 000 libros? | Carga y percentiles acordados |
| Recuperación | ¿Podemos restaurar los datos? | Ensayo de restauración |

"Rápido" es insuficiente: definir escenario, carga, entorno, medida y umbral con el interesado. En esta clase el riesgo más concreto es la integridad del inventario; para uso público también falta autorización.

## 6. Trazabilidad de una regla

Regla R-02: no admitir el cuarto préstamo activo de un socio. Criterio: con tres préstamos activos, un nuevo `POST /api/prestamos` devuelve 409 y no modifica el inventario. Modelo: [05-uml-secuencia.md](05-uml-secuencia.md) (rechazo con 409). Código: `PrestamoServiceImpl.prestar` y `PrestamoRepository.countBySocioIdAndEstado`. Prueba: `rechazaElCuartoPrestamoActivoDelSocio`. El test comprueba la regla secuencial con mocks; la garantía concurrente es otra prueba (ver sección 30).

## 7. Agile, Scrum y Kanban

| Concepto | Aporta | Aplicación al curso |
|---|---|---|
| Agile | Valores de colaboración y adaptación | Entregas pequeñas con feedback |
| Scrum | Objetivo y ciclo de inspección | Simulación de un Sprint |
| Kanban | Gestión del flujo y del WIP | Políticas de columnas y límites |
| Prácticas técnicas | Calidad de implementación | PR, pruebas y CI |

No son alternativas equivalentes: Agile expresa valores, Scrum un marco y Kanban una estrategia de gestión de flujo. Un tablero visual por sí solo no demuestra agilidad.

Fuente: https://agilemanifesto.org/iso/es/manifesto.html

## 8. Un Sprint en el aula

Propuesta didáctica: Sprint de una semana con un objetivo concreto, por ejemplo *"un socio puede prestar y devolver libros con rechazos comprensibles"*. Planning acuerda objetivo y trabajo, los Developers inspeccionan avance, Review obtiene feedback del incremento y Retrospectiva propone una mejora. No usar al Scrum Master como jefe de tareas.

Fuente: https://scrumguides.org/scrum-guide.html

## 9. Políticas de trabajo del equipo

El tablero del equipo puede tener Por hacer, En desarrollo, Revisión y Terminado. Definir cómo entra y sale una tarea, límites de trabajo y tratamiento de bloqueos. Una historia con código escrito pero sin pruebas o revisión no satisface la Definition of Done. Medir tiempo de ciclo y antigüedad, no líneas de código.

Fuente: https://kanbanguides.org/the-kanban-guide/2025.5/

## 10. Colaboración y Definition of Done

Propuesta: una historia pequeña por rama, commits descriptivos y PR con motivo y verificación. DoD del curso: criterios satisfechos, pruebas verdes, revisión de un compañero, migración nueva si cambia el esquema y configuración sin secretos. Los criterios pertenecen a la historia; la DoD es transversal. Los desarrolladores siguen siendo responsables de código generado con IA.

## 11. Qué diagrama responde cada pregunta

| Pregunta | Diagrama | Decisión que permite revisar |
|---|---|---|
| ¿Quién usa qué? | Casos de uso y contexto | Alcance y actores |
| ¿Qué piezas colaboran? | Contenedores y clases | Responsabilidades y dependencias |
| ¿Qué ocurre y en qué orden? | Secuencia y estados | Mensajes, reglas y excepciones |
| ¿Qué se guarda y dónde corre? | Modelo de datos y despliegue | Integridad y operación |

Escoger el mínimo modelo que aclare una decisión. Un contenedor C4 no significa necesariamente Docker.

Fuente: https://c4model.com/diagrams

## 12. Casos de uso de la biblioteca

Estado actual. El actor Usuario interactúa con seis objetivos: buscar libros, consultar disponibilidad, realizar préstamo, devolver libro, ver mis préstamos y agregar libro. Las líneas expresan participación, no orden temporal. `include` y `extend` tienen semántica UML precisa: no toda validación merece otro óvalo y no todo error es una extensión. Ver [00-casos-de-uso.md](00-casos-de-uso.md).

Fuente: https://www.omg.org/spec/UML/2.5.1

## 13. Contexto del sistema

Vista de contexto inspirada en C4. El sistema en alcance es la Biblioteca completa y el usuario está fuera. PostgreSQL forma parte del producto. En el estado actual no hay servicios externos obligatorios para el negocio. Swagger es una herramienta cliente de prueba, no un actor de negocio adicional.

## 14. Contenedores del sistema actual

Angular ejecuta la interfaz en el navegador, Spring Boot ofrece la API REST y PostgreSQL persiste. En desarrollo el proxy de Angular reenvía `/api` al puerto 8084. La ubicación productiva aún no está definida. Ver el diagrama en [10-atlas-diagramas-biblioteca.md](10-atlas-diagramas-biblioteca.md).

## 15. Arquitectura por capas de la Biblioteca

Estado actual validado en los paquetes. Cada controller usa su interface de service; el service coordina repositories y mapper; los repositories operan sobre entities con JPA y PostgreSQL. DTO representa el contrato y Entity la persistencia. Un modelo "rico" podría poner reglas dentro de las entidades; este ejercicio las concentra en el service.

## 16. UML de clases: colaboraciones principales

Diagrama parcial del código actual ([04-uml-clases.md](04-uml-clases.md)). `PrestamoServiceImpl` colabora con tres repositories porque un préstamo toca tres tablas. Las flechas no representan secuencia temporal; para eso se usa el diagrama de secuencia.

## 17. Modelo persistente actual

Tres tablas de negocio: `libro`, `socio` y `prestamo`. `prestamo` tiene claves foráneas a las otras dos. Hay `UNIQUE` en ISBN y correo, `CHECK` en estado y en el rango de `ejemplares_disponibles`, y un índice único parcial que impide dos préstamos activos del mismo libro para un socio. Un `CHECK` no garantiza por sí solo que `ejemplares_disponibles` coincida con los préstamos activos: eso lo mantiene el service. No inventar relaciones con entidades inexistentes (autores, sedes, editoriales). Ver [06-modelo-base-de-datos.md](06-modelo-base-de-datos.md).

## 18. Estados y guardas de transición

Un préstamo nace `ACTIVO` y pasa a `DEVUELTO`; no hay vuelta atrás. La transición `ACTIVO → DEVUELTO` solo existe una vez (la segunda devolución se rechaza). El préstamo `ACTIVO` además puede estar *vencido*, pero eso es un dato calculado, no un estado almacenado. En el libro, la "disponibilidad" no es un estado sino un contador entre 0 y el total.

## 19. Secuencia: préstamo aceptado

Camino exitoso: el controller valida y llama al service; el service busca al socio y al libro (bloqueando la fila del libro), comprueba duplicado, límite y copias, descuenta una copia, guarda el libro y crea el préstamo. La infraestructura transaccional coordina flush y commit antes de responder 201, aunque `save` no necesariamente ejecute SQL en ese instante.

## 20. Secuencia: rechazo y respuesta 409

Cuando una regla falla, el service lanza una excepción **sin llamar a `save`**. Spring MVC resuelve la excepción mediante `GlobalExceptionHandler`, que construye `ApiError` y la respuesta 409. El controller no llama manualmente al handler. Los tests comprueban que la escritura no ocurre (`verify(..., never())`).

## 21. Arquitecturas y criterios de elección

| Diseño | Cuándo aporta | Costo o límite |
|---|---|---|
| Capas | CRUD y reglas acotadas | Puede acoplar negocio a JPA |
| Monolito modular | Varias funciones con límites claros | Exige disciplina entre módulos |
| Puertos y adaptadores | Aislar dominio e integraciones | Más contratos y mapeos |
| Microservicios | Autonomía de equipos y despliegue | Red, observabilidad y consistencia |

La Biblioteca actual puede seguir como monolito en capas. Si aparecen integraciones (correo, lectores de código de barras) y reglas complejas, estudiar puertos y adaptadores. Microservicios no son el paso obligatorio siguiente: distribuirían la transacción *prestar + descontar copia*.

Fuente: https://alistair.cockburn.us/hexagonal-architecture

## 22. Puertos y adaptadores: evolución posible

Propuesta, no estructura presente. El núcleo contendría el caso de uso *prestar* y la política de préstamos; el adaptador HTTP invocaría un puerto de entrada y un adaptador JPA implementaría el puerto de repositorio. Una figura hexagonal no demuestra desacoplamiento: importaciones y pruebas deben confirmarlo.

## 23. Una decisión de arquitectura documentada

| Campo | Contenido |
|---|---|
| Contexto | Una API pequeña, un equipo y PostgreSQL |
| Decisión | Mantener capas y guardar las constantes de negocio (3 préstamos, 14 días) en un solo lugar |
| Alternativas | Hexagonal completa o servicios separados |
| Consecuencia | Menor costo inicial y un límite claro para evolucionar |

Ejemplo de ADR propuesto: fecha, estado, contexto, decisión, alternativas y consecuencias. No escribir un documento largo para cada detalle. Condición para revisarla: varias entradas o integraciones que dupliquen lógica.

## 24. Patrones presentes en el código

| Patrón | Ubicación | Problema que resuelve |
|---|---|---|
| Service Layer | `*ServiceImpl` | Coordinar operaciones y reglas |
| Repository | `*Repository` | Concentrar acceso a datos |
| DTO | Requests y Responses | Definir datos intercambiados |
| Mapper | `*Mapper` | Transformar representaciones |
| Bloqueo pesimista | `LibroRepository.buscarParaActualizar` | Proteger el contador de copias |

Un patrón se justifica por el problema que resuelve, no por contar cuántos aparecen. Ver [03-patrones-de-diseno.md](03-patrones-de-diseno.md).

Fuente: https://martinfowler.com/eaaCatalog/index.html

## 25. Patrones que podrían aportar después

| Patrón | Escenario futuro | Evitar aplicarlo cuando… |
|---|---|---|
| Strategy | Plazos y límites distintos por tipo de socio (estudiante, docente) | Solo hay una política estable |
| State | Préstamos con renovación, mora y pérdida | Un enum y un `if` son suficientes |
| Adapter | Notificaciones por correo o catálogo externo | La integración ya es simple |
| Observer / eventos | Avisar al siguiente en una lista de espera al devolver | Se requiere consistencia inmediata |

Son candidatos, no patrones que ya implemente el proyecto. Actividad: escoger una necesidad futura y argumentar un patrón o justificar no usarlo.

## 26. Inyección de dependencias y contrato

Spring crea y conecta objetos administrados. El constructor hace visibles las dependencias: `PrestamoServiceImpl` declara tres repositories y un mapper. El alcance singleton es por definición de bean y contenedor, no garantiza thread safety: los services no guardan estado mutable de cada solicitud. Una interfaz no es obligatoria para Mockito ni un mock prueba automáticamente Liskov.

Fuente: https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html

## 27. Clean code: intención antes que brevedad

Las constantes `LIMITE_PRESTAMOS_ACTIVOS` y `DIAS_PRESTAMO` dan nombre a números que de otro modo serían "mágicos" repartidos por el código. Clean code también incluye nombres del dominio (`prestar`, `devolver`), errores útiles y dependencias claras. No imponer números arbitrarios de líneas ni extraer métodos que oculten la lógica.

## 28. SOLID como preguntas de revisión

| Principio | Pregunta útil | Aplicación |
|---|---|---|
| S | ¿Por qué razones cambia esta clase? | Catálogo, socios y préstamos son servicios separados |
| O | ¿Una regla nueva exige editar todo? | Política aislada si varía |
| L | ¿La sustitución conserva el contrato? | Mismos resultados y errores |
| I / D | ¿Qué necesita y de qué depende? | Contratos acotados al uso |

SRP trata de razones de cambio, no de que una clase tenga un solo método. DIP orienta dependencias hacia abstracciones adecuadas; inyección por constructor ayuda, pero no demuestra todo el principio. Pedir un contraejemplo por equipo.

## 29. Validación, dominio y errores HTTP

| Situación | Responsable | Respuesta |
|---|---|---|
| ISBN mal escrito o JSON ilegible | DTO y capa web | 400 |
| Libro, socio o préstamo inexistente | Service y handler | 404 |
| Sin copias, límite, duplicado o devolución repetida | Regla de negocio y handler | 409 |
| Fallo inesperado | Handler y observabilidad | 500 sin detalles internos |

Validar también en servidor: Angular mejora la experiencia, pero un cliente directo puede omitirlo. `CrearPrestamoRequest` no acepta fechas ni estado. El record tiene accesores como `titulo()`, no `getTitulo()`, y su inmutabilidad es superficial.

## 30. El inventario bajo solicitudes simultáneas

Riesgo clásico: dos socios piden la última copia a la vez; ambos leen `ejemplaresDisponibles = 1`, ambos pasan la validación y el contador queda en −1. `@Transactional` no convierte todas las operaciones en una cola. **Mitigación implementada:** el libro se lee con `@Lock(PESSIMISTIC_WRITE)` (`SELECT ... FOR UPDATE`), así la segunda transacción espera y luego recibe 409; además el `CHECK (ejemplares_disponibles BETWEEN 0 AND ejemplares_totales)` impide que el contador salga de rango. **Pendiente:** una prueba concurrente real contra PostgreSQL que lo demuestre; los tests actuales usan mocks y no lo cubren.

Fuente: https://www.postgresql.org/docs/current/transaction-iso.html

## 31. Estrategia de pruebas por riesgo

| Nivel | Qué prueba | Situación actual |
|---|---|---|
| Unitario | Reglas de préstamo, devolución, búsqueda y disponibilidad | 24 tests con Mockito |
| Web | Contrato JSON, validación, errores y páginas Thymeleaf | 31 tests con MockMvc (20 de la API + 11 de las páginas) |
| Frontend | Stores (carga, resumen, prestar, devolver, 409) | 14 tests con Vitest |
| Integración | Flyway, JPA y PostgreSQL | Pendiente |
| Concurrencia / E2E | Última copia simultánea y recorrido completo | Pendiente |

Los tests con mocks no validan consultas JPQL ni el bloqueo; proponer Testcontainers con PostgreSQL si hay Docker. Elegir pruebas por riesgo: casos límite, errores, persistencia y carreras. Cobertura de líneas es un indicador parcial. Una prueba automatizada es evidencia repetible, no prueba absoluta de ausencia de defectos.

## 32. Base de datos y evolución del esquema

Las migraciones aplicadas son historial; un cambio se añade en una versión nueva (`V3__...sql`). Probar la migración y validar el mapeo con Hibernate. Para producción evaluar compatibilidad entre aplicación anterior y esquema nuevo: expandir primero, retirar después. No actualizar checksums para ocultar divergencias. Un respaldo solo sirve si se ha ensayado restaurar.

## 33. Seguridad y configuración

- **Identidad:** autenticar y autorizar cada operación sobre su recurso (hoy no hay login: el socio se elige en pantalla).
- **Secretos:** variables externas y roles de base con permisos acotados.
- **Exposición:** HTTPS, CORS explícito y errores sin información interna.
- **Registro:** logs con id y resultado, sin datos personales (no se registran correos).

El proyecto actual no implementa autenticación: cualquiera podría devolver el préstamo de otro. Para uso local docente emplear datos ficticios. Antes de publicación real agregar autorización por socio. CORS es una política del navegador y no protege contra todos los clientes. Revisar los logs que registran respuestas completas y las claves por defecto.

## 34. Despliegue propuesto

Vista futura, no implementada. Angular puede publicarse como sitio estático, Spring Boot necesita un host Java y PostgreSQL un servicio administrado. El navegador no debe recibir credenciales JDBC. HTTPS protege el canal y el backend usa conexión TLS a PostgreSQL. Evaluar costos y límites de cada proveedor antes de elegir.

## 35. CI/CD con una puerta de calidad

Pipeline propuesto: checkout, setup-java 21, Maven Wrapper y `verify`; para Angular, `npm ci`, `ng test` y `ng build`. Publicar una imagen versionada después de pasar verificaciones. CI ejecuta pruebas pero no decide si el requisito es correcto. CD debe contemplar secretos, entornos y reversión.

Fuente: https://docs.github.com/en/actions/tutorials/build-and-test-code/java-with-maven

## 36. Operación y retroalimentación

| Pregunta | Herramienta |
|---|---|
| ¿Qué operación falló y cómo correlacionarla? | Logs |
| ¿Cambian errores, latencia o saturación? | Métricas |
| ¿La aplicación puede atender solicitudes? | Salud |
| ¿Podemos restaurar y volver a operar? | Recuperación |

Agregar observabilidad cuando responda preguntas útiles. Los incidentes generan requisitos y pruebas nuevas, cerrando el ciclo de ingeniería.

## 37. Laboratorio

| Paso | Actividad |
|---|---|
| Analizar | Escribir la historia y el criterio de *"un socio con un préstamo vencido no puede pedir otro libro"* |
| Modelar | Ubicar la nueva guarda en la secuencia de [05-uml-secuencia.md](05-uml-secuencia.md) |
| Verificar | Escribir el test de éxito y de rechazo, y comprobar que no se guarda nada al rechazar |
| Revisar | Explicar el código y obtener feedback de un compañero |

Actividad de 25 minutos. Salida: criterio, respuesta HTTP, prueba y explicación de qué queda fuera del alcance. La regla del ejercicio **no existe en el código actual** (los préstamos vencidos solo se marcan): implementarla es el laboratorio.

## 38. Criterios para revisar una entrega

| Dimensión | Evidencia mínima | Pregunta al estudiante |
|---|---|---|
| Requisito | Criterio y caso alternativo | ¿Qué necesidad resuelve? |
| Diseño | Diagrama consistente con el código | ¿Por qué esta responsabilidad aquí? |
| Calidad | Pruebas de éxito y rechazo | ¿Qué riesgo todavía no cubres? |
| Entrega | README y configuración reproducible | ¿Cómo lo ejecuta otra persona? |

Revisar trazabilidad y coherencia, no cantidad de diagramas. Evaluar comprensión individual, incluyendo código asistido por IA: pedir que cambien una condición pequeña y expliquen qué pruebas deben variar.

## 39. Ruta posterior

| Etapa | Trabajo | Resultado esperado |
|---|---|---|
| Próxima | Regla de préstamos vencidos y multas | Regla legible y revisada |
| Después | Pruebas SQL y concurrencia | Integridad comprobada |
| Antes de publicar | Seguridad, CI y configuración | Entrega reproducible |
| Evolución | Reservas, renovaciones y operación | Demo y recuperación |

## 40. Fundamentos y fuentes

- **Material del curso:** documentos 00–06 y guías del proyecto Kanban de la clase 03, cuya estructura se replica aquí.
- **Código real:** controllers, services, DTOs, repositories, SQL y pruebas de la Biblioteca.
- **Referencias:** SWEBOK, UML/OMG, C4, Scrum Guide y Kanban Guide.

## Evidencia de pruebas y límites

- Backend: 55 pruebas (24 unitarias con Mockito y 31 web con MockMvc, incluidas las páginas Thymeleaf), sin fallos con Java 21.0.10.
- Frontend: 14 pruebas de los stores con Vitest, sin fallos; compila con `ng build`.
- Las migraciones V1 y V2 se aplicaron correctamente en PostgreSQL 18.1.
- **No validado:** la ejecución completa de los endpoints contra PostgreSQL (tabla de pruebas del Paso 6), la concurrencia y la compilación en Eclipse. Estas verificaciones se hacen siguiendo la guía.
