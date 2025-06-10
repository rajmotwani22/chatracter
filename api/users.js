
const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  console.log('Users API called:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ip_address INET,
        user_agent TEXT
      );
    `;
    console.log('Table created/checked successfully');

    if (req.method === 'POST') {
      // Add new user
      const { name } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Get user's IP and user agent for basic tracking
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      console.log('Attempting to add user:', name, 'IP:', ip);

      // Check if user with same name and IP already exists (to avoid duplicates)
      const existingUser = await sql`
        SELECT id FROM users 
        WHERE name = ${name.trim()} AND ip_address = ${ip}
        AND created_at > NOW() - INTERVAL '24 hours'
      `;

      if (existingUser.rows.length === 0) {
        // Insert new user
        const result = await sql`
          INSERT INTO users (name, ip_address, user_agent)
          VALUES (${name.trim()}, ${ip}, ${userAgent})
          RETURNING id, name, created_at;
        `;
        
        console.log('User added successfully:', result.rows[0]);
        
        return res.status(201).json({ 
          success: true, 
          user: result.rows[0],
          message: 'User registered successfully' 
        });
      } else {
        console.log('User already exists');
        return res.status(200).json({ 
          success: true, 
          message: 'User already registered recently' 
        });
      }
      
    } else if (req.method === 'GET') {
      // Get all users (for your analytics)
      const { limit = 100, offset = 0 } = req.query;
      
      const users = await sql`
        SELECT id, name, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const totalCount = await sql`SELECT COUNT(*) FROM users`;
      
      return res.status(200).json({
        users: users.rows,
        total: parseInt(totalCount.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database operation failed',
      details: error.message 
    });
  }
};
