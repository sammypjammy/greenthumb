const plantForm = document.getElementById("plant-form");
const plantCards = document.getElementById("plant-cards");
const statusFilter = document.getElementById("status-filter");
const sortMenu = document.getElementById("sort-menu");
const sortMenuTrigger = document.getElementById("sort-menu-trigger");
const sortOptionButtons = Array.from(document.querySelectorAll(".sort-option-btn"));
const plantTagInputs = Array.from(document.querySelectorAll('input[name="plantTags"]'));
const plantCountSummary = document.getElementById("plant-count-summary");
const summaryTotalPlants = document.getElementById("summary-total-plants");
const summaryNeedsWater = document.getElementById("summary-needs-water");
const summaryOverdue = document.getElementById("summary-overdue");
const expandAllButton = document.getElementById("expand-all-btn");
const collapseAllButton = document.getElementById("collapse-all-btn");
const plantTypeSuggestions = document.getElementById("plant-type-suggestions");
const plantPickerSearch = document.getElementById("plant-picker-search");
const plantPickerResults = document.getElementById("plant-picker-results");
const plantAutofillStatus = document.getElementById("plant-autofill-status");
const manualEntryButton = document.getElementById("manual-entry-btn");
const lightNeedsInput = document.getElementById("light-needs");
const wateringNeedsInput = document.getElementById("watering-needs");
const wateringFrequencyInput = document.getElementById("watering-frequency");
const manualOnlyFields = Array.from(document.querySelectorAll(".manual-only-field"));
const featureCards = document.querySelectorAll(".feature-card[data-feature]");
const featureModal = document.getElementById("feature-modal");
const featureModalClose = document.getElementById("feature-modal-close");
const featureModalTitle = document.getElementById("feature-modal-title");
const featureModalText = document.getElementById("feature-modal-text");
const featureModalEmoji = document.getElementById("feature-modal-emoji");
const quizPreviewTrigger = document.getElementById("quiz-preview-trigger");
const trackerScrollTriggers = document.querySelectorAll('a[href="#tracker"]');
const trackerSection = document.getElementById("tracker");
const quizModal = document.getElementById("quiz-modal");
const quizModalClose = document.getElementById("quiz-modal-close");
const plantSubmitButton = plantForm ? plantForm.querySelector('button[type="submit"]') : null;
const EMPTY_STATE_TEXT = "No plants saved yet. Add your first plant above.";
const STORAGE_KEY = "greenThumbPlants";
const SORT_STORAGE_KEY = "greenThumbPlantSort";
let plants = [];
let activeFilter = "All Plants";
let activeSort = "newest_added";
let selectedPlantProfile = null;
let editingPlantId = null;
let isManualEntryMode = false;
const DEFAULT_PICKER_RESULTS = 6;
const MAX_PICKER_RESULTS = 10;

function updateExpandCollapseControls() {
    if (!expandAllButton || !collapseAllButton) {
        return;
    }

    const cards = Array.from(plantCards.querySelectorAll(".plant-card"));
    if (cards.length === 0) {
        expandAllButton.style.display = "none";
        collapseAllButton.style.display = "none";
        return;
    }

    const expandedCount = cards.filter(function (card) {
        return card.classList.contains("expanded");
    }).length;

    const hasCollapsedCards = expandedCount < cards.length;
    const hasExpandedCards = expandedCount > 0;

    expandAllButton.style.display = hasCollapsedCards ? "inline-flex" : "none";
    collapseAllButton.style.display = hasExpandedCards ? "inline-flex" : "none";
}

const plantDatabase = [
    { id: "pothos-golden", commonName: "Pothos", scientificName: "Epipremnum aureum", lightNeed: "bright_indirect", wateringNeed: "when_top_1_inch_dry", humidityNeed: "average", difficulty: "easy", petSafe: false },
    { id: "snake-plant", commonName: "Snake Plant", scientificName: "Dracaena trifasciata", lightNeed: "medium", wateringNeed: "when_fully_dry", humidityNeed: "low", difficulty: "easy", petSafe: false },
    { id: "monstera-deliciosa", commonName: "Monstera Deliciosa", scientificName: "Monstera deliciosa", lightNeed: "bright_indirect", wateringNeed: "when_top_1_inch_dry", humidityNeed: "high", difficulty: "moderate", petSafe: false },
    { id: "zz-plant", commonName: "ZZ Plant", scientificName: "Zamioculcas zamiifolia", lightNeed: "low", wateringNeed: "when_fully_dry", humidityNeed: "low", difficulty: "easy", petSafe: false },
    { id: "spider-plant", commonName: "Spider Plant", scientificName: "Chlorophytum comosum", lightNeed: "bright_indirect", wateringNeed: "weekly", humidityNeed: "average", difficulty: "easy", petSafe: true },
    { id: "peace-lily", commonName: "Peace Lily", scientificName: "Spathiphyllum wallisii", lightNeed: "medium", wateringNeed: "weekly", humidityNeed: "high", difficulty: "moderate", petSafe: false },
    { id: "rubber-plant", commonName: "Rubber Plant", scientificName: "Ficus elastica", lightNeed: "bright_indirect", wateringNeed: "when_top_1_inch_dry", humidityNeed: "average", difficulty: "moderate", petSafe: false },
    { id: "parlor-palm", commonName: "Parlor Palm", scientificName: "Chamaedorea elegans", lightNeed: "low", wateringNeed: "biweekly", humidityNeed: "average", difficulty: "easy", petSafe: true },
    { id: "chinese-evergreen", commonName: "Chinese Evergreen", scientificName: "Aglaonema commutatum", lightNeed: "low", wateringNeed: "when_half_dry", humidityNeed: "average", difficulty: "easy", petSafe: false },
    { id: "philodendron-brasil", commonName: "Philodendron Brasil", scientificName: "Philodendron hederaceum 'Brasil'", lightNeed: "bright_indirect", wateringNeed: "when_top_1_inch_dry", humidityNeed: "average", difficulty: "easy", petSafe: false },
    { id: "hawaiian-umbrella-tree", commonName: "Hawaiian Umbrella Tree", scientificName: "Schefflera arboricola", lightNeed: "bright_indirect", wateringNeed: "when_top_1_inch_dry", humidityNeed: "average", difficulty: "moderate", petSafe: false },
    { id: "fiddle-leaf-fig", commonName: "Fiddle Leaf Fig", scientificName: "Ficus lyrata", lightNeed: "bright_indirect", wateringNeed: "when_top_1_inch_dry", humidityNeed: "average", difficulty: "advanced", petSafe: false },
    { id: "aloe-vera", commonName: "Aloe Vera", scientificName: "Aloe barbadensis miller", lightNeed: "direct_sun", wateringNeed: "when_fully_dry", humidityNeed: "low", difficulty: "easy", petSafe: false },
    { id: "jade-plant", commonName: "Jade Plant", scientificName: "Crassula ovata", lightNeed: "direct_sun", wateringNeed: "when_fully_dry", humidityNeed: "low", difficulty: "easy", petSafe: false },
    { id: "prayer-plant", commonName: "Prayer Plant", scientificName: "Maranta leuconeura", lightNeed: "bright_indirect", wateringNeed: "when_top_1_inch_dry", humidityNeed: "high", difficulty: "moderate", petSafe: true },
    { id: "dracaena-marginata", commonName: "Dragon Tree", scientificName: "Dracaena marginata", lightNeed: "medium", wateringNeed: "when_half_dry", humidityNeed: "average", difficulty: "easy", petSafe: false },
    { id: "cast-iron-plant", commonName: "Cast Iron Plant", scientificName: "Aspidistra elatior", lightNeed: "low", wateringNeed: "biweekly", humidityNeed: "low", difficulty: "easy", petSafe: true },
    { id: "boston-fern", commonName: "Boston Fern", scientificName: "Nephrolepis exaltata", lightNeed: "bright_indirect", wateringNeed: "weekly", humidityNeed: "high", difficulty: "moderate", petSafe: true },
    { id: "birds-nest-fern", commonName: "Bird's Nest Fern", scientificName: "Asplenium nidus", lightNeed: "medium", wateringNeed: "weekly", humidityNeed: "high", difficulty: "moderate", petSafe: true },
    { id: "baby-rubber-plant", commonName: "Baby Rubber Plant", scientificName: "Peperomia obtusifolia", lightNeed: "bright_indirect", wateringNeed: "when_half_dry", humidityNeed: "average", difficulty: "easy", petSafe: true }
];

const LIGHT_NEED_LABELS = {
    low: "Low Light",
    medium: "Medium Light",
    bright_indirect: "Bright Indirect Light",
    direct_sun: "Direct Sun"
};

const WATERING_NEED_LABELS = {
    weekly: "Water weekly",
    biweekly: "Water every 2 weeks",
    when_top_1_inch_dry: "Water when top inch of soil is dry",
    when_half_dry: "Water when soil is about halfway dry",
    when_fully_dry: "Water when soil is fully dry"
};

const WATERING_NEED_DEFAULT_DAYS = {
    weekly: 7,
    biweekly: 14,
    when_top_1_inch_dry: 7,
    when_half_dry: 10,
    when_fully_dry: 14
};

function getLightNeedLabel(value) {
    return LIGHT_NEED_LABELS[value] || "";
}

function getWateringNeedLabel(value) {
    return WATERING_NEED_LABELS[value] || "";
}

function getWateringDefaultDays(value) {
    return WATERING_NEED_DEFAULT_DAYS[value] || "";
}

function setAutofillStatus(message) {
    if (!plantAutofillStatus) {
        return;
    }
    plantAutofillStatus.textContent = message;
}

function clearSelectedPlantProfile() {
    selectedPlantProfile = null;
}

function setPlantFormMode(isEditing) {
    if (!plantSubmitButton) {
        return;
    }
    plantSubmitButton.textContent = isEditing ? "Save Changes" : "Add Plant";
}

function setManualEntryMode(isManual, options) {
    const normalizedOptions = options || {};
    const preserveStatus = Boolean(normalizedOptions.preserveStatus);
    isManualEntryMode = isManual;

    manualOnlyFields.forEach(function (field) {
        field.hidden = !isManual;
    });

    if (lightNeedsInput) {
        lightNeedsInput.required = isManual;
    }

    if (wateringFrequencyInput) {
        wateringFrequencyInput.required = isManual;
    }

    if (wateringNeedsInput) {
        wateringNeedsInput.readOnly = !isManual;
        wateringNeedsInput.placeholder = isManual
            ? "e.g. Water weekly or when top inch is dry"
            : "Select a plant to autofill";
    }

    if (manualEntryButton) {
        manualEntryButton.textContent = isManual
            ? "Use plant database instead"
            : "Can't find your plant? Add it manually";
    }

    if (!preserveStatus) {
        if (isManual) {
            setAutofillStatus("Manual entry enabled. Add light and watering details below.");
        } else {
            setAutofillStatus("");
        }
    }
}

function resetPlantForm() {
    plantForm.reset();
    editingPlantId = null;
    setPlantFormMode(false);
    setSelectedTags([]);
    clearSelectedPlantProfile();
    setManualEntryMode(false, { preserveStatus: true });
    setAutofillStatus("");
    renderPlantPickerResults([], { showEmptyState: false });

    const plantNameInput = document.getElementById("plant-name");
    if (plantNameInput) {
        plantNameInput.focus();
    }
}

function activateManualEntryMode() {
    if (isManualEntryMode) {
        setManualEntryMode(false);
        clearSelectedPlantProfile();
        if (plantPickerSearch) {
            plantPickerSearch.value = "";
        }
        const plantTypeInput = document.getElementById("plant-type");
        if (plantTypeInput) {
            plantTypeInput.value = "";
        }
        return;
    }

    setManualEntryMode(true);
    clearSelectedPlantProfile();
    if (plantPickerSearch) {
        plantPickerSearch.value = "";
    }
    if (wateringNeedsInput) {
        wateringNeedsInput.value = "";
    }
    if (lightNeedsInput) {
        lightNeedsInput.value = "";
    }
    if (wateringFrequencyInput) {
        wateringFrequencyInput.value = "";
    }

    renderPlantPickerResults([], { showEmptyState: false });

    const plantNameInput = document.getElementById("plant-name");
    if (plantNameInput) {
        plantNameInput.focus();
    }
}

function startEditingPlant(plant) {
    if (!plantForm) {
        return;
    }

    editingPlantId = plant.id;
    setPlantFormMode(true);

    const plantNameInput = document.getElementById("plant-name");
    const plantTypeInput = document.getElementById("plant-type");
    const notesInput = document.getElementById("plant-notes");

    const matchingProfile = plant.plantProfileId
        ? plantDatabase.find(function (profile) {
            return profile.id === plant.plantProfileId;
        })
        : null;
    selectedPlantProfile = matchingProfile || null;
    setManualEntryMode(!matchingProfile, { preserveStatus: true });

    if (plantPickerSearch) {
        plantPickerSearch.value = plantTypeInput ? plant.plantType || "" : "";
    }
    if (plantNameInput) {
        plantNameInput.value = plant.plantName || "";
    }
    if (plantTypeInput) {
        plantTypeInput.value = plant.plantType || "";
    }
    if (lightNeedsInput) {
        lightNeedsInput.value = plant.lightNeeds || "";
    }
    if (wateringNeedsInput) {
        wateringNeedsInput.value = plant.wateringNeeds || "";
    }
    if (wateringFrequencyInput) {
        wateringFrequencyInput.value = plant.wateringFrequency || "";
    }
    if (notesInput) {
        notesInput.value = plant.notes || "";
    }
    setSelectedTags(plant.tags);

    setAutofillStatus(`Editing ${plant.plantName}. Update details and save your changes.`);
    renderPlantPickerResults([], { showEmptyState: false });

    const formTop = window.scrollY + plantForm.getBoundingClientRect().top - 16;
    window.scrollTo({
        top: Math.max(0, formTop),
        behavior: "smooth"
    });
}

const featureDetails = {
    watering: {
        emoji: "🌿",
        title: "Personalized Watering",
        text: "Green Thumb AI creates watering reminders for each plant instead of using one generic schedule. Timing adapts based on your plant type and care history."
    },
    ai: {
        emoji: "🤖",
        title: "AI Recommendations",
        text: "Get simple, actionable care suggestions for light, water, and routine maintenance so you always know the next best step."
    },
    growth: {
        emoji: "📈",
        title: "Growth Tracking",
        text: "Track each plant through growth stages with lightweight updates that make progress easy to understand over time."
    },
    health: {
        emoji: "🩺",
        title: "Health Monitoring",
        text: "Log early warning signs like drooping or discoloration and get guidance before plant stress becomes a bigger issue."
    },
    quiz: {
        emoji: "🔍",
        title: "Plant Match Quiz",
        text: "Answer a few quick questions and get plant suggestions that fit your lighting conditions, space, and lifestyle."
    },
    wishlist: {
        emoji: "⭐",
        title: "Wishlist",
        text: "Save future plant ideas in one place so you can grow your collection intentionally when you are ready."
    }
};

function openFeatureModal(featureKey) {
    if (!featureModal || !featureDetails[featureKey]) {
        return;
    }

    const detail = featureDetails[featureKey];
    featureModalTitle.textContent = detail.title;
    featureModalText.textContent = detail.text;
    if (featureModalEmoji) {
        featureModalEmoji.textContent = detail.emoji || "🌱";
    }
    featureModal.classList.add("open");
    featureModal.setAttribute("aria-hidden", "false");
}

function closeFeatureModal() {
    if (!featureModal) {
        return;
    }

    featureModal.classList.remove("open");
    featureModal.setAttribute("aria-hidden", "true");
}

function openQuizModal() {
    if (!quizModal) {
        return;
    }

    quizModal.classList.add("open");
    quizModal.setAttribute("aria-hidden", "false");
}

function closeQuizModal() {
    if (!quizModal) {
        return;
    }

    quizModal.classList.remove("open");
    quizModal.setAttribute("aria-hidden", "true");
}

function getTrackerScrollTarget() {
    if (!trackerSection) {
        return null;
    }

    const topOffset = 16;
    const trackerTop = window.scrollY + trackerSection.getBoundingClientRect().top;
    return Math.max(0, trackerTop - topOffset);
}

function brieflyHighlightTrackerSection() {
    if (!trackerSection) {
        return;
    }

    trackerSection.classList.remove("tracker-scroll-highlight");
    // Restart animation if users tap quickly multiple times.
    trackerSection.offsetWidth;
    trackerSection.classList.add("tracker-scroll-highlight");

    window.setTimeout(function () {
        trackerSection.classList.remove("tracker-scroll-highlight");
    }, 900);
}

function scheduleTrackerHighlightAfterScroll(distance) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const highlightDelay = prefersReducedMotion
        ? 80
        : Math.min(700, Math.max(280, Math.round(distance * 0.45)));

    window.setTimeout(brieflyHighlightTrackerSection, highlightDelay);
}

function handleTrackerScrollTriggerClick(event) {
    const targetY = getTrackerScrollTarget();
    if (targetY === null) {
        return;
    }

    event.preventDefault();
    const distance = Math.abs(targetY - window.scrollY);

    window.scrollTo({
        top: targetY,
        behavior: "smooth"
    });

    scheduleTrackerHighlightAfterScroll(distance);
}

function populatePlantTypeSuggestions() {
    if (!plantTypeSuggestions) {
        return;
    }

    const suggestionNames = ["Not sure yet", "Unknown plant"].concat(
        plantDatabase.map(function (plant) {
            return plant.commonName;
        })
    );
    const uniqueNames = Array.from(new Set(suggestionNames));

    uniqueNames.forEach(function (plantType) {
        const option = document.createElement("option");
        option.value = plantType;
        plantTypeSuggestions.appendChild(option);
    });
}

function getPlantMatchScore(plant, normalizedQuery) {
    const commonName = plant.commonName.toLowerCase();
    const scientificName = plant.scientificName.toLowerCase();

    if (commonName === normalizedQuery) {
        return 0;
    }
    if (commonName.startsWith(normalizedQuery)) {
        return 1;
    }
    if (commonName.includes(normalizedQuery)) {
        return 2;
    }
    if (scientificName.startsWith(normalizedQuery)) {
        return 3;
    }
    if (scientificName.includes(normalizedQuery)) {
        return 4;
    }
    return 99;
}

function getDefaultPlantSuggestions() {
    return plantDatabase.slice(0, DEFAULT_PICKER_RESULTS);
}

function filterPlantDatabase(query) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
        return getDefaultPlantSuggestions();
    }

    const scoredPlants = plantDatabase.map(function (plant) {
        return {
            plant,
            score: getPlantMatchScore(plant, normalizedQuery)
        };
    }).filter(function (entry) {
        return entry.score < 99;
    });

    scoredPlants.sort(function (a, b) {
        if (a.score !== b.score) {
            return a.score - b.score;
        }
        return a.plant.commonName.localeCompare(b.plant.commonName);
    });

    return scoredPlants.slice(0, MAX_PICKER_RESULTS).map(function (entry) {
        return entry.plant;
    });
}

function selectPlantProfile(plant) {
    selectedPlantProfile = plant;
    setManualEntryMode(false, { preserveStatus: true });

    if (plantPickerSearch) {
        plantPickerSearch.value = plant.commonName;
    }

    const plantTypeInput = document.getElementById("plant-type");
    const plantNameInput = document.getElementById("plant-name");
    if (plantTypeInput) {
        plantTypeInput.value = plant.commonName;
    }

    if (plantNameInput) {
        plantNameInput.value = plant.commonName;
    }

    if (lightNeedsInput) {
        lightNeedsInput.value = getLightNeedLabel(plant.lightNeed);
    }

    if (wateringNeedsInput) {
        wateringNeedsInput.value = getWateringNeedLabel(plant.wateringNeed);
    }

    if (wateringFrequencyInput) {
        wateringFrequencyInput.value = String(getWateringDefaultDays(plant.wateringNeed));
    }

    setAutofillStatus(`Auto-filled care defaults for ${plant.commonName}.`);
    renderPlantPickerResults([], { showEmptyState: false });
}

function createPlantPickerResultItem(plant) {
    const resultButton = document.createElement("button");
    resultButton.type = "button";
    resultButton.className = "plant-picker-result";
    resultButton.setAttribute("role", "option");

    const commonName = document.createElement("span");
    commonName.className = "plant-picker-result-name";
    commonName.textContent = plant.commonName;

    const scientificName = document.createElement("span");
    scientificName.className = "plant-picker-result-scientific";
    scientificName.textContent = plant.scientificName;

    resultButton.appendChild(commonName);
    resultButton.appendChild(scientificName);
    resultButton.addEventListener("click", function () {
        selectPlantProfile(plant);
    });

    return resultButton;
}

function renderPlantPickerResults(results, options) {
    if (!plantPickerResults) {
        return;
    }
    const normalizedOptions = options || {};
    const showEmptyState = Boolean(normalizedOptions.showEmptyState);
    const showPlaceholder = Boolean(normalizedOptions.showPlaceholder);
    const query = normalizedOptions.query || "";

    plantPickerResults.innerHTML = "";

    if (showPlaceholder) {
        const placeholder = document.createElement("p");
        placeholder.className = "plant-picker-placeholder";
        placeholder.textContent = "Start typing to search by common or scientific name.";
        plantPickerResults.appendChild(placeholder);
    }

    if (results.length === 0) {
        if (showEmptyState) {
            const emptyState = document.createElement("p");
            emptyState.className = "plant-picker-empty";
            emptyState.textContent = `No plants found for "${query}". Try another name.`;
            plantPickerResults.appendChild(emptyState);
            plantPickerResults.classList.add("has-results");
            return;
        }
        if (showPlaceholder) {
            plantPickerResults.classList.add("has-results");
            return;
        }
        plantPickerResults.classList.remove("has-results");
        return;
    }

    results.forEach(function (plant) {
        plantPickerResults.appendChild(createPlantPickerResultItem(plant));
    });
    plantPickerResults.classList.add("has-results");
}

function initializePlantPicker() {
    if (!plantPickerSearch || !plantPickerResults) {
        return;
    }
    const plantTypeInput = document.getElementById("plant-type");

    plantPickerSearch.addEventListener("input", function (event) {
        clearSelectedPlantProfile();
        setAutofillStatus("");
        const query = event.target.value;
        const matches = filterPlantDatabase(query);
        renderPlantPickerResults(matches, {
            query: query.trim(),
            showEmptyState: Boolean(query.trim()),
            showPlaceholder: !query.trim()
        });
    });

    plantPickerSearch.addEventListener("focus", function () {
        const query = plantPickerSearch.value.trim();
        const matches = filterPlantDatabase(query);
        renderPlantPickerResults(matches, {
            showEmptyState: false,
            showPlaceholder: !query
        });
    });

    plantPickerSearch.addEventListener("blur", function () {
        window.setTimeout(function () {
            renderPlantPickerResults([], { showEmptyState: false });
        }, 140);
    });

    if (plantTypeInput) {
        plantTypeInput.addEventListener("input", function () {
            if (!selectedPlantProfile) {
                return;
            }
            if (plantTypeInput.value.trim() !== selectedPlantProfile.commonName) {
                clearSelectedPlantProfile();
                setAutofillStatus("");
            }
        });
    }
}

function parseDateInput(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDate(date) {
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function getDayDifferenceFromToday(targetDate) {
    const today = getStartOfToday();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.round((targetDate.getTime() - today.getTime()) / millisecondsPerDay);
}

function getRelativeLastWateredLabel(lastWateredDateString) {
    const parsedDate = parseDateInput(lastWateredDateString);
    if (!parsedDate) {
        return lastWateredDateString;
    }

    const dayDifference = getDayDifferenceFromToday(parsedDate);

    if (dayDifference === 0) {
        return "today";
    }
    if (dayDifference === -1) {
        return "1 day ago";
    }
    if (dayDifference < -1) {
        return `${Math.abs(dayDifference)} days ago`;
    }
    if (dayDifference === 1) {
        return "in 1 day";
    }
    return `in ${dayDifference} days`;
}

function getRelativeNextWateringLabel(nextWateringDate) {
    const dayDifference = getDayDifferenceFromToday(nextWateringDate);

    if (dayDifference === 0) {
        return "today";
    }
    if (dayDifference === 1) {
        return "tomorrow";
    }
    if (dayDifference > 1) {
        return `in ${dayDifference} days`;
    }
    if (dayDifference === -1) {
        return "overdue by 1 day";
    }
    return `overdue by ${Math.abs(dayDifference)} days`;
}

function getCompactWateringLabel(relativeNextWateringText) {
    if (relativeNextWateringText.startsWith("overdue by ")) {
        const lateAmount = relativeNextWateringText.replace("overdue by ", "");
        return `💧 ${lateAmount} late`;
    }

    return `💧 ${relativeNextWateringText}`;
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getStartOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function getWateringStatus(nextWateringDate) {
    const today = getStartOfToday();

    if (nextWateringDate > today) {
        return "Healthy";
    }
    if (nextWateringDate.getTime() === today.getTime()) {
        return "Needs Water";
    }
    return "Overdue";
}

function buildWateringDetails(lastWateredDate, wateringFrequency) {
    const parsedLastWatered = parseDateInput(lastWateredDate);
    const frequencyDays = Number.parseInt(wateringFrequency, 10);

    if (!parsedLastWatered || Number.isNaN(frequencyDays)) {
        return {
            nextWateringText: "Unknown",
            status: "Healthy"
        };
    }

    const nextWateringDate = addDays(parsedLastWatered, frequencyDays);

    return {
        nextWateringText: getRelativeNextWateringLabel(nextWateringDate),
        status: getWateringStatus(nextWateringDate)
    };
}

function getPlantStatus(plant) {
    return buildWateringDetails(plant.lastWateredDate, plant.wateringFrequency).status;
}

function getSortLabel(sortKey) {
    if (sortKey === "oldest_added") {
        return "Sort: Oldest Added";
    }
    if (sortKey === "least_recently_watered") {
        return "Sort: Least Recently Watered";
    }
    if (sortKey === "most_recently_watered") {
        return "Sort: Most Recently Watered";
    }
    if (sortKey === "name_az") {
        return "Sort: Name A–Z";
    }
    return "Sort: Recently Added";
}

function getSortValueTimestamp(value, fallbackValue) {
    if (!value) {
        return fallbackValue;
    }
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? fallbackValue : timestamp;
}

function normalizeTags(rawTags) {
    if (Array.isArray(rawTags)) {
        return Array.from(
            new Set(
                rawTags.map(function (tag) {
                    return String(tag || "").trim();
                }).filter(Boolean)
            )
        );
    }

    if (typeof rawTags === "string") {
        return Array.from(
            new Set(
                rawTags.split(",").map(function (tag) {
                    return tag.trim();
                }).filter(Boolean)
            )
        );
    }

    return [];
}

function getSelectedTags() {
    return plantTagInputs.filter(function (input) {
        return input.checked;
    }).map(function (input) {
        return input.value;
    });
}

function setSelectedTags(tags) {
    const normalizedTags = normalizeTags(tags);
    plantTagInputs.forEach(function (input) {
        input.checked = normalizedTags.includes(input.value);
    });
}

function getPlantCreatedAt(plant, index) {
    const parsedId = Number.parseInt(plant.id, 10);
    if (Number.isFinite(parsedId)) {
        return parsedId;
    }
    return Date.now() - index;
}

function sortPlants(plantsToSort, sortKey) {
    const indexedPlants = plantsToSort.map(function (plant, index) {
        return {
            plant,
            originalIndex: index,
            createdAt: getPlantCreatedAt(plant, index),
            lastWateredAt: getSortValueTimestamp(plant.lastWateredDate, 0)
        };
    });

    indexedPlants.sort(function (a, b) {
        if (sortKey === "oldest_added") {
            return a.createdAt - b.createdAt;
        }
        if (sortKey === "least_recently_watered") {
            return a.lastWateredAt - b.lastWateredAt;
        }
        if (sortKey === "most_recently_watered") {
            return b.lastWateredAt - a.lastWateredAt;
        }
        if (sortKey === "name_az") {
            return a.plant.plantName.localeCompare(b.plant.plantName);
        }
        return b.createdAt - a.createdAt;
    });

    return indexedPlants.map(function (entry) {
        return entry.plant;
    });
}

function applySortUIState() {
    if (sortMenuTrigger) {
        sortMenuTrigger.textContent = getSortLabel(activeSort);
    }

    sortOptionButtons.forEach(function (button) {
        const isActive = button.dataset.sort === activeSort;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
    });
}

function saveSortPreference() {
    localStorage.setItem(SORT_STORAGE_KEY, activeSort);
}

function loadSortPreference() {
    const storedSort = localStorage.getItem(SORT_STORAGE_KEY);
    const allowedSorts = new Set([
        "newest_added",
        "oldest_added",
        "least_recently_watered",
        "most_recently_watered",
        "name_az"
    ]);

    if (storedSort && allowedSorts.has(storedSort)) {
        activeSort = storedSort;
    }
}

function updateDashboardSummary() {
    const totalPlants = plants.length;
    let needsWaterCount = 0;
    let overdueCount = 0;

    plants.forEach(function (plant) {
        const status = getPlantStatus(plant);
        if (status === "Needs Water") {
            needsWaterCount += 1;
        }
        if (status === "Overdue") {
            overdueCount += 1;
        }
    });

    summaryTotalPlants.textContent = String(totalPlants);
    summaryNeedsWater.textContent = String(needsWaterCount);
    summaryOverdue.textContent = String(overdueCount);
}

function savePlants() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
}

function loadPlants() {
    const storedPlants = localStorage.getItem(STORAGE_KEY);

    if (!storedPlants) {
        plants = [];
        return;
    }

    try {
        const parsedPlants = JSON.parse(storedPlants);
        plants = Array.isArray(parsedPlants) ? parsedPlants.map(function (plant) {
            return {
                notes: "",
                tags: [],
                ...plant
            };
        }) : [];
        plants = plants.map(function (plant) {
            return {
                ...plant,
                tags: normalizeTags(plant.tags)
            };
        });
    } catch (error) {
        plants = [];
    }
}

function createPlantCard(plant) {
    const card = document.createElement("article");
    card.className = "plant-card";
    card.setAttribute("aria-expanded", "false");
    const header = document.createElement("div");
    header.className = "plant-card-header";

    const title = document.createElement("h5");
    title.textContent = plant.plantName;
    const titleGroup = document.createElement("div");
    titleGroup.className = "plant-card-title-group";
    titleGroup.appendChild(title);

    const normalizedTags = normalizeTags(plant.tags);
    if (normalizedTags.length > 0) {
        const tagsRow = document.createElement("div");
        tagsRow.className = "plant-card-tags";
        normalizedTags.forEach(function (tag) {
            const tagPill = document.createElement("span");
            tagPill.className = "plant-tag-pill";
            tagPill.textContent = tag;
            tagsRow.appendChild(tagPill);
        });
        titleGroup.appendChild(tagsRow);
    }
    header.appendChild(titleGroup);

    const quickInfo = document.createElement("div");
    quickInfo.className = "plant-card-quick-info";

    const statusPill = document.createElement("p");
    statusPill.className = "plant-status-pill";
    quickInfo.appendChild(statusPill);

    const wateringChip = document.createElement("p");
    wateringChip.className = "watering-chip";
    quickInfo.appendChild(wateringChip);

    const toggleHint = document.createElement("p");
    toggleHint.className = "plant-card-toggle-hint";
    toggleHint.textContent = "View details";
    quickInfo.appendChild(toggleHint);

    header.appendChild(quickInfo);
    card.appendChild(header);

    const details = document.createElement("div");
    details.className = "plant-card-details";
    card.appendChild(details);

    function addDetail(label, value) {
        const line = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;
        const valueNode = document.createElement("span");
        valueNode.textContent = value;
        line.appendChild(strong);
        line.appendChild(valueNode);
        details.appendChild(line);
        return valueNode;
    }

    addDetail("Type", plant.plantType || "Not specified");
    if (plant.scientificName) {
        addDetail("Scientific name", plant.scientificName);
    }
    if (plant.wateringNeeds) {
        addDetail("Watering need", plant.wateringNeeds);
    }
    addDetail("Light", plant.lightNeeds);
    addDetail("Water every X days", `${plant.wateringFrequency}`);
    if (plant.notes) {
        addDetail("Notes", plant.notes);
    }
    if (normalizedTags.length > 0) {
        addDetail("Tags", normalizedTags.join(", "));
    }
    const lastWateredValue = addDetail("Last watered", plant.lastWateredDate);
    const nextWateringValue = addDetail("Next watering", "");

    function refreshWateringDetails() {
        const wateringDetails = buildWateringDetails(plant.lastWateredDate, plant.wateringFrequency);
        lastWateredValue.textContent = getRelativeLastWateredLabel(plant.lastWateredDate);
        nextWateringValue.textContent = wateringDetails.nextWateringText;
        statusPill.textContent = wateringDetails.status;
        wateringChip.textContent = getCompactWateringLabel(wateringDetails.nextWateringText);

        card.classList.remove("status-healthy", "status-needs-water", "status-overdue");
        if (wateringDetails.status === "Healthy") {
            card.classList.add("status-healthy");
        } else if (wateringDetails.status === "Needs Water") {
            card.classList.add("status-needs-water");
        } else {
            card.classList.add("status-overdue");
        }
    }

    const actionRow = document.createElement("div");
    actionRow.className = "plant-card-actions";

    const wateredButton = document.createElement("button");
    wateredButton.type = "button";
    wateredButton.className = "card-action-btn";
    wateredButton.textContent = "Watered Today";
    wateredButton.addEventListener("click", function (event) {
        event.stopPropagation();
        plant.lastWateredDate = formatDateForInput(getStartOfToday());
        savePlants();
        refreshWateringDetails();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "card-action-btn delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function (event) {
        event.stopPropagation();
        plants = plants.filter(function (currentPlant) {
            return currentPlant.id !== plant.id;
        });
        savePlants();
        renderPlants();
    });

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "card-action-btn";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function (event) {
        event.stopPropagation();
        startEditingPlant(plant);
    });

    actionRow.appendChild(wateredButton);
    actionRow.appendChild(editButton);
    actionRow.appendChild(deleteButton);
    details.appendChild(actionRow);

    refreshWateringDetails();

    function setExpanded(isExpanded, skipControlsUpdate) {
        const isCurrentlyExpanded = card.classList.contains("expanded");

        card.classList.toggle("expanded", isExpanded);
        card.setAttribute("aria-expanded", isExpanded ? "true" : "false");
        toggleHint.textContent = isExpanded ? "Hide details" : "View details";

        if (isExpanded) {
            details.style.overflow = "hidden";
            details.style.maxHeight = `${details.scrollHeight + 24}px`;
        } else {
            if (isCurrentlyExpanded && details.style.maxHeight === "none") {
                details.style.maxHeight = `${details.scrollHeight + 24}px`;
                // Force a reflow so the browser can animate from measured height to 0.
                details.offsetHeight;
            }
            details.style.overflow = "hidden";
            details.style.maxHeight = "0px";
        }

        if (!skipControlsUpdate) {
            updateExpandCollapseControls();
        }
    }

    details.addEventListener("transitionend", function (event) {
        if (event.propertyName !== "max-height") {
            return;
        }

        if (card.classList.contains("expanded")) {
            // Let expanded cards grow naturally so content never gets clipped.
            details.style.maxHeight = "none";
            details.style.overflow = "visible";
        }
    });

    card.addEventListener("click", function () {
        setExpanded(!card.classList.contains("expanded"));
    });

    setExpanded(false);
    card._setExpanded = setExpanded;

    return card;
}

function renderPlants() {
    plantCards.innerHTML = "";
    updateDashboardSummary();

    if (plants.length === 0) {
        plantCountSummary.textContent = "0 plants";
        const state = document.createElement("p");
        state.id = "empty-state";
        state.className = "empty-state";
        state.textContent = EMPTY_STATE_TEXT;
        plantCards.appendChild(state);
        updateExpandCollapseControls();
        return;
    }

    const filteredPlants = plants.filter(function (plant) {
        if (activeFilter === "All Plants") {
            return true;
        }
        return getPlantStatus(plant) === activeFilter;
    });

    if (activeFilter === "All Plants") {
        const label = plants.length === 1 ? "plant" : "plants";
        plantCountSummary.textContent = `${plants.length} ${label}`;
    } else {
        const filteredLabel = filteredPlants.length === 1 ? "plant" : "plants";
        plantCountSummary.textContent = `${filteredPlants.length} ${filteredLabel} (${activeFilter})`;
    }

    if (filteredPlants.length === 0) {
        const state = document.createElement("p");
        state.id = "empty-state";
        state.className = "empty-state";
        state.textContent = `No plants match "${activeFilter}".`;
        plantCards.appendChild(state);
        updateExpandCollapseControls();
        return;
    }

    const sortedPlants = sortPlants(filteredPlants, activeSort);

    sortedPlants.forEach(function (plant) {
        const card = createPlantCard(plant);
        plantCards.appendChild(card);
    });
    updateExpandCollapseControls();
}

plantForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(plantForm);
    const plantName = String(formData.get("plantName") || "").trim();
    const plantType = String(formData.get("plantType") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    const tags = getSelectedTags();
    let wateringNeeds = String(formData.get("wateringNeeds") || "").trim();
    let lightNeeds = String(formData.get("lightNeeds") || "").trim();
    let wateringFrequency = String(formData.get("wateringFrequency") || "").trim();

    if (!isManualEntryMode && selectedPlantProfile) {
        lightNeeds = getLightNeedLabel(selectedPlantProfile.lightNeed);
        wateringNeeds = getWateringNeedLabel(selectedPlantProfile.wateringNeed);
        wateringFrequency = String(getWateringDefaultDays(selectedPlantProfile.wateringNeed));
    } else if (!isManualEntryMode) {
        // Guided mode fallback: allow save with type + nickname even without a matched profile.
        wateringNeeds = wateringNeeds || "Water weekly";
        wateringFrequency = wateringFrequency || "7";
    }

    let plantProfileId = "";
    let scientificName = "";
    const currentPlant = editingPlantId
        ? plants.find(function (existingPlant) {
            return existingPlant.id === editingPlantId;
        })
        : null;

    if (selectedPlantProfile && plantType === selectedPlantProfile.commonName) {
        plantProfileId = selectedPlantProfile.id;
        scientificName = selectedPlantProfile.scientificName;
    } else if (currentPlant && plantType === currentPlant.plantType) {
        plantProfileId = currentPlant.plantProfileId || "";
        scientificName = currentPlant.scientificName || "";
    }

    const nextPlantData = {
        plantName,
        plantType,
        plantProfileId,
        scientificName,
        lightNeeds,
        wateringNeeds,
        wateringFrequency,
        notes,
        tags
    };

    if (editingPlantId) {
        plants = plants.map(function (plant) {
            if (plant.id !== editingPlantId) {
                return plant;
            }
            return {
                ...plant,
                ...nextPlantData
            };
        });
    } else {
        plants.unshift({
            id: Date.now().toString(),
            ...nextPlantData,
            lastWateredDate: formatDateForInput(getStartOfToday())
        });
    }

    savePlants();
    renderPlants();
    resetPlantForm();
});

if (manualEntryButton) {
    manualEntryButton.addEventListener("click", activateManualEntryMode);
}

statusFilter.addEventListener("change", function (event) {
    activeFilter = event.target.value;
    renderPlants();
});

sortOptionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const nextSort = button.dataset.sort;
        if (!nextSort || nextSort === activeSort) {
            if (sortMenu) {
                sortMenu.removeAttribute("open");
            }
            return;
        }

        activeSort = nextSort;
        saveSortPreference();
        applySortUIState();
        renderPlants();

        if (sortMenu) {
            sortMenu.removeAttribute("open");
        }
    });
});

loadPlants();
loadSortPreference();
applySortUIState();
renderPlants();
populatePlantTypeSuggestions();
initializePlantPicker();
setManualEntryMode(false, { preserveStatus: true });
setPlantFormMode(false);

featureCards.forEach(function (card) {
    const featureKey = card.dataset.feature;

    card.addEventListener("click", function () {
        openFeatureModal(featureKey);
    });

    card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFeatureModal(featureKey);
        }
    });
});

if (featureModalClose) {
    featureModalClose.addEventListener("click", closeFeatureModal);
}

if (featureModal) {
    featureModal.addEventListener("click", function (event) {
        if (event.target === featureModal) {
            closeFeatureModal();
        }
    });
}

if (quizPreviewTrigger) {
    quizPreviewTrigger.addEventListener("click", function (event) {
        event.preventDefault();
        openQuizModal();
    });
}

if (trackerScrollTriggers.length > 0) {
    trackerScrollTriggers.forEach(function (trigger) {
        trigger.addEventListener("click", handleTrackerScrollTriggerClick);
    });
}

if (quizModalClose) {
    quizModalClose.addEventListener("click", closeQuizModal);
}

if (quizModal) {
    quizModal.addEventListener("click", function (event) {
        if (event.target === quizModal) {
            closeQuizModal();
        }
    });
}

if (expandAllButton) {
    expandAllButton.addEventListener("click", function () {
        const cards = Array.from(plantCards.querySelectorAll(".plant-card"));
        cards.forEach(function (card) {
            if (typeof card._setExpanded === "function") {
                card._setExpanded(true, true);
            }
        });
        updateExpandCollapseControls();
    });
}

if (collapseAllButton) {
    collapseAllButton.addEventListener("click", function () {
        const cards = Array.from(plantCards.querySelectorAll(".plant-card"));
        cards.forEach(function (card) {
            if (typeof card._setExpanded === "function") {
                card._setExpanded(false, true);
            }
        });
        updateExpandCollapseControls();
    });
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeFeatureModal();
        closeQuizModal();
    }
});
