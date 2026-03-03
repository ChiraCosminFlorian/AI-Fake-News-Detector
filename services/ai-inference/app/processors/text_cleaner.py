# app/processors/text_cleaner.py
# Purpose: Load, merge, clean, and split the Fake/True CSV datasets for training.

import re
import os
import pandas as pd
from sklearn.model_selection import train_test_split

# Resolve the path to the data/ directory relative to this file
DATA_DIR = os.path.join(
    os.path.dirname(__file__),  # …/app/processors
    "..",                       # …/app
    "..",                       # …/ai-inference
    "data",                     # …/ai-inference/data
)


def clean_text(text: str) -> str:
    """Apply all cleaning steps to a single text string."""
    text = text.lower()                          # lowercase
    text = re.sub(r"https?://\S+|www\.\S+", "", text)  # remove URLs
    text = re.sub(r"[^\w\s]", "", text)          # remove punctuation
    text = re.sub(r"\s+", " ", text).strip()     # collapse whitespace
    return text


def load_and_prepare(data_dir: str = DATA_DIR,
                     test_size: float = 0.2,
                     random_state: int = 42):
    """
    Load Fake.csv and True.csv, merge, clean, and split.

    Returns
    -------
    X_train, X_test, y_train, y_test
        Train/test splits where X is the cleaned text column
        and y is the label (0 = real, 1 = fake).
    """
    # ── 1. Load CSVs ────────────────────────────────────────
    fake_df = pd.read_csv(os.path.join(data_dir, "Fake.csv"))
    true_df = pd.read_csv(os.path.join(data_dir, "True.csv"))

    # ── 2. Label: 1 = fake, 0 = real ───────────────────────
    fake_df["label"] = 1
    true_df["label"] = 0

    # ── 3. Merge into a single dataframe ────────────────────
    df = pd.concat([fake_df, true_df], ignore_index=True)

    # ── 4. Clean the text column ────────────────────────────
    df["text"] = df["text"].astype(str).apply(clean_text)

    # ── 5. 80 / 20 train-test split ────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        df["text"],
        df["label"],
        test_size=test_size,
        random_state=random_state,
        stratify=df["label"],
    )

    return X_train, X_test, y_train, y_test


# Quick sanity check when run directly
if __name__ == "__main__":
    X_train, X_test, y_train, y_test = load_and_prepare()
    print(f"Train size: {len(X_train)}  |  Test size: {len(X_test)}")
    print(f"Train label distribution:\n{y_train.value_counts()}")
    print(f"\nSample cleaned text:\n{X_train.iloc[0][:200]}...")
