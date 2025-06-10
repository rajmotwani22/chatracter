// 3. Create a new file: api/stats.js
// This will provide simple analytics

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
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

  try {
    // Get basic stats
    const totalUsers = await sql`SELECT COUNT(*) as total FROM users`;
    
    const todayUsers = await sql`
      SELECT COUNT(*) as today 
      FROM users 
      WHERE DATE(created_at) = CURRENT_DATE
    `;
    
    const thisWeekUsers = await sql`
      SELECT COUNT(*) as week 
      FROM users 
      WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
    `;
    
    const recentUsers = await sql`
      SELECT name, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `;

    return res.status(200).json({
      total: parseInt(totalUsers.rows[0].total),
      today: parseInt(todayUsers.rows[0].today),
      thisWeek: parseInt(thisWeekUsers.rows[0].week),
      recentUsers: recentUsers.rows
    });

  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ 
      error: 'Failed to get stats',
      details: error.message 
    });
  }
}