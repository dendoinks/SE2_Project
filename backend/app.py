from flask import Flask, request, jsonify, render_template
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
from pathlib import Path
import os

# Tell Flask where to find templates and static files relative to backend/
app = Flask(
    __name__,
    template_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), '../templates')),
    static_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), '../static'))
)

# Load model and tokenizer
MODEL_PATH = Path("C:/Users/User/OneDrive/Documents/FakeNewsDetector/saved_model_roberta")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

# Label mapping (adjust to match your model training)
labels = ["real", "fake"]

# A function to generate applicable explanations for specific inputs in Tagalog but return reasons in English
def generate_explanation(prediction, text):
    explanation = []
    
    # If the prediction is 'real'
    if prediction == "real":
        # Check if the text cites credible sources (Tagalog logic)
        if "pinagmulan" in text.lower() or "source" in text.lower():
            explanation.append("The content cites credible sources.")
        if "nagsagawa ng pagsusuri" in text.lower():
            explanation.append("The content is fact-checked and verified.")
        if "pananaliksik" in text.lower():
            explanation.append("The content is backed by research and factual information.")
        # General real content reasons
        if not explanation:
            explanation.append("The content is factual and doesn't use manipulative language.")
    
    # If the prediction is 'fake'
    elif prediction == "fake":
        # Check for common fake news patterns (Tagalog logic)
        if "clickbait" in text.lower() or "nakakagulat" in text.lower() or "huwag paniwalaan" in text.lower():
            explanation.append("The content uses clickbait or sensational language.")
        if "walang ebidensya" in text.lower() or "hindi napatunayan" in text.lower():
            explanation.append("The content lacks credible sources or evidence.")
        if "tsismis" in text.lower() or "teoryang konspirasyon" in text.lower():
            explanation.append("The content promotes unverified rumors or conspiracy theories.")
        if "paggamit ng takot" in text.lower() or "takot mong magalit" in text.lower():
            explanation.append("The content uses fearmongering or emotional manipulation.")
        # General fake content reasons
        if not explanation:
            explanation.append("The content is misleading or unverifiable.")

    # If no explanation has been added, provide a fallback message
    if not explanation:
        explanation.append("No clear reason available, further review needed.")

    return explanation

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/analyze-text", methods=["POST"])
def analyze_text():
    data = request.json
    text = data.get("text", "").strip()
    link = data.get("link", "").strip()

    if not text:
        return jsonify({"error": "Text input is required for analysis."}), 400

    # Tokenize the input text and get the model prediction
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=1)
        confidence, predicted = torch.max(probs, dim=1)

    # Get the prediction label
    prediction_label = labels[predicted.item()]

    # Generate specific explanation based on prediction and text
    explanation = generate_explanation(prediction_label, text)

    # Construct the response with prediction, confidence, and explanation
    response = {
        "prediction": prediction_label,
        "confidence": confidence.item(),
        "explanation": explanation,
        "sources": [link] if link else []
    }
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
