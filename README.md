
# Plataforma de reseñas de libros

## URL de la aplicación deployada
https://mi-libreria-progra4.vercel.app

## Repositorio
https://github.com/FlorSilvero/Tarea-10

## Deploy local
1. Clona el repositorio:
	```bash
	git clone https://github.com/FlorSilvero/Tarea-10.git
	cd Tarea-10
	```
2. Instala dependencias:
	```bash
	npm install
	```
3. Ejecuta la app en desarrollo:
	```bash
	npm run dev
	```
4. Accede a `http://localhost:3000`


## Ejecutar con Docker
1. Construye la imagen:
	```bash
	docker build -t tarea10-app .
	```
2. Ejecuta el contenedor:
	```bash
	docker run -p 3000:3000 tarea10-app
	```
3. Accede a `http://localhost:3000`


## Workflows de GitHub Actions

- **Build en Pull Requests (https://github.com/FlorSilvero/Tarea-10/actions/workflows/pr-build.yml):**
	- Se ejecuta automáticamente en cada Pull Request y en cada push a la rama `main`.
	- Descarga el código fuente, instala las dependencias y realiza el build de la aplicación Next.js.
	- Utiliza cache para acelerar el proceso de build.
	- Si el build falla, el PR se marca como fallido y no puede ser mergeado.

- **Tests en Pull Requests (https://github.com/FlorSilvero/Tarea-10/actions/workflows/pr-test.yml):**
	- Se ejecuta automáticamente en cada Pull Request.
	- Instala las dependencias y ejecuta todos los tests unitarios usando Vitest.
	- Genera reportes de los resultados y los publica en la PR.
	- Si algún test falla, el PR se marca como fallido y no puede ser mergeado.

- **Docker Container (https://github.com/FlorSilvero/Tarea-10/actions/workflows/docker-publish.yml):**
	- Se ejecuta automáticamente cuando se hace merge a la rama `main` o se crea un tag de versión.
	- Construye una imagen Docker optimizada de la aplicación usando el Dockerfile del proyecto.
	- Publica la imagen en GitHub Container Registry (GHCR) con los tags `latest`, versión y hash de commit.
	- Utiliza cache para acelerar el proceso de build y soporta multiplataforma.
	
## Demostración de que las GitHub actions funcionan
    -Publish-docker: https://github.com/FlorSilvero/Tarea-10/actions/runs/17385231289
	-PR- Test: https://github.com/FlorSilvero/Tarea-10/actions/runs/17380094531
	- PR - Build: https://github.com/FlorSilvero/Tarea-10/actions/runs/17385231295