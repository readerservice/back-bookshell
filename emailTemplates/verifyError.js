module.exports = (title = 'Verification failed') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email verification error</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #F9F6F5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #2B2B2B;
">
  <div style="
    max-width: 480px;
    margin: 0 auto;
    padding: 24px 16px 40px;
  ">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="
        width: 72px;
        height: 72px;
        margin: 0 auto 16px;
        border-radius: 50%;
        background: linear-gradient(135deg, #A93C01, #FDA223);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: translateY(-5px);
          font-size: 34px;
        ">
          ⚠️
        </div>
      </div>

      <h1 style="
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: #A93C01;
      ">
        ${title}
      </h1>

      <p style="
        margin-top: 8px;
        font-size: 15px;
        color: #555;
      ">
        We couldn’t confirm your email address
      </p>
    </div>

    <!-- Error Card -->
    <div style="
      background-color: #FFFFFF;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      margin-bottom: 20px;
    ">
      <h2 style="
        margin-top: 0;
        font-size: 17px;
        color: #2B2B2B;
      ">
        Possible reasons
      </h2>

      <ul style="
        padding-left: 18px;
        margin: 12px 0 0;
        font-size: 14px;
        line-height: 1.6;
        color: #444;
      ">
        <li>The verification link has expired</li>
        <li>The link has already been used</li>
        <li>The link is invalid or incomplete</li>
      </ul>
    </div>

    <!-- Hint -->
    <div style="
      background-color: #FFFFFF;
      border: 2px solid #FDA223;
      border-radius: 14px;
      padding: 18px;
      text-align: center;
      margin-bottom: 24px;
    ">
      <p style="
        margin: 0 0 8px;
        font-size: 14px;
        color: #2B2B2B;
      ">
        Please return to the app and request a new confirmation email
      </p>
      <div style="
        font-size: 13px;
        color: #A93C01;
        opacity: 0.85;
      ">
        This usually takes just a few seconds
      </div>
    </div>

    <!-- Footer -->
    <div style="
      text-align: center;
      font-size: 12px;
      color: #888;
    ">
      <p style="margin-bottom: 6px;">
        If you believe this is a mistake, contact support.
      </p>
      <p style="margin: 0; color: #CDAF8D;">
        We’re here to help 💛
      </p>
    </div>

  </div>
</body>
</html>
`;
