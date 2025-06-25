import nodemailer from 'nodemailer';
// import config from './config.js'; // Assuming your existing config.js handles environment variables

// Configure transporter based on environment
const mailerConfig = {
  host: process.env.MAILER_HOST, // Use 'mailpit' as it's the service name in docker-compose
  port: parseInt(process.env.MAILER_PORT || '1025', 10),
  secure: process.env.MAILER_SECURE === 'true', // false for Mailpit by default
  auth: {
    user: process.env.MAILER_USER, // Optional, not typically needed for Mailpit
    pass: process.env.MAILER_PASS, // Optional, not typically needed for Mailpit
  },
  // For Mailpit, if it uses self-signed certificates (not typical for default setup)
  // tls: {
  //   rejectUnauthorized: false
  // }
};

const transporter = nodemailer.createTransport(mailerConfig);

transporter.verify((error, _) => {
  if (error) {
    console.error('Mailer configuration error:', error);
  } else {
    console.log('Mailer is configured and ready to send emails.');
  }
});

export default transporter;
