const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, firstName, verificationCode) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'Sefask <onboarding@resend.dev>',
            to: [email],
            subject: 'Verify Your Email Address - Sefask',
            html: `
                <!DOCTYPE html>
                <html>

                    <head>
                        <meta charset="UTF-8" />
                        <title>Email Verification</title>
                    </head>

                    <body style="margin:0; padding:40px 20px; background-color:#0e0e0e; font-family:'Inter',sans-serif; color:#fafafa;
                        display:flex;">
                        <div style="max-width:600px; width:90%; align-items:center; margin: auto; gap:60px;">

                            <!-- Header -->
                            <div style=" align-items:center; text-align: center; gap:15px;">
                                <img src="https://i.ibb.co/4RjtW321/logo-light.png" alt="Sefask logo" height="32px" width="32" border="0">
                                <h2 style="color:#ffffff; font-weight:700;">Sefask</h2>
                            </div><br>

                            <!-- Email Body -->
                            <div style="background-color:#262626; border:1px solid rgba(255,255,255,0.1); padding:30px; color:#FFFFFFCC;">
                                <img src="https://i.ibb.co/pB69699L/mail.png" alt="mail" border="0"
                                    style="width:180px; height:180px; display:block; margin:0 auto 20px auto;">
                                <div style="font-size:16px; line-height:1.5; color:#dcdcdc;">
                                    <p style="color:#ffffff; font-weight:bold; margin:0 0 16px 0;">Dear ${firstName},</p>
                                    <p style="margin:0 0 12px 0;">Thanks for signing up! You're one step closer to start using Sefask.
                                        Please use the verification code below to verify your email address.</p>
                                    <p style="color:#aaaaaa; margin:12px 0;">This code will expire in 15 minutes.</p>
                                </div>

                                <!-- Code -->
                                <div
                                    style="background-color:#ebebeb; color:#1a1a1a; font-size:24px; font-weight:700; letter-spacing:8px; padding:14px 30px; margin:40px auto; width:fit-content; font-family:'Inter', monospace;">
                                    ${verificationCode}
                                </div>

                                <div style="margin-top:20px;">
                                    <p
                                        style="color:#a1a1a1aa; font-size:12px; font-weight:bold; width:280px; text-align: center; margin:8px auto 0 auto;">
                                        Enter this code in the verification form to complete your account setup.</p>
                                    <p
                                        style="color:#a1a1a1aa; font-size:12px; font-weight:bold; width:280px; text-align: center; margin:8px auto 0 auto;">
                                        If you did not create a Sefask account, you can safely ignore this email.</p>
                                </div>
                            </div>

                        </div>
                    </body>

                </html>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error('Failed to send verification email');
        }

        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('Email service error:', error);
        throw new Error('Failed to send verification email');
    }
};

module.exports = {
    sendVerificationEmail
};