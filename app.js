const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

//Create Redis client
let client = redis.createClient();

client.on('connect', function(){
    console.log('WAHOO!! Connected to Redis...');
})
const port = 3000;

//init app
const app = express()

//view Engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


//method-override
app.use(methodOverride('_method'));

app.get('/user/search', function(req,res,next){
    res.render('searchusers.handlebars');
});
app.get('/user/add', function(req,res,next){
    res.render('adduser.handlebars');
});
app.post('/user/add', function(req,res,next){
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;
    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], function(err, reply){
        if(err){
            console.log(err);
        }
        console.log(reply);
        res.redirect('/user/search');
    });
});
//search processing
app.post('/user/search', function(req, res){
    let id = req.body.id;
    client.hgetall(id, function(err, obj){
        if(!obj){
            res.render('searchusers.handlebars',{
            error: 'User does not exist'
        });
    } else {
        obj.id = id;
        res.render('details', {
            user: obj
        });
    }
    })
})
app.listen(port, function(){
    console.log('server rocking and rolling at port ' + port);
});