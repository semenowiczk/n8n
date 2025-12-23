/**
 * Skrypt testowy do sprawdzenia workflow Claude Chat z n8n
 *
 * Użycie:
 * 1. Ustaw WEBHOOK_URL na URL swojego webhooka z n8n
 * 2. Uruchom: node test-webhook.js
 */

const WEBHOOK_URL = 'http://localhost:5678/webhook/claude-chat';

// Historia konwersacji
let conversationHistory = [];

/**
 * Wyślij wiadomość do Claude przez n8n webhook
 */
async function sendMessage(message) {
    console.log(`\n👤 Ty: ${message}`);

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: conversationHistory
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log(`🤖 Claude: ${data.message}`);
        console.log(`\n📊 Tokeny - Input: ${data.usage.input_tokens}, Output: ${data.usage.output_tokens}`);
        console.log(`🔧 Model: ${data.model}`);

        // Zaktualizuj historię
        conversationHistory = data.history;

        return data;
    } catch (error) {
        console.error('❌ Błąd:', error.message);
        throw error;
    }
}

/**
 * Przykładowa konwersacja
 */
async function main() {
    console.log('🚀 Testowanie n8n Claude Chat Workflow\n');
    console.log('Webhook URL:', WEBHOOK_URL);
    console.log('=''.repeat(60));

    try {
        // Pierwsza wiadomość
        await sendMessage('Cześć! Jak masz na imię?');

        // Poczekaj chwilę
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Druga wiadomość (z kontekstem)
        await sendMessage('Jakie są twoje możliwości?');

        // Poczekaj chwilę
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Trzecia wiadomość
        await sendMessage('Napisz krótki wiersz o programowaniu');

        console.log('\n' + '='.repeat(60));
        console.log('✅ Test zakończony pomyślnie!');
        console.log(`📝 Historia konwersacji: ${conversationHistory.length} wiadomości`);

    } catch (error) {
        console.error('\n❌ Test nie powiódł się!');
        console.error('Sprawdź czy:');
        console.error('  1. n8n jest uruchomiony');
        console.error('  2. Workflow jest aktywny');
        console.error('  3. WEBHOOK_URL jest prawidłowy');
        console.error('  4. ANTHROPIC_API_KEY jest ustawiony w n8n');
    }
}

// Uruchom test
main();
