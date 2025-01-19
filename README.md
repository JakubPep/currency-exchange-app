# Currency Exchange App

Aplikacja kantoru wymiany walut stworzona przy użyciu React Native (frontend) i Node.js (backend).

## Funkcjonalności

- Tworzenie i zarządzanie kontem użytkownika
- Wirtualne zasilanie konta
- Sprawdzanie aktualnych kursów walut
- Dostęp do archiwalnych kursów walut
- Wymiana walut (zakup/sprzedaż)
- Integracja z API NBP

## Obsługiwane waluty

- EUR (Euro)
- USD (Dolar amerykański)
- GBP (Funt brytyjski)
- JPY (Jen japoński)
- CHF (Frank szwajcarski)
- PLN (Polski złoty) - waluta bazowa

## Struktura projektu

```
currency-exchange-app/
├── backend/         # Serwer Node.js
├── mobile-app/      # Aplikacja React Native
└── README.md
```

## Wymagania systemowe

- Node.js (v14 lub wyższa)
- PostgreSQL (v13 lub wyższa)
- npm (v6 lub wyższa)
- Expo CLI (dla aplikacji mobilnej)

## Instalacja i uruchomienie backendu

1. Sklonuj repozytorium:
```bash
git clone [adres-repozytorium]
cd currency-exchange-app/backend
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skonfiguruj PostgreSQL:
- Zainstaluj PostgreSQL ze strony oficjalnej
- Uruchom PostgreSQL
- Utwórz nową bazę danych:
```sql
CREATE DATABASE currency_exchange;
```

4. Skonfiguruj zmienne środowiskowe:
- Skopiuj plik `.env.example` do `.env`
```bash
cp .env.example .env
```
- Uzupełnij plik `.env` swoimi danymi:
```env
DB_HOST=localhost
DB_USER=twoj_uzytkownik
DB_PASSWORD=twoje_haslo
DB_NAME=currency_exchange
DB_PORT=5432
JWT_SECRET=twoj_tajny_klucz
PORT=3000
```

5. Uruchom serwer:
```bash
npm run dev
```

Serwer powinien być dostępny pod adresem: `http://localhost:3000`