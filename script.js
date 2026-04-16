const plantForm = document.getElementById("plant-form");
const plantCards = document.getElementById("plant-cards");
const statusFilter = document.getElementById("status-filter");
const tagFilter = document.getElementById("tag-filter");
const sortMenu = document.getElementById("sort-menu");
const sortMenuTrigger = document.getElementById("sort-menu-trigger");
const sortOptionButtons = Array.from(document.querySelectorAll(".sort-option-btn"));
const plantTagInputs = Array.from(document.querySelectorAll('input[name="plantTags"]'));
const plantCountSummary = document.getElementById("plant-count-summary");
const summaryTotalPlants = document.getElementById("summary-total-plants");
const summaryNeedsWater = document.getElementById("summary-needs-water");
const careTaskList = document.getElementById("care-task-list");
const taskCountSummary = document.getElementById("task-count-summary");
const expandAllButton = document.getElementById("expand-all-btn");
const collapseAllButton = document.getElementById("collapse-all-btn");
const plantTypeSuggestions = document.getElementById("plant-type-suggestions");
const plantPickerSearch = document.getElementById("plant-picker-search");
const plantPickerResults = document.getElementById("plant-picker-results");
const plantAutofillStatus = document.getElementById("plant-autofill-status");
const manualEntryButton = document.getElementById("manual-entry-btn");
const manualPlantTypeInput = document.getElementById("manual-plant-type");
const lightNeedsInput = document.getElementById("light-needs");
const wateringFrequencyInput = document.getElementById("watering-frequency");
const manualOnlyFields = Array.from(document.querySelectorAll(".manual-only-field"));
const manualPlantTypeField = manualPlantTypeInput ? manualPlantTypeInput.closest(".manual-only-field") : null;
const lightNeedsField = lightNeedsInput ? lightNeedsInput.closest(".manual-only-field") : null;
const savedPlantsPanel = document.querySelector(".saved-plants");
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
const navLoginLink = document.getElementById("nav-login-link");
const navProfileLink = document.getElementById("nav-profile-link");
const navLogoutButton = document.getElementById("nav-logout-btn");
const trackerAuthenticatedContent = document.getElementById("tracker-authenticated-content");
const trackerLockedState = document.getElementById("tracker-locked-state");
const authViewLoggedOut = document.getElementById("auth-view-logged-out");
const authViewLoggedIn = document.getElementById("auth-view-logged-in");
const authUserGreeting = document.getElementById("auth-user-greeting");
const authFeedback = document.getElementById("auth-feedback");
const showLoginButton = document.getElementById("show-login-btn");
const showSignupButton = document.getElementById("show-signup-btn");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginSubmitButton = document.getElementById("login-submit-btn");
const signupSubmitButton = document.getElementById("signup-submit-btn");
const profileLogoutButton = document.getElementById("profile-logout-btn");
const profileFeedback = document.getElementById("profile-feedback");
const profileDisplayName = document.getElementById("profile-display-name");
const profileEmail = document.getElementById("profile-email");
const profileMemberSince = document.getElementById("profile-member-since");
const profileTotalPlants = document.getElementById("profile-total-plants");
const profileAccountId = document.getElementById("profile-account-id");
const profileRemindersCount = document.getElementById("profile-reminders-count");
const profileSavedInfoCount = document.getElementById("profile-saved-info-count");
const profileQuizCount = document.getElementById("profile-quiz-count");
const profileRecommendationsCount = document.getElementById("profile-recommendations-count");
const profilePreferencesStatus = document.getElementById("profile-preferences-status");
const plantCtaElements = Array.from(document.querySelectorAll("[data-plant-cta]"));
const plantEmptyCopyElements = Array.from(document.querySelectorAll("[data-plant-empty-copy]"));
const authCreateCtaElements = Array.from(document.querySelectorAll("[data-auth-create-cta]"));
const hasTrackerUI = Boolean(
    plantForm &&
    plantCards &&
    plantCountSummary &&
    summaryTotalPlants &&
    summaryNeedsWater &&
    statusFilter
);
const hasTaskUI = Boolean(careTaskList && taskCountSummary);
const LEGACY_PLANTS_STORAGE_KEY = "greenThumbPlants";
const LEGACY_SORT_STORAGE_KEY = "greenThumbPlantSort";
const USERS_STORAGE_KEY = "greenThumbUsers";
const USER_SESSION_STORAGE_KEY = "greenThumbSession";
const USER_DATA_STORAGE_KEY = "greenThumbUserData";
const SORT_STORAGE_KEY = "greenThumbPlantSortByUser";
const UPCOMING_TASK_WINDOW_DAYS = 3;
let plants = [];
let careTasks = [];
let activeFilter = "All Plants";
let activeTagFilter = "All Tags";
let activeSort = "newest_added";
let selectedPlantProfile = null;
let editingPlantId = null;
let isManualEntryMode = false;
let currentUser = null;
let authMode = "login";
let activeSessionToast = null;
const DEFAULT_PICKER_RESULTS = 6;
const MAX_PICKER_RESULTS = 10;

function getStoredSessionUserId() {
    const activeSession = getSession();
    return activeSession && activeSession.userId ? activeSession.userId : "";
}

function syncAuthCreateCtas(isAuthenticated) {
    authCreateCtaElements.forEach(function (element) {
        element.hidden = isAuthenticated;
    });
}

syncAuthCreateCtas(Boolean(getStoredSessionUserId()));

function getSessionToastContainer() {
    let container = document.getElementById("session-toast-container");
    if (container) {
        return container;
    }
    container = document.createElement("div");
    container.id = "session-toast-container";
    container.className = "session-toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
    return container;
}

function dismissSessionToast(toast) {
    if (!toast || !toast.parentElement) {
        return;
    }
    toast.classList.add("is-closing");
    window.setTimeout(function () {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 190);
}

function showSessionToast(message, type) {
    if (!message) {
        return;
    }
    const container = getSessionToastContainer();
    if (activeSessionToast && activeSessionToast.parentElement) {
        dismissSessionToast(activeSessionToast);
    }

    const toast = document.createElement("div");
    toast.className = "session-toast";
    toast.classList.add(type || "info");
    toast.textContent = message;
    container.appendChild(toast);
    activeSessionToast = toast;

    window.setTimeout(function () {
        if (activeSessionToast === toast) {
            activeSessionToast = null;
        }
        dismissSessionToast(toast);
    }, 4200);
}

function getStorageJSON(key, fallbackValue) {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
        return fallbackValue;
    }

    try {
        return JSON.parse(rawValue);
    } catch (error) {
        return fallbackValue;
    }
}

function setStorageJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function generateId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function createPasswordSalt() {
    if (!window.crypto || !window.crypto.getRandomValues) {
        return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    }
    const randomValues = new Uint8Array(16);
    window.crypto.getRandomValues(randomValues);
    return Array.from(randomValues).map(function (value) {
        return value.toString(16).padStart(2, "0");
    }).join("");
}

function toHex(buffer) {
    return Array.from(new Uint8Array(buffer)).map(function (value) {
        return value.toString(16).padStart(2, "0");
    }).join("");
}

async function hashPassword(password, salt) {
    if (!window.crypto || !window.crypto.subtle) {
        return btoa(`${salt}:${password}`);
    }
    const textEncoder = new TextEncoder();
    const encoded = textEncoder.encode(`${salt}:${password}`);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", encoded);
    return toHex(hashBuffer);
}

function getStoredUsers() {
    const users = getStorageJSON(USERS_STORAGE_KEY, []);
    return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
    setStorageJSON(USERS_STORAGE_KEY, users);
}

function getUserDataStore() {
    const userDataStore = getStorageJSON(USER_DATA_STORAGE_KEY, {});
    return userDataStore && typeof userDataStore === "object" ? userDataStore : {};
}

function saveUserDataStore(userDataStore) {
    setStorageJSON(USER_DATA_STORAGE_KEY, userDataStore);
}

function createDefaultUserDataRecord() {
    return {
        plants: [],
        careTasks: [],
        reminders: [],
        quizResults: [],
        savedRecommendations: [],
        preferences: {},
        meta: {
            legacyPlantsMigrated: false
        }
    };
}

function getUserDataRecord(userId, shouldCreate) {
    if (!userId) {
        return null;
    }
    const store = getUserDataStore();
    if (!store[userId] && shouldCreate) {
        store[userId] = createDefaultUserDataRecord();
        saveUserDataStore(store);
    }
    return store[userId] || null;
}

function updateUserDataRecord(userId, updater) {
    if (!userId) {
        return null;
    }
    const store = getUserDataStore();
    const currentRecord = store[userId] || createDefaultUserDataRecord();
    const nextRecord = updater(currentRecord);
    store[userId] = nextRecord;
    saveUserDataStore(store);
    return nextRecord;
}

const plantDataService = {
    async listPlants(userId) {
        assertUserScope(userId);
        const record = getUserDataRecord(userId, true) || createDefaultUserDataRecord();
        let storedPlants = Array.isArray(record.plants) ? record.plants : [];
        const alreadyMigrated = Boolean(record.meta && record.meta.legacyPlantsMigrated);

        if (storedPlants.length === 0 && !alreadyMigrated) {
            storedPlants = getLegacyPlants();
        }

        // Query-level ownership filter: legacy plants can be imported, but owned records never cross users.
        const scopedPlants = storedPlants.filter(function (plant) {
            return !plant.userId || plant.userId === userId;
        }).map(function (plant, index) {
            return normalizePlantRecord(plant, userId, index);
        });

        persistScopedPlants(userId, scopedPlants, true);
        return scopedPlants;
    },

    async createPlant(userId, input) {
        assertUserScope(userId);
        const now = new Date().toISOString();
        const plant = normalizePlantRecord({
            ...input,
            id: generateId("plant"),
            userId,
            createdAt: now,
            updatedAt: now,
            lastWateredDate: input.lastWateredDate || formatDateForInput(getStartOfToday())
        }, userId);
        const currentPlants = await this.listPlants(userId);
        persistScopedPlants(userId, [plant].concat(currentPlants), true);
        taskDataService.ensureWateringTaskForPlant(userId, plant);
        return plant;
    },

    async updatePlant(userId, plantId, input) {
        assertUserScope(userId);
        let updatedPlant = null;
        const currentPlants = await this.listPlants(userId);
        const nextPlants = currentPlants.map(function (plant) {
            if (plant.id !== plantId) {
                return plant;
            }
            updatedPlant = normalizePlantRecord({
                ...plant,
                ...input,
                userId,
                createdAt: plant.createdAt,
                updatedAt: new Date().toISOString()
            }, userId);
            return updatedPlant;
        });

        if (!updatedPlant) {
            throw new Error("Plant not found for this user.");
        }

        persistScopedPlants(userId, nextPlants, true);
        taskDataService.syncWateringTaskForPlant(userId, updatedPlant);
        return updatedPlant;
    },

    async deletePlant(userId, plantId) {
        assertUserScope(userId);
        const currentPlants = await this.listPlants(userId);
        const nextPlants = currentPlants.filter(function (plant) {
            return plant.id !== plantId;
        });

        if (nextPlants.length === currentPlants.length) {
            throw new Error("Plant not found for this user.");
        }

        persistScopedPlants(userId, nextPlants, true);
        taskDataService.deleteTasksForPlant(userId, plantId);
    }
};

const taskDataService = {
    listTasks(userId) {
        assertUserScope(userId);
        const record = getUserDataRecord(userId, true) || createDefaultUserDataRecord();
        const tasks = Array.isArray(record.careTasks) ? record.careTasks : [];
        return tasks.filter(function (task) {
            return task.userId === userId;
        }).map(function (task) {
            return normalizeTaskRecord(task, userId);
        });
    },

    listOpenTasks(userId) {
        return this.listTasks(userId).filter(function (task) {
            return task.status !== "completed";
        });
    },

    getVisibleTasks(tasks) {
        return sortOpenTasks(tasks.filter(isTaskVisibleInUpcomingWindow));
    },

    listVisibleTasks(userId) {
        return this.getVisibleTasks(this.listTasks(userId));
    },

    reconcileWateringTasks(userId, userPlants) {
        assertUserScope(userId);
        const existingTasks = this.listTasks(userId);
        const plantIds = new Set(userPlants.map(function (plant) {
            return plant.id;
        }));
        let nextTasks = existingTasks.filter(function (task) {
            return plantIds.has(task.plantId);
        });

        userPlants.forEach(function (plant) {
            const hasOpenWateringTask = nextTasks.some(function (task) {
                return task.plantId === plant.id && task.type === "watering" && task.status === "open";
            });
            if (!hasOpenWateringTask && shouldCreateWateringTaskForPlant(plant)) {
                nextTasks.push(createWateringTask(userId, plant));
            }
        });

        persistScopedTasks(userId, nextTasks);
        return nextTasks;
    },

    ensureWateringTaskForPlant(userId, plant) {
        const tasks = this.listTasks(userId);
        const hasOpenWateringTask = tasks.some(function (task) {
            return task.plantId === plant.id && task.type === "watering" && task.status === "open";
        });
        if (hasOpenWateringTask || !shouldCreateWateringTaskForPlant(plant)) {
            return;
        }
        persistScopedTasks(userId, tasks.concat(createWateringTask(userId, plant)));
    },

    syncWateringTaskForPlant(userId, plant) {
        const tasks = this.listTasks(userId);
        const dueDate = getNextWateringDateString(plant);
        const nextTasks = tasks.map(function (task) {
            if (task.plantId !== plant.id || task.type !== "watering" || task.status === "completed") {
                return task;
            }
            return normalizeTaskRecord({
                ...task,
                title: `Water ${plant.plantName}`,
                dueDate,
                updatedAt: new Date().toISOString()
            }, userId);
        });
        persistScopedTasks(userId, nextTasks);
    },

    deleteTasksForPlant(userId, plantId) {
        const nextTasks = this.listTasks(userId).filter(function (task) {
            return task.plantId !== plantId;
        });
        persistScopedTasks(userId, nextTasks);
    },

    completeTask(userId, taskId) {
        assertUserScope(userId);
        const tasks = this.listTasks(userId);
        let completedTask = null;
        const today = formatDateForInput(getStartOfToday());
        const nextTasks = tasks.map(function (task) {
            if (task.id !== taskId) {
                return task;
            }
            completedTask = normalizeTaskRecord({
                ...task,
                status: "completed",
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }, userId);
            return completedTask;
        });

        if (!completedTask) {
            throw new Error("Task not found for this user.");
        }

        const plant = plants.find(function (currentPlant) {
            return currentPlant.id === completedTask.plantId;
        });
        const finalTasks = nextTasks.slice();
        if (plant && completedTask.type === "watering") {
            plant.lastWateredDate = today;
            plant.updatedAt = new Date().toISOString();
            persistScopedPlants(userId, plants, true);
        }

        persistScopedTasks(userId, finalTasks);
        return completedTask;
    },

    completeOpenWateringTaskForPlant(userId, plantId) {
        assertUserScope(userId);
        const tasks = this.listTasks(userId);
        const today = formatDateForInput(getStartOfToday());
        const now = new Date().toISOString();
        let completedAnyTask = false;
        const nextTasks = tasks.map(function (task) {
            if (task.plantId !== plantId || task.type !== "watering" || task.status === "completed") {
                return task;
            }
            completedAnyTask = true;
            return normalizeTaskRecord({
                ...task,
                status: "completed",
                completedAt: now,
                updatedAt: now
            }, userId);
        });

        const plant = plants.find(function (currentPlant) {
            return currentPlant.id === plantId;
        });
        if (!plant) {
            throw new Error("Plant not found for this user.");
        }

        plant.lastWateredDate = today;
        plant.updatedAt = now;
        persistScopedPlants(userId, plants, true);

        // Keep plant watering and task completion as one state transition to avoid duplicate open tasks.
        const finalTasks = nextTasks.filter(function (task) {
            return !(task.plantId === plantId && task.type === "watering" && task.status === "open");
        });
        persistScopedTasks(userId, finalTasks);
        return completedAnyTask;
    }
};

function assertUserScope(userId) {
    if (!currentUser || currentUser.id !== userId) {
        throw new Error("You must be signed in to manage this garden.");
    }
}

function persistScopedPlants(userId, scopedPlants, legacyPlantsMigrated) {
    updateUserDataRecord(userId, function (record) {
        const safeRecord = record || createDefaultUserDataRecord();
        return {
            ...safeRecord,
            plants: scopedPlants.map(function (plant) {
                return normalizePlantRecord(plant, userId);
            }),
            careTasks: Array.isArray(safeRecord.careTasks) ? safeRecord.careTasks : [],
            reminders: Array.isArray(safeRecord.reminders) ? safeRecord.reminders : [],
            quizResults: Array.isArray(safeRecord.quizResults) ? safeRecord.quizResults : [],
            savedRecommendations: Array.isArray(safeRecord.savedRecommendations) ? safeRecord.savedRecommendations : [],
            preferences: safeRecord.preferences && typeof safeRecord.preferences === "object" ? safeRecord.preferences : {},
            meta: {
                legacyPlantsMigrated: Boolean(legacyPlantsMigrated || (safeRecord.meta && safeRecord.meta.legacyPlantsMigrated))
            }
        };
    });
}

function persistScopedTasks(userId, scopedTasks) {
    updateUserDataRecord(userId, function (record) {
        const safeRecord = record || createDefaultUserDataRecord();
        return {
            ...safeRecord,
            plants: Array.isArray(safeRecord.plants) ? safeRecord.plants : [],
            careTasks: scopedTasks.map(function (task) {
                return normalizeTaskRecord(task, userId);
            }),
            reminders: Array.isArray(safeRecord.reminders) ? safeRecord.reminders : [],
            quizResults: Array.isArray(safeRecord.quizResults) ? safeRecord.quizResults : [],
            savedRecommendations: Array.isArray(safeRecord.savedRecommendations) ? safeRecord.savedRecommendations : [],
            preferences: safeRecord.preferences && typeof safeRecord.preferences === "object" ? safeRecord.preferences : {},
            meta: {
                legacyPlantsMigrated: Boolean(safeRecord.meta && safeRecord.meta.legacyPlantsMigrated)
            }
        };
    });
}

function getLegacyPlants() {
    const legacyPlants = getStorageJSON(LEGACY_PLANTS_STORAGE_KEY, []);
    return Array.isArray(legacyPlants) ? legacyPlants : [];
}

function getLegacySortPreference() {
    const legacySort = localStorage.getItem(LEGACY_SORT_STORAGE_KEY);
    return typeof legacySort === "string" ? legacySort : "";
}

function getSession() {
    const session = getStorageJSON(USER_SESSION_STORAGE_KEY, null);
    if (!session || typeof session !== "object") {
        return null;
    }
    return session;
}

function setSession(userId) {
    const nextSession = {
        userId,
        startedAt: new Date().toISOString()
    };
    setStorageJSON(USER_SESSION_STORAGE_KEY, nextSession);
}

function clearSession() {
    localStorage.removeItem(USER_SESSION_STORAGE_KEY);
}

function getUserById(userId) {
    if (!userId) {
        return null;
    }
    const users = getStoredUsers();
    return users.find(function (user) {
        return user.id === userId;
    }) || null;
}

function getUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    const users = getStoredUsers();
    return users.find(function (user) {
        return normalizeEmail(user.email) === normalizedEmail;
    }) || null;
}

function setStatusMessage(target, message, type) {
    if (!target) {
        return;
    }
    target.textContent = message || "";
    target.classList.remove("error", "success");
    if (type) {
        target.classList.add(type);
    }
}

function setAuthMode(nextMode) {
    authMode = nextMode === "signup" ? "signup" : "login";
    if (!loginForm || !signupForm || !showLoginButton || !showSignupButton) {
        return;
    }

    const showSignup = authMode === "signup";
    signupForm.hidden = !showSignup;
    loginForm.hidden = showSignup;
    showSignupButton.classList.toggle("active", showSignup);
    showLoginButton.classList.toggle("active", !showSignup);
    showSignupButton.setAttribute("aria-selected", showSignup ? "true" : "false");
    showLoginButton.setAttribute("aria-selected", showSignup ? "false" : "true");
    setStatusMessage(authFeedback, "", "");
    syncContextualCopyUI();
}

function setButtonLoadingState(button, isLoading, loadingLabel, defaultLabel) {
    if (!button) {
        return;
    }
    button.disabled = isLoading;
    button.textContent = isLoading ? loadingLabel : defaultLabel;
}

function formatMemberSince(isoDate) {
    if (!isoDate) {
        return "-";
    }
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
        return "-";
    }
    return parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function getDefaultProfileName(user) {
    if (!user) {
        return "";
    }
    if (user.displayName && user.displayName.trim()) {
        return user.displayName.trim();
    }
    return user.email || "Plant Parent";
}

function getCurrentUserPlantCount() {
    const activeSession = currentUser ? null : getSession();
    const sessionUserId = currentUser ? currentUser.id : (activeSession && activeSession.userId);
    if (!sessionUserId) {
        return 0;
    }
    const record = getUserDataRecord(sessionUserId, false);
    return record && Array.isArray(record.plants) ? record.plants.length : plants.length;
}

function getPlantTagPreferences(userPlants) {
    const tagCounts = {};
    (Array.isArray(userPlants) ? userPlants : []).forEach(function (plant) {
        normalizeTags(plant.tags).forEach(function (tag) {
            const normalizedTag = tag.toLowerCase();
            tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
        });
    });

    const preferences = [];
    if ((tagCounts.indoor || 0) >= (tagCounts.outdoor || 0) && tagCounts.indoor) {
        preferences.push("Prefers indoor plants");
    }
    if (tagCounts.outdoor) {
        preferences.push("Enjoys outdoor gardening");
    }
    if (tagCounts.herbs) {
        preferences.push("Interested in herbs");
    }
    if (tagCounts.flowers) {
        preferences.push("Likes flowering plants");
    }
    if (tagCounts.succulents) {
        preferences.push("Likes low-maintenance succulents");
    }
    return preferences.slice(0, 3);
}

function syncContextualCopyUI() {
    const isAuthenticated = Boolean(currentUser || getStoredSessionUserId());
    const hasPlants = getCurrentUserPlantCount() > 0;
    const plantCtaText = hasPlants ? "Add another plant" : "Add your first plant";
    const emptyPlantCopy = hasPlants
        ? "Add another plant whenever your collection grows."
        : "Add your first plant to start seeing watering status and care tasks here.";
    const emptyTaskCopy = hasPlants
        ? "New watering tasks will appear here when your plants need attention."
        : "Add your first plant and Green Thumb will create watering tasks automatically.";

    plantCtaElements.forEach(function (element) {
        element.textContent = plantCtaText;
    });
    plantEmptyCopyElements.forEach(function (element) {
        element.textContent = element.closest(".care-task-list") ? emptyTaskCopy : emptyPlantCopy;
    });
    syncAuthCreateCtas(isAuthenticated);
}

function syncProfileUI() {
    if (!currentUser) {
        if (authUserGreeting) {
            authUserGreeting.textContent = "";
        }
        if (profileDisplayName) {
            profileDisplayName.textContent = "";
        }
        if (profileEmail) {
            profileEmail.textContent = "";
        }
        if (profileMemberSince) {
            profileMemberSince.textContent = "-";
        }
        if (profileTotalPlants) {
            profileTotalPlants.textContent = "0";
        }
        if (profileAccountId) {
            profileAccountId.textContent = "-";
            profileAccountId.title = "";
        }
        if (profileRemindersCount) {
            profileRemindersCount.textContent = "0 scheduled reminders";
        }
        if (profileSavedInfoCount) {
            profileSavedInfoCount.textContent = "0 saved items";
        }
        if (profileQuizCount) {
            profileQuizCount.textContent = "0 saved quiz results";
        }
        if (profileRecommendationsCount) {
            profileRecommendationsCount.textContent = "0 saved recommendations";
        }
        if (profilePreferencesStatus) {
            profilePreferencesStatus.textContent = "No preferences saved yet";
        }
        return;
    }
    const userData = getUserDataRecord(currentUser.id, true) || createDefaultUserDataRecord();
    const displayName = getDefaultProfileName(currentUser);

    if (authUserGreeting) {
        authUserGreeting.textContent = `Signed in as ${displayName}`;
    }
    if (profileDisplayName) {
        profileDisplayName.textContent = displayName;
    }
    if (profileEmail) {
        profileEmail.textContent = currentUser.email;
    }
    if (profileMemberSince) {
        profileMemberSince.textContent = formatMemberSince(currentUser.createdAt);
    }
    if (profileTotalPlants) {
        profileTotalPlants.textContent = String(Array.isArray(userData.plants) ? userData.plants.length : 0);
    }
    if (profileAccountId) {
        profileAccountId.textContent = currentUser.id.slice(-8);
        profileAccountId.title = currentUser.id;
    }
    if (profileRemindersCount) {
        const reminders = Array.isArray(userData.reminders) ? userData.reminders : [];
        const careTaskCount = Array.isArray(userData.careTasks)
            ? userData.careTasks.filter(function (task) {
                return task.status !== "completed";
            }).length
            : 0;
        profileRemindersCount.textContent = `${reminders.length + careTaskCount} scheduled reminders`;
    }
    if (profileQuizCount) {
        const quizResults = Array.isArray(userData.quizResults) ? userData.quizResults : [];
        profileQuizCount.textContent = `${quizResults.length} saved quiz results`;
    }
    if (profileRecommendationsCount) {
        const recommendations = Array.isArray(userData.savedRecommendations) ? userData.savedRecommendations : [];
        profileRecommendationsCount.textContent = `${recommendations.length} saved recommendations`;
    }
    if (profileSavedInfoCount) {
        const quizResults = Array.isArray(userData.quizResults) ? userData.quizResults : [];
        const recommendations = Array.isArray(userData.savedRecommendations) ? userData.savedRecommendations : [];
        profileSavedInfoCount.textContent = `${quizResults.length + recommendations.length} saved items`;
    }
    if (profilePreferencesStatus) {
        const inferredPreferences = getPlantTagPreferences(userData.plants);
        profilePreferencesStatus.textContent = inferredPreferences.length > 0
            ? inferredPreferences.join(" • ")
            : "Add plant tags to build simple preferences";
    }
    if (navProfileLink) {
        navProfileLink.setAttribute("aria-label", `${displayName} profile`);
    }
}

function syncNavAuthUI() {
    const isAuthenticated = Boolean(currentUser);
    if (navLoginLink) {
        navLoginLink.hidden = isAuthenticated;
    }
    if (navProfileLink) {
        navProfileLink.hidden = !isAuthenticated;
    }
    if (navLogoutButton) {
        navLogoutButton.hidden = !isAuthenticated;
    }
}

function syncAuthPageSections() {
    const isAuthenticated = Boolean(currentUser);
    if (authViewLoggedOut) {
        authViewLoggedOut.hidden = isAuthenticated;
    }
    if (authViewLoggedIn) {
        authViewLoggedIn.hidden = !isAuthenticated;
    }
}

function hydrateSessionUser() {
    const activeSession = getSession();
    if (!activeSession || !activeSession.userId) {
        currentUser = null;
        return;
    }
    currentUser = getUserById(activeSession.userId);
    if (!currentUser) {
        clearSession();
    }
}

function requireAuthenticatedUser() {
    if (currentUser) {
        return true;
    }
    setStatusMessage(authFeedback, "Please log in to access your tracker.", "error");
    return false;
}

async function logoutCurrentUser() {
    const logoutName = currentUser ? getDefaultProfileName(currentUser) : "";
    currentUser = null;
    plants = [];
    careTasks = [];
    clearSession();
    if (hasTrackerUI) {
        resetPlantForm();
    }
    setStatusMessage(profileFeedback, "", "");
    setStatusMessage(authFeedback, "You are logged out.", "success");
    await applyAuthState();
    showSessionToast(
        logoutName ? `${logoutName}, you are now logged out.` : "You are now logged out.",
        "info"
    );
}

async function createUserAccount(displayName, email, password) {
    const normalizedName = String(displayName || "").trim();
    const normalizedEmail = normalizeEmail(email);
    const passwordValue = String(password || "");
    if (normalizedName.length < 2) {
        throw new Error("Display name must be at least 2 characters.");
    }
    if (!validateEmail(normalizedEmail)) {
        throw new Error("Please enter a valid email address.");
    }
    if (passwordValue.length < 8) {
        throw new Error("Password must be at least 8 characters.");
    }
    if (getUserByEmail(normalizedEmail)) {
        throw new Error("An account with that email already exists.");
    }

    const salt = createPasswordSalt();
    const passwordHash = await hashPassword(passwordValue, salt);
    const users = getStoredUsers();
    const now = new Date().toISOString();
    const user = {
        id: generateId("user"),
        displayName: normalizedName,
        email: normalizedEmail,
        passwordSalt: salt,
        passwordHash,
        createdAt: now,
        updatedAt: now
    };
    users.push(user);
    saveUsers(users);

    updateUserDataRecord(user.id, function (record) {
        return {
            ...createDefaultUserDataRecord(),
            ...record
        };
    });

    currentUser = user;
    setSession(user.id);
    return user;
}

async function loginUser(email, password) {
    const normalizedEmail = normalizeEmail(email);
    const passwordValue = String(password || "");
    if (!validateEmail(normalizedEmail)) {
        throw new Error("Please enter a valid email address.");
    }
    if (!passwordValue) {
        throw new Error("Please enter your password.");
    }

    const user = getUserByEmail(normalizedEmail);
    if (!user) {
        throw new Error("No account found for that email.");
    }
    const candidateHash = await hashPassword(passwordValue, user.passwordSalt);
    if (candidateHash !== user.passwordHash) {
        throw new Error("Email or password is incorrect.");
    }
    currentUser = user;
    setSession(user.id);
    return user;
}

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
    updateSubmitButtonState();
}

function isPlantFormReadyToSubmit() {
    const plantNameInput = document.getElementById("plant-name");
    const plantName = plantNameInput ? plantNameInput.value.trim() : "";
    if (!plantName) {
        return false;
    }

    if (isManualEntryMode) {
        const manualPlantType = manualPlantTypeInput ? manualPlantTypeInput.value.trim() : "";
        const lightNeeds = lightNeedsInput ? lightNeedsInput.value.trim() : "";
        const wateringFrequency = wateringFrequencyInput ? wateringFrequencyInput.value.trim() : "";
        return Boolean(manualPlantType && lightNeeds && wateringFrequency);
    }

    const guidedPlantType = plantPickerSearch ? plantPickerSearch.value.trim() : "";
    return Boolean(guidedPlantType);
}

function updateSubmitButtonState() {
    if (!plantSubmitButton) {
        return;
    }

    const isReady = isPlantFormReadyToSubmit();
    plantSubmitButton.disabled = !isReady;
    plantSubmitButton.classList.toggle("is-ready", isReady);
    plantSubmitButton.classList.toggle("is-not-ready", !isReady);
}

function syncGardenPanelHeightToForm() {
    if (!plantForm || !savedPlantsPanel) {
        return;
    }

    const desktopLayout = window.matchMedia("(min-width: 1100px)").matches;
    if (!desktopLayout) {
        savedPlantsPanel.style.height = "";
        return;
    }

    const formHeight = plantForm.getBoundingClientRect().height;
    savedPlantsPanel.style.height = `${Math.ceil(formHeight)}px`;
}

function setManualEntryMode(isManual, options) {
    const normalizedOptions = options || {};
    const preserveStatus = Boolean(normalizedOptions.preserveStatus);
    isManualEntryMode = isManual;

    manualOnlyFields.forEach(function (field) {
        field.hidden = !isManual;
        field.style.display = isManual ? "" : "none";
    });

    // Ensure manual-only rows remain hidden until manual entry is explicitly enabled.
    if (manualPlantTypeField) {
        manualPlantTypeField.hidden = !isManual;
        manualPlantTypeField.style.display = isManual ? "" : "none";
    }
    if (lightNeedsField) {
        lightNeedsField.hidden = !isManual;
        lightNeedsField.style.display = isManual ? "" : "none";
    }

    if (plantPickerSearch) {
        plantPickerSearch.required = !isManual;
    }

    if (manualPlantTypeInput) {
        manualPlantTypeInput.required = isManual;
    }

    if (lightNeedsInput) {
        lightNeedsInput.required = isManual;
    }

    if (wateringFrequencyInput) {
        wateringFrequencyInput.required = isManual;
    }

    if (manualEntryButton) {
        manualEntryButton.textContent = isManual
            ? "Use plant database instead"
            : "Add Plant Details Manually";
    }

    if (!preserveStatus) {
        if (isManual) {
            setAutofillStatus("Manual entry enabled. Add nickname, plant type, light, and watering schedule.");
        } else {
            setAutofillStatus("");
        }
    }

    updateSubmitButtonState();
    syncGardenPanelHeightToForm();
}

function resetPlantForm() {
    if (!plantForm) {
        return;
    }
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

    syncGardenPanelHeightToForm();
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
        updateSubmitButtonState();
        return;
    }

    setManualEntryMode(true);
    clearSelectedPlantProfile();
    if (plantPickerSearch) {
        plantPickerSearch.value = "";
    }
    if (manualPlantTypeInput) {
        manualPlantTypeInput.value = "";
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
    updateSubmitButtonState();
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
        plantPickerSearch.value = matchingProfile ? (plant.plantType || "") : "";
    }
    if (plantNameInput) {
        plantNameInput.value = plant.plantName || "";
    }
    if (plantTypeInput) {
        plantTypeInput.value = plant.plantType || "";
    }
    if (manualPlantTypeInput) {
        manualPlantTypeInput.value = matchingProfile ? "" : (plant.plantType || "");
    }
    if (lightNeedsInput) {
        lightNeedsInput.value = plant.lightNeeds || "";
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

    updateSubmitButtonState();
    syncGardenPanelHeightToForm();
}

const featureDetails = {
    watering: {
        emoji: "🌿",
        title: "Personalized Watering",
        text: "Green Thumb creates watering reminders for each plant instead of using one generic schedule. Timing adapts based on your plant type and care history."
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

    if (wateringFrequencyInput) {
        wateringFrequencyInput.value = String(getWateringDefaultDays(plant.wateringNeed));
    }

    setAutofillStatus(`Auto-filled care defaults for ${plant.commonName}.`);
    renderPlantPickerResults([], { showEmptyState: false });
    updateSubmitButtonState();
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
        if (plantTypeInput) {
            plantTypeInput.value = query.trim();
        }
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
    const createdAtTimestamp = getSortValueTimestamp(plant.createdAt, 0);
    if (createdAtTimestamp) {
        return createdAtTimestamp;
    }
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
    if (!currentUser) {
        return;
    }
    const sortPreferences = getStorageJSON(SORT_STORAGE_KEY, {});
    sortPreferences[currentUser.id] = activeSort;
    setStorageJSON(SORT_STORAGE_KEY, sortPreferences);
}

function loadSortPreference() {
    if (!currentUser) {
        activeSort = "newest_added";
        return;
    }
    const sortPreferences = getStorageJSON(SORT_STORAGE_KEY, {});
    let storedSort = "";
    if (sortPreferences && typeof sortPreferences === "object") {
        storedSort = sortPreferences[currentUser.id] || "";
    }

    if (!storedSort) {
        storedSort = getLegacySortPreference();
    }
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

    plants.forEach(function (plant) {
        const status = getPlantStatus(plant);
        if (status === "Needs Water" || status === "Overdue") {
            needsWaterCount += 1;
        }
    });

    summaryTotalPlants.textContent = String(totalPlants);
    summaryNeedsWater.textContent = String(needsWaterCount);
}

async function loadPlants() {
    if (!currentUser) {
        plants = [];
        return;
    }

    await reloadGardenStateFromStorage();
}

async function reloadGardenStateFromStorage() {
    if (!currentUser) {
        plants = [];
        careTasks = [];
        return;
    }
    plants = await plantDataService.listPlants(currentUser.id);
    careTasks = taskDataService.reconcileWateringTasks(currentUser.id, plants);
}

function normalizePlantRecord(plant, userId, fallbackIndex) {
    const safePlant = plant && typeof plant === "object" ? plant : {};
    const fallbackCreatedAt = typeof fallbackIndex === "number"
        ? new Date(Date.now() - fallbackIndex).toISOString()
        : new Date().toISOString();
    const createdAt = safePlant.createdAt || fallbackCreatedAt;
    const updatedAt = safePlant.updatedAt || createdAt;
    const customName = String(safePlant.customName || safePlant.plantName || "").trim();

    return {
        id: String(safePlant.id || generateId("plant")),
        userId,
        plantName: customName,
        customName,
        plantType: String(safePlant.plantType || "").trim(),
        plantProfileId: String(safePlant.plantProfileId || "").trim(),
        scientificName: String(safePlant.scientificName || "").trim(),
        lightNeeds: String(safePlant.lightNeeds || "").trim(),
        wateringNeeds: String(safePlant.wateringNeeds || "").trim(),
        wateringFrequency: String(safePlant.wateringFrequency || "7").trim(),
        notes: String(safePlant.notes || "").trim(),
        tags: normalizeTags(safePlant.tags),
        lastWateredDate: safePlant.lastWateredDate || formatDateForInput(getStartOfToday()),
        createdAt,
        updatedAt
    };
}

function normalizeTaskRecord(task, userId) {
    const safeTask = task && typeof task === "object" ? task : {};
    const now = new Date().toISOString();
    return {
        id: String(safeTask.id || generateId("task")),
        userId,
        plantId: String(safeTask.plantId || "").trim(),
        type: safeTask.type === "watering" ? "watering" : "watering",
        title: String(safeTask.title || "Water plant").trim(),
        dueDate: String(safeTask.dueDate || formatDateForInput(getStartOfToday())).trim(),
        status: safeTask.status === "completed" ? "completed" : "open",
        completedAt: safeTask.completedAt || null,
        createdAt: safeTask.createdAt || now,
        updatedAt: safeTask.updatedAt || now
    };
}

function getNextWateringDateString(plant) {
    const lastWatered = parseDateInput(plant.lastWateredDate) || getStartOfToday();
    const frequencyDays = Number.parseInt(plant.wateringFrequency, 10);
    const safeFrequency = Number.isFinite(frequencyDays) && frequencyDays > 0 ? frequencyDays : 7;
    return formatDateForInput(addDays(lastWatered, safeFrequency));
}

function shouldCreateWateringTaskForPlant(plant) {
    const nextWateringDate = parseDateInput(getNextWateringDateString(plant));
    if (!nextWateringDate) {
        return false;
    }
    // Tasks are generated only when action is actually due, so completing a task does not recreate it immediately.
    return getDayDifferenceFromToday(nextWateringDate) <= 0;
}

function createWateringTask(userId, plant) {
    const now = new Date().toISOString();
    return normalizeTaskRecord({
        id: generateId("task"),
        userId,
        plantId: plant.id,
        type: "watering",
        title: `Water ${plant.plantName}`,
        dueDate: getNextWateringDateString(plant),
        status: "open",
        createdAt: now,
        updatedAt: now
    }, userId);
}

function getTaskDueLabel(task) {
    const parsedDueDate = parseDateInput(task.dueDate);
    if (!parsedDueDate) {
        return "Due date unknown";
    }
    const relativeLabel = getRelativeNextWateringLabel(parsedDueDate);
    return relativeLabel.startsWith("overdue") ? relativeLabel : `Due ${relativeLabel}`;
}

function getTaskUrgencyClass(task) {
    const parsedDueDate = parseDateInput(task.dueDate);
    if (!parsedDueDate) {
        return "";
    }
    const dayDifference = getDayDifferenceFromToday(parsedDueDate);
    if (dayDifference < 0) {
        return "overdue";
    }
    if (dayDifference === 0) {
        return "due-today";
    }
    return "";
}

function getTaskDayDifference(task) {
    const parsedDueDate = parseDateInput(task.dueDate);
    if (!parsedDueDate) {
        return Number.POSITIVE_INFINITY;
    }
    return getDayDifferenceFromToday(parsedDueDate);
}

function isTaskVisibleInUpcomingWindow(task) {
    if (task.status !== "open") {
        return false;
    }
    const dayDifference = getTaskDayDifference(task);
    // Central visibility rule: show overdue tasks and tasks due soon, hide far-future care.
    return dayDifference <= UPCOMING_TASK_WINDOW_DAYS;
}

function sortOpenTasks(tasksToSort) {
    return tasksToSort.slice().sort(function (a, b) {
        const aDue = getSortValueTimestamp(a.dueDate, Number.MAX_SAFE_INTEGER);
        const bDue = getSortValueTimestamp(b.dueDate, Number.MAX_SAFE_INTEGER);
        return aDue - bDue;
    });
}

function renderCareTasks() {
    if (!hasTaskUI) {
        return;
    }

    careTaskList.innerHTML = "";
    const visibleTasks = taskDataService.getVisibleTasks(careTasks);
    const taskLabel = visibleTasks.length === 1 ? "upcoming task" : "upcoming tasks";
    taskCountSummary.textContent = `${visibleTasks.length} ${taskLabel}`;
    careTaskList.classList.toggle("has-scrollable-tasks", visibleTasks.length > 0);

    if (visibleTasks.length === 0) {
        careTaskList.appendChild(createCompactTaskEmptyState());
        syncContextualCopyUI();
        return;
    }

    visibleTasks.forEach(function (task) {
        careTaskList.appendChild(createCareTaskCard(task));
    });
    syncContextualCopyUI();
}

function createCompactTaskEmptyState() {
    const emptyState = document.createElement("button");
    emptyState.type = "button";
    emptyState.className = "task-empty-toggle";
    emptyState.setAttribute("aria-expanded", "false");

    const title = document.createElement("span");
    title.textContent = plants.length === 0 ? "No watering tasks yet" : "No tasks due soon";

    const detail = document.createElement("small");
    detail.textContent = "No tasks for the next 3 days";

    emptyState.appendChild(title);
    emptyState.appendChild(detail);
    emptyState.addEventListener("click", function () {
        const isExpanded = emptyState.getAttribute("aria-expanded") === "true";
        emptyState.setAttribute("aria-expanded", isExpanded ? "false" : "true");
    });

    return emptyState;
}

function createCareTaskCard(task) {
    const card = document.createElement("article");
    card.className = "care-task-card";
    const urgencyClass = getTaskUrgencyClass(task);
    if (urgencyClass) {
        card.classList.add(urgencyClass);
    }

    const plant = plants.find(function (currentPlant) {
        return currentPlant.id === task.plantId;
    });

    const title = document.createElement("p");
    title.className = "care-task-title";
    title.textContent = task.title;
    card.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "care-task-meta";
    meta.textContent = plant
        ? `${getTaskDueLabel(task)} | ${plant.plantType || "Plant"}`
        : getTaskDueLabel(task);
    card.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "care-task-actions";
    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = "card-action-btn";
    completeButton.textContent = "Mark Complete";
    completeButton.addEventListener("click", async function () {
        if (!requireAuthenticatedUser()) {
            return;
        }
        completeButton.disabled = true;
        completeButton.textContent = "Saving...";
        try {
            await taskDataService.completeTask(currentUser.id, task.id);
            await reloadGardenStateFromStorage();
            renderPlants();
            renderCareTasks();
            syncProfileUI();
            showSessionToast("Watering task completed.", "success");
        } catch (error) {
            handlePlantDataError(error, "Unable to complete this task.");
            completeButton.disabled = false;
            completeButton.textContent = "Mark Complete";
        }
    });
    actions.appendChild(completeButton);
    card.appendChild(actions);
    return card;
}

function setPlantDataStatus(message, type) {
    setStatusMessage(plantAutofillStatus, message, type);
}

function setPlantDataLoading(isLoading, label) {
    if (!plantSubmitButton) {
        return;
    }
    if (isLoading) {
        plantSubmitButton.dataset.previousLabel = plantSubmitButton.textContent || "Add Plant";
        plantSubmitButton.disabled = true;
        plantSubmitButton.textContent = label || "Saving...";
        return;
    }

    const previousLabel = plantSubmitButton.dataset.previousLabel || "";
    plantSubmitButton.disabled = false;
    if (previousLabel) {
        plantSubmitButton.textContent = previousLabel;
        delete plantSubmitButton.dataset.previousLabel;
    }
    updateSubmitButtonState();
}

function handlePlantDataError(error, fallbackMessage) {
    const message = error && error.message ? error.message : fallbackMessage;
    setPlantDataStatus(message, "error");
    showSessionToast(message, "error");
}

function clearPlantDashboard() {
    plants = [];
    careTasks = [];
    activeFilter = "All Plants";
    activeTagFilter = "All Tags";
    activeSort = "newest_added";
    if (statusFilter) {
        statusFilter.value = "All Plants";
    }
    if (tagFilter) {
        tagFilter.value = "All Tags";
    }
    if (sortMenu) {
        sortMenu.removeAttribute("open");
    }
    applySortUIState();
    renderPlants();
    renderCareTasks();
}

async function applyTrackerAccessState() {
    if (!hasTrackerUI) {
        return;
    }
    if (currentUser) {
        if (trackerLockedState) {
            trackerLockedState.hidden = true;
        }
        if (trackerAuthenticatedContent) {
            trackerAuthenticatedContent.hidden = false;
        }
        loadSortPreference();
        applySortUIState();
        try {
            setPlantDataStatus("Loading your garden...", "success");
            await loadPlants();
            renderPlants();
            renderCareTasks();
            setPlantDataStatus("", "");
        } catch (error) {
            plants = [];
            careTasks = [];
            renderPlants();
            renderCareTasks();
            handlePlantDataError(error, "Unable to load your plants right now.");
        }
    } else {
        if (trackerLockedState) {
            trackerLockedState.hidden = false;
        }
        if (trackerAuthenticatedContent) {
            trackerAuthenticatedContent.hidden = true;
        }
        clearPlantDashboard();
    }
    syncGardenPanelHeightToForm();
}

async function applyAuthState() {
    syncNavAuthUI();
    syncAuthPageSections();
    await applyTrackerAccessState();
    syncProfileUI();
    syncContextualCopyUI();
}

async function initializeAuthState() {
    hydrateSessionUser();
    await applyAuthState();
}

function initializeAuthUIListeners() {
    if (showLoginButton) {
        showLoginButton.addEventListener("click", function () {
            setAuthMode("login");
        });
    }

    if (showSignupButton) {
        showSignupButton.addEventListener("click", function () {
            setAuthMode("signup");
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            setStatusMessage(authFeedback, "", "");
            const formData = new FormData(loginForm);
            const email = String(formData.get("email") || "");
            const password = String(formData.get("password") || "");

            try {
                setButtonLoadingState(loginSubmitButton, true, "Logging In...", "Log In");
                await loginUser(email, password);
                setStatusMessage(authFeedback, "Logged in successfully.", "success");
                setStatusMessage(profileFeedback, "", "");
                await applyAuthState();
                resetPlantForm();
                showSessionToast(`Welcome back, ${getDefaultProfileName(currentUser)}.`, "success");
            } catch (error) {
                setStatusMessage(authFeedback, error.message || "Unable to log in right now.", "error");
                showSessionToast(error.message || "Unable to log in right now.", "error");
            } finally {
                setButtonLoadingState(loginSubmitButton, false, "Logging In...", "Log In");
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            setStatusMessage(authFeedback, "", "");
            const formData = new FormData(signupForm);
            const displayName = String(formData.get("displayName") || "");
            const email = String(formData.get("email") || "");
            const password = String(formData.get("password") || "");

            try {
                setButtonLoadingState(signupSubmitButton, true, "Creating Account...", "Create Account");
                await createUserAccount(displayName, email, password);
                setStatusMessage(authFeedback, "Account created and logged in.", "success");
                setStatusMessage(profileFeedback, "", "");
                await applyAuthState();
                resetPlantForm();
                signupForm.reset();
                loginForm.reset();
                showSessionToast(`Welcome to Green Thumb, ${getDefaultProfileName(currentUser)}.`, "success");
            } catch (error) {
                setStatusMessage(authFeedback, error.message || "Unable to create your account right now.", "error");
                showSessionToast(error.message || "Unable to create your account right now.", "error");
            } finally {
                setButtonLoadingState(signupSubmitButton, false, "Creating Account...", "Create Account");
            }
        });
    }

    async function handleLogoutClick() {
        await logoutCurrentUser();
    }

    if (profileLogoutButton) {
        profileLogoutButton.addEventListener("click", handleLogoutClick);
    }
    if (navLogoutButton) {
        navLogoutButton.addEventListener("click", handleLogoutClick);
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
    if (plant.lightNeeds) {
        addDetail("Light", plant.lightNeeds);
    }
    addDetail("Watering schedule", `Every ${plant.wateringFrequency || 7} days`);
    if (plant.notes) {
        addDetail("Notes", plant.notes);
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
    wateredButton.addEventListener("click", async function (event) {
        event.stopPropagation();
        if (!requireAuthenticatedUser()) {
            return;
        }
        const previousLabel = wateredButton.textContent;
        wateredButton.disabled = true;
        wateredButton.textContent = "Saving...";
        try {
            taskDataService.completeOpenWateringTaskForPlant(currentUser.id, plant.id);
            await reloadGardenStateFromStorage();
            const updatedPlant = plants.find(function (currentPlant) {
                return currentPlant.id === plant.id;
            });
            if (updatedPlant) {
                Object.assign(plant, updatedPlant);
            }
            refreshWateringDetails();
            updateDashboardSummary();
            renderCareTasks();
            syncProfileUI();
        } catch (error) {
            handlePlantDataError(error, "Unable to update watering status.");
        } finally {
            wateredButton.disabled = false;
            wateredButton.textContent = previousLabel;
        }
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "card-action-btn delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async function (event) {
        event.stopPropagation();
        if (!requireAuthenticatedUser()) {
            return;
        }
        const previousLabel = deleteButton.textContent;
        deleteButton.disabled = true;
        deleteButton.textContent = "Deleting...";
        try {
            await plantDataService.deletePlant(currentUser.id, plant.id);
            plants = await plantDataService.listPlants(currentUser.id);
            careTasks = taskDataService.reconcileWateringTasks(currentUser.id, plants);
            renderPlants();
            renderCareTasks();
            syncProfileUI();
            showSessionToast(`${plant.plantName} was removed from your garden.`, "success");
        } catch (error) {
            handlePlantDataError(error, "Unable to delete this plant.");
            deleteButton.disabled = false;
            deleteButton.textContent = previousLabel;
        }
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
        plantCountSummary.textContent = "";
        const state = document.createElement("div");
        state.id = "empty-state";
        state.className = "empty-state empty-state-card";
        const title = document.createElement("h4");
        title.textContent = "No plants yet";
        const copy = document.createElement("p");
        copy.textContent = "Add your first plant to start seeing watering status and care tasks here.";
        copy.dataset.plantEmptyCopy = "";
        const action = document.createElement("a");
        action.className = "cta-button";
        action.href = "#plant-form";
        action.dataset.plantCta = "";
        action.textContent = "Add your first plant";
        plantEmptyCopyElements.push(copy);
        plantCtaElements.push(action);
        state.appendChild(title);
        state.appendChild(copy);
        state.appendChild(action);
        plantCards.appendChild(state);
        updateExpandCollapseControls();
        syncGardenPanelHeightToForm();
        syncContextualCopyUI();
        return;
    }

    const filteredPlants = plants.filter(function (plant) {
        const matchesStatus = activeFilter === "All Plants" || getPlantStatus(plant) === activeFilter;
        const normalizedTags = normalizeTags(plant.tags);
        const matchesTag = activeTagFilter === "All Tags" || normalizedTags.includes(activeTagFilter);
        return matchesStatus && matchesTag;
    });

    if (activeFilter === "All Plants" && activeTagFilter === "All Tags") {
        plantCountSummary.textContent = "";
    } else {
        const filteredLabel = filteredPlants.length === 1 ? "plant" : "plants";
        const activeFilterLabels = [];
        if (activeFilter !== "All Plants") {
            activeFilterLabels.push(activeFilter);
        }
        if (activeTagFilter !== "All Tags") {
            activeFilterLabels.push(`Tag: ${activeTagFilter}`);
        }
        plantCountSummary.textContent = `${filteredPlants.length} ${filteredLabel} (${activeFilterLabels.join(", ")})`;
    }

    if (filteredPlants.length === 0) {
        const state = document.createElement("p");
        state.id = "empty-state";
        state.className = "empty-state";
        const emptyFilterLabels = [];
        if (activeFilter !== "All Plants") {
            emptyFilterLabels.push(activeFilter);
        }
        if (activeTagFilter !== "All Tags") {
            emptyFilterLabels.push(`Tag: ${activeTagFilter}`);
        }
        state.textContent = emptyFilterLabels.length > 0
            ? `No plants match "${emptyFilterLabels.join(", ")}".`
            : "No plants match your current filters.";
        plantCards.appendChild(state);
        updateExpandCollapseControls();
        syncGardenPanelHeightToForm();
        return;
    }

    const sortedPlants = sortPlants(filteredPlants, activeSort);

    sortedPlants.forEach(function (plant) {
        const card = createPlantCard(plant);
        plantCards.appendChild(card);
    });
    updateExpandCollapseControls();
    syncGardenPanelHeightToForm();
}

if (hasTrackerUI) {
    plantForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!requireAuthenticatedUser()) {
            return;
        }

        const formData = new FormData(plantForm);
        const plantName = String(formData.get("plantName") || "").trim();
        const typedPlantType = plantPickerSearch ? plantPickerSearch.value.trim() : "";
        const manualPlantType = String(formData.get("manualPlantType") || "").trim();
        const plantType = isManualEntryMode
            ? manualPlantType
            : (typedPlantType || String(formData.get("plantType") || "").trim());
        const notes = String(formData.get("notes") || "").trim();
        const tags = getSelectedTags();
        let wateringNeeds = "";
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
        } else {
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
            customName: plantName,
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

        try {
            setPlantDataLoading(true, editingPlantId ? "Saving..." : "Adding...");
            if (editingPlantId) {
                await plantDataService.updatePlant(currentUser.id, editingPlantId, nextPlantData);
                showSessionToast(`${plantName} was updated.`, "success");
            } else {
                await plantDataService.createPlant(currentUser.id, {
                    ...nextPlantData,
                    lastWateredDate: formatDateForInput(getStartOfToday())
                });
                showSessionToast(`${plantName} was added to your garden.`, "success");
            }
            plants = await plantDataService.listPlants(currentUser.id);
            careTasks = taskDataService.reconcileWateringTasks(currentUser.id, plants);
            renderPlants();
            renderCareTasks();
            resetPlantForm();
            syncProfileUI();
        } catch (error) {
            handlePlantDataError(error, "Unable to save this plant.");
        } finally {
            setPlantDataLoading(false);
        }
    });

    if (manualEntryButton) {
        manualEntryButton.addEventListener("click", activateManualEntryMode);
    }

    plantForm.addEventListener("input", updateSubmitButtonState);
    plantForm.addEventListener("change", updateSubmitButtonState);

    statusFilter.addEventListener("change", function (event) {
        activeFilter = event.target.value;
        renderPlants();
    });

    if (tagFilter) {
        tagFilter.addEventListener("change", function (event) {
            activeTagFilter = event.target.value;
            renderPlants();
        });
    }

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

    applySortUIState();
    populatePlantTypeSuggestions();
    initializePlantPicker();
    setManualEntryMode(false, { preserveStatus: true });
    setPlantFormMode(false);
    syncGardenPanelHeightToForm();
    updateSubmitButtonState();
}

setAuthMode("login");
initializeAuthUIListeners();
initializeAuthState();

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

window.addEventListener("resize", syncGardenPanelHeightToForm);
