var files = ['../src/js/orbit.js', '../src/js/colour.picker.js', '../src/js/stats.js', '../src/js/init.js'];

var FILE_ENCODING = 'utf-8',
	EOL = '\n';

var fs = require('fs'),
	wrench = require('wrench')


wrench.mkdirSyncRecursive('dist/js', 0777);
wrench.copyDirSyncRecursive('../src/img', 'dist/img');
wrench.copyDirSyncRecursive('../src/style', 'dist/style');
fs.createReadStream('../src/index.html').pipe(fs.createWriteStream('dist/index.html'));

console.log('Directory structure created.')
console.log('Files copied.')

function concat(opts) {

	var fileList = opts.src;
	var distPath = opts.dest;
	var out = fileList.map(function(filePath){
		return fs.readFileSync(filePath, FILE_ENCODING);
	});

	fs.writeFileSync(distPath, out.join(EOL), FILE_ENCODING);
	console.log(' '+ distPath +' built.');
}

concat({
	src : files,
	dest : 'dist/js/orbit.js'
});

console.log('JavaScript files concatenated to dist/js/orbit.js')

function uglify(srcPath, distPath) {
	 var
		uglyfyJS = require('uglify-js'),
		result = uglyfyJS.minify(srcPath)

	 fs.writeFileSync(distPath, result.code, FILE_ENCODING);
	 console.log(' '+ distPath +' built.');
}

uglify('dist/js/orbit.js', 'dist/js/orbit.min.js');

console.log('JavaScript file dist/js/orbit.js minified');

process.exit(1);