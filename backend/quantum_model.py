import pickle
import numpy as np
import pennylane as qml
from pennylane import numpy as pnp
from sklearn.svm import SVC

class QuantumModel:
    """
    Variational Quantum Classifier with data re-uploading.

    Architecture (repeated `layers` times):
      1. Encoding block: RY(pi * s_k * x_k) then RZ(s_k * x_k) on each qubit
         k. Both encodings are data-dependent; the second re-uploads the
         same input with a trainable per-qubit scale.
      2. Trainable block: per-qubit Rot followed by a CNOT ring.

    Readout: <Z_i> on every qubit, combined with trainable weights and a
    bias outside the tape.

    Training: full-batch squared loss on {-1, +1} targets, Adam with cosine
    annealing, backprop through default.qubit.
    """

    def __init__(
        self,
        n_qubits: int = 4,
        layers: int = 4,
        device: str = "default.qubit",
        epochs: int = 120,
        learning_rate: float = 0.15,
        l2: float = 0.003,
        input_scales: bool = True,
        seed: int = 42,
    ):
        self.n_qubits = n_qubits
        self.layers = layers
        self.device_name = device
        self.epochs = epochs
        self.learning_rate = learning_rate
        self.l2 = l2
        self.input_scales = input_scales
        self.seed = seed
        self.weights = None
        self.out_weights = None
        self.bias = 0.0
        self.scales = None
        self.dev = qml.device(self.device_name, wires=self.n_qubits)

        @qml.qnode(self.dev, interface="autograd", diff_method="backprop")
        def circuit(X, weights, input_scales):
            for layer in range(self.layers):
                # Encoding block: re-upload the input twice per layer with
                # trainable scales - RY(pi * s_k * x_k) then RZ(s_k * x_k).
                qml.AngleEmbedding(
                    np.pi * input_scales * X,
                    wires=range(self.n_qubits),
                    rotation="Y",
                )
                qml.AngleEmbedding(
                    input_scales * X,
                    wires=range(self.n_qubits),
                    rotation="Z",
                )
                # Trainable block: general single-qubit rotations followed
                # by a CNOT entanglement ring.
                for i in range(self.n_qubits):
                    qml.Rot(
                        weights[layer, i, 0],
                        weights[layer, i, 1],
                        weights[layer, i, 2],
                        wires=i,
                    )
                if self.n_qubits > 1:
                    for i in range(self.n_qubits):
                        qml.CNOT(wires=[i, (i + 1) % self.n_qubits])
            return [qml.expval(qml.PauliZ(i)) for i in range(self.n_qubits)]

        self.circuit = circuit

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------
    def fit(self, X, y, verbose: bool = True):
        X = np.asarray(X, dtype=float)
        y = np.asarray(y, dtype=float)
        y_target = 2.0 * y - 1.0
        rng = np.random.default_rng(self.seed)

        initial_weights = rng.uniform(
            -np.pi, np.pi, (self.layers, self.n_qubits, 3)
        )
        self.weights = pnp.array(initial_weights, requires_grad=True)
        self.out_weights = pnp.array(
            rng.normal(0.0, 0.5, self.n_qubits), requires_grad=True
        )
        self.bias = pnp.array(0.0, requires_grad=True)
        if self.input_scales:
            self.scales = pnp.array(
                rng.uniform(0.8, 1.2, self.n_qubits), requires_grad=True
            )
        else:
            self.scales = pnp.array(
                np.ones(self.n_qubits), requires_grad=False
            )

        def _combine(expectations, out_weights, bias):
            stacked = pnp.stack(expectations, axis=1)
            return stacked @ out_weights + bias

        def loss(weights, out_weights, bias, scales):
            predictions = _combine(
                self.circuit(X, weights, scales), out_weights, bias
            )
            mse = pnp.mean((predictions - y_target) ** 2)
            l2_penalty = self.l2 * (
                pnp.sum(weights ** 2) + pnp.sum(out_weights ** 2)
            )
            return mse + l2_penalty

        optimizer = qml.AdamOptimizer(stepsize=self.learning_rate)
        if verbose:
            print(
                f"  Training quantum circuit ({self.n_qubits} qubits, "
                f"{self.layers} re-uploading layers) for {self.epochs} epochs..."
            )
        for epoch in range(self.epochs):
            progress = epoch / max(1, self.epochs - 1)
            optimizer.stepsize = 0.01 * self.learning_rate + 0.5 * 0.99 * self.learning_rate * (
                1.0 + np.cos(np.pi * progress)
            )
            updated_params, current_loss = optimizer.step_and_cost(
                loss, self.weights, self.out_weights, self.bias, self.scales
            )
            self.weights, self.out_weights, self.bias, self.scales = updated_params
            if verbose and (epoch + 1) % max(1, self.epochs // 6) == 0:
                train_acc = float(
                    np.mean((self.predict(X) == y.astype(int)))
                )
                print(
                    f"    Epoch {epoch + 1}/{self.epochs} - "
                    f"Loss: {float(current_loss):.4f} - Train acc: {train_acc:.3f}"
                )
        return self

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------
    def _raw_predictions(self, X):
        X = np.asarray(X, dtype=float)
        expectations = self.circuit(X, self.weights, self.scales)
        return np.asarray(
            pnp.stack(expectations, axis=1) @ self.out_weights + self.bias
        )

    def predict_proba(self, X):
        raw = self._raw_predictions(X)
        probabilities = np.clip((raw + 1.0) / 2.0, 0.0, 1.0)
        return np.column_stack([1.0 - probabilities, probabilities])

    def predict(self, X):
        probabilities = self.predict_proba(X)
        return (probabilities[:, 1] >= 0.5).astype(int)

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------
    def save_model(self, path: str):
        data = {
            "n_qubits": self.n_qubits,
            "layers": self.layers,
            "device": self.device_name,
            "weights": np.asarray(self.weights),
            "out_weights": np.asarray(self.out_weights),
            "bias": float(self.bias),
            "scales": np.asarray(self.scales),
        }
        with open(path, "wb") as f:
            pickle.dump(data, f)

    @classmethod
    def load_model(cls, path: str):
        with open(path, "rb") as f:
            data = pickle.load(f)
        instance = cls(
            n_qubits=data["n_qubits"],
            layers=data["layers"],
            device=data["device"],
        )
        instance.weights = pnp.array(data["weights"], requires_grad=False)
        instance.out_weights = pnp.array(
            data["out_weights"], requires_grad=False
        )
        instance.bias = data["bias"]
        if data.get("scales") is not None:
            instance.scales = pnp.array(data["scales"], requires_grad=False)
        return instance

class QuantumEnsemble:
    """Bagged ensemble of data re-uploading VQCs."""

    def __init__(
        self,
        n_qubits: int = 4,
        layers: int = 4,
        n_members: int = 5,
        device: str = "default.qubit",
        epochs: int = 120,
        learning_rate: float = 0.15,
        l2: float = 0.003,
        input_scales: bool = True,
        seed: int = 42,
    ):
        self.n_qubits = n_qubits
        self.layers = layers
        self.n_members = n_members
        self.device_name = device
        self.epochs = epochs
        self.learning_rate = learning_rate
        self.l2 = l2
        self.input_scales = input_scales
        self.seed = seed
        self.members = []

    def fit(self, X, y, verbose: bool = True):
        X = np.asarray(X, dtype=float)
        y = np.asarray(y, dtype=float)
        n = X.shape[0]
        rng = np.random.default_rng(self.seed)
        self.members = []
        for m in range(self.n_members):
            member_seed = int(rng.integers(0, 2 ** 31 - 1))
            idx = rng.integers(0, n, n)
            if verbose:
                print(f"    [ensemble {m + 1}/{self.n_members}] seed={member_seed}")
            member = QuantumModel(
                n_qubits=self.n_qubits,
                layers=self.layers,
                device=self.device_name,
                epochs=self.epochs,
                learning_rate=self.learning_rate,
                l2=self.l2,
                input_scales=self.input_scales,
                seed=member_seed,
            )
            member.fit(X[idx], y[idx], verbose=False)
            self.members.append(member)
        return self

    def predict_proba(self, X):
        probas = np.mean([m.predict_proba(X) for m in self.members], axis=0)
        return probas

    def predict(self, X):
        return (self.predict_proba(X)[:, 1] >= 0.5).astype(int)

    def save_model(self, path: str):
        data = {
            "model_type": "QuantumEnsemble",
            "n_qubits": self.n_qubits,
            "layers": self.layers,
            "device": self.device_name,
            "members": [
                {
                    "seed": m.seed,
                    "weights": np.asarray(m.weights),
                    "out_weights": np.asarray(m.out_weights),
                    "bias": float(m.bias),
                    "scales": np.asarray(m.scales),
                }
                for m in self.members
            ],
        }
        with open(path, "wb") as f:
            pickle.dump(data, f)

    @classmethod
    def load_model(cls, path: str):
        with open(path, "rb") as f:
            data = pickle.load(f)
        instance = cls(
            n_qubits=data["n_qubits"],
            layers=data["layers"],
            device=data["device"],
            n_members=len(data["members"]),
        )
        instance.members = []
        for m in data["members"]:
            member = QuantumModel(
                n_qubits=data["n_qubits"],
                layers=data["layers"],
                device=data["device"],
                seed=m["seed"],
            )
            member.weights = pnp.array(m["weights"], requires_grad=False)
            member.out_weights = pnp.array(
                m["out_weights"], requires_grad=False
            )
            member.bias = m["bias"]
            member.scales = pnp.array(m["scales"], requires_grad=False)
            instance.members.append(member)
        return instance

class QuantumKernelClassifier:
    """
    Quantum kernel SVM with a projective (fidelity) kernel.

    K(x, x') = |<phi(x)|phi(x')>|^2 where phi(x) is a data re-uploading
    feature map. Trains an SVC on the precomputed kernel matrix.
    """

    def __init__(
        self,
        n_qubits: int = 4,
        layers: int = 4,
        device: str = "default.qubit",
        C: float = 1.0,
        seed: int = 42,
    ):
        self.n_qubits = n_qubits
        self.layers = layers
        self.device_name = device
        self.C = C
        self.seed = seed
        self._X_train = None
        self._K_train = None
        self._svc = None
        self.scales = pnp.array(np.ones(self.n_qubits), requires_grad=False)
        self.dev = qml.device(self.device_name, wires=self.n_qubits)

        def feature_map(x, scales):
            for layer in range(self.layers):
                qml.AngleEmbedding(
                    np.pi * scales * x,
                    wires=range(self.n_qubits),
                    rotation="Y",
                )
                # Data-dependent re-upload on Z (was: constant 0.5).
                qml.AngleEmbedding(
                    scales * x,
                    wires=range(self.n_qubits),
                    rotation="Z",
                )
                for i in range(self.n_qubits):
                    qml.CNOT(wires=[i, (i + 1) % self.n_qubits])

        @qml.qnode(self.dev, interface="numpy")
        def state_qnode(x, scales):
            feature_map(x, scales)
            return qml.state()

        self._state_qnode = state_qnode

    def _states(self, X):
        X = np.asarray(X, dtype=float)
        return np.array([np.asarray(self._state_qnode(x, self.scales)) for x in X])

    def _kernel(self, X1, X2):
        S1 = self._states(X1)
        S2 = self._states(X2)
        inner = S1 @ S2.conj().T
        return np.abs(inner) ** 2

    def kernel_matrix(self, X1, X2):
        return self._kernel(X1, X2)

    def fit(self, X, y, verbose: bool = True):
        X = np.asarray(X, dtype=float)
        y = np.asarray(y)
        if verbose:
            print(
                f"  Computing quantum kernel matrix "
                f"({X.shape[0]} x {X.shape[0]})..."
            )
        K = self._kernel(X, X)
        K = (K + K.T) / 2.0
        self._K_train = K
        self._svc = SVC(
            kernel="precomputed", C=self.C, probability=True, random_state=self.seed
        )
        self._svc.fit(K, y)
        self._X_train = X
        if verbose:
            print(f"  Quantum kernel SVM fitted (C={self.C}).")
        return self

    def fit_from_kernel(self, K, y, C):
        if self._X_train is None:
            raise ValueError("call fit() first to establish the training set")
        y = np.asarray(y)
        self.C = C
        self._svc = SVC(
            kernel="precomputed", C=C, probability=True, random_state=self.seed
        )
        self._svc.fit(K, y)
        return self

    def predict_proba(self, X):
        X = np.asarray(X, dtype=float)
        K_test = self._kernel(X, self._X_train)
        return self._svc.predict_proba(K_test)

    def predict(self, X):
        return (self.predict_proba(X)[:, 1] >= 0.5).astype(int)

    def save_model(self, path: str):
        data = {
            "model_type": "QuantumKernelClassifier",
            "n_qubits": self.n_qubits,
            "layers": self.layers,
            "device": self.device_name,
            "C": self.C,
            "X_train": self._X_train,
            "svc": self._svc,
        }
        with open(path, "wb") as f:
            pickle.dump(data, f)

    @classmethod
    def load_model(cls, path: str):
        with open(path, "rb") as f:
            data = pickle.load(f)
        instance = cls(
            n_qubits=data["n_qubits"],
            layers=data["layers"],
            device=data["device"],
            C=data["C"],
        )
        instance._X_train = data["X_train"]
        instance._svc = data["svc"]
        return instance

if __name__ == "__main__":
    print("=" * 50)
    print("Testing QuantumModel (data re-uploading VQC)")
    print("=" * 50)
    rng = np.random.default_rng(0)
    X0 = rng.normal(-1.0, 0.4, (20, 4))
    X1 = rng.normal(+1.0, 0.4, (20, 4))
    X = np.vstack([X0, X1])
    X = (X - X.min()) / (X.max() - X.min())
    y = np.array([0] * 20 + [1] * 20)
    print("Creating model...")
    model = QuantumModel(n_qubits=4, layers=4, epochs=40, l2=0.0)
    model.fit(X, y)
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)
    acc = np.mean(predictions == y)
    print(f"\nSelf-test accuracy on separable data: {acc:.3f}")
    assert acc >= 0.9, "VQC failed to fit trivially separable data!"
    print("Predictions:", predictions)
    print("\nProbabilities (first 5):")
    print(probabilities[:5])
    print("\nQuantumModel test successful!")
