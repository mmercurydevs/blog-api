require("dotenv").config();

const express = require("express");
const app = express();
const port = Number(process.env.PORT) || 3000;

require("./db");

const route = require("./routes/routes");

app.use(express.json());
app.use("/", route);

// Guard prevents the server from binding a port when this file is imported by tests.
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}

module.exports = app;
