# K2BUD Unified Agent - Inteligentny Organizator Dokumentów + AI Chat

> **Agent K2BUD** to zaawansowany system zarządzania dokumentami dla spółki deweloperskiej, zintegrowany z Telegram i Claude AI. Łączy automatyczną klasyfikację dokumentów z uniwersalnymi możliwościami konwersacji.

## 🎯 Główne Funkcje

### 1. **Automatyczna Organizacja Dokumentów** (Główna funkcja)
- 🤖 **Inteligentna klasyfikacja** przez Claude AI
- 📁 **Automatyczne przypisywanie** do odpowiednich folderów Google Drive (60+ folderów)
- 📝 **Konwencja nazewnictwa K2BUD:** `YYYY-MM-DD_Kategoria_Opis_v1.ext`
- ⚡ **Bufor tekstu 60s** - wyślij opis przed plikiem

### 2. **Uniwersalna Rozmowa AI**
- 💬 Zadawaj pytania o dokumenty, projekty, strukturę
- 📊 Analiza plików (zdjęcia, PDF, dokumenty)
- 🧠 Pamięć konwersacji (ostatnie 10 wiadomości)
- 🔍 Pomoc w nawigacji po systemie

### 3. **Integracja Telegram**
- 📱 Wysyłaj pliki bezpośrednio z telefonu
- 💡 Caption lub bufor tekstu jako opis
- ✅ Natychmiastowe potwierdzenie z linkiem do pliku
- 🔔 Notyfikacje o statusie operacji

## 🏗️ Architektura Systemu

```
Telegram Bot
     │
     ├─→ Context Manager (bufor tekstu, pamięć)
     │        │
     │        └─→ Router (rozgałęzienie)
     │                │
     │                ├─→ [PLIK] → Unified AI Handler
     │                │              └─→ Klasyfikacja K2BUD
     │                │                   └─→ Google Drive Upload
     │                │
     │                ├─→ [CHAT] → Unified AI Handler
     │                │              └─→ Rozmowa Claude
     │                │
     │                └─→ [KOMENDA] → Unified AI Handler
     │                                 └─→ /help, /status, /archive
     │
     └─→ Telegram Response (potwierdzenie)
```

## 📦 Zawartość Repozytorium

```
n8n/
├── k2bud-unified-agent-workflow.json      # Główny workflow n8n
├── unified_ai_handler.js                   # Zintegrowany handler AI (klasyfikacja + chat)
├── context_manager.js                      # Zarządzanie pamięcią i bufonem
├── google_drive_folder_mapping.json        # Mapowanie 60+ folderów K2BUD
├── SETUP_INSTRUCTIONS.md                   # ⭐ Szczegółowa instrukcja krok po kroku
├── README_K2BUD.md                        # Ten plik
├── .env.example                           # Przykład konfiguracji
└── test-webhook-k2bud.js                  # Skrypt testowy
```

## 🚀 Szybki Start

### 1. Wymagania

- n8n (self-hosted lub n8n.cloud)
- Telegram Bot Token
- Anthropic API Key
- Google Drive z Service Account

### 2. Instalacja (5 kroków)

```bash
# 1. Sklonuj/pobierz repozytorium
git clone https://github.com/twoje-repo/n8n.git
cd n8n

# 2. Stwórz .env z kluczami API
cp .env.example .env
nano .env  # Uzupełnij klucze

# 3. Zaimportuj workflow do n8n
# (przez UI: Import from File → k2bud-unified-agent-workflow.json)

# 4. Skonfiguruj credentials w n8n
# - Telegram Bot
# - Google Drive Service Account

# 5. Aktywuj workflow i ustaw webhook
```

**Pełna instrukcja:** Zobacz [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)

## 🎓 Przykłady Użycia

### Przykład 1: Zdjęcie z budowy (najczęstsze)

**Krok 1:** Wyślij zdjęcie do bota
**Krok 2:** Dodaj caption: `"postęp prac - ściana wschodnia"`

**Wynik:**
```
✅ Plik zapisany pomyślnie!

📁 Lokalizacja: 03_PROJEKTY/Projekt_01_Agatowa_Sieroslaw/03_Realizacja/Zdjecia_postep_prac/
📄 Nazwa: 2024-12-23_Zdjecie_Postep_Prac_Sciana_Wschodnia_v1.jpg

💡 Uzasadnienie:
Zdjęcie przedstawia postęp prac budowlanych na ścianie wschodniej...

🔗 Link: https://drive.google.com/file/d/abc123...
```

### Przykład 2: Faktura

**Krok 1:** Wyślij PDF faktury
**Krok 2:** Caption: `"faktura materiały Leroy Merlin 15.12.2024"`

**Wynik:** Zapisane w `03_PROJEKTY/.../Faktury_budowa/2024-12-15_Faktura_Materialy_Leroy_Merlin_v1.pdf`

### Przykład 3: Bufor tekstu (60s)

**Krok 1:** Wyślij tekst: `"umowa z elektrykiem Jan Kowalski"`
**Krok 2:** W ciągu 60s wyślij plik PDF (bez caption)
**Wynik:** Agent użyje wcześniejszego tekstu jako opisu

### Przykład 4: Rozmowa

**Ty:** `Gdzie zapisują się faktury budowlane?`

**Agent:**
```
Faktury budowlane są zapisywane w folderze:

03_PROJEKTY/Projekt_01_Agatowa_Sieroslaw/03_Realizacja/Faktury_budowa/

To jeden z najczęściej używanych folderów w systemie K2BUD.
Gdy wyślesz fakturę z opisem zawierającym "faktura" i kontekst budowy,
automatycznie trafi do tego właśnie folderu.
```

### Przykład 5: Komenda /help

**Ty:** `/help`

**Agent:** _(Wyświetla pełną pomoc z dostępnymi funkcjami)_

## 📂 Struktura Folderów K2BUD

### Główne katalogi (top-level)

```
00_DO_SORTOWANIA        # Dokumenty nieokreślone
01_ADMINISTRACJA        # Dokumenty spółki
02_KSIĘGOWOŚĆ           # Finanse i księgowość
03_PROJEKTY             # ⭐ Projekty deweloperskie (główny)
04_PRAWNE               # Dokumenty prawne
05_MARKETING            # Materiały promocyjne
06_SZABLONY             # Wzory dokumentów
07_ARCHIWUM             # Stare dokumenty
08_IT_INFRASTRUKTURA    # Dokumentacja IT
Archiwum_Telegram       # Uniwersalne archiwum (pliki spoza K2BUD)
```

### Projekt 01 - Agatowa Sieroslawice (szczegóły)

```
03_PROJEKTY/Projekt_01_Agatowa_Sieroslaw/
├── 00_Dzialka/
│   └── (akty, geodezja, mapy)
├── 01_Projekty_budowlane/
│   └── (projekty architektoniczne)
├── 02_Pozwolenia/
│   └── (pozwolenia budowlane)
├── 03_Realizacja/              ⭐ NAJCZĘŚCIEJ UŻYWANY
│   ├── Zdjecia_postep_prac/    ← 80% plików trafia tutaj
│   ├── Faktury_budowa/
│   ├── Umowy_wykonawcy/
│   └── Protokoly_odbioru/
├── 04_Odbiory/
└── 05_Gwarancje/
```

## 🔧 Konfiguracja

### Zmienne Środowiskowe (.env)

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...

# Google Drive Folder IDs (przykłady najważniejszych)
GDRIVE_FOLDER_00=1a2B3c4D...                    # 00_DO_SORTOWANIA
GDRIVE_FOLDER_03_01_03_01=4d5E6f...             # Zdjecia_postep_prac
GDRIVE_FOLDER_03_01_03_02=5e6F7g...             # Faktury_budowa
```

### Modele Claude

```javascript
// unified_ai_handler.js
const MODEL_CLASSIFICATION = 'claude-3-5-haiku-20241022';    // Klasyfikacja (szybki, tani)
const MODEL_CHAT = 'claude-3-5-sonnet-20241022';             // Chat (lepszy, droższy)
```

**Szacowane koszty:**
- Klasyfikacja pliku: ~$0.001-0.003
- Rozmowa (avg): ~$0.005-0.01
- **Miesięcznie (100 plików + 200 wiadomości): ~$2-5 USD**

## 🧪 Testowanie

### Test automatyczny

```bash
# Uruchom skrypt testowy
node test-webhook-k2bud.js
```

### Test manualny

1. **Test /help:** Wyślij `/help` do bota
2. **Test chat:** Zapytaj `Jak działasz?`
3. **Test klasyfikacji:** Wyślij zdjęcie z opisem
4. **Test bufora:** Tekst → poczekaj 5s → wyślij plik

## 🎨 Konwencja Nazewnictwa

### Format

```
YYYY-MM-DD_KategoriaDokumentu_KrotkaOpisowaNazwa_v1.rozszerzenie
```

### Przykłady

```
✅ 2024-12-23_Zdjecie_Postep_Prac_Sciana_Zachodnia_v1.jpg
✅ 2024-12-15_Faktura_Materialy_Leroy_Merlin_v1.pdf
✅ 2024-11-20_Umowa_Elektryk_Jan_Kowalski_v1.docx
✅ 2024-10-05_Pozwolenie_Budowlane_Dom_Jednorodzinny_v1.pdf

❌ IMG_20241223_143022.jpg (nieprawidłowe)
❌ faktura-leroy.pdf (nieprawidłowe)
```

### Kategorie

- `Zdjecie` - zdjęcia (z budowy, marketingowe)
- `Faktura` - faktury
- `Umowa` - umowy
- `Pozwolenie` - pozwolenia i zgłoszenia
- `Protokol` - protokoły odbioru
- `Projekt` - projekty architektoniczne
- `Akt` - akty notarialne
- `Uchwala` - uchwały wspólników

## 🛠️ Komendy Bota

| Komenda | Opis | Przykład |
|---------|------|----------|
| `/help` | Wyświetla pełną pomoc | `/help` |
| `/status` | Status systemu i ostatnie operacje | `/status` |
| `/archive` | Wymusza archiwizację pliku | `/archive` (w przygotowaniu) |

## 📊 Monitorowanie

### n8n Executions

1. Otwórz n8n
2. "Executions" (lewy panel)
3. Zobacz historię wszystkich operacji
4. Filtruj: Success / Error / Date

### Anthropic Console

- https://console.anthropic.com/
- Dashboard > Usage
- Sprawdź koszty i wywołania API

### Google Drive

- Sprawdzaj czy pliki trafiają do właściwych folderów
- Verify naming convention

## 🔒 Bezpieczeństwo

### Best Practices

✅ **DO:**
- Przechowuj klucze API w `.env` (nigdy w kodzie)
- Używaj Service Account dla Google Drive (nie personal account)
- Regularnie backup workflow (Export Workflow)
- Monitoruj koszty API (Anthropic Console)

❌ **DON'T:**
- Nie commituj `.env` do git (jest w `.gitignore`)
- Nie udostępniaj Telegram Bot Token publicznie
- Nie używaj personal Google Account w production

### Whitelist Chat IDs (opcjonalnie)

W `context_manager.js` dodaj:

```javascript
const ALLOWED_CHAT_IDS = [123456789, 987654321]; // Tylko te chaty

if (!ALLOWED_CHAT_IDS.includes(chatId)) {
  return { error: 'Unauthorized' };
}
```

## 📈 Rozszerzenia (Roadmap)

### Faza 2: Ulepszenia

- [ ] Komenda `/search [keyword]` - szukaj dokumentów w Drive
- [ ] Komenda `/summary` - podsumowanie ostatnich operacji
- [ ] Auto-detect duplikatów (hash checking)
- [ ] Notifications email dla ważnych dokumentów

### Faza 3: Zaawansowane

- [ ] OCR dla skanów (Tesseract.js)
- [ ] Automatyczne wyciąganie dat/kwot z faktur
- [ ] Multi-user support z permissions
- [ ] Dashboard analityczny (Grafana)
- [ ] Integracja Slack/Discord

## 🐛 Troubleshooting

### Bot nie odpowiada

```bash
# Sprawdź webhook
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Sprawdź czy workflow jest Active
# Sprawdź logi n8n Executions
```

### Błąd klasyfikacji

- Dodaj więcej kontekstu w opisie pliku
- Sprawdź czy ANTHROPIC_API_KEY jest poprawny
- Zobacz logi w n8n Executions

### Plik nie zapisuje się w Drive

- Zweryfikuj Folder ID w `google_drive_folder_mapping.json`
- Sprawdź uprawnienia Service Account
- Sprawdź czy Google Drive API jest włączone

**Więcej:** Zobacz [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) sekcja "Troubleshooting"

## 📚 Dokumentacja

- **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** - Szczegółowa instrukcja instalacji (ZACZNIJ TUTAJ)
- **[unified_ai_handler.js](./unified_ai_handler.js)** - Kod AI Handler z komentarzami
- **[context_manager.js](./context_manager.js)** - Kod Context Manager
- **[google_drive_folder_mapping.json](./google_drive_folder_mapping.json)** - Mapowanie folderów

## 🤝 Wsparcie

### Community

- **n8n Community:** https://community.n8n.io/
- **Anthropic Docs:** https://docs.anthropic.com/
- **Telegram Bot API:** https://core.telegram.org/bots/api

### Issues

Jeśli napotkasz problemy:
1. Sprawdź [Troubleshooting](#troubleshooting)
2. Przeczytaj [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
3. Stwórz issue z szczegółami problemu

## 📄 Licencja

MIT License - możesz swobodnie używać i modyfikować.

## ✨ Autorzy

- Stworzono przez **Claude AI** (Anthropic)
- Dla spółki **K2BUD**
- Zintegrowane z **n8n**, **Telegram**, **Google Drive**

---

**Pierwszy krok:** Przeczytaj [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) 📖

**Pierwsza komenda:** Wyślij `/help` do swojego bota 🤖

**Happy organizing!** 🎉
