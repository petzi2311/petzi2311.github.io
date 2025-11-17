// Sehr einfacher SPA-Controller mit LocalStorage und JSON-Export

(function () {
    const TOTAL_STEPS = 15;
    let currentStep = 0;
    const STORAGE_KEY = "pit_hessen_draft";

    const views = document.querySelectorAll(".view");
    const stepItems = document.querySelectorAll(".step-item");
    const stepIndicator = document.getElementById("stepIndicator");
    const saveStatus = document.getElementById("saveStatus");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const saveBtn = document.getElementById("saveBtn");
    const exportBtn = document.getElementById("exportBtn");
    const exportModal = document.getElementById("exportModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const exportOutput = document.getElementById("exportOutput");

    function showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= TOTAL_STEPS) return;

        currentStep = stepIndex;

        views.forEach(view => {
            const step = parseInt(view.dataset.step, 10);
            view.classList.toggle("active", step === stepIndex);
        });

        stepItems.forEach(item => {
            const step = parseInt(item.dataset.step, 10);
            item.classList.toggle("active", step === stepIndex);
        });

        stepIndicator.textContent = `Schritt ${stepIndex + 1} von ${TOTAL_STEPS}`;
        prevBtn.disabled = stepIndex === 0;
        nextBtn.disabled = stepIndex === TOTAL_STEPS - 1;
    }

    function collectFormData() {
        const data = {
            meta: {
                version: "1.0.0",
                title: "PiT Hessen – Bedarfsermittlung & Teilhabeplanung",
                generatedAt: new Date().toISOString()
            },
            steps: {}
        };

        views.forEach(view => {
            const stepIndex = parseInt(view.dataset.step, 10);
            const inputs = view.querySelectorAll("input, textarea, select");
            const stepKey = `step_${String(stepIndex + 1).padStart(2, "0")}`;
            data.steps[stepKey] = {};

            inputs.forEach(el => {
                const name = el.name || el.id;
                if (!name) return;

                if (el.type === "checkbox") {
                    data.steps[stepKey][name] = el.checked;
                } else {
                    data.steps[stepKey][name] = el.value;
                }
            });
        });

        return data;
    }

    function applyFormData(data) {
        if (!data || !data.steps) return;

        views.forEach(view => {
            const stepIndex = parseInt(view.dataset.step, 10);
            const stepKey = `step_${String(stepIndex + 1).padStart(2, "0")}`;
            const stepData = data.steps[stepKey];

            if (!stepData) return;

            const inputs = view.querySelectorAll("input, textarea, select");
            inputs.forEach(el => {
                const name = el.name || el.id;
                const value = stepData[name];

                if (typeof value === "undefined") return;

                if (el.type === "checkbox") {
                    el.checked = Boolean(value);
                } else {
                    el.value = value;
                }
            });
        });
    }

    function saveToLocalStorage(showFeedback = true) {
        const data = collectFormData();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            if (showFeedback) {
                saveStatus.textContent = "Gespeichert (LocalStorage)";
                saveStatus.style.background = "rgba(22, 163, 74, 0.2)";
            }
        } catch (e) {
            console.warn("Konnte nicht in LocalStorage speichern:", e);
            if (showFeedback) {
                saveStatus.textContent = "Speichern fehlgeschlagen";
                saveStatus.style.background = "rgba(185, 28, 28, 0.35)";
            }
        }
    }

    function loadFromLocalStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            applyFormData(data);
            saveStatus.textContent = "Entwurf geladen";
        } catch (e) {
            console.warn("Konnte LocalStorage nicht lesen:", e);
        }
    }

    function exportAsJson() {
        const data = collectFormData();
        exportOutput.value = JSON.stringify(data, null, 2);
        exportModal.classList.remove("hidden");
    }

    // Event-Handler
    stepItems.forEach(item => {
        item.addEventListener("click", () => {
            const step = parseInt(item.dataset.step, 10);
            showStep(step);
        });
    });

    prevBtn.addEventListener("click", () => {
        showStep(currentStep - 1);
    });

    nextBtn.addEventListener("click", () => {
        showStep(currentStep + 1);
    });

    saveBtn.addEventListener("click", () => {
        saveToLocalStorage(true);
    });

    exportBtn.addEventListener("click", () => {
        saveToLocalStorage(false);
        exportAsJson();
    });

    closeModalBtn.addEventListener("click", () => {
        exportModal.classList.add("hidden");
    });

    exportModal.addEventListener("click", (event) => {
        if (event.target === exportModal) {
            exportModal.classList.add("hidden");
        }
    });

    // Auto-Save on input change (dezent)
    views.forEach(view => {
        view.addEventListener("change", () => {
            saveToLocalStorage(false);
        });
    });

    // Init
    loadFromLocalStorage();
    showStep(0);
})();
