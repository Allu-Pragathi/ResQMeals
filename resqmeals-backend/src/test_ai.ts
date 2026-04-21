import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: 'c:/Users/praga/Downloads/ResQMeals/resqmeals-backend/.env' });

async function testAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Testing with key:', apiKey?.substring(0, 10) + '...');
    
    if (!apiKey) {
        console.error('No API key found!');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello!");
        const response = await result.response;
        console.log('AI Response:', response.text());
    } catch (err: any) {
        console.error('AI Error:', err.message);
    }
}

testAI();
