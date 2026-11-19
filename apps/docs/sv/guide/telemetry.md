---
description: "Vilka anonyma användningsdata SnapOtter samlar in, när de skickas, hur valet vid första start fungerar och hur du stänger av produktanalysen för hela instansen."
i18n_source_hash: 784b2a0c06eb
i18n_provenance: machine
i18n_output_hash: c068c02556a3
i18n_hash_version: 2
---

# Vad SnapOtter samlar in {#what-snapotter-collects}

Anonymous Product Analytics ställs in för hela instansen av en administratör. En ny instans frågar vid första start och skickar ingenting förrän någon svarar. Du kan ändra det när som helst under Settings > System > Privacy.

När analys är på skickar SnapOtter till PostHog vilka verktyg och pipelines som körs, hur lång tid de tar, om de lyckas, felkoder och antal filer, tillsammans med instansens anonyma id, dess version, CPU-arkitektur, operativsystem, installationstyp och om den har en GPU. Kraschrapporter skickas till Sentry med filnamn, sökvägar, e-postadresser och värden inom citattecken borttagna. Den skickar aldrig dina filer, deras namn eller sökvägar, deras innehåll, OCR-utdata eller extraherad text, bildmetadata eller din kontoidentitet. PostHog och Sentry är de enda två platser dit något skickas, och när analys är av skickas ingenting till någon av dem.

## Val vid första start {#first-run-choice}

Första gången en administratör öppnar en ny instans frågar SnapOtter: "Skicka anonym användningsstatistik och kraschrapporter? Dina filer skickas aldrig." De två svaren väger lika tungt och inget är förvalt. Om du stänger frågan utan att svara förblir analysen av och frågan ställs igen vid nästa besök. Bara en administratör ser den. Med `AUTH_ENABLED=false` finns inga konton och den lokala användaren fungerar som administratör, så den som öppnar appen svarar. Skrivbordsappen frågar på samma sätt.

En instans som redan körde innan den här frågan fanns får den inte. Den behåller den analysinställning den hade: på, om inte en administratör eller `SNAPOTTER_ANALYTICS_DEFAULT=off` har stängt av den.

## Händelser vi skickar (när det är aktiverat) {#events-we-send-when-enabled}

- tool_used: verktygs-id, status, varaktighet, kategori, om det är ett AI-verktyg och en felkod vid misslyckande.
- pipeline_executed: antal steg, verktygs-id:n, batchflagga, antal filer, varaktighet, status.
- ai_bundle_action: paket-id, åtgärd, varaktighet.
- Frontend-användning: vilka verktygssidor som öppnas, tillagda filer (endast antal), startat verktyg, nedladdningar, sparningar, sökning (endast antal resultat), batch bearbetad.
- Kraschrapporter: feltyp, ett redigerat felmeddelande (filnamn, sökvägar, e-postadresser och värden inom citattecken borttagna), en källstack med filbasnamn och för AI-verktyg en Python-traceback med endast filbasnamn.

## Vad vi aldrig samlar in {#what-we-never-collect}

- Filnamn eller sökvägar
- Filinnehåll
- OCR-utdatatext
- Bildmetadata (EXIF)
- Extraherad dokumenttext
- Din kontoidentitet

PostHog ser den IP-adress som varje begäran kommer från, som vilken server som helst. Vårt PostHog-projekt förkastar den i stället för att lagra den, och SnapOtters egna serverhändelser skickar en platshållare i dess ställe.

## Uppdateringsaviseringar {#update-notices}

Medan analys är på frågar servern PostHog med några timmars mellanrum vilken SnapOtter-version som är nyast, med instansens anonyma id och dess version. När en nyare version finns ser administratörer en avisering med en länk till versionsanteckningarna. Avfärdar du den förblir den dold tills nästa version. Inget installeras eller laddas ned åt dig, och när analys är av frågar servern aldrig.

## Stänga av det {#turning-it-off}

Administratörer: Settings > System > Privacy, stäng av "Anonymous Product Analytics". Det upphör omedelbart, för hela instansen. Om du vill bygga en image som aldrig kan skicka något, ange build-argumentet `SNAPOTTER_ANALYTICS=off`. `SNAPOTTER_TELEMETRY=off` i serverns miljö gör detsamma vid körning och går före varje svar som sparats i appen.

Om du vill besvara frågan vid första start i förväg lägger du till `SNAPOTTER_ANALYTICS_DEFAULT=off` (eller `on`) i serverns miljö före dess första start, så frågas ingen. Med Docker Compose lägger du det under `environment:` för appens tjänst, eftersom att ange det bara i `.env` inte når containern.
