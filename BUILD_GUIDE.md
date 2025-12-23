# 🏗️ Przewodnik Budowy: K2BUD Unified Agent

> **Cel:** Rozszerz swój działający Chat Bot o funkcje klasyfikacji dokumentów z K2BUD File Manager

## 📋 Przed Rozpoczęciem

**Potrzebujesz:**
- ✅ Działający Chat Bot (Twój workflow 2)
- ✅ Działający K2BUD File Manager (Twój workflow 1)
- ✅ n8n (local lub cloud)
- ✅ 30-45 minut

**Rezultat:**
- Jeden bot który robi WSZYSTKO:
  - 💬 Chat z historią
  - 📸 Analiza zdjęć
  - 📁 Klasyfikacja dokumentów
  - 💾 Upload do Google Drive

---

## 🎯 Strategia

**Rozszerz Chat Bot (łatwiejsze) zamiast naprawiać mój workflow (trudniejsze)**

**Dlaczego Chat Bot?**
1. Już działa (poprawna składnia)
2. Ma rate limiting
3. Ma komendy
4. Ma najnowszy model Claude
5. Łatwiej dodać niż naprawiać

---

## 📝 Krok po Kroku

### KROK 1: Backup Istniejącego Workflow

1. Otwórz Chat Bot w n8n
2. Kliknij "..." (menu) → "Duplicate"
3. Zmień nazwę na "Chat Bot - BACKUP"
4. Deaktywuj backup (Active = OFF)

**Teraz możesz bezpiecznie edytować oryginał!**

---

### KROK 2: Rozszerz "Rate Limit & Commands"

#### 2.1. Otwórz node "Rate Limit & Commands"

#### 2.2. Znajdź linię:
```javascript
const hasPhoto = telegramData.message.photo && telegramData.message.photo.length > 0;
```

#### 2.3. ZARAZ PO tej linii dodaj:

```javascript
const hasDocument = telegramData.message.document;
```

#### 2.4. Znajdź fragment:
```javascript
if (hasPhoto) {
  const photo = telegramData.message.photo[telegramData.message.photo.length - 1];
  // ...
}
```

#### 2.5. PRZED tym fragmentem (przed `if (hasPhoto)`) dodaj:

```javascript
// ═══════════════════════════════════════════════════════════════
// WYKRYWANIE DOKUMENTÓW (nowe)
// ═══════════════════════════════════════════════════════════════
if (hasDocument) {
  const document = telegramData.message.document;
  const fileName = document.file_name || 'document';
  const mimeType = document.mime_type || '';

  console.log('📎 Dokument wykryty:', fileName, mimeType);

  // Sprawdź czy to dokument do klasyfikacji
  const isClassifiable =
    mimeType.includes('pdf') ||
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('image') ||
    fileName.match(/\\.(pdf|docx?|xlsx?|jpg|jpeg|png|gif)$/i);

  if (isClassifiable) {
    console.log('✅ Dokument do klasyfikacji');
    return [{
      json: {
        isCommand: false,
        hasDocument: true,
        hasPhoto: false,
        document: document,
        chatId: chatId,
        userName: userName,
        userMessage: userMessage || '',
        conversationHistory: globalData[`chat_${chatId}`] || []
      }
    }];
  } else {
    console.log('❌ Nieobsługiwany typ dokumentu');
    return [{
      json: {
        isCommand: true,
        chatId: chatId,
        response: `📎 Otrzymałem plik: ${fileName}\\n\\nNiestety ten typ (${mimeType}) nie jest obsługiwany.\\n\\n✅ Obsługuję: PDF, DOCX, XLSX, JPG, PNG`
      }
    }];
  }
}
```

#### 2.6. Zapisz node

---

### KROK 3: Rozszerz Routing

#### 3.1. Zmień nazwę node "Has Photo?" na "Route Message"

#### 3.2. Edytuj warunki

**Istniejący warunek:**
```
{{ $json.hasPhoto }} === true
```

**Dodaj NOWY warunek (PRZED istniejącym):**
```
{{ $json.hasDocument }} === true
```

**Kolejność warunków (ważne!):**
1. `hasDocument === true` → Document Flow (nowy)
2. `hasPhoto === true` → Photo Flow (istniejący)
3. FALSE → Chat Flow (istniejący)

---

### KROK 4: Dodaj Document Classification Flow

Teraz dodasz 9 nowych nodes dla klasyfikacji dokumentów.

#### Node 1: Extract File Info

**Typ:** Code
**Pozycja:** Pod "Route Message" (output 1 - hasDocument)
**Kod:**

```javascript
const document = $json.document;

console.log('📄 Extracting file info:', document.file_name);

return [{
  json: {
    fileInfo: {
      fileName: document.file_name || 'document.pdf',
      fileId: document.file_id,
      mimeType: document.mime_type || 'application/pdf',
      fileSize: document.file_size,
      type: 'document'
    },
    caption: $json.userMessage || '',
    chatId: $json.chatId,
    userName: $json.userName
  }
}];
```

**Połącz:** "Route Message" (hasDocument TRUE) → "Extract File Info"

---

#### Node 2: Get File from Telegram

**Typ:** HTTP Request
**Pozycja:** Pod "Extract File Info"

**Ustawienia:**
- Method: `POST`
- URL: `https://api.telegram.org/bot{{ $credentials.telegramApi.token }}/getFile`
- Authentication: Predefined Credential Type → `telegramApi`
- Credentials: `Telegramaccount2`
- Send Query Parameters: YES
- Query Parameters:
  - Name: `file_id`
  - Value: `={{ $json.fileInfo.fileId }}`

**Połącz:** "Extract File Info" → "Get File from Telegram"

---

#### Node 3: Download File Binary

**Typ:** HTTP Request
**Pozycja:** Pod "Get File from Telegram"

**Ustawienia:**
- Method: `GET`
- URL: `https://api.telegram.org/file/bot{{ $credentials.telegramApi.token }}/{{ $json.result.file_path }}`
- Authentication: Predefined Credential Type → `telegramApi`
- Credentials: `Telegramaccount2`
- Options → Response → Response Format: `file`

**Połącz:** "Get File from Telegram" → "Download File Binary"

---

#### Node 4: Prepare for Claude (K2BUD Prompt)

**Typ:** Code
**Pozycja:** Pod "Download File Binary"

**Kod:** Skopiuj **CAŁY KOD** z node "Prepare File for Claude1" z K2BUD File Manager workflow.

**Gdzie znaleźć:**
1. Otwórz K2BUD File Manager workflow
2. Znajdź node "Prepare File for Claude1"
3. Skopiuj CAŁĄ zawartość pola "JavaScript Code"
4. Wklej tutaj

**UWAGA:** To jest bardzo długi kod (500+ linii) z pełnym promptem K2BUD!

**Połącz:** "Download File Binary" → "Prepare for Claude"

---

#### Node 5: Claude API - Classify

**Typ:** HTTP Request
**Pozycja:** Pod "Prepare for Claude"

**Ustawienia:**
- Method: `POST`
- URL: `https://api.anthropic.com/v1/messages`
- Authentication: Predefined Credential Type → `anthropicApi`
- Credentials: `Anthropic account`
- Send Headers: YES
- Headers:
  - `anthropic-version`: `2023-06-01`
  - `content-type`: `application/json`
- Send Body: YES
- Body Content Type: `Raw (JSON)`
- Body: `={{ JSON.stringify($json.claudeRequestBodyString) }}`

**UWAGA:** Sprawdź czy ciało to `$json.claudeRequestBodyString` czy `$json.requestBody` (zależy od tego co zwraca node "Prepare for Claude")

**Połącz:** "Prepare for Claude" → "Claude API - Classify"

---

#### Node 6: Parse AI Decision

**Typ:** Code
**Pozycja:** Pod "Claude API - Classify"

**Kod:** Skopiuj **CAŁY KOD** z node "Parse AI Decision" z K2BUD File Manager workflow.

**Połącz:** "Claude API - Classify" → "Parse AI Decision"

---

#### Node 7: Map Folder Path to ID

**Typ:** Code
**Pozycja:** Pod "Parse AI Decision"

**Kod:** Skopiuj **CAŁY KOD** z node "Map Folder Path to ID" z K2BUD File Manager workflow.

**WAŻNE:** Ten kod zawiera mapowanie 60+ folderów Google Drive!

**Połącz:** "Parse AI Decision" → "Map Folder Path to ID"

---

#### Node 8: Upload to Google Drive

**Typ:** Google Drive
**Pozycja:** Pod "Map Folder Path to ID"

**Ustawienia:**
- Resource: `File`
- Operation: `Upload`
- Input Binary Field: `data`
- File Name: `={{ $json.fileName }}`
- Drive: My Drive (lub lista)
- Folder ID: `={{ $json.folderIdForDrive }}`
- Credentials: `Google Drive account` (p6DN9o3jAMH4ZJSD)

**Połącz:** "Map Folder Path to ID" → "Upload to Google Drive"

---

#### Node 9: Send Success Message

**Typ:** Telegram
**Pozycja:** Pod "Upload to Google Drive"

**Ustawienia:**
- Resource: `Message`
- Operation: `Send Message`
- Chat ID: `={{ $('Extract File Info').item.json.chatId }}`
- Text:
```
✅ Plik zapisany pomyślnie!

📁 Folder:
{{ $('Map Folder Path to ID').item.json.folder }}

📄 Nazwa:
{{ $('Map Folder Path to ID').item.json.fileName }}

💡 Uzasadnienie:
{{ $('Map Folder Path to ID').item.json.reasoning }}

🔗 Link do pliku:
{{ $json.webViewLink }}
```
- Additional Fields → Parse Mode: `Markdown` (opcjonalnie)
- Credentials: `Telegramaccount2`

**Połącz:** "Upload to Google Drive" → "Send Success Message"

---

### KROK 5: Zaktualizuj Komendę /stats

#### 5.1. Otwórz node "Rate Limit & Commands"

#### 5.2. Znajdź fragment komendy `/stats`:

```javascript
if (userMessage === '/stats') {
  const userMessages = conversationHistory.filter(m => m.role === 'user').length;
  const assistantMessages = conversationHistory.filter(m => m.role === 'assistant').length;
  const totalChars = conversationHistory.reduce((sum, m) => sum + (m.content?.length || 0), 0);

  return [{
    json: {
      isCommand: true,
      chatId: chatId,
      response: `📊 Statystyki konwersacji:\\n\\n• Wszystkich wiadomości: ${conversationHistory.length}\\n• Twoich wiadomości: ${userMessages}\\n• Odpowiedzi Claude: ${assistantMessages}\\n• Znaków w historii: ${totalChars}\\n• Rate limit: ${userLimit.count}/10 w tej minucie`
    }
  }];
}
```

#### 5.3. Zamień na:

```javascript
if (userMessage === '/stats') {
  const userMessages = conversationHistory.filter(m => m.role === 'user').length;
  const assistantMessages = conversationHistory.filter(m => m.role === 'assistant').length;
  const totalChars = conversationHistory.reduce((sum, m) => sum + (m.content?.length || 0), 0);
  const documentsCount = globalData[`documents_${chatId}`] || 0; // NOWE

  return [{
    json: {
      isCommand: true,
      chatId: chatId,
      response: `📊 Statystyki K2BUD Unified Agent:\\n\\n💬 Konwersacja:\\n• Wszystkich wiadomości: ${conversationHistory.length}\\n• Twoich wiadomości: ${userMessages}\\n• Odpowiedzi Claude: ${assistantMessages}\\n• Znaków w historii: ${totalChars}\\n\\n📁 Dokumenty:\\n• Zarchiwizowanych: ${documentsCount}\\n\\n⏱️ Rate limit:\\n• W tej minucie: ${userLimit.count}/10`
    }
  }];
}
```

---

### KROK 6: Zaktualizuj /help

#### 6.1. W tym samym node, znajdź:

```javascript
if (userMessage === '/start' || userMessage === '/help') {
  return [{
    json: {
      isCommand: true,
      chatId: chatId,
      response: `👋 Cześć ${userName}!\\n\\nJestem Claude AI - mogę pomóc Ci z:\\n• Programowaniem\\n• Pisaniem tekstów\\n• Analizą danych i ZDJĘĆ 📸\\n• Odpowiedziami na pytania\\n• I wieloma innymi rzeczami!\\n\\n📝 Dostępne komendy:\\n/clear - wyczyść historię rozmowy\\n/stats - pokaż statystyki\\n/help - ta wiadomość\\n\\nZacznij pisać lub wyślij zdjęcie! 💬`
    }
  }];
}
```

#### 6.2. Zamień na:

```javascript
if (userMessage === '/start' || userMessage === '/help') {
  return [{
    json: {
      isCommand: true,
      chatId: chatId,
      response: `👋 Cześć ${userName}!\\n\\nJestem K2BUD Unified Agent - łączę:\\n\\n• 🤖 Chat z Claude AI (pytania, programowanie)\\n• 📸 Analiza zdjęć (Claude Vision)\\n• 📁 Klasyfikacja dokumentów (auto-upload do Drive)\\n\\n📝 Komendy:\\n/clear - wyczyść historię\\n/stats - statystyki\\n/help - ta wiadomość\\n\\n💡 Wyślij:\\n• Tekst - zadaj pytanie\\n• Zdjęcie - przeanalizuję\\n• PDF/DOCX - sklasyfikuję i zapiszę na Drive`
    }
  }];
}
```

---

### KROK 7: Dodaj Licznik Dokumentów

#### 7.1. W node "Send Success Message"

#### 7.2. Dodaj dodatkowy node "Code" PRZED "Send Success Message"

**Nazwa:** "Increment Document Counter"
**Kod:**

```javascript
const chatId = $('Extract File Info').item.json.chatId;
const globalData = $getWorkflowStaticData('global');

// Increment document counter
globalData[`documents_${chatId}`] = (globalData[`documents_${chatId}`] || 0) + 1;

console.log(`📊 Dokumentów zarchiwizowanych: ${globalData[`documents_${chatId}`]}`);

// Pass through data
return $input.all();
```

**Połącz:**
- "Upload to Google Drive" → "Increment Document Counter"
- "Increment Document Counter" → "Send Success Message"

---

### KROK 8: Testowanie

#### 8.1. Aktywuj workflow (Active = ON)

#### 8.2. Test 1: Komenda /help
```
Wyślij: /help
Oczekiwane: Wiadomość o K2BUD Unified Agent
```

#### 8.3. Test 2: Pytanie tekstowe
```
Wyślij: "Co to jest n8n?"
Oczekiwane: Odpowiedź Claude
```

#### 8.4. Test 3: Zdjęcie
```
Wyślij: [zdjęcie] + caption "co widzisz?"
Oczekiwane: Analiza zdjęcia przez Claude Vision
```

#### 8.5. Test 4: Dokument PDF (NOWA FUNKCJA!)
```
Wyślij: [PDF faktury] + caption "faktura BudPol"
Oczekiwane:
1. "Analizuję dokument..." (opcjonalnie dodaj ten node)
2. Klasyfikacja przez Claude
3. Upload do Drive
4. "✅ Plik zapisany!" z folderem i linkiem
```

#### 8.6. Test 5: /stats
```
Wyślij: /stats
Oczekiwane: Statystyki z sekcją "Dokumenty"
```

---

### KROK 9: Error Handling (Opcjonalnie)

#### 9.1. Dodaj node "On Error" dla każdego flow

**Dla Document Flow:**

Dodaj node "Telegram - Error Message":
```
❌ Wystąpił błąd podczas klasyfikacji dokumentu.

Spróbuj ponownie lub skontaktuj się z administratorem.

Błąd: {{ $json.error }}
```

Połącz wszystkie nodes Document Flow z tym error handler.

---

## ✅ Gotowe!

Masz teraz **K2BUD Unified Agent** który łączy:

- ✅ Chat z historią (z Chat Bot)
- ✅ Claude Vision (z Chat Bot)
- ✅ Klasyfikacja dokumentów (z K2BUD)
- ✅ Upload do Google Drive (z K2BUD)
- ✅ Rate limiting (z Chat Bot)
- ✅ Komendy (rozszerzone)

---

## 📊 Podsumowanie Zmian

| Co Dodano | Nodes | Czas |
|-----------|-------|------|
| Wykrywanie dokumentów | 1 (edit) | 5 min |
| Routing dokumentów | 1 (edit) | 5 min |
| Document flow | 9 (nowe) | 20 min |
| /stats update | 1 (edit) | 2 min |
| /help update | 1 (edit) | 2 min |
| Document counter | 1 (nowe) | 3 min |
| **TOTAL** | **~14 nodes** | **~37 min** |

---

## 🚀 Następne Kroki

1. **Backup workflow** - Export jako JSON
2. **Testuj systematycznie** - Każdy flow osobno
3. **Monitoruj** - Sprawdzaj logi n8n
4. **Optymalizuj** - Dostosuj prompty Claude jeśli potrzeba

---

## 💡 Wskazówki

- **Console.log()** - Dodaj `console.log()` w każdym node Code dla debugowania
- **Test małymi krokami** - Testuj każdy nowy node od razu
- **Backup często** - Export workflow po każdym kroku
- **Error handling** - Dodaj obsługę błędów dla produkcji

---

**Gratulacje! Masz teraz najlepsze z obu światów!** 🎉
