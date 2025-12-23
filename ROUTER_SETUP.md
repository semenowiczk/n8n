# 🔀 Router - Instrukcja Konfiguracji

## Obecny Status

✅ **Rate Limit & Routing** node już ustawia pole `routeTo` z wartościami:
- `COMMAND` - komendy (/help, /stats) i rate limit
- `DOCUMENT` - dokumenty PDF/DOCX do klasyfikacji
- `PHOTO` - zdjęcia do analizy (Vision)
- `CHAT` - zwykły chat tekstowy

---

## 📝 Konfiguracja Router w n8n (Krok po Kroku)

### Krok 1: Otwórz Node "Router"

Kliknij na node **"Router"** w swoim workflow.

### Krok 2: Dodaj 3 Reguły + Fallback

W sekcji **"Routing Rules"** dodaj:

#### Reguła 1: COMMAND ⚙️
```
Type: String
Value 1: {{ $json.routeTo }}
Operator: Equal
Value 2: COMMAND
```
**Co to robi:** Kieruje komendy (/help, /stats, /clear) i błędy rate limit

#### Reguła 2: DOCUMENT 📄
```
Type: String
Value 1: {{ $json.routeTo }}
Operator: Equal
Value 2: DOCUMENT
```
**Co to robi:** Kieruje PDF/DOCX do klasyfikacji i zapisu na Drive

#### Reguła 3: PHOTO 📸
```
Type: String
Value 1: {{ $json.routeTo }}
Operator: Equal
Value 2: PHOTO
```
**Co to robi:** Kieruje zdjęcia do Claude Vision

#### Fallback (Reguła 4): CHAT 💬
```
(Włącz "Fallback Output" w ustawieniach node)
```
**Co to robi:** Wszystko inne → zwykły chat tekstowy z Claude

---

## 🔌 Podłączenie Outputs

Po konfiguracji Router będzie miał **4 outputy**:

### Output 0: COMMAND → "Send Command Response"
Już podłączone! ✅

### Output 1: DOCUMENT → [DO DODANIA]
Będzie łączyć się z:
```
"Extract Document Info" (Code)
  ↓
"Get File Path" (HTTP Request)
  ↓
"Download File" (HTTP Request)
  ↓
"Prepare for Claude" (Code)
  ↓
"Claude API - Classify" (HTTP Request)
  ↓
"Parse AI Decision" (Code)
  ↓
"Map Folder to ID" (Code)
  ↓
"Upload to Drive" (Google Drive)
  ↓
"Success Message" (Telegram)
```

### Output 2: PHOTO → [DO DODANIA]
Będzie łączyć się z:
```
"Telegram - Analyzing Photo" (Telegram)
  ↓
"Get Photo Info" (HTTP Request)
  ↓
"Download Photo" (HTTP Request)
  ↓
"Prepare Request with Image" (Code)
  ↓
"Claude API - Vision" (HTTP Request)
  ↓
"Parse & Save Response" (Code)
  ↓
"Split Response" (Code)
  ↓
"Send Photo Response" (Telegram)
```

### Output 3: CHAT → [DO DODANIA]
Będzie łączyć się z:
```
"Telegram - Thinking" (Telegram)
  ↓
"Prepare Chat Request" (Code)
  ↓
"Claude API - Chat" (HTTP Request)
  ↓
"Parse & Save Chat Response" (Code)
  ↓
"Split Chat Response" (Code)
  ↓
"Send Chat Response" (Telegram)
```

---

## ✅ Weryfikacja Konfiguracji

### Test 1: Sprawdź Routing Rules
W node "Router" powinieneś zobaczyć:
```
Routing Rules:
├─ Rule 1: {{ $json.routeTo }} = COMMAND → Output 0
├─ Rule 2: {{ $json.routeTo }} = DOCUMENT → Output 1
├─ Rule 3: {{ $json.routeTo }} = PHOTO → Output 2
└─ Fallback → Output 3
```

### Test 2: Sprawdź Outputs
Node "Router" powinien mieć **4 czerwone kropki** po prawej stronie:
- 🔴 Output 0 (COMMAND)
- 🔴 Output 1 (DOCUMENT)
- 🔴 Output 2 (PHOTO)
- 🔴 Output 3 (CHAT)

---

## 🧪 Testowanie

Po skonfigurowaniu Router (nawet bez podłączonych pozostałych nodes):

### Test COMMAND:
```
Telegram: /help
→ Router Output 0 → Send Command Response ✅
```

### Test CHAT (fallback):
```
Telegram: Hej
→ Router Output 3 → (jeszcze nie podłączone)
```

### Test DOCUMENT:
```
Telegram: [PDF file]
→ Router Output 1 → (jeszcze nie podłączone)
```

### Test PHOTO:
```
Telegram: [Photo]
→ Router Output 2 → (jeszcze nie podłączone)
```

---

## 📋 Co Dalej?

Po skonfigurowaniu Router możesz:

1. **Testować COMMAND flow** (już działa!)
   - Wyślij `/help` do bota
   - Sprawdź czy dostaniesz odpowiedź

2. **Dodać DOCUMENT flow** (z BUILD_GUIDE.md)
   - 9 nodes do klasyfikacji dokumentów
   - Upload do Google Drive

3. **Dodać PHOTO flow** (z Twojego Chat Bot)
   - Skopiować nodes z workflow 2
   - Claude Vision

4. **Dodać CHAT flow** (z Twojego Chat Bot)
   - Skopiować nodes z workflow 2
   - Zwykła rozmowa z historią

---

## 🔍 Debugowanie

Jeśli Router nie działa:

### Problem: Wszystko idzie do Fallback
**Sprawdź:**
```javascript
// W "Rate Limit & Routing" upewnij się że ustawiasz routeTo:
return [{
  json: {
    routeTo: 'COMMAND',  // ← To musi być dokładnie: COMMAND, DOCUMENT, PHOTO, lub CHAT
    // ...
  }
}];
```

### Problem: Router ma tylko 1 output
**Rozwiązanie:** Dodaj więcej reguł w "Routing Rules"

### Problem: Error "Referenced node doesn't exist"
**Rozwiązanie:** Outputs 1, 2, 3 jeszcze nie są podłączone - to normalne!

---

## ✨ Gotowe!

Twój Router jest skonfigurowany z **Opcją B** (prosta routing logika jak w Chat Bot).

**Następny krok:** Dodaj nodes dla Output 1 (DOCUMENT) - zobacz `BUILD_GUIDE.md` Krok 4-12.
