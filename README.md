ERP Backend
A simplified ERP backend written in Spring Boot.
It exposes several REST APIs for journal entries, vouchers, trial balance
and closing periods. Data is stored in MySQL.

Features
Account management – list and create accounts.

Journal entries – post entries with detailed debit/credit lines and fetch all entries. Validates debit and credit totals before saving.

Voucher queries – retrieve voucher details or list all vouchers.

Trial balance – compute account balances in a date range.

Close period – lock a period and automatically insert reversing entries via a stored procedure.

Utilities – voucher number generation and open-date validation.

Project Structure
src/main/java/com/example/erp
├── controller  # REST controllers
├── dto         # Data transfer objects
├── entity      # JPA entities
├── repository  # Spring Data repositories
├── service     # Business services
└── util        # Utility classes
SQL scripts for schema and initial data are under sql/.

Setup
Create a MySQL database and run the scripts in sql/
(erp.sql, account.sql, reverse.sql).

Copy src/main/resources/application.properties.example
to src/main/resources/application.properties
and update the connection settings. The example shows typical options:

Start the application:

./mvnw spring-boot:run
The server runs on port 8080 by default.

REST API Overview
Method & Path	Description
GET /api/accounts	List available accounts.
POST /api/accounts	Create a new account.
GET /api/journal-entries	Fetch all journal entries.
POST /api/journal-entries	Create a journal entry with details.
GET /api/vouchers	List all vouchers.
GET /api/vouchers/{no}	Voucher details by number.
GET /api/trial-balance	Trial balance for today.
GET /api/trial-balance/{end}	Trial balance up to a specific date.
POST /api/close-period	Close an accounting period.
Some endpoints allow CORS from http://127.0.0.1:5500 for development.

Example JSON for Journal Entry
{
  "entryDate": "2025-07-31",
  "details": [
    {
      "accountCode": "1111000",
      "debit": 1000,
      "description": "Cash sale"
    },
    {
      "accountCode": "4001000",
      "credit": 1000,
      "description": "Revenue"
    }
  ]
}
Submit this to POST /api/journal-entries to create a balanced entry.

Notes
The application requires Java 21.

Voucher numbers follow the ROC calendar (year- month- day + sequence).

Closing a period inserts a summarizing retained-earnings entry and reverses revenue/expense lines using proc_reverse_virtual_entries.
