const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: `"ShivTask AI" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🔐 Your ShivTask AI Password Reset OTP',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a3a8f, #6366f1); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🤖 ShivTask AI</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Plan • Track • Achieve</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin: 0 0 16px;">Hi ${name}! 👋</h2>
          <p style="color: #64748b; line-height: 1.6;">
            We received a request to reset your password. Use the OTP below to continue.
            This OTP is valid for <strong>10 minutes</strong>.
          </p>
          <div style="background: white; border: 2px dashed #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #64748b; margin: 0 0 8px; font-size: 14px;">Your OTP Code</p>
            <h1 style="color: #1a3a8f; font-size: 48px; letter-spacing: 12px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">
            If you didn't request this, please ignore this email. Your account is safe.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            © 2026 ShivTask AI • Plan • Track • Achieve
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };