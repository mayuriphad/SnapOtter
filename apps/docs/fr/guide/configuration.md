---
description: "Toutes les variables d'environnement de SnapOtter avec leurs valeurs par défaut. Configurez l'authentification, le stockage, les modèles d'IA, les analyses et bien plus."
i18n_source_hash: 02edb8bd70e5
i18n_provenance: machine
i18n_output_hash: 68d0c38f8d9e
i18n_hash_version: 2
---

# Configuration {#configuration}

Toute la configuration se fait par des variables d'environnement. Chaque variable a une valeur par défaut raisonnable, si bien que SnapOtter fonctionne immédiatement sans que vous ayez à en définir aucune.

## Variables d'environnement {#environment-variables}

### Serveur {#server}

| Variable | Valeur par défaut | Description |
|---|---|---|
| `PORT` | `1349` | Port sur lequel le serveur écoute. |
| `HOST` | `0.0.0.0` | Adresse IP sur laquelle le serveur écoute. Sur un réseau bridge (le mode par défaut pour `docker run` et Compose), conservez `0.0.0.0` (ou `::`), sinon les ports publiés cessent de fonctionner. Sur une installation native ou dans un conteneur sur le réseau de l'hôte, `127.0.0.1` garde l'API hors du réseau ; placez un proxy inverse devant pour l'accès à distance. Le [mode embarqué](#embedded-mode) ne fonctionne qu'avec `0.0.0.0`, `::` ou `127.0.0.1`, car sa vérification de démarrage appelle `127.0.0.1`. Avec toute autre adresse, `::1` compris, le conteneur n'est jamais considéré comme démarré, et un plantage ultérieur l'arrête au lieu de redémarrer le serveur. Tout ce qui n'est pas une adresse IP, `localhost` compris, arrête le serveur au démarrage. |
| `BASE_PATH` | (vide) | Chemin de déploiement public, par exemple `/snapotter`. Une valeur vide ou `/` sert l'application à la racine du domaine. Appliqué à l'exécution ; aucune reconstruction de l'image n'est nécessaire. |
| `RATE_LIMIT_PER_MIN` | `1000` | Nombre maximal de requêtes par minute et par IP. Définissez 0 pour désactiver la limitation du débit. |
| `CORS_ORIGIN` | (vide) | Origines autorisées pour CORS, séparées par des virgules, ou vide pour la même origine uniquement. |
| `LOG_LEVEL` | `info` | Verbosité des journaux. L'une des valeurs suivantes : `fatal`, `error`, `warn`, `info`, `debug`, `trace`. |
| `TRUST_PROXY` | `loopback,linklocal,uniquelocal` | Quels pairs peuvent définir l'IP du client via `X-Forwarded-For`. La valeur par défaut ne fait confiance qu'à un pair situé sur un réseau privé : un proxy inverse sur un réseau Docker ou un réseau local est donc approuvé, et l'en-tête falsifié d'un client public ne l'est pas. Ne définissez `true` que si un proxy que vous contrôlez se trouve devant, sur une adresse publique. |
| `SNAPOTTER_ANALYTICS_DEFAULT` | `on` | Définissez `off` pour démarrer une nouvelle instance avec « Analyses de produit anonymes » désactivé, afin qu'elle n'envoie rien dès son premier démarrage. La variable ne renseigne le paramètre que tant que personne n'en a choisi un. Une fois le paramètre enregistré, par un administrateur ou par cette variable, modifier la variable n'a plus aucun effet ; un administrateur peut toujours activer les analyses dans Paramètres > Système > Confidentialité. |

### Authentification {#authentication}

Les deux booléens ci-dessous n'acceptent que `true` et `false`. Toute autre valeur, `1`, `yes` ou `on`, échoue à la validation et le serveur s'arrête avant de commencer à écouter.

| Variable | Valeur par défaut | Description |
|---|---|---|
| `AUTH_ENABLED` | `true` | Exige une connexion. Définissez `false` pour fonctionner sans aucun compte, ce qui accorde les droits d'administrateur à chaque requête : réservez donc ce mode à un réseau de confiance. |
| `DEFAULT_USERNAME` | `admin` | Nom d'utilisateur du compte administrateur initial. Utilisé uniquement au premier lancement. |
| `DEFAULT_PASSWORD` | `admin` | Mot de passe du compte administrateur initial. Changez-le après la première connexion. |
| `MAX_USERS` | `0` (illimité) | Nombre maximal de comptes utilisateur enregistrés. Définissez 0 pour un nombre illimité. |
| `SESSION_DURATION_HOURS` | `168` | Durée de vie d'une session de connexion, en heures (7 jours par défaut). |
| `SKIP_MUST_CHANGE_PASSWORD` | `false` | Définissez `true` pour ignorer l'invite de changement de mot de passe obligatoire à la première connexion. |

### Stockage {#storage}

| Variable | Valeur par défaut | Description |
|---|---|---|
| `STORAGE_MODE` | `local` | `local` ou `s3`. S3 et MinIO nécessitent une licence comprenant la fonctionnalité s3_storage, ainsi que les variables `S3_*` ci-dessous. |
| `DATABASE_URL` | `postgres://snapotter:snapotter@localhost:5432/snapotter` | Chaîne de connexion PostgreSQL, et connexion sur laquelle chaque requête est servie. À partir de la version 2.3.0, définissez aussi `DATABASE_MIGRATION_URL` : celle-ci devient alors le rôle d'exécution à moindre privilège, qui ne détient que les droits DML sur les tables de l'application et rien d'autre. La pile Compose la fait pointer vers son service `postgres` ; laissez-la non définie (avec `REDIS_URL`) pour obtenir le mode embarqué. |
| `DATABASE_MIGRATION_URL` | (vide) | Connexion privilégiée, utilisée uniquement au démarrage pour exécuter les migrations et accorder les droits au rôle d'exécution, puis fermée avant la première requête. Laissez-la vide et SnapOtter fonctionne avec un seul rôle, `DATABASE_URL` assurant les deux fonctions. Consultez [Rôles à moindre privilège](/fr/guide/database#least-privilege-roles). |
| `REDIS_URL` | `redis://localhost:6379` | Chaîne de connexion Redis (utilisée pour les files de tâches BullMQ). Compose la fait pointer vers son service `redis`. |
| `WORKSPACE_PATH` | `./tmp/workspace` | Répertoire des fichiers temporaires pendant le traitement. Nettoyé automatiquement. L'image définit `/tmp/workspace`. |
| `FILES_STORAGE_PATH` | `./data/files` | Répertoire des fichiers utilisateur persistants (images envoyées, résultats enregistrés). L'image définit `/data/files`. |

### Stockage d'objets S3 {#s3-object-storage}

Lues uniquement lorsque `STORAGE_MODE=s3`. S'il manque l'une des trois variables obligatoires, le démarrage échoue en indiquant le nom de la variable omise.

| Variable | Valeur par défaut | Description |
|---|---|---|
| `S3_BUCKET` | (vide) | Bucket qui contient les envois et les résultats. Obligatoire. |
| `S3_ACCESS_KEY_ID` | (vide) | Clé d'accès. Obligatoire. Dans le conteneur, vous pouvez plutôt la monter, via `S3_ACCESS_KEY_ID_FILE`. |
| `S3_SECRET_ACCESS_KEY` | (vide) | Clé secrète. Obligatoire. Même convention de fichier : `S3_SECRET_ACCESS_KEY_FILE`. |
| `S3_REGION` | `us-east-1` | Région du bucket. |
| `S3_ENDPOINT` | (vide) | Endpoint personnalisé pour MinIO, R2, Backblaze et les autres stockages compatibles S3. Vide signifie AWS. |
| `S3_FORCE_PATH_STYLE` | `false` | Définissez `true` pour MinIO et tout autre service qui attend `endpoint/bucket/key` au lieu d'un adressage par hôte virtuel. |
| `S3_PREFIX` | (vide) | Préfixe de clé, afin qu'un même bucket puisse héberger plusieurs instances. |

### Chiffrement au repos {#encryption-at-rest}

| Variable | Valeur par défaut | Description |
|---|---|---|
| `DATA_ENCRYPTION_KEY` | (vide) | 64 caractères hexadécimaux (32 octets). Chiffre les paramètres sensibles stockés dans la base de données. Toute valeur qui n'est pas composée de 64 caractères hexadécimaux est rejetée au démarrage. |
| `DATA_ENCRYPTION_KEY_PREVIOUS` | (vide) | La clé que vous remplacez, au même format. Définissez les deux pendant une rotation afin que les lignes existantes puissent toujours être déchiffrées, puis retirez celle-ci. |

### Mode embarqué {#embedded-mode}

Lancez l'image sans `DATABASE_URL` ni `REDIS_URL` et elle démarre son propre PostgreSQL 17 et son propre Redis dans le conteneur, liés à l'interface de bouclage, avec toutes les données sur le volume `/data`. Cela rétablit l'expérience `docker run` en une seule commande pour le démarrage rapide, le homelab et les mises à niveau depuis la 1.x. C'est une voie de commodité, pas un déploiement de production : pour la production, exécutez la pile Compose de 3 conteneurs avec PostgreSQL et Redis séparés. Le mode embarqué exige d'exécuter le conteneur en tant que root et est incompatible avec les runtimes à UID arbitraire (OpenShift, Kubernetes `runAsNonRoot`) ; utilisez Compose dans ces cas.

| Variable | Valeur par défaut | Description |
|---|---|---|
| `EMBEDDED` | `auto` | Activé automatiquement lorsque `DATABASE_URL` et `REDIS_URL` ne sont ni l'une ni l'autre définies. Définissez `0` pour le désactiver (l'application échoue alors immédiatement si aucun `DATABASE_URL`/`REDIS_URL` externe n'est défini, plutôt que de démarrer silencieusement une base de données dans le conteneur). |
| `REDIS_MAXMEMORY` | `512mb` | Plafond de mémoire du Redis embarqué (mode embarqué uniquement). Abaissez-le sur les hôtes à mémoire limitée, comme un Raspberry Pi. |
| `EMBEDDED_PG_PORT` | `5432` | Port de bouclage du PostgreSQL embarqué (mode embarqué uniquement). Ne le modifiez que si le conteneur partage un réseau où le port 5432 est déjà pris, par exemple avec `--network host`. Il doit être différent de `EMBEDDED_REDIS_PORT` et supérieur à 1023, car PostgreSQL s'exécute sous un utilisateur non privilégié qui ne peut pas se lier à un port privilégié sur le réseau de l'hôte. |
| `EMBEDDED_REDIS_PORT` | `6379` | Idem, pour le Redis embarqué, qui s'exécute lui aussi sous un utilisateur non privilégié. |
| `EMBEDDED_DB_PASSWORDS` | (vide) | Définissez `1` pour générer, au prochain démarrage, des mots de passe aléatoires pour les rôles du PostgreSQL embarqué et pour Redis, conservés dans `/data/.embedded-db-secrets`. Les connexions TCP en ont ensuite besoin. Sur un volume créé pour la première fois par la version 2.3.0 ou ultérieure, le superutilisateur PostgreSQL ne peut pas du tout se connecter via TCP ; sur un volume plus ancien, le propriétaire de la base de données est le superutilisateur, et c'est son mot de passe qui le protège. Utilisez-la dès que d'autres programmes partagent le réseau du conteneur, par exemple avec `--network host`. Elle reste active pour ce volume : les mots de passe sont utilisés à chaque démarrage même si vous supprimez cette variable, et supprimer `/data/.embedded-db-secrets` ne vous apporte que de nouveaux mots de passe, ou un démarrage qui échoue si la variable n'est pas définie. Si le conteneur ne démarre pas parce que l'un de ces fichiers est endommagé, supprimez ce fichier avec `docker run --rm -v <volume>:/data --entrypoint rm snapotter/snapotter:<your tag> -r /data/.embedded-db-secrets/<name>` puis redémarrez le conteneur ; le démarrage suivant en crée un nouveau. La variable accepte `1`, `0` ou une valeur vide, et toute autre valeur interrompt le démarrage. |
| `EMBEDDED_REDIS_TIMEOUT_S` | `180` | Nombre de secondes pendant lesquelles le démarrage attend que le Redis embarqué réponde à `PING` avant d'abandonner. En cas de dépassement, le conteneur s'arrête et consigne la raison dans les journaux, au lieu de rester bloqué. Secondes entières de 1 à 999999 ; il n'existe pas de valeur illimitée, car attendre indéfiniment est précisément l'échec que cette limite doit empêcher. Ne l'augmentez que si un hôte lent la déclenche. |
| `EMBEDDED_POSTGRES_TIMEOUT_S` | `600` | Idem, pour le PostgreSQL embarqué. Le décompte commence une fois que le `initdb` du premier démarrage est terminé : il couvre donc le démarrage du serveur et la récupération après plantage, et non la création initiale de la base de données. |

Mise à niveau depuis la 1.x : placez votre ancien `snapotter.db` à l'emplacement `/data/snapotter.db` dans le volume, et le mode embarqué l'importe dans le PostgreSQL embarqué au premier démarrage. L'import ne s'exécute qu'une fois ; les démarrages suivants l'ignorent.

Remarque sur la télémétrie : le mode embarqué hérite de la valeur par défaut des analyses de l'image comme de toute autre configuration. L'image publiée est livrée avec les analyses activées ; pour les désactiver, construisez-la avec `--build-arg SNAPOTTER_ANALYTICS=off`, définissez `SNAPOTTER_ANALYTICS_DEFAULT=off` avant le premier démarrage ou utilisez la désactivation par l'administrateur dans l'application.

### Limites de traitement {#processing-limits}

| Variable | Valeur par défaut | Description |
|---|---|---|
| `MAX_UPLOAD_SIZE_MB` | `0` (illimité) | Taille maximale de fichier par envoi, en mégaoctets. Définissez 0 pour une taille illimitée. L'image publiée fournit `0` ; une construction depuis les sources part de 100. |
| `MAX_BATCH_SIZE` | `0` (illimité) | Nombre maximal de fichiers dans une seule requête de lot. Définissez 0 pour un nombre illimité. L'image publiée fournit `0` ; une construction depuis les sources part de 100. |
| `CONCURRENT_JOBS` | `0` (auto) | Nombre de tâches de lot exécutées en parallèle. Définissez 0 pour une détection automatique selon les cœurs de CPU disponibles. |
| `MAX_MEGAPIXELS` | `0` (illimité) | Résolution d'image maximale autorisée, en mégapixels. Définissez 0 pour une résolution illimitée. |
| `MAX_WORKER_THREADS` | `0` (auto) | Nombre maximal de threads de travail pour le traitement d'image. Définissez 0 pour une détection automatique selon les cœurs de CPU disponibles. |
| `PROCESSING_TIMEOUT_S` | `0` (sans limite) | Délai d'expiration de chaque appel au sidecar Python qui exécute les outils d'IA, en secondes. Définissez 0 pour aucune limite. Il ne plafonne pas les tâches d'image, de PDF ou de média ; ce sont `JOB_TIMEOUT_FAST_S` et `JOB_TIMEOUT_LONG_S` qui s'en chargent. |
| `AI_SIDECAR_IDLE_TIMEOUT` | `600` | Nombre de secondes pendant lesquelles le sidecar d'IA Python et le runtime d'OCR précis restent inactifs avant de s'arrêter et de libérer leur mémoire (environ 1,3 GB et 0,7 GB une fois chauds). Tous deux redémarrent à la requête suivante, de sorte que le premier appel d'IA après un arrêt pour inactivité subit le coût de démarrage des bibliothèques, quelques secondes. Définissez 0 pour les garder en fonctionnement. La valeur par défaut correspond à `AI_SESSION_IDLE_TIMEOUT`, afin que les modèles chargés ne soient pas abandonnés plus tôt que ne l'indique ce paramètre. Si vous augmentez `AI_SESSION_IDLE_TIMEOUT`, augmentez celle-ci d'autant. |
| `JOB_TIMEOUT_FAST_S` | `120` | Délai maximal d'une tâche dans les pools rapides (outils d'image et de document), en secondes. Une tâche qui dure plus longtemps échoue avec une erreur de délai d'expiration. Définissez 0 pour aucune limite. |
| `JOB_TIMEOUT_LONG_S` | `7200` | Délai maximal d'une tâche dans les pools longs (outils d'IA et de média, ainsi que tout outil marqué comme long), en secondes. Définissez 0 pour aucune limite. L'OCR de PDF en modes Balanced et Best prolonge son propre délai selon le nombre de pages (2 et 5 minutes par page), jusqu'à 6 heures, si bien qu'un PDF volumineux ne nécessite pas d'augmenter cette valeur. |
| `SYNC_WAIT_MS` | `8000` | Durée pendant laquelle une requête d'outil attend sa tâche avant que l'API cesse d'attendre et renvoie `202` avec un identifiant de tâche à suivre via SSE, en millisecondes. Cela n'arrête pas la tâche. Définissez 0 pour attendre la tâche aussi longtemps qu'elle dure. |
| `MAX_PIPELINE_STEPS` | `20` | Nombre maximal d'étapes dans un pipeline. Définissez 0 pour aucune limite. |
| `MAX_CANVAS_PIXELS` | `0` (sans limite) | Taille maximale du canevas, en pixels, pour les images de sortie. Définissez 0 pour aucune limite. |
| `MAX_SVG_SIZE_MB` | `50` | Taille maximale d'un SVG accepté avant assainissement, en mégaoctets. Ici, `0` se comporte différemment que dans les lignes voisines : il supprime entièrement le plafond de taille appliqué avant l'analyse au lieu de le relever, alors laissez cette variable définie. |
| `MAX_PDF_PAGES` | `0` (illimité) | Nombre maximal de pages PDF pour la conversion de PDF en images. Définissez 0 pour un nombre illimité. |
| `MAX_SETTINGS_PAYLOAD_KB` | `64` | Taille maximale du champ `settings` qu'une requête d'outil peut transporter, en kilo-octets, comptée en octets UTF-8. Les requêtes au-delà de la limite reçoivent une `400`. Définissez 0 pour aucune limite. Les paramètres réels des outils sont bien inférieurs à 64 KB, n'augmentez donc cette valeur que si un client envoie des paramètres inhabituellement volumineux. |

### Moteurs {#engines}

SnapOtter recherche chaque binaire de traitement dans le `$PATH` du conteneur, ces variables restent donc vides sauf si vous montez votre propre build.

| Variable | Valeur par défaut | Description |
|---|---|---|
| `FFMPEG_PATH` | (vide) | Chemin vers le binaire `ffmpeg` utilisé par les outils vidéo et audio. |
| `FFPROBE_PATH` | (vide) | Chemin vers `ffprobe`, qui lit les fichiers multimédias avant leur traitement. Faites-le pointer vers le même build que `FFMPEG_PATH`. |
| `QPDF_PATH` | (vide) | Chemin vers `qpdf`, utilisé par les outils PDF et pour vérifier les PDF envoyés. |
| `SOFFICE_PATH` | (vide) | Chemin vers `soffice` de LibreOffice, utilisé pour les conversions de documents bureautiques. |
| `PDFCPU_PATH` | (vide) | Chemin vers `pdfcpu`, utilisé par certains outils PDF. |
| `GS_PATH` | (vide) | Chemin vers `gs` de Ghostscript, utilisé par les outils PDF et l'OCR de PDF. |
| `PANDOC_PATH` | (vide) | Chemin vers `pandoc`, utilisé pour les conversions de documents. |
| `SNAPOTTER_FONT_FILE` | (vide) | Fichier de police pour le texte dessiné sur la vidéo (incrustation de sous-titres, filigrane vidéo). Vide utilise la première police trouvée par l'image. |
| `SNAPOTTER_FONT_FAMILY` | (vide) | Nom de famille de `SNAPOTTER_FONT_FILE`. Vide signifie `Sans`. |
| `SNAPOTTER_HW_ACCEL` | (vide) | Famille d'encodeurs vidéo matériels, `nvenc` ou `vaapi`. Vide encode de manière logicielle. |

`SNAPOTTER_HW_ACCEL` nécessite un ffmpeg compilé avec cette famille d'encodeurs, et le ffmpeg de l'image n'en a aucune des deux. Avec le binaire propre à l'image, le paramètre se rabat sur l'encodage logiciel et l'indique dans le journal de démarrage. Pour l'utiliser, montez votre propre build de ffmpeg, faites pointer `FFMPEG_PATH` et `FFPROBE_PATH` vers celui-ci, et donnez au conteneur l'accès au périphérique GPU. Pour `nvenc`, définissez aussi `NVIDIA_DRIVER_CAPABILITIES=compute,utility,video` : l'image ne demande que `compute,utility`, et sans `video` le runtime NVIDIA ne monte pas la bibliothèque d'encodage, si bien que l'encodeur est listé mais que chaque encodage échoue. Un chemin personnalisé qui n'existe pas ou n'est pas exécutable est également signalé dans le journal de démarrage, et chaque tâche qui a besoin de ce binaire échoue jusqu'à ce que vous corrigiez le chemin ou supprimiez la variable.

Les fichiers Compose publiés les transmettent toutes depuis `.env`, il suffit donc de les y définir.

### Nettoyage {#cleanup}

| Variable | Valeur par défaut | Description |
|---|---|---|
| `FILE_MAX_AGE_HOURS` | `72` | Durée de conservation des résultats de traitement non enregistrés (envois bruts et résultats des outils) avant leur suppression automatique. Les fichiers que vous enregistrez explicitement dans la bibliothèque Fichiers ne sont pas concernés et sont conservés jusqu'à ce que vous les supprimiez. |
| `CLEANUP_INTERVAL_MINUTES` | `60` | Fréquence d'exécution de la tâche de nettoyage. |

### Apparence {#appearance}

| Variable | Valeur par défaut | Description |
|---|---|---|
| `DEFAULT_THEME` | `light` | Thème par défaut des nouvelles sessions. `light`, `dark` ou `system`. |
| `DEFAULT_LOCALE` | `en` | Langue par défaut de l'interface. |
| `DEFAULT_TOOL_VIEW` | `sidebar` | Disposition par défaut des outils. `sidebar` ou `fullscreen`. |

### Permissions Docker {#docker-permissions}

| Variable | Valeur par défaut | Description |
|---|---|---|
| `PUID` | `999` | Exécute le processus du conteneur sous cet UID. Faites-le correspondre à votre utilisateur hôte pour les bind mounts (`id -u`). |
| `PGID` | `999` | Exécute le processus du conteneur sous ce GID. Faites-le correspondre à votre groupe hôte pour les bind mounts (`id -g`). |

## Exemple Docker {#docker-example}

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

## Volumes {#volumes}

La pile Docker Compose utilise quatre volumes :

- `/data` (app) - Modèles d'IA, venv Python et fichiers utilisateur. Montez-le pour conserver les fichiers envoyés et les bundles d'IA installés d'un redémarrage à l'autre.
- `/tmp/workspace` (app) - Stockage temporaire des fichiers en cours de traitement. Il peut être éphémère, mais le monter évite de remplir la couche inscriptible du conteneur.
- `SnapOtter-pgdata` (postgres) - Répertoire de données PostgreSQL. Il contient toutes les données relationnelles (utilisateurs, paramètres, pipelines, tâches, journal d'audit). Sauvegardez-le via `pg_dump` ou par un instantané du volume.
- `SnapOtter-redisdata` (redis) - Fichier append-only de Redis pour des files de tâches durables.
