# Workflow: Release y Versionado Universal (/release)

Este flujo garantiza que cualquier salto de versión en los proyectos (Frontend o CMS) cumpla con los estándares de SemVer y quede registrado correctamente en el control de versiones antes del despliegue.

## 1. Evaluación de Impacto (SemVer)

- [ ] Analizar los commits recientes (especialmente aquellos generados por `caveman-commit`) para determinar el salto de versión:
  - **MAJOR:** Si hay `BREAKING CHANGES` (ej. cambios en `DATA_SCHEMA.md` o rediseños estructurales).
  - **MINOR:** Si hay nuevas funcionalidades (`feat:`) retrocompatibles.
  - **PATCH:** Si solo hay correcciones (`fix:`, `chore:`, `refactor:`).

## 2. Preparación de Manifiestos y Documentación

- [ ] Actualizar el archivo CHANGELOG.md para reflejar los cambios introducidos en esta versión basándose en los commits.
- [ ] Ejecutar el comando de NPM para actualizar el package.json y package-lock.json sin generar el tag de git automáticamente:

npm version <major|minor|patch> --no-git-tag-version


## 3. Commit de Release y Etiquetado (Tag)

- [ ] Confirmar los cambios de los manifiestos y el changelog en un solo commit:

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): vX.Y.Z"
```

- [ ] Generar el tag anotado en Git apuntando a este commit de release:

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
```

- [ ] Subir el commit y los tags al repositorio remoto para que el sistema de CI/CD lo detecte:

```bash
git push --follow-tags
```


## 4. Validación Final

- [ ] Confirmar que el nuevo tag es visible en el repositorio remoto.
- [ ] Verificar que el último commit y el tag están asociados a la rama correcta (ej. develop o main).

Nota sobre el Flujo de Trabajo

Este workflow debe ejecutarse antes de iniciar los flujos de publish-check o deploy para asegurar que el control de versiones esté sincronizado con el estado del código.

🚀 RELEASE PIPELINE - READY
Decisión: Versión actualizada y tag generado ✅
