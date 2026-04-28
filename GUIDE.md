# Guía: Arquitectura de Agentes Compartidos (Universal)

Has implementado una solución de nivel avanzado para gestionar la "inteligencia" de tus proyectos. Aquí te explico pieza por pieza cómo funciona y cómo usarla.

---

## 1. Los Componentes del Sistema

| Pieza | Función | Por qué está ahí |
| :--- | :--- | :--- |
| **Repo `shared-agents`** | El "Cerebro Central". | Almacena todas las reglas en un solo lugar sincronizado con GitHub. |
| **Git Submodules** | El transporte. | Permite que tus proyectos (`portfolio` y `yezzfolio`) "importen" el cerebro central como una dependencia de Git. |
| **`setup-agents.js`** | El orquestador. | Script Node.js que crea los vínculos necesarios según tu sistema operativo. |
| **Junctions / Symlinks** | El puente. | Engaña a Antigravity para que crea que las reglas están en `.agents/` cuando en realidad están dentro del submódulo. |

---

## 2. Flujo de Trabajo Multiplataforma

El script `setup-agents.js` soluciona el problema de "clonar en otra PC":

1.  **Detección de OS:**
    -   En **Windows**, crea un **Junction** (`mklink /J`). Esto es ideal porque no requiere permisos de Administrador.
    -   En **Mac/Linux**, crea un **Symlink** (`ln -s`). Es el estándar de la industria en sistemas Unix.
2.  **Sincronización Automática:** El script ejecuta `git submodule update --init` por ti, asegurándose de que los archivos de reglas bajen de la nube antes de intentar vincularlos.

---

## 3. Guía de Uso Diario

### ¿Cómo instalar en una nueva máquina?
Solo tienes que clonar tu repositorio (`portfolio` o `yezzfolio`) y ejecutar:
```bash
npm run setup:agents
```
*(Esto ejecutará el script Node.js y dejará todo listo).*

### ¿Cómo añadir un nuevo proyecto?
1. Crea una carpeta con el nombre de tu proyecto aquí en `shared-agents/`.
2. Crea sus subcarpetas `rules/`, `workflows/` y `skills/`.
3. Sigue el proceso de la sección "Vinculación" en el repo destino.

### ¿Cómo modificar una regla?
Puedes editar los archivos directamente dentro de `.agents/rules/...` en el proyecto vinculado o directamente aquí. 

### ¿Cómo subir los cambios a GitHub?
Como `.agents` es un vínculo al submódulo, para subir cambios desde un proyecto debes entrar en la carpeta del submódulo:
```bash
cd _shared_agents
git add .
git commit -m "update: mejorar regla de seguridad"
git push origin main
```

### ¿Cómo sincronizar cambios en OTROS proyectos?
Si subiste cambios desde el proyecto A y quieres verlos en el proyecto B, `git submodule update` (que corre en `npm install`) no bajará los cambios de la nube automáticamente (restaurará el commit viejo). Debes actualizar la referencia del submódulo en el proyecto B:

```bash
# 1. Fuerza la descarga del último commit de la rama remota
git submodule update --remote --merge

# 2. Guarda la nueva referencia en el proyecto B
git add _shared_agents
git commit -m "chore: sync latest agents"

# 3. Refresca los enlaces
npm run setup:agents
```

---

## 4. Por qué esta solución es "Impeccable"

1.  **Desacoplada:** El código de la app no sabe nada de los agentes.
2.  **Portátil:** Funciona en Windows, Mac y Linux.
3.  **Ligera:** Sin duplicidad de archivos.
4.  **Escalable:** Soporta infinitos proyectos compartiendo una misma base de conocimiento.
