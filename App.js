const express = require('express');
const app = express();
const path = require('path');
const mongoose= require('mongoose');
const bodyParser = require('body-parser');
// Schema
const Policy = require('./Policy')

//env 
require("dotenv").config();
const port = process.env.PORT || 3000;
const db = process.env.DB;

// Path
app.use('/public', express.static(path.join(__dirname, 'public')))

const multer  = require('multer');

const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/uploads/");
    },
    filename: (req, file, cb) => {
      console.log(file);
      cb(null,file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    },
  });

const upload = multer({ storage:Storage }).single('file');

// set up the view engine
app.set('view engine', 'ejs');

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

//connect mongo
mongoose.connect(db,{
    useNewUrlParser:true
})
.then(() => console.log('Mongodb Connected'))
.catch(err => console.log(err));


app.get('/', (req, res) => {
    res.render('Register');
})

app.post('/',upload,(req, res,next) => {
    const { uname, fname, mname, dob, phone, policynumber, policydate, caddress, paddress} = req.body;
    const image = req.file.filename;
    console.log(image);
    let errors = [];

    // if (!uname || !fname || !mname || !dob || !phone || !policynumber || !policydate || !caddress || !paddress ) {
    //     errors.push({ msg: 'please fill the all fields' });
    // }


    if (errors.length > 0) { 
        console.log(errors);
        res.render('register', {
            errors,
            uname, fname, mname, dob, phone, policynumber, policydate, caddress, paddress
        })
    }
    else {
        // validation passed
        Policy.findOne({ policynumber: policynumber })
            .then(user => {
                if (user) {
                    //user exist
                    errors.push({ msg: 'Policy is already Registered' })
                    res.render('register', {
                        errors,
                        uname, fname, mname, dob, phone, policynumber, policydate, caddress, paddress
                    })    
                }
                else {
                    const newPolicy = new Policy({
                        uname, fname, mname, dob, phone, policynumber, policydate, caddress, paddress,image
                    });
                    newPolicy.save();
                    console.log('Policy Saved');
                    res.redirect('/search');
                }
            })
    }
})

app.get('/search', (req, res) => {
    Policy.find({}, function (err, data) {
        if(err) throw err;
        res.render('Search',{records: data});
    }).clone().catch(function (err) { console.log(err) })

})

app.get('/delete/:id',(req,res) =>{
    var id = req.params.id;
    var del = Policy.findByIdAndDelete(id);
    del.exec(function(err){
        if(err){
            console.log(err);
            return;
        }
        return res.redirect('/search')
    })
}) 

app.get('/edit/:id',(req,res) =>{
    var id = req.params.id;
    var edit = Policy.findById(id);
    edit.exec(function(err,data){
        if(err){
            console.log(err);
        }
        else{
            res.render('Edit',{list:data})
        }
    })
}) 

app.post('/update',(req,res,next) =>{

    var update = Policy.findByIdAndUpdate(req.body.id,{
        uname:req.body.uname,
        fname:req.body.fname,
        mname:req.body.mname,
        dob:req.body.dob,
        phone:req.body.phone,
        policynumber:req.body.policynumber,
        policydate:req.body.policydate,
        caddress:req.body.caddress,
        paddress:req.body.paddress,
    });
    update.exec(function(err,data){
        if(err){
            console.log(err);
            return;
        }
        return res.redirect('/search');
    })
})


app.post('/find', (req, res) => {

    var fpolicynumber = req.body.policynumber;
    var fphone = req.body.phone;
    

    if (fpolicynumber != '' || fphone != '') {
        var filterParameter = {
            $and: [{policynumber: fpolicynumber},{ phone: fphone  }]
        }
    }
    else {
        var filterParameter = {};
    }

    var policyFilter = Policy.find(filterParameter);
    policyFilter.find({}, function (err, data) {
        if (!err) {
            res.render('Search', { title: "Teachers Records", records: data});
        } else {
            throw err;
        }
    }).clone().catch(function (err) { console.log(err) })

})




app.listen(`${port}`, () => console.log(`App running at ${port}`));