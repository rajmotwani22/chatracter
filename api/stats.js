
export default async function handler(req, res) {
  console.log('=== STATS API CALLED ===');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if we have database connection
  if (!process.env.POSTGRES_URL) {
    console.log('No database configured, returning mock stats');
    return res.status(200).json({
      total: 0,
      today: 0,
      thisWeek: 0,
      recentUsers: [],
      note: 'Database not configured - showing mock data'
    });
  }

  try {
    // Import postgres only if we have connection
    const { sql } = await import('@vercel/postgres');
    
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT
      );
    `;
    
    // Get stats with error handling for each query
    let totalUsers, todayUsers, thisWeekUsers, recentUsers;
    
    try {
      const total = await sql`SELECT COUNT(*) as count FROM users`;
      totalUsers = parseInt(total.rows[0].count) || 0;
    } catch (e) {
      console.error('Error getting total users:', e);
      totalUsers = 0;
    }
    
    try {
      const today = await sql`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE DATE(created_at) = CURRENT_DATE
      `;
      todayUsers = parseInt(today.rows[0].count) || 0;
    } catch (e) {
      console.error('Error getting today users:', e);
      todayUsers = 0;
    }
    
    try {
      const week = await sql`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
      `;
      thisWeekUsers = parseInt(week.rows[0].count) || 0;
    } catch (e) {
      console.error('Error getting week users:', e);
      thisWeekUsers = 0;
    }
    
    try {
      const recent = await sql`
        SELECT name, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 10
      `;
      recentUsers = recent.rows || [];
    } catch (e) {
      console.error('Error getting recent users:', e);
      recentUsers = [];
    }

    return res.status(200).json({
      total: totalUsers,
      today: todayUsers,
      thisWeek: thisWeekUsers,
      recentUsers: recentUsers
    });

  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ 
      error: 'Failed to get stats',
      details: error.message,
      stack: error.stack
    });
  }
}
