#!/usr/bin/env python3
"""
Skrypt testowy do sprawdzenia workflow Claude Chat z n8n

Użycie:
1. Ustaw WEBHOOK_URL na URL swojego webhooka z n8n
2. Uruchom: python test-webhook.py

Wymagania: pip install requests
"""

import requests
import time
import json

WEBHOOK_URL = 'http://localhost:5678/webhook/claude-chat'

# Historia konwersacji
conversation_history = []


def send_message(message: str) -> dict:
    """Wyślij wiadomość do Claude przez n8n webhook"""
    print(f"\n👤 Ty: {message}")

    try:
        response = requests.post(
            WEBHOOK_URL,
            json={
                'message': message,
                'history': conversation_history
            },
            headers={'Content-Type': 'application/json'}
        )

        response.raise_for_status()
        data = response.json()

        print(f"🤖 Claude: {data['message']}")
        print(f"\n📊 Tokeny - Input: {data['usage']['input_tokens']}, "
              f"Output: {data['usage']['output_tokens']}")
        print(f"🔧 Model: {data['model']}")

        # Zaktualizuj historię
        global conversation_history
        conversation_history = data['history']

        return data

    except requests.exceptions.RequestException as e:
        print(f"❌ Błąd: {str(e)}")
        raise


def main():
    """Przykładowa konwersacja"""
    print('🚀 Testowanie n8n Claude Chat Workflow\n')
    print(f'Webhook URL: {WEBHOOK_URL}')
    print('=' * 60)

    try:
        # Pierwsza wiadomość
        send_message('Cześć! Jak masz na imię?')
        time.sleep(1)

        # Druga wiadomość (z kontekstem)
        send_message('Jakie są twoje możliwości?')
        time.sleep(1)

        # Trzecia wiadomość
        send_message('Napisz krótki wiersz o programowaniu')

        print('\n' + '=' * 60)
        print('✅ Test zakończony pomyślnie!')
        print(f'📝 Historia konwersacji: {len(conversation_history)} wiadomości')

    except Exception as e:
        print('\n❌ Test nie powiódł się!')
        print('Sprawdź czy:')
        print('  1. n8n jest uruchomiony')
        print('  2. Workflow jest aktywny')
        print('  3. WEBHOOK_URL jest prawidłowy')
        print('  4. ANTHROPIC_API_KEY jest ustawiony w n8n')


if __name__ == '__main__':
    main()
