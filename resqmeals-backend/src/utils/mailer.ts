import nodemailer from 'nodemailer';

/**
 * Sends an email notification to an NGO when a donation is available within their radius.
 */
export async function sendDonationNotification(ngoEmail: string, ngoName: string, donationType: string, distance: string) {
    try {
        // Mock SMTP config (Use real credentials in .env in production)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || 'mock_user',
                pass: process.env.SMTP_PASS || 'mock_pass',
            },
        });

        const mailOptions = {
            from: '"ResQMeals Alerts" <alerts@resqmeals.org>',
            to: ngoEmail,
            subject: 'New Food Rescue Opportunity Nearby!',
            text: `Hi ${ngoName},\n\nA donor just listed ${donationType} which is only ${distance}km away from you.\n\nPlease log in to your dashboard to accept the mission.\n\nBest,\nResQMeals Team`,
            html: `
                <h3>New Food Rescue Opportunity Nearby!</h3>
                <p>Hi <b>${ngoName}</b>,</p>
                <p>A donor just listed <b>${donationType}</b> which is only <b>${distance}km</b> away from you.</p>
                <p>Please <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/volunteer">log in to your dashboard</a> to accept the mission.</p>
                <br/>
                <p>Best,<br/>ResQMeals Team</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent to NGO:', ngoEmail, info.messageId);
        return info;
    } catch (error) {
        console.error('Mail notification failed:', error);
        return null;
    }
}

export async function sendOtpEmail(email: string, code: string, type: 'SIGNUP' | 'LOGIN') {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'mock_user',
                pass: process.env.SMTP_PASS || 'mock_pass',
            },
        });

        const mailOptions = {
            from: '"ResQMeals Security" <security@resqmeals.org>',
            to: email,
            subject: `ResQMeals ${type === 'SIGNUP' ? 'Email Verification' : 'Verification Code'}`,
            html: `
                <h3>Your ResQMeals Verification Code</h3>
                <p>Please enter the following code to complete your ${type.toLowerCase()}:</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; text-align: center;">
                    <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #f97316;">${code}</span>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <br/>
                <p>Best,<br/>ResQMeals Security Team</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP Email (${type}) sent to:`, email, "Code:", code, "MessageID:", info.messageId);
        return info;
    } catch (error: any) {
        console.error('❌ OTP Mail failed:', error.message);
        if (error.code === 'EAUTH') {
            console.error('AUTH ERROR: Please check your SMTP_USER and SMTP_PASS in .env');
        }
        return null;
    }
}

export async function sendPickupOtpEmail(donorEmail: string, donorName: string, foodType: string, code: string) {
    try {
         const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'mock_user',
                pass: process.env.SMTP_PASS || 'mock_pass',
            },
        });

        const mailOptions = {
            from: '"ResQMeals Logistics" <logistics@resqmeals.org>',
            to: donorEmail,
            subject: `Secure Pickup OTP for "${foodType}"`,
            html: `
                <h3>Hello ${donorName},</h3>
                <p>An NGO/Volunteer is on their way to pick up your donation of <b>${foodType}</b>.</p>
                <p>Please share the following OTP with them when they arrive to confirm the pickup:</p>
                <div style="background-color: #fdf2f0; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #fed7aa;">
                    <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #ea580c;">${code}</span>
                </div>
                <p>This ensures your donation reaches the right hands safely.</p>
                <br/>
                <p>Best,<br/>ResQMeals Logistics</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Pickup OTP sent to donor:', donorEmail);
        return info;
    } catch (error) {
        console.error('Pickup OTP Mail failed:', error);
        return null;
    }
}
