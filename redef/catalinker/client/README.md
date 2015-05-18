# Catalinker

# Install development dependencies
	Install node from http://nodejs.org
	Optionally, install karma and gulp globally
		npm install -g karma, karma-cli, gulp

	From this folder, run 'npm install'



# Gulp tasks
	run using:
		gulp taskname
		gulp taskname --debug (debug is default in watch mode)
        gulp taskname --dest=/var/www/catalinker/  (change destination path, end with /)

	watch
		Watch for changes in folders, and build libs/app/css/specs/coverage when required
		Task does not exit
	clean
		Clean output folder

	buildLibs
		Builds the libraries

	buildApp
		Builds the application (js, css & index.html)
		If --debug is given, source code is not caternated and minified and 'livereload' is added

	specs
		Run specs & build coverage one time, throws error if coverage is below a threshold or if specs fail


# Specs
	Specs can be run one time using gulp, or continously from the specs folder using 'karma start'