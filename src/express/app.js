var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var fileUpload = require('express-fileupload');
var logger = require('morgan');

var addFileRouter = require('./routes/addFile');
var removeFileRouter = require('./routes/removeFile');
var listFileRouter = require('./routes/listFile');
var getFileRouter = require('./routes/getFile');

var app = express();

app.use(logger('dev'));
app.use(function(req, res, next) { res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); res.setHeader('Access-Control-Allow-Credentials', true); next(); });
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

app.use('/addFile', addFileRouter);
app.use('/removeFile', removeFileRouter);
app.use('/listFile', listFileRouter);
app.use('/getFile', getFileRouter);

module.exports = app;
