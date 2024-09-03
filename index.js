const express = require("express");
const cors = require("cors");
const routes = require("./src/routes/index");
const { config } = require("./src/Config/env");
const connectionDb = require("./src/Config/dbConnection");

const main = async () => {
  try {
    config();
    const app = express();
    await connectionDb();
    // cors configure //
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    app.use(routes);

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log({ Error: error.message });
  }
};

main().then();
