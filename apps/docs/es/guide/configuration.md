---
description: "Todas las variables de entorno de SnapOtter con sus valores predeterminados. Configure la autenticación, el almacenamiento, los modelos de IA, la analítica y más."
i18n_source_hash: 02edb8bd70e5
i18n_provenance: machine
i18n_output_hash: b9ec965ad5ae
i18n_hash_version: 2
---

# Configuración {#configuration}

Toda la configuración se realiza mediante variables de entorno. Cada variable tiene un valor predeterminado razonable, por lo que SnapOtter funciona de inmediato sin definir ninguna de ellas.

## Variables de entorno {#environment-variables}

### Servidor {#server}

| Variable | Valor predeterminado | Descripción |
|---|---|---|
| `PORT` | `1349` | Puerto en el que escucha el servidor. |
| `HOST` | `0.0.0.0` | Dirección IP en la que escucha el servidor. En una red bridge (la predeterminada para `docker run` y Compose), mantenga `0.0.0.0` (o `::`), o los puertos publicados dejarán de funcionar. En una instalación nativa o en un contenedor en la red del host, `127.0.0.1` mantiene la API fuera de la red; coloque un proxy inverso delante para el acceso remoto. El [modo integrado](#embedded-mode) solo funciona con `0.0.0.0`, `::` o `127.0.0.1`, porque su comprobación de inicio llama a `127.0.0.1`. Con cualquier otra dirección, incluida `::1`, el contenedor nunca se considera iniciado, y un fallo posterior lo detiene en lugar de reiniciar el servidor. Cualquier valor que no sea una dirección IP, incluido `localhost`, detiene el servidor al iniciarse. |
| `BASE_PATH` | (vacío) | Ruta pública de despliegue, p. ej. `/snapotter`. Vacío o `/` sirve en la raíz del dominio. Se aplica en tiempo de ejecución; no es necesario reconstruir la imagen. |
| `RATE_LIMIT_PER_MIN` | `1000` | Número máximo de solicitudes por minuto por IP. Establézcalo en 0 para desactivar la limitación de solicitudes. |
| `CORS_ORIGIN` | (vacío) | Orígenes permitidos para CORS, separados por comas, o vacío para permitir solo el mismo origen. |
| `LOG_LEVEL` | `info` | Nivel de detalle del registro. Uno de: `fatal`, `error`, `warn`, `info`, `debug`, `trace`. |
| `TRUST_PROXY` | `loopback,linklocal,uniquelocal` | Qué pares pueden establecer la IP del cliente mediante `X-Forwarded-For`. El valor predeterminado solo confía en un par de una red privada, de modo que un proxy inverso en una red de Docker o en una LAN es de confianza y la cabecera falsificada de un cliente público no lo es. Establezca `true` solo cuando delante haya un proxy que usted controle en una dirección pública. |
| `SNAPOTTER_ANALYTICS_DEFAULT` | `on` | Establezca `off` para iniciar una instancia nueva con «Analítica de producto anónima» desactivada, de modo que no envíe nada desde su primer arranque. Solo rellena el ajuste mientras nadie haya elegido uno. Una vez guardado el ajuste, por un administrador o por esta variable, cambiar la variable no tiene ningún efecto; un administrador aún puede activar la analítica en Configuración > Sistema > Privacidad. |

### Autenticación {#authentication}

Los dos valores booleanos siguientes solo aceptan `true` y `false`. Cualquier otro valor, `1` o `yes` o `on`, no supera la validación y el servidor se cierra antes de empezar a escuchar.

| Variable | Valor predeterminado | Descripción |
|---|---|---|
| `AUTH_ENABLED` | `true` | Exige iniciar sesión. Establézcalo en `false` para ejecutar sin ninguna cuenta, lo que concede derechos de administrador a todas las solicitudes, así que limítelo a una red de confianza. |
| `DEFAULT_USERNAME` | `admin` | Nombre de usuario de la cuenta de administrador inicial. Solo se usa en la primera ejecución. |
| `DEFAULT_PASSWORD` | `admin` | Contraseña de la cuenta de administrador inicial. Cámbiela después del primer inicio de sesión. |
| `MAX_USERS` | `0` (ilimitado) | Número máximo de cuentas de usuario registradas. Establézcalo en 0 para que sea ilimitado. |
| `SESSION_DURATION_HOURS` | `168` | Duración de la sesión iniciada, en horas (el valor predeterminado es 7 días). |
| `SKIP_MUST_CHANGE_PASSWORD` | `false` | Establézcalo en `true` para omitir el aviso obligatorio de cambio de contraseña en el primer inicio de sesión. |

### Almacenamiento {#storage}

| Variable | Valor predeterminado | Descripción |
|---|---|---|
| `STORAGE_MODE` | `local` | `local` o `s3`. S3 y MinIO necesitan una licencia con la función s3_storage, además de las variables `S3_*` que se indican a continuación. |
| `DATABASE_URL` | `postgres://snapotter:snapotter@localhost:5432/snapotter` | Cadena de conexión de PostgreSQL y la conexión con la que se atiende cada solicitud. En 2.3.0 y versiones posteriores, defina también `DATABASE_MIGRATION_URL` y esta pasa a ser el rol de runtime de mínimo privilegio, con permisos DML sobre las tablas de la aplicación y nada más. La pila de Compose la apunta a su servicio `postgres`; déjela sin definir (junto con `REDIS_URL`) para obtener el modo integrado. |
| `DATABASE_MIGRATION_URL` | (vacío) | Conexión privilegiada, usada solo durante el arranque para ejecutar las migraciones y conceder permisos al rol de runtime, y que se cierra antes de la primera solicitud. Si la deja vacía, SnapOtter se ejecuta con un solo rol, y `DATABASE_URL` se encarga de ambas tareas. Consulte [Roles de mínimo privilegio](/es/guide/database#least-privilege-roles). |
| `REDIS_URL` | `redis://localhost:6379` | Cadena de conexión de Redis (usada para las colas de trabajos de BullMQ). Compose la apunta a su servicio `redis`. |
| `WORKSPACE_PATH` | `./tmp/workspace` | Directorio para los archivos temporales durante el procesamiento. Se limpia automáticamente. La imagen establece `/tmp/workspace`. |
| `FILES_STORAGE_PATH` | `./data/files` | Directorio para los archivos persistentes de los usuarios (imágenes subidas, resultados guardados). La imagen establece `/data/files`. |

### Almacenamiento de objetos S3 {#s3-object-storage}

Solo se lee cuando `STORAGE_MODE=s3`. Si falta cualquiera de las tres obligatorias, el inicio falla indicando el nombre de la variable que omitió.

| Variable | Valor predeterminado | Descripción |
|---|---|---|
| `S3_BUCKET` | (vacío) | Bucket que contiene las subidas y los resultados. Obligatorio. |
| `S3_ACCESS_KEY_ID` | (vacío) | Clave de acceso. Obligatoria. En el contenedor puede montarla en su lugar, mediante `S3_ACCESS_KEY_ID_FILE`. |
| `S3_SECRET_ACCESS_KEY` | (vacío) | Clave secreta. Obligatoria. Misma convención de archivo: `S3_SECRET_ACCESS_KEY_FILE`. |
| `S3_REGION` | `us-east-1` | Región del bucket. |
| `S3_ENDPOINT` | (vacío) | Endpoint personalizado para MinIO, R2, Backblaze y otros almacenes compatibles con S3. Vacío significa AWS. |
| `S3_FORCE_PATH_STYLE` | `false` | Establézcalo en `true` para MinIO y cualquier otro servicio que requiera `endpoint/bucket/key` en lugar del direccionamiento por host virtual. |
| `S3_PREFIX` | (vacío) | Prefijo de clave, para que un mismo bucket pueda alojar varias instancias. |

### Cifrado en reposo {#encryption-at-rest}

| Variable | Valor predeterminado | Descripción |
|---|---|---|
| `DATA_ENCRYPTION_KEY` | (vacío) | 64 caracteres hexadecimales (32 bytes). Cifra los ajustes sensibles almacenados en la base de datos. Cualquier valor que no tenga 64 caracteres hexadecimales se rechaza al iniciar. |
| `DATA_ENCRYPTION_KEY_PREVIOUS` | (vacío) | La clave que se va a dejar de usar en la rotación, con el mismo formato. Defina ambas durante una rotación para que las filas existentes se sigan descifrando y, después, elimine esta. |

### Modo integrado {#embedded-mode}

Ejecute la imagen sin `DATABASE_URL` ni `REDIS_URL` y esta inicia su propio PostgreSQL 17 y Redis dentro del contenedor, enlazados a loopback, con todos los datos en el volumen `/data`. Esto recupera la experiencia de un solo comando `docker run` para el inicio rápido, los homelabs y las actualizaciones desde 1.x. Es una vía de conveniencia, no un despliegue de producción: para producción, ejecute la pila de Compose de 3 contenedores con PostgreSQL y Redis separados. El modo integrado requiere ejecutar el contenedor como root y es incompatible con los runtimes de UID arbitrario (OpenShift, Kubernetes `runAsNonRoot`); use Compose en esos casos.

| Variable | Valor predeterminado | Descripción |
|---|---|---|
| `EMBEDDED` | `auto` | Se activa automáticamente cuando ni `DATABASE_URL` ni `REDIS_URL` están definidas. Establézcalo en `0` para desactivarlo (la aplicación falla entonces de inmediato si no hay definida una `DATABASE_URL`/`REDIS_URL` externa, en lugar de iniciar silenciosamente una base de datos dentro del contenedor). |
| `REDIS_MAXMEMORY` | `512mb` | Límite de memoria del Redis integrado (solo en modo integrado). Redúzcalo en hosts con poca memoria, como una Raspberry Pi. |
| `EMBEDDED_PG_PORT` | `5432` | Puerto de loopback para el PostgreSQL integrado (solo en modo integrado). Cámbielo solo cuando el contenedor comparta una red en la que el 5432 esté ocupado, como con `--network host`. Debe ser distinto de `EMBEDDED_REDIS_PORT` y mayor que 1023, porque PostgreSQL se ejecuta como un usuario sin privilegios que no puede enlazar un puerto privilegiado en la red del host. |
| `EMBEDDED_REDIS_PORT` | `6379` | Lo mismo, para el Redis integrado, que también se ejecuta como un usuario sin privilegios. |
| `EMBEDDED_DB_PASSWORDS` | (vacío) | Establézcalo en `1` para generar en el siguiente arranque contraseñas aleatorias para los roles del PostgreSQL integrado y para Redis, guardadas en `/data/.embedded-db-secrets`. A partir de entonces, los inicios de sesión por TCP las necesitan. En un volumen creado por primera vez con 2.3.0 o posterior, el superusuario de PostgreSQL no puede iniciar sesión por TCP en absoluto; en un volumen más antiguo, el propietario de la base de datos es el superusuario, y su contraseña es lo que lo protege. Úselo siempre que otros programas compartan la red del contenedor, como con `--network host`. Permanece activado para ese volumen: las contraseñas se usan en cada arranque aunque elimine esta variable, y borrar `/data/.embedded-db-secrets` solo le da contraseñas nuevas, o un arranque que falla si la variable no está definida. Si el contenedor no se inicia porque uno de esos archivos está dañado, elimine ese archivo con `docker run --rm -v <volume>:/data --entrypoint rm snapotter/snapotter:<your tag> -r /data/.embedded-db-secrets/<name>` e inicie el contenedor de nuevo; el siguiente arranque crea uno nuevo. La variable admite `1`, `0` o vacío, y cualquier otro valor detiene el arranque. |
| `EMBEDDED_REDIS_TIMEOUT_S` | `180` | Segundos que el arranque espera a que el Redis integrado responda a `PING` antes de darse por vencido. Si se agota el tiempo, el contenedor se detiene y registra el motivo, en lugar de quedarse colgado. Segundos enteros de 1 a 999999; no hay ningún valor ilimitado, porque esperar indefinidamente es precisamente el fallo que este límite existe para evitar. Auméntelo solo si un host lento lo alcanza. |
| `EMBEDDED_POSTGRES_TIMEOUT_S` | `600` | Lo mismo, para el PostgreSQL integrado. El reloj empieza a contar cuando termina el `initdb` del primer arranque, por lo que cubre el inicio del servidor y la recuperación tras un fallo, no la creación inicial de la base de datos. |

Actualización desde 1.x: coloque su antiguo `snapotter.db` en `/data/snapotter.db` dentro del volumen y el modo integrado lo importa al PostgreSQL integrado en el primer arranque. La importación se ejecuta una sola vez; los arranques posteriores la omiten.

Nota sobre la telemetría: el modo integrado hereda el valor predeterminado de analítica de la imagen como cualquier otra configuración. La imagen publicada se distribuye con la analítica activada; para desactivarla, compile con `--build-arg SNAPOTTER_ANALYTICS=off`, establezca `SNAPOTTER_ANALYTICS_DEFAULT=off` antes del primer arranque o use la opción de exclusión del administrador en la aplicación.

### Límites de procesamiento {#processing-limits}

| Variable | Valor predeterminado | Descripción |
|---|---|---|
| `MAX_UPLOAD_SIZE_MB` | `0` (ilimitado) | Tamaño máximo de archivo por subida, en megabytes. Establézcalo en 0 para que sea ilimitado. La imagen publicada se distribuye con `0`; una compilación desde el código fuente empieza en 100. |
| `MAX_BATCH_SIZE` | `0` (ilimitado) | Número máximo de archivos en una sola solicitud por lotes. Establézcalo en 0 para que sea ilimitado. La imagen publicada se distribuye con `0`; una compilación desde el código fuente empieza en 100. |
| `CONCURRENT_JOBS` | `0` (automático) | Número de trabajos por lotes que se ejecutan en paralelo. Establézcalo en 0 para detectarlo automáticamente según los núcleos de CPU disponibles. |
| `MAX_MEGAPIXELS` | `0` (ilimitado) | Resolución máxima de imagen permitida, en megapíxeles. Establézcalo en 0 para que sea ilimitada. |
| `MAX_WORKER_THREADS` | `0` (automático) | Número máximo de hilos de trabajo para el procesamiento de imágenes. Establézcalo en 0 para detectarlo automáticamente según los núcleos de CPU disponibles. |
| `PROCESSING_TIMEOUT_S` | `0` (sin límite) | Tiempo de espera de cada llamada al sidecar de Python que ejecuta las herramientas de IA, en segundos. Establézcalo en 0 para no tener límite. No limita los trabajos de imagen, PDF ni multimedia; de eso se encargan `JOB_TIMEOUT_FAST_S` y `JOB_TIMEOUT_LONG_S`. |
| `AI_SIDECAR_IDLE_TIMEOUT` | `600` | Segundos que el sidecar de IA de Python y el entorno de OCR preciso permanecen inactivos antes de cerrarse y liberar su memoria (unos 1,3 GB y 0,7 GB una vez en caliente). Ambos se inician de nuevo con la siguiente solicitud, por lo que la primera llamada de IA tras un cierre por inactividad paga el coste de inicio de las bibliotecas, unos segundos. Establézcalo en 0 para mantenerlos en ejecución. El valor predeterminado coincide con `AI_SESSION_IDLE_TIMEOUT`, de modo que los modelos cargados no se descartan antes de lo que indica ese ajuste. Si aumenta `AI_SESSION_IDLE_TIMEOUT`, aumente este valor en la misma medida. |
| `JOB_TIMEOUT_FAST_S` | `120` | Plazo máximo para un trabajo en los pools rápidos (herramientas de imagen y de documentos), en segundos. Un trabajo que dura más falla con un error de tiempo de espera agotado. Establézcalo en 0 para no tener límite. |
| `JOB_TIMEOUT_LONG_S` | `7200` | Plazo máximo para un trabajo en los pools largos (herramientas de IA y multimedia, además de cualquier herramienta marcada como de larga duración), en segundos. Establézcalo en 0 para no tener límite. El OCR de PDF en los modos Balanced y Best amplía su propio plazo según el número de páginas (2 y 5 minutos por página), hasta 6 horas, por lo que un PDF grande no requiere aumentar este valor. |
| `SYNC_WAIT_MS` | `8000` | Cuánto tiempo espera una solicitud de herramienta a su trabajo antes de que la API deje de esperar y devuelva `202` con un id de trabajo que se puede seguir por SSE, en milisegundos. No detiene el trabajo. Establézcalo en 0 para esperar al trabajo todo lo que tarde. |
| `MAX_PIPELINE_STEPS` | `20` | Número máximo de pasos en un pipeline. Establézcalo en 0 para no tener límite. |
| `MAX_CANVAS_PIXELS` | `0` (sin límite) | Tamaño máximo del lienzo en píxeles para las imágenes de salida. Establézcalo en 0 para no tener límite. |
| `MAX_SVG_SIZE_MB` | `50` | Tamaño máximo de SVG que se acepta antes de sanearlo, en megabytes. `0` se comporta aquí de forma distinta que en las filas de alrededor. Elimina por completo el límite de tamaño previo al análisis en lugar de aumentarlo, así que mantenga esta variable definida. |
| `MAX_PDF_PAGES` | `0` (ilimitado) | Número máximo de páginas PDF para la conversión de PDF a imagen. Establézcalo en 0 para que sea ilimitado. |
| `MAX_SETTINGS_PAYLOAD_KB` | `64` | Tamaño máximo del campo `settings` que puede incluir una solicitud de herramienta, en kilobytes, contado en bytes UTF-8. Las solicitudes que superan el límite reciben un `400`. Establézcalo en 0 para no tener límite. Los ajustes reales de las herramientas son mucho menores de 64 KB, así que auméntelo solo si un cliente envía ajustes inusualmente grandes. |

### Motores {#engines}

SnapOtter busca cada binario de procesamiento en `$PATH` dentro del contenedor, por lo que estas variables permanecen vacías salvo que monte una compilación propia.

| Variable | Valor predeterminado | Descripción |
|---|---|---|
| `FFMPEG_PATH` | (vacío) | Ruta al binario `ffmpeg` en el que se basan las herramientas de vídeo y audio. |
| `FFPROBE_PATH` | (vacío) | Ruta a `ffprobe`, que lee los archivos multimedia antes de procesarlos. Apúntela a la misma compilación que `FFMPEG_PATH`. |
| `QPDF_PATH` | (vacío) | Ruta a `qpdf`, usado por las herramientas de PDF y para comprobar los PDF subidos. |
| `SOFFICE_PATH` | (vacío) | Ruta a `soffice` de LibreOffice, usado en las conversiones de documentos de oficina. |
| `PDFCPU_PATH` | (vacío) | Ruta a `pdfcpu`, usado por algunas herramientas de PDF. |
| `GS_PATH` | (vacío) | Ruta a `gs` de Ghostscript, usado por las herramientas de PDF y el OCR de PDF. |
| `PANDOC_PATH` | (vacío) | Ruta a `pandoc`, usado en las conversiones de documentos. |
| `SNAPOTTER_FONT_FILE` | (vacío) | Archivo de fuente para el texto dibujado sobre el vídeo (incrustar subtítulos, marca de agua de vídeo). Vacío usa la primera fuente que encuentra la imagen. |
| `SNAPOTTER_FONT_FAMILY` | (vacío) | Nombre de familia de `SNAPOTTER_FONT_FILE`. Vacío significa `Sans`. |
| `SNAPOTTER_HW_ACCEL` | (vacío) | Familia de codificadores de vídeo por hardware, `nvenc` o `vaapi`. Vacío codifica por software. |

`SNAPOTTER_HW_ACCEL` necesita un ffmpeg compilado con esa familia de codificadores, y el ffmpeg de la imagen no incluye ninguna de las dos. Con el binario propio de la imagen, el ajuste recurre a la codificación por software y lo indica en el registro de inicio. Para usarlo, monte su propia compilación de ffmpeg, apunte `FFMPEG_PATH` y `FFPROBE_PATH` a ella y proporcione al contenedor el dispositivo de GPU. Para `nvenc`, defina también `NVIDIA_DRIVER_CAPABILITIES=compute,utility,video`: la imagen solo solicita `compute,utility`, y sin `video` el runtime de NVIDIA no monta la biblioteca de codificación, por lo que el codificador aparece en la lista pero toda codificación falla. Una ruta personalizada que no existe o no es ejecutable también se indica en el registro de inicio, y todos los trabajos que necesitan ese binario fallan hasta que corrija la ruta o la elimine.

Los archivos de Compose publicados transmiten todas ellas desde `.env`, así que basta con definirlas allí.

### Limpieza {#cleanup}

| Variable | Valor predeterminado | Descripción |
|---|---|---|
| `FILE_MAX_AGE_HOURS` | `72` | Cuánto tiempo se conservan los resultados de procesamiento no guardados (subidas sin procesar y resultados de las herramientas) antes de eliminarse automáticamente. Los archivos que guarde explícitamente en la biblioteca de archivos no se ven afectados y se conservan hasta que los elimine. |
| `CLEANUP_INTERVAL_MINUTES` | `60` | Con qué frecuencia se ejecuta el trabajo de limpieza. |

### Apariencia {#appearance}

| Variable | Valor predeterminado | Descripción |
|---|---|---|
| `DEFAULT_THEME` | `light` | Tema predeterminado para las sesiones nuevas. `light`, `dark` o `system`. |
| `DEFAULT_LOCALE` | `en` | Idioma predeterminado de la interfaz. |
| `DEFAULT_TOOL_VIEW` | `sidebar` | Disposición predeterminada de las herramientas. `sidebar` o `fullscreen`. |

### Permisos de Docker {#docker-permissions}

| Variable | Valor predeterminado | Descripción |
|---|---|---|
| `PUID` | `999` | Ejecuta el proceso del contenedor con este UID. Establézcalo para que coincida con su usuario del host en los bind mounts (`id -u`). |
| `PGID` | `999` | Ejecuta el proceso del contenedor con este GID. Establézcalo para que coincida con su grupo del host en los bind mounts (`id -g`). |

## Ejemplo de Docker {#docker-example}

```yaml
services:
  SnapOtter:
    image: snapotter/snapotter:latest
    ports:
      - "1349:1349"
    volumes:
      - SnapOtter-data:/data
      - SnapOtter-workspace:/tmp/workspace
    environment:
      - AUTH_ENABLED=true
      - DEFAULT_USERNAME=admin
      - DEFAULT_PASSWORD=changeme
      - DATABASE_URL=postgres://snapotter:snapotter@postgres:5432/snapotter
      - REDIS_URL=redis://redis:6379
      - MAX_UPLOAD_SIZE_MB=200
      - CONCURRENT_JOBS=4
      - FILE_MAX_AGE_HOURS=12
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: snapotter
      POSTGRES_PASSWORD: snapotter     # Change this for non-local deployments
      POSTGRES_DB: snapotter
    volumes:
      - SnapOtter-pgdata:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U snapotter -d snapotter"]
      interval: 10s
      timeout: 5s
      retries: 12

  redis:
    image: redis:8-alpine
    command: ["redis-server", "--maxmemory-policy", "noeviction", "--appendonly", "yes"]
    volumes:
      - SnapOtter-redisdata:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 12

volumes:
  SnapOtter-data:
  SnapOtter-workspace:
  SnapOtter-pgdata:
  SnapOtter-redisdata:
```

## Volúmenes {#volumes}

La pila de Docker Compose usa cuatro volúmenes:

- `/data` (app) - Modelos de IA, venv de Python y archivos de usuario. Móntelo para conservar los archivos subidos y los paquetes de IA instalados entre reinicios.
- `/tmp/workspace` (app) - Almacenamiento temporal para los archivos que se están procesando. Puede ser efímero, pero montarlo evita llenar la capa escribible del contenedor.
- `SnapOtter-pgdata` (postgres) - Directorio de datos de PostgreSQL. Contiene todos los datos relacionales (usuarios, ajustes, pipelines, trabajos, registro de auditoría). Haga copias de seguridad mediante `pg_dump` o una instantánea del volumen.
- `SnapOtter-redisdata` (redis) - Archivo append-only de Redis para colas de trabajos duraderas.
