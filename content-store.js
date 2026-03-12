(function () {
    const CONTENT_STORAGE_KEY = "randsengineering-site-content-v1";
    const USER_REVIEW_STORAGE_KEY = "randsengineering-user-reviews-v1";
    const ADMIN_USERS_KEY = "randsengineering-admin-users-v1";
    const ADMIN_CSRF_KEY = "randsengineering-admin-csrf-v1";
    const API_BASE = "/api";

    const ACCESS_LEVELS = [
        {
            id: "owner",
            label: "Владелец",
            permissions: ["content:edit", "content:advanced", "admins:manage"]
        },
        {
            id: "manager",
            label: "Менеджер",
            permissions: ["content:edit", "content:advanced"]
        },
        {
            id: "editor",
            label: "Редактор",
            permissions: ["content:edit"]
        },
        {
            id: "viewer",
            label: "Наблюдатель",
            permissions: []
        }
    ];

    const DEFAULT_OWNER_LOGIN = "tim123";
    const DEFAULT_OWNER_PASSWORD = "Butterfly8462";

    const DEFAULT_ADMIN_USERS = [
        {
            login: DEFAULT_OWNER_LOGIN,
            password: DEFAULT_OWNER_PASSWORD,
            role: "owner",
            protected: true
        }
    ];

    const LANGUAGE_IDS = ["ru", "en", "he"];
    const DEFAULT_LANGUAGE = "ru";

    const DEFAULT_LANGUAGE_CONTENT = {
        about: {
            eyebrow: "описание работ",
            title: "Ремонтные и инженерные работы для жилых и коммерческих объектов",
            items: [
                {
                    title: "Черновые работы",
                    description:
                        "Демонтаж, выравнивание, стяжка, шумоизоляция и подготовка базовых поверхностей."
                },
                {
                    title: "Инженерные системы",
                    description:
                        "Монтаж электрики, вентиляции, водоснабжения и слаботочных систем с учетом норм."
                },
                {
                    title: "Чистовая отделка",
                    description:
                        "Качественная покраска, укладка плитки, напольные покрытия, монтаж освещения и декора."
                },
                {
                    title: "Авторский надзор",
                    description:
                        "Еженедельные отчеты, контроль подрядчиков и корректировки по ходу проекта."
                }
            ]
        },
        objects: {
            eyebrow: "фотографии объектов",
            title: "Реальные проекты, выполненные командой RandsEngineering",
            items: [
                {
                    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
                    alt: "Гостиная после ремонта",
                    title: "Квартира 92 м²",
                    description:
                        "Полный ремонт с инженерным обновлением и системой умного света."
                },
                {
                    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
                    alt: "Современная кухня после ремонта",
                    title: "Кухня-студия",
                    description:
                        "Перепланировка, новые коммуникации и минималистичная отделка."
                },
                {
                    image: "https://images.unsplash.com/photo-1491924778227-f225b115b7a5?auto=format&fit=crop&w=1200&q=80",
                    alt: "Офисное пространство после ремонта",
                    title: "Офис IT-компании",
                    description:
                        "Зонирование open-space, акустика, свет и финишная отделка."
                }
            ]
        },
        examples: {
            eyebrow: "примеры работ",
            title: "Что именно мы улучшаем на каждом объекте",
            items: [
                {
                    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
                    alt: "Спальня после ремонта",
                    images: [
                        {
                            url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
                            alt: "Спальня после ремонта"
                        },
                        {
                            url: "https://images.unsplash.com/photo-1505693416388-ac5ce068df56?auto=format&fit=crop&w=1200&q=80",
                            alt: "Детали интерьера после ремонта"
                        }
                    ],
                    title: "Капитальный ремонт квартиры",
                    description:
                        "Полная замена инженерных систем, выравнивание геометрии помещений и чистовая отделка по дизайн-проекту.",
                    stats: [
                        { label: "Срок", value: "56 дней" },
                        { label: "Площадь", value: "118 м²" },
                        { label: "Команда", value: "9 специалистов" }
                    ]
                },
                {
                    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
                    alt: "Современный коммерческий интерьер",
                    images: [
                        {
                            url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
                            alt: "Современный коммерческий интерьер"
                        },
                        {
                            url: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
                            alt: "Рабочая зона коммерческого помещения"
                        }
                    ],
                    title: "Реконструкция коммерческого помещения",
                    description:
                        "Подготовка помещения под бренд-стандарты: электрика, вентиляция, освещение, отделка и монтаж мебели.",
                    stats: [
                        { label: "Срок", value: "41 день" },
                        { label: "Площадь", value: "240 м²" },
                        { label: "Результат", value: "Сдача без замечаний" }
                    ]
                }
            ]
        },
        workers: {
            eyebrow: "наша команда",
            title: "Специалисты, которые работают на ваших объектах",
            items: [
                {
                    name: "Тимофей Р.",
                    bio: "Руководитель проектов. Контролирует сроки, смету и качество работ на каждом этапе.",
                    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80"
                },
                {
                    name: "Александр М.",
                    bio: "Инженер-электрик. Отвечает за электрику, щиты, безопасность и автоматизацию.",
                    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80"
                },
                {
                    name: "Илья К.",
                    bio: "Мастер-отделочник. Специализируется на чистовой отделке и аккуратных деталях.",
                    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"
                }
            ]
        },
        reviews: {
            eyebrow: "отзывы клиентов",
            title: "Что говорят заказчики после завершения проектов",
            items: [
                {
                    name: "Марина К.",
                    meta: "Квартира, 84 м²",
                    text: "Команда очень дисциплинированная. Каждый этап был понятен, ремонт сдали точно в оговоренный срок.",
                    photo: ""
                },
                {
                    name: "Алексей Р.",
                    meta: "Офис, 190 м²",
                    text: "Отлично продумали инженерную часть, сейчас в офисе стало тише и намного комфортнее работать.",
                    photo: ""
                }
            ]
        },
        contact: {
            eyebrow: "обратная связь",
            title: "Оставьте заявку, и мы свяжемся с вами в течение 30 минут",
            description:
                "Расскажите о задаче, площади и формате объекта. Подготовим предварительный расчет и предложим оптимальный формат работ.",
            phoneText: "+7 (999) 000-00-00",
            emailText: "hello@randsengineering.com",
            requestEmail: "timofejrivkin@gmail.com",
            objectTypes: [
                "Квартира",
                "Дом",
                "Офис",
                "Коммерческое помещение"
            ],
            submitLabel: "Отправить заявку",
            modalTitle: "Оставьте заявку на проект",
            modalDescription:
                "Заполните форму, и менеджер RandsEngineering свяжется с вами в течение 30 минут.",
            successMessage:
                "Заявка отправлена. Менеджер свяжется с вами в ближайшее время."
        },
        sectionLabels: {
            objects: "Объекты",
            examples: "Примеры работ",
            workers: "Рабочие",
            reviews: "Отзывы",
            contact: "Контакты"
        },
        footer: {
            copyrightText: "© 2026 RandsEngineering. Ремонт и инженерные решения.",
            socialLinks: [
                { label: "Telegram", url: "" },
                { label: "Instagram", url: "" },
                { label: "YouTube", url: "" },
                { label: "VK", url: "" }
            ]
        }
    };

    const DEFAULT_TRANSLATIONS = {
        ru: clone(DEFAULT_LANGUAGE_CONTENT),
        en: clone(DEFAULT_LANGUAGE_CONTENT),
        he: clone(DEFAULT_LANGUAGE_CONTENT)
    };

    DEFAULT_TRANSLATIONS.en.about = {
        eyebrow: "service overview",
        title: "Renovation and engineering works for residential and commercial properties",
        items: [
            {
                title: "Rough construction works",
                description:
                    "Demolition, leveling, screed, soundproofing, and full preparation of base surfaces."
            },
            {
                title: "Engineering systems",
                description:
                    "Installation of electrical, ventilation, water supply, and low-current systems according to standards."
            },
            {
                title: "Finishing works",
                description:
                    "High-quality painting, tiling, flooring, lighting setup, and decorative installation."
            },
            {
                title: "Project supervision",
                description:
                    "Weekly reports, contractor control, and continuous corrections throughout the project."
            }
        ]
    };
    DEFAULT_TRANSLATIONS.en.objects = {
        eyebrow: "project gallery",
        title: "Real projects completed by the RandsEngineering team",
        items: [
            {
                image: DEFAULT_LANGUAGE_CONTENT.objects.items[0].image,
                alt: "Living room after renovation",
                title: "92 m² apartment",
                description:
                    "Complete renovation with engineering upgrade and smart lighting system."
            },
            {
                image: DEFAULT_LANGUAGE_CONTENT.objects.items[1].image,
                alt: "Modern kitchen after renovation",
                title: "Kitchen studio",
                description:
                    "Layout redesign, new communications, and minimalist finishing."
            },
            {
                image: DEFAULT_LANGUAGE_CONTENT.objects.items[2].image,
                alt: "Office space after renovation",
                title: "IT company office",
                description:
                    "Open-space zoning, acoustics, lighting, and final finishing works."
            }
        ]
    };
    DEFAULT_TRANSLATIONS.en.examples = {
        eyebrow: "project examples",
        title: "What exactly we improve on each object",
        items: [
            {
                image: DEFAULT_LANGUAGE_CONTENT.examples.items[0].image,
                alt: "Bedroom after renovation",
                images: [
                    {
                        url: DEFAULT_LANGUAGE_CONTENT.examples.items[0].images[0].url,
                        alt: "Bedroom after renovation"
                    },
                    {
                        url: DEFAULT_LANGUAGE_CONTENT.examples.items[0].images[1].url,
                        alt: "Interior details after renovation"
                    }
                ],
                title: "Major apartment renovation",
                description:
                    "Full replacement of engineering systems, geometry correction, and finishing according to design project.",
                stats: [
                    { label: "Timeline", value: "56 days" },
                    { label: "Area", value: "118 m²" },
                    { label: "Team", value: "9 specialists" }
                ]
            },
            {
                image: DEFAULT_LANGUAGE_CONTENT.examples.items[1].image,
                alt: "Modern commercial interior",
                images: [
                    {
                        url: DEFAULT_LANGUAGE_CONTENT.examples.items[1].images[0].url,
                        alt: "Modern commercial interior"
                    },
                    {
                        url: DEFAULT_LANGUAGE_CONTENT.examples.items[1].images[1].url,
                        alt: "Commercial workspace after reconstruction"
                    }
                ],
                title: "Commercial space reconstruction",
                description:
                    "Preparation to brand standards: electrical, ventilation, lighting, finishing, and furniture installation.",
                stats: [
                    { label: "Timeline", value: "41 days" },
                    { label: "Area", value: "240 m²" },
                    { label: "Result", value: "Delivered without remarks" }
                ]
            }
        ]
    };
    DEFAULT_TRANSLATIONS.en.workers = {
        eyebrow: "our team",
        title: "Specialists who work on your projects",
        items: [
            {
                name: "Timofey R.",
                bio: "Project manager. Controls timeline, budget, and quality at every stage.",
                photo: DEFAULT_LANGUAGE_CONTENT.workers.items[0].photo
            },
            {
                name: "Alexander M.",
                bio: "Electrical engineer. Responsible for power systems, safety, and automation.",
                photo: DEFAULT_LANGUAGE_CONTENT.workers.items[1].photo
            },
            {
                name: "Ilya K.",
                bio: "Finishing specialist. Focused on clean execution and detail quality.",
                photo: DEFAULT_LANGUAGE_CONTENT.workers.items[2].photo
            }
        ]
    };
    DEFAULT_TRANSLATIONS.en.reviews = {
        eyebrow: "client reviews",
        title: "What clients say after project completion",
        items: [
            {
                name: "Marina K.",
                meta: "Apartment, 84 m²",
                text: "The team was very disciplined. Every stage was clear, and the renovation was delivered exactly on schedule.",
                photo: ""
            },
            {
                name: "Alexey R.",
                meta: "Office, 190 m²",
                text: "Excellent engineering planning. The office is now quieter and much more comfortable to work in.",
                photo: ""
            }
        ]
    };
    DEFAULT_TRANSLATIONS.en.contact = {
        eyebrow: "contact",
        title: "Send your request and we will contact you within 30 minutes",
        description:
            "Tell us about your task, area, and object type. We will prepare a preliminary estimate and suggest the best work format.",
        phoneText: "+7 (999) 000-00-00",
        emailText: "hello@randsengineering.com",
        requestEmail: "timofejrivkin@gmail.com",
        objectTypes: ["Apartment", "House", "Office", "Commercial property"],
        submitLabel: "Send request",
        modalTitle: "Send a project request",
        modalDescription:
            "Fill in the form and an RandsEngineering manager will contact you within 30 minutes.",
        successMessage:
            "Your request has been sent. A manager will contact you shortly."
    };
    DEFAULT_TRANSLATIONS.en.sectionLabels = {
        objects: "Projects",
        examples: "Work examples",
        workers: "Team",
        reviews: "Reviews",
        contact: "Contact"
    };
    DEFAULT_TRANSLATIONS.en.footer = {
        copyrightText: "© 2026 RandsEngineering. Renovation and engineering solutions.",
        socialLinks: [
            { label: "Telegram", url: "" },
            { label: "Instagram", url: "" },
            { label: "YouTube", url: "" },
            { label: "VK", url: "" }
        ]
    };

    DEFAULT_TRANSLATIONS.he.about = {
        eyebrow: "תיאור השירותים",
        title: "עבודות שיפוץ ותשתיות הנדסיות לדירות ולנכסים מסחריים",
        items: [
            {
                title: "עבודות תשתית",
                description:
                    "פירוק, יישור, יציקת מצע, בידוד אקוסטי והכנת כל המשטחים הבסיסיים."
            },
            {
                title: "מערכות הנדסיות",
                description:
                    "התקנת חשמל, אוורור, מים ומערכות מתח נמוך בהתאם לתקנים."
            },
            {
                title: "עבודות גמר",
                description:
                    "צביעה איכותית, ריצוף, חיפויים, התקנת תאורה ואלמנטים דקורטיביים."
            },
            {
                title: "פיקוח פרויקט",
                description:
                    "דוחות שבועיים, בקרה על קבלנים והתאמות שוטפות במהלך הביצוע."
            }
        ]
    };
    DEFAULT_TRANSLATIONS.he.objects = {
        eyebrow: "פרויקטים שבוצעו",
        title: "פרויקטים אמיתיים שבוצעו על ידי צוות RandsEngineering",
        items: [
            {
                image: DEFAULT_LANGUAGE_CONTENT.objects.items[0].image,
                alt: "סלון לאחר שיפוץ",
                title: "דירה 92 מ\"ר",
                description:
                    "שיפוץ מלא עם שדרוג תשתיות ומערכת תאורה חכמה."
            },
            {
                image: DEFAULT_LANGUAGE_CONTENT.objects.items[1].image,
                alt: "מטבח מודרני לאחר שיפוץ",
                title: "מטבח סטודיו",
                description:
                    "שינוי תכנון, תקשורות חדשות וגמר מינימליסטי."
            },
            {
                image: DEFAULT_LANGUAGE_CONTENT.objects.items[2].image,
                alt: "חלל משרד לאחר שיפוץ",
                title: "משרד חברת IT",
                description:
                    "חלוקת אופן-ספייס, אקוסטיקה, תאורה ועבודות גמר מלאות."
            }
        ]
    };
    DEFAULT_TRANSLATIONS.he.examples = {
        eyebrow: "דוגמאות עבודה",
        title: "מה בדיוק אנחנו משפרים בכל פרויקט",
        items: [
            {
                image: DEFAULT_LANGUAGE_CONTENT.examples.items[0].image,
                alt: "חדר שינה לאחר שיפוץ",
                images: [
                    {
                        url: DEFAULT_LANGUAGE_CONTENT.examples.items[0].images[0].url,
                        alt: "חדר שינה לאחר שיפוץ"
                    },
                    {
                        url: DEFAULT_LANGUAGE_CONTENT.examples.items[0].images[1].url,
                        alt: "פרטי עיצוב לאחר השיפוץ"
                    }
                ],
                title: "שיפוץ יסודי של דירה",
                description:
                    "החלפה מלאה של מערכות הנדסיות, יישור גיאומטריה וגמר לפי תכנית עיצוב.",
                stats: [
                    { label: "משך", value: "56 ימים" },
                    { label: "שטח", value: "118 מ\"ר" },
                    { label: "צוות", value: "9 מומחים" }
                ]
            },
            {
                image: DEFAULT_LANGUAGE_CONTENT.examples.items[1].image,
                alt: "חלל מסחרי מודרני",
                images: [
                    {
                        url: DEFAULT_LANGUAGE_CONTENT.examples.items[1].images[0].url,
                        alt: "חלל מסחרי מודרני"
                    },
                    {
                        url: DEFAULT_LANGUAGE_CONTENT.examples.items[1].images[1].url,
                        alt: "עמדות עבודה לאחר השדרוג"
                    }
                ],
                title: "שדרוג נכס מסחרי",
                description:
                    "הכנת הנכס לסטנדרט מותג: חשמל, אוורור, תאורה, גמר והתקנת ריהוט.",
                stats: [
                    { label: "משך", value: "41 ימים" },
                    { label: "שטח", value: "240 מ\"ר" },
                    { label: "תוצאה", value: "מסירה ללא הערות" }
                ]
            }
        ]
    };
    DEFAULT_TRANSLATIONS.he.workers = {
        eyebrow: "הצוות שלנו",
        title: "אנשי המקצוע שעובדים על הפרויקט שלכם",
        items: [
            {
                name: "טימופיי ר.",
                bio: "מנהל פרויקטים. אחראי על לוחות זמנים, תקציב ובקרת איכות.",
                photo: DEFAULT_LANGUAGE_CONTENT.workers.items[0].photo
            },
            {
                name: "אלכסנדר מ.",
                bio: "מהנדס חשמל. אחראי על מערכות חשמל, בטיחות ואוטומציה.",
                photo: DEFAULT_LANGUAGE_CONTENT.workers.items[1].photo
            },
            {
                name: "איליה ק.",
                bio: "מומחה עבודות גמר. מתמקד בביצוע נקי וברמת גימור גבוהה.",
                photo: DEFAULT_LANGUAGE_CONTENT.workers.items[2].photo
            }
        ]
    };
    DEFAULT_TRANSLATIONS.he.reviews = {
        eyebrow: "חוות דעת לקוחות",
        title: "מה הלקוחות אומרים לאחר סיום הפרויקט",
        items: [
            {
                name: "מרינה ק.",
                meta: "דירה, 84 מ\"ר",
                text: "הצוות היה מקצועי ומסודר מאוד. כל שלב היה ברור והשיפוץ נמסר בדיוק בזמן.",
                photo: ""
            },
            {
                name: "אלכסיי ר.",
                meta: "משרד, 190 מ\"ר",
                text: "התכנון ההנדסי היה מצוין. המשרד הפך לשקט ונוח יותר לעבודה.",
                photo: ""
            }
        ]
    };
    DEFAULT_TRANSLATIONS.he.contact = {
        eyebrow: "יצירת קשר",
        title: "השאירו פנייה ונחזור אליכם תוך 30 דקות",
        description:
            "ספרו לנו על המשימה, השטח וסוג הנכס. נכין הערכה ראשונית ונציע פורמט עבודה מתאים.",
        phoneText: "+7 (999) 000-00-00",
        emailText: "hello@randsengineering.com",
        requestEmail: "timofejrivkin@gmail.com",
        objectTypes: ["דירה", "בית", "משרד", "נכס מסחרי"],
        submitLabel: "שליחת פנייה",
        modalTitle: "השאירו פנייה לפרויקט",
        modalDescription:
            "מלאו את הטופס ומנהל מ-RandsEngineering יחזור אליכם תוך 30 דקות.",
        successMessage: "הפנייה נשלחה. נחזור אליכם בהקדם."
    };
    DEFAULT_TRANSLATIONS.he.sectionLabels = {
        objects: "פרויקטים",
        examples: "דוגמאות עבודה",
        workers: "צוות",
        reviews: "חוות דעת",
        contact: "יצירת קשר"
    };
    DEFAULT_TRANSLATIONS.he.footer = {
        copyrightText: "© 2026 RandsEngineering. שיפוץ ופתרונות הנדסיים.",
        socialLinks: [
            { label: "Telegram", url: "" },
            { label: "Instagram", url: "" },
            { label: "YouTube", url: "" },
            { label: "VK", url: "" }
        ]
    };

    const DEFAULT_CONTENT = {
        activeLanguage: DEFAULT_LANGUAGE,
        translations: DEFAULT_TRANSLATIONS
    };

    const SECTION_LABEL_KEYS = [
        "objects",
        "examples",
        "workers",
        "reviews",
        "contact"
    ];

    const LEGACY_SECTION_KEYS = [
        "about",
        "objects",
        "examples",
        "workers",
        "reviews",
        "contact",
        "sectionLabels",
        "footer"
    ];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function isPlainObject(value) {
        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
        );
    }

    function mergeWithDefaults(defaultValue, value) {
        if (Array.isArray(defaultValue)) {
            if (!Array.isArray(value)) {
                return clone(defaultValue);
            }

            if (defaultValue.length === 0) {
                return value;
            }

            const itemTemplate = defaultValue[0];
            if (isPlainObject(itemTemplate)) {
                return value.map((entry) =>
                    mergeWithDefaults(itemTemplate, isPlainObject(entry) ? entry : {})
                );
            }

            return value;
        }

        if (isPlainObject(defaultValue)) {
            const result = {};
            const sourceValue = isPlainObject(value) ? value : {};
            Object.keys(defaultValue).forEach((key) => {
                result[key] = mergeWithDefaults(defaultValue[key], sourceValue[key]);
            });
            return result;
        }

        if (typeof value === "undefined" || value === null) {
            return defaultValue;
        }

        return value;
    }

    function readStoredJson(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function saveJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    let memoryCsrfToken = "";

    function getStoredCsrfToken() {
        try {
            const token = sessionStorage.getItem(ADMIN_CSRF_KEY);
            if (typeof token === "string" && token.trim()) {
                memoryCsrfToken = token.trim();
                return memoryCsrfToken;
            }
        } catch {
            // Ignore sessionStorage errors and fallback to in-memory token.
        }
        return memoryCsrfToken;
    }

    function setStoredCsrfToken(token) {
        const normalized = String(token || "")
            .trim()
            .slice(0, 256);
        memoryCsrfToken = normalized;
        try {
            if (normalized) {
                sessionStorage.setItem(ADMIN_CSRF_KEY, normalized);
            } else {
                sessionStorage.removeItem(ADMIN_CSRF_KEY);
            }
        } catch {
            // Ignore sessionStorage errors and keep in-memory value.
        }
    }

    function requestApi(method, path, payload, options = {}) {
        const allowStatuses = Array.isArray(options.allowStatuses)
            ? options.allowStatuses
            : [];

        try {
            const xhr = new XMLHttpRequest();
            xhr.open(method, `${API_BASE}${path}`, false);
            xhr.setRequestHeader("Accept", "application/json");
            if (payload) {
                xhr.setRequestHeader("Content-Type", "application/json");
            }
            const unsafeMethod = !["GET", "HEAD", "OPTIONS"].includes(
                String(method || "").toUpperCase()
            );
            if (unsafeMethod) {
                const csrfToken = getStoredCsrfToken();
                if (csrfToken) {
                    xhr.setRequestHeader("X-CSRF-Token", csrfToken);
                }
            }
            xhr.withCredentials = true;
            xhr.send(payload ? JSON.stringify(payload) : null);

            const status = xhr.status;
            const ok =
                (status >= 200 && status < 300) || allowStatuses.includes(status);
            let data = null;

            if (xhr.responseText) {
                try {
                    data = JSON.parse(xhr.responseText);
                } catch {
                    data = null;
                }
            }

            return { ok, status, data };
        } catch {
            return { ok: false, status: 0, data: null };
        }
    }

    function sanitizeLogin(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    function isValidRole(roleId) {
        return ACCESS_LEVELS.some((item) => item.id === roleId);
    }

    function roleLabel(roleId) {
        const found = ACCESS_LEVELS.find((item) => item.id === roleId);
        return found ? found.label : roleId;
    }

    function normalizeAdminUser(user) {
        const login = sanitizeLogin(user?.login);
        if (!login) {
            return null;
        }

        const hasPassword = typeof user?.password === "string";
        const password = hasPassword ? String(user.password || "").trim() : "";
        const strongPassword =
            password.length >= 10 &&
            /[a-z]/.test(password) &&
            /[A-Z]/.test(password) &&
            /\d/.test(password);
        if (hasPassword && !strongPassword) {
            return null;
        }

        const role = isValidRole(user?.role) ? user.role : "editor";
        const isProtected = Boolean(user?.protected);

        const normalized = {
            login,
            role,
            protected: isProtected
        };
        if (hasPassword) {
            normalized.password = password;
        }
        return normalized;
    }

    function normalizeAdminUsers(users) {
        const safeArray = Array.isArray(users) ? users : [];
        const result = [];
        const used = new Set();

        safeArray.forEach((user) => {
            const normalized = normalizeAdminUser(user);
            if (!normalized || used.has(normalized.login)) {
                return;
            }
            used.add(normalized.login);
            result.push(normalized);
        });

        const ownerIndex = result.findIndex(
            (item) => item.login === DEFAULT_OWNER_LOGIN
        );

        if (ownerIndex === -1) {
            result.unshift(clone(DEFAULT_ADMIN_USERS[0]));
        } else {
            result[ownerIndex] = {
                ...result[ownerIndex],
                login: DEFAULT_OWNER_LOGIN,
                password: DEFAULT_OWNER_PASSWORD,
                protected: true,
                role: "owner"
            };
        }

        return result;
    }

    function getAdminUsers() {
        const response = requestApi("GET", "/admin/users", null, {
            allowStatuses: [401, 403]
        });
        if (response.ok && Array.isArray(response.data?.users)) {
            const users = response.data.users
                .map((item) => ({
                    login: sanitizeLogin(item?.login),
                    role: isValidRole(item?.role) ? item.role : "editor",
                    protected: Boolean(item?.protected)
                }))
                .filter((item) => item.login);
            saveJson(ADMIN_USERS_KEY, users);
            return users;
        }

        const stored = readStoredJson(ADMIN_USERS_KEY);
        return Array.isArray(stored) ? stored : [];
    }

    function saveAdminUsers(users) {
        const normalized = normalizeAdminUsers(users);
        const response = requestApi("PUT", "/admin/users", {
            users: normalized
        });
        if (response.ok && Array.isArray(response.data?.users)) {
            saveJson(ADMIN_USERS_KEY, response.data.users);
            return response.data.users;
        }
        throw new Error(response.data?.error || "Не удалось сохранить администраторов.");
    }

    function authenticateAdmin(login, password) {
        const normalizedLogin = sanitizeLogin(login);
        const response = requestApi("POST", "/admin/login", {
            login: normalizedLogin,
            password: String(password || "")
        }, {
            allowStatuses: [401]
        });

        if (response.ok && response.data?.user) {
            setStoredCsrfToken(response.data?.csrfToken || "");
            return response.data.user;
        }
        if (response.status === 401) {
            setStoredCsrfToken("");
            return null;
        }
        if (response.status === 0) {
            throw new Error(
                "Нет соединения с сервером. Запустите сайт через node server.js и откройте admin.html по адресу http://localhost:PORT/admin.html."
            );
        }
        throw new Error(response.data?.error || "Ошибка авторизации на сервере.");
    }

    function getCurrentAdmin() {
        const response = requestApi("GET", "/admin/me", null, {
            allowStatuses: [401]
        });
        if (response.ok && response.data?.user) {
            setStoredCsrfToken(response.data?.csrfToken || getStoredCsrfToken());
            return response.data.user;
        }
        setStoredCsrfToken("");
        return null;
    }

    function logoutAdmin() {
        requestApi("POST", "/admin/logout");
        setStoredCsrfToken("");
    }

    function getRole(roleId) {
        return ACCESS_LEVELS.find((item) => item.id === roleId) || ACCESS_LEVELS[0];
    }

    function hasPermission(roleId, permission) {
        const role = getRole(roleId);
        return role.permissions.includes(permission);
    }

    function isValidLanguageId(languageId) {
        return LANGUAGE_IDS.includes(languageId);
    }

    function normalizeReviewLanguage(languageId) {
        return isValidLanguageId(languageId) ? languageId : DEFAULT_LANGUAGE;
    }

    function normalizeReviewRecord(review, fallbackLanguage = DEFAULT_LANGUAGE) {
        const source = isPlainObject(review) ? review : {};
        const language = normalizeReviewLanguage(source.language || fallbackLanguage);
        const name = String(source.name || "")
            .trim()
            .slice(0, 80);
        const text = String(source.text || "")
            .trim()
            .slice(0, 2000);
        const meta = String(source.meta || "")
            .trim()
            .slice(0, 140);
        const photo = String(source.photo || "").trim();
        const id = String(source.id || "").trim();
        const createdAt = String(source.createdAt || "").trim();

        return {
            id,
            language,
            name,
            text,
            meta,
            photo,
            createdAt
        };
    }

    function normalizeExampleGalleryEntries(value, fallbackImage = "", fallbackAlt = "") {
        const gallery = Array.isArray(value)
            ? value
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

        if (!gallery.length) {
            const legacyUrl = String(fallbackImage || "")
                .trim()
                .slice(0, 1024);
            const legacyAlt = String(fallbackAlt || "")
                .trim()
                .slice(0, 180);
            if (legacyUrl || legacyAlt) {
                gallery.push({
                    url: legacyUrl,
                    alt: legacyAlt
                });
            }
        }

        return gallery.slice(0, 20);
    }

    function normalizeExampleItem(item) {
        const source = isPlainObject(item) ? item : {};
        const legacyImage = String(source.image || "")
            .trim()
            .slice(0, 1024);
        const legacyAlt = String(source.alt || "")
            .trim()
            .slice(0, 180);
        const images = normalizeExampleGalleryEntries(
            source.images,
            legacyImage,
            legacyAlt
        );
        const firstImage = images[0] || { url: legacyImage, alt: legacyAlt };
        const sourceStats = Array.isArray(source.stats) ? source.stats : [];
        const stats = [0, 1, 2].map((index) => ({
            label: String(sourceStats[index]?.label || "")
                .trim()
                .slice(0, 60),
            value: String(sourceStats[index]?.value || "")
                .trim()
                .slice(0, 80)
        }));

        return {
            image: firstImage.url || "",
            alt: firstImage.alt || "",
            images,
            title: String(source.title || "")
                .trim()
                .slice(0, 160),
            description: String(source.description || "")
                .trim()
                .slice(0, 2400),
            stats
        };
    }

    function normalizeExamplesSection(section) {
        const source = isPlainObject(section) ? section : {};
        const items = Array.isArray(source.items) ? source.items : [];

        return {
            eyebrow: String(source.eyebrow || "")
                .trim()
                .slice(0, 120),
            title: String(source.title || "")
                .trim()
                .slice(0, 240),
            items: items
                .map((item) => normalizeExampleItem(item))
                .filter(
                    (item) =>
                        item.title ||
                        item.description ||
                        item.image ||
                        item.images.some((image) => image.url)
                )
                .slice(0, 60)
        };
    }

    function normalizeWorkersSection(section) {
        const source = isPlainObject(section) ? section : {};
        const items = Array.isArray(source.items) ? source.items : [];

        return {
            eyebrow: String(source.eyebrow || "")
                .trim()
                .slice(0, 120),
            title: String(source.title || "")
                .trim()
                .slice(0, 240),
            items: items
                .map((item) => ({
                    name: String(item?.name || "")
                        .trim()
                        .slice(0, 120),
                    bio: String(item?.bio || "")
                        .trim()
                        .slice(0, 1200),
                    photo: String(item?.photo || "")
                        .trim()
                        .slice(0, 900000)
                }))
                .filter((item) => item.name || item.bio || item.photo)
                .slice(0, 80)
        };
    }

    function normalizeSectionLabels(value, fallbackValue) {
        const source = isPlainObject(value) ? value : {};
        const fallback = isPlainObject(fallbackValue) ? fallbackValue : {};
        const result = {};

        SECTION_LABEL_KEYS.forEach((key) => {
            result[key] = String(source[key] || fallback[key] || "")
                .trim()
                .slice(0, 80);
        });

        return result;
    }

    function normalizeFooterSocialLinks(value) {
        if (!Array.isArray(value)) {
            return [];
        }

        return value
            .map((entry) => ({
                label: String(entry?.label || "")
                    .trim()
                    .slice(0, 80),
                url: String(entry?.url || "")
                    .trim()
                    .slice(0, 1024)
            }))
            .filter((entry) => entry.label || entry.url)
            .slice(0, 20);
    }

    function legacyFooterSocialLinks(footer) {
        const source = isPlainObject(footer) ? footer : {};
        return normalizeFooterSocialLinks([
            {
                label: source.telegramLabel || "Telegram",
                url: source.telegramUrl || ""
            },
            {
                label: source.instagramLabel || "Instagram",
                url: source.instagramUrl || ""
            },
            {
                label: source.youtubeLabel || "YouTube",
                url: source.youtubeUrl || ""
            },
            {
                label: source.vkLabel || "VK",
                url: source.vkUrl || ""
            }
        ]);
    }

    function normalizeFooterSection(mergedFooter, sourceFooter) {
        const footer = isPlainObject(mergedFooter) ? mergedFooter : {};
        const source = isPlainObject(sourceFooter) ? sourceFooter : {};

        const hasSourceArray = Array.isArray(source.socialLinks);
        const sourceLinks = hasSourceArray
            ? normalizeFooterSocialLinks(source.socialLinks)
            : [];
        const mergedLinks = normalizeFooterSocialLinks(footer.socialLinks);
        const legacyLinks = legacyFooterSocialLinks(source);
        const socialLinks = hasSourceArray
            ? sourceLinks
            : legacyLinks.length
            ? legacyLinks
            : mergedLinks;

        return {
            copyrightText: String(footer.copyrightText || "")
                .trim()
                .slice(0, 240),
            socialLinks
        };
    }

    function migrateLegacyContent(content) {
        if (!isPlainObject(content)) {
            return content;
        }

        if (isPlainObject(content.translations)) {
            return content;
        }

        const hasLegacySections = LEGACY_SECTION_KEYS.some(
            (key) => typeof content[key] !== "undefined"
        );
        if (!hasLegacySections) {
            return content;
        }

        const migrated = {
            activeLanguage: DEFAULT_LANGUAGE,
            translations: clone(DEFAULT_TRANSLATIONS)
        };
        migrated.translations.ru = mergeWithDefaults(
            DEFAULT_TRANSLATIONS.ru,
            content
        );

        return migrated;
    }

    function getContent() {
        const response = requestApi("GET", "/content");
        if (response.ok && response.data?.content) {
            const normalized = normalizeContent(response.data.content);
            saveJson(CONTENT_STORAGE_KEY, normalized);
            return normalized;
        }

        return normalizeContent(readStoredJson(CONTENT_STORAGE_KEY));
    }

    function normalizeContent(content) {
        const migrated = migrateLegacyContent(content);
        const normalized = mergeWithDefaults(DEFAULT_CONTENT, migrated);
        if (!isValidLanguageId(normalized.activeLanguage)) {
            normalized.activeLanguage = DEFAULT_LANGUAGE;
        }

        LANGUAGE_IDS.forEach((languageId) => {
            const mergedTranslation =
                normalized?.translations?.[languageId] || {};
            const sourceTranslation =
                migrated?.translations?.[languageId] || {};

            mergedTranslation.examples = normalizeExamplesSection(
                mergedTranslation.examples
            );
            mergedTranslation.workers = normalizeWorkersSection(
                mergedTranslation.workers
            );
            mergedTranslation.sectionLabels = normalizeSectionLabels(
                mergedTranslation.sectionLabels,
                DEFAULT_TRANSLATIONS?.[languageId]?.sectionLabels
            );
            mergedTranslation.footer = normalizeFooterSection(
                mergedTranslation.footer,
                sourceTranslation.footer
            );
            normalized.translations[languageId] = mergedTranslation;
        });

        return normalized;
    }

    function saveContent(content) {
        const normalized = normalizeContent(content);
        const response = requestApi("PUT", "/content", { content: normalized });
        if (!response.ok) {
            throw new Error(response.data?.error || "Не удалось сохранить контент.");
        }
        saveJson(CONTENT_STORAGE_KEY, normalized);
    }

    function resetContent() {
        const response = requestApi("POST", "/content/reset");
        if (!response.ok) {
            throw new Error(response.data?.error || "Не удалось сбросить контент.");
        }
        localStorage.removeItem(CONTENT_STORAGE_KEY);
    }

    function getApprovedReviews(languageId) {
        const normalizedLanguage = normalizeReviewLanguage(languageId);
        const response = requestApi(
            "GET",
            `/reviews?language=${encodeURIComponent(normalizedLanguage)}`
        );
        if (response.ok && Array.isArray(response.data?.reviews)) {
            return response.data.reviews
                .map((item) => normalizeReviewRecord(item, normalizedLanguage))
                .filter((item) => item.name && item.text);
        }
        return [];
    }

    function submitPublicReview(review) {
        const normalized = normalizeReviewRecord(
            review,
            normalizeReviewLanguage(review?.language)
        );
        if (normalized.name.length < 2 || normalized.text.length < 4) {
            throw new Error("Имя и текст отзыва обязательны.");
        }

        const response = requestApi(
            "POST",
            "/reviews/submit",
            {
                review: {
                    language: normalized.language,
                    name: normalized.name,
                    text: normalized.text,
                    meta: normalized.meta,
                    photo: normalized.photo
                }
            },
            {
                allowStatuses: [400, 403, 413, 429]
            }
        );

        if (!response.ok) {
            throw new Error(
                response.data?.error || "Не удалось отправить отзыв на модерацию."
            );
        }
        return true;
    }

    function getPendingReviews() {
        const response = requestApi("GET", "/admin/reviews/pending", null, {
            allowStatuses: [401, 403]
        });
        if (response.ok && Array.isArray(response.data?.reviews)) {
            return response.data.reviews
                .map((item) => normalizeReviewRecord(item))
                .filter((item) => item.id && item.name && item.text);
        }
        return [];
    }

    function approvePendingReview(reviewId) {
        const id = String(reviewId || "").trim();
        if (!id) {
            throw new Error("Не передан ID отзыва.");
        }

        const response = requestApi(
            "POST",
            `/admin/reviews/${encodeURIComponent(id)}/approve`,
            {},
            {
                allowStatuses: [400, 401, 403, 404, 429]
            }
        );
        if (!response.ok) {
            throw new Error(response.data?.error || "Не удалось одобрить отзыв.");
        }
        return true;
    }

    function rejectPendingReview(reviewId) {
        const id = String(reviewId || "").trim();
        if (!id) {
            throw new Error("Не передан ID отзыва.");
        }

        const response = requestApi(
            "POST",
            `/admin/reviews/${encodeURIComponent(id)}/reject`,
            {},
            {
                allowStatuses: [400, 401, 403, 404, 429]
            }
        );
        if (!response.ok) {
            throw new Error(response.data?.error || "Не удалось отклонить отзыв.");
        }
        return true;
    }

    function deleteApprovedReview(reviewId) {
        const id = String(reviewId || "").trim();
        if (!id) {
            throw new Error("Не передан ID отзыва.");
        }

        const response = requestApi(
            "POST",
            `/admin/reviews/${encodeURIComponent(id)}/delete`,
            {},
            {
                allowStatuses: [400, 401, 403, 404, 429]
            }
        );
        if (!response.ok) {
            throw new Error(response.data?.error || "Не удалось удалить отзыв.");
        }
        return true;
    }

    function clearSubmittedReviews() {
        const response = requestApi("POST", "/admin/reviews/clear", {}, {
            allowStatuses: [401, 403, 429]
        });
        if (!response.ok) {
            throw new Error(
                response.data?.error || "Не удалось очистить пользовательские отзывы."
            );
        }
        return true;
    }

    function getDefaultContent() {
        return clone(DEFAULT_CONTENT);
    }

    window.RandsContentStore = {
        CONTENT_STORAGE_KEY,
        USER_REVIEW_STORAGE_KEY,
        ADMIN_USERS_KEY,
        ACCESS_LEVELS,
        LANGUAGE_IDS,
        DEFAULT_LANGUAGE,
        DEFAULT_OWNER_LOGIN,
        DEFAULT_OWNER_PASSWORD,
        roleLabel,
        getRole,
        hasPermission,
        getAdminUsers,
        saveAdminUsers,
        authenticateAdmin,
        getCurrentAdmin,
        logoutAdmin,
        getContent,
        saveContent,
        resetContent,
        getApprovedReviews,
        submitPublicReview,
        getPendingReviews,
        approvePendingReview,
        rejectPendingReview,
        deleteApprovedReview,
        clearSubmittedReviews,
        getDefaultContent,
        normalizeContent
    };
})();
