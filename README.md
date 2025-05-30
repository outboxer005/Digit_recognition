✍️ Handwritten Digit Recognition
A full-stack AI web app that recognizes handwritten digits with a deep learning model trained on the MNIST dataset.

Backend: FastAPI (Python 3.9.13)

Frontend: ReactJS

Model: TensorFlow/Keras on MNIST

🚀 Quick Start
bash
Copy
Edit
# Backend
cd model_api
pip install -r requirements.txt
uvicorn App:app --reload

# Frontend
cd frontend
npm install
npm start
Backend: http://127.0.0.1:8000

Swagger UI: http://127.0.0.1:8000/docs

Frontend: http://localhost:3000

🗂️ Repository Structure
├── model_api/                  # FastAPI backend
│   ├── App.py                  # Entry point
│   ├── requirements.txt        # Python deps (FastAPI, TensorFlow, numpy, opencv, etc.)
│   ├── models/                 # Trained MNIST model files
│   └── application/            # Resource & config modules
│       └── resource.py         # DB & other configs
│
├── frontend/                   # ReactJS client
│   ├── public/
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── App.jsx             # Main app
│   │   └── index.js
│   ├── package.json
│   └── ...                     
│
├── .gitignore
├── README.md                   # This file
└── LICENSE                     # Open source license
🛠️ Technologies
Backend:

FastAPI, Uvicorn

TensorFlow/Keras (MNIST)

NumPy, OpenCV

Frontend:

ReactJS, HTML5 Canvas for drawing

Fetch API for requests

🔍 Features
Draw digits in-browser (canvas)

Real-time prediction via REST API

Interactive Swagger docs

Modular, easily extendable architecture

📜 License
This project is free to use and research. No license restrictions.
