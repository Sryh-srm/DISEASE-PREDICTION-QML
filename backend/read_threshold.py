import os
import pickle

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
COMMITTEE_PATH = os.path.join(ARTIFACT_DIR, "committee.pkl")

with open(COMMITTEE_PATH, "rb") as f:
    bundle = pickle.load(f)

print("Bundle keys:", list(bundle.keys()))
threshold = bundle.get("threshold", 0.5)
print("Threshold:", threshold)
print("Threshold type:", type(threshold))