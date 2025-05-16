// api/chat.js
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, character, mode, userName } = req.body;
    
    // Character descriptions
    const characterDescriptions = {
      harvey: "You are Harvey Specter from the TV show Suits...",
      walter: "You are Walter White from Breaking Bad...",
      // Add all your character descriptions
    };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('API key is missing');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    // Handle different modes
    if (mode === 'battle') {
      console.log('Processing battle mode request...');
      // Get debate history from request if available
      const debateHistory = req.body.debateHistory || [];
      const topic = req.body.topic || '';
      
      // Build context from debate history
      let context = `The topic is: "${topic}". Here's the conversation so far:\n\n`;
      
      debateHistory.forEach(entry => {
        context += `${entry.character}: ${entry.response}\n\n`;
      });
      
      // Add instructions
      context += `Now respond as ${character}. Address the previous points made by the other characters. Be concise and stay in character.`;
      
      // Make API call for battle mode
      const completion = await openai.chat.completions.create({
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
      });
      
      return res.status(200).json({ 
        response: completion.choices[0].message.content 
      });
    } 
    else {
      // Normal chat mode (your existing code)
      const characterPrompt = `${characterDescriptions[character]} 
      IMPORTANT: Keep your responses concise and short (50-100 words). Use short sentences and be direct.
      ${userName ? `The person you're talking to is named ${userName}. When appropriate, address them by name to make the conversation more personal, but don't overdo it.` : ''}`;
      
      const completion = await openai.chat.completions.create({
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
      });
      
      return res.status(200).json({ 
        response: completion.choices[0].message.content 
      });
    }
    
  } catch (error) {
    console.error('Error calling OpenAI:', error.message);
    return res.status(500).json({ 
      error: 'Failed to process request', 
      details: error.message 
    });
  }
}
