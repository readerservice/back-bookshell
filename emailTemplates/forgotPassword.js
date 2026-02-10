module.exports = (name, tempPassword) => `
  <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px;">
        <h2 style="color:#A93C01">Password reset</h2>
        <p>Hello ${name || ''},</p>
        <p>Your temporary password is:</p>
        <p style="font-size:18px;font-weight:bold;color:#333;">${tempPassword}</p>
        <p>Please log in using this password and change it immediately in your profile settings.</p>
        <br/>
        <p>Best regards,<br/>Support Team</p>
    </div>
`;