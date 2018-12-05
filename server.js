var util = require('util');
var express = require('express');
var cors = require('cors');
var app = express();
var port = process.env.PORT || 3000;
//var bodyParser = require('body-parser');
//var api = require('./routes/api');

function logMethod(req, res, next) {
    console.log(req.method);
    next();
}

app.use(logMethod);
//app.use('/api/*', api);
app.use(cors());
require('./app/routes.js')(app);

//unhandled routes
// app.use('/*', (req,res) => {
//     res.status(404).json(utils.generateError('Error: Not Found'));
// });

app.listen(port, function () {
    console.log('Listening on port ' + port);
});

module.exports = app;