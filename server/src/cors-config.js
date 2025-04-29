const corsConfig = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://onde-ta-passando.netlify.app"]
      : ["http://localhost:3000"],

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],

  maxAge: 86400,

  optionsSuccessStatus: 200,
};

module.exports = corsConfig;
