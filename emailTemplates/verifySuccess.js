module.exports = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email verified</title>
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
        background: linear-gradient(135deg, #FDA223, #FFF);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 34px;
      ">
        <div style="
            width: 40px;
            height: 44px;
        ">
          <svg viewBox="0 0 506 570" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M355.06 0.167969C425.471 3.79688 481.52 66.2094 481.521 142.672C481.521 193.02 457.218 237.275 420.517 262.669C470.416 283.923 505.839 337.597 505.839 400.455C505.839 452.526 481.53 498.294 444.82 524.552L397.636 569.067H0V0H355.06V0.167969Z" fill="#FDA223"/>
            <path d="M355.06 0.167969C425.471 3.79688 481.52 66.2094 481.521 142.672C481.521 193.02 457.218 237.275 420.517 262.669C470.416 283.923 505.839 337.597 505.839 400.455C505.839 452.526 481.53 498.294 444.82 524.552L397.636 569.067H0V0H355.06V0.167969ZM29.1836 517.997L154.832 406.13V101.33H273.996C292.1 99.7089 330.416 106.68 338.847 147.536C347.277 188.392 309.393 217.521 289.397 226.979H187.258V313.717H304.8C321.013 316.149 353.438 332.199 353.438 376.946C353.438 421.693 310.744 436.123 289.397 437.744H154.832L114.3 482.329H381L477.466 376.946C462.064 285.344 340.468 266.7 353.438 266.7C366.41 266.699 481.519 196.984 453.957 115.11C431.908 49.6112 361.004 25.6707 328.309 21.8877H29.1836V517.997Z" fill="#A93C01"/>
            <path d="M56.7441 526.104L86.7377 498.542L387.484 494.489L467.737 409.372C466.44 446.986 418.559 504.217 390.727 526.104H56.7441Z" fill="#FDA223"/>
          </svg>
        </div>
      </div>
      <h1 style="
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: #A93C01;
      ">
        Email verified successfully
      </h1>
      <p style="
        margin-top: 8px;
        font-size: 15px;
        color: #555;
      ">
        Your account is now fully activated
      </p>
    </div>

    <!-- Main Card -->
    <div style="
      background-color: #FFFFFF;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      margin-bottom: 20px;
    ">
      <h2 style="
        margin-top: 0;
        font-size: 18px;
        color: #2B2B2B;
      ">
        What’s next?
      </h2>

      <ul style="
        padding-left: 18px;
        margin: 12px 0 0;
        font-size: 14px;
        line-height: 1.6;
        color: #444;
      ">
        <li>Open the app on your phone</li>
        <li>Log in using your email</li>
        <li>Start exploring all features</li>
      </ul>
    </div>

    <!-- CTA -->
    <div style="
      background-color: #FFFFFF;
      border: 2px solid #FDA223;
      border-radius: 14px;
      padding: 18px;
      text-align: center;
      margin-bottom: 24px;
    ">
      <p style="
        margin: 0 0 10px;
        font-size: 14px;
        color: #2B2B2B;
      ">
        You can safely close this page and return to the app
      </p>
      <div style="
        font-size: 13px;
        color: #A93C01;
        opacity: 0.9;
      ">
        No further action required
      </div>
    </div>

    <!-- Footer -->
    <div style="
      text-align: center;
      font-size: 12px;
      color: #888;
    ">
      <p style="margin-bottom: 6px;">
        If you didn’t request this confirmation, just ignore this page.
      </p>
      <p style="margin: 0; color: #CDAF8D;">
        Thank you for choosing us ✨
      </p>
    </div>

  </div>
</body>
</html>
`;
