export const validateQueryRequest = (req, res, next) => {
  const { query, dbConfig } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  if (!dbConfig) {
    return res.status(400).json({ error: 'Database configuration is required' });
  }

  const { type, url } = dbConfig;
  if (!type || !url) {
    return res.status(400).json({ error: 'Database type and URL are required' });
  }

  if (!['supabase', 'mongodb', 'mysql', 'postgres'].includes(type)) {
    return res.status(400).json({ error: 'Unsupported database type' });
  }

  next();
};
