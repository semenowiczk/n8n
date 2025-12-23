# 🔧 Szybka Poprawka Błędu: "Cannot assign to read only property"

## ❌ Błąd Który Dostałeś

```
Context Manager Error: Cannot assign to read only property 'name' of object
'Error: Referenced node doesn't exist'
```

## 🐛 Przyczyna

W moim `context_manager.js` użyłem **błędnej składni** dla n8n Static Data:

```javascript
// ❌ BŁĘDNE
const staticData = $node.getWorkflowStaticData('global');
```

**Poprawna składnia w n8n to:**

```javascript
// ✅ POPRAWNE
const globalData = $getWorkflowStaticData('global');
```

## ✅ Rozwiązanie

### Opcja 1: Użyj Twojego Chat Bot (Najprostsze!)

**Twój drugi workflow (Chat Bot) już działa poprawnie!**

Nie musisz nic zmieniać - po prostu używaj go. Ma:
- ✅ Rate limiting
- ✅ Komendy (/help, /stats, /clear)
- ✅ Chat z historią
- ✅ Claude Vision (analiza zdjęć)
- ✅ Poprawną składnię Static Data

**Jedyne co brakuje to klasyfikacja dokumentów i upload do Drive.**

---

### Opcja 2: Dodaj Klasyfikację do Chat Bot (Zalecane!)

Rozszerz swój działający Chat Bot o funkcje z K2BUD File Manager.

**Kroki:**

#### 1. Otwórz swój Chat Bot w n8n

#### 2. Edytuj node "Rate Limit & Commands"

Dodaj wykrywanie dokumentów (skopiuj ten kod na początku funkcji):

```javascript
// DODAJ to na początku, zaraz po:
// const hasPhoto = telegramData.message.photo && telegramData.message.photo.length > 0;

const hasDocument = telegramData.message.document;

if (hasDocument) {
  const document = telegramData.message.document;
  const fileName = document.file_name || 'document';
  const mimeType = document.mime_type || '';

  // Sprawdź czy to PDF/DOCX/obraz
  const isClassifiable =
    mimeType.includes('pdf') ||
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType.includes('image') ||
    fileName.match(/\\.(pdf|docx?|xlsx?|jpg|jpeg|png)$/i);

  if (isClassifiable) {
    return [{
      json: {
        isCommand: false,
        hasDocument: true,
        hasPhoto: false,
        document: document,
        chatId: chatId,
        userName: userName,
        userMessage: userMessage || ''
      }
    }];
  } else {
    return [{
      json: {
        isCommand: true,
        chatId: chatId,
        response: `📎 Plik ${fileName} nie jest obsługiwany.\\n\\nObsługuję: PDF, DOCX, JPG, PNG`
      }
    }];
  }
}
```

#### 3. Dodaj nowy routing w "Has Photo?"

Zmień nazwę node "Has Photo?" na "Route Message" i dodaj warunek:

**Warunek 1 (TRUE):** `{{ $json.hasDocument === true }}` → Nowy flow "Document"
**Warunek 2 (TRUE):** `{{ $json.hasPhoto === true }}` → Istniejący flow "Photo"
**FALSE:** → Istniejący flow "Chat"

#### 4. Dodaj Document Classification Flow

Stwórz nowe nodes (skopiuj z K2BUD File Manager):

**a) Extract File Info**
```javascript
const document = $json.document;
return [{
  json: {
    fileInfo: {
      fileName: document.file_name,
      fileId: document.file_id,
      mimeType: document.mime_type,
      fileSize: document.file_size,
      type: 'document'
    },
    caption: $json.userMessage,
    chatId: $json.chatId
  }
}];
```

**b) HTTP Request - Get File Path**
- Method: GET
- URL: `https://api.telegram.org/bot{{ $credentials.telegramApi.token }}/getFile`
- Query Params: `file_id={{ $json.fileInfo.fileId }}`

**c) HTTP Request - Download File**
- Method: GET
- URL: `https://api.telegram.org/file/bot{{ $credentials.telegramApi.token }}/{{ $json.result.file_path }}`
- Response Format: file

**d) Code - Prepare for Claude**
```javascript
// Skopiuj CAŁY kod z node "Prepare File for Claude1"
// z K2BUD File Manager workflow
// (ten z długim promptem o strukturze folderów)
```

**e) HTTP Request - Claude API**
- Method: POST
- URL: `https://api.anthropic.com/v1/messages`
- Headers:
  - `anthropic-version`: `2023-06-01`
  - `content-type`: `application/json`
- Body: `={{ JSON.stringify($json.requestBody) }}`
- Credentials: Anthropic account

**f) Code - Parse AI Decision**
```javascript
// Skopiuj kod z node "Parse AI Decision"
// z K2BUD File Manager workflow
```

**g) Code - Map Folder to ID**
```javascript
// Skopiuj kod z node "Map Folder Path to ID"
// z K2BUD File Manager workflow
// (ten z 60+ mappingami folderów)
```

**h) Google Drive - Upload**
- Operation: Upload
- File Name: `={{ $json.fileName }}`
- Folder ID: `={{ $json.folderIdForDrive }}`
- Credentials: Google Drive account

**i) Telegram - Success Message**
```javascript
const message = `✅ Plik zapisany!

📁 Folder: ${$('Map Folder to ID').json.folder}
📄 Nazwa: ${$('Map Folder to ID').json.fileName}

💡 ${$('Map Folder to ID').json.reasoning}

🔗 ${$json.webViewLink}`;
```

#### 5. Połącz wszystkie nodes

```
"Route Message" (warunek hasDocument)
  ↓
"Extract File Info"
  ↓
"Get File Path" (HTTP)
  ↓
"Download File" (HTTP)
  ↓
"Prepare for Claude" (Code)
  ↓
"Claude API" (HTTP)
  ↓
"Parse AI Decision" (Code)
  ↓
"Map Folder to ID" (Code)
  ↓
"Upload to Drive" (Google Drive)
  ↓
"Success Message" (Telegram)
```

---

### Opcja 3: Napraw Mój Workflow (Trudniejsze)

Jeśli chcesz użyć mojego `k2bud-unified-agent-workflow.json`:

1. Zaimportuj workflow
2. W KAŻDYM node "Code" który używa Static Data, zamień:
   ```javascript
   // Znajdź i zamień:
   $node.getWorkflowStaticData('global')

   // NA:
   $getWorkflowStaticData('global')
   ```

3. Przepisz wszystkie credentials IDs (Telegram, Drive, Anthropic)

---

## 🎯 Moja Rekomendacja

**Użyj Opcji 2** - Rozszerz swój Chat Bot!

**Dlaczego:**
- ✅ Twój Chat Bot już działa
- ✅ Ma poprawną składnię Static Data
- ✅ Ma rate limiting i komendy
- ✅ Używa najnowszego modelu Claude
- ✅ Łatwiej dodać 9 nodes niż naprawiać cały workflow

**Co zyskujesz:**
- 🤖 Chat z historią
- 📸 Analiza zdjęć (Vision)
- 📁 Klasyfikacja dokumentów (nowe!)
- 💾 Upload do Google Drive (nowe!)
- 📊 Statystyki wszystkiego

---

## 📚 Następne Kroki

1. Zobacz `BUILD_GUIDE.md` - szczegółowa instrukcja krok po kroku
2. Zobacz `google_drive_folder_mapping_real.json` - gotowe mapowanie folderów
3. Testuj każdy flow osobno

---

## 💡 Potrzebujesz Pomocy?

Jeśli masz pytania:
- Zobacz `README_INTEGRATION.md` - porównanie workflow
- Zobacz `INTEGRATION_PLAN.md` - architektura systemu
- Przetestuj każdy node osobno

**Powodzenia!** 🚀
