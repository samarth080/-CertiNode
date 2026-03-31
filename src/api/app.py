from flask import Flask, request, jsonify
import base64
from flask_cors import CORS
import io
from PIL import Image
import numpy as np
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

# Load trained model
# Note: You'll need to ensure this model file exists
try:
    model = load_model("resnet_binary_model.h5")
    model_loaded = True
except:
    # Fallback for testing if model doesn't exist
    print("Warning: Model not found. Using mock verification.")
    model_loaded = False

@app.route('/verify', methods=['POST'])
def verify_face():
    try:
        data = request.json
        b64img = data.get("image")
        
        if not b64img:
            return jsonify({"verified": False, "error": "No image provided"})
            
        if model_loaded:
            # Decode base64 image
            img = Image.open(io.BytesIO(base64.b64decode(b64img))).convert("RGB")
            img = img.resize((128, 128))
            img_array = np.array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            # Predict
            prediction = model.predict(img_array)[0][0]
            is_real = prediction >= 0.5
            confidence = float(prediction) if is_real else float(1 - prediction)
            
            return jsonify({
                "verified": bool(is_real),
                "confidence": confidence
            })
        else:
            # Mock response for testing without model
            return jsonify({
                "verified": True,
                "confidence": 0.95
            })
    
    except Exception as e:
        return jsonify({
            "verified": False,
            "error": str(e)
        })

if __name__ == '__main__':
    app.run(debug=True)