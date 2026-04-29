const pool = require('../db/connection');

/**
 * Middleware factory that logs access to sensitive patient data.
 * Fire-and-forget: never blocks the request even if the insert fails.
 *
 * @param {string} resourceType  e.g. 'patients', 'appointments'
 * @param {string} action        e.g. 'view_list', 'view_detail'
 */
const logAccess = (resourceType, action) => (req, res, next) => {
  if (req.user) {
    const resourceId =
      req.params.id         ? parseInt(req.params.id) :
      req.params.patientId  ? parseInt(req.params.patientId) :
      null;
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';

    pool.query(
      'INSERT INTO access_logs (userId, userRole, action, resourceType, resourceId, ipAddress) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.role, action, resourceType, resourceId, ip]
    ).catch(err => console.error('[access-log] Error al registrar acceso:', err.message));
  }
  next();
};

module.exports = { logAccess };
