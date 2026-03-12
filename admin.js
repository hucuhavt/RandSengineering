const store = window.RandsContentStore;
const AUTH_SESSION_KEY = "randsengineering-admin-auth-session-v2";

const authPanel = document.getElementById("authPanel");
const editorSection = document.getElementById("editorSection");
const authForm = document.getElementById("authForm");
const adminLoginInput = document.getElementById("adminLoginInput");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const authStatus = document.getElementById("authStatus");

const currentSessionInfo = document.getElementById("currentSessionInfo");
const saveContentBtn = document.getElementById("saveContentBtn");
const exportContentBtn = document.getElementById("exportContentBtn");
const importContentBtn = document.getElementById("importContentBtn");
const importContentFile = document.getElementById("importContentFile");
const resetContentBtn = document.getElementById("resetContentBtn");
const logoutBtn = document.getElementById("logoutBtn");
const globalStatus = document.getElementById("globalStatus");
const contentLanguageSelect = document.getElementById("contentLanguageSelect");
const sectionLanguageSelects = Array.from(
    document.querySelectorAll("[data-section-language-select]")
);

const adminUsersPanel = document.getElementById("adminUsersPanel");
const createAdminForm = document.getElementById("createAdminForm");
const newAdminLoginInput = document.getElementById("newAdminLoginInput");
const newAdminPasswordInput = document.getElementById("newAdminPasswordInput");
const newAdminRoleInput = document.getElementById("newAdminRoleInput");
const adminUsersStatus = document.getElementById("adminUsersStatus");
const adminUsersList = document.getElementById("adminUsersList");

const aboutEyebrowInput = document.getElementById("aboutEyebrowInput");
const aboutTitleInput = document.getElementById("aboutTitleInput");
const sectionLabelObjectsInput = document.getElementById("sectionLabelObjectsInput");
const sectionLabelExamplesInput = document.getElementById("sectionLabelExamplesInput");
const sectionLabelWorkersInput = document.getElementById("sectionLabelWorkersInput");
const sectionLabelReviewsInput = document.getElementById("sectionLabelReviewsInput");
const sectionLabelContactInput = document.getElementById("sectionLabelContactInput");
const objectsEyebrowInput = document.getElementById("objectsEyebrowInput");
const objectsTitleInput = document.getElementById("objectsTitleInput");
const examplesEyebrowInput = document.getElementById("examplesEyebrowInput");
const examplesTitleInput = document.getElementById("examplesTitleInput");
const workersEyebrowInput = document.getElementById("workersEyebrowInput");
const workersTitleInput = document.getElementById("workersTitleInput");
const reviewsEyebrowInput = document.getElementById("reviewsEyebrowInput");
const reviewsTitleInput = document.getElementById("reviewsTitleInput");
const contactEyebrowInput = document.getElementById("contactEyebrowInput");
const contactTitleInput = document.getElementById("contactTitleInput");
const contactDescriptionInput = document.getElementById("contactDescriptionInput");
const contactPhoneInput = document.getElementById("contactPhoneInput");
const contactEmailInput = document.getElementById("contactEmailInput");
const contactRequestEmailInput = document.getElementById(
    "contactRequestEmailInput"
);
const contactSubmitLabelInput = document.getElementById("contactSubmitLabelInput");
const contactModalTitleInput = document.getElementById("contactModalTitleInput");
const contactModalDescriptionInput = document.getElementById(
    "contactModalDescriptionInput"
);
const contactSuccessMessageInput = document.getElementById(
    "contactSuccessMessageInput"
);
const contactObjectTypesInput = document.getElementById("contactObjectTypesInput");
const footerCopyrightInput = document.getElementById("footerCopyrightInput");
const footerSocialLinksEditor = document.getElementById("footerSocialLinksEditor");
const addFooterSocialLinkBtn = document.getElementById("addFooterSocialLinkBtn");

const aboutItemsEditor = document.getElementById("aboutItemsEditor");
const objectsItemsEditor = document.getElementById("objectsItemsEditor");
const examplesItemsEditor = document.getElementById("examplesItemsEditor");
const workersItemsEditor = document.getElementById("workersItemsEditor");
const reviewsItemsEditor = document.getElementById("reviewsItemsEditor");

const addAboutItemBtn = document.getElementById("addAboutItemBtn");
const addObjectItemBtn = document.getElementById("addObjectItemBtn");
const addExampleItemBtn = document.getElementById("addExampleItemBtn");
const addWorkerItemBtn = document.getElementById("addWorkerItemBtn");
const addReviewItemBtn = document.getElementById("addReviewItemBtn");
const clearUserReviewsBtn = document.getElementById("clearUserReviewsBtn");
const refreshPendingReviewsBtn = document.getElementById(
    "refreshPendingReviewsBtn"
);
const pendingReviewsStatus = document.getElementById("pendingReviewsStatus");
const pendingReviewsList = document.getElementById("pendingReviewsList");
const refreshApprovedReviewsBtn = document.getElementById(
    "refreshApprovedReviewsBtn"
);
const approvedReviewsStatus = document.getElementById("approvedReviewsStatus");
const approvedReviewsList = document.getElementById("approvedReviewsList");
const sectionSaveButtons = Array.from(
    document.querySelectorAll("[data-section-save]")
);
const sectionResetButtons = Array.from(
    document.querySelectorAll("[data-section-reset]")
);
const editorSectionNavButtons = Array.from(
    document.querySelectorAll("[data-editor-section-target]")
);
const editorSectionPanels = Array.from(
    document.querySelectorAll("[data-editor-section-panel]")
);
const collapsiblePanels = Array.from(
    document.querySelectorAll(".panel-collapsible")
);

let contentState = null;
let currentAdmin = null;
let staticHandlersBound = false;
let activeContentLanguage = store?.DEFAULT_LANGUAGE || "ru";
let activeEditorSectionId = "workspacePanel";

const CONTENT_LANGUAGE_LABELS = {
    ru: "Русский",
    en: "English",
    he: "עברית"
};

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value || "");
    return div.innerHTML;
}

function setStatus(element, message, type = "") {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = "status";
    if (type) {
        element.classList.add(type);
    }
}

function getSectionSaveFeedbackElement(button) {
    if (!button) {
        return null;
    }

    const sectionPanel = button.closest("[data-editor-section-panel]");
    if (!sectionPanel) {
        return null;
    }

    const controlsRow =
        button.closest(".section-actions") || button.closest(".toolbar") || sectionPanel;
    let feedback = controlsRow.querySelector(".section-save-feedback");
    if (!feedback) {
        feedback = document.createElement("p");
        feedback.className = "status section-save-feedback";
        controlsRow.append(feedback);
    }
    return feedback;
}

function showSectionSaveFeedback(button, message, type = "") {
    const feedback = getSectionSaveFeedbackElement(button);
    if (!feedback) {
        return;
    }
    setStatus(feedback, message, type);
}

function sanitizeLogin(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function isStrongAdminPassword(value) {
    const password = String(value || "").trim();
    return (
        password.length >= 10 &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /\d/.test(password)
    );
}

function roleLabel(roleId) {
    return store.roleLabel(roleId);
}

function hasPermission(permission) {
    if (!currentAdmin) {
        return false;
    }
    return store.hasPermission(currentAdmin.role, permission);
}

function getSupportedLanguageIds() {
    const ids = Array.isArray(store?.LANGUAGE_IDS) ? store.LANGUAGE_IDS : [];
    if (ids.length) {
        return ids;
    }
    return ["ru", "en", "he"];
}

function getLanguageLabel(languageId) {
    return CONTENT_LANGUAGE_LABELS[languageId] || languageId;
}

function getDefaultLanguageContent(languageId) {
    const fallbackDefaults = store?.getDefaultContent?.();
    const translated =
        fallbackDefaults?.translations?.[languageId] ||
        fallbackDefaults?.translations?.[store?.DEFAULT_LANGUAGE || "ru"] ||
        null;
    return translated ? clone(translated) : null;
}

function ensureMultiLanguageState() {
    if (!contentState) {
        return;
    }

    if (!contentState.translations || typeof contentState.translations !== "object") {
        contentState.translations = {};
    }

    getSupportedLanguageIds().forEach((languageId) => {
        if (!contentState.translations[languageId]) {
            const fallback = getDefaultLanguageContent(languageId);
            if (fallback) {
                contentState.translations[languageId] = fallback;
            }
        }
    });

    if (!getSupportedLanguageIds().includes(activeContentLanguage)) {
        activeContentLanguage = store?.DEFAULT_LANGUAGE || "ru";
    }
    if (!contentState.activeLanguage || !getSupportedLanguageIds().includes(contentState.activeLanguage)) {
        contentState.activeLanguage = activeContentLanguage;
    }
}

function getActiveLanguageContent() {
    if (!contentState) {
        return null;
    }
    ensureMultiLanguageState();

    const fallbackLanguage = store?.DEFAULT_LANGUAGE || "ru";
    return (
        contentState.translations[activeContentLanguage] ||
        contentState.translations[fallbackLanguage] ||
        null
    );
}

function updateLanguageSelectUi() {
    const allLanguageSelects = [contentLanguageSelect, ...sectionLanguageSelects].filter(
        Boolean
    );
    if (allLanguageSelects.length === 0) {
        return;
    }

    const supportedLanguageIds = getSupportedLanguageIds();
    allLanguageSelects.forEach((select) => {
        const shouldRebuildOptions =
            select.options.length !== supportedLanguageIds.length ||
            supportedLanguageIds.some((languageId, index) => {
                const option = select.options[index];
                return (
                    !option ||
                    option.value !== languageId ||
                    option.textContent !== getLanguageLabel(languageId)
                );
            });

        if (!shouldRebuildOptions) {
            return;
        }

        select.innerHTML = "";
        supportedLanguageIds.forEach((languageId) => {
            const option = document.createElement("option");
            option.value = languageId;
            option.textContent = getLanguageLabel(languageId);
            select.append(option);
        });
    });

    allLanguageSelects.forEach((select) => {
        select.value = activeContentLanguage;
    });
}

function setActiveContentLanguage(languageId) {
    if (!getSupportedLanguageIds().includes(languageId)) {
        return;
    }
    activeContentLanguage = languageId;
    if (contentState) {
        contentState.activeLanguage = languageId;
    }
    updateLanguageSelectUi();
    fillBaseInputs();
    renderAllDynamicEditors();
    applyPermissions();
}

function syncActiveLanguageFromState() {
    ensureMultiLanguageState();
    const stateLanguage =
        contentState?.activeLanguage || store?.DEFAULT_LANGUAGE || "ru";
    if (getSupportedLanguageIds().includes(stateLanguage)) {
        activeContentLanguage = stateLanguage;
    } else {
        activeContentLanguage = store?.DEFAULT_LANGUAGE || "ru";
        if (contentState) {
            contentState.activeLanguage = activeContentLanguage;
        }
    }
    updateLanguageSelectUi();
}

function showEditor() {
    authPanel.classList.add("hidden");
    editorSection.classList.remove("hidden");
    document.body.classList.remove("auth-mode");
}

function showAuth() {
    authPanel.classList.remove("hidden");
    editorSection.classList.add("hidden");
    document.body.classList.add("auth-mode");
}

function setPanelState(panel, isOpen) {
    const toggle = panel.querySelector("[data-panel-toggle]");
    if (!toggle) {
        return;
    }

    panel.classList.toggle("is-open", isOpen);
    toggle.textContent = isOpen ? "Скрыть" : "Открыть";
    toggle.setAttribute("aria-expanded", String(isOpen));
}

function setupCollapsiblePanels() {
    if (!collapsiblePanels.length) {
        return;
    }

    collapsiblePanels.forEach((panel) => {
        setPanelState(panel, panel.classList.contains("is-open"));
        const toggle = panel.querySelector("[data-panel-toggle]");
        if (!toggle) {
            return;
        }

        toggle.addEventListener("click", () => {
            const shouldOpen = !panel.classList.contains("is-open");
            collapsiblePanels.forEach((otherPanel) => {
                if (otherPanel !== panel) {
                    setPanelState(otherPanel, false);
                }
            });
            setPanelState(panel, shouldOpen);
        });
    });
}

function activateEditorSection(sectionId) {
    if (!editorSectionPanels.length) {
        return;
    }

    const visiblePanels = editorSectionPanels.filter(
        (panel) => !panel.classList.contains("hidden")
    );
    if (!visiblePanels.length) {
        return;
    }

    const selectedPanel =
        visiblePanels.find((panel) => panel.id === sectionId) || visiblePanels[0];
    activeEditorSectionId = selectedPanel.id;

    editorSectionPanels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.id === activeEditorSectionId);
    });

    editorSectionNavButtons.forEach((button) => {
        const targetId = button.getAttribute("data-editor-section-target");
        const targetPanel = editorSectionPanels.find(
            (panel) => panel.id === targetId
        );
        const isAvailable = Boolean(
            targetPanel && !targetPanel.classList.contains("hidden")
        );
        const isActive = isAvailable && targetId === activeEditorSectionId;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-current", isActive ? "true" : "false");
        button.disabled = !isAvailable;
        button.setAttribute("aria-disabled", String(!isAvailable));
    });

    if (activeEditorSectionId === "reviewsPanel") {
        renderPendingReviewsModeration();
    }
}

function setupEditorSectionNavigation() {
    if (!editorSectionNavButtons.length || !editorSectionPanels.length) {
        return;
    }

    editorSectionNavButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-editor-section-target");
            if (!targetId) {
                return;
            }
            activateEditorSection(targetId);
        });
    });

    activateEditorSection(activeEditorSectionId);
}

function createPreviewNode(url) {
    if (url) {
        return `<img class="preview" src="${escapeHtml(
            url
        )}" alt="Предпросмотр изображения" />`;
    }
    return `<div class="preview placeholder">Изображение не выбрано</div>`;
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Не удалось прочитать файл."));
        reader.readAsDataURL(file);
    });
}

function normalizeExampleStats(stats) {
    const normalized = Array.isArray(stats) ? clone(stats) : [];
    while (normalized.length < 3) {
        normalized.push({ label: "", value: "" });
    }
    return normalized.slice(0, 3);
}

function getSectionLabelsForEditing(languageContent) {
    if (!languageContent.sectionLabels || typeof languageContent.sectionLabels !== "object") {
        languageContent.sectionLabels = {};
    }

    const defaults = {
        objects: "Объекты",
        examples: "Примеры работ",
        workers: "Рабочие",
        reviews: "Отзывы",
        contact: "Контакты"
    };

    Object.keys(defaults).forEach((key) => {
        languageContent.sectionLabels[key] = String(
            languageContent.sectionLabels[key] || defaults[key]
        )
            .trim()
            .slice(0, 80);
    });

    return languageContent.sectionLabels;
}

function normalizeExampleGalleryEntries(images, fallbackImage = "", fallbackAlt = "") {
    const normalized = Array.isArray(images)
        ? images
              .map((entry) => ({
                  url: String(entry?.url || "")
                      .trim()
                      .slice(0, 1024),
                  alt: String(entry?.alt || "")
                      .trim()
                      .slice(0, 180)
              }))
              .filter((entry) => entry.url || entry.alt)
        : [];

    const legacyUrl = String(fallbackImage || "")
        .trim()
        .slice(0, 1024);
    const legacyAlt = String(fallbackAlt || "")
        .trim()
        .slice(0, 180);
    if (!normalized.length && (legacyUrl || legacyAlt)) {
        normalized.push({
            url: legacyUrl,
            alt: legacyAlt
        });
    }

    if (!normalized.length) {
        normalized.push({ url: "", alt: "" });
    }

    return normalized.slice(0, 20);
}

function syncExampleLegacyImage(exampleItem) {
    const firstImage = Array.isArray(exampleItem.images) ? exampleItem.images[0] : null;
    exampleItem.image = firstImage?.url || "";
    exampleItem.alt = firstImage?.alt || "";
}

function getExampleGalleryForEditing(exampleItem) {
    exampleItem.images = normalizeExampleGalleryEntries(
        exampleItem.images,
        exampleItem.image,
        exampleItem.alt
    );
    syncExampleLegacyImage(exampleItem);
    return exampleItem.images;
}

function normalizeWorkerItem(item) {
    return {
        name: String(item?.name || "")
            .trim()
            .slice(0, 120),
        bio: String(item?.bio || "")
            .trim()
            .slice(0, 1200),
        photo: String(item?.photo || "")
            .trim()
            .slice(0, 900000)
    };
}

function getWorkersForEditing(languageContent) {
    if (!languageContent.workers || typeof languageContent.workers !== "object") {
        languageContent.workers = {
            eyebrow: "",
            title: "",
            items: []
        };
    }
    if (!Array.isArray(languageContent.workers.items)) {
        languageContent.workers.items = [];
    }
    languageContent.workers.items = languageContent.workers.items
        .map((item) => normalizeWorkerItem(item))
        .slice(0, 80);
    return languageContent.workers.items;
}

function normalizeFooterSocialLink(item) {
    return {
        label: String(item?.label || "")
            .trim()
            .slice(0, 80),
        url: String(item?.url || "")
            .trim()
            .slice(0, 1024)
    };
}

function getFooterSocialLinksForEditing(languageContent) {
    if (!languageContent.footer || typeof languageContent.footer !== "object") {
        languageContent.footer = {};
    }

    if (!Array.isArray(languageContent.footer.socialLinks)) {
        languageContent.footer.socialLinks = [];
    }

    languageContent.footer.socialLinks = languageContent.footer.socialLinks
        .map((item) => normalizeFooterSocialLink(item))
        .filter((item) => item.label || item.url)
        .slice(0, 20);

    return languageContent.footer.socialLinks;
}

function renderFooterSocialLinksEditor() {
    if (!footerSocialLinksEditor) {
        return;
    }

    const languageContent = getActiveLanguageContent();
    if (!languageContent) {
        footerSocialLinksEditor.innerHTML = "";
        return;
    }

    const links = getFooterSocialLinksForEditing(languageContent);
    footerSocialLinksEditor.innerHTML = "";

    if (!links.length) {
        const emptyCard = document.createElement("div");
        emptyCard.className = "item-card moderation-empty";
        emptyCard.textContent = "Ссылок на соцсети пока нет.";
        footerSocialLinksEditor.append(emptyCard);
        return;
    }

    links.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
            <div class="item-card-head">
                <h3>Соцсеть ${index + 1}</h3>
                <button type="button" class="btn btn-danger">Удалить</button>
            </div>
            <div class="field-grid">
                <label>
                    Название ссылки
                    <input type="text" value="${escapeHtml(item.label)}" />
                </label>
                <label>
                    URL
                    <input type="url" value="${escapeHtml(item.url)}" />
                </label>
            </div>
        `;

        const removeBtn = card.querySelector(".btn-danger");
        const inputs = card.querySelectorAll("input");
        const labelInput = inputs[0];
        const urlInput = inputs[1];

        removeBtn.addEventListener("click", () => {
            links.splice(index, 1);
            renderFooterSocialLinksEditor();
            applyPermissions();
        });

        labelInput.addEventListener("input", () => {
            links[index].label = labelInput.value;
        });
        urlInput.addEventListener("input", () => {
            links[index].url = urlInput.value;
        });

        footerSocialLinksEditor.append(card);
    });
}

function formatReviewDate(value) {
    const parsed = new Date(String(value || ""));
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }
    return parsed.toLocaleString("ru-RU");
}

function reviewTimestamp(value) {
    const parsed = new Date(String(value || ""));
    const timestamp = parsed.getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
}

function renderApprovedReviewsForAdmin() {
    if (!approvedReviewsList) {
        return;
    }

    approvedReviewsList.innerHTML = "";

    if (typeof store.getApprovedReviews !== "function") {
        setStatus(
            approvedReviewsStatus,
            "Список одобренных отзывов недоступен: обновите сервер и страницу.",
            "error"
        );
        return;
    }

    const canDeleteApprovedReviews =
        typeof store.deleteApprovedReview === "function" &&
        hasPermission("content:edit");
    const collected = [];
    const supportedLanguageIds = getSupportedLanguageIds();
    try {
        supportedLanguageIds.forEach((languageId) => {
            const reviews = store.getApprovedReviews(languageId);
            if (!Array.isArray(reviews)) {
                return;
            }

            reviews.forEach((item) => {
                if (!item?.name || !item?.text) {
                    return;
                }
                collected.push({
                    id: String(item.id || ""),
                    language: supportedLanguageIds.includes(item.language)
                        ? item.language
                        : languageId,
                    name: String(item.name || "").trim(),
                    text: String(item.text || "").trim(),
                    meta: String(item.meta || "").trim(),
                    photo: String(item.photo || "").trim(),
                    createdAt: String(item.createdAt || "")
                });
            });
        });
    } catch (error) {
        setStatus(
            approvedReviewsStatus,
            error?.message || "Не удалось загрузить одобренные отзывы.",
            "error"
        );
        return;
    }

    collected.sort((a, b) => reviewTimestamp(b.createdAt) - reviewTimestamp(a.createdAt));

    if (!collected.length) {
        const emptyCard = document.createElement("div");
        emptyCard.className = "item-card moderation-empty";
        emptyCard.textContent = "Одобренных отзывов пока нет.";
        approvedReviewsList.append(emptyCard);
        setStatus(approvedReviewsStatus, "");
        return;
    }

    collected.forEach((review) => {
        const card = document.createElement("div");
        card.className = "item-card";
        const languageLabel = getLanguageLabel(review.language);
        const reviewMeta = review.meta
            ? `${review.meta} · ${formatReviewDate(review.createdAt)}`
            : formatReviewDate(review.createdAt);
        const preview = review.photo ? createPreviewNode(review.photo) : "";
        const actions = canDeleteApprovedReviews
            ? `
                <div class="toolbar">
                    <button
                        type="button"
                        class="btn btn-danger"
                        data-delete-approved-review
                        ${review.id ? "" : "disabled"}
                    >
                        Удалить отзыв
                    </button>
                </div>
            `
            : "";

        card.innerHTML = `
            <div class="item-card-head">
                <h3>${escapeHtml(review.name || "Клиент")}</h3>
                <span class="role-pill">${escapeHtml(languageLabel)}</span>
            </div>
            <p class="hint">${escapeHtml(reviewMeta || "Без подписи")}</p>
            <p>${escapeHtml(review.text || "")}</p>
            ${actions ? `<div class="divider"></div>${actions}` : ""}
            ${preview ? `<div class="divider"></div>${preview}` : ""}
        `;

        if (canDeleteApprovedReviews) {
            const deleteBtn = card.querySelector("[data-delete-approved-review]");
            if (deleteBtn) {
                deleteBtn.addEventListener("click", () => {
                    if (!hasPermission("content:edit")) {
                        return;
                    }
                    if (!review.id) {
                        setStatus(
                            approvedReviewsStatus,
                            "Невозможно удалить отзыв: отсутствует ID.",
                            "error"
                        );
                        return;
                    }

                    const confirmed = window.confirm(
                        "Удалить этот одобренный отзыв? Действие нельзя отменить."
                    );
                    if (!confirmed) {
                        return;
                    }

                    try {
                        store.deleteApprovedReview(review.id);
                        setStatus(approvedReviewsStatus, "Одобренный отзыв удален.", "ok");
                        renderApprovedReviewsForAdmin();
                    } catch (error) {
                        setStatus(
                            approvedReviewsStatus,
                            error?.message || "Не удалось удалить одобренный отзыв.",
                            "error"
                        );
                    }
                });
            }
        }

        approvedReviewsList.append(card);
    });
    setStatus(approvedReviewsStatus, "");
}

function renderPendingReviewsModeration() {
    if (!pendingReviewsList) {
        return;
    }

    pendingReviewsList.innerHTML = "";

    if (typeof store.getPendingReviews !== "function") {
        setStatus(
            pendingReviewsStatus,
            "Модерация недоступна: обновите сервер и страницу.",
            "error"
        );
        return;
    }
    if (
        typeof store.approvePendingReview !== "function" ||
        typeof store.rejectPendingReview !== "function"
    ) {
        setStatus(
            pendingReviewsStatus,
            "Действия модерации недоступны: обновите сервер и страницу.",
            "error"
        );
        return;
    }

    let pendingReviews = [];
    try {
        pendingReviews = store.getPendingReviews();
    } catch (error) {
        setStatus(
            pendingReviewsStatus,
            error?.message || "Не удалось загрузить отзывы на модерации.",
            "error"
        );
        return;
    }

    if (!Array.isArray(pendingReviews) || !pendingReviews.length) {
        const emptyCard = document.createElement("div");
        emptyCard.className = "item-card moderation-empty";
        emptyCard.textContent = "Новых отзывов на модерации нет.";
        pendingReviewsList.append(emptyCard);
        setStatus(pendingReviewsStatus, "");
        return;
    }

    pendingReviews.forEach((review) => {
        const card = document.createElement("div");
        card.className = "item-card pending-review-card";
        const languageLabel = getLanguageLabel(review.language);
        const reviewMeta = review.meta
            ? `${review.meta} · ${formatReviewDate(review.createdAt)}`
            : formatReviewDate(review.createdAt);
        const preview = review.photo ? createPreviewNode(review.photo) : "";

        card.innerHTML = `
            <div class="item-card-head">
                <h3>${escapeHtml(review.name || "Клиент")}</h3>
                <span class="role-pill">${escapeHtml(languageLabel)}</span>
            </div>
            <p class="hint">${escapeHtml(reviewMeta || "Без подписи")}</p>
            <p>${escapeHtml(review.text || "")}</p>
            ${preview ? `<div class="divider"></div>${preview}` : ""}
            <div class="toolbar">
                <button type="button" class="btn btn-primary">Одобрить</button>
                <button type="button" class="btn btn-danger">Отклонить</button>
            </div>
        `;

        const approveBtn = card.querySelector(".btn-primary");
        const rejectBtn = card.querySelector(".btn-danger");

        approveBtn.addEventListener("click", () => {
            if (!hasPermission("content:edit")) {
                return;
            }
            try {
                store.approvePendingReview(review.id);
                setStatus(pendingReviewsStatus, "Отзыв одобрен и опубликован.", "ok");
                renderPendingReviewsModeration();
                renderApprovedReviewsForAdmin();
            } catch (error) {
                setStatus(
                    pendingReviewsStatus,
                    error?.message || "Не удалось одобрить отзыв.",
                    "error"
                );
            }
        });

        rejectBtn.addEventListener("click", () => {
            if (!hasPermission("content:edit")) {
                return;
            }
            const confirmed = window.confirm("Отклонить этот отзыв?");
            if (!confirmed) {
                return;
            }
            try {
                store.rejectPendingReview(review.id);
                setStatus(pendingReviewsStatus, "Отзыв отклонен.", "ok");
                renderPendingReviewsModeration();
            } catch (error) {
                setStatus(
                    pendingReviewsStatus,
                    error?.message || "Не удалось отклонить отзыв.",
                    "error"
                );
            }
        });

        pendingReviewsList.append(card);
    });
}

function fillBaseInputs() {
    const languageContent = getActiveLanguageContent();
    if (!languageContent) {
        return;
    }

    const sectionLabels = getSectionLabelsForEditing(languageContent);
    getWorkersForEditing(languageContent);
    aboutEyebrowInput.value = languageContent.about.eyebrow || "";
    aboutTitleInput.value = languageContent.about.title || "";
    sectionLabelObjectsInput.value = sectionLabels.objects || "";
    sectionLabelExamplesInput.value = sectionLabels.examples || "";
    sectionLabelWorkersInput.value = sectionLabels.workers || "";
    sectionLabelReviewsInput.value = sectionLabels.reviews || "";
    sectionLabelContactInput.value = sectionLabels.contact || "";
    objectsEyebrowInput.value = languageContent.objects.eyebrow || "";
    objectsTitleInput.value = languageContent.objects.title || "";
    examplesEyebrowInput.value = languageContent.examples.eyebrow || "";
    examplesTitleInput.value = languageContent.examples.title || "";
    workersEyebrowInput.value = languageContent.workers?.eyebrow || "";
    workersTitleInput.value = languageContent.workers?.title || "";
    reviewsEyebrowInput.value = languageContent.reviews.eyebrow || "";
    reviewsTitleInput.value = languageContent.reviews.title || "";
    contactEyebrowInput.value = languageContent.contact.eyebrow || "";
    contactTitleInput.value = languageContent.contact.title || "";
    contactDescriptionInput.value = languageContent.contact.description || "";
    contactPhoneInput.value = languageContent.contact.phoneText || "";
    contactEmailInput.value = languageContent.contact.emailText || "";
    contactRequestEmailInput.value = languageContent.contact.requestEmail || "";
    contactSubmitLabelInput.value = languageContent.contact.submitLabel || "";
    contactModalTitleInput.value = languageContent.contact.modalTitle || "";
    contactModalDescriptionInput.value =
        languageContent.contact.modalDescription || "";
    contactSuccessMessageInput.value = languageContent.contact.successMessage || "";
    contactObjectTypesInput.value = (languageContent.contact.objectTypes || []).join(
        "\n"
    );
    footerCopyrightInput.value = languageContent.footer?.copyrightText || "";
}

function renderAboutItems() {
    const languageContent = getActiveLanguageContent();
    if (!languageContent) {
        return;
    }

    aboutItemsEditor.innerHTML = "";

    languageContent.about.items.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
            <div class="item-card-head">
                <h3>Пункт ${index + 1}</h3>
                <button type="button" class="btn btn-danger">Удалить</button>
            </div>
            <div class="field-grid">
                <label>
                    Заголовок
                    <input type="text" value="${escapeHtml(item.title)}" />
                </label>
                <label>
                    Описание
                    <textarea>${escapeHtml(item.description)}</textarea>
                </label>
            </div>
        `;

        const removeBtn = card.querySelector("button");
        const titleInput = card.querySelector("input");
        const descriptionInput = card.querySelector("textarea");

        removeBtn.addEventListener("click", () => {
            languageContent.about.items.splice(index, 1);
            renderAboutItems();
            applyPermissions();
        });

        titleInput.addEventListener("input", () => {
            languageContent.about.items[index].title = titleInput.value;
        });

        descriptionInput.addEventListener("input", () => {
            languageContent.about.items[index].description = descriptionInput.value;
        });

        aboutItemsEditor.append(card);
    });
}

function renderObjectItems() {
    const languageContent = getActiveLanguageContent();
    if (!languageContent) {
        return;
    }

    objectsItemsEditor.innerHTML = "";

    languageContent.objects.items.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
            <div class="item-card-head">
                <h3>Объект ${index + 1}</h3>
                <button type="button" class="btn btn-danger">Удалить</button>
            </div>
            ${createPreviewNode(item.image)}
            <div class="divider"></div>
            <div class="field-grid">
                <label>
                    URL фото
                    <input type="url" value="${escapeHtml(item.image)}" />
                </label>
                <label>
                    Или загрузите файл
                    <input class="file-input" type="file" accept="image/*" />
                </label>
                <label>
                    Alt текст фото
                    <input type="text" value="${escapeHtml(item.alt)}" />
                </label>
                <label>
                    Название объекта
                    <input type="text" value="${escapeHtml(item.title)}" />
                </label>
                <label>
                    Описание
                    <textarea>${escapeHtml(item.description)}</textarea>
                </label>
            </div>
        `;

        const removeBtn = card.querySelector(".btn-danger");
        const fields = card.querySelectorAll("input, textarea");
        const imageUrlInput = fields[0];
        const imageFileInput = fields[1];
        const altInput = fields[2];
        const titleInput = fields[3];
        const descriptionInput = fields[4];

        removeBtn.addEventListener("click", () => {
            languageContent.objects.items.splice(index, 1);
            renderObjectItems();
            applyPermissions();
        });

        imageUrlInput.addEventListener("input", () => {
            languageContent.objects.items[index].image = imageUrlInput.value;
        });

        imageFileInput.addEventListener("change", async () => {
            const file = imageFileInput.files?.[0];
            if (!file) {
                return;
            }
            try {
                const dataUrl = await readFileAsDataUrl(file);
                languageContent.objects.items[index].image = dataUrl;
                renderObjectItems();
                applyPermissions();
                setStatus(globalStatus, "Файл объекта загружен.", "ok");
            } catch (error) {
                setStatus(globalStatus, error.message, "error");
            }
        });

        altInput.addEventListener("input", () => {
            languageContent.objects.items[index].alt = altInput.value;
        });

        titleInput.addEventListener("input", () => {
            languageContent.objects.items[index].title = titleInput.value;
        });

        descriptionInput.addEventListener("input", () => {
            languageContent.objects.items[index].description = descriptionInput.value;
        });

        objectsItemsEditor.append(card);
    });
}

function renderExampleItems() {
    const languageContent = getActiveLanguageContent();
    if (!languageContent) {
        return;
    }

    examplesItemsEditor.innerHTML = "";

    languageContent.examples.items.forEach((item, index) => {
        const currentItem = languageContent.examples.items[index];
        currentItem.stats = normalizeExampleStats(item.stats);
        const stats = currentItem.stats;
        const gallery = getExampleGalleryForEditing(currentItem);

        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
            <div class="item-card-head">
                <h3>Пример ${index + 1}</h3>
                <button type="button" class="btn btn-danger">Удалить</button>
            </div>
            <div class="field-grid">
                <label>
                    Заголовок
                    <input class="example-title-input" type="text" value="${escapeHtml(
                        item.title
                    )}" />
                </label>
                <label>
                    Описание
                    <textarea class="example-description-input">${escapeHtml(
                        item.description
                    )}</textarea>
                </label>
            </div>
            <div class="divider"></div>
            <div class="items-editor compact" data-example-gallery-list></div>
            <button class="btn btn-light" type="button" data-add-example-photo>
                Добавить фото
            </button>
            <div class="divider"></div>
            <div class="stats-grid">
                <label>
                    Метрика 1: подпись
                    <input class="stat1-label-input" type="text" value="${escapeHtml(
                        stats[0].label
                    )}" />
                </label>
                <label>
                    Метрика 1: значение
                    <input class="stat1-value-input" type="text" value="${escapeHtml(
                        stats[0].value
                    )}" />
                </label>
                <span></span>
                <label>
                    Метрика 2: подпись
                    <input class="stat2-label-input" type="text" value="${escapeHtml(
                        stats[1].label
                    )}" />
                </label>
                <label>
                    Метрика 2: значение
                    <input class="stat2-value-input" type="text" value="${escapeHtml(
                        stats[1].value
                    )}" />
                </label>
                <span></span>
                <label>
                    Метрика 3: подпись
                    <input class="stat3-label-input" type="text" value="${escapeHtml(
                        stats[2].label
                    )}" />
                </label>
                <label>
                    Метрика 3: значение
                    <input class="stat3-value-input" type="text" value="${escapeHtml(
                        stats[2].value
                    )}" />
                </label>
            </div>
        `;

        const removeBtn = card.querySelector(".btn-danger");
        const galleryList = card.querySelector("[data-example-gallery-list]");
        const addPhotoBtn = card.querySelector("[data-add-example-photo]");
        const titleInput = card.querySelector(".example-title-input");
        const descriptionInput = card.querySelector(".example-description-input");
        const stat1LabelInput = card.querySelector(".stat1-label-input");
        const stat1ValueInput = card.querySelector(".stat1-value-input");
        const stat2LabelInput = card.querySelector(".stat2-label-input");
        const stat2ValueInput = card.querySelector(".stat2-value-input");
        const stat3LabelInput = card.querySelector(".stat3-label-input");
        const stat3ValueInput = card.querySelector(".stat3-value-input");

        removeBtn.addEventListener("click", () => {
            languageContent.examples.items.splice(index, 1);
            renderExampleItems();
            applyPermissions();
        });

        if (galleryList) {
            gallery.forEach((photo, photoIndex) => {
                const photoCard = document.createElement("div");
                photoCard.className = "item-card nested-item";
                photoCard.innerHTML = `
                    <div class="item-card-head">
                        <h3>Фото ${photoIndex + 1}</h3>
                        <button type="button" class="btn btn-danger">Удалить</button>
                    </div>
                    ${createPreviewNode(photo.url)}
                    <div class="divider"></div>
                    <div class="field-grid">
                        <label>
                            URL фото
                            <input class="example-photo-url-input" type="url" value="${escapeHtml(
                                photo.url
                            )}" />
                        </label>
                        <label>
                            Или загрузите файл
                            <input class="file-input example-photo-file-input" type="file" accept="image/*" />
                        </label>
                        <label>
                            Alt текст
                            <input class="example-photo-alt-input" type="text" value="${escapeHtml(
                                photo.alt
                            )}" />
                        </label>
                    </div>
                `;

                const removePhotoBtn = photoCard.querySelector(".btn-danger");
                const photoUrlInput = photoCard.querySelector(
                    ".example-photo-url-input"
                );
                const photoFileInput = photoCard.querySelector(
                    ".example-photo-file-input"
                );
                const photoAltInput = photoCard.querySelector(
                    ".example-photo-alt-input"
                );

                removePhotoBtn.addEventListener("click", () => {
                    const currentGallery = getExampleGalleryForEditing(
                        languageContent.examples.items[index]
                    );
                    currentGallery.splice(photoIndex, 1);
                    if (!currentGallery.length) {
                        currentGallery.push({ url: "", alt: "" });
                    }
                    syncExampleLegacyImage(languageContent.examples.items[index]);
                    renderExampleItems();
                    applyPermissions();
                });

                photoUrlInput.addEventListener("input", () => {
                    const currentGallery = getExampleGalleryForEditing(
                        languageContent.examples.items[index]
                    );
                    currentGallery[photoIndex].url = photoUrlInput.value;
                    syncExampleLegacyImage(languageContent.examples.items[index]);
                });

                photoFileInput.addEventListener("change", async () => {
                    const file = photoFileInput.files?.[0];
                    if (!file) {
                        return;
                    }
                    try {
                        const dataUrl = await readFileAsDataUrl(file);
                        const currentGallery = getExampleGalleryForEditing(
                            languageContent.examples.items[index]
                        );
                        currentGallery[photoIndex].url = dataUrl;
                        syncExampleLegacyImage(languageContent.examples.items[index]);
                        renderExampleItems();
                        applyPermissions();
                        setStatus(globalStatus, "Файл примера загружен.", "ok");
                    } catch (error) {
                        setStatus(globalStatus, error.message, "error");
                    }
                });

                photoAltInput.addEventListener("input", () => {
                    const currentGallery = getExampleGalleryForEditing(
                        languageContent.examples.items[index]
                    );
                    currentGallery[photoIndex].alt = photoAltInput.value;
                    syncExampleLegacyImage(languageContent.examples.items[index]);
                });

                galleryList.append(photoCard);
            });
        }

        addPhotoBtn.addEventListener("click", () => {
            const currentGallery = getExampleGalleryForEditing(
                languageContent.examples.items[index]
            );
            currentGallery.push({ url: "", alt: "" });
            syncExampleLegacyImage(languageContent.examples.items[index]);
            renderExampleItems();
            applyPermissions();
        });

        titleInput.addEventListener("input", () => {
            languageContent.examples.items[index].title = titleInput.value;
        });

        descriptionInput.addEventListener("input", () => {
            languageContent.examples.items[index].description = descriptionInput.value;
        });

        stat1LabelInput.addEventListener("input", () => {
            languageContent.examples.items[index].stats[0].label =
                stat1LabelInput.value;
        });
        stat1ValueInput.addEventListener("input", () => {
            languageContent.examples.items[index].stats[0].value =
                stat1ValueInput.value;
        });
        stat2LabelInput.addEventListener("input", () => {
            languageContent.examples.items[index].stats[1].label =
                stat2LabelInput.value;
        });
        stat2ValueInput.addEventListener("input", () => {
            languageContent.examples.items[index].stats[1].value =
                stat2ValueInput.value;
        });
        stat3LabelInput.addEventListener("input", () => {
            languageContent.examples.items[index].stats[2].label =
                stat3LabelInput.value;
        });
        stat3ValueInput.addEventListener("input", () => {
            languageContent.examples.items[index].stats[2].value =
                stat3ValueInput.value;
        });

        examplesItemsEditor.append(card);
    });
}

function renderReviewItems() {
    const languageContent = getActiveLanguageContent();
    if (!languageContent) {
        return;
    }

    reviewsItemsEditor.innerHTML = "";

    languageContent.reviews.items.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
            <div class="item-card-head">
                <h3>Отзыв ${index + 1}</h3>
                <button type="button" class="btn btn-danger">Удалить</button>
            </div>
            ${createPreviewNode(item.photo)}
            <div class="divider"></div>
            <div class="field-grid">
                <label>
                    Имя клиента
                    <input type="text" value="${escapeHtml(item.name)}" />
                </label>
                <label>
                    Подпись (объект/дата)
                    <input type="text" value="${escapeHtml(item.meta)}" />
                </label>
                <label>
                    URL фото
                    <input type="url" value="${escapeHtml(item.photo)}" />
                </label>
                <label>
                    Или загрузите файл
                    <input class="file-input" type="file" accept="image/*" />
                </label>
                <label>
                    Текст отзыва
                    <textarea>${escapeHtml(item.text)}</textarea>
                </label>
            </div>
        `;

        const removeBtn = card.querySelector(".btn-danger");
        const fields = card.querySelectorAll("input, textarea");
        const nameInput = fields[0];
        const metaInput = fields[1];
        const photoUrlInput = fields[2];
        const photoFileInput = fields[3];
        const textInput = fields[4];

        removeBtn.addEventListener("click", () => {
            languageContent.reviews.items.splice(index, 1);
            renderReviewItems();
            applyPermissions();
        });

        nameInput.addEventListener("input", () => {
            languageContent.reviews.items[index].name = nameInput.value;
        });

        metaInput.addEventListener("input", () => {
            languageContent.reviews.items[index].meta = metaInput.value;
        });

        photoUrlInput.addEventListener("input", () => {
            languageContent.reviews.items[index].photo = photoUrlInput.value;
        });

        photoFileInput.addEventListener("change", async () => {
            const file = photoFileInput.files?.[0];
            if (!file) {
                return;
            }
            try {
                const dataUrl = await readFileAsDataUrl(file);
                languageContent.reviews.items[index].photo = dataUrl;
                renderReviewItems();
                applyPermissions();
                setStatus(globalStatus, "Файл отзыва загружен.", "ok");
            } catch (error) {
                setStatus(globalStatus, error.message, "error");
            }
        });

        textInput.addEventListener("input", () => {
            languageContent.reviews.items[index].text = textInput.value;
        });

        reviewsItemsEditor.append(card);
    });
}

function renderWorkerItems() {
    const languageContent = getActiveLanguageContent();
    if (!languageContent || !workersItemsEditor) {
        return;
    }

    const workers = getWorkersForEditing(languageContent);
    workersItemsEditor.innerHTML = "";

    workers.forEach((worker, index) => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
            <div class="item-card-head">
                <h3>Рабочий ${index + 1}</h3>
                <button type="button" class="btn btn-danger">Удалить</button>
            </div>
            ${createPreviewNode(worker.photo)}
            <div class="divider"></div>
            <div class="field-grid">
                <label>
                    Фото (URL)
                    <input class="worker-photo-url-input" type="url" value="${escapeHtml(
                        worker.photo
                    )}" />
                </label>
                <label>
                    Или загрузите файл
                    <input class="file-input worker-photo-file-input" type="file" accept="image/*" />
                </label>
                <label>
                    Имя
                    <input class="worker-name-input" type="text" value="${escapeHtml(
                        worker.name
                    )}" />
                </label>
                <label>
                    Био
                    <textarea class="worker-bio-input">${escapeHtml(
                        worker.bio
                    )}</textarea>
                </label>
            </div>
        `;

        const removeBtn = card.querySelector(".btn-danger");
        const photoUrlInput = card.querySelector(".worker-photo-url-input");
        const photoFileInput = card.querySelector(".worker-photo-file-input");
        const nameInput = card.querySelector(".worker-name-input");
        const bioInput = card.querySelector(".worker-bio-input");

        removeBtn.addEventListener("click", () => {
            workers.splice(index, 1);
            renderWorkerItems();
            applyPermissions();
        });

        photoUrlInput.addEventListener("input", () => {
            workers[index].photo = photoUrlInput.value;
        });

        photoFileInput.addEventListener("change", async () => {
            const file = photoFileInput.files?.[0];
            if (!file) {
                return;
            }
            try {
                const dataUrl = await readFileAsDataUrl(file);
                workers[index].photo = dataUrl;
                renderWorkerItems();
                applyPermissions();
                setStatus(globalStatus, "Фото рабочего загружено.", "ok");
            } catch (error) {
                setStatus(globalStatus, error.message, "error");
            }
        });

        nameInput.addEventListener("input", () => {
            workers[index].name = nameInput.value;
        });

        bioInput.addEventListener("input", () => {
            workers[index].bio = bioInput.value;
        });

        workersItemsEditor.append(card);
    });
}

function renderAllDynamicEditors() {
    renderAboutItems();
    renderObjectItems();
    renderExampleItems();
    renderWorkerItems();
    renderReviewItems();
    renderFooterSocialLinksEditor();
    renderApprovedReviewsForAdmin();
}

function sanitizeLanguageContent(languageContent) {
    const hasText = (value) => String(value || "").trim();
    const sectionLabels = getSectionLabelsForEditing(languageContent);

    languageContent.sectionLabels = {
        objects: String(sectionLabels.objects || "")
            .trim()
            .slice(0, 80),
        examples: String(sectionLabels.examples || "")
            .trim()
            .slice(0, 80),
        workers: String(sectionLabels.workers || "")
            .trim()
            .slice(0, 80),
        reviews: String(sectionLabels.reviews || "")
            .trim()
            .slice(0, 80),
        contact: String(sectionLabels.contact || "")
            .trim()
            .slice(0, 80)
    };

    languageContent.about.items = languageContent.about.items.filter(
        (item) => hasText(item.title) || hasText(item.description)
    );

    languageContent.objects.items = languageContent.objects.items.filter(
        (item) =>
            hasText(item.image) || hasText(item.title) || hasText(item.description)
    );

    languageContent.examples.items = languageContent.examples.items
        .map((item) => {
            const normalizedItem = {
                ...item,
                stats: normalizeExampleStats(item.stats),
                images: normalizeExampleGalleryEntries(item.images, item.image, item.alt)
            };
            syncExampleLegacyImage(normalizedItem);
            return normalizedItem;
        })
        .filter(
            (item) =>
                hasText(item.image) ||
                hasText(item.title) ||
                hasText(item.description) ||
                item.images.some((image) => hasText(image.url))
        );

    if (!languageContent.workers || typeof languageContent.workers !== "object") {
        languageContent.workers = {
            eyebrow: "",
            title: "",
            items: []
        };
    }
    languageContent.workers.eyebrow = String(languageContent.workers.eyebrow || "")
        .trim()
        .slice(0, 120);
    languageContent.workers.title = String(languageContent.workers.title || "")
        .trim()
        .slice(0, 240);
    languageContent.workers.items = getWorkersForEditing(languageContent).filter(
        (item) => hasText(item.name) || hasText(item.bio) || hasText(item.photo)
    );

    languageContent.reviews.items = languageContent.reviews.items.filter(
        (item) => hasText(item.name) || hasText(item.text)
    );

    languageContent.contact.requestEmail = String(
        languageContent.contact.requestEmail || ""
    ).trim();
    languageContent.contact.emailText = String(
        languageContent.contact.emailText || ""
    ).trim();
    languageContent.contact.phoneText = String(
        languageContent.contact.phoneText || ""
    ).trim();

    if (!languageContent.footer) {
        languageContent.footer = {};
    }

    languageContent.footer.copyrightText = String(
        languageContent.footer.copyrightText || ""
    ).trim();
    languageContent.footer.socialLinks = getFooterSocialLinksForEditing(
        languageContent
    ).map((item) => normalizeFooterSocialLink(item));
}

function sanitizeStateBeforeSave() {
    ensureMultiLanguageState();
    const activeContent = getActiveLanguageContent();
    if (!activeContent) {
        return;
    }

    activeContent.contact.objectTypes = contactObjectTypesInput.value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

    getSupportedLanguageIds().forEach((languageId) => {
        const languageContent = contentState.translations[languageId];
        if (languageContent) {
            sanitizeLanguageContent(languageContent);
        }
    });

    contentState.activeLanguage = activeContentLanguage;
}

function saveCurrentContent() {
    if (!hasPermission("content:edit")) {
        return false;
    }

    try {
        sanitizeStateBeforeSave();
        const normalized = store.normalizeContent(contentState);
        store.saveContent(normalized);
        contentState = normalized;
        syncActiveLanguageFromState();
        fillBaseInputs();
        renderAllDynamicEditors();
        applyPermissions();
        setStatus(globalStatus, "Изменения сохранены.", "ok");
        return true;
    } catch (error) {
        setStatus(globalStatus, `Ошибка сохранения: ${error.message}`, "error");
        return false;
    }
}

function resetUnsavedChanges() {
    if (!hasPermission("content:edit")) {
        return;
    }

    const confirmed = window.confirm(
        "Сбросить все несохраненные изменения и вернуть последнюю сохраненную версию?"
    );
    if (!confirmed) {
        return;
    }

    const selectedLanguage = activeContentLanguage;
    contentState = store.getContent();
    syncActiveLanguageFromState();
    if (getSupportedLanguageIds().includes(selectedLanguage)) {
        setActiveContentLanguage(selectedLanguage);
    } else {
        fillBaseInputs();
        renderAllDynamicEditors();
        applyPermissions();
    }
    setStatus(globalStatus, "Несохраненные изменения сброшены.", "ok");
}

function resetContentToDefaults() {
    if (!hasPermission("content:advanced")) {
        return;
    }

    const confirmed = window.confirm(
        "Сбросить весь контент к значениям по умолчанию?"
    );
    if (!confirmed) {
        return;
    }

    store.resetContent();
    contentState = store.getContent();
    syncActiveLanguageFromState();
    fillBaseInputs();
    renderAllDynamicEditors();
    applyPermissions();
    setStatus(globalStatus, "Контент сброшен к значениям по умолчанию.", "ok");
}

function renderAdminUsersList() {
    if (!adminUsersList) {
        return;
    }

    adminUsersList.innerHTML = "";
    const admins = store.getAdminUsers();

    admins.forEach((admin) => {
        const card = document.createElement("div");
        card.className = "item-card admin-user-card";
        card.innerHTML = `
            <div class="item-card-head">
                <h3>${escapeHtml(admin.login)}</h3>
                <span class="role-pill">${escapeHtml(roleLabel(admin.role))}</span>
            </div>
            <div class="field-grid">
                <label>
                    Уровень доступа
                    <select>
                        ${store.ACCESS_LEVELS.map(
                            (role) =>
                                `<option value="${role.id}" ${
                                    role.id === admin.role ? "selected" : ""
                                }>${escapeHtml(role.label)}</option>`
                        ).join("")}
                    </select>
                </label>
                <label>
                    Новый пароль (опционально)
                    <input type="password" placeholder="Оставьте пустым, чтобы не менять" />
                </label>
            </div>
            <div class="toolbar">
                <button type="button" class="btn btn-light">Сохранить</button>
                <button type="button" class="btn btn-danger">Удалить</button>
            </div>
        `;

        const roleSelect = card.querySelector("select");
        const passwordInput = card.querySelector("input");
        const saveBtn = card.querySelector(".btn-light");
        const deleteBtn = card.querySelector(".btn-danger");

        if (admin.protected || admin.login === store.DEFAULT_OWNER_LOGIN) {
            roleSelect.disabled = true;
            passwordInput.disabled = true;
            saveBtn.disabled = true;
            saveBtn.textContent = "Фиксированный аккаунт";
            deleteBtn.disabled = true;
            deleteBtn.textContent = "Системный";
        }

        saveBtn.addEventListener("click", () => {
            if (!hasPermission("admins:manage")) {
                return;
            }

            const nextRole = roleSelect.value;
            const nextPassword = String(passwordInput.value || "").trim();

            if (nextPassword && !isStrongAdminPassword(nextPassword)) {
                setStatus(
                    adminUsersStatus,
                    `Для ${admin.login}: пароль минимум 10 символов, верхний/нижний регистр и цифры.`,
                    "error"
                );
                return;
            }

            const users = store.getAdminUsers();
            const index = users.findIndex((item) => item.login === admin.login);
            if (index === -1) {
                setStatus(adminUsersStatus, "Администратор не найден.", "error");
                return;
            }

            if (!users[index].protected) {
                users[index].role = nextRole;
            }

            if (nextPassword) {
                users[index].password = nextPassword;
            }

            let saved = [];
            try {
                saved = store.saveAdminUsers(users);
            } catch (error) {
                setStatus(
                    adminUsersStatus,
                    error?.message || "Не удалось сохранить администратора.",
                    "error"
                );
                return;
            }
            setStatus(
                adminUsersStatus,
                `Параметры администратора ${admin.login} сохранены.`,
                "ok"
            );

            currentAdmin =
                saved.find((item) => item.login === currentAdmin?.login) || null;
            renderAdminUsersList();
            updateCurrentSessionInfo();
            applyPermissions();
        });

        deleteBtn.addEventListener("click", () => {
            if (!hasPermission("admins:manage")) {
                return;
            }

            const users = store.getAdminUsers();
            const index = users.findIndex((item) => item.login === admin.login);
            if (index === -1) {
                setStatus(adminUsersStatus, "Администратор не найден.", "error");
                return;
            }

            if (users[index].protected || users[index].login === store.DEFAULT_OWNER_LOGIN) {
                setStatus(
                    adminUsersStatus,
                    "Системного администратора удалить нельзя.",
                    "error"
                );
                return;
            }

            const confirmed = window.confirm(
                `Удалить администратора ${admin.login}?`
            );
            if (!confirmed) {
                return;
            }

            users.splice(index, 1);
            let saved = [];
            try {
                saved = store.saveAdminUsers(users);
            } catch (error) {
                setStatus(
                    adminUsersStatus,
                    error?.message || "Не удалось удалить администратора.",
                    "error"
                );
                return;
            }
            setStatus(
                adminUsersStatus,
                `Администратор ${admin.login} удален.`,
                "ok"
            );

            if (currentAdmin && !saved.some((item) => item.login === currentAdmin.login)) {
                sessionStorage.removeItem(AUTH_SESSION_KEY);
                location.reload();
                return;
            }

            renderAdminUsersList();
            applyPermissions();
        });

        adminUsersList.append(card);
    });
}

function updateCurrentSessionInfo() {
    if (!currentSessionInfo || !currentAdmin) {
        return;
    }

    currentSessionInfo.textContent = `Пользователь: ${currentAdmin.login} (${roleLabel(
        currentAdmin.role
    )})`;
}

function applyPermissions() {
    if (!currentAdmin || !editorSection) {
        return;
    }

    updateCurrentSessionInfo();

    const canEdit = hasPermission("content:edit");
    const canAdvanced = hasPermission("content:advanced");
    const canManageAdmins = hasPermission("admins:manage");

    const controls = editorSection.querySelectorAll(
        "input, textarea, select, button:not([data-panel-toggle]):not([data-editor-section-target])"
    );
    controls.forEach((control) => {
        control.disabled = !canEdit;
    });

    if (contentLanguageSelect) {
        contentLanguageSelect.disabled = false;
    }
    sectionLanguageSelects.forEach((select) => {
        select.disabled = false;
    });

    logoutBtn.disabled = false;
    saveContentBtn.disabled = !canEdit;

    if (canEdit && !canAdvanced) {
        exportContentBtn.disabled = true;
        importContentBtn.disabled = true;
        resetContentBtn.disabled = true;
        clearUserReviewsBtn.disabled = true;
    }

    if (canEdit && canAdvanced) {
        exportContentBtn.disabled = false;
        importContentBtn.disabled = false;
        resetContentBtn.disabled = false;
        clearUserReviewsBtn.disabled = false;
    }

    if (adminUsersPanel) {
        adminUsersPanel.classList.toggle("hidden", !canManageAdmins);
        if (canManageAdmins) {
            const adminControls = adminUsersPanel.querySelectorAll(
                "input, textarea, select, button"
            );
            adminControls.forEach((control) => {
                control.disabled = false;
            });
            renderAdminUsersList();
        }
    }

    if (!canEdit) {
        setStatus(globalStatus, "Режим просмотра: редактирование отключено.");
    }

    activateEditorSection(activeEditorSectionId);
}

function bindTopInputHandlers() {
    const withActiveLanguage = (updater) => {
        const languageContent = getActiveLanguageContent();
        if (!languageContent) {
            return;
        }
        updater(languageContent);
    };

    aboutEyebrowInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.about.eyebrow = aboutEyebrowInput.value;
        })
    );
    aboutTitleInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.about.title = aboutTitleInput.value;
        })
    );
    sectionLabelObjectsInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            getSectionLabelsForEditing(languageContent).objects =
                sectionLabelObjectsInput.value;
        })
    );
    sectionLabelExamplesInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            getSectionLabelsForEditing(languageContent).examples =
                sectionLabelExamplesInput.value;
        })
    );
    sectionLabelWorkersInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            getSectionLabelsForEditing(languageContent).workers =
                sectionLabelWorkersInput.value;
        })
    );
    sectionLabelReviewsInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            getSectionLabelsForEditing(languageContent).reviews =
                sectionLabelReviewsInput.value;
        })
    );
    sectionLabelContactInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            getSectionLabelsForEditing(languageContent).contact =
                sectionLabelContactInput.value;
        })
    );
    objectsEyebrowInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.objects.eyebrow = objectsEyebrowInput.value;
        })
    );
    objectsTitleInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.objects.title = objectsTitleInput.value;
        })
    );
    examplesEyebrowInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.examples.eyebrow = examplesEyebrowInput.value;
        })
    );
    examplesTitleInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.examples.title = examplesTitleInput.value;
        })
    );
    workersEyebrowInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            if (!languageContent.workers || typeof languageContent.workers !== "object") {
                languageContent.workers = {
                    eyebrow: "",
                    title: "",
                    items: []
                };
            }
            languageContent.workers.eyebrow = workersEyebrowInput.value;
        })
    );
    workersTitleInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            if (!languageContent.workers || typeof languageContent.workers !== "object") {
                languageContent.workers = {
                    eyebrow: "",
                    title: "",
                    items: []
                };
            }
            languageContent.workers.title = workersTitleInput.value;
        })
    );
    reviewsEyebrowInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.reviews.eyebrow = reviewsEyebrowInput.value;
        })
    );
    reviewsTitleInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.reviews.title = reviewsTitleInput.value;
        })
    );
    contactEyebrowInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.contact.eyebrow = contactEyebrowInput.value;
        })
    );
    contactTitleInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.contact.title = contactTitleInput.value;
        })
    );
    contactDescriptionInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.contact.description = contactDescriptionInput.value;
        })
    );
    contactPhoneInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.contact.phoneText = contactPhoneInput.value;
        })
    );
    contactEmailInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.contact.emailText = contactEmailInput.value;
        })
    );
    contactRequestEmailInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.contact.requestEmail = contactRequestEmailInput.value;
        })
    );
    contactSubmitLabelInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.contact.submitLabel = contactSubmitLabelInput.value;
        })
    );
    contactModalTitleInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.contact.modalTitle = contactModalTitleInput.value;
        })
    );
    contactModalDescriptionInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.contact.modalDescription = contactModalDescriptionInput.value;
        })
    );
    contactSuccessMessageInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.contact.successMessage = contactSuccessMessageInput.value;
        })
    );
    contactObjectTypesInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.contact.objectTypes = contactObjectTypesInput.value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean);
        })
    );

    footerCopyrightInput.addEventListener("input", () =>
        withActiveLanguage((languageContent) => {
            languageContent.footer.copyrightText = footerCopyrightInput.value;
        })
    );
}

function bindStaticHandlers() {
    if (staticHandlersBound) {
        return;
    }
    staticHandlersBound = true;

    setupEditorSectionNavigation();
    updateLanguageSelectUi();
    if (contentLanguageSelect) {
        contentLanguageSelect.addEventListener("change", () => {
            setActiveContentLanguage(contentLanguageSelect.value);
        });
    }
    sectionLanguageSelects.forEach((select) => {
        select.addEventListener("change", () => {
            setActiveContentLanguage(select.value);
        });
    });

    saveContentBtn.addEventListener("click", saveCurrentContent);
    sectionSaveButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const saved = saveCurrentContent();
            if (saved) {
                showSectionSaveFeedback(
                    button,
                    "Все изменения успешно сохранены.",
                    "ok"
                );
                return;
            }
            showSectionSaveFeedback(button, "Не удалось сохранить изменения.", "error");
        });
    });
    sectionResetButtons.forEach((button) => {
        button.addEventListener("click", () => {
            resetUnsavedChanges();
            showSectionSaveFeedback(button, "");
        });
    });
    if (refreshPendingReviewsBtn) {
        refreshPendingReviewsBtn.addEventListener(
            "click",
            renderPendingReviewsModeration
        );
    }
    if (refreshApprovedReviewsBtn) {
        refreshApprovedReviewsBtn.addEventListener(
            "click",
            renderApprovedReviewsForAdmin
        );
    }
    if (addFooterSocialLinkBtn) {
        addFooterSocialLinkBtn.addEventListener("click", () => {
            const languageContent = getActiveLanguageContent();
            if (!languageContent) {
                return;
            }
            const links = getFooterSocialLinksForEditing(languageContent);
            links.push({
                label: "Новая соцсеть",
                url: ""
            });
            renderFooterSocialLinksEditor();
            applyPermissions();
        });
    }

    exportContentBtn.addEventListener("click", () => {
        if (!hasPermission("content:advanced")) {
            return;
        }

        const blob = new Blob([JSON.stringify(contentState, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "randsengineering-content.json";
        link.click();
        URL.revokeObjectURL(url);
        setStatus(globalStatus, "JSON экспортирован.", "ok");
    });

    importContentBtn.addEventListener("click", () => {
        if (!hasPermission("content:advanced")) {
            return;
        }
        importContentFile.click();
    });

    importContentFile.addEventListener("change", async () => {
        if (!hasPermission("content:advanced")) {
            return;
        }

        const file = importContentFile.files?.[0];
        if (!file) {
            return;
        }

        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            contentState = store.normalizeContent(parsed);
            store.saveContent(contentState);
            syncActiveLanguageFromState();
            fillBaseInputs();
            renderAllDynamicEditors();
            applyPermissions();
            setStatus(globalStatus, "Контент импортирован и сохранен.", "ok");
        } catch (error) {
            setStatus(globalStatus, `Ошибка импорта: ${error.message}`, "error");
        } finally {
            importContentFile.value = "";
        }
    });

    resetContentBtn.addEventListener("click", resetContentToDefaults);

    logoutBtn.addEventListener("click", () => {
        try {
            store.logoutAdmin();
        } catch {
            // Ignore network errors during logout and clear local session anyway.
        }
        sessionStorage.removeItem(AUTH_SESSION_KEY);
        location.reload();
    });

    createAdminForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!hasPermission("admins:manage")) {
            return;
        }

        const login = sanitizeLogin(newAdminLoginInput.value);
        const password = String(newAdminPasswordInput.value || "").trim();
        const role = newAdminRoleInput.value;

        if (!/^[a-z0-9._-]{3,32}$/.test(login)) {
            setStatus(
                adminUsersStatus,
                "Логин: 3-32 символа, латиница/цифры/._-",
                "error"
            );
            return;
        }

        if (!isStrongAdminPassword(password)) {
            setStatus(
                adminUsersStatus,
                "Пароль: минимум 10 символов, верхний/нижний регистр и цифры.",
                "error"
            );
            return;
        }

        const users = store.getAdminUsers();
        if (users.some((item) => item.login === login)) {
            setStatus(adminUsersStatus, "Админ с таким логином уже существует.", "error");
            return;
        }

        users.push({
            login,
            password,
            role,
            protected: false
        });

        try {
            store.saveAdminUsers(users);
        } catch (error) {
            setStatus(
                adminUsersStatus,
                error?.message || "Не удалось создать администратора.",
                "error"
            );
            return;
        }
        createAdminForm.reset();
        newAdminRoleInput.value = "manager";
        renderAdminUsersList();
        applyPermissions();
        setStatus(
            adminUsersStatus,
            `Администратор ${login} создан (${roleLabel(role)}).`,
            "ok"
        );
    });

    addAboutItemBtn.addEventListener("click", () => {
        const languageContent = getActiveLanguageContent();
        if (!languageContent) {
            return;
        }
        languageContent.about.items.push({ title: "Новый пункт", description: "" });
        renderAboutItems();
        applyPermissions();
    });

    addObjectItemBtn.addEventListener("click", () => {
        const languageContent = getActiveLanguageContent();
        if (!languageContent) {
            return;
        }
        languageContent.objects.items.push({
            image: "",
            alt: "",
            title: "Новый объект",
            description: ""
        });
        renderObjectItems();
        applyPermissions();
    });

    addExampleItemBtn.addEventListener("click", () => {
        const languageContent = getActiveLanguageContent();
        if (!languageContent) {
            return;
        }
        languageContent.examples.items.push({
            image: "",
            alt: "",
            images: [{ url: "", alt: "" }],
            title: "Новый пример",
            description: "",
            stats: [
                { label: "Метрика", value: "" },
                { label: "Метрика", value: "" },
                { label: "Метрика", value: "" }
            ]
        });
        renderExampleItems();
        applyPermissions();
    });

    addWorkerItemBtn.addEventListener("click", () => {
        const languageContent = getActiveLanguageContent();
        if (!languageContent) {
            return;
        }
        const workers = getWorkersForEditing(languageContent);
        workers.push({
            name: "Новый рабочий",
            bio: "",
            photo: ""
        });
        renderWorkerItems();
        applyPermissions();
    });

    addReviewItemBtn.addEventListener("click", () => {
        const languageContent = getActiveLanguageContent();
        if (!languageContent) {
            return;
        }
        languageContent.reviews.items.push({
            name: "Клиент",
            meta: "",
            text: "",
            photo: ""
        });
        renderReviewItems();
        applyPermissions();
    });

    clearUserReviewsBtn.addEventListener("click", () => {
        if (!hasPermission("content:advanced")) {
            return;
        }
        if (typeof store.clearSubmittedReviews !== "function") {
            setStatus(
                globalStatus,
                "Функция очистки отзывов недоступна: обновите сервер.",
                "error"
            );
            return;
        }

        const confirmed = window.confirm(
            "Удалить пользовательские отзывы (в очереди и опубликованные)?"
        );
        if (!confirmed) {
            return;
        }

        try {
            store.clearSubmittedReviews();
            renderPendingReviewsModeration();
            renderApprovedReviewsForAdmin();
            setStatus(globalStatus, "Пользовательские отзывы очищены.", "ok");
        } catch (error) {
            setStatus(
                globalStatus,
                error?.message || "Не удалось очистить пользовательские отзывы.",
                "error"
            );
        }
    });

    bindTopInputHandlers();
}

function initEditor() {
    contentState = store.getContent();
    syncActiveLanguageFromState();
    fillBaseInputs();
    renderAllDynamicEditors();
    renderPendingReviewsModeration();
    renderAdminUsersList();
    bindStaticHandlers();
    updateLanguageSelectUi();
    showEditor();
    applyPermissions();
}

function initAuth() {
    authForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const login = sanitizeLogin(adminLoginInput.value);
        const password = String(adminPasswordInput.value || "");
        let matched = null;
        try {
            matched = store.authenticateAdmin(login, password);
        } catch (error) {
            setStatus(
                authStatus,
                error?.message || "Ошибка соединения с сервером авторизации.",
                "error"
            );
            return;
        }

        if (!matched) {
            setStatus(authStatus, "Неверный логин или пароль.", "error");
            return;
        }

        currentAdmin = matched;
        sessionStorage.setItem(AUTH_SESSION_KEY, matched.login);
        authForm.reset();
        setStatus(authStatus, "");
        initEditor();
    });
}

function start() {
    if (!store) {
        setStatus(
            authStatus,
            "Ошибка: content-store.js не найден. Обновите страницу.",
            "error"
        );
        return;
    }

    setupCollapsiblePanels();
    initAuth();

    const sessionAdmin =
        typeof store.getCurrentAdmin === "function" ? store.getCurrentAdmin() : null;
    if (sessionAdmin) {
        currentAdmin = sessionAdmin;
        sessionStorage.setItem(AUTH_SESSION_KEY, sessionAdmin.login);
        initEditor();
        return;
    }

    sessionStorage.removeItem(AUTH_SESSION_KEY);
    showAuth();
}

start();
