var pkg = require('./package.json');
var fs = require('fs');
var ugly = require('uglify-js');
var jshint = require('jshint').JSHINT;
var babel = require('babel');

function writeBower() {
	var bower = {
		name: pkg.config.bower.name,
		description: pkg.description,
		version: pkg.version,
		dependencies: pkg.dependencies,
		keywords: pkg.keywords,
		authors: [pkg.author],
		license: pkg.license,
		homepage: pkg.homepage,
		ignore: pkg.config.bower.ignore,
		repository: pkg.repository,
		main: pkg.main,
	};
	fs.writeFile('bower.json', JSON.stringify(bower, null, '\t'));
	return true;
}

function lint(full) {
	jshint(full.toString(), {
		browser: true,
		undef: true,
		unused: true,
		immed: true,
		eqeqeq: true,
		eqnull: true,
		noarg: true,
		predef: ['define', 'module', 'exports']
	});

	if (jshint.errors.length) {
		jshint.errors.forEach(function (err) {
			console.log(err.line+':'+err.character+' '+err.reason);
		});
	} else {
		return true;
	}
}

function build(code) {
	var minified = ugly.minify(code, {fromString: true}).code;
	var header = [
		'/*!',
		'	'+pkg.config.title+' '+pkg.version,
		'	license: MIT',
		'	'+pkg.homepage,
		'*/',
		''
	].join('\n');

	fs.writeFile('dest/'+pkg.config.fileName+'.js', header+code);
	fs.writeFile('dest/'+pkg.config.fileName+'.min.js', header+minified);
	writeBower();
}

babel.transformFile('src/'+pkg.config.fileName+'.js', {modules: 'umd'}, function (err,res) {
	if (err) {
		return console.log(err);
	} else {
		lint(res.code) && build(res.code);
	}
});