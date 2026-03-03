# app/processors/text_cleaner.py
# Purpose: Pre-process raw article text before tokenisation:
#   - Strip HTML tags
#   - Remove special characters
#   - Normalise whitespace
#   - Truncate to MAX_SEQ_LENGTH tokens
