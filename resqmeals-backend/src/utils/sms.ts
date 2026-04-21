import twilio from 'twilio';

/**
 * SMS Gateway Utility
 * Uses Twilio if credentials are provided in .env, otherwise defaults to console simulation.
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

export async function sendOtpSms(phone: string, code: string) {
    try {
        if (client && twilioPhone) {
            console.log(`\n📱 [TWILIO] Sending real SMS to ${phone}...`);
            const message = await client.messages.create({
                body: `Your ResQMeals verification code is: ${code}. Valid for 5 minutes.`,
                from: twilioPhone,
                to: phone
            });
            console.log(`✅ Twilio SMS sent! SID: ${message.sid}\n`);
            return { success: true, messageId: message.sid };
        } else {
            // SIMULATION MODE
            console.log(`\n📱 [SMS SIMULATION] Sending to ${phone}...`);
            console.log(`---------------------------------`);
            console.log(`SECURE CODE: ${code}`);
            console.log(`EXPIRES IN: 5 minutes`);
            console.log(`---------------------------------\n`);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            return { success: true, messageId: `SIM_${Math.random().toString(36).substr(2, 9)}` };
        }
    } catch (error: any) {
        console.error('❌ SMS Sending failed:', error.message);
        return { success: false, error: error.message };
    }
}
