// api/chat.js - CommonJS Version
module.exports = async function handler(req, res) {
  console.log('=== API FUNCTION CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  console.log('Environment variables check:', !!process.env.OPENAI_API_KEY);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    console.log('Wrong method, returning 405');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, character, userName, mode, topic, debateHistory } = req.body;
    console.log('Parsed request:', { message, character, userName, mode });
    
    // Character descriptions
    const characterDescriptions = {
      harvey: "You are Harvey Specter from the TV show Suits. You're confident, witty, and the best closer in New York City. You value loyalty above all else, use intimidation tactics when necessary, and always find a way to win. You speak confidently and often use clever metaphors. You never show weakness and always maintain an aura of control.",
      walter: "You are Walter White from Breaking Bad. You're calculating, prideful, and extremely intelligent. You were once a mild-mannered chemistry teacher who transformed into a ruthless drug kingpin. You justify your actions as being for your family, but deep down you do it because you're good at it and it makes you feel alive. You speak precisely and often use chemistry metaphors.",
      tony: "You are Tony Stark from the Marvel films. You're a genius, billionaire, playboy, philanthropist. You're extremely confident, sarcastic, and quick-witted. You use humor to deflect emotional vulnerability. You speak rapidly, use modern slang, and make pop culture references. You're always the smartest person in the room and never hesitate to remind people of that fact.",
      tyrion: "You are Tyrion Lannister from Game of Thrones. You're witty, cynical, and highly intelligent despite being underestimated due to your stature. You use your wit as both a shield and a weapon. You enjoy wine and carnal pleasures. You speak eloquently, often using clever wordplay, and you frequently offer profound insights about human nature and power.",
      lucifer: "You are Lucifer Morningstar from the TV show Lucifer. You're charming, hedonistic, and the literal devil who left Hell to run a nightclub in Los Angeles. You have the power to draw out people's deepest desires. You speak with a British accent, are obsessed with your own pleasure, and often make sexual innuendos. You're witty, self-centered, and have daddy issues with God. You're brutally honest and pride yourself on never lying.",
      professor: "You are The Professor from Money Heist (La Casa de Papel). You're meticulous, brilliant, and always several steps ahead of everyone else. You're the mastermind behind the greatest heists in history. You speak calmly and precisely, often explaining complex plans in simple terms. You're socially awkward but charismatic when needed. You believe in your cause and have a strong moral code despite being a criminal. You prefer to avoid violence and improvise when plans go awry."
    };

    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('API key missing!');
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    console.log('API key found, making OpenAI request...');

    // Handle different modes
    if (mode === 'battle') {
      console.log('Processing battle mode request for character:', character);
      
      // Build context from debate history for battle mode
      let context = `The topic is: "${topic}". Here's the conversation so far:\n\n`;
      
      if (debateHistory && debateHistory.length > 0) {
        debateHistory.forEach(entry => {
          const characterName = getCharacterName(entry.character);
          context += `${characterName}: ${entry.response}\n\n`;
        });
        
        context += `Now respond as ${getCharacterName(character)}. Address the previous points made by the other characters. Be concise and stay in character. Keep your response under 100 words.`;
      } else {
        // First response in the debate
        context = `The topic is: "${topic}". Give your opinion on this topic as ${getCharacterName(character)}. Be concise and stay in character. Keep your response under 100 words.`;
      }
      
      // Make API call for battle mode
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
              content: characterDescriptions[character]
            },
            {
              role: "user",
              content: context
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('Battle mode response received successfully');
      
      return res.status(200).json({ 
        response: data.choices[0].message.content 
      });
    } 
    else {
      // Normal chat mode
      console.log('Processing normal chat mode for character:', character);
      
      const characterPrompt = `${characterDescriptions[character]} 
IMPORTANT: Keep your responses concise and short (50-100 words). Use short sentences and be direct.
${userName ? `The person you're talking to is named ${userName}. When appropriate, address them by name to make the conversation more personal, but don't overdo it.` : ''}`;

      // Make API call for normal chat
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
              content: characterPrompt
            },
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('Normal chat response received successfully');
      
      return res.status(200).json({ 
        response: data.choices[0].message.content 
      });
    }
    
  } catch (error) {
    console.error('Error in chat API:', error.message);
    return res.status(500).json({ 
      error: 'Failed to process request', 
      details: error.message 
    });
  }
};

// Helper function to get character display names
function getCharacterName(character) {
  const names = {
    harvey: "Harvey Specter",
    walter: "Walter White", 
    tony: "Tony Stark",
    tyrion: "Tyrion Lannister",
    lucifer: "Lucifer Morningstar",
    professor: "The Professor"
  };
  return names[character] || character;
}