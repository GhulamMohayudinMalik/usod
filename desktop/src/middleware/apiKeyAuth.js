import dotenv from 'dotenv';

dotenv.config();

export function apiKeyAuth(req, res, next) {
  const headerKey = req.header('x-api-key') || req.header('X-API-Key');
  const queryKey = req.query.api_key;
  const provided = headerKey || queryKey;
  const expected = process.env.INGEST_API_KEY;

  if (!expected) {
    return res.status(500).json({ message: 'Ingestion API key not configured' });
  }

  if (!provided || provided !== expected) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return next();
}


