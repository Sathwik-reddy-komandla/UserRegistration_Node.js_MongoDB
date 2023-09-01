const mongoose=require('mongoose')

const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

userSchema.methods.generateAuthToken= async function(){
    try{
        const genToken=await jwt.sign({_id:this._id},process.env.SECRET_KEY)
        console.log(genToken)
        this.tokens=this.tokens.concat({token:genToken})
        await this.save()
        return genToken
    }catch(e){
        console.log(e)
    }
}

userSchema.pre('save',async function(next){
    if(this.isModified("password")){
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(this.password,salt)
        this.password=hashedPassword
        next()
    }
})

const Register=new mongoose.model('Register',userSchema)
module.exports=Register;