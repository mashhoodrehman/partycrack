const express = require ("express");
const mongoose = require ("mongoose");
const path = require ("path");
const cors = require ("cors");
const bodyParser = require ("body-parser");
// const morgan = require ("morgan");
const config = require ("./config")

// routes
const authRoutes = require ("./routes/api/auth");

// import userRoutes from './routes/api/users';

//Email Configuration

const { MONGO_URI, MONGO_DB_NAME } = config;

const app = express();
app.use(express.static(path.join(__dirname,'Public')));
//Body Pasing For Form Data


app.use(express.json());
// app.use(bodyParser.json())
app.use(express.urlencoded({extended: false}));
// app.use(bodyParser.urlencoded({ extended: true }))

// CORS Middleware
app.use(cors());
// Logger Middleware
// app.use(morgan('dev'));
// Bodyparser Middleware
// app.use(bodyParser.json());
app.use(express.json({limit: '100mb'}));

// app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
// DB Config
const db = `${MONGO_URI}/${MONGO_DB_NAME}`;

// Connect to Mongo
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }) // Adding new mongo url parser
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Use Routes

// app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.get('/',(req,res ) => {res.json("Welcome")})

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  // app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

module.exports = app;
