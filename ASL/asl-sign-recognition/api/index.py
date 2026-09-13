import os
import sys
# Add the api directory to the module search path for Vercel Serverless
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import get_bot_response
from dotenv import load_dotenv
from spellchecker import SpellChecker

load_dotenv()

app = Flask(__name__)
CORS(app)

spell = SpellChecker()

@app.route("/api/health")
def health():
    return jsonify({"status": "healthy", "service": "ASL Vocalize Backend"}), 200

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        message = data.get("message", "")
        reply = get_bot_response(message)
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": "I'm having a bit of trouble thinking right now.", "error": str(e)}), 500

@app.route("/api/autocorrect", methods=["POST"])
def autocorrect():
    try:
        data = request.get_json()
        text = data.get("text", "").strip()
        if not text:
            return jsonify({"corrected": text})

        words = text.upper().split()
        corrected_words = []
        for word in words:
            best = spell.correction(word.lower())
            corrected_words.append(best.upper() if best else word)
        
        return jsonify({"corrected": " ".join(corrected_words)})
    except Exception as e:
        return jsonify({"corrected": text, "error": str(e)}), 500

@app.route("/api/predict", methods=["POST"])
def predict_deprecated():
    return jsonify({"error": "Deprecated. Prediction is now client-side."}), 410

# Note: /model-stats route is preserved but simplified
@app.route("/api/model-stats")
def model_stats():
    return jsonify({
        "accuracy": 93.5,
        "val_accuracy": 88.2,
        "epochs": 40,
        "architecture": "CNN"
    })

# Vercel needs 'app'