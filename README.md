# AI Automated Testing Workflow Prototype

This project is a minimum viable prototype for validating an AI-driven automated software testing workflow.

The current version uses a React frontend, Flask backend, and SQLite database to implement a simple user registration and login system.

## Project Goals

The project is designed to validate the following testing workflow:

1. PRD requirement input
2. Structured requirement analysis
3. Test case generation
4. Manual and automated test execution
5. Test result analysis
6. Test report generation
7. Bug report generation

## Current Features

- User registration
- User login
- SQLite user data storage
- Duplicate username validation
- Login error handling
- Login status storage
- Protected welcome page
- Logout function

## Technology Stack

### Frontend

- React
- Vite
- Axios
- React Router
- Ant Design

### Backend

- Python
- Flask
- SQLite

## Project Structure

```text
AI_Testing_Plugin_Project/
├── backend/
│   ├── app.py
│   ├── database.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Run the Backend

Enter the backend folder:

```bash
cd backend
```

Create and activate a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Start the Flask server:

```bash
python app.py
```

The backend will run at:

```text
http://127.0.0.1:5000
```

## Run the Frontend

Open another terminal and enter the frontend folder:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

## Intentional Test Bug

The product requirement states that a username must contain at least 6 characters.

However, the current registration implementation intentionally does not validate the minimum username length.

Example:

```text
Username: q7x
Password: 123456
```

Expected result:

```text
Registration should fail.
```

Actual result:

```text
Registration succeeds.
```

This intentional defect will be used to demonstrate requirement analysis, test case generation, automated testing, test reporting, and Bug report generation.

## Important Note

This project is only a testing prototype and is not intended for production use.

Passwords are currently stored as plain text in SQLite to keep the Demo simple. A production system must use secure password hashing and stronger authentication mechanisms.