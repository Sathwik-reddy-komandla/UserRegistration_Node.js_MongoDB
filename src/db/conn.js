const mongoose=require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/user-accounts')
    .then(()=>{
        console.log("Connection successful")
    })
    .catch((err)=>{
        console.log("Error connecting to database")
        console.log(err)
    })

    