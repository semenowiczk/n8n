# n8n Workflows - Claude AI Integration

> Repozytorium zawiera zaawansowane workflow n8n do integracji z Claude AI (Anthropic), w tym kompletny system zarządzania dokumentami dla spółki K2BUD.

## 📁 Projekty w tym Repozytorium

### 🌟 **K2BUD Unified Agent** (Główny Projekt)

**Inteligentny organizator dokumentów + AI Chat dla spółki deweloperskiej**

- 🤖 Automatyczna klasyfikacja dokumentów przez Claude AI
- 📁 Archiwizacja w Google Drive (60+ folderów)
- 💬 Uniwersalna rozmowa z AI
- 📱 Integracja z Telegram Bot
- 🧠 Pamięć konwersacji i bufor tekstu (60s)

**📖 [Zobacz pełną dokumentację → README_K2BUD.md](./README_K2BUD.md)**

**🚀 [Instrukcja instalacji → SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)**

**Pliki:**
- `k2bud-unified-agent-workflow.json` - Główny workflow
- `unified_ai_handler.js` - Handler AI (klasyfikacja + chat)
- `context_manager.js` - Zarządzanie pamięcią
- `google_drive_folder_mapping.json` - Mapowanie folderów
- `test-webhook-k2bud.js` - Testy

---

### 💬 **Claude API Chat Workflows** (Przykłady)

Proste workflow do rozmowy z Claude API przez n8n.

**Workflow 1: Basic Chat**
- Pojedyncze zapytania do Claude
- Manual trigger
- Prosty request/response

**Workflow 2: Conversation with History**
- Wieloturowe rozmowy
- Webhook trigger
- Pamięć konwersacji (ostatnie 10 wiadomości)

**Pliki:**
- `claude-chat-workflow.json` - Prosty workflow
- `claude-chat-conversation-workflow.json` - Z historią konwersacji
- `test-webhook.js` / `test-webhook.py` - Skrypty testowe

---

## 🚀 Szybki Start

### Dla K2BUD Unified Agent

```bash
# 1. Zobacz szczegółową dokumentację
cat README_K2BUD.md

# 2. Przeczytaj instrukcję instalacji
cat SETUP_INSTRUCTIONS.md

# 3. Skopiuj i uzupełnij konfigurację
cp .env.example .env
nano .env

# 4. Zaimportuj workflow do n8n
# (przez UI: Import from File → k2bud-unified-agent-workflow.json)

# 5. Testuj system
node test-webhook-k2bud.js
```

### Dla Claude Chat (prosty)

```bash
# 1. Ustaw klucz API
export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# 2. Zaimportuj workflow do n8n
# (claude-chat-conversation-workflow.json)

# 3. Testuj
node test-webhook.js
```

---

## 📚 Dokumentacja

### K2BUD Unified Agent

| Dokument | Opis |
|----------|------|
| [README_K2BUD.md](./README_K2BUD.md) | Główna dokumentacja projektu K2BUD |
| [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) | Szczegółowa instrukcja instalacji (krok po kroku) |
| [unified_ai_handler.js](./unified_ai_handler.js) | Kod handlera AI z komentarzami |
| [context_manager.js](./context_manager.js) | Kod context managera |

### Claude Chat Examples

Podstawowe przykłady użycia Claude API w n8n (zobacz stary README dla szczegółów).

---

## 🔑 Wymagane Klucze API

### Dla K2BUD Unified Agent

1. **Telegram Bot Token**
   - Uzyskaj: @BotFather w Telegram
   - Format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

2. **Anthropic API Key**
   - Uzyskaj: https://console.anthropic.com/
   - Format: `sk-ant-api03-...`

3. **Google Drive Service Account**
   - Uzyskaj: https://console.cloud.google.com/
   - Format: JSON file

### Dla Claude Chat (prosty)

1. **Anthropic API Key** (jak wyżej)

---

## 🏗️ Architektura

### K2BUD Unified Agent

```
┌─────────────────┐
│  Telegram Bot   │
│   (Trigger)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Context Manager │ ← Bufor tekstu (60s)
│                 │ ← Historia konwersacji
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Router      │
│ (Switch Logic)  │
└─┬───┬───┬───────┘
  │   │   │
  │   │   └─────────────┐
  │   │                 │
  ▼   ▼                 ▼
┌───┐ ┌───┐       ┌──────┐
│FILE│ │CHAT│      │COMMAND│
└─┬─┘ └─┬─┘       └──┬───┘
  │     │             │
  ▼     ▼             ▼
┌──────────────────────────┐
│  Unified AI Handler      │
│  (Claude API)            │
│  - Klasyfikacja          │
│  - Rozmowa               │
│  - Komendy               │
└──────────┬───────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐  ┌─────────┐
│ Google  │  │Telegram │
│  Drive  │  │Response │
└─────────┘  └─────────┘
```

### Claude Chat (prosty)

```
Webhook → HTTP Request (Claude API) → Response
```

---

## 💰 Szacowane Koszty

### K2BUD Unified Agent

| Operacja | Model | Koszt |
|----------|-------|-------|
| Klasyfikacja pliku | claude-3-5-haiku | ~$0.001-0.003 |
| Rozmowa (avg) | claude-3-5-sonnet | ~$0.005-0.01 |
| **Miesięcznie** (100 plików + 200 wiadomości) | Mix | **~$2-5 USD** |

### Claude Chat

| Operacja | Koszt |
|----------|-------|
| Pojedyncza wiadomość | ~$0.005-0.01 |
| Miesięcznie (200 wiadomości) | ~$1-2 USD |

*Ceny na grudzień 2024. Sprawdź aktualne: https://www.anthropic.com/pricing*

---

## 🛠️ Technologie

- **n8n** - Workflow automation platform
- **Claude AI** (Anthropic) - Large Language Model
  - `claude-3-5-haiku-20241022` - Klasyfikacja
  - `claude-3-5-sonnet-20241022` - Chat
- **Telegram Bot API** - Messaging interface
- **Google Drive API** - File storage
- **Node.js** - Runtime environment

---

## 📦 Struktura Repozytorium

```
n8n/
├── README.md                                  # Ten plik
├── README_K2BUD.md                           # Dokumentacja K2BUD
├── SETUP_INSTRUCTIONS.md                     # Instrukcja instalacji K2BUD
│
├── k2bud-unified-agent-workflow.json         # ⭐ Główny workflow K2BUD
├── unified_ai_handler.js                     # Handler AI (klasyfikacja + chat)
├── context_manager.js                        # Context manager
├── google_drive_folder_mapping.json          # Mapowanie folderów (60+)
├── test-webhook-k2bud.js                     # Testy K2BUD
│
├── claude-chat-workflow.json                 # Prosty chat workflow
├── claude-chat-conversation-workflow.json    # Chat z historią
├── test-webhook.js                           # Test chat (Node.js)
├── test-webhook.py                           # Test chat (Python)
│
├── .env.example                              # Przykład konfiguracji
└── .gitignore                                # Git ignore rules
```

---

## 🎯 Główne Funkcje

### K2BUD Unified Agent

✅ **Automatyczna organizacja dokumentów**
- Inteligentna klasyfikacja przez Claude AI
- 60+ folderów w Google Drive
- Konwencja nazewnictwa: `YYYY-MM-DD_Kategoria_Opis_v1.ext`

✅ **Uniwersalna rozmowa**
- Pytania o dokumenty, strukturę, projekty
- Analiza plików (zdjęcia, PDF, dokumenty)
- Pamięć ostatnich 10 wiadomości

✅ **Integracja Telegram**
- Wysyłaj pliki z telefonu
- Caption lub bufor tekstu (60s) jako opis
- Natychmiastowe potwierdzenie z linkiem

✅ **Komendy pomocnicze**
- `/help` - Pomoc
- `/status` - Status systemu
- `/archive` - Wymuszona archiwizacja

### Claude Chat (prosty)

✅ Podstawowa rozmowa z Claude API
✅ Historia konwersacji (10 wiadomości)
✅ Webhook trigger
✅ JSON responses

---

## 🧪 Testowanie

### K2BUD

```bash
# Automatyczne testy
node test-webhook-k2bud.js

# Testy manualne (Telegram)
1. /help
2. "Cześć! Jak działasz?"
3. [wyślij zdjęcie] + caption: "postęp prac"
```

### Claude Chat

```bash
# Node.js
node test-webhook.js

# Python
python test-webhook.py
```

---

## 🔒 Bezpieczeństwo

### Best Practices

✅ **DO:**
- Używaj `.env` dla kluczy API
- Service Account dla Google Drive
- Regularny backup workflow
- Monitoruj koszty API

❌ **DON'T:**
- Nie commituj `.env` do git
- Nie udostępniaj Bot Token publicznie
- Nie używaj personal account w production

### Whitelist (opcjonalnie)

W `context_manager.js`:

```javascript
const ALLOWED_CHAT_IDS = [123456789, 987654321];
if (!ALLOWED_CHAT_IDS.includes(chatId)) {
  return { error: 'Unauthorized' };
}
```

---

## 🐛 Troubleshooting

### K2BUD

**Bot nie odpowiada:**
```bash
# Sprawdź webhook
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

**Błąd klasyfikacji:**
- Sprawdź `ANTHROPIC_API_KEY` w `.env`
- Zobacz logi w n8n Executions
- Dodaj więcej kontekstu w opisie pliku

**Plik nie zapisuje się:**
- Zweryfikuj Folder ID w mapping
- Sprawdź uprawnienia Service Account
- Sprawdź Google Drive API

### Claude Chat

**API Error:**
- Sprawdź czy klucz jest poprawny
- Sprawdź czy masz credits w Anthropic
- Zobacz n8n error logs

---

## 📖 Więcej Informacji

### K2BUD Unified Agent

- **Pełna dokumentacja:** [README_K2BUD.md](./README_K2BUD.md)
- **Setup guide:** [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
- **Plan implementacji:** Zobacz plan w komentarzach workflow

### External Resources

- **n8n Docs:** https://docs.n8n.io/
- **Claude API:** https://docs.anthropic.com/
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **Google Drive API:** https://developers.google.com/drive

---

## 🤝 Wsparcie

### Community

- n8n Community: https://community.n8n.io/
- Anthropic Discord: https://discord.gg/anthropic

### Issues

Jeśli napotkasz problemy:
1. Sprawdź [Troubleshooting](#troubleshooting)
2. Zobacz [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
3. Stwórz issue w repozytorium

---

## 📄 Licencja

MIT License - możesz swobodnie używać i modyfikować.

---

## ✨ Co Dalej?

### 1. Dla K2BUD Unified Agent

**Zacznij tutaj:**
```bash
# 1. Przeczytaj dokumentację
cat README_K2BUD.md

# 2. Postępuj zgodnie z instrukcją
cat SETUP_INSTRUCTIONS.md

# 3. Zaimportuj workflow
# (w n8n UI)

# 4. Testuj
node test-webhook-k2bud.js
```

### 2. Dla Claude Chat (prosty)

**Szybki test:**
```bash
# 1. Ustaw klucz API
export ANTHROPIC_API_KEY=sk-ant-...

# 2. Zaimportuj workflow
# (claude-chat-conversation-workflow.json)

# 3. Testuj
node test-webhook.js
```

---

**Wybierz swój projekt i zacznij! 🚀**

Dla spółki K2BUD → Zobacz [README_K2BUD.md](./README_K2BUD.md)

Dla prostego chat → Użyj `claude-chat-conversation-workflow.json`
