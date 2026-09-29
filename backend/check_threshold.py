import pickle
import os

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
COMMITTEE_PATH = os.path.join(ARTIFACT_DIR, "committee.pkl")

try:
    with open(COMMITTEE_PATH, "rb") as f:
        bundle = pickle.load(f)
    print("Threshold:", bundle.get("threshold"))
    print("Members:", bundle.get("members"))
    print("Meta coef:", bundle.get("meta_coef"))
    print("Meta intercept:", bundle.get("meta_intercept"))
except Exception as e:
    print("Error:", e)