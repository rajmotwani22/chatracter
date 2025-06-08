// api/test.js - Simple test function
module.exports = async function handler(req, res) {
  console.log('Test function called!');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  return res.status(200).json({ 
    message: 'Test function works!',
    method: req.method,
    hasApiKey: hasApiKey,
    timestamp: new Date().toISOString()
  });
};