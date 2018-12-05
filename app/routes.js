var bodyParser = require('body-parser');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host:'den1.mysql1.gear.host',
    user:'catsim',
    password:'Ik8H--1C8O2D',
    database:'catsim'
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = function (app) {
    //test get, default link
    app.get('/', function (req, res) {
        res.send('Howdy!');
    });
    
    //test get with something in url
    app.get('/something', function (req, res) {
        var id = req.param('id');
        res.send('ID = ' + id);
    });
    
    app.use(bodyParser.json()); //support json encoded bodies
    app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
    
    app.use(function(req, res, next) {
        console.log(req.headers.origin);
        res.setHeader( "Access-Control-Allow-Origin", "*" );
        return next();
    });

    //test post method
    app.post('/', function(req, res) {
        var id = req.body.id;
        res.send('ID = ' + id);
    })

    app.post('/test', function(req,res) {
        sql = `SELECT * FROM users WHERE username='bob';`;
        console.log(sql);
        connection.query(sql, function(err, result) {
            if (err) throw err;
            console.log(result[0]);
            res.send(result);
        });
    });

    //FOR REGISTRATION: insert new user along with the new cat
    //need username, password, name, color, life
    //if user already there then send back 'user already exist', if all success 'inserted new user'
    app.post('/newuser', function(req,res) {
        res.setHeader( "Access-Control-Allow-Origin", "*" );
        var sql = `SELECT * FROM users WHERE username = '${req.body.username}';`;
        connection.query(sql, function(err1, result1) {
            if (err1) throw err1;
            if (result1[0]!= undefined) {
                res.send("user already exist");
            }
            else {
                sql = `INSERT INTO cats (catName, color, lifeStatus) VALUES ('${req.body.name}','${req.body.color}',${req.body.life});`;
                connection.query(sql, function(err2, result2) {
                    if (err2) throw err2;
                    //console.log('inserted new cat');
                    console.log(result2.insertId);
                    sql = `INSERT INTO users (username, password, catID) VALUES ('${req.body.username}','${req.body.password}',${result2.insertId});`;
                    console.log(sql);
                    connection.query(sql, function(err3, result3) {
                        if (err3) throw err3;
                        console.log('inserted new user');
                        res.send("inserted new user");
                    });
                });
            }
        }); 
    });

    //FOR LOG IN: cross check username/password and return cat id of that person
    //need username, password
    //returns 'user not found if username doesnt exist, 'wrong password' if wrong password, catID if authentication successful
    app.post('/checkuser', function(req,res) {
        res.setHeader( "Access-Control-Allow-Origin", "*" );
        var sql = `SELECT * FROM users WHERE username = '${req.body.username}';`
        connection.query(sql, function(err, result) {
            if (err) throw err;
            if (result[0]==undefined) {
                res.send("user not found");
            }
            else {
                var thePassword = result[0].password;
                console.log(thePassword);
                console.log(req.body.password);
                if (req.body.password.localeCompare(thePassword) != 0) {
                    res.send('wrong password');
                }
                else {
                    console.log(result[0].catID);
                    res.send((result[0].catID).toString());
                }
            }
        });
    });
    
    //FOR CLICKING NEW CAT AFTER CAT DIED: insert new cat
    //need name, color, life
    app.post('/newcat', function(req, res) {
        res.setHeader( "Access-Control-Allow-Origin", "*" );
        var sql = `INSERT INTO cats (catName, color, lifeStatus) VALUES ('${req.param.name}','${req.body.color}','${req.body.life}');`;
        //res.send(sql);
        connection.query(sql, function(err, result) {
            if (err) throw err;
            console.log('inserted new cat');
            res.send('inserted new cat');
        });
    });

    //update when fed, need catID and feed TS
    app.post('/updatecat/feed', function(req,res) {
        res.setHeader( "Access-Control-Allow-Origin", "*" );
        var sql = `UPDATE cats SET hungerTS = '${req.body.feed}' WHERE catID = ${req.body.catID}`;
        connection.query(sql, function(err, result) {
            if (err) throw err;
            console.log('updated cat (fed)');
            res.send('updated cat (fed)');
        });
    });

    //update when showered, need catID and shower TS
    app.post('/updatecat/shower', function(req,res) {
        res.setHeader( "Access-Control-Allow-Origin", "*" );
        var sql = `UPDATE cats SET cleanlinessTS = '${req.body.shower}' WHERE catID = ${req.body.catID}`;
        connection.query(sql, function(err, result) {
            if (err) throw err;
            console.log('updated cat (showered)');
            res.send('updated cat (showered)');
        });
    });

    //update when sleep, need catID and sleep TS
    app.post('/updatecat/sleep', function(req,res) {
        res.setHeader( "Access-Control-Allow-Origin", "*" );
        var sql = `UPDATE cats SET sleepinessTS = '${req.body.sleep}' WHERE catID = ${req.body.catID}`;
        connection.query(sql, function(err, result) {
            if (err) throw err;
            console.log('updated cat (slept)');
            res.send('updated cat (slept)');
        });
    });

    //update lifeStatus when a cat is dead
    //needs catID
    app.post('/dead', function(req,res) {
        res.setHeader( "Access-Control-Allow-Origin", "*" );
        var sql = `UPDATE cats SET lifeStatus = 0 WHERE catID = ${req.body.catID}`;
        connection.query(sql, function(err, result) {
            if (err) throw err;
            res.send('cat is dead');
        });
    });

    //revive cat
    //needs catID
    app.post('/revive', function(req,res) {
        res.setHeader( "Access-Control-Allow-Origin", "*" );
        var sql = `UPDATE cats SET lifeStatus = 1 WHERE catID = ${req.body.catID}`;
        connection.query(sql, function(err, result) {
            if (err) throw err;
            res.send('cat is revived');
        });
    });
    
    //PULLING A CAT AFTER LOGGING IN: get a cat
    //getcat?catid=2
    app.get('/getcat', function(req,res) {
        res.setHeader( "Access-Control-Allow-Origin", "*" );
        var sql = `SELECT * FROM cats WHERE catID = ${req.param('catid')};`
        connection.query(sql, function (err, result) {
            if (err) throw err;
            res.send(result); // access like JSON
        });
    });

    app.post('/flow', function(req,res) {
        res.setHeader( "Access-Control-Allow-Origin", "*" );
        res.setHeader('Content-Type','application/json');
        response.send(JSON.stringify({
            "speech" : "something",
            "displayText" : "something"
        }));
    });
    
    // handle client side error
    app.use((err, req, res, next) => {
        if(res.statusCode == 400) {
            res.json(utils.generateError(err.message));
        }
        else {
            next(err);
        }
    });
};