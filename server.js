const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const User = require('./user-model')
const Exercise = require('./exercise-model')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )


// const Schema = mongoose.Schema;

// const UserSchema = new Schema({
//   username: String
// })

// mongoose.model('User', UserSchema)


app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', (req, res) => {
  console.log(req.body.username)
  
  const user = new User({
    username: req.body.username
  });
  
  user.save(function(error, user) {
    if (error) {
      res.status(500).send('{error:' + error + ' }')
    }
    
    res.send({
      user: user
    })
  })
  
//   5b51a269dbcc762c54236e3f <--user 
  
});


app.post('/api/exercise/add', (req, res) => {
  console.log(req.body.username)
  
  const exercise = new Exercise({
    userId: req.body.userId,
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: new Date(req.body.date)
  });
  
  exercise.save(function(error, exercise) {
    if (error) {
      res.status(500).send('{error:' + error + ' }')
    }
    
    res.send({
      exercise: exercise
    })
  })
  
//   5b51a269dbcc762c54236e3f <--user 
  
});


app.get('/api/exercise/log', (req, res, next) => {
  console.log(req.query)
  if (!req.query.userId) {
    res.send({error: 'userId must be present'})
  }
  
  const userId = req.query.userId
  
  let from = req.query.from;
  let to = req.query.to;
  let limit = req.query.limit;
  
  const limitOptions = {};
    if (limit) limitOptions.limit = limit;
      
        if (from && to) {
          Exercise.find({ $and: [ { userId:userId }, { date: {$gt: new Date(from)} }, { date: {$lt: new Date(to)} } ] } ).limit(parseInt(limit)).exec((err, exercises) => {
            if (err) {
              return res.send({error: err})
            }
            return res.send({results: exercises})
          })
        } else if (from) {
          Exercise.find({ $and: [ { userId:userId }, { date: {$gt: new Date(from)} } ] } ).limit(parseInt(limit)).exec((err, exercises) => {
            if (err) {
              return res.send({error: err})
            }
            return res.send({results: exercises})
          })
       } else if (to) {
         Exercise.find({ $and: [ { userId:userId }, { date: {$lt: new Date(to)} } ] } ).limit(parseInt(limit)).exec((err, exercises) => {
            if (err) {
              return res.send({error: err})
            }
            return res.send({results: exercises})
          })
       } else {
         Exercise.find({ userId:userId } ).limit(parseInt(limit)).exec((err, exercises) => {
            if (err) {
              return res.send({error: err})
            }
            return res.send({results: exercises})
          })
       }
      
      
  
});



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

