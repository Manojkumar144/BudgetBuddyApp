const uuid = require("uuid");
const Sib = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");
const dotenv =require("dotenv");
dotenv.config()
const User = require("../models/user")
const Forgotpassword = require("../models/forgotpassword");
const path=require('path');
const fs = require('fs');

const defaultClient = Sib.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;


const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ where: { email: email } });

    if (user) {
      const id = uuid.v4();
      user.createForgotpassword({ id, active: true }).catch((err) => {
        throw new Error(err);
      });

      const client = Sib.ApiClient.instance;
      const apiKey = client.authentications["api-key"];
      apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

      const sender = {
        email: "kryptoBolt3@gmail.com",
        name: "Budget Buddy-Admin",
      };

      const recievers = [
        {
          email: email,
        },
      ];
      const transactionalEmailApi = new Sib.TransactionalEmailsApi();
      transactionalEmailApi
        .sendTransacEmail({
          subject: "Reset Password Mail",
          sender,
          to: recievers,
          htmlContent: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
              border: 1px solid rgb(239, 151, 19);
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
                  <div class="header">
                      <h2>Password Reset</h2>
                  </div>
                  <div class="content">
                    <div style="text-align: left;">
                  <p>Hello User,</p>
                  <p>We have sent you this email in response to your request to reset your password on Buddget Buddy.</p>
                  <p>To reset your password, please follow the link below:</p>
              </div>
                    <a class="button" href="${process.env.WEBSITE}/resetpassword/${id}">Reset Password</a>
                      <p><i>If you didn't request a password reset, you can ignore this email.<i></p>
               
                  </div>
                  <div class="footer">
                      <p>&copy; 2024 Buddget Buddy</p>
                  </div>
              </div>
          </body>
          </html>
                    `,
        })
        .then((result) => {
          console.log(result);
          return res.status(200).json({
            success: true,
            message: "reset password link has been sent to your email",
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      throw new Error("User doesnt exist");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error, sucess: false });
  }
};



  const forgetPassPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views', '/reset.html'));
  };

  const resetPassword = async (req, res) => {
    try {
      const id = req.params.id;
      Forgotpassword.findOne({ where: { id } }).then((forgotpasswordrequest) => {
        if (forgotpasswordrequest) {
          if (forgotpasswordrequest.active === true) {
            forgotpasswordrequest.update({ active: false });
            res.status(200).send(`<html>
            <body>
                                  <script>
                                      function formsubmitted(e){
                                              e.preventDefault();
                                                  console.log('called')
                                      }
                                  </script>
                                      <form action="${process.env.WEBSITE}/updatepassword/${id}" method="get">
                                              <label for="newpassword">Enter New password</label>
                                               <input name="newpassword" type="password" required></input>
                                               <button>reset password</button>
                                       </form>
                                       </body>
                              </html>`);
            res.end();
          } else {
            throw new Error("request has expired");
          }
        } else {
          throw new Error("request not found");
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  
  const updatePassword = (req, res) => {
    try {
      const { newpassword } = req.query;
      const resetpasswordid = req.params.id;
      Forgotpassword.findOne({ where: { id: resetpasswordid } }).then(
        (resetpasswordrequest) => {
          User.findOne({ where: { id: resetpasswordrequest.userId } }).then(
            (user) => {
              if (user) {
                //encrypt the password
                const saltRounds = 10;
                bcrypt.genSalt(saltRounds, function (err, salt) {
                  if (err) {
                    console.log(err);
                    throw new Error(err);
                  }
                  bcrypt.hash(newpassword, salt, function (err, hash) {
                    // Store hash in your password DB.
                    if (err) {
                      console.log(err);
                      throw new Error(err);
                    }
                    user.update({ password: hash }).then(() => {
                      res
                        .status(201)
                        .json({
                          message: "Successfuly updated the new password",
                        });
                    });
                  });
                });
              } else {
                return res
                  .status(404)
                  .json({ error: "No user Exists", success: false });
              }
            }
          );
        }
      );
    } catch (error) {
      return res.status(403).json({ error, success: false });
    }
  };
  
  module.exports = {
    forgetPassPage,
    forgotPassword,
    resetPassword,
    updatePassword,
  };