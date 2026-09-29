import pickle
import os

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
COMMITTEE_PATH = os.path.join(ARTIFACT_DIR, "committee.pkl")

with open(COMMITTEE_PATH, "rb") as f:
    bundle = pickle.load(f)
print(bundle.get("threshold"))