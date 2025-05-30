# Handwritten Digit Recognition

This is a full-stack application for recognizing handwritten digits using a deep learning model. The backend is built with **FastAPI** and Python, while the frontend is developed with **ReactJS**. The application serves a model that predicts digits from images and presents the interface for user interaction.

## Expected Deliverables:

-React frontend with drawing canvas and prediction display 

-Spring Boot backend with REST endpoints 

-CNN-based digit recognition model served via FastAPI 

-MySQL for storing predictions, JWT for authentication 

## 🧠 Backend - Model API (Python 3.9.13)

### Requirements

Make sure you have **Python 3.9.13** installed.

### Installation

1. Navigate to the `model_api` directory:

    ```bash
    cd model_api
    ```

2. Install the required dependencies:

    ```bash
    pip install -r requirements.txt
    ```

3. Start the FastAPI backend server:
create a new terimnal for the main project folder and use

    ```bash
    uvicorn model_api.App:app --reload
    ```

The backend will now be live on:  
📍 `http://127.0.0.1:8000`

You can access the interactive Swagger API docs at:  
🧪 `http://127.0.0.1:8000/docs`

---

## 🌐 Frontend - ReactJS

### Requirements

- Node.js
- npm (Node Package Manager)

### Installation & Running

1. Navigate to the `frontend` directory:

    ```bash
    cd frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm start
    ```

The frontend will be running at:  
🌍 `http://localhost:3000`

---

## 🛠️ Database Configuration (Optional)

To configure SQL database support for the backend, modify the appropriate resource files in your FastAPI backend (typically found in `application.resource` or a similarly named config module).

Make sure to:

- Set the database URL
- Run migrations if applicable
- Install any SQL database drivers needed

## 🚀 Features
- Deep learning model for digit recognition
- FastAPI-based REST API
- ReactJS frontend for image input and results
- Live predictions with smooth UI
- Modular backend with scalability in mind

---

## 🧪 Tech Stack

- Python 3.9.13
- FastAPI
- ReactJS
- Uvicorn
- NumPy, OpenCV, TensorFlow/Keras (depending on model)

---

## 📜 License

This project is open source and can be used by anyone for study and reasearch purposes
training model is acquired formt he mnist model
