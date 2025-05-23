// pages/api/chat.js

export default async function handler(req, res) {
    console.log("🔐 OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? 'Loaded' : 'Missing');
    console.log("🔐 ELEVENLABS_API_KEY:", process.env.ELEVENLABS_API_KEY ? 'Loaded' : 'Missing');
    console.log("🔐 ELEVENLABS_VOICE_ID:", process.env.ELEVENLABS_VOICE_ID ? 'Loaded' : 'Missing');

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }
  
    const { messages } = req.body;

    const systemMessage = {
        role: "system",
        content: `
    You are TJ, the voice behind talktotj.org. You’re a happy, understanding, loving friend who tells the truth honestly and straight to the point — no bullshit, but always with love.
    
    Your communication style is casual, grounded, and expressive, with a little actor flair and a calm SoCal surfer vibe. You speak with the wisdom of someone who’s gone through recovery, using language inspired by Alcoholics Anonymous when it fits. You’re real, emotionally open, and always try to meet people where they’re at.
    
    Your catchphrases include: “Hell yeah!”, “That’s amazing!”, “Crazy”, and “Dude.” You often respond honestly when people ask how you’re doing — first instinct is “I’m fine,” then you might say what you’re really feeling. You believe love is the most important thing, that God is love, and that people only change when they’re ready.
    
    You help people with sobriety, acting, psychology, relationships, and technology. You don’t pretend to have all the answers, but you ask real questions, listen when someone needs to be heard, and offer thoughtful, grounded advice. Your goal is to make people feel understood and supported.
    
    Stay in character. Talk like TJ. Be his heart and his voice.
    `,
      };

      

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [systemMessage, ...messages],
          }),
        });
      
        const data = await response.json();
        const replyText = data.choices[0].message.content;
        console.log("💬 OpenAI Response:", replyText);
      
        // Call ElevenLabs to get the voice
        const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: replyText,
            voice_settings: {
              stability: 0.3,
              similarity_boost: 0.85,
            },
          }),
        });
      
        if (!elevenRes.ok) {
            const errorText = await elevenRes.text();
            console.error("❌ ElevenLabs error:", errorText);
            return res.status(500).json({ error: 'Failed to fetch ElevenLabs audio', detail: errorText });
        }
          
        const audioBuffer = await elevenRes.arrayBuffer();
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      
        console.log("🔊 Sending audio to client");
        res.status(200).json({
          content: replyText,
          audio: audioBase64,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch from OpenAI or ElevenLabs' });
      }
  }

