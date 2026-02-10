module.exports = (name, verifyLink) => `
  <div style="font-family: Arial; max-width: 400px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
    <h2 style="text-align: center; color: #333;">Welcome, ${name}!</h2>
    <p>To complete your registration, please confirm your email by clicking the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyLink}" style="background-color: #FDA223; color: black; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Confirm Email</a>
    </div>
    <p>If you didn’t create an account, you can safely ignore this message.</p>
  </div>
`;