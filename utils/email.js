const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "bizmail12.itools.mn",
  port: 465,
  secure: true,
  auth: {
    user: "support@node.mn",
    pass: "98100262Ligro",
  },
});

const sendEmail = async ({ subject, text, html, email }) => {
  try {
    const info = await transporter.sendMail({
      from: "support@node.mn",
      to: email,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports = sendEmail;
