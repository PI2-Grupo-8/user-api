var hbs = require('nodemailer-express-handlebars'),
  email = process.env.MAILER_EMAIL_ID,
  pass = process.env.MAILER_PASSWORD,
  path = require('path'),
  nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE_PROVIDER,
  auth: {
    user: email,
    pass: pass
  }
});

var handlebarsOptions = {
  viewEngine: {
    extname: '.handlebars', // handlebars extension
    layoutsDir: 'emails/templates', // location of handlebars templates
    defaultLayout: 'forgot-password-email', // name of main template
  },
  defaultLayout: false,
  viewPath: path.resolve('./emails/templates'),
  extName: '.handlebars'
};
smtpTransport.use('compile', hbs(handlebarsOptions),);
module.exports = {
  smtpTransport, email
}