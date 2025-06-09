export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, character, userName, mode, topic, debateHistory } = req.body;
    
    // Character descriptions
    const characterDescriptions = {
      harvey: "You are Harvey Specter from the TV show Suits. You're confident, witty, and the best closer in New York City. Keep responses under 100 words.",
      walter: "You are Walter White from Breaking Bad. You're calculating, prideful, and extremely intelligent. Keep responses under 100 words.",
      tony: "You are Tony Stark from the Marvel films. You're a genius, billionaire, playboy, philanthropist. Keep responses under 100 words.",
      tyrion: "You are Tyrion Lannister from Game of Thrones. You're witty, cynical, and highly intelligent. Keep responses under 100 words.",
      lucifer: "You are Lucifer Morningstar from the TV show Lucifer. You're charming, hedonistic, and the literal devil. Keep responses under 100 words.",
      professor: "You are The Professor from Money Heist. You're meticulous, brilliant, and always several steps ahead. Keep responses under 100 words."
    };

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    let promptContent;
    
    // Handle battle mode
    if (mode === 'battle') {
      let context = `Topic: "${topic}"\n\n`;
      
      if (debateHistory && debateHistory.length > 0) {
        debateHistory.forEach(entry => {
          context += `${entry.character}: ${entry.response}\n\n`;
        });
        context += `Now respond as ${character}. Address the previous points. Stay in character.`;
      } else {
        context = `Topic: "${topic}". Give your opinion as ${character}.`;
      }
      
      promptContent = context;
    } else {
      // Normal chat mode
      promptContent = message;
    }

    // Make OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: characterDescriptions[character] + (userName ? ` The user's name is ${userName}.` : '')
          },
          {
            role: "user",
            content: promptContent
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    return res.status(200).json({ 
      response: data.choices[0].message.content 
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process request', 
      details: error.message 
    });
  }
}
