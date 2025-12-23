# K2BUD Unified Agent - Działający Workflow (Łączący Oba Systemy)

## 🎯 Co Łączy Ten Workflow

### Z Chat Bot (Twój Workflow 2):
- ✅ Rate limiting (10 msg/min)
- ✅ Komendy: /help, /stats, /clear
- ✅ Historia konwersacji (20 wiadomości)
- ✅ Claude Vision (analiza zdjęć)
- ✅ Model: `claude-sonnet-4-20250514`
- ✅ Poprawna składnia: `$getWorkflowStaticData('global')`

### Z K2BUD File Manager (Twój Workflow 1):
- ✅ Klasyfikacja dokumentów PDF/DOCX
- ✅ 60+ folder mappings Google Drive
- ✅ Szczegółowy prompt Claude
- ✅ Upload do Drive z konwencją nazewnictwa
- ✅ Credentials: Telegram (x9zc7iKAbA62wLsD), Drive (p6DN9o3jAMH4ZJSD), Anthropic (z0DJqZvJGQ9an9nZ)

---

## 📊 Architektura Zintegrowana

```
Telegram Trigger
     ↓
Rate Limit & Commands + Document Detection
     ↓
Router (Switch)
  ├─→ [Komenda] → Send Response
  ├─→ [Dokument PDF/DOCX] → Klasyfikacja K2BUD → Drive → Success
  ├─→ [Zdjęcie] → Claude Vision → Response
  └─→ [Tekst] → Claude Chat → Response
```

---

## 🔧 Różnice od Poprzedniej Wersji

### Naprawione Błędy:

**PRZED (błędne):**
```javascript
const staticData = $node.getWorkflowStaticData('global'); // ❌
```

**PO (poprawne - z Twojego Chat Bot):**
```javascript
const globalData = $getWorkflowStaticData('global'); // ✅
```

---

## 📝 Nodes w Zintegrowanym Workflow

### 1. Telegram Trigger
- Credentials: `Telegramaccount2` (x9zc7iKAbA62wLsD)

### 2. Rate Limit & Commands + Document Detection (rozszerzony)
```javascript
// Dodano wykrywanie dokumentów
const hasDocument = telegramData.message.document;
const hasPhoto = telegramData.message.photo && telegramData.message.photo.length > 0;

if (hasDocument) {
  // Kieruj do klasyfikacji K2BUD
  return [{
    json: {
      isCommand: false,
      hasDocument: true,
      hasPhoto: false,
      document: telegramData.message.document,
      chatId: chatId,
      userName: userName,
      userMessage: userMessage
    }
  }];
}

if (hasPhoto) {
  // Kieruj do Claude Vision (istniejący flow)
  return [{
    json: {
      isCommand: false,
      hasPhoto: true,
      hasDocument: false,
      photoFileId: photoFileId,
      chatId: chatId,
      userName: userName,
      userMessage: userMessage,
      conversationHistory: globalData[`chat_${chatId}`] || []
    }
  }];
}

// Tekst - kieruj do chat
// ... reszta z Chat Bot
```

### 3. Router (Switch)
Warunki:
- `$json.isCommand === true` → Send Command Response
- `$json.hasDocument === true` → Document Classification Flow
- `$json.hasPhoto === true` → Photo Analysis Flow
- Else → Text Chat Flow

### 4. Document Classification Flow (z K2BUD)

**4a. Extract File Info**
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

**4b. Download from Telegram**
- URL: `https://api.telegram.org/bot{BOT_TOKEN}/getFile`
- Param: `file_id={{ $json.fileInfo.fileId }}`
- Credentials: Telegramaccount2

**4c. Download File Binary**
- URL: `https://api.telegram.org/file/bot{BOT_TOKEN}/{{ $json.result.file_path }}`
- Response format: file

**4d. Prepare for Claude (K2BUD Prompt)**
```javascript
// Użyj szczegółowego promptu z K2BUD workflow 1
// (cały prompt z "Prepare File for Claude1")
// Model: claude-3-5-haiku-20241022 (tańszy dla klasyfikacji)
```

**4e. Claude API - Classify**
- Model: `claude-3-5-haiku-20241022`
- Credentials: Anthropic account (z0DJqZvJGQ9an9nZ)

**4f. Parse AI Decision**
```javascript
// Z K2BUD workflow 1
const aiDecisionText = response.content[0].text;
let cleanJson = aiDecisionText.trim()
  .replace(/```json\n?/g, '')
  .replace(/```\n?/g, '');

const aiDecision = JSON.parse(cleanJson);
return [{
  json: {
    folder: aiDecision.folder,
    fileName: aiDecision.fileName,
    reasoning: aiDecision.reasoning
  }
}];
```

**4g. Map Folder Path to ID**
```javascript
// Mapowanie 60+ folderów z workflow 1
const folderMapping = {
  "00_DO_SORTOWANIA": "1glm8ZfM4d2Kh-uu3xhaJFZDvmrd6PZma",
  "03_PROJEKTY/Projekt_01_Agatowa_Sieroslaw/03_Realizacja/Zdjecia_postep_prac": "1C4VcnP2stSpB2mMK8-zGs5XD47Ya1yLB",
  "03_PROJEKTY/Projekt_01_Agatowa_Sieroslaw/03_Realizacja/Faktury_budowa": "11Bso5G4m9Tm6eGwl0hTEYjMs9dyGGZCU",
  // ... wszystkie 60+ folderów
};

const folderId = folderMapping[$json.folder] || folderMapping["00_DO_SORTOWANIA"];
```

**4h. Upload to Google Drive**
- Credentials: Google Drive account (p6DN9o3jAMH4ZJSD)
- Folder ID: `{{ $json.folderId }}`
- File name: `{{ $json.fileName }}`

**4i. Send Success Message**
```javascript
const message = `✅ Plik zapisany pomyślnie!

📁 Folder: ${folder}
📄 Nazwa: ${fileName}

💡 Uzasadnienie:
${reasoning}

🔗 Link: ${driveLink}`;
```

### 5. Photo Analysis Flow (z Chat Bot - BEZ ZMIAN!)
- Telegram - Analyzing Photo
- Get File Info
- Download Photo
- Prepare Request with Image
- Claude API Call (Vision)
- Parse & Save Response
- Split Response
- Send Response

### 6. Text Chat Flow (z Chat Bot - BEZ ZMIAN!)
- Telegram - Thinking Message
- Prepare Request
- Claude API Call
- Parse & Save Response
- Split Response
- Send Response

---

## 🔑 Credentials (Z Twoich Workflow)

### Telegram Bot (Chat Bot - Workflow 2)
- ID: `x9zc7iKAbA62wLsD`
- Name: `Telegramaccount2`
- **Ten będzie główny** (ma rate limiting)

### Google Drive (K2BUD - Workflow 1)
- ID: `p6DN9o3jAMH4ZJSD`
- Name: `Google Drive account`

### Anthropic (oba workflow używają tego samego!)
- ID: `z0DJqZvJGQ9an9nZ`
- Name: `Anthropic account`

---

## 📋 Scenariusze Użycia

### Scenariusz 1: Dokument do klasyfikacji
```
User: [PDF faktury] "faktura BudPol"
Bot: "Klasyfikuję dokument... 📄"
     → Claude Haiku klasyfikuje (tańszy)
     → Upload do Drive
Bot: "✅ Zapisano: 20241223_FZ_BudPol_15000PLN.pdf
     📁 Folder: .../Faktury_budowa"
```

### Scenariusz 2: Zdjęcie z budowy
```
User: [zdjęcie] "postęp prac"
Bot: "Analizuję zdjęcie... 📸"
     → Claude Sonnet 4 analizuje (Vision)
Bot: "Na zdjęciu widzę: ścianę w trakcie murowania..."
     (Opcjonalnie: klasyfikacja i zapis - do dodania)
```

### Scenariusz 3: Pytanie tekstowe
```
User: "Gdzie zapisują się faktury?"
Bot: "Myślę... 🤔"
     → Claude Sonnet 4 odpowiada
Bot: "Faktury są w folderze .../Faktury_budowa"
```

### Scenariusz 4: Komendy
```
User: "/stats"
Bot: "📊 Statystyki:
     • Wiadomości: 15/20
     • Rate limit: 3/10
     • Dokumentów: 12"
```

---

## 🎨 Ulepszenia vs. Twoje Workflow

| Feature | Chat Bot | K2BUD | Zintegrowany |
|---------|----------|-------|--------------|
| Chat | ✅ | ❌ | ✅ |
| Vision | ✅ | ❌ | ✅ |
| Klasyfikacja | ❌ | ✅ | ✅ |
| Drive Upload | ❌ | ✅ | ✅ |
| Rate Limit | ✅ | ❌ | ✅ |
| Komendy | ✅ | ❌ | ✅ |
| Historia | ✅ | ❌ | ✅ |
| Credentials | 1 bot | 1 bot | **1 bot** ✅ |

---

## 🚀 Następne Kroki

1. **Stworzę JSON workflow** - pełny export gotowy do importu
2. **Dokumentację nodes** - co każdy robi
3. **Instrukcję testowania** - jak sprawdzić czy działa

Chcesz żebym teraz stworzył:
- [ ] Pełny JSON workflow do importu?
- [ ] Szczegółową dokumentację każdego node?
- [ ] Skrypt testowy?

Wszystkie 3? 😊
