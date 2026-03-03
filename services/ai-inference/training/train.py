# training/train.py
# Purpose: Train a TF-IDF + Logistic Regression pipeline on the cleaned dataset
#          and persist the model to disk.

import os
import sys
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# ── Make the project root importable ────────────────────────
# training/ sits next to app/, so we add the parent (ai-inference/) to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.processors.text_cleaner import load_and_prepare

# ── Paths ───────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "app", "ml_models")
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")


def train():
    # 1. Load & split data
    print("Loading and cleaning data...")
    X_train, X_test, y_train, y_test = load_and_prepare()
    print(f"  Train samples: {len(X_train)}  |  Test samples: {len(X_test)}")

    # 2. Build pipeline: TF-IDF → Logistic Regression
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=50_000, ngram_range=(1, 2))),
        ("clf", LogisticRegression(max_iter=1000, C=1.0, solver="lbfgs")),
    ])

    # 3. Train
    print("Training TF-IDF + Logistic Regression...")
    pipeline.fit(X_train, y_train)

    # 4. Evaluate
    y_pred = pipeline.predict(X_test)
    accuracy  = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall    = recall_score(y_test, y_pred)
    f1        = f1_score(y_test, y_pred)

    print("\n── Evaluation Results ──────────────────────")
    print(f"  Accuracy:  {accuracy:.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall:    {recall:.4f}")
    print(f"  F1 Score:  {f1:.4f}")

    # 5. Save model
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")


if __name__ == "__main__":
    train()
