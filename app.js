const app = require("express")();
// module.exports = app;
var cors = require("cors");
// const productRoutes = require("./routes/products");
// const orderRoutes = require("./routes/orders");
// const emailRoutes = require("./routes/emails");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// module.exports = app;
// const authRoute = require("./routes/auth");
const session = require("express-session");
// const userRoute = require("./routes/user");
// const messages = require("./routes/messages");
const http = require("http");
const socketio = require("socket.io");
// module.exports = app;
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

module.exports = app.set("io", io);

dotenv.config();
app.use(cors({ origin: true, credentials: true }));
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/messages", require("./routes/messages"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/products", require("./routes/products"));
app.use("/api", require("./routes/emails"));
app.use("/api/user/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/chatRooms", require("./routes/rooms"));

mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("Connected to mongoose")
);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

const port = process.env.PORT || 5001;
server.listen(port);
console.log(port);
