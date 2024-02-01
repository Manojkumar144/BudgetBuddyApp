const SibApiV3Sdk = require('@getbrevo/brevo');

require("dotenv").config();

const path =require('path');

exports.forgotPassword = async (req, res) => {
    try {
        const email= req.body.email;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); 

sendSmtpEmail.subject = "Password Reset";
sendSmtpEmail.htmlContent = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="icon" href="images/logo.png" type="image/x-icon">
                <title>Password Reset</title>
                <style>
                    
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                text-align: center;
              font-family: 'Lato', sans-serif;
            }
            .container {
                max-width: 400px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: rgb(244, 166, 65);
                color: #fff;
                padding: 10px;
            }
            .content {
                background-color: #fff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .footer {
                margin-top: 20px;
                color: #555;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: rgb(244, 166, 65);
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
            }
            
            .logo {
                margin-bottom: 20px;
            }
            
            .logo img {
                width: 100px; 
                height: auto;
                display: block;
                margin: 0 auto;
            }
                      
                </style>
            </head>
            <body>
                <div class="container">
                  <div class="logo">
                    <img src="images/logo.png" alt="Budget Buddy">
                    </div>
                    <div class="header">
                        <h2>Password Reset</h2>
                    </div>
                    <div class="content">
                      <div style="text-align: left;">
                    <p>Hello User,</p>
                    <p>We have sent you this email in response to your request to reset your password on Buddget Buddy.</p>
                    <p>To reset your password, please follow the link below:</p>
                </div>
                      <a class="button" href="[ResetLink]">Reset Password</a>
                        <p><i>If you didn't request a password reset, you can ignore this email.<i></p>
                 
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Buddget Buddy</p>
                    </div>
                </div>
            </body>
            </html>
            `;
sendSmtpEmail.sender = {"name":"Budget Buddy-Admin","email":"kryptobolt3@gmail.com"};
sendSmtpEmail.to = [{"email":email}];

apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
  console.log('API called successfully. Returned data: ' + JSON.stringify(data));

}, function(error) {
  console.error(error);
});
    }
    catch(err){
        console.log(err);
    }
}


  exports.forgetPassPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views', '/reset.html'));
  };
