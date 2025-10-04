export default async function authMiddleware(req, res, next) {
  try {
    req.user = { id: 'mock-user-id', role: 'admin' };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}
