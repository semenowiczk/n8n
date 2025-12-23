# K2BUD Unified Agent - Instrukcja Instalacji i Konfiguracji

## 📋 Spis Treści

1. [Wymagania](#wymagania)
2. [Krok 1: Konfiguracja Telegram Bot](#krok-1-konfiguracja-telegram-bot)
3. [Krok 2: Konfiguracja Anthropic Claude API](#krok-2-konfiguracja-anthropic-claude-api)
4. [Krok 3: Konfiguracja Google Drive](#krok-3-konfiguracja-google-drive)
5. [Krok 4: Utworzenie struktury folderów](#krok-4-utworzenie-struktury-folderów)
6. [Krok 5: Import workflow do n8n](#krok-5-import-workflow-do-n8n)
7. [Krok 6: Konfiguracja zmiennych środowiskowych](#krok-6-konfiguracja-zmiennych-środowiskowych)
8. [Krok 7: Testowanie systemu](#krok-7-testowanie-systemu)
9. [Troubleshooting](#troubleshooting)

---

## Wymagania

### Oprogramowanie

- **n8n** v1.0+ (self-hosted lub n8n.cloud)
  - Instalacja lokalna: `npm install n8n -g`
  - Lub użyj n8n.cloud: https://n8n.cloud
- **Node.js** v18+ (jeśli self-hosted)
- **Dostęp do internetu** (dla API calls)

### Konta i klucze API

- Telegram Bot Token
- Anthropic API Key
- Google Account z Google Drive

### Szacowany czas instalacji

- Pierwsze uruchomienie: **30-45 minut**
- Ponowna konfiguracja: **10-15 minut**

---

## Krok 1: Konfiguracja Telegram Bot

### 1.1 Stwórz bota przez @BotFather

1. Otwórz Telegram i wyszukaj `@BotFather`
2. Wyślij komendę `/newbot`
3. Podaj nazwę bota (np. "K2BUD Agent")
4. Podaj username bota (musi kończyć się na `bot`, np. `k2bud_agent_bot`)
5. **Zapisz token** który otrzymasz (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 1.2 Konfiguracja bota

```
/setdescription - Ustaw opis bota
Opis: Agent K2BUD do zarządzania dokumentami i konwersacji AI

/setabouttext - Krótki tekst o bocie
Tekst: Inteligentny asystent dla spółki K2BUD. Automatyczna klasyfikacja dokumentów i rozmowa z AI.

/setcommands - Ustaw komendy
help - Wyświetl pomoc
status - Status systemu
archive - Wymuś archiwizację
```

### 1.3 Uzyskaj Chat ID

1. Wyślij dowolną wiadomość do swojego bota
2. Otwórz w przeglądarce:
   ```
   https://api.telegram.org/bot<TWOJ_TOKEN>/getUpdates
   ```
3. Znajdź pole `"chat":{"id": 123456789}` - to Twój Chat ID
4. **Zapisz Chat ID** do późniejszej konfiguracji

---

## Krok 2: Konfiguracja Anthropic Claude API

### 2.1 Uzyskaj API Key

1. Przejdź do https://console.anthropic.com/
2. Zaloguj się lub utwórz konto
3. Przejdź do sekcji "API Keys"
4. Kliknij "Create Key"
5. Nadaj nazwę (np. "K2BUD n8n Agent")
6. **Zapisz klucz** (format: `sk-ant-api03-...`)

⚠️ **WAŻNE:** Klucz jest wyświetlany tylko raz! Zapisz go w bezpiecznym miejscu.

### 2.2 Doładuj konto (jeśli potrzeba)

- Claude API wymaga credits (płatne)
- Minimalna kwota: $5-10 USD
- Szacowane koszty K2BUD:
  - Klasyfikacja pliku: ~$0.001-0.003
  - Rozmowa (avg): ~$0.005-0.01
  - Miesięczny koszt (100 plików + 200 wiadomości): ~$2-5

### 2.3 Sprawdź dostępne modele

Upewnij się, że masz dostęp do:
- `claude-3-5-haiku-20241022` (klasyfikacja - szybki i tani)
- `claude-3-5-sonnet-20241022` (chat - lepszy, droższy)

---

## Krok 3: Konfiguracja Google Drive

### 3.1 Stwórz Google Cloud Project

1. Przejdź do https://console.cloud.google.com/
2. Stwórz nowy projekt (np. "K2BUD n8n Integration")
3. W menu wybierz "APIs & Services" > "Library"
4. Wyszukaj i włącz "Google Drive API"

### 3.2 Stwórz Service Account

1. Przejdź do "APIs & Services" > "Credentials"
2. Kliknij "Create Credentials" > "Service Account"
3. Nazwa: "k2bud-n8n-service"
4. Grant access: "Editor"
5. Kliknij "Done"

### 3.3 Wygeneruj JSON Key

1. Kliknij na stworzone Service Account
2. Zakładka "Keys"
3. "Add Key" > "Create new key"
4. Typ: JSON
5. **Pobierz i zapisz plik JSON** (będzie potrzebny w n8n)

### 3.4 Udostępnij folder Drive dla Service Account

1. Skopiuj email Service Account (z JSON lub z konsoli, format: `...@...iam.gserviceaccount.com`)
2. Przejdź do Google Drive
3. Kliknij prawym na folder główny K2BUD
4. "Share" > wklej email Service Account
5. Ustaw permissions: "Editor"
6. Kliknij "Share"

---

## Krok 4: Utworzenie struktury folderów

### 4.1 Struktura główna

Stwórz w Google Drive następującą hierarchię:

```
K2BUD/
├── 00_DO_SORTOWANIA/
├── 01_ADMINISTRACJA/
│   ├── Dokumenty_rejestrowe/
│   ├── Pelnomocnictwa/
│   └── Uchwaly/
├── 02_KSIĘGOWOŚĆ/
│   ├── Faktury/
│   ├── Umowy/
│   └── Deklaracje_podatkowe/
├── 03_PROJEKTY/
│   └── Projekt_01_Agatowa_Sieroslaw/
│       ├── 00_Dzialka/
│       ├── 01_Projekty_budowlane/
│       ├── 02_Pozwolenia/
│       ├── 03_Realizacja/
│       │   ├── Zdjecia_postep_prac/       ⭐ NAJWAŻNIEJSZY
│       │   ├── Faktury_budowa/
│       │   ├── Umowy_wykonawcy/
│       │   └── Protokoly_odbioru/
│       ├── 04_Odbiory/
│       └── 05_Gwarancje/
├── 04_PRAWNE/
│   ├── Umowy/
│   ├── Sprawy_sadowe/
│   └── Opinie_prawne/
├── 05_MARKETING/
│   ├── Materialy_promocyjne/
│   ├── Oferty/
│   └── Zdjecia_marketingowe/
├── 06_SZABLONY/
├── 07_ARCHIWUM/
├── 08_IT_INFRASTRUKTURA/
│   ├── Konfiguracje/
│   └── Backupy/
└── Archiwum_Telegram/
    ├── Obrazy/
    ├── Dokumenty/
    ├── Filmy/
    └── Audio/
```

### 4.2 Zbierz ID folderów

Dla każdego folderu:

1. Otwórz folder w Google Drive
2. Skopiuj ID z URL:
   ```
   https://drive.google.com/drive/folders/1a2B3c4D5e6F7g8H9i0J
                                           ^^^^^^^^^^^^^^^^^^^^
                                           To jest Folder ID
   ```
3. Zapisz mapowanie w formacie:

```
00_DO_SORTOWANIA = 1a2B3c4D5e6F7g8H9i0J
01_ADMINISTRACJA = 2b3C4d5E6f7G8h9I0j1K
03_PROJEKTY/.../Zdjecia_postep_prac = 3c4D5e6F7g8H9i0J1k2L
...
```

**Tip:** Możesz użyć arkusza kalkulacyjnego:
- Kolumna A: ścieżka folderu
- Kolumna B: Folder ID

### 4.3 Aktualizuj `google_drive_folder_mapping.json`

Otwórz plik `google_drive_folder_mapping.json` i zamień wszystkie `FOLDER_ID_PLACEHOLDER_XX` na rzeczywiste ID:

```json
{
  "pathToId": {
    "00_DO_SORTOWANIA": "1a2B3c4D5e6F7g8H9i0J",
    "03_PROJEKTY/Projekt_01_Agatowa_Sieroslaw/03_Realizacja/Zdjecia_postep_prac": "3c4D5e6F7g8H9i0J1k2L",
    ...
  }
}
```

---

## Krok 5: Import workflow do n8n

### 5.1 Uruchom n8n

**Opcja A: Self-hosted**
```bash
# Instalacja globalna
npm install n8n -g

# Uruchomienie
n8n start

# n8n będzie dostępny pod: http://localhost:5678
```

**Opcja B: n8n.cloud**
- Zaloguj się na https://n8n.cloud
- Stwórz nowy workspace (jeśli nie masz)

### 5.2 Import workflow

1. W n8n kliknij "+" (Add workflow)
2. Kliknij "..." (menu) > "Import from File"
3. Wybierz `k2bud-unified-agent-workflow.json`
4. Kliknij "Import"

### 5.3 Import skryptów JavaScript

Workflow wymaga dwóch plików JS. W n8n:

**Opcja A: Bezpośrednio w nodes (zalecane)**

1. Otwórz node "Context Manager"
2. Skopiuj całą zawartość pliku `context_manager.js`
3. Wklej do pola "JavaScript Code"

4. Otwórz node "Unified AI Handler"
5. Skopiuj całą zawartość pliku `unified_ai_handler.js`
6. Wklej do pola "JavaScript Code"

**Opcja B: Przez Read File (wymaga self-hosted)**

Jeśli n8n ma dostęp do plików lokalnych:
```javascript
// W node użyj:
const fs = require('fs');
const code = fs.readFileSync('/path/to/unified_ai_handler.js', 'utf8');
eval(code);
```

---

## Krok 6: Konfiguracja zmiennych środowiskowych

### 6.1 Utwórz plik `.env` (self-hosted)

W katalogu n8n utwórz plik `.env`:

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Google Drive Folder IDs (najważniejsze)
GDRIVE_FOLDER_00=1a2B3c4D5e6F7g8H9i0J
GDRIVE_FOLDER_01=2b3C4d5E6f7G8h9I0j1K
GDRIVE_FOLDER_02=3c4D5e6F7g8H9i0J1k2L
GDRIVE_FOLDER_03_01_03_01=4d5E6f7G8h9I0j1K2l3M

# n8n Configuration
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://your-domain.com
```

**Restart n8n po dodaniu .env:**
```bash
n8n stop
n8n start
```

### 6.2 Konfiguracja w n8n.cloud

1. W n8n.cloud przejdź do "Settings" > "Environment Variables"
2. Dodaj każdą zmienną osobno:
   - Name: `TELEGRAM_BOT_TOKEN`
   - Value: `123456789:ABC...`
   - Kliknij "Add"
3. Powtórz dla wszystkich zmiennych

### 6.3 Konfiguracja Credentials w n8n

**Telegram Bot:**

1. W workflow kliknij na node "Send Telegram Response"
2. W polu "Credential to connect with" kliknij "Create New"
3. Nazwa: "Telegram Bot K2BUD"
4. Access Token: wklej `TELEGRAM_BOT_TOKEN`
5. Kliknij "Create"

**Google Drive:**

1. Kliknij na node "Upload to Google Drive"
2. W polu "Credential to connect with" kliknij "Create New"
3. Wybierz authentication method: "Service Account"
4. Wklej całą zawartość pliku JSON z Service Account
5. Kliknij "Create"

---

## Krok 7: Testowanie systemu

### 7.1 Aktywuj workflow

1. W n8n otwórz workflow "K2BUD Unified Agent"
2. Kliknij przełącznik "Active" (górny prawy róg)
3. Skopiuj URL webhooka (pojawi się w node "Telegram Webhook")
   Format: `https://your-n8n.com/webhook/k2bud-agent`

### 7.2 Ustaw webhook w Telegram

Otwórz w przeglądarce:
```
https://api.telegram.org/bot<TWOJ_TOKEN>/setWebhook?url=<WEBHOOK_URL>
```

Przykład:
```
https://api.telegram.org/bot123456789:ABC.../setWebhook?url=https://your-n8n.com/webhook/k2bud-agent
```

Powinieneś zobaczyć:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

### 7.3 Test 1: Komenda /help

1. Otwórz bota w Telegram
2. Wyślij: `/help`
3. Powinieneś otrzymać wiadomość z instrukcjami

**Oczekiwana odpowiedź:**
```
🤖 K2BUD Agent - Pomoc

GŁÓWNE FUNKCJE:
📁 Organizacja dokumentów
...
```

### 7.4 Test 2: Proste pytanie (chat)

1. Wyślij: `Cześć! Jak działasz?`
2. Agent powinien odpowiedzieć (Claude AI)

**Oczekiwana odpowiedź:**
```
Cześć! Jestem agentem K2BUD...
```

### 7.5 Test 3: Klasyfikacja pliku (główna funkcja)

**Test A: Zdjęcie z budowy**

1. Wyślij zdjęcie z budowy
2. Dodaj caption: "postęp prac - ściana zachodnia"
3. Agent powinien:
   - Przeanalizować zdjęcie
   - Sklasyfikować jako dokument K2BUD
   - Zapisać w: `03_PROJEKTY/.../Zdjecia_postep_prac/`
   - Nadać nazwę: `2024-12-23_Zdjecie_Postep_Prac_Sciana_Zachodnia_v1.jpg`
   - Wysłać potwierdzenie z linkiem

**Oczekiwana odpowiedź:**
```
✅ Plik zapisany pomyślnie!

📁 Lokalizacja: 03_PROJEKTY/.../Zdjecia_postep_prac/
📄 Nazwa: 2024-12-23_Zdjecie_Postep_Prac_...

💡 Uzasadnienie:
Zdjęcie przedstawia postęp prac budowlanych...

🔗 Link: https://drive.google.com/file/d/...
```

**Test B: Faktura PDF**

1. Wyślij PDF faktury
2. Dodaj caption: "faktura materiały budowlane Leroy Merlin"
3. Agent powinien zapisać w: `03_PROJEKTY/.../Faktury_budowa/`

**Test C: Bufor tekstu (60s)**

1. Wyślij tekst: "dokument administracyjny - uchwała wspólników"
2. **Poczekaj 5 sekund**
3. Wyślij plik PDF (bez caption)
4. Agent użyje wcześniejszego tekstu jako opisu

### 7.6 Weryfikacja w Google Drive

1. Otwórz Google Drive
2. Przejdź do odpowiedniego folderu
3. Sprawdź czy plik został zapisany z poprawną nazwą

---

## Troubleshooting

### Problem 1: Bot nie odpowiada

**Diagnoza:**
```bash
# Sprawdź czy webhook jest ustawiony
https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

**Rozwiązanie:**
- Sprawdź czy workflow jest aktywny (Active = ON)
- Sprawdź czy webhook URL jest poprawny
- Sprawdź logi n8n (Executions)

### Problem 2: Błąd "x-api-key header is required"

**Przyczyna:** Brak lub nieprawidłowy klucz Anthropic API

**Rozwiązanie:**
- Sprawdź czy `ANTHROPIC_API_KEY` jest ustawiony w `.env`
- Sprawdź czy klucz jest prawidłowy (zaczyna się od `sk-ant-api03-`)
- Restart n8n po dodaniu zmiennej

### Problem 3: Plik nie zapisuje się w Google Drive

**Diagnoza:**
- Sprawdź logi wykonania w n8n
- Sprawdź czy folder ID jest prawidłowy

**Rozwiązanie:**
- Zweryfikuj mapowanie folderów w `google_drive_folder_mapping.json`
- Sprawdź uprawnienia Service Account do folderu
- Sprawdź czy Google Drive API jest włączone

### Problem 4: Klasyfikacja działa niepoprawnie

**Diagnoza:**
- Sprawdź logi AI w n8n Executions
- Sprawdź czy prompt jest poprawny

**Rozwiązanie:**
- Dodaj więcej kontekstu w opisie pliku
- Dostosuj SYSTEM_PROMPT_CLASSIFICATION w `unified_ai_handler.js`
- Zwiększ MAX_TOKENS_CLASSIFICATION

### Problem 5: Bufor tekstu nie działa

**Przyczyna:** Przekroczony timeout 60s

**Rozwiązanie:**
- Wyślij tekst i plik w krótszym czasie (< 60s)
- Lub użyj caption zamiast osobnej wiadomości

### Problem 6: Błąd "Cannot read property of undefined"

**Przyczyna:** Brak danych w context

**Rozwiązanie:**
- Wyczyść Static Data workflow
- Restart workflow (Deactivate > Activate)

---

## Monitorowanie i utrzymanie

### Sprawdzanie logów

**n8n Executions:**
1. W n8n kliknij "Executions" (lewy panel)
2. Zobacz historię wszystkich wykonań
3. Kliknij na wykonanie aby zobaczyć szczegóły

**Filtrowanie:**
- Status: Success / Error
- Date range
- Workflow name

### Statystyki użycia API

**Anthropic Console:**
- https://console.anthropic.com/
- Dashboard > Usage
- Sprawdź koszty i liczbę wywołań

**Google Drive:**
- Quota limits: 1 billion API calls/day
- Normalnie nie osiągniesz limitu

### Backup

**Eksport workflow:**
1. W n8n otwórz workflow
2. "..." > "Export Workflow"
3. Zapisz JSON regularnie (np. co tydzień)

**Backup danych:**
- Static Data jest w bazie n8n (backup automatyczny w n8n.cloud)
- Dla self-hosted: backup folder `~/.n8n/`

---

## Co dalej?

### Rozszerzenia (Faza 2 i 3)

1. **Dodaj więcej komend:**
   - `/search [keyword]` - szukaj dokumentów
   - `/summary` - podsumowanie ostatnich operacji

2. **Integracje:**
   - Slack notifications
   - Email alerts dla ważnych dokumentów
   - Google Calendar events (np. przypomnienia o deadlinach)

3. **Analityka:**
   - Dashboard z statystykami
   - Najpopularniejsze foldery
   - Typy dokumentów

4. **Zaawansowane:**
   - OCR dla skanów (Tesseract.js)
   - Automatyczne wyciąganie dat z faktur
   - Multi-user support z permissions

### Optymalizacja kosztów

- Użyj `claude-3-5-haiku` zamiast `sonnet` dla prostych klasyfikacji (4x taniej)
- Cache'uj częste odpowiedzi
- Limity rate limiting

---

## Pomoc i wsparcie

- **n8n Community:** https://community.n8n.io/
- **Anthropic Docs:** https://docs.anthropic.com/
- **Telegram Bot API:** https://core.telegram.org/bots/api

**Issues w projekcie:**
Jeśli napotkasz problemy, stwórz issue w repozytorium z:
- Opisem problemu
- Screenshotami/logami
- Krokami do reprodukcji

---

**Gratulacje! Twój K2BUD Unified Agent jest gotowy do działania!** 🎉

Pierwsza wiadomość do bota powinna być: `/help` 😊
