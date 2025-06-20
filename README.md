# Spillzy

Spillzy is an AI-powered gossip-loving bestie designed to react to news and user prompts in a Gen Z style. It leverages a Django backend for API handling and a React frontend for the user interface. User information and chat history are managed using cookies.

## Project Structure

- `spillzy_django/`: Django backend application.
- `spillzy_app/`: Django app containing the core logic for AI interaction.
- `spillzy_frontend/`: React frontend application.
- `.env`: Environment variables for API keys and other configurations.


### Prerequisites

- Python 3.8+
- Node.js (LTS recommended)
- bun (or npm/yarn)
- Vite

### Backend Setup (Django)

1.  **Navigate to the project root:**

2.  **Create a Python virtual environment (if you haven't already):**
    ```bash
    python -m venv venv
    ```

3.  **Activate the virtual environment:**
    ```bash
    .\venv\Scripts\activate
    ```

4.  **Install backend dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Set up environment variables:**
    Create a `.env` file in the project root and add your Google API Key and Django API URL:
    ```
    GOOGLE_API_KEY=your_google_api_key_here
    DJANGO_API_URL=http://localhost:8000/api/chat/
    ```

6.  **Run Django migrations:**
    ```bash
    python manage.py migrate
    ```

### Frontend Setup (React)

1.  **Navigate to the frontend directory:**

2.  **Install frontend dependencies using bun:**
    ```bash
    bun install
    ```
    (If you don't have bun, you can use `npm install` or `yarn install`)

## Running the Application

### Start the Django Backend

1.  **Navigate back to the project root:**

2.  **Activate your virtual environment:**
    ```bash
    .\venv\Scripts\activate
    ```

3.  **Run the Django development server:**
    ```bash
    python manage.py runserver
    ```
    The backend will typically run on `http://localhost:8000/`.

### Start the React Frontend

1.  **Open a new terminal and navigate to the frontend directory:**

2.  **Start the React development server:**
    ```bash
    bun dev
    ```
    (Or `npm run dev` / `yarn dev`)
    The frontend will typically open in your browser at `http://localhost:5173/` (or another available port).

Now you should have both the backend and frontend running, and you can interact with the Spillzy AI.