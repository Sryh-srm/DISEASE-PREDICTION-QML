import pickle
f = open('artifacts/committee.pkl', 'rb')
data = pickle.load(f)
f.close()
print(data['threshold'])