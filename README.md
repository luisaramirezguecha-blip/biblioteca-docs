# Biblioteca · Documentación

Documentación del proyecto **Sistema de Biblioteca** · Java 21 · Spring Boot 3.5 · PostgreSQL 18 · Thymeleaf · Angular 21
IPSS · Desarrollo de Software II · Clase 04

> **Requerimiento:** un sistema de información para una biblioteca que permita a los usuarios buscar libros, realizar préstamos y devoluciones, y consultar la disponibilidad de libros.
>
> **Documento principal:** [GUIA-COMPLETA-PASO-A-PASO.md](GUIA-COMPLETA-PASO-A-PASO.md): el backend paso a paso, desde el proyecto base hasta probarlo todo en Swagger.

## Ruta de estudio

0. [00 · Casos de uso](00-casos-de-uso.md)
1. [01 · El problema](01-problema.md)
2. [02 · Teoría: MVC en capas](02-teoria-mvc.md)
3. [03 · Patrones de diseño](03-patrones-de-diseno.md)
4. [04 · UML de clases](04-uml-clases.md)
5. [05 · UML de secuencia](05-uml-secuencia.md)
6. [06 · Modelo de base de datos](06-modelo-base-de-datos.md)
7. [**Guía completa paso a paso del backend**](GUIA-COMPLETA-PASO-A-PASO.md) (incluye el **Paso 4B: vista opcional con Thymeleaf**)
8. [08 · Guía paso a paso de Angular](08-guia-angular-paso-a-paso.md)
9. [09 · Fundamentos de ingeniería de software](09-fundamentos-ingenieria-software.md)
10. [10 · Atlas de diagramas de la biblioteca](10-atlas-diagramas-biblioteca.md)
11. [11 · Git: cómo subir tu proyecto a tu repositorio](11-git-subir-proyecto-alumnos.md)

Presentación de la clase: [C4-Desarrollo-de-Software-Biblioteca.pptx](C4-Desarrollo-de-Software-Biblioteca.pptx) (resumen de la presentación de la clase 03 con marco de trabajo Scrum + Kanban, diagramas del proyecto, Spring Boot, Thymeleaf y los puntos que suelen olvidarse).

## Carpetas del proyecto

| Carpeta | Contenido |
|---|---|
| `../biblioteca-backend/` | Backend **terminado** y funcional: la referencia para comparar tu trabajo |
| `../biblioteca-backend-base/` | Backend **en blanco** con `TODO`: ya trae enums, entity, repository, dto, exception y mapper; se continúa desde `service` |
| `../biblioteca-frontend/` | Frontend Angular 21 terminado |

## Evaluación de la Unidad 1

El caso de la evaluación (informe grupal de máximo 3 integrantes y 8 páginas) es este mismo sistema de biblioteca. Las preguntas (autoconfiguración, dos starters y seguridad) se conectan con el proyecto en la sección "Evaluación y ruta del curso" de la presentación y en el documento 09.

## Regenerar las guías y la presentación

Los bloques de código de las guías se generan desde los archivos reales del proyecto (requiere tener `biblioteca-backend` y `biblioteca-frontend` junto a esta carpeta):

```bash
node _build/build-guia.js           # genera las guías
node _build/build-guia.js --check   # verifica que coinciden con el código
```

La presentación se genera con `pptxgenjs`:

```bash
node _build/presentacion/build.js   # genera C4-Desarrollo-de-Software-Biblioteca.pptx
```

Si `pptxgenjs` no está instalado globalmente, definir `NODE_PATH` hacia la carpeta `node_modules` de `../../herramientas`.

En Windows con PowerPoint 2010, el archivo recién generado muestra el aviso *«encontró contenido que no entendió»* (también ocurre con la presentación de la clase 03). El archivo entregado ya está normalizado: PowerPoint lo vuelve a guardar y se abre sin avisos. Después de regenerar, repetir ese paso con:

```powershell
powershell -File _build/presentacion/normalizar-con-powerpoint.ps1
```
