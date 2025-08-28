# Shibuya Co-creation Dashboard

A minimal FastAPI prototype demonstrating key endpoints for the Shibuya co-creation dashboard.

## API Overview

- `POST /news` – submit news items
- `POST /issue` – create an issue card with author and KPI info
- `POST /community/join` – join a community
- `GET /community` – list communities and member counts
- `GET /mypage/{user}` – show joined communities and number of issues created
- `GET /dashboard` – summary of news, issues, and communities

## Development

Install dependencies and run tests:

```bash
pip install -r requirements.txt
pytest
```

Run the local server:

```bash
uvicorn app:app --reload
```
