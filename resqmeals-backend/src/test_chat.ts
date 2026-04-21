import axios from 'axios';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "super-secret-key-123";
const API_URL = "http://localhost:8000/api/chat/message";

async function testChat() {
    // 1. Create a mock token for a user
    const user = {
        userId: "cluz12345",
        email: "donations@tajmumbai.com",
        role: "DONOR",
        name: "Taj Mahal Palace",
        latitude: 18.9218,
        longitude: 72.8333
    };

    const token = jwt.sign(user, JWT_SECRET);

    console.log("Sending message to AI Assistant...");

    try {
        const response = await axios.post(API_URL, {
            message: "I have 50 servings of veg food. Which NGOs are near Colaba, Mumbai that can help me?",
            history: []
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("\n--- AI RESPONSE ---");
        console.log(response.data.reply);
        console.log("-------------------\n");
    } catch (err: any) {
        console.error("Chat test failed:", err.response?.data || err.message);
    }
}

testChat();
