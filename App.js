const express = require('express');
const app = express();
const mongoose= require('mongoose');
require("dotenv").config();
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const db = process.env.DB;
const Policy = require('./Policy')

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

app.post('/', (req, res) => {
    const { uname, fname, mname, dob, phone, policynumber, policydate, caddress, paddress } = req.body;

    let errors = [];

    if (!uname || !fname || !mname || !dob || !phone || !policynumber || !policydate || !caddress || !paddress) {
        errors.push({ msg: 'please fill the all fields' });
    }

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
                    console.log(errors)
                    res.render('register', {
                        errors,
                        uname, fname, mname, dob, phone, policynumber, policydate, caddress, paddress
                    })    
                }
                else {
                    const newPolicy = new Policy({
                        uname, fname, mname, dob, phone, policynumber, policydate, caddress, paddress
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
        return res.redirect('/search')
    })
})



app.listen(`${port}`, () => console.log(`App running at ${port}`));