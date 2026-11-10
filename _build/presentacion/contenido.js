// Presentación resumen · Desarrollo de software aplicado al Sistema de Biblioteca (clase 04).
// Resume la presentación de la clase 03 (117 diapositivas) y agrega: marco de trabajo, Thymeleaf,
// los diagramas del proyecto y los puntos que suelen olvidarse. Se construye con los helpers de lib.js.
const { MX, CW, Y0, YEND } = require('./lib');

const L = (...lineas) => lineas.join('\n');

module.exports = function contenido(d) {
  const { pres, C } = d;
  const SHP = pres.shapes;
  let s;

  // ================================================================ PORTADA
  d.seccion('Inicio');
  d.portada('IPSS · DESARROLLO DE SOFTWARE II',
    'Sistema de Biblioteca',
    'Resumen de desarrollo de software: del requisito al código\nJava 21 · Spring Boot 3.5 · PostgreSQL 18 · Thymeleaf · Angular 21',
    'Resumen de la presentación de la clase 03 (117 diapositivas), aplicado al caso de la evaluación: un sistema de información para una biblioteca que permite buscar libros, realizar préstamos y devoluciones, y consultar disponibilidad. Agrega el marco de trabajo del curso, la vista con Thymeleaf, los diagramas del proyecto y los temas que suelen olvidarse. Cada sección funciona como bloque independiente.');

  s = d.slide('Cómo leer esta presentación', 'Lo esencial para construir la biblioteca',
    'Seis bloques. El primero define cómo vamos a trabajar (Scrum con Kanban). El segundo muestra los diagramas del proyecto. El tercero es Spring Boot, que es lo que evalúa la Unidad 1, e incluye la vista con Thymeleaf. El cuarto cubre calidad, entrega y operación. El quinto reúne lo que casi siempre se olvida, y el sexto conecta todo con la evaluación.');
  d.panel(s, 'Contenido', [
    '1 · Fundamentos y marco de trabajo', '2 · Modelado y arquitectura', '3 · Spring Boot y Thymeleaf',
    '4 · Calidad, entrega y operación', '5 · Lo que suele olvidarse', '6 · Evaluación y ruta del curso',
  ], { x: MX, w: 5.9, fontSize: 17, paraSpaceAfter: 6 });
  d.panel(s, 'El proyecto: Sistema de Biblioteca', [
    'Buscar libros por título, autor, ISBN o categoría', 'Consultar la disponibilidad de cada libro',
    'Realizar préstamos (14 días, máximo 3 activos)', 'Registrar devoluciones', 'Vistas: Thymeleaf (opcional) y Angular',
  ], { x: MX + 6.23, w: 5.9, color: 'accent1', fontSize: 17, paraSpaceAfter: 6 });

  // ================================================================ 1 FUNDAMENTOS Y MARCO
  d.seccion('1 · Fundamentos y marco de trabajo');
  d.divisor('01', 'Fundamentos y marco de trabajo', 'Qué es un buen resultado, cómo se pasa de la necesidad al código y con qué marco vamos a trabajar en el curso.');

  s = d.slide('Fundamentos', 'Qué significa un buen resultado',
    'El software no se evalúa solo porque compila. En la biblioteca: el valor es que el socio encuentre un libro y sepa si puede llevarlo; la corrección es que nunca se preste sin copias; la mantenibilidad es poder cambiar el plazo de 14 días en un solo lugar; la operación es poder levantar el sistema, ver los logs y recuperar los datos.');
  d.cards(s, [
    { t: 'Valor', d: 'El socio encuentra un libro y sabe si puede llevarlo hoy.', c: 'accent1' },
    { t: 'Corrección', d: 'Nunca se presta sin copias ni se superan los 3 préstamos activos.', c: 'accent2' },
    { t: 'Mantenibilidad', d: 'El plazo y el límite viven en constantes y hay pruebas que avisan si algo se rompe.', c: 'accent3' },
    { t: 'Operación', d: 'Migraciones, logs y variables de entorno permiten desplegar y recuperar.', c: 'accent4' },
  ], { cols: 4, h: 3.2 });
  d.destacado(s, 'Un proyecto profesional se juzga por las cuatro dimensiones, no solo por "funciona en mi máquina".', { y: 5.3 });

  s = d.slide('Fundamentos', 'El ciclo de vida del software',
    'Todas las metodologías recorren estas fases. Lo que cambia es cuántas veces se da la vuelta: una sola vez y larga (cascada) o muchas vueltas cortas (ágil). En el curso cada sprint recorre el ciclo completo en pequeño. La operación y los usuarios generan nuevos requisitos.');
  d.flujo(s, [
    { t: 'Requisitos', d: 'Qué se construye y para quién' },
    { t: 'Análisis y diseño', d: 'Diagramas, arquitectura y decisiones' },
    { t: 'Construcción', d: 'Código, revisiones y Git' },
    { t: 'Pruebas', d: 'Evidencia de que funciona' },
    { t: 'Despliegue', d: 'Llevarlo a los usuarios' },
    { t: 'Operación', d: 'Monitorear, corregir y mejorar', c: 'accent1' },
  ], { y: Y0 + 0.4, tSize: 15, dh: 1.2 });
  d.flecha(s, 12.0, 4.55, -10.6, 0, { flipH: true, color: 'accent1', dash: true });
  d.etiqueta(s, 'Retroalimentación: la operación y los usuarios generan nuevos requisitos', { x: MX, y: 4.7, w: CW, h: 0.35, fontSize: 14, color: C.accent1, bold: true });
  d.destacado(s, 'No es una cascada rígida: un hallazgo en pruebas puede obligar a volver al diseño.', { y: 5.6 });

  s = d.slide('Requisitos', 'De la necesidad al criterio de aceptación',
    'Una historia de usuario dice quién, qué y para qué. El criterio de aceptación la vuelve verificable. Distinguir una necesidad de una solución técnica: Java 21 es una restricción del curso, no una necesidad del socio. Declarar lo que queda fuera del alcance evita discusiones después.');
  d.caja(s, 'Como socio, quiero pedir prestado un libro disponible, para llevarlo por 14 días.', { x: MX, y: Y0, w: CW, h: 0.8, fill: 'text2', fontSize: 19 });
  d.tabla(s, ['Tipo', 'Ejemplo en la biblioteca', 'Cómo se comprueba'], [
    ['Funcional', 'Buscar libros por texto y filtrar por disponibles', 'GET /api/libros?q= y su prueba'],
    ['Regla de negocio', 'Máximo 3 préstamos activos por socio', 'El cuarto devuelve 409'],
    ['Calidad', 'El inventario nunca queda negativo', 'CHECK en la base y bloqueo de fila'],
    ['Restricción', 'Java 21 y PostgreSQL', 'Entorno reproducible con mvnw'],
    ['Fuera de alcance', 'Login, multas, reservas y renovaciones', 'Declarado en el documento 01'],
  ], { y: Y0 + 1.05, rowH: 0.5, colW: [2.3, 5.4, 4.43], fontSize: 14 });
  d.destacado(s, 'Criterio: con 3 préstamos activos, el cuarto devuelve 409 y no cambia el inventario.', { y: 6.0, fill: 'accent1' });

  s = d.slide('Requisitos', 'Trazabilidad: del requisito a la prueba',
    'Seguir un requisito hasta la verificación evita que el diseño quede desconectado. El test existente comprueba la regla de forma secuencial con mocks; la garantía concurrente es otra prueba que sigue pendiente y está declarada en el documento 09.');
  d.flujo(s, [
    { t: 'Requisito R-02', d: 'Un socio no puede tener más de 3 préstamos activos' },
    { t: 'Criterio', d: 'Con 3 activos, un nuevo préstamo devuelve 409 y no persiste nada' },
    { t: 'Modelo', d: 'Diagrama de secuencia con rechazo 409' },
    { t: 'Código', d: 'PrestamoServiceImpl.prestar y countBySocioIdAndEstado' },
    { t: 'Prueba', d: 'rechazaElCuartoPrestamoActivoDelSocio', c: 'accent1' },
  ], { y: Y0 + 0.3, tSize: 16, dh: 2.2 });
  d.destacado(s, 'Un test con mocks demuestra la lógica, no la base real ni la concurrencia.', { y: 5.55 });

  s = d.slide('Metodologías', 'Cascada, ágil y sus familias',
    'No son alternativas equivalentes: Agile expresa valores, Scrum es un marco, Kanban es una estrategia de gestión de flujo y XP aporta prácticas técnicas. El enfoque predictivo clásico (por ejemplo el PMBOK Guide 6.ª edición) planifica todo al inicio. Un tablero visual por sí solo no demuestra agilidad.');
  d.tabla(s, ['Enfoque', 'Idea central', 'Conviene cuando', 'Riesgo'], [
    ['Cascada / predictivo', 'Fases secuenciales con plan completo al inicio', 'Requisitos estables y contrato cerrado', 'Se descubre tarde que algo estaba mal'],
    ['Scrum', 'Sprints cortos, roles y eventos definidos', 'Requisitos que evolucionan', 'Ceremonias sin entrega de valor'],
    ['Kanban', 'Visualizar el flujo y limitar el trabajo en curso', 'Trabajo continuo y soporte', 'Tablero sin políticas ni límites'],
    ['XP', 'Pruebas, integración continua, pares', 'Calidad técnica exigente', 'Disciplina difícil de sostener'],
    ['Híbrido', 'Gobierno predictivo y ejecución ágil', 'Organizaciones con proyectos reglados', 'Lo peor de ambos mundos'],
  ], { rowH: 0.78, colW: [2.2, 3.9, 3.2, 2.83], fontSize: 14 });

  s = d.slide('Marco de trabajo', 'Marco propuesto: Scrum (ritmo) y Kanban (flujo)',
    'Propuesta para el curso. Se interpreta "trabajaremos en metodología Spring" como Scrum, con sprints. Cada sprint dura una semana o una clase práctica. El docente actúa como Product Owner, el Scrum Master rota entre los integrantes del grupo (máximo 3 personas) y todos son Developers. Kanban ordena el trabajo dentro del sprint con límite de tareas en curso, igual que el proyecto de la clase 03.');
  d.panel(s, 'Scrum · el ritmo', [
    'Sprint de 1 semana con objetivo concreto', 'Roles: Product Owner (docente), Scrum Master (rota), Developers',
    'Eventos: Planning, Daily de 5 min, Review y Retrospectiva', 'Artefactos: Product Backlog, Sprint Backlog e Incremento',
    'Compromiso: Definition of Done',
  ], { x: MX, w: 5.9, h: 4.0, fontSize: 16, paraSpaceAfter: 6 });
  const cols = [['Por hacer', 'accent4'], ['En curso (máx. 3)', 'accent3'], ['Revisión', 'accent2'], ['Hecho', 'accent1']];
  s.addShape(SHP.ROUNDED_RECTANGLE, { x: MX + 6.23, y: Y0, w: 5.9, h: 4.0, rectRadius: 0.1, fill: { color: C.background2 }, line: { type: 'none' }, objectName: 'kanban-fondo' });
  s.addText('Kanban · el flujo', { isTextBox: true, x: MX + 6.5, y: Y0 + 0.2, w: 5.4, h: 0.4, fontSize: 18, bold: true, color: C.text2, margin: 0, objectName: 'kanban-t' });
  cols.forEach(([t, c], i) => {
    const x = MX + 6.45 + i * 1.4;
    d.caja(s, t, { x, y: Y0 + 0.8, w: 1.3, h: 0.75, fill: c, fontSize: 13 });
    d.caja(s, ['H4', 'H3', 'H2', 'H1'][i], { x: x + 0.1, y: Y0 + 1.7 + (i === 1 ? 0 : 0.0), w: 1.1, h: 0.55, fill: 'background1', color: 'text1', fontSize: 14, borde: c });
  });
  d.bullets(s, ['Límite de 3 tareas en curso por equipo', 'Una tarea sin revisión no está hecha'], { x: MX + 6.5, y: Y0 + 2.6, w: 5.4, h: 1.2, fontSize: 15 });
  d.destacado(s, 'Marco elegido: Scrum + Kanban, con prácticas ligeras del PMBOK 7 (interesados, riesgos y valor).', { y: 5.95 });

  s = d.slide('Marco de trabajo', 'Por qué este marco y qué tomamos del PMBOK',
    'El PMBOK Guide 6.ª edición es predictivo y por procesos: es demasiado formal para grupos de 3 personas y un trimestre. El PMBOK Guide 7.ª edición cambió a principios y dominios de desempeño y admite enfoques adaptativos: de ahí tomamos la gestión de interesados, de riesgos y la entrega de valor. ISO/IEC/IEEE 12207 es la referencia del ciclo de vida del software.');
  d.tabla(s, ['Marco', 'Enfoque', 'Qué usamos en el curso'], [
    ['PMBOK 6', 'Procesos y planificación predictiva', 'Demasiado formal para 3 personas y un trimestre'],
    ['PMBOK 7', 'Principios y dominios de desempeño', 'Interesados, riesgos, calidad y entrega de valor'],
    ['Scrum', 'Marco ágil en sprints', 'El ritmo: planning, review y retrospectiva'],
    ['Kanban', 'Gestión del flujo y del WIP', 'El tablero y el límite de trabajo en curso'],
    ['ISO/IEC/IEEE 12207', 'Procesos del ciclo de vida del software', 'Referencia para nombrar las fases'],
  ], { rowH: 0.7, colW: [2.6, 4.3, 5.23], fontSize: 14 });
  d.destacado(s, 'Elegir un marco es una decisión de contexto: tamaño del equipo, tiempo y grado de incertidumbre.', { y: 5.95 });

  s = d.slide('Marco de trabajo', 'Plan de sprints del curso',
    'Propuesta que sigue la guía y el proyecto base. En el sprint 1 los alumnos completan los services (desde el archivo 4.4 de la guía). En el sprint 2 hacen la primera pantalla con Thymeleaf y luego config y controllers REST. En el sprint 3 escriben tests y conectan Angular. En el sprint 4 se consolida: seguridad, informe y revisión. Ajustar a las clases reales.');
  d.flujo(s, [
    { t: 'Sprint 0', d: 'Entorno, base de datos y proyecto base levantado (pasos 0 y 1)' },
    { t: 'Sprint 1', d: 'Services con las reglas de negocio (paso 4, desde el archivo 4.4)' },
    { t: 'Sprint 2', d: 'Thymeleaf (4B), config (5) y controllers REST (6) probados en Swagger' },
    { t: 'Sprint 3', d: 'Tests (7) y conexión con Angular (8)' },
    { t: 'Sprint 4', d: 'Seguridad, Git, informe y revisión final', c: 'accent1' },
  ], { y: Y0 + 0.3, tSize: 18, dh: 2.6 });
  d.destacado(s, 'Cada sprint termina con un incremento que compila, se levanta y se verifica.', { y: 5.7 });

  s = d.slide('Marco de trabajo', 'Definition of Done y backlog inicial',
    'La Definition of Done es transversal: aplica a toda historia. Los criterios de aceptación pertenecen a cada historia. El backlog se ordena por valor: primero lo que permite prestar y devolver, al final lo accesorio. Los identificadores H1 a H6 se corresponden con los casos de uso del diagrama.');
  d.panel(s, 'Definition of Done', [
    'Criterios de aceptación cumplidos', 'Compila y .\\mvnw.cmd test en verde', 'Revisado por otro integrante',
    'Migración nueva si cambia el esquema', 'Sin secretos en el repositorio', 'Documentación actualizada',
  ], { x: MX, w: 4.7, h: 5.05, fontSize: 15, paraSpaceAfter: 6 });
  d.tabla(s, ['Id', 'Historia', 'Prioridad', 'Sprint'], [
    ['H1', 'Buscar libros', 'Alta', '1-2'],
    ['H2', 'Consultar disponibilidad', 'Alta', '1-2'],
    ['H3', 'Realizar préstamo', 'Alta', '1-2'],
    ['H4', 'Devolver libro', 'Alta', '1-2'],
    ['H5', 'Ver mis préstamos', 'Media', '3'],
    ['H6', 'Agregar libro al catálogo', 'Baja', '3'],
  ], { x: MX + 5.0, w: 7.13, rowH: 0.62, colW: [0.8, 3.9, 1.35, 1.08], fontSize: 15 });

  // ================================================================ 2 MODELADO Y ARQUITECTURA
  d.seccion('2 · Modelado y arquitectura');
  d.divisor('02', 'Modelado y arquitectura', 'Los diagramas del proyecto: qué responde cada uno y cómo se organiza el sistema por dentro y por fuera.');

  s = d.slide('Modelado', 'Qué diagrama responde cada pregunta',
    'No se trata de dibujar por cumplir: se escoge el modelo mínimo que aclare una decisión. Todos estos diagramas están hechos en la carpeta docs del proyecto, en Mermaid o SVG, y se revisan contra el código cuando cambia una regla.');
  d.tabla(s, ['Pregunta', 'Diagrama', 'Dónde está'], [
    ['¿Quién usa qué?', 'UML de casos de uso', 'docs/00 y img/casos-de-uso.svg'],
    ['¿Qué unidades ejecutan el sistema?', 'C4: contenedores', 'docs/10 y esta presentación'],
    ['¿Qué piezas colaboran?', 'Capas y UML de clases', 'docs/02 y docs/04'],
    ['¿Qué se guarda y cómo se relaciona?', 'Modelo entidad-relación', 'docs/06'],
    ['¿Qué ocurre y en qué orden?', 'UML de secuencia', 'docs/05'],
    ['¿Qué cambios son válidos?', 'UML de estados', 'docs/10, sección 4'],
  ], { rowH: 0.7, colW: [4.5, 3.4, 4.23], fontSize: 15 });

  // ---- Casos de uso (diagrama completo dibujado con formas editables)
  s = d.slide('Modelado', 'UML: casos de uso de la biblioteca',
    'Diagrama completo, igual al del documento 00. El actor es un rol externo: el Usuario (un socio, sin login). Cada óvalo grande es un objetivo del usuario. Include significa que el caso siempre incorpora ese comportamiento: realizar un préstamo siempre verifica las reglas, devolver siempre libera la copia y agregar un libro siempre valida los datos. Extend significa un comportamiento condicionado: el rechazo ocurre solo si no hay copias, hay límite o hay duplicado, o si la devolución ya se hizo. No todo error es una extensión UML: en el código estas reglas viven en el service.');
  // actor
  s.addShape(SHP.OVAL, { x: 0.85, y: 3.05, w: 0.5, h: 0.5, fill: { color: C.accent1 }, line: { type: 'none' }, objectName: 'actor-cabeza' });
  [[1.1, 3.55, 0.001, 0.75, false], [0.65, 3.8, 0.9, 0.001, false], [0.7, 4.3, 0.4, 0.65, true], [1.1, 4.3, 0.4, 0.65, false]].forEach(([x, y, w, h, fh], i) => {
    s.addShape(SHP.LINE, { x, y, w, h, flipH: fh, line: { color: C.text2, width: 2.5 }, objectName: 'actor-' + i });
  });
  d.etiqueta(s, 'Usuario', { x: 0.35, y: 5.05, w: 1.5, h: 0.3, fontSize: 15, bold: true, color: C.text2 });
  d.etiqueta(s, '(socio, sin login)', { x: 0.3, y: 5.33, w: 1.6, h: 0.3, fontSize: 12 });
  // frontera del sistema
  s.addShape(SHP.ROUNDED_RECTANGLE, { x: 2.5, y: 1.55, w: 10.23, h: 5.1, rectRadius: 0.1, fill: { type: 'none' }, line: { color: C.accent1, width: 1.5 }, objectName: 'sistema' });
  d.etiqueta(s, 'Sistema: Biblioteca', { x: 2.5, y: 1.6, w: 10.23, h: 0.3, fontSize: 14, bold: true, color: C.accent1 });
  // casos de uso principales
  const cus = ['CU-01 Buscar libros', 'CU-02 Consultar disponibilidad', 'CU-03 Realizar préstamo', 'CU-04 Devolver libro', 'CU-05 Ver mis préstamos', 'CU-06 Agregar libro'];
  const CX = 2.9, CWV = 4.0, AX = 8.85, AW = 3.6;
  const ycs = cus.map((_, i) => 2.3 + i * 0.8);
  cus.forEach((cu, i) => {
    const yc = ycs[i];
    s.addShape(SHP.LINE, { x: 1.6, y: Math.min(3.8, yc), w: CX - 1.6, h: Math.abs(yc - 3.8) || 0.001, flipV: yc < 3.8, line: { color: C.accent5, width: 1.25 }, objectName: 'asoc-' + i });
    d.caja(s, cu, { x: CX, y: yc - 0.31, w: CWV, h: 0.62, fill: 'text2', fontSize: 15, forma: SHP.OVAL });
  });
  // casos auxiliares: include (siempre) y extend (a veces)
  const aux = [
    ['Verificar reglas del préstamo', 3.35, 2, 'include'],
    ['Rechazar préstamo (409)', 4.05, 2, 'extend'],
    ['Liberar la copia', 4.8, 3, 'include'],
    ['Rechazar devolución repetida', 5.45, 3, 'extend'],
    ['Validar datos', 6.3, 5, 'include'],
  ];
  aux.forEach(([t, ya, ic, tipo]) => {
    d.caja(s, t, { x: AX, y: ya - 0.27, w: AW, h: 0.54, fill: 'background2', color: 'text1', borde: 'accent2', fontSize: 13, bold: false, forma: SHP.OVAL });
    const xo = CX + CWV, xa = AX, yo = ycs[ic];
    if (tipo === 'include') {
      d.flecha(s, xo, yo, xa - xo, ya - yo, { dash: true });
    } else {
      d.flecha(s, xa, ya, xo - xa, yo - ya, { dash: true });
    }
    d.etiqueta(s, tipo === 'include' ? '«include»' : '«extend»', { x: xo + 0.15, y: (yo + ya) / 2 - 0.3, w: 1.4, h: 0.28, fontSize: 11, italic: true });
  });
  d.etiqueta(s, '«include»: siempre\n«extend»: a veces, bajo una condición', { x: 0.2, y: 5.9, w: 2.2, h: 0.7, fontSize: 11, align: 'left' });

  s = d.slide('Modelado', 'De cada caso de uso al endpoint',
    'Cada óvalo principal se convierte en una cadena de piezas: endpoint REST, método del controller, método del service, repository y tabla. Las validaciones son anotaciones en los DTO (400); los rechazos son reglas del service (409); un id inexistente es 404. La vista Thymeleaf reutiliza los mismos services con sus propias rutas bajo /web.');
  d.tabla(s, ['Caso de uso', 'Endpoint REST', 'Método del service', 'Errores posibles'], [
    ['CU-01 Buscar libros', 'GET /api/libros?q=&soloDisponibles=', 'buscar()', 'Ninguno'],
    ['CU-02 Consultar disponibilidad', 'GET /api/libros/{id}/disponibilidad', 'consultarDisponibilidad()', '404'],
    ['CU-03 Realizar préstamo', 'POST /api/prestamos', 'prestar()', '400, 404 y 409'],
    ['CU-04 Devolver libro', 'PATCH /api/prestamos/{id}/devolucion', 'devolver()', '404 y 409'],
    ['CU-05 Ver mis préstamos', 'GET /api/prestamos?socioId=&estado=', 'listar()', '400 (estado inválido)'],
    ['CU-06 Agregar libro', 'POST /api/libros', 'crear()', '400 y 409 (ISBN repetido)'],
  ], { rowH: 0.62, colW: [3.2, 4.4, 2.5, 2.03], fontSize: 14 });
  d.destacado(s, 'Vista Thymeleaf: los mismos services en /web/libros, /web/libros/{id}/disponibilidad y /web/prestamos.', { y: 5.95, fontSize: 15 });

  s = d.slide('Arquitectura', 'Contenedores del sistema (C4 nivel 2)',
    'C4 nivel 2: aplicaciones y almacenes de datos que se ejecutan. No implica Docker. Angular corre en el navegador y habla JSON con la API en /api. La vista Thymeleaf vive dentro del mismo Spring Boot y entrega HTML en /web. Ambas llaman a los mismos services. En desarrollo Angular usa un proxy hacia el puerto 8084.');
  d.caja(s, 'Usuario\n(socio)', { x: MX, y: 3.1, w: 1.7, h: 1.0, fill: 'accent1', fontSize: 15 });
  d.caja(s, 'Angular 21\nNavegador · :4201', { x: 3.2, y: 2.2, w: 2.7, h: 0.95, fill: 'accent4', fontSize: 14 });
  s.addShape(SHP.ROUNDED_RECTANGLE, { x: 6.6, y: 1.75, w: 3.5, h: 3.75, rectRadius: 0.1, fill: { color: C.background2 }, line: { color: C.accent2, width: 1.5 }, objectName: 'spring-fondo' });
  d.etiqueta(s, 'Spring Boot 3.5 · Java 21 · :8084', { x: 6.6, y: 1.82, w: 3.5, h: 0.3, fontSize: 13, bold: true, color: C.accent2 });
  d.caja(s, 'API REST\n/api/...', { x: 6.85, y: 2.3, w: 3.0, h: 0.85, fill: 'accent2', fontSize: 14 });
  d.caja(s, 'Vista Thymeleaf\n/web/...', { x: 6.85, y: 3.35, w: 3.0, h: 0.85, fill: 'accent3', fontSize: 14 });
  d.caja(s, 'Services + Repositories', { x: 6.85, y: 4.45, w: 3.0, h: 0.8, fill: 'text2', fontSize: 14 });
  d.caja(s, 'PostgreSQL 18\nbiblioteca_db · :5432', { x: 10.75, y: 4.3, w: 1.98, h: 1.1, fill: 'accent5', fontSize: 13 });
  d.flecha(s, 2.3, 3.2, 0.9, -0.5, {});
  d.flecha(s, 5.9, 2.65, 0.7, 0, {});
  d.etiqueta(s, 'JSON', { x: 5.9, y: 2.3, w: 0.7, h: 0.3, fontSize: 12 });
  d.flecha(s, 2.3, 3.9, 4.3, -0.15, {});
  d.etiqueta(s, 'HTML (navegador)', { x: 3.2, y: 3.45, w: 3.0, h: 0.3, fontSize: 12 });
  d.flecha(s, 10.1, 4.85, 0.65, 0, {});
  d.etiqueta(s, 'JDBC', { x: 10.05, y: 4.5, w: 0.7, h: 0.3, fontSize: 12 });
  d.destacado(s, 'Angular usa /api (JSON) y Thymeleaf usa /web (HTML), pero los dos usan los mismos services y reglas.', { y: 5.85, fontSize: 15 });

  s = d.slide('Arquitectura', 'MVC en capas: quién habla con quién',
    'Una capa solo habla con la de abajo. El controller traduce HTTP, el service concentra las reglas de negocio, el repository accede a datos. Entity y DTO son clases distintas: la entity habla con la base y el DTO con el cliente, por eso el cliente no puede fijar el vencimiento ni las copias disponibles. MVC y capas describen aspectos distintos del diseño.');
  ['Cliente (Angular / navegador)', 'Controller · HTTP y @Valid', 'Service · reglas de negocio', 'Repository · acceso a datos', 'PostgreSQL'].forEach((t, i) => {
    const y = Y0 + 0.05 + i * 1.02;
    d.caja(s, t, { x: MX, y, w: 4.3, h: 0.72, fill: ['accent5', 'accent4', 'accent2', 'accent3', 'text2'][i], fontSize: 15 });
    if (i < 4) d.flecha(s, MX + 2.15, y + 0.74, 0, 0.26);
  });
  d.tabla(s, ['Capa', 'Responsabilidad', 'No debe hacer'], [
    ['Controller', 'Recibir HTTP, validar, devolver el código', 'Reglas de negocio ni consultas'],
    ['Service', 'Reglas: copias, límite de 3, duplicado, devolver una vez', 'Saber de HTTP'],
    ['Repository', 'Leer y guardar en la base', 'Reglas de negocio'],
    ['Entity / DTO / Mapper', 'Persistencia, contrato HTTP y conversión', 'Mezclar entity y DTO'],
  ], { x: MX + 4.7, w: 7.43, rowH: 0.95, colW: [1.9, 3.1, 2.43], fontSize: 14 });

  s = d.slide('Arquitectura', 'Estilos de arquitectura y la decisión del proyecto',
    'La arquitectura no se elige por prestigio. Para una API pequeña, un equipo y PostgreSQL, un monolito en capas es suficiente y de bajo costo. Si aparecieran integraciones reemplazables y reglas complejas se estudiaría puertos y adaptadores. Microservicios no son el paso obligatorio siguiente: distribuirían la transacción prestar más descontar una copia. El ADR registra la decisión y la condición para revisarla.');
  d.tabla(s, ['Estilo', 'Aporta cuando', 'Costo'], [
    ['Capas', 'CRUD con reglas acotadas', 'Puede acoplar el negocio a JPA'],
    ['Monolito modular', 'Varias funciones con límites claros', 'Exige disciplina entre módulos'],
    ['Puertos y adaptadores', 'Aislar dominio e integraciones', 'Más contratos y mapeos'],
    ['Microservicios', 'Autonomía de equipos y despliegues', 'Red, observabilidad y consistencia'],
  ], { w: 7.5, rowH: 1.0, colW: [2.2, 2.7, 2.6], fontSize: 14 });
  d.panel(s, 'ADR · decisión', [
    'Contexto: API pequeña, un equipo, PostgreSQL', 'Decisión: monolito en capas', 'Alternativas: hexagonal o servicios separados',
    'Revisar si: varias entradas duplican lógica',
  ], { x: MX + 7.8, w: 4.33, color: 'accent1', fontSize: 14, paraSpaceAfter: 6 });

  s = d.slide('Modelado', 'Modelo de datos: libro, socio y préstamo',
    'Tres tablas. Un libro puede estar en muchos préstamos, un socio puede tener varios y cada préstamo une exactamente un libro con un socio. Las restricciones de la base son una segunda defensa: ejemplares_disponibles entre 0 y el total, ISBN y correo únicos, y un índice único parcial que impide dos préstamos activos del mismo libro para un socio. El límite de 3 y el plazo de 14 días viven en el service.');
  const tabla = (x, w, titulo, color, campos) => {
    d.caja(s, titulo, { x, y: Y0, w, h: 0.55, fill: color, fontSize: 17 });
    s.addShape(SHP.RECTANGLE, { x, y: Y0 + 0.55, w, h: campos.length * 0.33 + 0.3, fill: { color: C.background2 }, line: { color, width: 1 }, objectName: 'tabla-' + titulo });
    s.addText(campos.join('\n'), { isTextBox: true, x: x + 0.2, y: Y0 + 0.68, w: w - 0.4, h: campos.length * 0.33, fontFace: 'Courier New', fontSize: 14, color: C.text1, valign: 'top', margin: 0, objectName: 'campos-' + titulo });
  };
  tabla(MX, 3.7, 'LIBRO', 'accent2', ['id PK', 'titulo', 'autor', 'isbn UNIQUE', 'categoria', 'anio_publicacion', 'ejemplares_totales', 'ejemplares_disponibles']);
  tabla(MX + 4.2, 3.9, 'PRESTAMO', 'accent1', ['id PK', 'libro_id FK', 'socio_id FK', 'fecha_prestamo', 'fecha_vencimiento', 'fecha_devolucion', 'estado ACTIVO|DEVUELTO']);
  tabla(MX + 8.7, 3.43, 'SOCIO', 'accent4', ['id PK', 'nombre', 'email UNIQUE']);
  d.etiqueta(s, '1 ── *', { x: MX + 3.7, y: Y0 + 1.0, w: 0.5, h: 0.3, fontSize: 12, color: C.accent3, bold: true });
  d.etiqueta(s, '* ── 1', { x: MX + 8.1, y: Y0 + 1.0, w: 0.6, h: 0.3, fontSize: 12, color: C.accent3, bold: true });
  d.destacado(s, 'CHECK 0 ≤ disponibles ≤ totales  ·  UNIQUE isbn y email  ·  índice único parcial (socio, libro) activo', { y: 5.75, fontSize: 15 });

  s = d.slide('Modelado', 'Reglas de negocio y estados del préstamo',
    'Las cinco reglas viven en el service, no en el controller ni en Angular. Un préstamo nace ACTIVO y pasa a DEVUELTO; no hay vuelta atrás, y la segunda devolución se rechaza para no sumar copias de más. El estado vencido no se almacena: se calcula con la fecha de vencimiento.');
  d.tabla(s, ['Regla', 'Si se incumple'], [
    ['R-01 Sin copias no hay préstamo', '409 LibroSinEjemplares'],
    ['R-02 Máximo 3 préstamos activos', '409 LimitePrestamosExcedido'],
    ['R-03 No repetir el mismo libro', '409 PrestamoDuplicado'],
    ['R-04 Devolver una sola vez', '409 PrestamoYaDevuelto'],
    ['R-05 Plazo de 14 días (lo fija el sistema)', 'El cliente no envía fechas'],
  ], { w: 7.3, rowH: 0.8, colW: [4.3, 3.0], fontSize: 14 });
  d.caja(s, 'ACTIVO', { x: 9.4, y: 2.3, w: 2.6, h: 0.8, fill: 'accent3', fontSize: 18 });
  d.caja(s, 'DEVUELTO', { x: 9.4, y: 4.5, w: 2.6, h: 0.8, fill: 'accent2', fontSize: 18 });
  d.flecha(s, 10.7, 3.12, 0, 1.36);
  d.etiqueta(s, 'devolver', { x: 10.85, y: 3.55, w: 1.6, h: 0.3, fontSize: 13, align: 'left', color: C.text2 });
  d.flecha(s, 10.7, 1.65, 0, 0.62);
  d.etiqueta(s, 'prestar', { x: 10.85, y: 1.8, w: 1.6, h: 0.3, fontSize: 13, align: 'left', color: C.text2 });
  d.etiqueta(s, 'vencido = ACTIVO con fecha pasada\n(dato calculado, no un estado)', { x: 8.6, y: 5.55, w: 4.2, h: 0.6, fontSize: 13 });

  s = d.slide('Modelado', 'Secuencia: realizar un préstamo',
    'Camino exitoso simplificado. El controller valida el cuerpo y llama al service. El service busca al socio y al libro, bloqueando la fila del libro con FOR UPDATE, comprueba duplicado, límite y copias, descuenta una copia y crea el préstamo. La respuesta 201 ocurre después de confirmar la transacción, aunque save no ejecute el SQL en ese instante.');
  d.secuencia(s, ['Navegador / Angular', 'PrestamoController', 'PrestamoServiceImpl', 'Repositories', 'PostgreSQL'], [
    { de: 0, a: 1, t: 'POST /api/prestamos' },
    { de: 1, a: 1, t: '@Valid CrearPrestamoRequest' },
    { de: 1, a: 2, t: 'prestar(request)' },
    { de: 2, a: 3, t: 'socio y libro (bloqueo)' },
    { de: 3, a: 4, t: 'SELECT ... FOR UPDATE' },
    { de: 2, a: 2, t: 'duplicado, límite y copias: ok' },
    { de: 2, a: 3, t: 'save(libro) y save(préstamo)' },
    { de: 3, a: 4, t: 'UPDATE libro / INSERT' },
    { de: 2, a: 1, t: 'PrestamoResponse', ret: true },
    { de: 1, a: 0, t: '201 Created + Location', ret: true },
  ], { dy: 0.44 });

  s = d.slide('Modelado', 'Secuencia: rechazo con 409',
    'Cuando una regla falla, el service lanza una excepción sin llamar a save. Spring MVC resuelve la excepción mediante GlobalExceptionHandler, que construye el ApiError y la respuesta 409: el controller no llama al handler manualmente. El cliente muestra el mensaje y conserva el estado del servidor. Los tests comprueban que no se escribe nada con verify never.');
  d.secuencia(s, ['Navegador / Angular', 'Spring MVC', 'PrestamoServiceImpl', 'PrestamoRepository', 'GlobalExceptionHandler'], [
    { de: 0, a: 1, t: 'POST /api/prestamos' },
    { de: 1, a: 2, t: 'prestar(request)' },
    { de: 2, a: 3, t: 'countBySocioIdAndEstado → 3' },
    { de: 2, a: 2, t: 'warn: loan limit reached', error: true },
    { de: 2, a: 1, t: 'LimitePrestamosExcedido', error: true, ret: true },
    { de: 1, a: 4, t: 'resolver excepción' },
    { de: 4, a: 0, t: '409 + ApiError', error: true, ret: true },
  ], { dy: 0.6 });

  // ================================================================ 3 SPRING BOOT
  d.seccion('3 · Spring Boot y Thymeleaf');
  d.divisor('03', 'Spring Boot y Thymeleaf', 'El framework de la asignatura: qué es, cómo se configura, cómo se organiza el proyecto y cómo se agrega una vista HTML.');

  s = d.slide('Spring Boot', 'Qué es Spring Boot y frente a qué compite',
    'Spring Boot es una forma de usar el ecosistema Spring con convenciones: configura por ti lo habitual, trae servidor embebido y empaqueta todo en un solo jar ejecutable. Resultado de aprendizaje 1.1: describir sus características y diferenciarlo de otros frameworks. Las comparaciones son por estructura y funcionalidad, no un ranking.');
  d.cards(s, [
    { t: 'Autoconfiguración', d: 'Crea beans según lo que hay en el classpath.', c: 'accent1' },
    { t: 'Starters', d: 'Paquetes de dependencias compatibles entre sí.', c: 'accent2' },
    { t: 'Servidor embebido', d: 'Tomcat dentro del jar: no se instala aparte.', c: 'accent3' },
    { t: 'Listo para producción', d: 'Perfiles, métricas y salud con Actuator.', c: 'accent4' },
  ], { cols: 2, h: 1.95, w: 5.9 });
  d.tabla(s, ['Alternativa', 'Diferencia con Spring Boot'], [
    ['Spring sin Boot', 'Mismo núcleo, pero configuración manual y despliegue típico como WAR'],
    ['Jakarta EE', 'Estándar sobre un servidor de aplicaciones; Boot empaqueta el servidor'],
    ['Quarkus / Micronaut', 'Enfocados en arranque rápido y poca memoria; ecosistema menor'],
    ['Node (Express/Nest), Django', 'Otro lenguaje; Spring aporta tipado fuerte y un ecosistema empresarial'],
  ], { x: MX + 6.23, w: 5.9, rowH: 1.0, colW: [2.0, 3.9], fontSize: 13 });

  s = d.slide('Spring Boot', 'Autoconfiguración y ambientes: dev, test y prod',
    'Primera pregunta de la evaluación. La autoconfiguración observa el classpath y las propiedades, y crea beans: con el driver de PostgreSQL y una URL arma el DataSource, con el starter web levanta Tomcat, con Flyway migra el esquema. Para cambiar de ambiente no se cambia el código: se cambia la configuración externa, con variables de entorno y perfiles (application-dev.yml, application-prod.yml, spring.profiles.active).');
  d.bullets(s, [
    'Se agrega un starter y Boot configura lo habitual',
    'El mismo jar corre en desarrollo, prueba y producción',
    'Variables de entorno: DB_USER, DB_PASSWORD, SERVER_PORT',
    'Perfiles: application-dev.yml y application-prod.yml',
    'Flyway deja el esquema igual en todos los ambientes',
    'Los secretos no van en el repositorio',
  ], { x: MX, y: Y0 + 0.1, w: 5.7, h: 4.9, fontSize: 17, paraSpaceAfter: 9 });
  d.codigo(s, L(
    'spring:',
    '  datasource:',
    '    url: jdbc:postgresql://${DB_HOST:localhost}...',
    '    username: ${DB_USER:biblioteca}',
    '    password: ${DB_PASSWORD:biblioteca}',
    '  jpa:',
    '    hibernate:',
    '      ddl-auto: validate',
    'app:',
    '  web:',
    '    enabled: ${WEB_THYMELEAF:true}',
    '',
    '# ${VARIABLE:valor} = usa la variable o,',
    '# si no existe, el valor por defecto',
  ), { x: MX + 6.0, w: 6.13, h: 4.8, etiqueta: 'application.yml (resumido)', fontSize: 13 });

  s = d.slide('Spring Boot', 'Starters y gestión de dependencias',
    'Segunda pregunta de la evaluación: dos starters esenciales. spring-boot-starter-web porque la biblioteca expone una API REST (Spring MVC, Jackson y Tomcat). spring-boot-starter-data-jpa porque guarda libros, socios y préstamos (Hibernate, repositories y transacciones). El parent de Spring Boot fija las versiones compatibles de todas las dependencias.');
  d.tabla(s, ['Starter', 'Para qué', 'Trae'], [
    ['starter-web', 'API REST y servidor', 'Spring MVC, Jackson, Tomcat'],
    ['starter-data-jpa', 'Persistencia', 'Hibernate, Spring Data, transacciones'],
    ['starter-validation', 'Validar el cuerpo', 'Bean Validation'],
    ['starter-thymeleaf', 'Vista HTML (opcional)', 'Motor de plantillas'],
    ['starter-test', 'Pruebas', 'JUnit 5, Mockito, MockMvc'],
  ], { w: 7.6, rowH: 0.6, colW: [2.3, 2.4, 2.9], fontSize: 14 });
  d.panel(s, 'El parent y el BOM', [
    'spring-boot-starter-parent fija versiones compatibles', 'No se escribe la versión de cada dependencia',
    'Driver de PostgreSQL y Flyway las heredan', 'springdoc sí declara su versión',
  ], { x: MX + 7.9, w: 4.23, h: 4.3, fontSize: 14, paraSpaceAfter: 6 });
  d.destacado(s, 'Dos esenciales: web (API REST) y data-jpa (persistencia).', { y: 6.0, fill: 'accent1' });

  s = d.slide('Spring Boot', 'Inyección de dependencias y patrones del framework',
    'Spring crea y conecta los objetos (beans) y los entrega por constructor: eso es inversión de control. El alcance singleton es por definición de bean y contenedor, no garantiza seguridad entre hilos. Resultado de aprendizaje 1.1.4: explicar los patrones y cómo contribuyen a la eficiencia del desarrollo. Mantener los services sin estado mutable de cada solicitud.');
  d.cards(s, [
    { t: 'Inyección de dependencias', d: 'Spring entrega los repositories y mappers por constructor; nadie hace new.', c: 'accent1' },
    { t: 'Singleton', d: 'Un bean por definición y contenedor: los services no guardan estado de la solicitud.', c: 'accent2' },
    { t: 'Front Controller', d: 'DispatcherServlet recibe todo y reparte a cada controller.', c: 'accent3' },
    { t: 'Proxy', d: '@Transactional envuelve el service para abrir y cerrar la transacción.', c: 'accent4' },
    { t: 'Repository', d: 'Spring Data genera la implementación a partir de la interfaz.', c: 'accent5' },
    { t: 'Advice', d: '@RestControllerAdvice centraliza el manejo de errores.', c: 'accent6' },
  ], { cols: 3 });

  s = d.slide('Spring Boot', 'El proyecto base: qué trae y qué se completa',
    'Estructura de paquetes del proyecto y estado del proyecto base. El base ya trae enums, entity, repository, dto, exception y mapper. Los alumnos continúan desde los services (archivo 4.4 de la guía) y completan service, la vista con Thymeleaf, config y controller. El base compila y arranca aunque esos paquetes estén vacíos.');
  d.codigo(s, L(
    'cl.ipss.biblioteca',
    '├── enums',
    '├── entity',
    '├── repository',
    '├── dto',
    '├── exception',
    '├── mapper',
    '├── service',
    '│   └── impl',
    '├── controller',
    '│   └── web   (Thymeleaf)',
    '└── config',
  ), { x: MX, w: 4.5, h: 5.0, etiqueta: 'Paquetes', fontSize: 14 });
  d.tabla(s, ['Paquete', 'Contenido', 'En el base'], [
    ['enums, entity, repository', 'Modelo y acceso a datos', 'Ya hecho'],
    ['dto, exception, mapper', 'Contrato, errores y conversión', 'Ya hecho'],
    ['service, service.impl', 'Reglas de negocio', 'Se completa (4.4 a 4.9)'],
    ['controller.web', 'Vista Thymeleaf (opcional)', 'Se completa (4B)'],
    ['config', 'Swagger y CORS', 'Se completa (5)'],
    ['controller', 'API REST', 'Se completa (6)'],
  ], { x: MX + 4.8, w: 7.33, rowH: 0.62, colW: [2.5, 2.8, 2.03], fontSize: 14 });

  s = d.slide('Spring Boot', 'La regla en el código: el service decide',
    'Fragmento resumido de PrestamoServiceImpl.prestar, sin los logs. Primero se comprueba el duplicado, luego el límite y por último las copias. Todo corre en una transacción: o se guarda el préstamo y se descuenta la copia, o no se guarda nada. El libro se lee con bloqueo de fila para que dos socios no se lleven la última copia a la vez.');
  d.codigo(s, L(
    '// Regla 3: no repetir el mismo libro',
    'if (prestamoRepository',
    '        .existsBySocioIdAndLibroIdAndEstado(',
    '            socioId, libroId, ACTIVO)) {',
    '    throw new PrestamoDuplicadoException(titulo);',
    '}',
    '// Regla 2: máximo 3 préstamos activos',
    'if (prestamoRepository.countBySocioIdAndEstado(',
    '        socioId, ACTIVO) >= LIMITE_PRESTAMOS_ACTIVOS) {',
    '    throw new LimitePrestamosExcedidoException(3);',
    '}',
    '// Regla 1: debe quedar una copia',
    'if (libro.getEjemplaresDisponibles() <= 0) {',
    '    throw new LibroSinEjemplaresException(titulo);',
    '}',
    'libro.setEjemplaresDisponibles(disponibles - 1);',
  ), { w: 7.5, h: 5.1, etiqueta: 'PrestamoServiceImpl.prestar() (resumido)', fontSize: 12 });
  d.bullets(s, [
    'Un orden fijo de reglas y un mensaje claro por cada una',
    '@Transactional: todo o nada',
    'buscarParaActualizar: SELECT ... FOR UPDATE',
    'Las excepciones llegan al handler y salen como ApiError',
    'LIMITE_PRESTAMOS_ACTIVOS = 3: sin número mágico',
  ], { x: 8.4, y: Y0 + 0.1, w: 4.33, h: 4.9, fontSize: 16, paraSpaceAfter: 8 });

  s = d.slide('Thymeleaf', 'Thymeleaf: una vista HTML dentro de Spring MVC',
    'Thymeleaf es un motor de plantillas: el servidor arma una página HTML con los datos y la envía lista al navegador. Es otra forma de hacer la V de MVC. El programa de la asignatura incluye crear interfaces de usuario con Spring MVC, y esta es la forma más directa. Sirve para probar front y back desde el inicio, sin Node ni Angular. Se agrega con el starter spring-boot-starter-thymeleaf.');
  d.flujo(s, [
    { t: 'Navegador', d: 'GET /web/libros o un formulario POST' },
    { t: '@Controller', d: 'LibroWebController recibe la petición' },
    { t: 'Service', d: 'Los mismos services y reglas que la API' },
    { t: 'Model', d: 'Los datos viajan en el Model' },
    { t: 'Plantilla', d: 'libros.html se completa con th:text y th:each' },
    { t: 'HTML', d: 'El navegador recibe la página lista', c: 'accent1' },
  ], { y: Y0 + 0.3, tSize: 15, dh: 1.6 });
  d.destacado(s, 'Un @Controller devuelve el nombre de una plantilla; un @RestController devuelve JSON.', { y: 4.95 });
  d.etiqueta(s, 'Páginas del proyecto: /web/libros  ·  /web/libros/{id}/disponibilidad  ·  /web/prestamos', { x: MX, y: 5.8, w: CW, h: 0.35, fontSize: 14, color: C.accent3, bold: true });

  s = d.slide('Thymeleaf', 'Thymeleaf en el proyecto: controller y plantilla',
    'A la izquierda, el controller web: devuelve el nombre de la plantilla y deja los datos en el Model. A la derecha, la plantilla: th:each repite la fila por cada libro y th:action arma la dirección del formulario. Después de un POST se responde con una redirección (Post/Redirect/Get) para que refrescar la página no repita el préstamo. Los errores de negocio se capturan con try y catch y se muestran como mensaje.');
  d.codigo(s, L(
    '@Controller',
    '@RequestMapping("/web")',
    '@ConditionalOnProperty(name = "app.web.enabled",',
    '    havingValue = "true", matchIfMissing = true)',
    'public class LibroWebController {',
    '',
    '  @GetMapping("/libros")',
    '  public String catalogo(',
    '      @RequestParam(required = false) String q,',
    '      Model model) {',
    '    model.addAttribute("libros",',
    '        libroService.buscar(q, false));',
    '    return "libros"; // templates/libros.html',
    '  }',
    '}',
  ), { x: MX, w: 6.0, h: 4.45, etiqueta: 'LibroWebController (resumido)', fontSize: 12 });
  d.codigo(s, L(
    '<tr th:each="libro : ${libros}">',
    '  <td th:text="${libro.titulo}">Título</td>',
    '  <td th:if="${libro.disponible}"',
    '      th:text="${libro.ejemplaresDisponibles}',
    '          + \' disponibles\'"></td>',
    '  <td>',
    '    <form method="post"',
    '          th:action="@{/web/prestamos}">',
    '      <input type="hidden" name="libroId"',
    '             th:value="${libro.id}">',
    '      <button th:disabled="${!libro.disponible}">',
    '        Prestar</button>',
    '    </form>',
    '  </td>',
    '</tr>',
  ), { x: MX + 6.23, w: 5.9, h: 4.45, etiqueta: 'templates/libros.html (resumido)', fontSize: 12 });
  d.destacado(s, 'Se apaga con WEB_THYMELEAF=false: no hay que comentar ni borrar código, y Angular sigue funcionando.', { y: 6.2, fontSize: 15, h: 0.55 });

  s = d.slide('Thymeleaf', 'Thymeleaf frente a Angular: cuándo usar cada uno',
    'No compiten: son dos formas de hacer la vista sobre los mismos services. Thymeleaf es ideal para empezar y probar, porque no necesita Node. Angular es la interfaz definitiva: más interactiva y desacoplada del servidor. La recomendación del curso es empezar con Thymeleaf y pasar a Angular, apagando Thymeleaf con la propiedad.');
  d.tabla(s, ['Criterio', 'Thymeleaf (/web)', 'Angular (/api)'], [
    ['Dónde se arma la pantalla', 'En el servidor (HTML listo)', 'En el navegador, con el JSON'],
    ['Controller', '@Controller: nombre de plantilla', '@RestController: JSON'],
    ['Herramientas extra', 'Ninguna: dentro del mismo jar', 'Node, npm y un servidor de desarrollo'],
    ['Interactividad', 'Cada acción recarga la página', 'Actualiza partes sin recargar'],
    ['Pruebas', 'MockMvc renderiza el HTML real', 'Vitest sobre stores y componentes'],
    ['En el curso', 'Primera pantalla y pruebas de front y back', 'Interfaz definitiva (paso 8)'],
  ], { rowH: 0.6, colW: [3.0, 4.5, 4.63], fontSize: 14 });
  d.destacado(s, 'Mismos services, mismas reglas: solo cambia la capa de presentación.', { y: 6.0, fill: 'accent1' });

  // ================================================================ 4 CALIDAD, ENTREGA Y OPERACIÓN
  d.seccion('4 · Calidad, entrega y operación');
  d.divisor('04', 'Calidad, entrega y operación', 'Pruebas, Git, integración continua, seguridad, datos y operación: lo que convierte un proyecto que funciona en uno confiable.');

  s = d.slide('Pruebas', 'La pirámide de pruebas y el estado del proyecto',
    'Muchas pruebas rápidas abajo y pocas lentas arriba. Las 55 pruebas del backend no necesitan base de datos: los services se prueban con Mockito y los controllers con MockMvc, que además renderiza las páginas Thymeleaf. Los 14 tests de Angular prueban los stores. Siguen pendientes las pruebas de integración con PostgreSQL y la de concurrencia sobre la última copia.');
  d.caja(s, 'E2E · pocas', { x: 2.3, y: Y0 + 0.2, w: 2.2, h: 0.95, fill: 'accent1', fontSize: 15 });
  d.caja(s, 'Integración · algunas (pendiente)', { x: 1.4, y: Y0 + 1.3, w: 4.0, h: 0.95, fill: 'accent3', fontSize: 15 });
  d.caja(s, 'Unitarias y web · muchas', { x: 0.6, y: Y0 + 2.4, w: 5.6, h: 0.95, fill: 'accent2', fontSize: 16 });
  d.cifra(s, '55', 'pruebas del backend: Mockito y MockMvc', { x: 7.0, y: Y0 });
  d.cifra(s, '14', 'pruebas del frontend con Vitest', { x: 10.0, y: Y0, color: 'accent2' });
  d.bullets(s, [
    'Pendiente: integración con Flyway, JPA y PostgreSQL',
    'Pendiente: prueba concurrente de la última copia',
    'Un buen test: nombre claro, un solo motivo para fallar',
  ], { x: 7.0, y: Y0 + 2.4, w: 5.7, h: 1.35, fontSize: 15, paraSpaceAfter: 6 });
  d.destacado(s, 'Una prueba automatizada es evidencia repetible, no prueba absoluta de ausencia de defectos.', { y: 5.55, fontSize: 15 });

  s = d.slide('Git', 'Git y flujo de trabajo en equipo',
    'Una historia pequeña por rama, commits descriptivos y un Pull Request con el motivo y cómo se verificó. Las ramas y los mensajes siguen una convención para que el historial se pueda leer. El gitignore excluye target, logs y node_modules. Nunca se fuerza un push: si el remoto tiene cambios se hace pull con rebase. El documento 11 de la clase 03 explica cómo subir el proyecto.');
  d.flujo(s, [
    { t: 'Historia', d: 'Una historia pequeña del backlog' },
    { t: 'Rama', d: 'feature/prestar-libro' },
    { t: 'Commits', d: 'feat: paso 4 - services' },
    { t: 'Pull Request', d: 'Motivo, cambios y verificación' },
    { t: 'Revisión', d: 'Otro integrante revisa' },
    { t: 'Integración', d: 'Merge a main con pruebas en verde', c: 'accent1' },
  ], { y: Y0 + 0.3, tSize: 15, dh: 1.5 });
  d.bullets(s, [
    'Mensajes de commit en español, uno por paso de la guía',
    '.gitignore con target/, logs/ y node_modules/',
    'Nunca git push --force: usar git pull --rebase',
  ], { x: MX, y: 4.6, w: CW, h: 1.6, fontSize: 16 });

  s = d.slide('DevOps', 'Integración continua y contenedores: la propuesta',
    'Propuesta, no implementada: el repositorio todavía no tiene pipeline. Cada push o Pull Request compilaría y ejecutaría las pruebas; solo lo que pasa se empaqueta en una imagen versionada. Docker Compose levantaría base de datos, backend y frontend juntos. CI ejecuta pruebas pero no decide si el requisito es correcto. Los secretos y los ambientes se configuran fuera del código.');
  d.flujo(s, [
    { t: 'Push / PR', d: 'Dispara el pipeline' },
    { t: 'Build', d: 'mvnw verify y ng build' },
    { t: 'Pruebas', d: '55 de backend y 14 de frontend' },
    { t: 'Imagen', d: 'Docker versionada' },
    { t: 'Despliegue', d: 'Ambiente de prueba y luego producción', c: 'accent1' },
  ], { y: Y0 + 0.3, tSize: 16, dh: 1.5 });
  d.panel(s, 'Docker Compose', ['PostgreSQL con volumen', 'Backend con variables de entorno', 'Frontend servido por un servidor web'], { x: MX, y: 4.3, w: 5.9, h: 2.4, fontSize: 14, paraSpaceAfter: 4 });
  d.panel(s, 'Ambientes y secretos', ['Perfiles dev, test y prod', 'Secretos en variables, no en Git', 'Reversión planificada'], { x: MX + 6.23, y: 4.3, w: 5.9, h: 2.4, color: 'accent1', fontSize: 14, paraSpaceAfter: 4 });

  s = d.slide('Seguridad', 'Seguridad: lo implementado y lo que falta',
    'Tercera pregunta de la evaluación. Hoy el proyecto no tiene autenticación: cualquiera podría devolver el préstamo de otro socio. Lo implementado reduce riesgos básicos. Para datos sensibles se propone Spring Security con HTTPS, contraseñas con BCrypt, autenticación con JWT u OAuth2 y autorización por rol y por recurso. El OWASP Top 10 es la lista de riesgos de referencia. Los datos de los socios son personales: usar datos ficticios en clase.');
  d.panel(s, 'Implementado', [
    'Validación de entrada (Bean Validation)', 'Errores sin detalles internos (ApiError)', 'CORS limitado al origen de Angular',
    'Logs sin datos personales', 'Secretos por variables de entorno', 'Transacciones y bloqueo de fila',
  ], { x: MX, w: 5.9, fontSize: 15, paraSpaceAfter: 6 });
  d.panel(s, 'Propuesto con Spring Security', [
    'HTTPS/TLS en todo el tráfico', 'Autenticación: BCrypt y JWT u OAuth2', 'Roles: socio y bibliotecario',
    'Autorización por recurso (solo mis préstamos)', 'CSRF según el tipo de sesión', 'Pruebas de seguridad y OWASP Top 10',
  ], { x: MX + 6.23, w: 5.9, color: 'accent1', fontSize: 15, paraSpaceAfter: 6 });

  s = d.slide('Datos y operación', 'Datos, concurrencia y operación',
    'Las migraciones aplicadas son historial: un cambio va en una versión nueva, nunca se edita una ya aplicada. El inventario de copias es un contador compartido: el bloqueo pesimista y el CHECK de la tabla lo protegen, pero falta la prueba concurrente que lo demuestre. En operación hacen falta logs útiles, salud, métricas y una restauración ensayada.');
  d.cards(s, [
    { t: 'Flyway', d: 'V1 y V2 aplicadas. Un cambio nuevo va en V3; nunca se edita una migración aplicada.', c: 'accent1' },
    { t: 'Concurrencia', d: 'Bloqueo FOR UPDATE y CHECK 0..totales. Falta la prueba concurrente real.', c: 'accent3' },
    { t: 'Logs y salud', d: 'Logs con formato fijo y sin datos sensibles. Actuator para salud y métricas (propuesta).', c: 'accent2' },
    { t: 'Respaldo', d: 'Un respaldo solo sirve si se ha ensayado restaurarlo.', c: 'accent4' },
  ], { cols: 2, h: 2.3 });

  // ================================================================ 5 LO QUE SUELE OLVIDARSE
  d.seccion('5 · Lo que suele olvidarse');
  d.divisor('05', 'Lo que suele olvidarse', 'Temas que no aparecen en la guía paso a paso pero que un desarrollador profesional debe considerar desde el inicio.');

  s = d.slide('Lo que suele olvidarse', 'Técnico: lo que el código no muestra',
    'Cada tema tiene un ejemplo concreto en este proyecto. La paginación es una brecha real: el catálogo devuelve todos los libros. La accesibilidad ya se cuida en parte con etiquetas y foco visible en Angular. La documentación viva es Swagger más los documentos 00 a 10. La deuda técnica se paga con migraciones, actualizaciones de dependencias y refactorización.');
  d.cards(s, [
    { t: 'Rendimiento y paginación', d: 'El catálogo devuelve todos los libros: con miles habría que paginar e indexar.', c: 'accent1' },
    { t: 'Accesibilidad', d: 'Etiquetas, foco visible, contraste y navegación por teclado.', c: 'accent2' },
    { t: 'Internacionalización', d: 'Fechas dd-MM-yyyy y textos fijos: ¿y otros idiomas?', c: 'accent3' },
    { t: 'Documentación viva', d: 'Swagger, README, ADR y guías generadas desde el código.', c: 'accent4' },
    { t: 'Calidad automatizada', d: 'Análisis estático, cobertura y revisión de dependencias.', c: 'accent5' },
    { t: 'Mantenimiento', d: 'Actualizar versiones y pagar la deuda técnica a tiempo.', c: 'accent6' },
  ], { cols: 3 });

  s = d.slide('Lo que suele olvidarse', 'Gestión y personas',
    'La gestión también es parte del desarrollo de software. Los riesgos se identifican y se vigilan. La estimación se corrige con la velocidad real de los sprints. La configuración incluye versiones de la base, entornos y secretos. Los datos de los socios son personales: en Chile aplica la Ley 19.628 y su actualización (Ley 21.719); verificar la vigencia antes de publicar. El código generado con IA sigue siendo responsabilidad de quien lo entrega.');
  d.cards(s, [
    { t: 'Riesgos', d: 'Registro con probabilidad, impacto y respuesta (siguiente diapositiva).', c: 'accent1' },
    { t: 'Estimación y planificación', d: 'Estimar en equipo y corregir con la velocidad real de cada sprint.', c: 'accent2' },
    { t: 'Gestión de la configuración', d: 'Versiones de la base, entornos, secretos y ramas bajo control.', c: 'accent3' },
    { t: 'Interesados y comunicación', d: 'Docente, socios y equipo: quién decide, quién usa, quién revisa.', c: 'accent4' },
    { t: 'Legal, datos personales y licencias', d: 'Ley 19.628 y su actualización; licencias de las dependencias.', c: 'accent5' },
    { t: 'Ética, IA y habilidades', d: 'Responder por el código generado; comunicar y revisar con criterio.', c: 'accent6' },
  ], { cols: 3 });

  s = d.slide('Lo que suele olvidarse', 'Registro de riesgos del proyecto',
    'Ejemplo de registro de riesgos al estilo PMBOK, hecho con los problemas reales de este proyecto. Probabilidad e impacto son una valoración del equipo y se revisan en cada retrospectiva. El riesgo de copia entre alumnos se mitiga entregando el proyecto base y pidiendo argumentación individual.');
  d.tabla(s, ['Riesgo', 'Prob.', 'Impacto', 'Respuesta'], [
    ['No existe la base biblioteca_db', 'Alta', 'Alto', 'Ejecutar crear-bd.sql y verificar con psql'],
    ['Inventario inconsistente por concurrencia', 'Media', 'Alto', 'Bloqueo FOR UPDATE, CHECK y prueba concurrente'],
    ['Versiones distintas de JDK o Node', 'Media', 'Medio', 'mvnw, package-lock y JAVA_HOME documentado'],
    ['Retraso en los sprints', 'Media', 'Medio', 'Alcance mínimo: primero H1 a H4'],
    ['Datos personales expuestos sin login', 'Media', 'Alto', 'Solo datos ficticios hasta tener seguridad'],
    ['Alumnos copian el proyecto terminado', 'Media', 'Medio', 'Entregar el base y pedir argumentación'],
  ], { rowH: 0.7, colW: [4.0, 1.0, 1.2, 5.93], fontSize: 14 });

  // ================================================================ 6 EVALUACIÓN Y RUTA
  d.seccion('6 · Evaluación y ruta del curso');
  d.divisor('06', 'Evaluación y ruta del curso', 'Cómo se conecta el proyecto con la evaluación de la Unidad 1, qué sumar después y qué debe poder explicar cada estudiante.');

  s = d.slide('Evaluación', 'Evaluación Unidad 1: cómo la responde el proyecto',
    'La evaluación es un informe grupal de máximo 3 personas, de hasta 8 páginas, con portada, índice, introducción, desarrollo, conclusión y bibliografía. Pesa el 10 % de la nota final y se exige un 60 % para el 4,0. Las tres preguntas se responden con lo que ya hay en el proyecto, y la seguridad se discute como propuesta porque no está implementada.');
  d.tabla(s, ['Pregunta de la evaluación', 'Concepto', 'Evidencia en el proyecto'], [
    ['1 · Autoconfiguración y ambientes', 'Autoconfiguración y perfiles', 'application.yml con variables y perfiles'],
    ['2 · Dos starters esenciales', 'Starters y dependencias', 'starter-web y starter-data-jpa en el pom.xml'],
    ['3 · Seguridad de datos sensibles', 'Spring Security (propuesta)', 'Lo implementado y la lista de lo que falta'],
  ], { rowH: 0.62, colW: [4.0, 3.5, 4.63], fontSize: 14 });
  d.cards(s, [
    { t: 'Conceptos', d: '20 puntos', c: 'accent1' },
    { t: 'Aplicación práctica', d: '30 puntos', c: 'accent2' },
    { t: 'Argumentación', d: '30 puntos', c: 'accent3' },
    { t: 'Informe y escritura', d: '20 puntos', c: 'accent4' },
  ], { cols: 4, y: 4.3, h: 1.8, numbered: false, tSize: 16, dSize: 22 });
  d.etiqueta(s, 'Formato: Arial 12, interlineado 1,15, justificado, páginas numeradas', { x: MX, y: 6.25, w: CW, h: 0.35, fontSize: 14 });

  s = d.slide('Ruta del curso', 'Qué sumar al proyecto, en orden',
    'La ruta responde a dependencias de aprendizaje: primero resolver el dominio, luego colaboración y pruebas, después seguridad y por último publicación. Mantener Java 21 como base y revisar versiones exactas antes de cada laboratorio.');
  d.tabla(s, ['Etapa', 'Trabajo', 'Resultado esperado'], [
    ['Ahora', 'Services, Thymeleaf, config, controllers, tests y Angular', 'Sistema completo funcionando'],
    ['Siguiente', 'Pull Requests y pruebas de integración con PostgreSQL', 'Flujo de equipo y base real verificada'],
    ['Después', 'Spring Security, paginación y prueba concurrente', 'Datos protegidos e integridad comprobada'],
    ['Antes de publicar', 'CI, Docker Compose, secretos y respaldo', 'Entrega reproducible'],
    ['Evolución', 'Reservas, multas, roles y notificaciones', 'Nuevas historias en el backlog'],
  ], { rowH: 0.85, colW: [2.4, 5.6, 4.13], fontSize: 15 });

  s = d.slide('Cierre', 'Qué debe poder explicar cada estudiante',
    'Ticket de salida: una respuesta de dos frases por tema. Pistas: la autoconfiguración crea beans según el classpath y las propiedades; el DTO y la entity cambian por razones distintas; las reglas viven en el service porque cambian más seguido que el esquema y deben valer para cualquier cliente; dos socios pidiendo la última copia exigen bloqueo y una prueba concurrente.');
  d.cards(s, [
    { t: 'Autoconfiguración', d: 'Qué crea Spring Boot por ti y cómo cambia entre ambientes.' },
    { t: 'DTO frente a entity', d: 'Por qué el cliente no puede fijar el vencimiento ni las copias.', c: 'accent2' },
    { t: 'Dónde viven las reglas', d: 'Por qué en el service y no en el controller ni en Angular.', c: 'accent3' },
    { t: 'Un préstamo, de punta a punta', d: 'Del clic a la base de datos y de vuelta, con éxito y con 409.', c: 'accent4' },
    { t: 'La última copia', d: 'Qué pasa si dos socios la piden a la vez y cómo se prueba.', c: 'accent5' },
    { t: 'Publicarlo', d: 'Qué falta en seguridad, CI y datos antes de ponerlo en producción.', c: 'accent6' },
  ], { cols: 3 });

  // ================================================================ FUENTES Y CIERRE
  d.seccion('Fuentes');
  s = d.slide('Fuentes', 'Referencias',
    'Referencias de cada bloque. Revisar versiones y condiciones antes de cada curso. Las fuentes internas son los documentos 00 a 10 y la guía paso a paso de la carpeta docs.');
  d.panel(s, 'Ingeniería y diseño', [
    'SWEBOK · swebokwiki.org', 'UML 2.5.1 · omg.org/spec/UML', 'Modelo C4 · c4model.com', 'Patrones · martinfowler.com/eaaCatalog',
  ], { x: MX, w: 3.9, fontSize: 14 });
  d.panel(s, 'Proceso y gestión', [
    'Manifiesto Ágil · agilemanifesto.org', 'Scrum Guide · scrumguides.org', 'Kanban Guide · kanbanguides.org', 'PMBOK Guide · pmi.org/standards',
  ], { x: MX + 4.12, w: 3.9, color: 'accent2', fontSize: 14 });
  d.panel(s, 'Tecnología', [
    'Spring · docs.spring.io', 'Thymeleaf · thymeleaf.org', 'OWASP Top 10 · owasp.org/Top10', 'PostgreSQL y Flyway · documentación oficial',
  ], { x: MX + 8.24, w: 3.9, color: 'accent1', fontSize: 14 });

  d.portada('DESARROLLO DE SOFTWARE II', 'Preguntas',
    'El código está en clase-04-biblioteca · Guías en docs/\nPrimero lo general, luego el proyecto: cada tema deja una evidencia',
    'Cierre. Recordar las guías (GUIA-COMPLETA-PASO-A-PASO.md y 08-guia-angular-paso-a-paso.md), el proyecto base para completar con los alumnos y la evaluación de la Unidad 1.');
};
