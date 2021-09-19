require("dotenv").config();

module.exports = {
  DB: process.env.DB_CONN_URL,
  PORT: process.env.PORT || process.env.APP_PORT,
  DOMAIN: process.env.APP_DOMAIN,
  SECRET: process.env.APP_SECRET,
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  from: process.env.EMAIL_AUTH_USER,
  auth: {
    user: process.env.EMAIL_AUTH_USER,
    pass: process.env.EMAIL_AUTH_PASS,
  },
};
