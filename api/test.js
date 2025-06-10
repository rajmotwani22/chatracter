
export default function handler(req, res) {
  console.log('Test API called');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return res.status(200).json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      nodeVersion: process.version,
      method: req.method
    }
  });
}
