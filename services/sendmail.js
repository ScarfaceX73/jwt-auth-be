const { createTransport } = require("nodemailer");
const path = require("path");
require("dotenv").config(path.join(__dirname, "../.env"));

const transport = createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "5d5f7ae8087ffd",
        pass: "7f70909d381466"
    }
});


const sendMail = (toUser) => {

    const mailConfigurations = {

        from: 'srinidurai73@gmail.com',
        to: toUser,
        subject: 'Sending Email using Node.js',
        text: 'Hi! There, You know I am using the'
            + ' NodeJS Code along with NodeMailer '
            + 'to send this email.'
    };
    transport.sendMail(mailConfigurations, (err, info) => {
        if (err) {
            throw Error(err)
        }
        console.log(info)
        return info
    })
}

module.exports = sendMail



