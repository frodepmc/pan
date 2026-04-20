#!/usr/bin/env node
/**
 * Genera un hash bcrypt para usar en la env var ADMIN_USERS.
 *
 * Uso:
 *   node scripts/hash-password.js "tu-password"
 *
 * Output:
 *   Imprime el hash en stdout.
 *
 * Formato de ADMIN_USERS (env var JSON):
 *   [
 *     { "u": "admin@admin.es", "p": "<hash>", "role": "admin" }
 *   ]
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
    console.error('Usage: node scripts/hash-password.js "<password>"');
    process.exit(1);
}

const ROUNDS = 12;
const hash = bcrypt.hashSync(password, ROUNDS);
console.log(hash);
