✅ Backend Steps 

Open VS Code.

Go to File → Open Folder and select:
C:\Users\devil\OneDrive\Desktop\BradBoard\Backend

Open a terminal in VS Code:
Terminal → New Terminal

Activate virtual environment:
.\venv\Scripts\activate

Run the backend server using FastAPI:
uvicorn app.main:app --reload

The backend will run at:
http://127.0.0.1:8000

✅ Frontend Steps 

Go to File → Open Folder and select:
C:\Users\devil\OneDrive\Desktop\BradBoard\FrontEnd

Open a terminal in VS Code:
Terminal → New Terminal

Make sure you are inside the folder that contains package.json.
If not, run:
cd C:\Users\devil\OneDrive\Desktop\BradBoard\FrontEnd

Install dependencies:
npm install

Start the frontend (Vite React):
npm run dev

Open the link shown in the terminal:
http://localhost:5173