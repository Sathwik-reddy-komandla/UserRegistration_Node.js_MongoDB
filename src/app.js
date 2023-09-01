require('dotenv').config()
const express = require("express");
const path = require("path");
require("./db/conn");

const auth=require('./middleware/auth')
const hbs=require('hbs')
const Register=require('./models/user')
const bcrypt=require('bcryptjs');
const cookieParser=require('cookie-parser')

const bodyParser = require('body-parser');

const staticPath=path.join(__dirname,'../public')
const templatePath=path.join(__dirname,'../templates/views')
const partialsPath=path.join(__dirname,'../templates/partials')

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.use(express.static(staticPath))
app.set('view engine','hbs')
app.set("views",templatePath)

hbs.registerPartials(partialsPath)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

const port = process.env.PORT || 3000;


app.get('/',(req,res)=>{
    res.render('index.hbs')
})

app.get('/register',(req,res)=>{
    res.render('index.hbs')
})


app.get('/login',(req,res)=>{
    res.render('login.hbs')
})


app.get('/home',auth,(req,res)=>{
    console.log("on home page geting thecookies stred by user login=======")
    console.log(req.cookies.jwt)
    res.render('home.hbs')
})


app.get('/logout',auth,async (req,res)=>{
    try{
        console.log(req.user)
        res.clearCookie("jwt");
        await req.user.save()
        req.user.tokens=[]
        await req.user.save()
         res.render('login')
        }
        catch(e){
     return res.render('login')
    }

})

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const confirmPassword = req.body.cpassword;
    console.log(password,confirmPassword)
    if (password.trim() === confirmPassword.trim()) {
      const user = new Register({
        name: req.body.fullname,
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        password: password,
        gender: req.body.gender,
      });
      console.log("create user")
      const newUser = await user.save();
      console.log(newUser);
      return res.redirect('/login')
    } else {
        return  res.send("Passwords do not match");
    }
  } catch (e) {
    console.log(e)
    return  res.status(400).send(e);
  }
});

app.post('/login',async (req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await Register.findOne({ email: email });

        if (user) {
            const check = await bcrypt.compare(password.trim(), user.password);

            const token=await user.generateAuthToken();
            if (check) {
                res.cookie("jwt",token,{
                    expires:new Date(Date.now() + 60000),
                    httpOnly:true
                })
                res.status(301).json({res:'home'});
            } else {
                console.log("sending")
                res.status(400).json({error:"Incorrect password"});
            }
        } else {
            console.log("sending usernot found")

            res.status(400).json({error:"USer Not Found"});
        }
    } catch (e) {
        console.error('Error:', e);
        console.log("sending")

        res.status(500).json({error:"Error"});
    }
});



app.listen(port,()=>{
    console.log(`listening at port ${port}`)
})
