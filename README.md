# 🤖 K2BUD Unified Agent - n8n Workflow

> **Inteligentny agent do zarządzania dokumentami spółki deweloperskiej K2BUD**
> Automatyczna klasyfikacja, archiwizacja i chat AI w jednym workflow

---

## 📂 Struktura Repo

```
n8n/
├── k2bud-final-working.json              # ✅ DZIAŁAJĄCY WORKFLOW (importuj do n8n)
├── google_drive_folder_mapping_real.json # Prawdziwe ID folderów Google Drive
│
├── README.md                              # Ten plik
├── README_K2BUD.md                        # Szczegółowa dokumentacja K2BUD
│
├── CORRECT_PATTERN.md                     # Dlaczego HTTP Request > Code API call
├── BUILD_GUIDE_SIMPLE.md                  # Prosty przewodnik budowy (30 min)
├── QUICK_FIX.md                           # Wyjaśnienie błędów składni n8n
│
├── .env.example                           # Szablon zmiennych środowiskowych
└── .gitignore                             # Wykluczenia git
```

---

## 🎯 O Projekcie

**K2BUD Unified Agent** to workflow n8n który łączy:
- 📁 **Automatyczną klasyfikację dokumentów** (faktury, zdjęcia budowy, umowy)
- 💬 **Inteligentnego asystenta AI** (Claude Sonnet 4.5)
- 💾 **Upload do Google Drive** z 60+ strukturą folderów
- 📱 **Telegram Bot** jako interfejs użytkownika

### Przykłady Użycia

**Zdjęcie z budowy:**
```
Użytkownik: [zdjęcie] "ściany dom A"
Bot: ✅ Plik zapisany!
     📁 03_PROJEKTY/.../Zdjecia_postep_prac/
     📄 20241224_FOTO_SCIANY_Dom_A_001.jpg
```

**Faktura:**
```
Użytkownik: [PDF] "materiały budowlane"
Bot: ✅ Faktura zapisana!
     📁 03_PROJEKTY/.../Faktury_budowa/
     📄 20241215_FZ_BudPol_Fundamenty_15000PLN.pdf
```

**Chat:**
```
Użytkownik: "Gdzie zapisują się faktury?"
Bot: Faktury budowlane trafiają do folderu
     03_PROJEKTY/Projekt_01_Agatowa_Sieroslaw/03_Realizacja/Faktury_budowa
```

---

## ✨ Funkcje

### 📁 Klasyfikacja Dokumentów
- **Automatyczna klasyfikacja** - Claude AI analizuje zawartość pliku (nie nazwę!)
- **60+ folderów** - pełna struktura spółki K2BUD
- **Konwencja nazewnictwa** - `RRRRMMDD_TYP_SZCZEGÓŁY.ext`
- **Typy dokumentów:** PDF, JPEG, PNG, DOCX, XLSX

### 💬 Chat AI
- **Model:** Claude Sonnet 4.5 (najnowszy!)
- **Historia:** 10 ostatnich wiadomości
- **Context-aware:** wie o strukturze K2BUD

### 🔧 Zaawansowane
- **Text Buffer (60s):** wyślij opis przed plikiem
- **Komendy:** `/help`, `/status`
- **Error handling:** automatyczne

---

## 🚀 Quick Start (5 minut)

### 1. Wymagania

- ✅ n8n (self-hosted lub cloud)
- ✅ Telegram Bot Token (BotFather)
- ✅ Claude API Key (Anthropic)
- ✅ Google Drive (OAuth2)

### 2. Import

```bash
# Otwórz n8n → Workflows → Import from File
# Wybierz: k2bud-final-working.json
```

### 3. Credentials

Skonfiguruj 3 credentials w n8n:
- **Telegram:** Bot Token
- **Anthropic:** API Key
- **Google Drive:** OAuth2

### 4. Folder IDs

```bash
# Otwórz node "Map Folder Path to ID"
# Zamień FOLDER_ID_PLACEHOLDER_XX na prawdziwe ID
# (możesz skopiować z google_drive_folder_mapping_real.json)
```

### 5. Aktywuj

```bash
# n8n → Workflow → Active: ON
```

### 6. Test

```
Telegram → twój bot → /help
```

---

## 📚 Dokumentacja

### Dla Użytkowników

- **`README_K2BUD.md`** - Pełna dokumentacja K2BUD (struktura, konwencja, przykłady)

### Dla Developerów

- **`CORRECT_PATTERN.md`** - ⭐ **Przeczytaj najpierw!** Wyjaśnia best practices n8n
  - ✅ HTTP Request z credentials (CORRECT)
  - ❌ Code z API call (WRONG - anti-pattern)

- **`BUILD_GUIDE_SIMPLE.md`** - Przewodnik budowy workflow (~30 min)
  - Pattern: Prepare → HTTP Request → Parse
  - Copy-paste ready

- **`QUICK_FIX.md`** - Troubleshooting:
  - `$node.getWorkflowStaticData` vs `$getWorkflowStaticData`
  - Błędy credentials
  - Debugging n8n

---

## 🛠️ Technologie

### Core
- **n8n** - Workflow automation
- **Claude AI (Anthropic)**:
  - `claude-3-5-haiku-20241022` - klasyfikacja (szybki, tani)
  - `claude-sonnet-4-5-20250929` - chat (inteligentny)
- **Telegram Bot API** - UI
- **Google Drive API** - Storage

### Pattern: HTTP Request > Code ✅

```javascript
// ✅ POPRAWNIE - TEN PATTERN!

// 1. Code: Prepare
return { json: { requestBody: {...} } };

// 2. HTTP Request: Call API
// Credentials: Anthropic API ← z vault n8n!
// Body: {{ JSON.stringify($json.requestBody) }}

// 3. Code: Parse
const response = $input.first().json;
return { json: { result: response.content[0].text } };
```

**Dlaczego?**
- ✅ Credentials w vault (bezpieczne)
- ✅ Reusable
- ✅ Error handling (auto retry)
- ✅ Debugging (widoczne w UI)
- ✅ Best practice n8n

---

## 📊 Architektura

```
Telegram Trigger
    ↓
Context Manager (Code)
  • Wykrywa: file/text/command
  • Buffer (60s)
  • Historia
    ↓
Router (Switch)
  • hasDocument → Output 0
  • hasPhoto    → Output 1
  • isCommand   → Output 2
  • fallback    → Output 3
    ↓
┌───────┬──────────┬──────────┬─────────┐
│  DOC  │  PHOTO   │ COMMAND  │  CHAT   │
│ FLOW  │  FLOW    │  FLOW    │  FLOW   │
└───┬───┴─────┬────┴─────┬────┴────┬────┘
    │         │          │         │
    └─────────┴──────────┴─────────┘
                 ↓
        Send Telegram Response
```

### Document Flow (Output 0)
```
Extract File Info → Download → Prepare for AI →
Merge Binary → Unified AI Handler →
Claude API Call (HTTP Request!) →
Parse Response → Map Folder → Merge Binary →
Upload to Drive → Success Message
```

### Chat Flow (Output 3)
```
Prepare for Chat → Unified AI Handler (Chat) →
Claude API Call (HTTP Request!) →
Parse Response → Prepare Response → Send
```

---

## 💡 Best Practices

### n8n Development

1. ✅ **HTTP Request + credentials** zamiast Code z API call
2. ✅ **Separation:** Prepare → Call → Parse (nie all-in-one)
3. ✅ **Static Data:** `$getWorkflowStaticData('global')` NIE `$node...`
4. ✅ **Error handling:** Zawsze sprawdzaj czy dane istnieją
5. ✅ **Debugging:** `console.log` w Code (widoczne w logs)

### Claude API

1. **Model selection:**
   - Haiku → klasyfikacja, proste (tani)
   - Sonnet → chat, złożone (droższy)

2. **Vision:**
   - PDF: `type: document` (Claude czyta PDF natywnie!)
   - Obrazy: `type: image` + base64

---

## 📊 Koszty

**Claude API (przykład):**
- 500 dokumentów/miesiąc: ~$0.50
- 200 rozmów/miesiąc: ~$2.00
- **Razem:** ~$2-3 / miesiąc

**Google Drive:**
- Storage: 15 GB za darmo
- API: Unlimited (w rozsądnych limitach)

---

## 🔐 Bezpieczeństwo

- ✅ Credentials w n8n vault (nie w kodzie!)
- ✅ OAuth2 dla Google Drive
- ✅ Rate limiting
- ✅ Input validation
- ✅ Folder IDs hardcoded

**NIE commituj:**
- `.env` z kluczami
- `credentials.json`
- Service account keys

---

## 📝 Changelog

### v1.0.0 (2024-12-24)
- ✅ Initial release
- ✅ Document classification (PDF, images, DOCX)
- ✅ Chat AI (Claude Sonnet 4.5)
- ✅ 60+ folder structure
- ✅ Text buffer (60s)
- ✅ Telegram interface

---

## 🙏 Credits

- **Anthropic** - Claude AI
- **n8n** - Workflow platform
- **Google** - Drive storage
- **Telegram** - Bot API

---

**Made with ❤️ for K2BUD** 🏗️
