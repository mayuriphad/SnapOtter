---
description: "SnapOtter のすべての環境変数とそのデフォルト値です。認証、ストレージ、AI モデル、アナリティクスなどを設定します。"
i18n_source_hash: 02edb8bd70e5
i18n_provenance: machine
i18n_output_hash: be655d1afe57
i18n_hash_version: 2
---

# 設定 {#configuration}

すべての設定は環境変数で行います。どの変数にも適切なデフォルト値があるため、いずれも設定しなくても SnapOtter はそのまま動作します。

## 環境変数 {#environment-variables}

### サーバー {#server}

| 変数 | デフォルト | 説明 |
|---|---|---|
| `PORT` | `1349` | サーバーが待ち受けるポートです。 |
| `HOST` | `0.0.0.0` | サーバーが待ち受ける IP アドレスです。ブリッジネットワーク（`docker run` と Compose のデフォルト）では `0.0.0.0`（または `::`）のままにしてください。そうしないと公開ポートが機能しなくなります。ネイティブインストールやホストネットワーク上のコンテナでは、`127.0.0.1` にすると API がネットワークに公開されません。リモートアクセスには前段にリバースプロキシを置いてください。[組み込みモード](#embedded-mode)は起動チェックが `127.0.0.1` を呼び出すため、`0.0.0.0`、`::` または `127.0.0.1` でのみ動作します。それ以外のアドレス（`::1` を含む）では、コンテナは起動済みと見なされず、後でクラッシュするとサーバーを再起動する代わりにコンテナが停止します。IP アドレスではない値（`localhost` を含む）を指定すると、起動時にサーバーが停止します。 |
| `BASE_PATH` | （空） | 公開時のデプロイパスです（例: `/snapotter`）。空または `/` の場合はドメインのルートで配信します。実行時に適用されるため、イメージの再ビルドは不要です。 |
| `RATE_LIMIT_PER_MIN` | `1000` | IP ごとの 1 分あたりの最大リクエスト数です。0 に設定するとレート制限が無効になります。 |
| `CORS_ORIGIN` | （空） | CORS で許可するオリジンのカンマ区切りリストです。空の場合は同一オリジンのみになります。 |
| `LOG_LEVEL` | `info` | ログの詳細度です。`fatal`、`error`、`warn`、`info`、`debug`、`trace` のいずれかです。 |
| `TRUST_PROXY` | `loopback,linklocal,uniquelocal` | `X-Forwarded-For` を通じてクライアント IP を設定できるピアです。デフォルトではプライベートネットワーク上のピアだけを信頼するため、Docker ネットワークや LAN 上のリバースプロキシは信頼され、パブリックなクライアントが偽造したヘッダーは信頼されません。`true` を設定するのは、自分で管理するプロキシがパブリックアドレス上で前段にある場合だけにしてください。 |
| `SNAPOTTER_ANALYTICS_DEFAULT` | `on` | `off` に設定すると、「Anonymous Product Analytics」をオフにした状態で新しいインスタンスを起動し、最初の起動時から何も送信しません。この変数は、まだ誰もこの設定を選んでいない間だけ設定値を埋めます。管理者またはこの変数によって設定が一度保存されると、変数を変更しても何も起きません。管理者は引き続き Settings > System > Privacy でアナリティクスをオンにできます。 |

### 認証 {#authentication}

以下の 2 つのブール値は `true` と `false` だけを受け付けます。`1` や `yes` や `on` など、それ以外の値は検証に失敗し、サーバーは待ち受けを開始する前に終了します。

| 変数 | デフォルト | 説明 |
|---|---|---|
| `AUTH_ENABLED` | `true` | ログインを必須にします。`false` に設定するとアカウントを一切使わずに実行され、すべてのリクエストに管理者権限が与えられるため、信頼できるネットワーク内だけで使用してください。 |
| `DEFAULT_USERNAME` | `admin` | 初期管理者アカウントのユーザー名です。初回実行時にのみ使用されます。 |
| `DEFAULT_PASSWORD` | `admin` | 初期管理者アカウントのパスワードです。初回ログイン後に変更してください。 |
| `MAX_USERS` | `0`（無制限） | 登録できるユーザーアカウントの最大数です。0 に設定すると無制限になります。 |
| `SESSION_DURATION_HOURS` | `168` | ログインセッションの有効期間（時間）です（デフォルトは 7 日間）。 |
| `SKIP_MUST_CHANGE_PASSWORD` | `false` | `true` に設定すると、初回ログイン時のパスワード変更の強制プロンプトをスキップします。 |

### ストレージ {#storage}

| 変数 | デフォルト | 説明 |
|---|---|---|
| `STORAGE_MODE` | `local` | `local` または `s3` です。S3 と MinIO には、s3_storage 機能を含むライセンスと、以下の `S3_*` 変数が必要です。 |
| `DATABASE_URL` | `postgres://snapotter:snapotter@localhost:5432/snapotter` | PostgreSQL の接続文字列で、すべてのリクエストの処理に使われる接続です。2.3.0 以降では、`DATABASE_MIGRATION_URL` も設定すると、これは最小権限のランタイムロールになり、アプリのテーブルに対する DML 権限だけを持ちます。Compose スタックではこれを `postgres` サービスに向けています。組み込みモードを使うには、（`REDIS_URL` とともに）未設定のままにしてください。 |
| `DATABASE_MIGRATION_URL` | （空） | 特権を持つ接続です。起動時にマイグレーションの実行とランタイムロールへの権限付与にのみ使われ、最初のリクエストの前に閉じられます。空のままにすると SnapOtter は単一ロールで動作し、`DATABASE_URL` が両方の役割を担います。[最小権限ロール](/ja/guide/database#least-privilege-roles)を参照してください。 |
| `REDIS_URL` | `redis://localhost:6379` | Redis の接続文字列です（BullMQ のジョブキューに使用）。Compose ではこれを `redis` サービスに向けています。 |
| `WORKSPACE_PATH` | `./tmp/workspace` | 処理中の一時ファイル用のディレクトリです。自動的にクリーンアップされます。イメージでは `/tmp/workspace` が設定されています。 |
| `FILES_STORAGE_PATH` | `./data/files` | 永続的なユーザーファイル（アップロードされた画像、保存された結果）用のディレクトリです。イメージでは `/data/files` が設定されています。 |

### S3 オブジェクトストレージ {#s3-object-storage}

`STORAGE_MODE=s3` の場合にのみ読み込まれます。3 つの必須変数のいずれかが欠けていると起動が失敗し、設定し忘れた変数の名前が示されます。

| 変数 | デフォルト | 説明 |
|---|---|---|
| `S3_BUCKET` | （空） | アップロードと出力を保存するバケットです。必須です。 |
| `S3_ACCESS_KEY_ID` | （空） | アクセスキーです。必須です。コンテナでは、代わりに `S3_ACCESS_KEY_ID_FILE` を使ってマウントすることもできます。 |
| `S3_SECRET_ACCESS_KEY` | （空） | シークレットキーです。必須です。ファイルの規則も同じで、`S3_SECRET_ACCESS_KEY_FILE` を使います。 |
| `S3_REGION` | `us-east-1` | バケットのリージョンです。 |
| `S3_ENDPOINT` | （空） | MinIO、R2、Backblaze など、S3 互換ストア用のカスタムエンドポイントです。空の場合は AWS を意味します。 |
| `S3_FORCE_PATH_STYLE` | `false` | MinIO など、仮想ホスト形式のアドレス指定ではなく `endpoint/bucket/key` を必要とするストアでは `true` に設定してください。 |
| `S3_PREFIX` | （空） | キーのプレフィックスです。これにより 1 つのバケットに複数のインスタンスを保存できます。 |

### 保存時の暗号化 {#encryption-at-rest}

| 変数 | デフォルト | 説明 |
|---|---|---|
| `DATA_ENCRYPTION_KEY` | （空） | 64 文字の 16 進数（32 バイト）です。データベースに保存される機密性の高い設定を暗号化します。64 文字の 16 進数でない値は、起動時に拒否されます。 |
| `DATA_ENCRYPTION_KEY_PREVIOUS` | （空） | ローテーションで置き換える前のキーで、形式は同じです。ローテーション中は両方を設定して既存の行を引き続き復号できるようにし、その後こちらを削除してください。 |

### 組み込みモード {#embedded-mode}

`DATABASE_URL` も `REDIS_URL` も設定せずにイメージを実行すると、コンテナ内で独自の PostgreSQL 17 と Redis がループバックにバインドされた状態で起動し、すべてのデータは `/data` ボリュームに保存されます。これにより、クイックスタート、ホームラボ、1.x からのアップグレードのために、1 つのコマンドで済む `docker run` の体験が戻ります。これは手軽に使うための方法であり、本番環境向けのデプロイではありません。本番環境では、PostgreSQL と Redis を分離した 3 コンテナ構成の Compose スタックを実行してください。組み込みモードではコンテナを root で実行する必要があり、任意の UID で実行するランタイム（OpenShift、Kubernetes の `runAsNonRoot`）とは互換性がありません。そうした環境では Compose を使用してください。

| 変数 | デフォルト | 説明 |
|---|---|---|
| `EMBEDDED` | `auto` | `DATABASE_URL` と `REDIS_URL` の両方が未設定の場合に自動的に有効になります。`0` に設定すると無効になります（その場合、外部の `DATABASE_URL`/`REDIS_URL` が設定されていなければ、コンテナ内のデータベースを黙って起動する代わりに、アプリはすぐに失敗します）。 |
| `REDIS_MAXMEMORY` | `512mb` | 組み込みの Redis のメモリ上限です（組み込みモードのみ）。Raspberry Pi のようにメモリが限られたホストでは値を下げてください。 |
| `EMBEDDED_PG_PORT` | `5432` | 組み込みの PostgreSQL が使うループバックポートです（組み込みモードのみ）。`--network host` のように、5432 がすでに使われているネットワークをコンテナが共有している場合にのみ変更してください。PostgreSQL はホストネットワーク上で特権ポートにバインドできない非特権ユーザーとして動作するため、この値は `EMBEDDED_REDIS_PORT` と異なり、かつ 1023 より大きくなければなりません。 |
| `EMBEDDED_REDIS_PORT` | `6379` | 同上で、組み込みの Redis 用です。Redis も非特権ユーザーとして動作します。 |
| `EMBEDDED_DB_PASSWORDS` | （空） | `1` に設定すると、次回の起動時に組み込みの PostgreSQL のロールと Redis 用のランダムなパスワードを生成し、`/data/.embedded-db-secrets` に保存します。以降、TCP でのログインにはこれらのパスワードが必要になります。2.3.0 以降で初めて作成されたボリュームでは、PostgreSQL のスーパーユーザーは TCP 経由で一切ログインできません。それより古いボリュームではデータベースの所有者がスーパーユーザーであり、それを守るのはそのパスワードです。`--network host` のように他のプログラムがコンテナのネットワークを共有する場合は、常にこの変数を使ってください。この設定はそのボリュームでは有効なままです。この変数を未設定に戻してもパスワードは毎回の起動で使われ、`/data/.embedded-db-secrets` を削除しても新しいパスワードが作られるだけで、変数が未設定の場合は起動が失敗します。これらのファイルのいずれかが破損してコンテナが起動しない場合は、`docker run --rm -v <volume>:/data --entrypoint rm snapotter/snapotter:<your tag> -r /data/.embedded-db-secrets/<name>` でそのファイルを削除し、コンテナを再度起動してください。次回の起動時に新しいファイルが作られます。この変数は `1`、`0` または空を受け付け、それ以外の値では起動が停止します。 |
| `EMBEDDED_REDIS_TIMEOUT_S` | `180` | 起動処理が、組み込みの Redis が `PING` に応答するのを待ってから諦めるまでの秒数です。タイムアウトすると、コンテナはハングする代わりに停止し、その理由をログに記録します。1 から 999999 までの整数の秒数で指定します。無制限を表す値はありません。永遠に待ち続けることこそ、この上限が防ぐための障害だからです。低速なホストでこの上限に達する場合にのみ値を引き上げてください。 |
| `EMBEDDED_POSTGRES_TIMEOUT_S` | `600` | 同上で、組み込みの PostgreSQL 用です。計測は初回起動時の `initdb` が完了した後に始まるため、初期のデータベース作成ではなく、サーバーの起動とクラッシュリカバリーが対象になります。 |

1.x からのアップグレード: 古い `snapotter.db` をボリューム内の `/data/snapotter.db` に配置すると、組み込みモードが初回起動時にそれを組み込みの PostgreSQL にインポートします。インポートは 1 回だけ実行され、以降の起動ではスキップされます。

テレメトリに関する注意: 組み込みモードは、他の設定と同様にイメージのアナリティクスのデフォルトを引き継ぎます。公開イメージはアナリティクスが有効な状態で提供されます。無効にするには、`--build-arg SNAPOTTER_ANALYTICS=off` でビルドするか、最初の起動前に `SNAPOTTER_ANALYTICS_DEFAULT=off` を設定するか、アプリ内の管理者用オプトアウトを使用してください。

### 処理の制限 {#processing-limits}

| 変数 | デフォルト | 説明 |
|---|---|---|
| `MAX_UPLOAD_SIZE_MB` | `0`（無制限） | アップロード 1 回あたりの最大ファイルサイズ（MB）です。0 に設定すると無制限になります。公開イメージの値は `0` で、ソースからのビルドでは 100 から始まります。 |
| `MAX_BATCH_SIZE` | `0`（無制限） | 1 回のバッチリクエストに含めることができるファイルの最大数です。0 に設定すると無制限になります。公開イメージの値は `0` で、ソースからのビルドでは 100 から始まります。 |
| `CONCURRENT_JOBS` | `0`（自動） | 並列で実行するバッチジョブの数です。0 に設定すると、利用可能な CPU コア数に基づいて自動検出します。 |
| `MAX_MEGAPIXELS` | `0`（無制限） | 許可される画像の最大解像度（メガピクセル）です。0 に設定すると無制限になります。 |
| `MAX_WORKER_THREADS` | `0`（自動） | 画像処理に使う最大ワーカースレッド数です。0 に設定すると、利用可能な CPU コア数に基づいて自動検出します。 |
| `PROCESSING_TIMEOUT_S` | `0`（制限なし） | AI ツールを実行する Python サイドカーへの各呼び出しのタイムアウト（秒）です。0 に設定すると制限なしになります。画像、PDF、メディアのジョブには上限を設けません。それは `JOB_TIMEOUT_FAST_S` と `JOB_TIMEOUT_LONG_S` が担います。 |
| `AI_SIDECAR_IDLE_TIMEOUT` | `600` | Python AI サイドカーと高精度 OCR ランタイムがアイドル状態のまま待機し、終了してメモリを解放する（ウォーム状態でそれぞれ約 1.3 GB と 0.7 GB）までの秒数です。どちらも次のリクエストで再び起動するため、アイドル終了後の最初の AI 呼び出しでは、ライブラリの起動コストとして数秒かかります。0 に設定すると実行し続けます。デフォルト値は `AI_SESSION_IDLE_TIMEOUT` と同じなので、読み込まれたモデルがその設定より早く破棄されることはありません。`AI_SESSION_IDLE_TIMEOUT` を引き上げる場合は、この値も合わせて引き上げてください。 |
| `JOB_TIMEOUT_FAST_S` | `120` | 高速プール（画像およびドキュメントツール）での 1 つのジョブの期限（秒）です。それより長く実行されたジョブはタイムアウトエラーで失敗します。0 に設定すると制限なしになります。 |
| `JOB_TIMEOUT_LONG_S` | `7200` | ロングプール（AI およびメディアツールと、長時間実行としてマークされたすべてのツール）での 1 つのジョブの期限（秒）です。0 に設定すると制限なしになります。Balanced と Best の PDF OCR は、ページ数に応じて自身の期限を最大 6 時間まで延長する（1 ページあたりそれぞれ 2 分と 5 分）ため、大きな PDF のためにこの値を引き上げる必要はありません。 |
| `SYNC_WAIT_MS` | `8000` | API が待機をやめ、SSE で追跡するためのジョブ ID とともに `202` を返すまでに、ツールのリクエストがジョブを待つ時間（ミリ秒）です。ジョブ自体は停止しません。0 に設定すると、ジョブにどれだけ時間がかかっても待ちます。 |
| `MAX_PIPELINE_STEPS` | `20` | パイプラインの最大ステップ数です。0 に設定すると制限なしになります。 |
| `MAX_CANVAS_PIXELS` | `0`（制限なし） | 出力画像の最大キャンバスサイズ（ピクセル）です。0 に設定すると制限なしになります。 |
| `MAX_SVG_SIZE_MB` | `50` | サニタイズ前に受け付ける SVG の最大サイズ（MB）です。ここでの `0` は、前後の行とは動作が異なります。解析前のサイズ上限を引き上げるのではなく完全に取り除くため、この値は設定したままにしてください。 |
| `MAX_PDF_PAGES` | `0`（無制限） | PDF から画像への変換で扱う PDF の最大ページ数です。0 に設定すると無制限になります。 |
| `MAX_SETTINGS_PAYLOAD_KB` | `64` | ツールのリクエストに含めることができる `settings` フィールドの最大サイズ（キロバイト、UTF-8 のバイト数で計算）です。上限を超えるリクエストには `400` が返されます。0 に設定すると制限なしになります。実際のツール設定は 64 KB よりはるかに小さいため、クライアントが異常に大きな設定を送信する場合にのみこの値を引き上げてください。 |

### エンジン {#engines}

SnapOtter は各処理用バイナリをコンテナ内の `$PATH` から探すため、独自のビルドをマウントしない限り、これらは空のままにします。

| 変数 | デフォルト | 説明 |
|---|---|---|
| `FFMPEG_PATH` | （空） | 動画ツールと音声ツールが使う `ffmpeg` バイナリへのパスです。 |
| `FFPROBE_PATH` | （空） | 処理前にメディアファイルを読み取る `ffprobe` へのパスです。`FFMPEG_PATH` と同じビルドを指定してください。 |
| `QPDF_PATH` | （空） | PDF ツールとアップロードされた PDF のチェックに使用する `qpdf` へのパスです。 |
| `SOFFICE_PATH` | （空） | Office ドキュメントの変換に使用する LibreOffice の `soffice` へのパスです。 |
| `PDFCPU_PATH` | （空） | 一部の PDF ツールが使用する `pdfcpu` へのパスです。 |
| `GS_PATH` | （空） | PDF ツールと PDF OCR が使用する Ghostscript の `gs` へのパスです。 |
| `PANDOC_PATH` | （空） | ドキュメント変換で使用する `pandoc` へのパスです。 |
| `SNAPOTTER_FONT_FILE` | （空） | 動画に描画するテキスト（字幕の焼き込み、動画の透かし）に使うフォントファイルです。空の場合は、イメージが最初に見つけたフォントを使用します。 |
| `SNAPOTTER_FONT_FAMILY` | （空） | `SNAPOTTER_FONT_FILE` のフォントファミリー名です。空の場合は `Sans` になります。 |
| `SNAPOTTER_HW_ACCEL` | （空） | ハードウェア動画エンコーダーのファミリーで、`nvenc` または `vaapi` です。空の場合はソフトウェアでエンコードします。 |

`SNAPOTTER_HW_ACCEL` には、そのエンコーダーファミリーを有効にしてビルドされた ffmpeg が必要ですが、イメージに含まれる ffmpeg はどちらにも対応していません。イメージ付属のバイナリでは、この設定はソフトウェアエンコードにフォールバックし、その旨を起動ログに出力します。使用するには、独自の ffmpeg ビルドをマウントし、`FFMPEG_PATH` と `FFPROBE_PATH` をそれに向け、コンテナに GPU デバイスを割り当ててください。`nvenc` の場合は `NVIDIA_DRIVER_CAPABILITIES=compute,utility,video` も設定してください。イメージは `compute,utility` だけを要求しており、`video` がないと NVIDIA ランタイムはエンコードライブラリをマウントしないため、エンコーダーは一覧に表示されてもすべてのエンコードが失敗します。存在しない、または実行できないパスを上書き指定した場合も起動ログにその名前が出力され、パスを修正するか設定を解除するまで、そのバイナリを必要とするすべてのジョブが失敗します。

公開されている Compose ファイルはこれらすべてを `.env` から渡すため、そこで設定すれば十分です。

### クリーンアップ {#cleanup}

| 変数 | デフォルト | 説明 |
|---|---|---|
| `FILE_MAX_AGE_HOURS` | `72` | 保存されていない処理結果（元のアップロードとツールの出力）を自動削除するまで保持する期間です。Files ライブラリに明示的に保存したファイルは影響を受けず、削除するまで保持されます。 |
| `CLEANUP_INTERVAL_MINUTES` | `60` | クリーンアップジョブを実行する間隔です。 |

### 外観 {#appearance}

| 変数 | デフォルト | 説明 |
|---|---|---|
| `DEFAULT_THEME` | `light` | 新しいセッションのデフォルトテーマです。`light`、`dark`、または `system` です。 |
| `DEFAULT_LOCALE` | `en` | インターフェースのデフォルト言語です。 |
| `DEFAULT_TOOL_VIEW` | `sidebar` | ツールのデフォルトのレイアウトです。`sidebar` または `fullscreen` です。 |

### Docker の権限 {#docker-permissions}

| 変数 | デフォルト | 説明 |
|---|---|---|
| `PUID` | `999` | コンテナのプロセスをこの UID で実行します。バインドマウントを使う場合は、ホストのユーザーに合わせて設定してください（`id -u`）。 |
| `PGID` | `999` | コンテナのプロセスをこの GID で実行します。バインドマウントを使う場合は、ホストのグループに合わせて設定してください（`id -g`）。 |

## Docker の例 {#docker-example}

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

## ボリューム {#volumes}

Docker Compose スタックでは 4 つのボリュームを使用します。

- `/data` (app) - AI モデル、Python venv、ユーザーファイル。再起動後もアップロードしたファイルやインストールした AI バンドルを保持するには、これをマウントしてください。
- `/tmp/workspace` (app) - 処理中のファイル用の一時ストレージ。一時的なものでも構いませんが、マウントするとコンテナの書き込み可能レイヤーがいっぱいになるのを防げます。
- `SnapOtter-pgdata` (postgres) - PostgreSQL のデータディレクトリ。すべてのリレーショナルデータ（ユーザー、設定、パイプライン、ジョブ、監査ログ）を保持します。`pg_dump` またはボリュームのスナップショットでバックアップしてください。
- `SnapOtter-redisdata` (redis) - 永続的なジョブキューのための Redis の append-only ファイル。
