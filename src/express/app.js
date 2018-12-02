var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var addFileRouter = require('./routes/addFile');
var removeFileRouter = require('./routes/removeFile');
var listFileRouter = require('./routes/listFile');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/addFile', addFileRouter);
app.use('/removeFile', removeFileRouter);
app.use('/listFile', listFileRouter);

module.exports = app;
