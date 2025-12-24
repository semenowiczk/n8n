# 🚀 Prosty Przewodnik: Połącz Swoje Workflow

> **Ważne:** Twoje oba workflow są **poprawnie zrobione**! Wystarczy je połączyć przez Router.

---

## ✅ Co Już Masz (Działa!)

### Chat Bot (Workflow 2):
- ✅ Rate limiting
- ✅ Komendy (/help, /stats, /clear)
- ✅ Chat z historią (20 wiadomości)
- ✅ Claude Vision (analiza zdjęć)
- ✅ **HTTP Request node z credentials** (poprawny pattern!)

### K2BUD File Manager (Workflow 1):
- ✅ Klasyfikacja dokumentów
- ✅ 60+ folder mappings
- ✅ Upload do Google Drive
- ✅ **HTTP Request node z credentials** (poprawny pattern!)

---

## 🎯 Strategia: Kopiuj, Nie Pisz!

**Nie musisz pisać kodu!** Wszystkie nodes już istnieją.

### Krok 1: Przygotuj Bazę
✅ **ZROBIONE!** Masz już:
- `k2bud-chat-unified-WORKING.json` z Router (4 outputy)

### Krok 2: Dodaj CHAT Flow (Output 3)

**Otwórz swój Chat Bot i SKOPIUJ te 6 nodes:**

1. **"Telegram - Thinking"** (Telegram)
   - Wyślij: "🤔 Myślę..."

2. **"Prepare Chat Request"** (Code)
   - Zbuduj `requestBody` dla Claude
   - **NIE ZMIENIAJ** - już działa!

3. **"Claude API Call"** (HTTP Request)
   - URL: `https://api.anthropic.com/v1/messages`
   - Credentials: `Anthropic account` (z0DJqZvJGQ9an9nZ)
   - Body: `={{ JSON.stringify($json.requestBody) }}`
   - **NIE ZMIENIAJ** - już działa!

4. **"Parse & Save Response"** (Code)
   - Wyciągnij odpowiedź Claude
   - Zapisz historię w Static Data
   - **NIE ZMIENIAJ** - już działa!

5. **"Split Response"** (Code)
   - Dzieli długie odpowiedzi (Telegram limit 4096)

6. **"Send Response"** (Telegram)
   - Wyślij odpowiedź do użytkownika

**Połącz:**
```
Router Output 3 → "Telegram - Thinking"
"Telegram - Thinking" → "Prepare Chat Request"
"Prepare Chat Request" → "Claude API Call"
"Claude API Call" → "Parse & Save Response"
"Parse & Save Response" → "Split Response"
"Split Response" → "Send Response"
```

**Gotowe! Chat działa!** ✅

---

### Krok 3: Dodaj PHOTO Flow (Output 2)

**Otwórz swój Chat Bot i SKOPIUJ te 8 nodes:**

1. **"Telegram - Analyzing Photo"** (Telegram)
   - Wyślij: "📸 Analizuję zdjęcie..."

2. **"Get Photo Info"** (HTTP Request)
   - URL: `https://api.telegram.org/bot{{ $credentials.telegramApi.token }}/getFile`
   - Query: `file_id={{ $json.photoFileId }}`

3. **"Download Photo"** (HTTP Request)
   - URL: `https://api.telegram.org/file/bot{{ $credentials.telegramApi.token }}/{{ $json.result.file_path }}`
   - Response format: File

4. **"Prepare Request with Image"** (Code)
   - Zbuduj `requestBody` z image (base64)
   - **NIE ZMIENIAJ** - już działa!

5. **"Claude API Call"** (HTTP Request)
   - **TEN SAM** co w CHAT flow!
   - Możesz połączyć do tego samego node

6. **"Parse Photo Response"** (Code)
   - Wyciągnij odpowiedź
   - Zapisz w historii

7. **"Split Photo Response"** (Code)
   - Dzieli długie odpowiedzi

8. **"Send Photo Response"** (Telegram)
   - Wyślij odpowiedź

**Połącz:**
```
Router Output 2 → "Telegram - Analyzing Photo"
"Telegram - Analyzing Photo" → "Get Photo Info"
"Get Photo Info" → "Download Photo"
"Download Photo" → "Prepare Request with Image"
"Prepare Request with Image" → "Claude API Call"
"Claude API Call" → "Parse Photo Response"
"Parse Photo Response" → "Split Photo Response"
"Split Photo Response" → "Send Photo Response"
```

**Gotowe! Vision działa!** ✅

---

### Krok 4: Dodaj DOCUMENT Flow (Output 1)

**Otwórz swój K2BUD File Manager i SKOPIUJ te 9 nodes:**

1. **"Extract Document Info"** (Code)
   - Wyciągnij: fileName, fileId, mimeType z `$json.document`

2. **"Get File Path"** (HTTP Request)
   - URL: `https://api.telegram.org/bot{{ $credentials.telegramApi.token }}/getFile`
   - Query: `file_id={{ $json.fileInfo.fileId }}`

3. **"Download File"** (HTTP Request)
   - URL: `https://api.telegram.org/file/bot{{ $credentials.telegramApi.token }}/{{ $json.result.file_path }}`
   - Response format: File

4. **"Prepare for Claude"** (Code)
   - Zbuduj `requestBody` z plikiem (base64)
   - Użyj długiego promptu z K2BUD o folderach
   - **NIE ZMIENIAJ** - już działa!

5. **"Claude API - Classify"** (HTTP Request)
   - **TEN SAM pattern** co CHAT/PHOTO!
   - Credentials: `Anthropic account`
   - Model: `claude-3-5-haiku-20241022` (tańszy)

6. **"Parse AI Decision"** (Code)
   - Parsuj JSON: folder, fileName, reasoning
   - **NIE ZMIENIAJ** - już działa!

7. **"Map Folder to ID"** (Code)
   - Mapuj ścieżkę → Google Drive folder ID
   - **60+ mappings** - skopiuj cały kod!

8. **"Upload to Drive"** (Google Drive)
   - Operation: Upload
   - Folder ID: `={{ $json.folderIdForDrive }}`
   - File Name: `={{ $json.fileName }}`
   - Credentials: `Google Drive account`

9. **"Success Message"** (Telegram)
   - Wyślij: "✅ Plik zapisany!\n📁 Folder: ...\n📄 Nazwa: ..."

**Połącz:**
```
Router Output 1 → "Extract Document Info"
"Extract Document Info" → "Get File Path"
"Get File Path" → "Download File"
"Download File" → "Prepare for Claude"
"Prepare for Claude" → "Claude API - Classify"
"Claude API - Classify" → "Parse AI Decision"
"Parse AI Decision" → "Map Folder to ID"
"Map Folder to ID" → "Upload to Drive"
"Upload to Drive" → "Success Message"
```

**Gotowe! Klasyfikacja działa!** ✅

---

## 🔑 Kluczowa Zasada: HTTP Request > Code API Call

### ✅ POPRAWNIE (Twoje workflow):
```
Code (Prepare requestBody)
  ↓
HTTP Request (z credentials)
  ↓
Code (Parse response)
```

### ❌ BŁĘDNIE (Mój unified_ai_handler.js):
```
Code (All-in-one: prepare + API call + parse)
```

**Zobacz:** `CORRECT_PATTERN.md` - szczegółowe wyjaśnienie dlaczego.

---

## 📋 Checklist

### Przed Rozpoczęciem:
- [ ] Otwórz swój Chat Bot w n8n
- [ ] Otwórz swój K2BUD File Manager w n8n
- [ ] Otwórz `k2bud-chat-unified-WORKING.json` (albo stwórz nowy workflow)

### Output 3 (CHAT):
- [ ] Skopiuj 6 nodes z Chat Bot
- [ ] Połącz Router Output 3 → pierwszy node
- [ ] Testuj: wyślij "Hej" do bota

### Output 2 (PHOTO):
- [ ] Skopiuj 8 nodes z Chat Bot
- [ ] Połącz Router Output 2 → pierwszy node
- [ ] Testuj: wyślij zdjęcie do bota

### Output 1 (DOCUMENT):
- [ ] Skopiuj 9 nodes z K2BUD File Manager
- [ ] Połącz Router Output 1 → pierwszy node
- [ ] Testuj: wyślij PDF do bota

### Output 0 (COMMAND):
- [ ] ✅ Już działa! (w `k2bud-chat-unified-WORKING.json`)
- [ ] Testuj: wyślij "/help" do bota

---

## 🧪 Testowanie

### Test 1: Komendy (Output 0)
```
Telegram: /help
Oczekiwany rezultat: "👋 Cześć! Jestem K2BUD Unified Agent..."
```

### Test 2: Chat (Output 3)
```
Telegram: Jak się masz?
Oczekiwany rezultat: Odpowiedź od Claude
```

### Test 3: Zdjęcie (Output 2)
```
Telegram: [zdjęcie] "Co widzisz?"
Oczekiwany rezultat: Opis zdjęcia od Claude Vision
```

### Test 4: Dokument (Output 1)
```
Telegram: [PDF faktury] "faktura materiały"
Oczekiwany rezultat: "✅ Plik zapisany! 📁 Folder: .../Faktury_budowa/ ..."
```

---

## 💡 Wskazówki

### Kopiowanie Nodes w n8n:
1. Zaznacz nodes (Shift + Click)
2. Ctrl+C (skopiuj)
3. Przejdź do drugiego workflow
4. Ctrl+V (wklej)
5. Połącz connections

### Credentials:
- **Telegram:** Użyj `Telegramaccount2` (x9zc7iKAbA62wLsD) - z Chat Bot
- **Anthropic:** Użyj `Anthropic account` (z0DJqZvJGQ9an9nZ) - ten sam dla wszystkich
- **Google Drive:** Użyj `Google Drive account` (p6DN9o3jAMH4ZJSD) - z K2BUD

### Debugging:
- Kliknij "Execute workflow" w n8n
- Zobacz każdy node - co przeszło
- Jeśli błąd - sprawdź credentials
- Sprawdź czy wszystkie connections są połączone

---

## ✅ Gotowe!

**To wszystko!** Nie musisz pisać kodu - wszystko już masz.

**Wystarczy:**
1. Skopiuj nodes
2. Połącz do Router
3. Testuj

**Całość: ~30 minut** ⏱️

**Powodzenia!** 🚀

---

## 📚 Zobacz Też:

- **`CORRECT_PATTERN.md`** - Dlaczego HTTP Request > Code API call
- **`ROUTER_SETUP.md`** - Szczegóły konfiguracji Router
- **`QUICK_FIX.md`** - Wyjaśnienie błędu składni (dlaczego mój workflow nie działa)
- **`k2bud-chat-unified-WORKING.json`** - Template z Router gotowy do importu
