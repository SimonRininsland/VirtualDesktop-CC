var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var fileUpload = require('express-fileupload');
var logger = require('morgan');

var app = express();

app.use(logger('dev'));
app.use(function(req, res, next) { res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); res.setHeader('Access-Control-Allow-Credentials', true); next(); });
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

app.use('/addFile', require('./routes/addFile'));
app.use('/deleteFile', require('./routes/deleteFile'));
app.use('/listFile', require('./routes/listFile'));
app.use('/getFile', require('./routes/getFile'));
app.use('/deleteWindow', require('./routes/deleteWindow'));
app.use('/addWindow', require('./routes/addWindow'));
app.use('/setPermission', require('./routes/setPermission'));
app.use('/deletePermissions', require('./routes/deletePermissions'));
app.use('/listWindows', require('./routes/listWindows'));
app.use('/leaveWindow', require('./routes/leaveWindow'));
app.use('/getUserPermissions', require('./routes/getUserPermissions'));
app.use('/getWindowProperties', require('./routes/setWindowProperties'));
app.use('/setWindowProperties', require('./routes/getWindowProperties'));

module.exports = app;
