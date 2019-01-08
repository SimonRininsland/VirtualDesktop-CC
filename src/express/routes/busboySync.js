var Busboy = require('busboy');

function busboySync(req, res, next) {
	busboy = new Busboy({ headers: req.headers });
	busboy.on('field', function (key, value) {
		req.body[key] = value;
	});
	busboy.on('error', function (err) {
		console.log(err);
		next();
	});
	busboy.on('finish', function () {
		next();
	});
	req.body = req.body || {};
	req.pipe(busboy);
}

module.exports = busboySync;