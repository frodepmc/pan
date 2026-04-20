// GET /api/auth/verify
// Comprueba sesion activa.
// Ok   -> 200 { user: { username, role }, expiresAt }
// No   -> 401 { error: 'Unauthorized' }

const { readSessionFromRequest } = require('../_lib/auth');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const session = readSessionFromRequest(req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    return res.status(200).json({
        user: { username: session.sub, role: session.role },
        expiresAt: session.exp ? new Date(session.exp * 1000).toISOString() : null,
    });
};
