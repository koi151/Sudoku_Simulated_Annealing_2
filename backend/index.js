const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const timestamp = require('time-stamp');
const cors = require('cors');


require("dotenv").config();

const database = require('./config/database');
database.connect();

const clientRouter = require("./routes/client/index.route");

const app = express();
const port = process.env.PORT;

// override
app.use(methodOverride('_method'));

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Routes
clientRouter(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})