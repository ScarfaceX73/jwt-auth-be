const nodemailer = require(nodemailer);

let transporter = nodemailer.createTransport({
    host: 'mail.grand-banoffee-42055a.netlify.app',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'srinidurai73@gmail.com', // generated ethereal user
        pass: 'Srini@2000'  // generated ethereal password
    },
    tls: {
        rejectUnauthorized: false
    }
});

// setup email data with unicode symbols
let mailOptions = {
    from: '"Nodemailer Contact" srinidurai73@gmail.com', // sender address
    to: 'anusu90@gmail.com', // list of receivers
    subject: 'Node Contact Request', // Subject line
    text: 'Hello world?', // plain text body
    html: output // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.render('contact', { msg: 'Email has been sent' });
});