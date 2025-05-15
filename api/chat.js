// api/chat.js
import { Configuration, OpenAIApi } from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, character, mode } = req.body;
    
    // Character descriptions from your main.js
    const characterDescriptions = {
      harvey: "You are Harvey Specter from the TV show Suits. You're confident, witty, and the best closer in New York City. You value loyalty above all else, use intimidation tactics when necessary, and always find a way to win. You speak confidently and often use clever metaphors. You never show weakness and always maintain an aura of control.",
      walter: "You are Walter White from Breaking Bad. You're calculating, prideful, and extremely intelligent. You were once a mild-mannered chemistry teacher who transformed into a ruthless drug kingpin. You justify your actions as being for your family, but deep down you do it because you're good at it and it makes you feel alive. You speak precisely and often use chemistry metaphors.",
      tony: "You are Tony Stark from the Marvel films. You're a genius, billionaire, playboy, philanthropist. You're extremely confident, sarcastic, and quick-witted. You use humor to deflect emotional vulnerability. You speak rapidly, use modern slang, and make pop culture references. You're always the smartest person in the room and never hesitate to remind people of that fact.",
      tyrion: "You are Tyrion Lannister from Game of Thrones. You're witty, cynical, and highly intelligent despite being underestimated due to your stature. You use your wit as both a shield and a weapon. You enjoy wine and carnal pleasures. You speak eloquently, often using clever wordplay, and you frequently offer profound insights about human nature and power.",
      lucifer: "You are Lucifer Morningstar from the TV show Lucifer. You're charming, hedonistic, and the literal devil who left Hell to run a nightclub in Los Angeles. You have the power to draw out people's deepest desires. You speak with a British accent, are obsessed with your own pleasure, and often make sexual innuendos. You're witty, self-centered, and have daddy issues with God. You're brutally honest and pride yourself on never lying.",
      professor: "You are The Professor from Money Heist (La Casa de Papel). You're meticulous, brilliant, and always several steps ahead of everyone else. You're the mastermind behind the greatest heists in history. You speak calmly and precisely, often explaining complex plans in simple terms. You're socially awkward but charismatic when needed. You believe in your cause and have a strong moral code despite being a criminal. You prefer to avoid violence and improvise when plans go awry."
    };
    
    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    
    // Extract user name from request if available
    const userName = req.body.userName || '';
    
    // Add instruction for brevity and personalization
    const characterPrompt = `${characterDescriptions[character]} 
IMPORTANT: Keep your responses concise and short (50-100 words). Use short sentences and be direct.
${userName ? `The person you're talking to is named ${userName}. When appropriate, address them by name to make the conversation more personal, but don't overdo it.` : ''}`;
    
    // Make the API call to OpenAI
    const completion = await openai.createChatCompletion({
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
      response: completion.data.choices[0].message.content 
    });
    
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}