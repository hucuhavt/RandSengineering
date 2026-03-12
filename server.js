const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "0.0.0.0";

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const ADMINS_FILE = path.join(DATA_DIR, "admin-users.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews-moderation.json");
const DATA_KEY_FILE = path.join(DATA_DIR, ".data-encryption.key");

const SESSION_COOKIE = "rands_sid";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const PASSWORD_ITERATIONS = 210000;
const LOGIN_LOCK_WINDOW_MS = 1000 * 60 * 15;
const LOGIN_LOCK_DURATION_MS = 1000 * 60 * 20;
const LOGIN_LOCK_MAX_FAILURES = 8;
const FORMSUBMIT_TARGET_EMAIL = String(
    process.env.FORMSUBMIT_TARGET_EMAIL || "timofejrivkin@gmail.com"
)
    .trim()
    .toLowerCase();
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(
    FORMSUBMIT_TARGET_EMAIL
)}`;
const ENCRYPTION_ALGO = "aes-256-gcm";
const ENCRYPTION_VERSION = 1;

const DEFAULT_OWNER_LOGIN = process.env.ADMIN_DEFAULT_LOGIN || "tim123";
const DEFAULT_OWNER_PASSWORD =
    process.env.ADMIN_DEFAULT_PASSWORD || "Butterfly8462";

const ACCESS_LEVELS = [
    {
        id: "owner",
        permissions: ["content:edit", "content:advanced", "admins:manage"]
    },
    {
        id: "manager",
        permissions: ["content:edit", "content:advanced"]
    },
    {
        id: "editor",
        permissions: ["content:edit"]
    },
    {
        id: "viewer",
        permissions: []
    }
];

const ROLE_IDS = new Set(ACCESS_LEVELS.map((item) => item.id));
const SUPPORTED_LANGUAGES = ["ru", "en", "he"];
const sessions = new Map();
const rateLimitStore = new Map();
const loginAttemptStore = new Map();
const PUBLIC_STATIC_EXTENSIONS = new Set([
    ".html",
    ".css",
    ".js",
    ".ico",
    ".png",
    ".jpg",
    ".jpeg",
    ".svg",
    ".webp",
    ".txt"
]);
let dataEncryptionKey = null;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".txt": "text/plain; charset=utf-8"
};

function hasPermission(roleId, permission) {
    const role = ACCESS_LEVELS.find((item) => item.id === roleId);
    return Boolean(role && role.permissions.includes(permission));
}

function createDefaultReviewsState() {
    return {
        pending: [],
        approved: {
            ru: [],
            en: [],
            he: []
        }
    };
}

function now() {
    return Date.now();
}

function timingSafeEqualString(left, right) {
    const a = Buffer.from(String(left || ""), "utf8");
    const b = Buffer.from(String(right || ""), "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function normalizeKeyMaterial(rawValue) {
    const raw = String(rawValue || "").trim();
    if (!raw) {
        return null;
    }

    if (/^[a-f0-9]{64}$/i.test(raw)) {
        return Buffer.from(raw, "hex");
    }

    try {
        const base64Buffer = Buffer.from(raw, "base64");
        if (base64Buffer.length === 32) {
            return base64Buffer;
        }
    } catch {
        // Ignore base64 parsing issues and fallback to sha256 below.
    }

    return crypto.createHash("sha256").update(raw, "utf8").digest();
}

function encryptJsonValue(value) {
    if (!dataEncryptionKey) {
        return JSON.stringify(value, null, 2);
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGO, dataEncryptionKey, iv);
    const payload = Buffer.from(JSON.stringify(value), "utf8");
    const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
    const tag = cipher.getAuthTag();

    return JSON.stringify(
        {
            __encrypted: true,
            version: ENCRYPTION_VERSION,
            alg: ENCRYPTION_ALGO,
            iv: iv.toString("base64"),
            tag: tag.toString("base64"),
            data: encrypted.toString("base64")
        },
        null,
        2
    );
}

function decryptJsonEnvelope(envelope) {
    if (!dataEncryptionKey) {
        throw new Error("DATA_KEY_MISSING");
    }

    const iv = Buffer.from(String(envelope.iv || ""), "base64");
    const tag = Buffer.from(String(envelope.tag || ""), "base64");
    const encrypted = Buffer.from(String(envelope.data || ""), "base64");

    if (iv.length !== 12 || tag.length !== 16 || encrypted.length < 1) {
        throw new Error("INVALID_ENCRYPTED_DATA");
    }

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGO, dataEncryptionKey, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8"));
}

function isEncryptedEnvelope(value) {
    return Boolean(
        value &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            value.__encrypted === true &&
            value.alg === ENCRYPTION_ALGO &&
            Number(value.version) === ENCRYPTION_VERSION
    );
}

async function loadOrCreateDataEncryptionKey() {
    const envKey = normalizeKeyMaterial(process.env.DATA_ENCRYPTION_KEY || "");
    if (envKey) {
        dataEncryptionKey = envKey;
        return;
    }

    try {
        const storedKey = await fs.readFile(DATA_KEY_FILE, "utf8");
        const normalized = normalizeKeyMaterial(storedKey);
        if (normalized) {
            dataEncryptionKey = normalized;
            return;
        }
    } catch {
        // Generate a key if file does not exist yet.
    }

    const generatedKeyHex = crypto.randomBytes(32).toString("hex");
    await fs.writeFile(DATA_KEY_FILE, `${generatedKeyHex}\n`, {
        encoding: "utf8",
        mode: 0o600
    });
    dataEncryptionKey = normalizeKeyMaterial(generatedKeyHex);
}

function hashPassword(password, salt, iterations = PASSWORD_ITERATIONS) {
    const hashed = crypto.pbkdf2Sync(
        password,
        salt,
        iterations,
        32,
        "sha256"
    );
    return hashed.toString("hex");
}

function makePasswordRecord(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const iterations = PASSWORD_ITERATIONS;
    const passwordHash = hashPassword(password, salt, iterations);
    return { salt, iterations, passwordHash };
}

function verifyPassword(password, user) {
    if (
        !user ||
        typeof user.passwordHash !== "string" ||
        typeof user.salt !== "string" ||
        !Number.isFinite(Number(user.iterations))
    ) {
        return false;
    }
    const computed = hashPassword(password, user.salt, user.iterations);
    return timingSafeEqualString(computed, user.passwordHash);
}

async function ensureDataFiles() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await loadOrCreateDataEncryptionKey();

    const content = await readJsonFile(CONTENT_FILE, null);
    if (!content || typeof content !== "object") {
        await writeJsonFile(CONTENT_FILE, {
            activeLanguage: "ru",
            translations: {}
        });
    } else {
        await writeJsonFile(CONTENT_FILE, content);
    }

    const admins = await readJsonFile(ADMINS_FILE, null);
    if (!Array.isArray(admins) || admins.length === 0) {
        if (!isStrongAdminPassword(DEFAULT_OWNER_PASSWORD)) {
            throw new Error(
                "ADMIN_DEFAULT_PASSWORD должен быть не менее 10 символов и содержать верхний/нижний регистр и цифры."
            );
        }
        const record = makePasswordRecord(DEFAULT_OWNER_PASSWORD);
        const defaultAdmins = [
            {
                login: DEFAULT_OWNER_LOGIN,
                role: "owner",
                protected: true,
                ...record
            }
        ];
        await writeJsonFile(ADMINS_FILE, defaultAdmins);
    } else {
        await writeJsonFile(ADMINS_FILE, admins);
    }

    const reviews = await readJsonFile(REVIEWS_FILE, null);
    if (!reviews || typeof reviews !== "object") {
        await writeJsonFile(REVIEWS_FILE, createDefaultReviewsState());
    } else {
        await writeJsonFile(REVIEWS_FILE, reviews);
    }
}

async function readJsonFile(filePath, fallback) {
    let raw = "";
    try {
        raw = await fs.readFile(filePath, "utf8");
    } catch (error) {
        if (error && error.code === "ENOENT") {
            return fallback;
        }
        throw error;
    }

    let parsed = null;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error(`Не удалось разобрать JSON в ${path.basename(filePath)}.`);
    }

    if (!isEncryptedEnvelope(parsed)) {
        return parsed;
    }

    try {
        return decryptJsonEnvelope(parsed);
    } catch {
        throw new Error(
            `Не удалось расшифровать ${path.basename(filePath)}. Проверьте DATA_ENCRYPTION_KEY.`
        );
    }
}

async function writeJsonFile(filePath, value) {
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, encryptJsonValue(value), "utf8");
    await fs.rename(tempPath, filePath);
}

function parseCookies(req) {
    const raw = req.headers.cookie || "";
    return raw
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .reduce((acc, entry) => {
            const index = entry.indexOf("=");
            if (index === -1) {
                return acc;
            }
            const key = entry.slice(0, index).trim();
            const value = decodeURIComponent(entry.slice(index + 1).trim());
            acc[key] = value;
            return acc;
        }, {});
}

function clientIp(req) {
    const xff = req.headers["x-forwarded-for"];
    if (typeof xff === "string" && xff) {
        return xff.split(",")[0].trim();
    }
    return req.socket.remoteAddress || "unknown";
}

function consumeRateLimit(key, maxRequests, windowMs) {
    const currentTime = now();
    const bucket = rateLimitStore.get(key);
    if (!bucket || bucket.resetAt <= currentTime) {
        rateLimitStore.set(key, { count: 1, resetAt: currentTime + windowMs });
        return true;
    }

    if (bucket.count >= maxRequests) {
        return false;
    }

    bucket.count += 1;
    return true;
}

function cleanupRateLimiter() {
    const currentTime = now();
    for (const [key, bucket] of rateLimitStore.entries()) {
        if (!bucket || bucket.resetAt <= currentTime) {
            rateLimitStore.delete(key);
        }
    }
}

function getLoginAttemptBucket(login, ip) {
    const key = `${String(login || "").toLowerCase()}|${ip}`;
    const currentTime = now();
    const existing = loginAttemptStore.get(key);
    if (!existing || existing.resetAt <= currentTime) {
        const next = {
            failures: 0,
            resetAt: currentTime + LOGIN_LOCK_WINDOW_MS,
            lockedUntil: 0
        };
        loginAttemptStore.set(key, next);
        return next;
    }
    return existing;
}

function clearLoginAttempts(login, ip) {
    const key = `${String(login || "").toLowerCase()}|${ip}`;
    loginAttemptStore.delete(key);
}

function registerLoginFailure(login, ip) {
    const bucket = getLoginAttemptBucket(login, ip);
    bucket.failures += 1;
    if (bucket.failures >= LOGIN_LOCK_MAX_FAILURES) {
        bucket.lockedUntil = now() + LOGIN_LOCK_DURATION_MS;
        bucket.resetAt = Math.max(bucket.resetAt, bucket.lockedUntil);
    }
}

function isLoginTemporarilyBlocked(login, ip) {
    const key = `${String(login || "").toLowerCase()}|${ip}`;
    const bucket = loginAttemptStore.get(key);
    if (!bucket) {
        return false;
    }
    if (bucket.resetAt <= now()) {
        loginAttemptStore.delete(key);
        return false;
    }
    return Number(bucket.lockedUntil || 0) > now();
}

function cleanupLoginAttempts() {
    const currentTime = now();
    for (const [key, bucket] of loginAttemptStore.entries()) {
        if (!bucket || bucket.resetAt <= currentTime) {
            loginAttemptStore.delete(key);
        }
    }
}

function requestUserAgent(req) {
    return String(req.headers["user-agent"] || "").slice(0, 512);
}

function requestUserAgentHash(req) {
    return crypto
        .createHash("sha256")
        .update(requestUserAgent(req), "utf8")
        .digest("hex");
}

function isStrongAdminPassword(password) {
    const value = String(password || "");
    if (value.length < 10 || value.length > 256) {
        return false;
    }
    if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) {
        return false;
    }
    return true;
}

function csrfTokenFromRequest(req) {
    return String(req.headers["x-csrf-token"] || "")
        .trim()
        .slice(0, 256);
}

function validateCsrf(req, session) {
    const provided = csrfTokenFromRequest(req);
    const expected = String(session?.csrfToken || "");
    return provided && expected && timingSafeEqualString(provided, expected);
}

function setSecurityHeaders(req, res) {
    const secure =
        req.headers["x-forwarded-proto"] === "https" || req.socket.encrypted;

    const csp = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://formsubmit.co",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self' https://formsubmit.co",
        "object-src 'none'",
        "manifest-src 'self'"
    ].join("; ");

    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    );
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    res.setHeader("Content-Security-Policy", csp);
    if (secure) {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
}

function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(payload));
}

async function parseJsonBody(req, maxBytes = 1024 * 1024) {
    let body = "";
    let bodyBytes = 0;
    for await (const chunk of req) {
        body += chunk;
        bodyBytes += Buffer.byteLength(chunk);
        if (bodyBytes > maxBytes) {
            throw new Error("BODY_TOO_LARGE");
        }
    }

    if (!body.trim()) {
        return {};
    }

    try {
        return JSON.parse(body);
    } catch {
        throw new Error("INVALID_JSON");
    }
}

function isSameOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) {
        return true;
    }
    const host = req.headers.host || "";
    const proto =
        req.headers["x-forwarded-proto"] === "https" || req.socket.encrypted
            ? "https"
            : "http";
    return origin === `${proto}://${host}`;
}

function sanitizeUserForClient(user) {
    return {
        login: user.login,
        role: user.role,
        protected: Boolean(user.protected)
    };
}

function generateSession(req, user) {
    const token = crypto.randomBytes(32).toString("hex");
    const csrfToken = crypto.randomBytes(24).toString("hex");
    sessions.set(token, {
        login: user.login,
        role: user.role,
        csrfToken,
        userAgentHash: requestUserAgentHash(req),
        expiresAt: now() + SESSION_TTL_MS
    });
    return { token, csrfToken };
}

function getSessionFromRequest(req) {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE];
    if (!token) {
        return null;
    }
    const session = sessions.get(token);
    if (!session) {
        return null;
    }
    if (session.expiresAt <= now()) {
        sessions.delete(token);
        return null;
    }
    const expectedAgentHash = requestUserAgentHash(req);
    if (!timingSafeEqualString(session.userAgentHash || "", expectedAgentHash)) {
        sessions.delete(token);
        return null;
    }
    return { token, ...session };
}

function clearSessionCookie(res) {
    res.setHeader(
        "Set-Cookie",
        `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0`
    );
}

function setSessionCookie(req, res, token) {
    const secure =
        req.headers["x-forwarded-proto"] === "https" || req.socket.encrypted;
    const parts = [
        `${SESSION_COOKIE}=${token}`,
        "HttpOnly",
        "Path=/",
        "SameSite=Strict",
        `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
    ];
    if (secure) {
        parts.push("Secure");
    }
    res.setHeader("Set-Cookie", parts.join("; "));
}

async function requireAuth(req, res) {
    const session = getSessionFromRequest(req);
    if (!session) {
        sendJson(res, 401, { error: "Требуется авторизация." });
        return null;
    }

    const users = await readJsonFile(ADMINS_FILE, []);
    const user = users.find((item) => item.login === session.login);
    if (!user) {
        sessions.delete(session.token);
        clearSessionCookie(res);
        sendJson(res, 401, { error: "Сессия недействительна." });
        return null;
    }

    sessions.set(session.token, {
        login: session.login,
        role: session.role,
        csrfToken: session.csrfToken,
        userAgentHash: session.userAgentHash,
        expiresAt: now() + SESSION_TTL_MS
    });

    return { session, user, users };
}

function requireCsrfForStateChange(req, res, session) {
    const unsafeMethod = !["GET", "HEAD", "OPTIONS"].includes(
        String(req.method || "").toUpperCase()
    );
    if (!unsafeMethod) {
        return true;
    }
    if (validateCsrf(req, session)) {
        return true;
    }
    sendJson(res, 403, { error: "CSRF-проверка не пройдена." });
    return false;
}

function validateLogin(value) {
    return /^[a-z0-9._-]{3,32}$/.test(value);
}

function sanitizeLanguage(languageId) {
    const normalized = String(languageId || "")
        .trim()
        .toLowerCase();
    return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : "ru";
}

function sanitizeContactField(value, maxLength = 300) {
    return String(value || "")
        .trim()
        .slice(0, maxLength);
}

function sanitizeReviewImage(photo) {
    const normalized = String(photo || "").trim();
    if (!normalized) {
        return "";
    }

    if (normalized.length > 900000) {
        throw new Error("Фото отзыва слишком большое.");
    }

    if (
        normalized.startsWith("data:image/") ||
        normalized.startsWith("https://") ||
        normalized.startsWith("http://")
    ) {
        return normalized;
    }

    throw new Error("Некорректный формат изображения отзыва.");
}

function randomReviewId() {
    return crypto.randomBytes(12).toString("hex");
}

function normalizeReviewObject(rawReview, fallbackLanguage = "ru") {
    if (!rawReview || typeof rawReview !== "object") {
        return null;
    }

    const name = String(rawReview.name || "")
        .trim()
        .slice(0, 80);
    const text = String(rawReview.text || "")
        .trim()
        .slice(0, 2000);

    if (name.length < 2 || text.length < 4) {
        return null;
    }

    const language = sanitizeLanguage(rawReview.language || fallbackLanguage);
    const meta = String(rawReview.meta || "")
        .trim()
        .slice(0, 140);
    const createdAtRaw = String(rawReview.createdAt || "").trim();
    const createdAt = Number.isNaN(new Date(createdAtRaw).getTime())
        ? new Date().toISOString()
        : new Date(createdAtRaw).toISOString();
    const id =
        typeof rawReview.id === "string" && /^[a-f0-9]{12,64}$/.test(rawReview.id)
            ? rawReview.id
            : randomReviewId();

    let photo = "";
    try {
        photo = sanitizeReviewImage(rawReview.photo);
    } catch {
        photo = "";
    }

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

function normalizeReviewsState(rawState) {
    const base = createDefaultReviewsState();
    const source =
        rawState && typeof rawState === "object" && !Array.isArray(rawState)
            ? rawState
            : {};

    const pending = Array.isArray(source.pending)
        ? source.pending
              .map((item) => normalizeReviewObject(item))
              .filter(Boolean)
              .slice(0, 1000)
        : [];

    const approved = {};
    SUPPORTED_LANGUAGES.forEach((languageId) => {
        const sourceApproved = Array.isArray(source?.approved?.[languageId])
            ? source.approved[languageId]
            : [];
        approved[languageId] = sourceApproved
            .map((item) => normalizeReviewObject(item, languageId))
            .filter(Boolean)
            .slice(0, 1000)
            .map((item) => ({ ...item, language: languageId }));
    });

    return {
        pending,
        approved
    };
}

async function readReviewsState() {
    const raw = await readJsonFile(REVIEWS_FILE, createDefaultReviewsState());
    return normalizeReviewsState(raw);
}

function sanitizeReviewForClient(review) {
    return {
        id: review.id,
        language: sanitizeLanguage(review.language),
        name: String(review.name || ""),
        text: String(review.text || ""),
        meta: String(review.meta || ""),
        photo: String(review.photo || ""),
        createdAt: String(review.createdAt || new Date().toISOString())
    };
}

function ensureOwnerUser(users) {
    const ownerIndex = users.findIndex((item) => item.login === DEFAULT_OWNER_LOGIN);
    if (ownerIndex !== -1) {
        users[ownerIndex].role = "owner";
        users[ownerIndex].protected = true;
        return;
    }

    if (!isStrongAdminPassword(DEFAULT_OWNER_PASSWORD)) {
        throw new Error(
            "ADMIN_DEFAULT_PASSWORD должен быть не менее 10 символов и содержать верхний/нижний регистр и цифры."
        );
    }
    const record = makePasswordRecord(DEFAULT_OWNER_PASSWORD);
    users.unshift({
        login: DEFAULT_OWNER_LOGIN,
        role: "owner",
        protected: true,
        ...record
    });
}

function normalizeUsersForSave(inputUsers, currentUsers) {
    const source = Array.isArray(inputUsers) ? inputUsers : [];
    const existingByLogin = new Map(
        (Array.isArray(currentUsers) ? currentUsers : []).map((item) => [
            item.login,
            item
        ])
    );
    const result = [];
    const used = new Set();

    for (const rawUser of source) {
        const login = String(rawUser?.login || "")
            .trim()
            .toLowerCase();
        if (!validateLogin(login) || used.has(login)) {
            continue;
        }
        used.add(login);

        const existing = existingByLogin.get(login) || null;
        const protectedUser = Boolean(existing?.protected || rawUser?.protected);
        const role = login === DEFAULT_OWNER_LOGIN
            ? "owner"
            : ROLE_IDS.has(rawUser?.role)
            ? rawUser.role
            : existing?.role || "editor";

        let passwordHash = existing?.passwordHash || "";
        let salt = existing?.salt || "";
        let iterations = Number(existing?.iterations || PASSWORD_ITERATIONS);
        const nextPassword = String(rawUser?.password || "").trim();

        if (protectedUser && existing) {
            // Keep protected user credentials unchanged.
        } else if (nextPassword) {
            if (!isStrongAdminPassword(nextPassword)) {
                throw new Error(
                    `Пароль для ${login} должен быть не менее 10 символов и содержать буквы в верхнем/нижнем регистре и цифры.`
                );
            }
            const record = makePasswordRecord(nextPassword);
            passwordHash = record.passwordHash;
            salt = record.salt;
            iterations = record.iterations;
        } else if (!existing) {
            throw new Error(
                `Для нового администратора ${login} нужен сильный пароль: минимум 10 символов, верхний/нижний регистр и цифры.`
            );
        }

        result.push({
            login,
            role,
            protected: login === DEFAULT_OWNER_LOGIN ? true : protectedUser,
            passwordHash,
            salt,
            iterations
        });
    }

    ensureOwnerUser(result);
    return result;
}

async function handleApi(req, res, urlObj) {
    const ip = clientIp(req);
    const rateKeyBase = `${ip}:${req.method}:${urlObj.pathname}`;

    if (!consumeRateLimit(`global:${ip}`, 600, 1000 * 60 * 5)) {
        sendJson(res, 429, { error: "Слишком много запросов. Попробуйте позже." });
        return;
    }

    if (urlObj.pathname === "/api/health" && req.method === "GET") {
        sendJson(res, 200, { ok: true, time: new Date().toISOString() });
        return;
    }

    if (urlObj.pathname === "/api/reviews" && req.method === "GET") {
        const language = sanitizeLanguage(urlObj.searchParams.get("language"));
        const reviewsState = await readReviewsState();
        const reviews = Array.isArray(reviewsState.approved?.[language])
            ? reviewsState.approved[language]
            : [];
        sendJson(res, 200, {
            language,
            reviews: reviews.map((item) => sanitizeReviewForClient(item))
        });
        return;
    }

    if (urlObj.pathname === "/api/reviews/submit" && req.method === "POST") {
        if (!isSameOrigin(req)) {
            sendJson(res, 403, { error: "Недопустимый origin." });
            return;
        }
        if (!consumeRateLimit(`reviews-submit:${ip}`, 30, 1000 * 60 * 15)) {
            sendJson(res, 429, { error: "Слишком много отзывов. Попробуйте позже." });
            return;
        }

        const payload = await parseJsonBody(req).catch((error) => {
            if (error.message === "BODY_TOO_LARGE") {
                sendJson(res, 413, { error: "Тело запроса слишком большое." });
            } else {
                sendJson(res, 400, { error: "Некорректный JSON." });
            }
            return null;
        });
        if (!payload) {
            return;
        }

        const rawReview =
            payload.review && typeof payload.review === "object"
                ? payload.review
                : payload;
        const language = sanitizeLanguage(rawReview?.language);
        const name = String(rawReview?.name || "")
            .trim()
            .slice(0, 80);
        const text = String(rawReview?.text || "")
            .trim()
            .slice(0, 2000);
        const meta = String(rawReview?.meta || "")
            .trim()
            .slice(0, 140);

        if (name.length < 2 || text.length < 4) {
            sendJson(res, 400, {
                error: "Отзыв должен содержать имя и текст."
            });
            return;
        }

        let photo = "";
        try {
            photo = sanitizeReviewImage(rawReview?.photo);
        } catch (error) {
            sendJson(res, 400, {
                error: error.message || "Некорректное изображение отзыва."
            });
            return;
        }

        const submittedReview = normalizeReviewObject(
            {
                id: randomReviewId(),
                language,
                name,
                text,
                meta,
                photo,
                createdAt: new Date().toISOString()
            },
            language
        );

        if (!submittedReview) {
            sendJson(res, 400, { error: "Некорректные данные отзыва." });
            return;
        }

        const reviewsState = await readReviewsState();
        reviewsState.pending.unshift(submittedReview);
        reviewsState.pending = reviewsState.pending.slice(0, 1000);
        await writeJsonFile(REVIEWS_FILE, reviewsState);
        sendJson(res, 200, { ok: true });
        return;
    }

    if (urlObj.pathname === "/api/contact/submit" && req.method === "POST") {
        if (!isSameOrigin(req)) {
            sendJson(res, 403, { error: "Недопустимый origin." });
            return;
        }
        if (!consumeRateLimit(`contact-submit:${ip}`, 40, 1000 * 60 * 15)) {
            sendJson(res, 429, { error: "Слишком много заявок. Попробуйте позже." });
            return;
        }

        const payload = await parseJsonBody(req).catch((error) => {
            if (error.message === "BODY_TOO_LARGE") {
                sendJson(res, 413, { error: "Тело запроса слишком большое." });
            } else {
                sendJson(res, 400, { error: "Некорректный JSON." });
            }
            return null;
        });
        if (!payload) {
            return;
        }

        const normalizedLanguage = sanitizeLanguage(payload.language);
        const formSubmitPayload = {
            _subject: sanitizeContactField(
                payload._subject || "Новая заявка с сайта RandsEngineering",
                180
            ),
            _template: "table",
            _captcha: "false",
            language: normalizedLanguage,
            name: sanitizeContactField(payload.name, 120),
            phone: sanitizeContactField(payload.phone, 80),
            objectType: sanitizeContactField(payload.objectType, 120),
            startDate: sanitizeContactField(payload.startDate, 80),
            comment: sanitizeContactField(payload.comment, 2000),
            message: sanitizeContactField(payload.message, 5000)
        };

        if (!formSubmitPayload.name || !formSubmitPayload.phone) {
            sendJson(res, 400, { error: "Имя и телефон обязательны." });
            return;
        }

        try {
            const response = await fetch(FORMSUBMIT_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify(formSubmitPayload)
            });

            if (!response.ok) {
                sendJson(res, 502, {
                    error: `FormSubmit недоступен (HTTP ${response.status}).`
                });
                return;
            }

            const responseData = await response.json().catch(() => ({}));
            const success =
                responseData?.success === true || responseData?.success === "true";
            if (!success) {
                sendJson(res, 502, { error: "FormSubmit отклонил заявку." });
                return;
            }

            sendJson(res, 200, { ok: true });
        } catch {
            sendJson(res, 502, {
                error: "Не удалось связаться с сервисом отправки заявок."
            });
        }
        return;
    }

    if (urlObj.pathname === "/api/content" && req.method === "GET") {
        const content = await readJsonFile(CONTENT_FILE, {
            activeLanguage: "ru",
            translations: {}
        });
        sendJson(res, 200, { content });
        return;
    }

    if (urlObj.pathname === "/api/content" && req.method === "PUT") {
        if (!isSameOrigin(req)) {
            sendJson(res, 403, { error: "Недопустимый origin." });
            return;
        }
        if (!consumeRateLimit(`write:${rateKeyBase}`, 120, 1000 * 60 * 5)) {
            sendJson(res, 429, { error: "Слишком много операций записи." });
            return;
        }

        const auth = await requireAuth(req, res);
        if (!auth) {
            return;
        }
        if (!requireCsrfForStateChange(req, res, auth.session)) {
            return;
        }
        if (!hasPermission(auth.user.role, "content:edit")) {
            sendJson(res, 403, { error: "Недостаточно прав." });
            return;
        }

        const payload = await parseJsonBody(req).catch((error) => {
            if (error.message === "BODY_TOO_LARGE") {
                sendJson(res, 413, { error: "Тело запроса слишком большое." });
            } else {
                sendJson(res, 400, { error: "Некорректный JSON." });
            }
            return null;
        });
        if (!payload) {
            return;
        }

        if (typeof payload.content !== "object" || payload.content === null) {
            sendJson(res, 400, { error: "Поле content обязательно." });
            return;
        }

        await writeJsonFile(CONTENT_FILE, payload.content);
        sendJson(res, 200, { content: payload.content });
        return;
    }

    if (urlObj.pathname === "/api/content/reset" && req.method === "POST") {
        if (!isSameOrigin(req)) {
            sendJson(res, 403, { error: "Недопустимый origin." });
            return;
        }
        const auth = await requireAuth(req, res);
        if (!auth) {
            return;
        }
        if (!requireCsrfForStateChange(req, res, auth.session)) {
            return;
        }
        if (!hasPermission(auth.user.role, "content:advanced")) {
            sendJson(res, 403, { error: "Недостаточно прав." });
            return;
        }

        const nextContent = { activeLanguage: "ru", translations: {} };
        await writeJsonFile(CONTENT_FILE, nextContent);
        sendJson(res, 200, { content: nextContent });
        return;
    }

    if (urlObj.pathname === "/api/admin/login" && req.method === "POST") {
        if (!isSameOrigin(req)) {
            sendJson(res, 403, { error: "Недопустимый origin." });
            return;
        }
        if (!consumeRateLimit(`login:${ip}`, 12, 1000 * 60 * 15)) {
            sendJson(res, 429, { error: "Слишком много попыток входа. Попробуйте позже." });
            return;
        }

        const payload = await parseJsonBody(req).catch((error) => {
            if (error.message === "BODY_TOO_LARGE") {
                sendJson(res, 413, { error: "Тело запроса слишком большое." });
            } else {
                sendJson(res, 400, { error: "Некорректный JSON." });
            }
            return null;
        });
        if (!payload) {
            return;
        }

        const login = String(payload.login || "")
            .trim()
            .toLowerCase();
        const password = String(payload.password || "");
        if (isLoginTemporarilyBlocked(login, ip)) {
            sendJson(res, 429, {
                error: "Слишком много неудачных попыток входа. Повторите позже."
            });
            return;
        }
        if (!validateLogin(login) || password.length < 1) {
            registerLoginFailure(login, ip);
            sendJson(res, 401, { error: "Неверный логин или пароль." });
            return;
        }

        const users = await readJsonFile(ADMINS_FILE, []);
        const user = users.find((item) => item.login === login);
        if (!user || !verifyPassword(password, user)) {
            registerLoginFailure(login, ip);
            sendJson(res, 401, { error: "Неверный логин или пароль." });
            return;
        }

        clearLoginAttempts(login, ip);
        const sessionData = generateSession(req, user);
        setSessionCookie(req, res, sessionData.token);
        sendJson(res, 200, {
            user: sanitizeUserForClient(user),
            csrfToken: sessionData.csrfToken
        });
        return;
    }

    if (urlObj.pathname === "/api/admin/logout" && req.method === "POST") {
        if (!isSameOrigin(req)) {
            sendJson(res, 403, { error: "Недопустимый origin." });
            return;
        }
        const session = getSessionFromRequest(req);
        if (session && !validateCsrf(req, session)) {
            sendJson(res, 403, { error: "CSRF-проверка не пройдена." });
            return;
        }
        const cookies = parseCookies(req);
        const token = cookies[SESSION_COOKIE];
        if (token) {
            sessions.delete(token);
        }
        clearSessionCookie(res);
        sendJson(res, 200, { ok: true });
        return;
    }

    if (urlObj.pathname === "/api/admin/me" && req.method === "GET") {
        const auth = await requireAuth(req, res);
        if (!auth) {
            return;
        }
        sendJson(res, 200, {
            user: sanitizeUserForClient(auth.user),
            csrfToken: auth.session.csrfToken
        });
        return;
    }

    if (urlObj.pathname === "/api/admin/users" && req.method === "GET") {
        const auth = await requireAuth(req, res);
        if (!auth) {
            return;
        }
        sendJson(res, 200, {
            users: auth.users.map((user) => sanitizeUserForClient(user))
        });
        return;
    }

    if (urlObj.pathname === "/api/admin/users" && req.method === "PUT") {
        if (!isSameOrigin(req)) {
            sendJson(res, 403, { error: "Недопустимый origin." });
            return;
        }
        if (!consumeRateLimit(`write:${rateKeyBase}`, 60, 1000 * 60 * 5)) {
            sendJson(res, 429, { error: "Слишком много операций записи." });
            return;
        }

        const auth = await requireAuth(req, res);
        if (!auth) {
            return;
        }
        if (!requireCsrfForStateChange(req, res, auth.session)) {
            return;
        }
        if (!hasPermission(auth.user.role, "admins:manage")) {
            sendJson(res, 403, { error: "Недостаточно прав." });
            return;
        }

        const payload = await parseJsonBody(req).catch((error) => {
            if (error.message === "BODY_TOO_LARGE") {
                sendJson(res, 413, { error: "Тело запроса слишком большое." });
            } else {
                sendJson(res, 400, { error: "Некорректный JSON." });
            }
            return null;
        });
        if (!payload) {
            return;
        }

        try {
            const normalized = normalizeUsersForSave(payload.users, auth.users);
            await writeJsonFile(ADMINS_FILE, normalized);
            sendJson(res, 200, {
                users: normalized.map((user) => sanitizeUserForClient(user))
            });
        } catch (error) {
            sendJson(res, 400, { error: error.message || "Ошибка в данных." });
        }
        return;
    }

    if (urlObj.pathname === "/api/admin/reviews/pending" && req.method === "GET") {
        const auth = await requireAuth(req, res);
        if (!auth) {
            return;
        }
        if (!hasPermission(auth.user.role, "content:edit")) {
            sendJson(res, 403, { error: "Недостаточно прав." });
            return;
        }

        const reviewsState = await readReviewsState();
        sendJson(res, 200, {
            reviews: reviewsState.pending.map((item) => sanitizeReviewForClient(item))
        });
        return;
    }

    if (urlObj.pathname === "/api/admin/reviews/clear" && req.method === "POST") {
        if (!isSameOrigin(req)) {
            sendJson(res, 403, { error: "Недопустимый origin." });
            return;
        }

        const auth = await requireAuth(req, res);
        if (!auth) {
            return;
        }
        if (!requireCsrfForStateChange(req, res, auth.session)) {
            return;
        }
        if (!hasPermission(auth.user.role, "content:advanced")) {
            sendJson(res, 403, { error: "Недостаточно прав." });
            return;
        }

        await writeJsonFile(REVIEWS_FILE, createDefaultReviewsState());
        sendJson(res, 200, { ok: true });
        return;
    }

    const reviewActionMatch = urlObj.pathname.match(
        /^\/api\/admin\/reviews\/([a-f0-9]{12,64})\/(approve|reject|delete)$/
    );
    if (reviewActionMatch && req.method === "POST") {
        if (!isSameOrigin(req)) {
            sendJson(res, 403, { error: "Недопустимый origin." });
            return;
        }
        if (!consumeRateLimit(`write:${rateKeyBase}`, 80, 1000 * 60 * 5)) {
            sendJson(res, 429, { error: "Слишком много операций записи." });
            return;
        }

        const auth = await requireAuth(req, res);
        if (!auth) {
            return;
        }
        if (!requireCsrfForStateChange(req, res, auth.session)) {
            return;
        }
        if (!hasPermission(auth.user.role, "content:edit")) {
            sendJson(res, 403, { error: "Недостаточно прав." });
            return;
        }

        const reviewId = reviewActionMatch[1];
        const action = reviewActionMatch[2];
        const reviewsState = await readReviewsState();
        let review = null;

        if (action === "delete") {
            for (const languageId of SUPPORTED_LANGUAGES) {
                const list = Array.isArray(reviewsState.approved?.[languageId])
                    ? reviewsState.approved[languageId]
                    : [];
                const reviewIndex = list.findIndex((item) => item.id === reviewId);
                if (reviewIndex !== -1) {
                    [review] = list.splice(reviewIndex, 1);
                    break;
                }
            }

            if (!review) {
                sendJson(res, 404, { error: "Одобренный отзыв не найден." });
                return;
            }
        } else {
            const reviewIndex = reviewsState.pending.findIndex(
                (item) => item.id === reviewId
            );

            if (reviewIndex === -1) {
                sendJson(res, 404, { error: "Отзыв для модерации не найден." });
                return;
            }

            [review] = reviewsState.pending.splice(reviewIndex, 1);

            if (action === "approve") {
                const language = sanitizeLanguage(review.language);
                if (!Array.isArray(reviewsState.approved[language])) {
                    reviewsState.approved[language] = [];
                }
                reviewsState.approved[language].unshift({
                    ...review,
                    language
                });
                reviewsState.approved[language] = reviewsState.approved[language].slice(
                    0,
                    1000
                );
            }
        }

        await writeJsonFile(REVIEWS_FILE, reviewsState);
        sendJson(res, 200, {
            ok: true,
            action,
            review: sanitizeReviewForClient(review)
        });
        return;
    }

    sendJson(res, 404, { error: "Маршрут API не найден." });
}

function resolveStaticFilePath(urlPathname) {
    let cleanPath = "";
    try {
        cleanPath = decodeURIComponent(urlPathname.split("?")[0] || "/");
    } catch {
        return null;
    }
    const normalizedPath = cleanPath === "/" ? "/index.html" : cleanPath;
    const absolutePath = path.resolve(ROOT_DIR, `.${normalizedPath}`);
    if (
        absolutePath !== ROOT_DIR &&
        !absolutePath.startsWith(`${ROOT_DIR}${path.sep}`)
    ) {
        return null;
    }

    const relativePath = path.relative(ROOT_DIR, absolutePath).replace(/\\/g, "/");
    if (!relativePath || relativePath.startsWith("..")) {
        return null;
    }
    if (
        relativePath.startsWith("data/") ||
        relativePath === "data" ||
        relativePath.startsWith(".") ||
        relativePath.includes("/.") ||
        relativePath.includes(".tmp")
    ) {
        return null;
    }

    const fileName = path.basename(relativePath);
    if (
        fileName === "server.js" ||
        fileName === "package.json" ||
        fileName === "package-lock.json" ||
        fileName === ".env" ||
        fileName === "README.md" ||
        fileName === "DEPLOYMENT.md"
    ) {
        return null;
    }

    const ext = path.extname(relativePath).toLowerCase();
    if (!PUBLIC_STATIC_EXTENSIONS.has(ext)) {
        return null;
    }

    return absolutePath;
}

async function serveStatic(req, res, urlObj) {
    const filePath = resolveStaticFilePath(urlObj.pathname);
    if (!filePath) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
    }

    try {
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) {
            throw new Error("NOT_FILE");
        }

        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || "application/octet-stream";
        if (ext === ".html") {
            res.setHeader("Cache-Control", "no-store");
        } else {
            res.setHeader("Cache-Control", "public, max-age=120");
        }
        res.setHeader("Content-Type", mime);
        const content = await fs.readFile(filePath);
        res.statusCode = 200;
        res.end(content);
    } catch {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("Not found");
    }
}

function cleanupExpiredSessions() {
    const currentTime = now();
    for (const [token, session] of sessions.entries()) {
        if (session.expiresAt <= currentTime) {
            sessions.delete(token);
        }
    }
}

async function startServer() {
    await ensureDataFiles();

    setInterval(cleanupExpiredSessions, 1000 * 60 * 10).unref();
    setInterval(cleanupRateLimiter, 1000 * 60 * 5).unref();
    setInterval(cleanupLoginAttempts, 1000 * 60 * 5).unref();

    const server = http.createServer(async (req, res) => {
        try {
            setSecurityHeaders(req, res);

            const host = req.headers.host || "localhost";
            const urlObj = new URL(req.url, `http://${host}`);
            if (urlObj.pathname.startsWith("/api/")) {
                await handleApi(req, res, urlObj);
                return;
            }

            await serveStatic(req, res, urlObj);
        } catch (error) {
            if (!res.headersSent) {
                sendJson(res, 500, { error: "Внутренняя ошибка сервера." });
            } else {
                res.end();
            }
        }
    });
    server.requestTimeout = 15000;
    server.headersTimeout = 12000;
    server.keepAliveTimeout = 5000;
    server.maxHeadersCount = 100;

    server.listen(PORT, HOST, () => {
        // eslint-disable-next-line no-console
        console.log(`RandsEngineering server started on http://${HOST}:${PORT}`);
    });
}

startServer().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error);
    process.exit(1);
});
