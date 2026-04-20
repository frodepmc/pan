// api/_lib/auth.js
// Helpers compartidos para autenticacion de admin.
// - Lee usuarios desde env var ADMIN_USERS (JSON: [{u, p, role}])
// - Firma/verifica JWT HS256 con JWT_SECRET
// - Gestiona cookies httpOnly

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const COOKIE_NAME = 'crux_admin_session';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getUsers() {
    const raw = process.env.ADMIN_USERS;
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(Boolean);
    } catch (err) {
        console.error('[auth] ADMIN_USERS parse error:', err.message);
        return [];
    }
}

function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 24) {
        throw new Error('JWT_SECRET must be set to a long random string (>= 24 chars).');
    }
    return secret;
}

async function verifyCredentials(username, password) {
    if (typeof username !== 'string' || typeof password !== 'string') return null;
    const users = getUsers();
    const user = users.find((u) => (u.u || '').toLowerCase() === username.toLowerCase());
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.p || '');
    if (!ok) return null;
    return {
        username: user.u,
        role: user.role || 'admin',
    };
}

function signSession(payload) {
    return jwt.sign(payload, getSecret(), {
        algorithm: 'HS256',
        expiresIn: TOKEN_TTL_SECONDS,
    });
}

function verifySession(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
    } catch (err) {
        return null;
    }
}

function parseCookies(header) {
    const out = {};
    if (!header) return out;
    header.split(';').forEach((chunk) => {
        const eq = chunk.indexOf('=');
        if (eq === -1) return;
        const k = chunk.slice(0, eq).trim();
        const v = chunk.slice(eq + 1).trim();
        if (k) out[k] = decodeURIComponent(v);
    });
    return out;
}

function buildSessionCookie(token, { clear = false } = {}) {
    const parts = [
        `${COOKIE_NAME}=${clear ? '' : token}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Secure',
    ];
    if (clear) {
        parts.push('Max-Age=0');
    } else {
        parts.push(`Max-Age=${TOKEN_TTL_SECONDS}`);
    }
    return parts.join('; ');
}

function readSessionFromRequest(req) {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[COOKIE_NAME];
    return verifySession(token);
}

function requireSession(req, res) {
    const session = readSessionFromRequest(req);
    if (!session) {
        res.status(401).json({ error: 'Unauthorized' });
        return null;
    }
    return session;
}

module.exports = {
    COOKIE_NAME,
    TOKEN_TTL_SECONDS,
    verifyCredentials,
    signSession,
    verifySession,
    buildSessionCookie,
    readSessionFromRequest,
    requireSession,
};
