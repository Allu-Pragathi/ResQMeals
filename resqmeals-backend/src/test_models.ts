import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: 'c:/Users/praga/Downloads/ResQMeals/resqmeals-backend/.env' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // There isn't a direct listModels in the JS SDK usually, it's in the REST API.
        // But we can try common ones.
        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("test");
                console.log(`Model ${m} works!`);
                return m;
            } catch (e: any) {
                console.log(`Model ${m} failed:`, e.message);
            }
        }
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

listModels();
