/**
 * Context Manager - Zarządzanie pamięcią i kontekstem dla K2BUD Agent
 *
 * Obsługuje:
 * - Bufor tekstu (60s timeout dla opisu pliku)
 * - Historia konwersacji (ostatnie N wiadomości)
 * - Historia operacji archiwizacji
 * - Przechowywanie w n8n Static Data lub zewnętrznej bazie
 */

// ============================================
// KONFIGURACJA
// ============================================

const BUFFER_TIMEOUT_MS = 60000; // 60 sekund na opis pliku
const MAX_CONVERSATION_HISTORY = 10; // Max wiadomości w historii
const MAX_OPERATION_HISTORY = 50; // Max operacji w historii

// Typ storage
const STORAGE_TYPE = 'static_data'; // 'static_data' lub 'database'

// ============================================
// GŁÓWNE FUNKCJE
// ============================================

/**
 * Główna funkcja Context Managera
 */
async function manageContext() {
  try {
    const input = $input.first().json;
    const chatId = input.chat_id || input.message?.chat?.id;

    if (!chatId) {
      throw new Error('Brak chat_id w wiadomości');
    }

    // Pobierz aktualny kontekst dla tego chatu
    const context = await getContext(chatId);

    // Przetwórz wiadomość i zaktualizuj kontekst
    const operation = detectMessageType(input);

    switch(operation.type) {
      case 'TEXT_MESSAGE':
        return await handleTextMessage(input, context, chatId);

      case 'FILE_MESSAGE':
        return await handleFileMessage(input, context, chatId);

      case 'COMMAND':
        return await handleCommand(input, context, chatId);

      default:
        return {
          context: context,
          operation: 'UNKNOWN'
        };
    }
  } catch (error) {
    return {
      error: true,
      message: `Context Manager Error: ${error.message}`,
      stack: error.stack
    };
  }
}

// ============================================
// WYKRYWANIE TYPU WIADOMOŚCI
// ============================================

function detectMessageType(input) {
  const message = input.message || input;

  // Komenda
  if (message.text && message.text.startsWith('/')) {
    return { type: 'COMMAND' };
  }

  // Plik (foto, dokument, video, audio)
  if (message.photo || message.document || message.video || message.audio || message.voice) {
    return { type: 'FILE_MESSAGE' };
  }

  // Tekst
  if (message.text) {
    return { type: 'TEXT_MESSAGE' };
  }

  return { type: 'UNKNOWN' };
}

// ============================================
// OBSŁUGA WIADOMOŚCI TEKSTOWEJ
// ============================================

async function handleTextMessage(input, context, chatId) {
  const message = input.message || input;
  const text = message.text;
  const timestamp = message.date * 1000; // Unix timestamp -> ms

  // Sprawdź czy to może być opis do nadchodzącego pliku (buffer)
  // Ustawiamy buffer tekstu który będzie czekał 60s na plik

  const updatedContext = {
    ...context,
    textBuffer: {
      text: text,
      timestamp: timestamp,
      expires: timestamp + BUFFER_TIMEOUT_MS
    }
  };

  // Zapisz kontekst
  await saveContext(chatId, updatedContext);

  return {
    operation: 'TEXT_BUFFERED',
    context: updatedContext,
    bufferText: text,
    bufferExpires: new Date(timestamp + BUFFER_TIMEOUT_MS).toISOString(),
    message: 'Tekst zapisany w buforze - wyślij plik w ciągu 60s aby dodać ten opis'
  };
}

// ============================================
// OBSŁUGA PLIKU
// ============================================

async function handleFileMessage(input, context, chatId) {
  const message = input.message || input;
  const timestamp = message.date * 1000;

  // Sprawdź czy jest tekst w buforze (caption lub wcześniejsza wiadomość)
  let description = message.caption || '';

  // Jeśli nie ma caption, sprawdź bufor tekstowy
  if (!description && context.textBuffer) {
    const bufferAge = timestamp - context.textBuffer.timestamp;

    // Jeśli bufor nie wygasł (< 60s), użyj go jako opisu
    if (bufferAge < BUFFER_TIMEOUT_MS) {
      description = context.textBuffer.text;

      // Wyczyść bufor po użyciu
      context.textBuffer = null;
    }
  }

  // Przygotuj dane pliku
  const fileData = extractFileData(message);

  const result = {
    operation: 'FILE_RECEIVED',
    context: context,
    file: fileData,
    description: description,
    hasDescription: !!description,
    descriptionSource: message.caption ? 'caption' : (description ? 'buffer' : 'none')
  };

  // Zapisz kontekst
  await saveContext(chatId, context);

  return result;
}

// ============================================
// OBSŁUGA KOMEND
// ============================================

async function handleCommand(input, context, chatId) {
  const message = input.message || input;
  const text = message.text;
  const command = text.split(' ')[0].substring(1); // Usuń '/'

  return {
    operation: 'COMMAND',
    context: context,
    command: command,
    args: text.split(' ').slice(1)
  };
}

// ============================================
// ZARZĄDZANIE HISTORIĄ KONWERSACJI
// ============================================

/**
 * Dodaj wiadomość do historii konwersacji
 */
function addToConversationHistory(context, role, content) {
  if (!context.conversationHistory) {
    context.conversationHistory = [];
  }

  context.conversationHistory.push({
    role: role,
    content: content,
    timestamp: Date.now()
  });

  // Ogranicz do MAX_CONVERSATION_HISTORY
  if (context.conversationHistory.length > MAX_CONVERSATION_HISTORY) {
    context.conversationHistory = context.conversationHistory.slice(-MAX_CONVERSATION_HISTORY);
  }

  return context;
}

/**
 * Pobierz historię konwersacji (format dla Claude API)
 */
function getConversationHistory(context) {
  if (!context.conversationHistory) {
    return [];
  }

  return context.conversationHistory.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
}

/**
 * Wyczyść historię konwersacji
 */
function clearConversationHistory(context) {
  context.conversationHistory = [];
  return context;
}

// ============================================
// ZARZĄDZANIE HISTORIĄ OPERACJI
// ============================================

/**
 * Dodaj operację do historii
 */
function addToOperationHistory(context, operation) {
  if (!context.operationHistory) {
    context.operationHistory = [];
  }

  const operationRecord = {
    type: operation.type,
    timestamp: Date.now(),
    details: operation.details,
    status: operation.status || 'success'
  };

  context.operationHistory.push(operationRecord);

  // Ogranicz do MAX_OPERATION_HISTORY
  if (context.operationHistory.length > MAX_OPERATION_HISTORY) {
    context.operationHistory = context.operationHistory.slice(-MAX_OPERATION_HISTORY);
  }

  return context;
}

/**
 * Pobierz ostatnie N operacji
 */
function getRecentOperations(context, limit = 10) {
  if (!context.operationHistory) {
    return [];
  }

  return context.operationHistory.slice(-limit);
}

// ============================================
// STORAGE - POBIERANIE I ZAPIS KONTEKSTU
// ============================================

/**
 * Pobierz kontekst dla danego chat_id
 */
async function getContext(chatId) {
  if (STORAGE_TYPE === 'static_data') {
    return getContextFromStaticData(chatId);
  } else {
    // TODO: Implementacja database storage
    return getContextFromStaticData(chatId);
  }
}

/**
 * Zapisz kontekst dla danego chat_id
 */
async function saveContext(chatId, context) {
  if (STORAGE_TYPE === 'static_data') {
    return saveContextToStaticData(chatId, context);
  } else {
    // TODO: Implementacja database storage
    return saveContextToStaticData(chatId, context);
  }
}

// ============================================
// STATIC DATA STORAGE
// ============================================

function getContextFromStaticData(chatId) {
  // n8n Static Data API
  const staticData = $node.getWorkflowStaticData('global');

  if (!staticData.contexts) {
    staticData.contexts = {};
  }

  // Jeśli nie ma kontekstu dla tego chatu, stwórz nowy
  if (!staticData.contexts[chatId]) {
    staticData.contexts[chatId] = createEmptyContext();
  }

  return staticData.contexts[chatId];
}

function saveContextToStaticData(chatId, context) {
  const staticData = $node.getWorkflowStaticData('global');

  if (!staticData.contexts) {
    staticData.contexts = {};
  }

  staticData.contexts[chatId] = context;

  return true;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Utwórz pusty kontekst
 */
function createEmptyContext() {
  return {
    textBuffer: null,
    conversationHistory: [],
    operationHistory: [],
    created: Date.now(),
    lastUpdate: Date.now()
  };
}

/**
 * Wyciągnij dane pliku z wiadomości Telegram
 */
function extractFileData(message) {
  if (message.photo) {
    // Photo jest tablicą (różne rozmiary), weź największy
    const photo = message.photo[message.photo.length - 1];
    return {
      type: 'photo',
      fileId: photo.file_id,
      fileUniqueId: photo.file_unique_id,
      size: photo.file_size,
      width: photo.width,
      height: photo.height
    };
  }

  if (message.document) {
    return {
      type: 'document',
      fileId: message.document.file_id,
      fileUniqueId: message.document.file_unique_id,
      fileName: message.document.file_name,
      mimeType: message.document.mime_type,
      size: message.document.file_size
    };
  }

  if (message.video) {
    return {
      type: 'video',
      fileId: message.video.file_id,
      fileUniqueId: message.video.file_unique_id,
      fileName: message.video.file_name,
      mimeType: message.video.mime_type,
      size: message.video.file_size,
      duration: message.video.duration,
      width: message.video.width,
      height: message.video.height
    };
  }

  if (message.audio) {
    return {
      type: 'audio',
      fileId: message.audio.file_id,
      fileUniqueId: message.audio.file_unique_id,
      fileName: message.audio.file_name,
      mimeType: message.audio.mime_type,
      size: message.audio.file_size,
      duration: message.audio.duration
    };
  }

  if (message.voice) {
    return {
      type: 'voice',
      fileId: message.voice.file_id,
      fileUniqueId: message.voice.file_unique_id,
      mimeType: message.voice.mime_type,
      size: message.voice.file_size,
      duration: message.voice.duration
    };
  }

  return null;
}

/**
 * Format timestamp do czytelnej daty
 */
function formatTimestamp(timestamp) {
  return new Date(timestamp).toISOString();
}

// ============================================
// EKSPORTOWANE FUNKCJE POMOCNICZE
// ============================================

// Te funkcje mogą być używane przez inne nodes
const ContextManager = {
  getContext,
  saveContext,
  addToConversationHistory,
  getConversationHistory,
  clearConversationHistory,
  addToOperationHistory,
  getRecentOperations
};

// ============================================
// EXPORT
// ============================================

// Uruchom główną funkcję
return await manageContext();
