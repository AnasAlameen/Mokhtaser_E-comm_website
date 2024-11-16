const winston = require("winston");

const logger = winston.createLogger({
  // مستويات التسجيل
  levels: winston.config.npm.levels,
  // تنسيق السجلات
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    ),
    winston.format.colorize({ all: true })
  ),
  // وجهات السجلات
  transports: [
    new winston.transports.Console(), // لطباعة السجلات في الكونسول
    new winston.transports.File({ filename: "combined.log" }), // لتسجيل السجلات في ملف
  ],
});

module.exports = logger;
