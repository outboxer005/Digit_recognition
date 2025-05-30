import io
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
import numpy as np
import tensorflow as tf

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
model = tf.keras.models.load_model("model_api/model/handwritten.h5")

@app.post("/predict")
async def predict_digit(file: UploadFile = File(...)):
    # Read image file
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("L")
    img = image.resize((28, 28))
    img = np.array(img, dtype='float32')
    img = img / 255.0
    img = img.reshape((1, 28, 28, 1))
    pred = model.predict(img)
    result = int(np.argmax(pred[0]))
    return {"prediction": result} 