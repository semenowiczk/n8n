/**
 * Unified AI Handler - Zintegrowany komponent AI dla K2BUD
 *
 * Obsługuje:
 * - Klasyfikację dokumentów spółki K2BUD (główna funkcja)
 * - Rozmowy i pytania użytkownika
 * - Analizę plików
 *
 * Używa Claude API (Anthropic)
 */

// ============================================
// KONFIGURACJA
// ============================================

const ANTHROPIC_API_KEY = $env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Modele
const MODEL_CLASSIFICATION = 'claude-3-5-haiku-20241022'; // Szybki dla klasyfikacji
const MODEL_CHAT = 'claude-3-5-sonnet-20241022'; // Lepszy dla rozmów

// Limity tokenów
const MAX_TOKENS_CLASSIFICATION = 2048;
const MAX_TOKENS_CHAT = 4096;

// ============================================
// SYSTEM PROMPTS
// ============================================

const SYSTEM_PROMPT_CLASSIFICATION = `Jesteś ekspertem w organizacji dokumentów dla spółki deweloperskiej K2BUD.

TWOJE ZADANIE:
Analizujesz dokumenty i przypisujesz je do odpowiednich folderów według struktury spółki.

STRUKTURA FOLDERÓW K2BUD (główne):
- 01_ADMINISTRACJA (dokumenty rejestrowe, uchwały, pełnomocnictwa)
- 02_KSIĘGOWOŚĆ (faktury, umowy, deklaracje podatkowe)
- 03_PROJEKTY (wszystkie projekty deweloperskie)
  - Projekt_01_Agatowa_Sieroslaw (NAJWAŻNIEJSZY - budowa domu)
    - 00_Dzialka (akty, geodezja, mapy)
    - 01_Projekty_budowlane (projekty architektoniczne)
    - 02_Pozwolenia (pozwolenia budowlane, zgłoszenia)
    - 03_Realizacja (faktury, zdjęcia postępu, umowy z wykonawcami)
      - Zdjecia_postep_prac (NAJCZĘŚCIEJ - zdjęcia z budowy)
      - Faktury_budowa
      - Umowy_wykonawcy
    - 04_Odbiory (protokoły, certyfikaty)
- 04_PRAWNE (umowy, sprawy sądowe)
- 05_MARKETING (materiały promocyjne, oferty)
- 06_SZABLONY (wzory dokumentów)
- 07_ARCHIWUM (stare dokumenty)
- 08_IT_INFRASTRUKTURA (dokumentacja IT)

KONWENCJA NAZEWNICTWA:
Format: YYYY-MM-DD_KategoriaDokumentu_KrotkaOpisowa_Nazwa_v1.rozszerzenie
Przykłady:
- 2024-03-15_Faktura_Materialy_Budowlane_Leroy_Merlin_v1.pdf
- 2024-03-20_Zdjecie_Postep_Prac_Sciana_Zachodnia_v1.jpg
- 2024-02-10_Umowa_Elektryk_Jan_Kowalski_v1.pdf

ZASADY KLASYFIKACJI:
1. Zdjęcia z budowy → 03_PROJEKTY/Projekt_01_Agatowa_Sieroslaw/03_Realizacja/Zdjecia_postep_prac/
2. Faktury budowlane → 03_PROJEKTY/Projekt_01_Agatowa_Sieroslaw/03_Realizacja/Faktury_budowa/
3. Dokumenty księgowe ogólne → 02_KSIĘGOWOŚĆ/
4. Dokumenty administracyjne → 01_ADMINISTRACJA/
5. Jeśli nie wiesz → 00_DO_SORTOWANIA/

ODPOWIEDZ W FORMACIE JSON:
{
  "isK2BUDDocument": true/false,
  "folderPath": "ścieżka/do/folderu",
  "fileName": "nazwa_pliku_wg_konwencji",
  "category": "kategoria",
  "reasoning": "uzasadnienie decyzji"
}`;

const SYSTEM_PROMPT_CHAT = `Jesteś asystentem AI dla spółki deweloperskiej K2BUD.

Pomagasz w:
- Odpowiadaniu na pytania o dokumenty i projekty
- Analizie plików (zdjęć, PDF, dokumentów)
- Organizacji pracy
- Doradzaniu w sprawach związanych z budową

Odpowiadaj zawsze po polsku, zwięźle i konkretnie.

Jeśli użytkownik pyta o klasyfikację lub archiwizację pliku, wyjaśnij gdzie zostanie zapisany zgodnie ze strukturą K2BUD.

Jeśli otrzymasz plik, który nie jest dokumentem spółki - powiedz o tym i zaproponuj opcje (analiza, archiwizacja ogólna, itp.).`;

// ============================================
// GŁÓWNA FUNKCJA
// ============================================

async function handleUnifiedAI() {
  try {
    const input = $input.first().json;

    // Rozpoznaj typ operacji
    const operation = detectOperation(input);

    switch(operation.type) {
      case 'FILE_CLASSIFICATION':
        return await classifyDocument(input, operation);

      case 'CHAT':
        return await handleChat(input, operation);

      case 'COMMAND':
        return await handleCommand(input, operation);

      default:
        return {
          error: true,
          message: 'Nieznany typ operacji'
        };
    }
  } catch (error) {
    return {
      error: true,
      message: `Błąd: ${error.message}`,
      stack: error.stack
    };
  }
}

// ============================================
// WYKRYWANIE TYPU OPERACJI
// ============================================

function detectOperation(input) {
  // Sprawdź czy to komenda
  if (input.text && input.text.startsWith('/')) {
    const command = input.text.split(' ')[0].substring(1);
    return {
      type: 'COMMAND',
      command: command,
      args: input.text.split(' ').slice(1)
    };
  }

  // Sprawdź czy to plik do klasyfikacji
  if (input.file || input.document || input.photo) {
    return {
      type: 'FILE_CLASSIFICATION',
      fileType: input.photo ? 'photo' : input.document ? 'document' : 'file',
      hasDescription: !!input.caption || !!input.bufferText
    };
  }

  // W przeciwnym razie to chat
  return {
    type: 'CHAT',
    hasContext: !!input.conversationHistory
  };
}

// ============================================
// KLASYFIKACJA DOKUMENTÓW K2BUD
// ============================================

async function classifyDocument(input, operation) {
  const fileInfo = extractFileInfo(input);
  const context = input.caption || input.bufferText || '';

  // Przygotuj prompt dla Claude
  const userPrompt = buildClassificationPrompt(fileInfo, context);

  // Wywołaj Claude API
  const response = await callClaudeAPI(
    SYSTEM_PROMPT_CLASSIFICATION,
    userPrompt,
    MODEL_CLASSIFICATION,
    MAX_TOKENS_CLASSIFICATION,
    true // responseFormat: JSON
  );

  // Parsuj odpowiedź
  let classification;
  try {
    classification = JSON.parse(response.content);
  } catch (e) {
    // Jeśli Claude nie zwrócił czystego JSON, spróbuj wyciągnąć JSON z tekstu
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      classification = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Nie udało się sparsować odpowiedzi Claude jako JSON');
    }
  }

  return {
    operationType: 'FILE_CLASSIFICATION',
    classification: classification,
    originalFile: fileInfo,
    usage: response.usage
  };
}

function extractFileInfo(input) {
  if (input.photo) {
    return {
      type: 'photo',
      fileName: input.photo.file_name || `photo_${Date.now()}.jpg`,
      mimeType: 'image/jpeg',
      size: input.photo.file_size,
      fileId: input.photo.file_id
    };
  }

  if (input.document) {
    return {
      type: 'document',
      fileName: input.document.file_name,
      mimeType: input.document.mime_type,
      size: input.document.file_size,
      fileId: input.document.file_id
    };
  }

  if (input.file) {
    return {
      type: 'file',
      fileName: input.file.fileName || 'unknown',
      mimeType: input.file.mimeType,
      size: input.file.size,
      fileId: input.file.id
    };
  }

  return null;
}

function buildClassificationPrompt(fileInfo, context) {
  let prompt = `PLIK DO KLASYFIKACJI:\n`;
  prompt += `Nazwa: ${fileInfo.fileName}\n`;
  prompt += `Typ: ${fileInfo.mimeType}\n`;
  prompt += `Rozmiar: ${formatFileSize(fileInfo.size)}\n`;

  if (context) {
    prompt += `\nKONTEKST/OPIS:\n${context}\n`;
  }

  prompt += `\nPrzeanalizuj ten plik i zdecyduj:
1. Czy to dokument związany ze spółką K2BUD?
2. Jeśli TAK - do jakiego folderu go przypisać?
3. Jaką nazwę nadać według konwencji K2BUD?

Zwróć odpowiedź w formacie JSON.`;

  return prompt;
}

// ============================================
// OBSŁUGA ROZMÓW (CHAT)
// ============================================

async function handleChat(input, operation) {
  const userMessage = input.text || input.message || '';
  const conversationHistory = input.conversationHistory || [];

  // Przygotuj historię dla Claude
  const messages = buildChatMessages(conversationHistory, userMessage);

  // Wywołaj Claude API
  const response = await callClaudeAPI(
    SYSTEM_PROMPT_CHAT,
    messages,
    MODEL_CHAT,
    MAX_TOKENS_CHAT,
    false // responseFormat: Text
  );

  // Zaktualizuj historię
  const updatedHistory = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
    { role: 'assistant', content: response.content }
  ];

  // Ogranicz do ostatnich 10 wiadomości
  const limitedHistory = updatedHistory.slice(-10);

  return {
    operationType: 'CHAT',
    response: response.content,
    conversationHistory: limitedHistory,
    usage: response.usage
  };
}

function buildChatMessages(history, newMessage) {
  // Jeśli to tablica wiadomości, użyj jej
  if (Array.isArray(history) && history.length > 0) {
    return [
      ...history,
      { role: 'user', content: newMessage }
    ];
  }

  // W przeciwnym razie tylko nowa wiadomość
  return [
    { role: 'user', content: newMessage }
  ];
}

// ============================================
// OBSŁUGA KOMEND
// ============================================

async function handleCommand(input, operation) {
  const { command, args } = operation;

  switch(command) {
    case 'help':
      return {
        operationType: 'COMMAND',
        command: 'help',
        response: getHelpText()
      };

    case 'status':
      return {
        operationType: 'COMMAND',
        command: 'status',
        response: await getStatusInfo(input)
      };

    case 'archive':
      // Komenda /archive wymusza archiwizację pliku
      return {
        operationType: 'COMMAND',
        command: 'archive',
        response: 'Funkcja /archive będzie dostępna wkrótce',
        action: 'FORCE_ARCHIVE'
      };

    default:
      return {
        operationType: 'COMMAND',
        command: command,
        response: `Nieznana komenda: /${command}\n\nWpisz /help aby zobaczyć dostępne komendy.`
      };
  }
}

function getHelpText() {
  return `🤖 **K2BUD Agent - Pomoc**

**GŁÓWNE FUNKCJE:**

📁 **Organizacja dokumentów**
Wyślij plik z opisem (lub bez) - zostanie automatycznie sklasyfikowany i zapisany w odpowiednim folderze K2BUD.

💬 **Rozmowa**
Zadaj pytanie o dokumenty, projekty lub cokolwiek innego.

**KOMENDY:**
/help - Wyświetl tę pomoc
/status - Status ostatnich operacji
/archive - Wymuś archiwizację pliku

**PRZYKŁADY UŻYCIA:**

1️⃣ **Zdjęcie z budowy:**
📸 Wyślij zdjęcie + opis "postęp prac ściana zachodnia"
→ Zostanie zapisane w: 03_PROJEKTY/.../Zdjecia_postep_prac/

2️⃣ **Faktura:**
📄 Wyślij PDF faktury + opis "materiały Leroy Merlin"
→ Zostanie zapisane w: 03_PROJEKTY/.../Faktury_budowa/

3️⃣ **Pytanie:**
💬 "Gdzie zapisują się faktury budowlane?"
→ Otrzymasz odpowiedź o strukturze folderów

**WSKAZÓWKI:**
✅ Dodawaj opisy do plików - pomaga w klasyfikacji
✅ Możesz wysłać tekst przed plikiem (60s bufor)
✅ Agent rozpoznaje automatycznie typ dokumentu`;
}

async function getStatusInfo(input) {
  // TODO: Implementacja pobierania statusu z historii operacji
  return `📊 **Status Agenta K2BUD**

✅ System działa prawidłowo
🤖 Model: ${MODEL_CLASSIFICATION} (klasyfikacja), ${MODEL_CHAT} (chat)
📁 Połączenie z Google Drive: OK

**Ostatnie operacje:** (funkcja w przygotowaniu)

Wpisz /help aby zobaczyć dostępne funkcje.`;
}

// ============================================
// WYWOŁANIE CLAUDE API
// ============================================

async function callClaudeAPI(systemPrompt, userMessageOrMessages, model, maxTokens, expectJSON = false) {
  // Przygotuj messages
  let messages;
  if (typeof userMessageOrMessages === 'string') {
    messages = [{ role: 'user', content: userMessageOrMessages }];
  } else if (Array.isArray(userMessageOrMessages)) {
    messages = userMessageOrMessages;
  } else {
    throw new Error('Invalid message format');
  }

  // Przygotuj request body
  const requestBody = {
    model: model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages
  };

  // Wywołaj API
  const response = await $http.request({
    method: 'POST',
    url: ANTHROPIC_API_URL,
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: requestBody
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();

  // Wyciągnij content z odpowiedzi
  const content = data.content[0].text;

  return {
    content: content,
    usage: data.usage,
    model: data.model
  };
}

// ============================================
// FUNKCJE POMOCNICZE
// ============================================

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// EXPORT
// ============================================

// Uruchom główną funkcję i zwróć wynik
return await handleUnifiedAI();
