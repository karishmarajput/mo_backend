var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
  
var fs = require('fs');
var path = require('path');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine','ejs')
mongoose.connect("mongodb+srv://dbUser:dbUser@cluster0.c9k2cod.mongodb.net/dbUser",{ useNewUrlParser:true},{useUnifiedTopology:true},()=>{
    console.log("database connected")
})
mongoose.Promise = global.Promise;
mongoose.connection.on('error',(err)=>{
    console.log(err)
})

var multer = require('multer');
  
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
  
var upload = multer({ storage: storage });


const userSchema = new mongoose.Schema({
    name : String,
    password : String,
    email : String,
    gender : String,
    aboutUs : String,
    dob: Date,
    userAvatar: {
        data: Buffer,
        contentType: String
    }
})
const blogListSchema = new mongoose.Schema({
    title : String,
    category : String,
    subCategory : String,
    description : String,
    authorName : String,
    authorAvatar :{
        data: Buffer,
        contentType: String
    },
    createdAt : String,
    cover : {
        data: Buffer,
        contentType: String
    }
})

const User = new mongoose.model("users",userSchema)
const blogList = new mongoose.model("blogList",blogListSchema)
// Step 7 - the GET request handler that provides the HTML UI

app.get('/', (req, res) => {
	blogList.find({}, (err, items) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
            // console.log(items)
			res.render('index', { items: items });
		}
	});
});

app.get('/newpost',(req,res)=>{
    res.sendFile(path.join(__dirname+'/views/newPost.html'))
})
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname+'/views/register.html'))
})
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname +'/views/login.html'))
})

app.post('/newpost', upload.fields([{ name: 'authorAvatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), (req, res, next) => {
  console.log(req.files.authorAvatar[0].filename)
    var obj = {
        title : req.body.title,
        category : req.body.category,
        subCategory : req.body.subCategory,    // console.log(req.files.authorAvatar[0].filename)
        description :req.body.description,
        authorName : req.body.authorName,
        authorAvatar :{
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.files.authorAvatar[0].filename)),
            contentType: 'image/png'
        },
        createdAt : req.body.createdAt,
        cover : {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.files.cover[0].filename)),
            contentType: 'image/png'
        }
    }
    blogList.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/');
        }
    });
});

app.post('/register', upload.single('userAvatar'), (req, res, next) => {
    
    User.findOne({email:req.body.email},(err,user)=>
    {
        if(user){
            res.send('user already exist')
        }else{
            var obj = {
                name : req.body.name,
                password : req.body.password,
                email : req.body.email,
                gender :req.body.gender,
                aboutUs : req.body.aboutUs,
                dob: req.body.dob,
                userAvatar :{
                    data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                    contentType: 'image/png'
                }
            }
            User.create(obj, (err, item) => {
                if (err) {
                    console.log(err);
                }
                else {
                    // item.save();
                    res.redirect('/');
                }
            });
        }
    })

});

app.post('/login', (req, res, next) => {
    
    User.findOne({email:req.body.email},(err,user)=>
    {
        if(user){
            password = req.body.password
            if(user.password === password){
                res.send(user)
            }else{
                res.send('enter the correct password')
            }

        }else{
            res.send('email doesn\'t exist, please enter correct email or please register first')
        }
    })

});
app.listen(3000,()=>{
    console.log("server is listening")
})