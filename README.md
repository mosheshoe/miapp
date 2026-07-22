# DevScope

DevScope es una aplicación web que analiza perfiles públicos de GitHub.

## Funciones principales

- Búsqueda de usuarios de GitHub.
- Información general del perfil.
- Total de repositorios públicos.
- Total de estrellas.
- Total de forks.
- Promedio de estrellas por repositorio.
- Lenguaje más utilizado.
- Repositorio más popular.
- Lista de repositorios destacados.
- Diseño responsive para computadora y celular.

## KPI principal

El KPI principal es el total de estrellas recibidas en todos los repositorios públicos.

```javascript
const totalStars = repositories.reduce(
    (total, repository) =>
        total + repository.stargazers_count,
    0
);
