const contentStore = window.RandsContentStore;
const SITE_LANGUAGE_STORAGE_KEY = "randsengineering-site-language-v1";

const siteContent = contentStore?.getContent ? contentStore.getContent() : null;
const languageIds = Array.isArray(contentStore?.LANGUAGE_IDS)
    ? contentStore.LANGUAGE_IDS
    : ["ru", "en", "he"];
const fallbackLanguage = contentStore?.DEFAULT_LANGUAGE || "ru";
const localeByLanguage = {
    ru: "ru-RU",
    en: "en-US",
    he: "he-IL"
};
const directionByLanguage = {
    ru: "ltr",
    en: "ltr",
    he: "rtl"
};
const CONTACT_SUBMIT_ENDPOINT = "/api/contact/submit";

const STATIC_UI_TEXT = {
    ru: {
        navObjects: "Объекты",
        navExamples: "Примеры работ",
        navWorkers: "Рабочие",
        navReviews: "Отзывы",
        navContact: "Контакты",
        headerCta: "Оставить заявку",
        heroEyebrow: "ремонт и инженерия под ключ",
        heroTitle:
            "Современный и минималистичный ремонт объектов с точным соблюдением сроков",
        heroText:
            "Выполняем полный цикл: от инженерного проекта до чистовой отделки. Работаем прозрачно, аккуратно и с фокусом на долговечный результат.",
        heroPrimary: "Обсудить проект",
        heroSecondary: "Смотреть объекты",
        metricProjects: "проектов",
        metricExperience: "опыта",
        metricRecommendation: "рекомендаций",
        processTitle: "Как мы работаем",
        processStep1Title: "01. Аудит объекта",
        processStep1Text: "Выезд, обмеры, обсуждение задач и расчет бюджета.",
        processStep2Title: "02. Проект и смета",
        processStep2Text:
            "Детальная смета, календарный план и подбор материалов.",
        processStep3Title: "03. Реализация",
        processStep3Text: "Контроль качества, фотоотчеты и финальная сдача.",
        reviewFormTitle: "Добавить отзыв",
        reviewNameLabel: "Ваше имя",
        reviewNamePlaceholder: "Например, Ирина",
        reviewTextLabel: "Текст отзыва",
        reviewTextPlaceholder: "Опишите ваш опыт работы с нами",
        reviewPhotoLabel: "Фото объекта (необязательно)",
        reviewSubmit: "Отправить отзыв",
        reviewPreviewAlt: "Предпросмотр фотографии для отзыва",
        exampleGalleryTitle: "Галерея проекта",
        exampleGalleryPrev: "Назад",
        exampleGalleryNext: "Вперед",
        contactNameLabel: "Имя",
        contactNamePlaceholder: "Ваше имя",
        contactPhoneLabel: "Телефон",
        contactPhonePlaceholder: "+7 (___) ___-__-__",
        contactObjectTypeLabel: "Тип объекта",
        contactStartDateLabel: "Желаемая дата начала проекта",
        contactMessageLabel: "Комментарий",
        contactMessagePlaceholder: "Коротко опишите ваш запрос",
        modalCloseAria: "Закрыть окно",
        reviewValidation: "Заполните имя и текст отзыва перед отправкой.",
        reviewSuccess: "Спасибо! Отзыв отправлен на модерацию.",
        requestSending: "Отправляем заявку...",
        requestSendError:
            "Не удалось отправить заявку. Попробуйте еще раз через минуту.",
        mailSubject: "Новая заявка с сайта RandsEngineering",
        mailLead: "Новая заявка:",
        mailName: "Имя",
        mailPhone: "Телефон",
        mailObjectType: "Тип объекта",
        mailDate: "Дата старта",
        mailComment: "Комментарий"
    },
    en: {
        navObjects: "Projects",
        navExamples: "Work examples",
        navWorkers: "Team",
        navReviews: "Reviews",
        navContact: "Contact",
        headerCta: "Send request",
        heroEyebrow: "turnkey renovation and engineering",
        heroTitle:
            "Modern and minimalist renovation with strict deadline control",
        heroText:
            "We cover the full cycle: from engineering design to final finishing. Transparent workflow, clean execution, and durable results.",
        heroPrimary: "Discuss project",
        heroSecondary: "View projects",
        metricProjects: "projects",
        metricExperience: "experience",
        metricRecommendation: "recommendations",
        processTitle: "How we work",
        processStep1Title: "01. Site audit",
        processStep1Text:
            "On-site visit, measurements, task discussion, and budget estimate.",
        processStep2Title: "02. Project and estimate",
        processStep2Text:
            "Detailed estimate, timeline, and materials selection.",
        processStep3Title: "03. Delivery",
        processStep3Text:
            "Quality control, progress reports, and final handover.",
        reviewFormTitle: "Add review",
        reviewNameLabel: "Your name",
        reviewNamePlaceholder: "For example, Emma",
        reviewTextLabel: "Review text",
        reviewTextPlaceholder: "Describe your experience working with us",
        reviewPhotoLabel: "Project photo (optional)",
        reviewSubmit: "Send review",
        reviewPreviewAlt: "Review photo preview",
        exampleGalleryTitle: "Project gallery",
        exampleGalleryPrev: "Previous",
        exampleGalleryNext: "Next",
        contactNameLabel: "Name",
        contactNamePlaceholder: "Your name",
        contactPhoneLabel: "Phone",
        contactPhonePlaceholder: "+1 (___) ___-____",
        contactObjectTypeLabel: "Property type",
        contactStartDateLabel: "Preferred project start date",
        contactMessageLabel: "Comment",
        contactMessagePlaceholder: "Briefly describe your request",
        modalCloseAria: "Close window",
        reviewValidation: "Please fill in your name and review text before sending.",
        reviewSuccess: "Thank you! Your review was sent for moderation.",
        requestSending: "Sending request...",
        requestSendError: "Failed to send request. Please try again in a minute.",
        mailSubject: "New request from RandsEngineering website",
        mailLead: "New request:",
        mailName: "Name",
        mailPhone: "Phone",
        mailObjectType: "Object type",
        mailDate: "Start date",
        mailComment: "Comment"
    },
    he: {
        navObjects: "פרויקטים",
        navExamples: "דוגמאות עבודה",
        navWorkers: "צוות",
        navReviews: "חוות דעת",
        navContact: "יצירת קשר",
        headerCta: "השארת פנייה",
        heroEyebrow: "שיפוץ והנדסה מקצה לקצה",
        heroTitle: "שיפוץ מודרני ומדויק תוך עמידה מלאה בזמנים",
        heroText:
            "אנחנו מבצעים מחזור מלא: מתכנון הנדסי ועד גמר סופי. עבודה שקופה, מדויקת ועמידות לטווח ארוך.",
        heroPrimary: "לדון בפרויקט",
        heroSecondary: "לצפייה בפרויקטים",
        metricProjects: "פרויקטים",
        metricExperience: "ניסיון",
        metricRecommendation: "המלצות",
        processTitle: "איך אנחנו עובדים",
        processStep1Title: "01. בדיקת אתר",
        processStep1Text: "ביקור בשטח, מדידות, אפיון משימות והערכת תקציב.",
        processStep2Title: "02. תכנון והצעת מחיר",
        processStep2Text: "הצעת מחיר מפורטת, לוח זמנים ובחירת חומרים.",
        processStep3Title: "03. ביצוע ומסירה",
        processStep3Text: "בקרת איכות, דוחות התקדמות ומסירה סופית.",
        reviewFormTitle: "הוספת חוות דעת",
        reviewNameLabel: "השם שלך",
        reviewNamePlaceholder: "לדוגמה, שרה",
        reviewTextLabel: "תוכן חוות הדעת",
        reviewTextPlaceholder: "תארו את חוויית העבודה איתנו",
        reviewPhotoLabel: "תמונת הפרויקט (לא חובה)",
        reviewSubmit: "שליחת חוות דעת",
        reviewPreviewAlt: "תצוגה מקדימה לתמונת חוות הדעת",
        exampleGalleryTitle: "גלריית פרויקט",
        exampleGalleryPrev: "הקודם",
        exampleGalleryNext: "הבא",
        contactNameLabel: "שם",
        contactNamePlaceholder: "השם שלך",
        contactPhoneLabel: "טלפון",
        contactPhonePlaceholder: "+972 __-___-____",
        contactObjectTypeLabel: "סוג הנכס",
        contactStartDateLabel: "תאריך התחלה מועדף לפרויקט",
        contactMessageLabel: "הערה",
        contactMessagePlaceholder: "תארו בקצרה את הבקשה שלכם",
        modalCloseAria: "סגירת החלון",
        reviewValidation: "נא למלא שם וטקסט חוות דעת לפני השליחה.",
        reviewSuccess: "תודה! חוות הדעת נשלחה לאישור מנהל.",
        requestSending: "שולחים את הפנייה...",
        requestSendError: "שליחת הפנייה נכשלה. נסו שוב בעוד דקה.",
        mailSubject: "פנייה חדשה מאתר RandsEngineering",
        mailLead: "פנייה חדשה:",
        mailName: "שם",
        mailPhone: "טלפון",
        mailObjectType: "סוג נכס",
        mailDate: "תאריך התחלה",
        mailComment: "הערה"
    }
};

const serviceGrid = document.getElementById("serviceGrid");
const objectsGrid = document.getElementById("objectsGrid");
const examplesContainer = document.getElementById("examplesContainer");
const workersGrid = document.getElementById("workersGrid");
const aboutEyebrow = document.getElementById("aboutEyebrow");
const aboutTitle = document.getElementById("aboutTitle");
const objectsEyebrow = document.getElementById("objectsEyebrow");
const objectsTitle = document.getElementById("objectsTitle");
const examplesEyebrow = document.getElementById("examplesEyebrow");
const examplesTitle = document.getElementById("examplesTitle");
const workersEyebrow = document.getElementById("workersEyebrow");
const workersTitle = document.getElementById("workersTitle");
const reviewsEyebrow = document.getElementById("reviewsEyebrow");
const reviewsTitle = document.getElementById("reviewsTitle");
const reviewFormTitle = document.getElementById("reviewFormTitle");
const reviewNameLabel = document.getElementById("reviewNameLabel");
const reviewTextLabel = document.getElementById("reviewTextLabel");
const reviewPhotoLabel = document.getElementById("reviewPhotoLabel");
const reviewSubmitButton = document.getElementById("reviewSubmitButton");

const contactEyebrow = document.getElementById("contactEyebrow");
const contactTitle = document.getElementById("contactTitle");
const contactDescription = document.getElementById("contactDescription");
const contactPhoneLink = document.getElementById("contactPhoneLink");
const contactEmailLink = document.getElementById("contactEmailLink");
const contactSubmitButton = document.getElementById("contactSubmitButton");
const contactNameLabel = document.getElementById("contactNameLabel");
const contactPhoneLabel = document.getElementById("contactPhoneLabel");
const contactObjectTypeLabel = document.getElementById("contactObjectTypeLabel");
const contactStartDateLabel = document.getElementById("contactStartDateLabel");
const contactMessageLabel = document.getElementById("contactMessageLabel");
const modalContactEyebrow = document.getElementById("modalContactEyebrow");
const contactModalTitle = document.getElementById("contactModalTitle");
const contactModalDescription = document.getElementById("contactModalDescription");
const modalContactSubmitButton = document.getElementById(
    "modalContactSubmitButton"
);
const modalContactNameLabel = document.getElementById("modalContactNameLabel");
const modalContactPhoneLabel = document.getElementById("modalContactPhoneLabel");
const modalContactObjectTypeLabel = document.getElementById(
    "modalContactObjectTypeLabel"
);
const modalContactStartDateLabel = document.getElementById(
    "modalContactStartDateLabel"
);
const modalContactMessageLabel = document.getElementById(
    "modalContactMessageLabel"
);
const footerCopyright = document.getElementById("footerCopyright");
const footerSocials = document.getElementById("footerSocials");
const navObjectsLink = document.getElementById("navObjectsLink");
const navExamplesLink = document.getElementById("navExamplesLink");
const navWorkersLink = document.getElementById("navWorkersLink");
const navReviewsLink = document.getElementById("navReviewsLink");
const navContactLink = document.getElementById("navContactLink");
const headerContactButton = document.getElementById("headerContactButton");
const siteHeader = document.querySelector(".site-header");
const heroEyebrow = document.getElementById("heroEyebrow");
const heroTitle = document.getElementById("heroTitle");
const heroText = document.getElementById("heroText");
const heroPrimaryButton = document.getElementById("heroPrimaryButton");
const heroSecondaryLink = document.getElementById("heroSecondaryLink");
const metricProjectsLabel = document.getElementById("metricProjectsLabel");
const metricExperienceLabel = document.getElementById("metricExperienceLabel");
const metricRecommendationLabel = document.getElementById(
    "metricRecommendationLabel"
);
const heroProcessTitle = document.getElementById("heroProcessTitle");
const heroStep1Title = document.getElementById("heroStep1Title");
const heroStep1Text = document.getElementById("heroStep1Text");
const heroStep2Title = document.getElementById("heroStep2Title");
const heroStep2Text = document.getElementById("heroStep2Text");
const heroStep3Title = document.getElementById("heroStep3Title");
const heroStep3Text = document.getElementById("heroStep3Text");
const languageSwitcher = document.getElementById("languageSwitcher");
const languageMenuButton = document.getElementById("languageMenuButton");
const languageMenu = document.getElementById("languageMenu");
const languageSwitchButtons = Array.from(
    document.querySelectorAll("[data-language-switch]")
);

const reviewsList = document.getElementById("reviewsList");
const reviewForm = document.getElementById("reviewForm");
const reviewNameInput = document.getElementById("reviewName");
const reviewTextInput = document.getElementById("reviewText");
const reviewPhotoInput = document.getElementById("reviewPhoto");
const reviewPhotoPreview = document.getElementById("reviewPhotoPreview");
const reviewFormStatus = document.getElementById("reviewFormStatus");
const contactNameInput = document.getElementById("contactName");
const contactPhoneInput = document.getElementById("contactPhone");
const contactMessageInput = document.getElementById("contactMessage");
const modalContactNameInput = document.getElementById("modalContactName");
const modalContactPhoneInput = document.getElementById("modalContactPhone");
const modalContactMessageInput = document.getElementById("modalContactMessage");

const contactForm = document.getElementById("contactForm");
const contactFormStatus = document.getElementById("contactFormStatus");
const modalContactForm = document.getElementById("modalContactForm");
const modalContactFormStatus = document.getElementById("modalContactFormStatus");
const contactModal = document.getElementById("contactModal");
const modalCloseButton = contactModal?.querySelector(".modal-close") || null;
const openContactModalButtons = document.querySelectorAll(
    "[data-open-contact-modal]"
);
const closeContactModalButtons = document.querySelectorAll(
    "[data-close-contact-modal]"
);
const contactObjectType = document.getElementById("contactObjectType");
const modalContactObjectType = document.getElementById("modalContactObjectType");

const exampleGalleryModal = document.getElementById("exampleGalleryModal");
const exampleGalleryImage = document.getElementById("exampleGalleryImage");
const exampleGalleryCaption = document.getElementById("exampleGalleryCaption");
const exampleGalleryCounter = document.getElementById("exampleGalleryCounter");
const exampleGalleryTitle = document.getElementById("exampleGalleryTitle");
const exampleGalleryPrevBtn = document.getElementById("exampleGalleryPrevBtn");
const exampleGalleryNextBtn = document.getElementById("exampleGalleryNextBtn");
const closeExampleGalleryButtons = document.querySelectorAll(
    "[data-close-example-gallery]"
);

let contactSuccessMessage =
    "Заявка отправлена. Менеджер свяжется с вами в ближайшее время.";
let activeSiteLanguage = fallbackLanguage;
let currentStaticUiText = STATIC_UI_TEXT[fallbackLanguage] || STATIC_UI_TEXT.ru;
const approvedReviewsByLanguage = {};
let approvedReviewsRequestToken = 0;
let activeExampleGalleryItems = [];
let activeExampleGalleryIndex = 0;
let activeExampleGalleryTitle = "";
let lastHeaderScrollY = Math.max(0, window.scrollY || 0);
let headerHiddenByScroll = false;
let headerScrollRaf = false;

function setText(element, value) {
    if (!element) {
        return;
    }
    element.textContent = value || "";
}

function setPlaceholder(element, value) {
    if (!element) {
        return;
    }
    element.setAttribute("placeholder", value || "");
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value || "";
    return div.innerHTML;
}

function syncBodyModalState() {
    const hasOpenModal = Boolean(
        (contactModal && contactModal.classList.contains("is-open")) ||
            (exampleGalleryModal && exampleGalleryModal.classList.contains("is-open"))
    );
    document.body.classList.toggle("modal-open", hasOpenModal);
}

function normalizeSectionLabels(sectionLabels) {
    const labels =
        sectionLabels && typeof sectionLabels === "object" ? sectionLabels : {};
    return {
        objects:
            String(labels.objects || "").trim() || currentStaticUiText.navObjects || "",
        examples:
            String(labels.examples || "").trim() || currentStaticUiText.navExamples || "",
        workers:
            String(labels.workers || "").trim() || currentStaticUiText.navWorkers || "",
        reviews:
            String(labels.reviews || "").trim() || currentStaticUiText.navReviews || "",
        contact:
            String(labels.contact || "").trim() || currentStaticUiText.navContact || ""
    };
}

function normalizeExampleImages(item) {
    const source = item && typeof item === "object" ? item : {};
    const fromArray = Array.isArray(source.images) ? source.images : [];
    const normalized = fromArray
        .map((entry) => ({
            url: String(entry?.url || "").trim(),
            alt: String(entry?.alt || "").trim()
        }))
        .filter((entry) => entry.url || entry.alt)
        .slice(0, 20);

    if (!normalized.length) {
        const legacyUrl = String(source.image || "").trim();
        const legacyAlt = String(source.alt || "").trim();
        if (legacyUrl || legacyAlt) {
            normalized.push({
                url: legacyUrl,
                alt: legacyAlt
            });
        }
    }

    return normalized;
}

function isValidSiteLanguage(languageId) {
    return languageIds.includes(languageId);
}

function getLanguageContent(languageId) {
    if (!siteContent) {
        return null;
    }

    const fallbackId = isValidSiteLanguage(fallbackLanguage)
        ? fallbackLanguage
        : "ru";
    const translations =
        siteContent && typeof siteContent.translations === "object"
            ? siteContent.translations
            : null;

    if (!translations) {
        return null;
    }

    return (
        translations[languageId] ||
        translations[fallbackId] ||
        translations.ru ||
        null
    );
}

function getPreferredLanguage() {
    const storedLanguage = localStorage.getItem(SITE_LANGUAGE_STORAGE_KEY);
    if (isValidSiteLanguage(storedLanguage)) {
        return storedLanguage;
    }

    const stateLanguage = siteContent?.activeLanguage;
    if (isValidSiteLanguage(stateLanguage)) {
        return stateLanguage;
    }

    return isValidSiteLanguage(fallbackLanguage) ? fallbackLanguage : "ru";
}

function applyDocumentLanguage(languageId) {
    document.documentElement.lang = languageId;
    document.documentElement.dir = directionByLanguage[languageId] || "ltr";
}

function updateLanguageButtons() {
    languageSwitchButtons.forEach((button) => {
        const buttonLanguage = button.getAttribute("data-language-switch");
        const isActive = buttonLanguage === activeSiteLanguage;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-checked", String(isActive));
    });
}

function setLanguageMenuOpen(isOpen) {
    if (!languageSwitcher || !languageMenuButton || !languageMenu) {
        return;
    }

    languageSwitcher.classList.toggle("is-open", isOpen);
    languageMenuButton.setAttribute("aria-expanded", String(isOpen));
    languageMenu.setAttribute("aria-hidden", String(!isOpen));
}

function renderStaticUiText(languageId) {
    currentStaticUiText =
        STATIC_UI_TEXT[languageId] || STATIC_UI_TEXT[fallbackLanguage] || STATIC_UI_TEXT.ru;

    setText(navObjectsLink, currentStaticUiText.navObjects);
    setText(navExamplesLink, currentStaticUiText.navExamples);
    setText(navWorkersLink, currentStaticUiText.navWorkers);
    setText(navReviewsLink, currentStaticUiText.navReviews);
    setText(navContactLink, currentStaticUiText.navContact);
    setText(headerContactButton, currentStaticUiText.headerCta);
    setText(heroEyebrow, currentStaticUiText.heroEyebrow);
    setText(heroTitle, currentStaticUiText.heroTitle);
    setText(heroText, currentStaticUiText.heroText);
    setText(heroPrimaryButton, currentStaticUiText.heroPrimary);
    setText(heroSecondaryLink, currentStaticUiText.heroSecondary);
    setText(metricProjectsLabel, currentStaticUiText.metricProjects);
    setText(metricExperienceLabel, currentStaticUiText.metricExperience);
    setText(metricRecommendationLabel, currentStaticUiText.metricRecommendation);
    setText(heroProcessTitle, currentStaticUiText.processTitle);
    setText(heroStep1Title, currentStaticUiText.processStep1Title);
    setText(heroStep1Text, currentStaticUiText.processStep1Text);
    setText(heroStep2Title, currentStaticUiText.processStep2Title);
    setText(heroStep2Text, currentStaticUiText.processStep2Text);
    setText(heroStep3Title, currentStaticUiText.processStep3Title);
    setText(heroStep3Text, currentStaticUiText.processStep3Text);

    setText(reviewFormTitle, currentStaticUiText.reviewFormTitle);
    setText(reviewNameLabel, currentStaticUiText.reviewNameLabel);
    setText(reviewTextLabel, currentStaticUiText.reviewTextLabel);
    setText(reviewPhotoLabel, currentStaticUiText.reviewPhotoLabel);
    setText(reviewSubmitButton, currentStaticUiText.reviewSubmit);
    setPlaceholder(reviewNameInput, currentStaticUiText.reviewNamePlaceholder);
    setPlaceholder(reviewTextInput, currentStaticUiText.reviewTextPlaceholder);
    if (reviewPhotoPreview) {
        reviewPhotoPreview.alt = currentStaticUiText.reviewPreviewAlt || "";
    }

    setText(contactNameLabel, currentStaticUiText.contactNameLabel);
    setText(contactPhoneLabel, currentStaticUiText.contactPhoneLabel);
    setText(contactObjectTypeLabel, currentStaticUiText.contactObjectTypeLabel);
    setText(contactStartDateLabel, currentStaticUiText.contactStartDateLabel);
    setText(contactMessageLabel, currentStaticUiText.contactMessageLabel);
    setText(modalContactNameLabel, currentStaticUiText.contactNameLabel);
    setText(modalContactPhoneLabel, currentStaticUiText.contactPhoneLabel);
    setText(
        modalContactObjectTypeLabel,
        currentStaticUiText.contactObjectTypeLabel
    );
    setText(
        modalContactStartDateLabel,
        currentStaticUiText.contactStartDateLabel
    );
    setText(modalContactMessageLabel, currentStaticUiText.contactMessageLabel);
    setPlaceholder(contactNameInput, currentStaticUiText.contactNamePlaceholder);
    setPlaceholder(contactPhoneInput, currentStaticUiText.contactPhonePlaceholder);
    setPlaceholder(
        contactMessageInput,
        currentStaticUiText.contactMessagePlaceholder
    );
    setPlaceholder(
        modalContactNameInput,
        currentStaticUiText.contactNamePlaceholder
    );
    setPlaceholder(
        modalContactPhoneInput,
        currentStaticUiText.contactPhonePlaceholder
    );
    setPlaceholder(
        modalContactMessageInput,
        currentStaticUiText.contactMessagePlaceholder
    );
    if (modalCloseButton) {
        modalCloseButton.setAttribute(
            "aria-label",
            currentStaticUiText.modalCloseAria || ""
        );
    }
    setText(exampleGalleryTitle, currentStaticUiText.exampleGalleryTitle);
    if (exampleGalleryPrevBtn) {
        exampleGalleryPrevBtn.setAttribute(
            "aria-label",
            currentStaticUiText.exampleGalleryPrev || ""
        );
        exampleGalleryPrevBtn.setAttribute(
            "title",
            currentStaticUiText.exampleGalleryPrev || ""
        );
    }
    if (exampleGalleryNextBtn) {
        exampleGalleryNextBtn.setAttribute(
            "aria-label",
            currentStaticUiText.exampleGalleryNext || ""
        );
        exampleGalleryNextBtn.setAttribute(
            "title",
            currentStaticUiText.exampleGalleryNext || ""
        );
    }
}

function renderSectionLabels(sectionLabels) {
    const labels = normalizeSectionLabels(sectionLabels);
    setText(navObjectsLink, labels.objects);
    setText(navExamplesLink, labels.examples);
    setText(navWorkersLink, labels.workers);
    setText(navReviewsLink, labels.reviews);
    setText(navContactLink, labels.contact);
}

function renderLanguageContent(languageId) {
    renderStaticUiText(languageId);
    const languageContent = getLanguageContent(languageId);
    if (languageContent) {
        renderSiteContent(languageContent);
        loadApprovedReviews(languageId);
        setupRevealAnimation();
    }
}

function setSiteLanguage(languageId, options = {}) {
    if (!isValidSiteLanguage(languageId)) {
        return;
    }

    activeSiteLanguage = languageId;
    if (options.save !== false) {
        localStorage.setItem(SITE_LANGUAGE_STORAGE_KEY, languageId);
    }
    applyDocumentLanguage(languageId);
    updateLanguageButtons();
    renderLanguageContent(languageId);
}

function setupLanguageSwitcher() {
    if (!languageSwitchButtons.length) {
        return;
    }

    languageSwitchButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const nextLanguage = button.getAttribute("data-language-switch");
            if (!nextLanguage) {
                return;
            }
            setSiteLanguage(nextLanguage);
            setLanguageMenuOpen(false);
        });
    });

    if (!languageSwitcher || !languageMenuButton || !languageMenu) {
        return;
    }

    languageMenuButton.addEventListener("click", (event) => {
        event.stopPropagation();
        setLanguageMenuOpen(!languageSwitcher.classList.contains("is-open"));
    });

    document.addEventListener("click", (event) => {
        if (!(event.target instanceof Node)) {
            return;
        }
        if (!languageSwitcher.contains(event.target)) {
            setLanguageMenuOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            languageSwitcher.classList.contains("is-open")
        ) {
            setLanguageMenuOpen(false);
            languageMenuButton.focus();
        }
    });
}

function createReviewCard(review) {
    const card = document.createElement("article");
    card.className = "review-card";

    if (review.photo) {
        const image = document.createElement("img");
        image.src = review.photo;
        image.alt = "Фотография объекта от клиента";
        image.className = "review-photo";
        card.append(image);
    }

    const textParagraph = document.createElement("p");
    textParagraph.textContent = `"${review.text || ""}"`;
    card.append(textParagraph);

    const meta = document.createElement("div");
    meta.className = "review-meta";

    const name = document.createElement("strong");
    name.textContent = review.name || "Клиент";
    meta.append(name);

    const details = document.createElement("span");
    details.textContent = review.meta || review.date || "";
    meta.append(details);

    card.append(meta);
    return card;
}

function renderAboutSection(section) {
    if (!section || !serviceGrid) {
        return;
    }

    setText(aboutEyebrow, section.eyebrow);
    setText(aboutTitle, section.title);

    serviceGrid.innerHTML = "";
    section.items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "card reveal";
        card.innerHTML = `
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
        `;
        serviceGrid.append(card);
    });
}

function renderObjectsSection(section) {
    if (!section || !objectsGrid) {
        return;
    }

    setText(objectsEyebrow, section.eyebrow);
    setText(objectsTitle, section.title);

    objectsGrid.innerHTML = "";
    section.items.forEach((item) => {
        const card = document.createElement("figure");
        card.className = "gallery-card reveal";
        card.innerHTML = `
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}" />
            <figcaption>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
            </figcaption>
        `;
        objectsGrid.append(card);
    });
}

function updateExampleGalleryView() {
    if (
        !exampleGalleryImage ||
        !exampleGalleryCaption ||
        !exampleGalleryCounter ||
        !exampleGalleryPrevBtn ||
        !exampleGalleryNextBtn
    ) {
        return;
    }

    const total = activeExampleGalleryItems.length;
    if (!total) {
        exampleGalleryImage.removeAttribute("src");
        exampleGalleryImage.alt = "";
        exampleGalleryCaption.textContent = "";
        exampleGalleryCounter.textContent = "";
        exampleGalleryPrevBtn.disabled = true;
        exampleGalleryNextBtn.disabled = true;
        return;
    }

    const safeIndex = ((activeExampleGalleryIndex % total) + total) % total;
    activeExampleGalleryIndex = safeIndex;
    const current = activeExampleGalleryItems[safeIndex];

    exampleGalleryImage.src = current.url;
    exampleGalleryImage.alt = current.alt || activeExampleGalleryTitle || "";
    exampleGalleryCaption.textContent = current.alt || activeExampleGalleryTitle || "";
    exampleGalleryCounter.textContent = `${safeIndex + 1} / ${total}`;
    const disableNav = total < 2;
    exampleGalleryPrevBtn.disabled = disableNav;
    exampleGalleryNextBtn.disabled = disableNav;
}

function openExampleGallery(images, title, startIndex = 0) {
    if (!exampleGalleryModal) {
        return;
    }

    const normalized = (Array.isArray(images) ? images : [])
        .map((item) => ({
            url: String(item?.url || "").trim(),
            alt: String(item?.alt || "").trim()
        }))
        .filter((item) => item.url);
    if (!normalized.length) {
        return;
    }

    activeExampleGalleryItems = normalized;
    activeExampleGalleryTitle = String(title || "").trim();
    activeExampleGalleryIndex = startIndex;
    updateExampleGalleryView();

    exampleGalleryModal.classList.add("is-open");
    exampleGalleryModal.setAttribute("aria-hidden", "false");
    syncBodyModalState();
}

function closeExampleGallery() {
    if (!exampleGalleryModal) {
        return;
    }

    exampleGalleryModal.classList.remove("is-open");
    exampleGalleryModal.setAttribute("aria-hidden", "true");
    syncBodyModalState();
}

function renderExamplesSection(section) {
    if (!section || !examplesContainer) {
        return;
    }

    setText(examplesEyebrow, section.eyebrow);
    setText(examplesTitle, section.title);

    examplesContainer.innerHTML = "";
    section.items.forEach((item) => {
        const statsMarkup = (item.stats || [])
            .map(
                (stat) =>
                    `<li><span>${escapeHtml(stat.label)}</span><strong>${escapeHtml(
                        stat.value
                    )}</strong></li>`
            )
            .join("");
        const galleryImages = normalizeExampleImages(item).filter((entry) => entry.url);
        const previewImage = galleryImages[0] || {
            url: String(item.image || "").trim(),
            alt: String(item.alt || "").trim()
        };
        const imageUrl =
            previewImage.url ||
            "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        const photoCountBadge =
            galleryImages.length > 1
                ? `<span class="example-gallery-count">${galleryImages.length} фото</span>`
                : "";

        const card = document.createElement("article");
        card.className = "example-card reveal";
        if (galleryImages.length) {
            card.classList.add("is-interactive");
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.setAttribute(
                "aria-label",
                `Открыть галерею проекта ${String(item.title || "").trim()}`
            );
        }
        card.innerHTML = `
            <div class="example-card-media">
                <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(
            previewImage.alt || item.title || ""
        )}" />
                ${photoCountBadge}
            </div>
            <div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
                <ul class="example-stats">${statsMarkup}</ul>
            </div>
        `;

        if (galleryImages.length) {
            const openGallery = () => openExampleGallery(galleryImages, item.title, 0);
            card.addEventListener("click", openGallery);
            card.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") {
                    return;
                }
                event.preventDefault();
                openGallery();
            });
        }

        examplesContainer.append(card);
    });
}

function renderWorkersSection(section) {
    if (!section || !workersGrid) {
        return;
    }

    setText(workersEyebrow, section.eyebrow);
    setText(workersTitle, section.title);

    workersGrid.innerHTML = "";
    (Array.isArray(section.items) ? section.items : []).forEach((worker) => {
        const card = document.createElement("article");
        card.className = "worker-card reveal";
        card.innerHTML = `
            <img src="${escapeHtml(worker.photo || "")}" alt="${escapeHtml(
            worker.name || "Сотрудник компании"
        )}" />
            <div class="worker-card-body">
                <h3>${escapeHtml(worker.name || "Сотрудник")}</h3>
                <p>${escapeHtml(worker.bio || "")}</p>
            </div>
        `;
        workersGrid.append(card);
    });
}

function renderReviewsSection(section) {
    if (!section || !reviewsList) {
        return;
    }

    setText(reviewsEyebrow, section.eyebrow);
    setText(reviewsTitle, section.title);

    reviewsList.innerHTML = "";
    section.items.forEach((review) => {
        reviewsList.append(createReviewCard(review));
    });
    renderApprovedReviews(activeSiteLanguage);
}

function sanitizePhoneForHref(value) {
    const raw = String(value || "").trim();
    if (!raw) {
        return "";
    }

    const keepLeadingPlus = raw.startsWith("+");
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) {
        return "";
    }

    return keepLeadingPlus ? `+${digits}` : digits;
}

function normalizeExternalUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) {
        return "";
    }
    if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) {
        return raw;
    }
    return `https://${raw.replace(/^\/+/, "")}`;
}

function fillObjectTypeSelect(selectElement, values) {
    if (!selectElement) {
        return;
    }

    selectElement.innerHTML = "";
    values.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        selectElement.append(option);
    });
}

function renderContactSection(section) {
    if (!section) {
        return;
    }

    setText(contactEyebrow, section.eyebrow);
    setText(contactTitle, section.title);
    setText(contactDescription, section.description);
    setText(modalContactEyebrow, section.eyebrow);
    setText(contactModalTitle, section.modalTitle);
    setText(contactModalDescription, section.modalDescription);

    if (contactPhoneLink) {
        const phoneText = section.phoneText || "";
        contactPhoneLink.textContent = phoneText;
        const phoneHref = sanitizePhoneForHref(phoneText);
        contactPhoneLink.href = phoneHref ? `tel:${phoneHref}` : "#";
    }

    if (contactEmailLink) {
        const email = section.emailText || "";
        contactEmailLink.textContent = email;
        contactEmailLink.href = email ? `mailto:${email}` : "#";
    }

    if (contactSubmitButton) {
        contactSubmitButton.textContent = section.submitLabel || "Отправить заявку";
    }

    if (modalContactSubmitButton) {
        modalContactSubmitButton.textContent =
            section.submitLabel || "Отправить заявку";
    }

    fillObjectTypeSelect(contactObjectType, section.objectTypes || []);
    fillObjectTypeSelect(modalContactObjectType, section.objectTypes || []);

    contactSuccessMessage = section.successMessage || contactSuccessMessage;
}

function normalizeFooterSocialLinks(section) {
    const fromArray = Array.isArray(section?.socialLinks)
        ? section.socialLinks
        : [];

    if (fromArray.length) {
        return fromArray
            .map((item) => ({
                label: String(item?.label || "").trim(),
                url: String(item?.url || "").trim()
            }))
            .filter((item) => item.label || item.url);
    }

    return [
        { label: section?.telegramLabel || "Telegram", url: section?.telegramUrl || "" },
        {
            label: section?.instagramLabel || "Instagram",
            url: section?.instagramUrl || ""
        },
        { label: section?.youtubeLabel || "YouTube", url: section?.youtubeUrl || "" },
        { label: section?.vkLabel || "VK", url: section?.vkUrl || "" }
    ].filter((item) => String(item.label || "").trim() || String(item.url || "").trim());
}

function renderFooterSection(section) {
    if (!section) {
        return;
    }

    setText(footerCopyright, section.copyrightText);
    if (!footerSocials) {
        return;
    }

    footerSocials.innerHTML = "";
    const links = normalizeFooterSocialLinks(section);
    links.forEach((item) => {
        const anchor = document.createElement("a");
        anchor.className = "footer-social-btn";
        anchor.textContent = item.label || "Ссылка";

        const normalizedUrl = normalizeExternalUrl(item.url);
        if (normalizedUrl) {
            anchor.href = normalizedUrl;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
        } else {
            anchor.href = "#";
        }
        footerSocials.append(anchor);
    });
}

function renderSiteContent(content) {
    if (!content) {
        return;
    }

    renderSectionLabels(content.sectionLabels);
    renderAboutSection(content.about);
    renderObjectsSection(content.objects);
    renderExamplesSection(content.examples);
    renderWorkersSection(content.workers);
    renderReviewsSection(content.reviews);
    renderContactSection(content.contact);
    renderFooterSection(content.footer);
}

function setupRevealAnimation() {
    const revealElements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });
        return;
    }

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.add("is-visible");
                currentObserver.unobserve(entry.target);
            });
        },
        { threshold: 0.2 }
    );

    revealElements.forEach((element) => observer.observe(element));
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Не удалось прочитать файл."));
        reader.readAsDataURL(file);
    });
}

function renderApprovedReviews(languageId) {
    if (!reviewsList) {
        return;
    }

    const approvedReviews = Array.isArray(approvedReviewsByLanguage[languageId])
        ? approvedReviewsByLanguage[languageId]
        : [];

    approvedReviews.forEach((review) => {
        reviewsList.append(createReviewCard(review));
    });
}

function loadApprovedReviews(languageId) {
    if (!contentStore || typeof contentStore.getApprovedReviews !== "function") {
        return;
    }

    const requestToken = ++approvedReviewsRequestToken;
    const normalizedLanguage = isValidSiteLanguage(languageId)
        ? languageId
        : fallbackLanguage;

    let approvedReviews = [];
    try {
        approvedReviews = contentStore.getApprovedReviews(normalizedLanguage);
    } catch {
        approvedReviews = [];
    }

    approvedReviewsByLanguage[normalizedLanguage] = Array.isArray(approvedReviews)
        ? approvedReviews
        : [];

    if (
        requestToken !== approvedReviewsRequestToken ||
        normalizedLanguage !== activeSiteLanguage
    ) {
        return;
    }

    const languageContent = getLanguageContent(normalizedLanguage);
    if (languageContent?.reviews) {
        renderReviewsSection(languageContent.reviews);
    }
}

function setupReviewPhotoPreview() {
    reviewPhotoInput.addEventListener("change", () => {
        const file = reviewPhotoInput.files?.[0];
        if (!file) {
            reviewPhotoPreview.src = "";
            reviewPhotoPreview.classList.add("hidden");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        reviewPhotoPreview.src = previewUrl;
        reviewPhotoPreview.classList.remove("hidden");
    });
}

function setupReviewForm() {
    reviewForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        reviewFormStatus.textContent = "";
        const submitButton = reviewForm.querySelector("button[type='submit']");
        if (submitButton) {
            submitButton.disabled = true;
        }

        const name = reviewNameInput.value.trim();
        const text = reviewTextInput.value.trim();
        const file = reviewPhotoInput.files?.[0];

        if (!name || !text) {
            reviewFormStatus.textContent = currentStaticUiText.reviewValidation;
            if (submitButton) {
                submitButton.disabled = false;
            }
            return;
        }

        let photo = "";
        if (file) {
            try {
                photo = await readFileAsDataUrl(file);
            } catch (error) {
                reviewFormStatus.textContent = error.message;
                if (submitButton) {
                    submitButton.disabled = false;
                }
                return;
            }
        }

        const review = {
            name,
            text,
            meta: new Date().toLocaleDateString(
                localeByLanguage[activeSiteLanguage] || "ru-RU"
            ),
            photo,
            language: activeSiteLanguage
        };

        if (!contentStore || typeof contentStore.submitPublicReview !== "function") {
            reviewFormStatus.textContent = currentStaticUiText.requestSendError;
            if (submitButton) {
                submitButton.disabled = false;
            }
            return;
        }

        try {
            contentStore.submitPublicReview(review);
            reviewForm.reset();
            reviewPhotoPreview.src = "";
            reviewPhotoPreview.classList.add("hidden");
            reviewFormStatus.textContent = currentStaticUiText.reviewSuccess;
        } catch (error) {
            reviewFormStatus.textContent =
                error?.message || currentStaticUiText.requestSendError;
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}

function openContactModal() {
    if (!contactModal) {
        return;
    }

    contactModal.classList.add("is-open");
    contactModal.setAttribute("aria-hidden", "false");
    syncBodyModalState();

    if (modalContactFormStatus) {
        modalContactFormStatus.textContent = "";
    }

    const firstField = contactModal.querySelector("input, select, textarea");
    if (firstField instanceof HTMLElement) {
        firstField.focus();
    }
}

function closeContactModal() {
    if (!contactModal) {
        return;
    }

    contactModal.classList.remove("is-open");
    contactModal.setAttribute("aria-hidden", "true");
    syncBodyModalState();
}

function setupContactModal() {
    if (!contactModal) {
        return;
    }

    openContactModalButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            openContactModal();
        });
    });

    closeContactModalButtons.forEach((button) => {
        button.addEventListener("click", closeContactModal);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && contactModal.classList.contains("is-open")) {
            closeContactModal();
        }
    });
}

function setupExampleGalleryModal() {
    if (!exampleGalleryModal) {
        return;
    }

    if (exampleGalleryPrevBtn) {
        exampleGalleryPrevBtn.addEventListener("click", () => {
            activeExampleGalleryIndex -= 1;
            updateExampleGalleryView();
        });
    }

    if (exampleGalleryNextBtn) {
        exampleGalleryNextBtn.addEventListener("click", () => {
            activeExampleGalleryIndex += 1;
            updateExampleGalleryView();
        });
    }

    closeExampleGalleryButtons.forEach((button) => {
        button.addEventListener("click", closeExampleGallery);
    });

    document.addEventListener("keydown", (event) => {
        if (!exampleGalleryModal.classList.contains("is-open")) {
            return;
        }

        if (event.key === "Escape") {
            closeExampleGallery();
            return;
        }

        if (event.key === "ArrowLeft") {
            activeExampleGalleryIndex -= 1;
            updateExampleGalleryView();
            return;
        }

        if (event.key === "ArrowRight") {
            activeExampleGalleryIndex += 1;
            updateExampleGalleryView();
        }
    });
}

function getFirstFilledFormValue(formData, keys) {
    for (const key of keys) {
        const rawValue = formData.get(key);
        const value = String(rawValue || "").trim();
        if (value) {
            return value;
        }
    }
    return "";
}

function formatDateForMessage(value) {
    const raw = String(value || "").trim();
    if (!raw) {
        return "";
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
        return raw;
    }

    return parsed.toLocaleDateString(
        localeByLanguage[activeSiteLanguage] || "ru-RU"
    );
}

function buildContactPayload(formElement) {
    const formData = new FormData(formElement);
    const name = getFirstFilledFormValue(formData, [
        "contactName",
        "modalContactName"
    ]);
    const phone = getFirstFilledFormValue(formData, [
        "contactPhone",
        "modalContactPhone"
    ]);
    const objectType = getFirstFilledFormValue(formData, [
        "contactObjectType",
        "modalContactObjectType"
    ]);
    const startDate = formatDateForMessage(
        getFirstFilledFormValue(formData, ["contactStartDate", "modalContactStartDate"])
    );
    const message = getFirstFilledFormValue(formData, [
        "contactMessage",
        "modalContactMessage"
    ]);

    const subject = currentStaticUiText.mailSubject;
    const bodyLines = [
        currentStaticUiText.mailLead,
        "",
        `${currentStaticUiText.mailName}: ${name || "-"}`,
        `${currentStaticUiText.mailPhone}: ${phone || "-"}`,
        `${currentStaticUiText.mailObjectType}: ${objectType || "-"}`,
        `${currentStaticUiText.mailDate}: ${startDate || "-"}`,
        `${currentStaticUiText.mailComment}: ${message || "-"}`
    ];

    return {
        _subject: subject,
        _template: "table",
        _captcha: "false",
        language: activeSiteLanguage,
        name,
        phone,
        objectType,
        startDate,
        comment: message,
        message: bodyLines.join("\n")
    };
}

async function sendContactRequest(formElement) {
    const payload = buildContactPayload(formElement);
    const response = await fetch(CONTACT_SUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`FormSubmit error: ${response.status}`);
    }

    const responseData = await response.json().catch(() => ({}));
    if (responseData && responseData.ok !== true) {
        throw new Error("Contact request rejected");
    }
}

function setupContactForm(formElement, statusElement) {
    if (!formElement || !statusElement) {
        return;
    }

    formElement.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = formElement.querySelector("button[type='submit']");
        if (submitButton) {
            submitButton.disabled = true;
        }

        statusElement.textContent = currentStaticUiText.requestSending;

        try {
            await sendContactRequest(formElement);
            statusElement.textContent = contactSuccessMessage;
            formElement.reset();

            if (formElement === modalContactForm) {
                closeContactModal();
            }
        } catch {
            statusElement.textContent = currentStaticUiText.requestSendError;
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}

function setupProjectStartDateFields() {
    const dateInputs = document.querySelectorAll(
        "#contactStartDate, #modalContactStartDate"
    );
    const today = new Date().toISOString().split("T")[0];
    dateInputs.forEach((input) => input.setAttribute("min", today));
}

function setupCompanyLogos() {
    const logoImages = document.querySelectorAll(".company-logo-image");

    logoImages.forEach((image) => {
        const fallback = image.parentElement?.querySelector(
            ".company-logo-fallback"
        );

        const showFallback = () => {
            image.classList.add("hidden");
            if (fallback) {
                fallback.classList.remove("hidden");
            }
        };

        image.addEventListener("error", showFallback);
        if (image.complete && image.naturalWidth === 0) {
            showFallback();
        }
    });
}

function updateHeaderVisibilityOnScroll() {
    if (!siteHeader) {
        return;
    }

    const currentScrollY = Math.max(0, window.scrollY || 0);

    if (currentScrollY <= 24) {
        siteHeader.classList.remove("is-hidden");
        headerHiddenByScroll = false;
        lastHeaderScrollY = currentScrollY;
        return;
    }

    const scrollDelta = currentScrollY - lastHeaderScrollY;
    if (scrollDelta > 6 && !headerHiddenByScroll) {
        siteHeader.classList.add("is-hidden");
        headerHiddenByScroll = true;
    } else if (scrollDelta < -4 && headerHiddenByScroll) {
        siteHeader.classList.remove("is-hidden");
        headerHiddenByScroll = false;
    }

    lastHeaderScrollY = currentScrollY;
}

function setupHeaderAutoHideOnScroll() {
    if (!siteHeader) {
        return;
    }

    lastHeaderScrollY = Math.max(0, window.scrollY || 0);
    siteHeader.classList.remove("is-hidden");

    window.addEventListener(
        "scroll",
        () => {
            if (headerScrollRaf) {
                return;
            }
            headerScrollRaf = true;
            window.requestAnimationFrame(() => {
                updateHeaderVisibilityOnScroll();
                headerScrollRaf = false;
            });
        },
        { passive: true }
    );
}

const preferredLanguage = getPreferredLanguage();
setSiteLanguage(preferredLanguage, { save: false });
setupHeaderAutoHideOnScroll();
setupLanguageSwitcher();
setupReviewPhotoPreview();
setupReviewForm();
setupContactModal();
setupExampleGalleryModal();
setupContactForm(contactForm, contactFormStatus);
setupContactForm(modalContactForm, modalContactFormStatus);
setupProjectStartDateFields();
setupCompanyLogos();
