var files = ['../src/js/orbit.js', '../src/js/colour.picker.js', '../src/js/stats.js', '../src/js/init.js'];

var FILE_ENCODING = 'utf-8',
 
EOL = '\n';
 
var _fs = require('fs');
 
function concat(opts) {
 
	var fileList = opts.src;
	var distPath = opts.dest;
	var out = fileList.map(function(filePath){
		return _fs.readFileSync(filePath, FILE_ENCODING);
	});
 
	_fs.writeFileSync(distPath, out.join(EOL), FILE_ENCODING);
	console.log(' '+ distPath +' built.');
}
 
concat({
	src : files,
	dest : 'dist/js/orbit.js'
});

console.log('Files concatenated to dist/js/orbit.js')
 
function uglify(srcPath, distPath) {
	 var
		uglyfyJS = require('uglify-js'),
		result = uglyfyJS.minify(srcPath)
 
	 _fs.writeFileSync(distPath, result.code, FILE_ENCODING);
	 console.log(' '+ distPath +' built.');
}
 
uglify('dist/js/orbit.js', 'dist/js/orbit.min.js');
 
console.log('dist/js/orbit.js uglified');

/*var uglyfyJS = require('uglify-js'),
	result = uglyfyJS.minify(['../src/js/orbit.js', '../src/js/colour.picker.js', '../src/js/stats.js', '../src/js/init.js'])
 _fs.writeFileSync('dist/js/orbit.min.js', result.code, FILE_ENCODING);*/

process.exit(1);