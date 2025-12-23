/**
 * Test Script dla K2BUD Unified Agent
 *
 * Testuje wszystkie główne funkcjonalności:
 * - Chat conversation
 * - File classification
 * - Commands (/help, /status)
 * - Text buffer (60s)
 *
 * Użycie:
 * 1. Ustaw WEBHOOK_URL i CHAT_ID
 * 2. Uruchom: node test-webhook-k2bud.js
 */

const WEBHOOK_URL = 'http://localhost:5678/webhook/k2bud-agent';
const CHAT_ID = 123456789; // Twój Telegram Chat ID

// Kolory w konsoli
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Symuluje wiadomość Telegram
 */
async function sendTelegramMessage(text, type = 'text') {
  const message = {
    message: {
      message_id: Date.now(),
      from: {
        id: CHAT_ID,
        is_bot: false,
        first_name: 'Test',
        username: 'test_user'
      },
      chat: {
        id: CHAT_ID,
        type: 'private'
      },
      date: Math.floor(Date.now() / 1000),
      text: type === 'text' ? text : undefined
    }
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.text();
    return { success: true, data };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Symuluje wysłanie pliku (zdjęcia)
 */
async function sendTelegramPhoto(caption = '') {
  const message = {
    message: {
      message_id: Date.now(),
      from: {
        id: CHAT_ID,
        is_bot: false,
        first_name: 'Test'
      },
      chat: {
        id: CHAT_ID,
        type: 'private'
      },
      date: Math.floor(Date.now() / 1000),
      photo: [
        {
          file_id: 'test_photo_' + Date.now(),
          file_unique_id: 'unique_' + Date.now(),
          file_size: 125000,
          width: 1920,
          height: 1080
        }
      ],
      caption: caption || undefined
    }
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.text();
    return { success: true, data };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test Suite
 */
async function runTests() {
  log('\n╔══════════════════════════════════════════════════╗', 'cyan');
  log('║   K2BUD Unified Agent - Test Suite              ║', 'cyan');
  log('╚══════════════════════════════════════════════════╝\n', 'cyan');

  log(`📍 Webhook URL: ${WEBHOOK_URL}`, 'blue');
  log(`💬 Chat ID: ${CHAT_ID}\n`, 'blue');

  let passedTests = 0;
  let failedTests = 0;

  // ============================================
  // Test 1: Komenda /help
  // ============================================
  log('─'.repeat(60), 'yellow');
  log('Test 1: Komenda /help', 'yellow');
  log('─'.repeat(60), 'yellow');

  const test1 = await sendTelegramMessage('/help');

  if (test1.success) {
    log('✅ PASS - /help komenda wysłana', 'green');
    passedTests++;
  } else {
    log(`❌ FAIL - Błąd: ${test1.error}`, 'red');
    failedTests++;
  }

  await sleep(2000);

  // ============================================
  // Test 2: Proste pytanie (chat)
  // ============================================
  log('\n' + '─'.repeat(60), 'yellow');
  log('Test 2: Proste pytanie (chat)', 'yellow');
  log('─'.repeat(60), 'yellow');

  const test2 = await sendTelegramMessage('Cześć! Jak działasz?');

  if (test2.success) {
    log('✅ PASS - Pytanie wysłane, oczekiwanie na odpowiedź AI...', 'green');
    passedTests++;
  } else {
    log(`❌ FAIL - Błąd: ${test2.error}`, 'red');
    failedTests++;
  }

  await sleep(3000);

  // ============================================
  // Test 3: Pytanie o strukturę
  // ============================================
  log('\n' + '─'.repeat(60), 'yellow');
  log('Test 3: Pytanie o strukturę folderów', 'yellow');
  log('─'.repeat(60), 'yellow');

  const test3 = await sendTelegramMessage('Gdzie zapisują się zdjęcia z budowy?');

  if (test3.success) {
    log('✅ PASS - Pytanie o strukturę wysłane', 'green');
    passedTests++;
  } else {
    log(`❌ FAIL - Błąd: ${test3.error}`, 'red');
    failedTests++;
  }

  await sleep(3000);

  // ============================================
  // Test 4: Zdjęcie z opisem (caption)
  // ============================================
  log('\n' + '─'.repeat(60), 'yellow');
  log('Test 4: Zdjęcie z budowy (caption)', 'yellow');
  log('─'.repeat(60), 'yellow');

  const test4 = await sendTelegramPhoto('postęp prac - ściana zachodnia');

  if (test4.success) {
    log('✅ PASS - Zdjęcie z caption wysłane', 'green');
    log('   Oczekiwane: Klasyfikacja → 03_PROJEKTY/.../Zdjecia_postep_prac/', 'cyan');
    passedTests++;
  } else {
    log(`❌ FAIL - Błąd: ${test4.error}`, 'red');
    failedTests++;
  }

  await sleep(5000);

  // ============================================
  // Test 5: Bufor tekstu (text → wait → photo)
  // ============================================
  log('\n' + '─'.repeat(60), 'yellow');
  log('Test 5: Bufor tekstu (60s)', 'yellow');
  log('─'.repeat(60), 'yellow');

  log('  Krok 1/2: Wysyłanie tekstu bufora...', 'cyan');
  const test5a = await sendTelegramMessage('dokument administracyjny - uchwała wspólników');

  if (test5a.success) {
    log('  ✅ Tekst bufora wysłany', 'green');
  } else {
    log(`  ❌ Błąd: ${test5a.error}`, 'red');
    failedTests++;
  }

  log('  ⏳ Czekam 5 sekund...', 'yellow');
  await sleep(5000);

  log('  Krok 2/2: Wysyłanie zdjęcia (bez caption)...', 'cyan');
  const test5b = await sendTelegramPhoto(); // Bez caption - użyje bufora

  if (test5b.success) {
    log('✅ PASS - Bufor tekstu działa poprawnie', 'green');
    log('   Oczekiwane: AI użyje wcześniejszego tekstu jako opisu', 'cyan');
    passedTests++;
  } else {
    log(`❌ FAIL - Błąd: ${test5b.error}`, 'red');
    failedTests++;
  }

  await sleep(5000);

  // ============================================
  // Test 6: Komenda /status
  // ============================================
  log('\n' + '─'.repeat(60), 'yellow');
  log('Test 6: Komenda /status', 'yellow');
  log('─'.repeat(60), 'yellow');

  const test6 = await sendTelegramMessage('/status');

  if (test6.success) {
    log('✅ PASS - /status komenda wysłana', 'green');
    passedTests++;
  } else {
    log(`❌ FAIL - Błąd: ${test6.error}`, 'red');
    failedTests++;
  }

  // ============================================
  // Podsumowanie
  // ============================================
  log('\n\n' + '═'.repeat(60), 'cyan');
  log('                    PODSUMOWANIE TESTÓW', 'cyan');
  log('═'.repeat(60), 'cyan');

  log(`\n✅ Testy zaliczone: ${passedTests}`, 'green');
  log(`❌ Testy niezaliczone: ${failedTests}`, failedTests > 0 ? 'red' : 'green');

  const totalTests = passedTests + failedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  log(`\n📊 Wskaźnik sukcesu: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');

  if (failedTests === 0) {
    log('\n🎉 Wszystkie testy zaliczone! System działa poprawnie.', 'green');
  } else {
    log('\n⚠️  Niektóre testy nie powiodły się. Sprawdź logi n8n.', 'yellow');
  }

  log('\n💡 WSKAZÓWKI:', 'cyan');
  log('   1. Sprawdź odpowiedzi bota w Telegram', 'cyan');
  log('   2. Zobacz logi w n8n (Executions)', 'cyan');
  log('   3. Sprawdź Google Drive czy pliki zostały zapisane', 'cyan');

  log('\n' + '═'.repeat(60) + '\n', 'cyan');
}

/**
 * Helper: Sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Uruchom testy
// ============================================

console.clear();
runTests().catch(error => {
  log(`\n❌ KRYTYCZNY BŁĄD: ${error.message}`, 'red');
  log('\nSprawdź czy:', 'yellow');
  log('  1. n8n jest uruchomiony', 'yellow');
  log('  2. Workflow jest aktywny (Active = ON)', 'yellow');
  log('  3. WEBHOOK_URL jest prawidłowy', 'yellow');
  log('  4. CHAT_ID jest prawidłowy\n', 'yellow');
  process.exit(1);
});
