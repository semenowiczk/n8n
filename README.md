# n8n Claude API Workflow

Workflow do rozmowy z Claude AI przez Anthropic API w n8n.

## 📋 Zawartość

Repozytorium zawiera dwa workflow:

1. **claude-chat-workflow.json** - Prosty workflow do jednorazowych zapytań
2. **claude-chat-conversation-workflow.json** - Zaawansowany workflow z historią konwersacji (multi-turn)

## 🚀 Szybki Start

### Wymagania

- n8n zainstalowane (self-hosted lub n8n.cloud)
- Klucz API Anthropic ([uzyskaj tutaj](https://console.anthropic.com/))

### Instalacja

#### Opcja 1: Import w n8n UI

1. Zaloguj się do n8n
2. Kliknij "Add workflow" → "Import from File"
3. Wybierz plik workflow (`claude-chat-workflow.json` lub `claude-chat-conversation-workflow.json`)
4. Kliknij "Import"

#### Opcja 2: Import z URL (jeśli workflow jest hostowany)

1. W n8n kliknij "Add workflow" → "Import from URL"
2. Wklej URL do pliku JSON

### Konfiguracja

#### Ustawienie klucza API

**Metoda 1: Zmienna środowiskowa (zalecane)**

Dodaj do pliku `.env` n8n:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxx
```

**Metoda 2: Bezpośrednio w workflow**

W node "Set Message" lub "Prepare Messages", zmień wartość `apiKey` na swój klucz:

```json
{
  "name": "apiKey",
  "value": "sk-ant-api03-twoj-klucz-tutaj"
}
```

## 📖 Jak używać

### Workflow 1: Prosty Chat (claude-chat-workflow.json)

Ten workflow służy do pojedynczych zapytań do Claude.

**Kroki:**

1. Zaimportuj workflow
2. Otwórz node "Set Message"
3. Zmień wartość `userMessage` na swoje pytanie
4. Kliknij "Execute Workflow"
5. Sprawdź wynik w node "Extract Response"

**Przykład:**

```
Node "Set Message":
userMessage: "Napisz wiersz o programowaniu w stylu Adama Mickiewicza"
```

### Workflow 2: Konwersacja z historią (claude-chat-conversation-workflow.json)

Ten workflow obsługuje wieloturowe rozmowy z zachowaniem kontekstu.

**Testowanie:**

1. Zaimportuj workflow
2. Aktywuj workflow (przełącznik Active)
3. Skopiuj URL webhooka (pojawi się po aktywacji)
4. Wyślij zapytanie przez curl/Postman:

**Pierwsze zapytanie:**

```bash
curl -X POST https://twoja-instancja.n8n.cloud/webhook/claude-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Cześć! Jak masz na imię?"
  }'
```

**Odpowiedź:**

```json
{
  "message": "Jestem Claude, asystent AI stworzony przez Anthropic...",
  "history": [
    {"role": "user", "content": "Cześć! Jak masz na imię?"},
    {"role": "assistant", "content": "Jestem Claude..."}
  ],
  "usage": {
    "input_tokens": 12,
    "output_tokens": 45
  },
  "model": "claude-3-5-sonnet-20241022"
}
```

**Kolejne zapytanie (z historią):**

```bash
curl -X POST https://twoja-instancja.n8n.cloud/webhook/claude-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "A co potrafisz robić?",
    "history": [
      {"role": "user", "content": "Cześć! Jak masz na imię?"},
      {"role": "assistant", "content": "Jestem Claude, asystent AI stworzony przez Anthropic..."}
    ]
  }'
```

## 🔧 Konfiguracja zaawansowana

### Zmiana modelu Claude

W node "Call Claude API", w sekcji JSON Body, zmień wartość `model`:

```json
{
  "model": "claude-3-5-sonnet-20241022",  // Zmień tutaj
  "max_tokens": 2048,
  "messages": ...
}
```

Dostępne modele:
- `claude-3-5-sonnet-20241022` (zalecany - najnowszy, najbardziej wydajny)
- `claude-3-5-haiku-20241022` (szybszy, tańszy)
- `claude-3-opus-20240229` (najlepszy, ale droższy)

### Zmiana liczby tokenów

Dostosuj `max_tokens` aby kontrolować długość odpowiedzi:

```json
{
  "max_tokens": 4096  // Zwiększ dla dłuższych odpowiedzi
}
```

### Dodanie System Prompt

W node "Call Claude API", zaktualizuj JSON Body:

```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 2048,
  "system": "Jesteś pomocnym asystentem mówiącym po polsku. Odpowiadaj zwięźle i rzeczowo.",
  "messages": {{ JSON.stringify($json.messages) }}
}
```

## 🎨 Przykłady użycia

### Integracja z formularzem webowym

1. Użyj workflow z webhookiem (claude-chat-conversation-workflow.json)
2. Stwórz frontend HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Chat z Claude</title>
    <style>
        #chat { border: 1px solid #ccc; padding: 10px; height: 400px; overflow-y: scroll; }
        .message { margin: 10px 0; }
        .user { color: blue; }
        .assistant { color: green; }
    </style>
</head>
<body>
    <div id="chat"></div>
    <input type="text" id="input" placeholder="Napisz wiadomość..." style="width: 300px;">
    <button onclick="sendMessage()">Wyślij</button>

    <script>
        let history = [];
        const chatDiv = document.getElementById('chat');
        const WEBHOOK_URL = 'https://twoja-instancja.n8n.cloud/webhook/claude-chat';

        async function sendMessage() {
            const input = document.getElementById('input');
            const message = input.value;
            if (!message) return;

            // Wyświetl wiadomość użytkownika
            chatDiv.innerHTML += `<div class="message user">Ty: ${message}</div>`;
            input.value = '';

            // Wyślij do n8n
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history })
            });

            const data = await response.json();

            // Wyświetl odpowiedź Claude
            chatDiv.innerHTML += `<div class="message assistant">Claude: ${data.message}</div>`;

            // Zaktualizuj historię
            history = data.history;

            // Scroll na dół
            chatDiv.scrollTop = chatDiv.scrollHeight;
        }

        // Obsługa Enter
        document.getElementById('input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    </script>
</body>
</html>
```

### Integracja ze Slackiem

Możesz dodać node Slack na początku workflow, aby odbierać wiadomości ze Slacka i odpowiadać przez Claude.

### Automatyczne podsumowania

Dodaj node Schedule Trigger do regularnego wywoływania Claude z zapytaniem o podsumowanie danych.

## 🔐 Bezpieczeństwo

**WAŻNE:** Nigdy nie commituj klucza API do repozytorium!

- Używaj zmiennych środowiskowych
- W n8n.cloud używaj Credentials do przechowywania kluczy
- Ogranicz dostęp do webhooka (możesz dodać authentication w node Webhook)

### Dodanie autoryzacji do webhooka

W node "Webhook", w sekcji "Authentication", ustaw:
- Authentication: Header Auth
- Header Name: `X-API-Key`
- Header Value: `twoje-tajne-haslo`

Wtedy przy wywołaniu:

```bash
curl -X POST https://twoja-instancja.n8n.cloud/webhook/claude-chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: twoje-tajne-haslo" \
  -d '{"message": "Cześć!"}'
```

## 📊 Monitoring i koszty

### Śledzenie użycia tokenów

Odpowiedź zawiera pole `usage`:

```json
{
  "usage": {
    "input_tokens": 12,
    "output_tokens": 45
  }
}
```

### Koszty (ceny na grudzień 2024)

Claude 3.5 Sonnet:
- Input: $3 / 1M tokenów
- Output: $15 / 1M tokenów

Claude 3.5 Haiku:
- Input: $0.80 / 1M tokenów
- Output: $4 / 1M tokenów

Sprawdź aktualne ceny na: https://www.anthropic.com/pricing

## 🐛 Troubleshooting

### Błąd: "x-api-key header is required"

Sprawdź czy:
- Ustawiłeś zmienną `ANTHROPIC_API_KEY`
- Restart n8n po dodaniu zmiennej środowiskowej
- Klucz jest prawidłowy (zaczyna się od `sk-ant-api03-`)

### Błąd: "model not found"

Sprawdź czy nazwa modelu jest prawidłowa. Od grudnia 2024 używaj:
- `claude-3-5-sonnet-20241022`
- `claude-3-5-haiku-20241022`

### Workflow nie wykonuje się

- Sprawdź czy workflow jest aktywny (przełącznik Active)
- Sprawdź logi wykonania (Executions w n8n)
- Upewnij się że wszystkie nodes są poprawnie połączone

### Odpowiedź jest pusta

- Zwiększ `max_tokens` w konfiguracji
- Sprawdź czy API key ma odpowiednie uprawnienia

## 📚 Dodatkowe zasoby

- [Dokumentacja Anthropic API](https://docs.anthropic.com/)
- [n8n Documentation](https://docs.n8n.io/)
- [Claude API Reference](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [n8n Community Forum](https://community.n8n.io/)

## 🤝 Wkład

Jeśli znajdziesz błędy lub masz pomysły na ulepszenia, śmiało twórz issue lub pull request!

## 📄 Licencja

MIT License - możesz swobodnie używać i modyfikować te workflow.

## ✨ Autorzy

Stworzono przez Claude (AI) dla społeczności n8n.

---

**Miłego chatowania z Claude! 🚀**
