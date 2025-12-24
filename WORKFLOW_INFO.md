# 📋 Workflow Info

## Twój Działający Workflow

Twój workflow **K2BUD Unified Agent** jest zapisany w **n8n** i działa poprawnie! ✅

### Charakterystyka:

**Nodes (25 total):**
1. Telegram Trigger
2. Context Manager (Code) - używa `$getWorkflowStaticData` ✅
3. Router (Switch) - 4 outputy (hasDocument, hasPhoto, isCommand, fallback)
4-13. Document Flow (10 nodes)
14-21. Chat Flow (8 nodes)
22-24. Command Flow (3 nodes)
25. Send Telegram Response (wspólny output)

**Credentials:**
- Telegram: `Telegramaccount2` (x9zc7iKAbA62wLsD)
- Anthropic: `Anthropic account` (z0DJqZvJGQ9an9nZ)
- Google Drive: `Google Drive account` (p6DN9o3jAMH4ZJSD)

**Modele Claude:**
- `claude-3-5-haiku-20241022` - klasyfikacja (szybki, tani)
- `claude-sonnet-4-5-20250929` - chat (inteligentny)

---

## Pattern - HTTP Request ✅

Twój workflow **POPRAWNIE** używa pattern:
```
Code (Prepare) → HTTP Request (credentials!) → Code (Parse)
```

**NIE** używa błędnego pattern:
```javascript
// ❌ TO BYŁOBY ZŁE (ale ty NIE robisz tego!)
const response = await $http.request({ ... });
```

---

## Co Robi Twój Workflow?

### 1. Document Flow (hasDocument=true)
```
Context Manager wykrywa dokument
  ↓
Extract File Info → Download from Telegram
  ↓
Prepare Data for AI + Merge Binary
  ↓
Unified AI Handler (tworzy requestBody z binary data)
  ↓
Claude API Call (Classification) ← HTTP Request!
  ↓
Parse Response → Map Folder Path to ID
  ↓
Merge Binary Data → Upload to Google Drive
  ↓
Prepare Success Message → Send Response
```

### 2. Chat Flow (fallback)
```
Context Manager wykrywa tekst
  ↓
Prepare for Chat (wyciąga text, historię)
  ↓
Unified AI Handler (Chat) (tworzy requestBody)
  ↓
Claude API Call (Chat) ← HTTP Request!
  ↓
Parse Response → Prepare Chat Response
  ↓
Send Response
```

### 3. Command Flow (isCommand=true)
```
Context Manager wykrywa komendę (/help, /status)
  ↓
Prepare for Command
  ↓
Unified AI Handler (Command) (zwraca gotową response)
  ↓
Prepare Command Response
  ↓
Send Response
```

---

## Najważniejsze Usprawnienia vs Moje Workflow

### ✅ Co Naprawiłeś:

1. **`$getWorkflowStaticData('global')`** - poprawna składnia (mój miał `$node...`)
2. **HTTP Request z credentials** - best practice (mój miał Code z API call)
3. **Separate Prepare/Parse nodes** - czytelniejsze (mój miał all-in-one)
4. **Fallback handling** - Router ma fallback Output 3 (mój miał tylko 3 outputs)

### 💡 Twoje Rozwiązania:

**Context Manager:**
- Używa `$getWorkflowStaticData` ✅
- Ustawia `hasDocument`, `hasPhoto`, `isCommand` dla Router
- Text buffer (60s)
- Przechowuje `lastChatId` w static data

**Router:**
- Boolean checks (`hasDocument === true`) - prosty i skuteczny
- 4 outputs (Document, Photo, Command, Chat/fallback)

**Unified AI Handler:**
- **ANALIZUJE ZAWARTOŚĆ PLIKU** - nie tylko nazwę!
- Używa `type: document` dla PDF (Claude czyta natywnie)
- Używa `type: image` dla zdjęć
- Długi system prompt (600+ linii) dla klasyfikacji

---

## Export (jeśli potrzebujesz)

Jeśli chcesz wyeksportować swój workflow z n8n:
```bash
# W n8n UI:
# Workflow → ... (menu) → Download
# Zapisz jako: k2bud-unified-agent-final.json
```

---

**Twój workflow jest świetny!** 🎉 Dobrze zrobione!
