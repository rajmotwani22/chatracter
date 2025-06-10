
export default async function handler(req, res) {
  console.log('=== USERS API CALLED ===');
  console.log('Method:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if we have database connection
  if (!process.env.POSTGRES_URL) {
    console.log('No database configured, returning mock data');
    
    if (req.method === 'POST') {
      return res.status(201).json({ 
        success: true, 
        message: 'User registered (mock mode - database not configured)',
        user: { id: 1, name: req.body?.name || 'Test User', created_at: new Date() }
      });
    }
    
    return res.status(200).json({
      users: [],
      total: 0,
      limit: 100,
      offset: 0,
      note: 'Database not configured - showing mock data'
    });
  }

  try {
    // Import postgres only if we have connection
    const { sql } = await import('@vercel/postgres');
    
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT
      );
    `;

    if (req.method === 'POST') {
      const { name } = req.body || {};
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Get user's IP and user agent
      const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Check for duplicates (simplified)
      const existingUser = await sql`
        SELECT id FROM users 
        WHERE name = ${name.trim()} AND ip_address = ${ip}
        AND created_at > NOW() - INTERVAL '1 day'
      `;

      if (existingUser.rows.length === 0) {
        const result = await sql`
          INSERT INTO users (name, ip_address, user_agent)
          VALUES (${name.trim()}, ${ip}, ${userAgent})
          RETURNING id, name, created_at;
        `;
        
        return res.status(201).json({ 
          success: true, 
          user: result.rows[0],
          message: 'User registered successfully' 
        });
      } else {
        return res.status(200).json({ 
          success: true, 
          message: 'User already registered recently' 
        });
      }
      
    } else if (req.method === 'GET') {
      const users = await sql`
        SELECT id, name, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 100
      `;
      
      const totalCount = await sql`SELECT COUNT(*) as count FROM users`;
      
      return res.status(200).json({
        users: users.rows,
        total: parseInt(totalCount.rows[0].count),
        limit: 100,
        offset: 0
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database operation failed',
      details: error.message,
      stack: error.stack
    });
  }
}
