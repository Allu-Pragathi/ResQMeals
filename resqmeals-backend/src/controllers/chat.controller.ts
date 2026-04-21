import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Use Groq for faster, free-tier AI
export const handleChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        const { message, history } = req.body;
        const user = (req as any).user;

        console.log(`[Chat] Incoming message from ${user?.name || 'Guest'}: ${message}`);

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        // 1. Gather context about the user's active missions / nearby NGOs
        let systemContext = "You are ResQMeals AI Support. Be helpful, empathetic, and professional. Use markdown for formatting. Keep responses concise.\n";
        
        if (user) {
            systemContext += `The current user is ${user.name} with role ${user.role}.\n`;
            
            // Search for nearby NGOs
            if (user.latitude && user.longitude) {
                const nearbyNgos = await prisma.ngo.findMany({
                    where: {
                        latitude: { gte: user.latitude - 0.1, lte: user.latitude + 0.1 },
                        longitude: { gte: user.longitude - 0.1, lte: user.longitude + 0.1 }
                    },
                    take: 5
                });
                if (nearbyNgos.length > 0) {
                    systemContext += "Nearby NGOs for assistance: " + nearbyNgos.map((n: any) => `${n.name} (${n.address})`).join('; ') + "\n";
                }
            }

            // Dashboard context
            if (user.role === 'DONOR') {
                const activeDonations = await prisma.donation.findMany({
                    where: { donorId: user.id, status: { not: 'Delivered' } },
                    take: 3
                });
                if (activeDonations.length > 0) systemContext += "User's Active Donations: " + JSON.stringify(activeDonations) + "\n";
            }
        }

        // 2. Fallback to simulation if no API Key
        if (!apiKey) {
            console.log('No GROQ_API_KEY found. Returning mock response.');
            res.status(200).json({ reply: "I'm in **Demo Mode**! Please add a `GROQ_API_KEY` to your `.env` file to enable real AI. How can I help you with ResQMeals today?" });
            return;
        }

        // 3. Real Groq Call
        const groq = new Groq({ apiKey });
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemContext },
                ...(history || []).map((h: any) => ({ role: h.role, content: h.text })),
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 500,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
        res.status(200).json({ reply });

    } catch (err: any) {
        console.error('Groq AI Error:', err.message);
        res.status(500).json({ error: 'Failed to process chat', details: err.message });
    }
};
