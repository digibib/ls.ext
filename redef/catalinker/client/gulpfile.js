/// <vs SolutionOpened='watch' />
/*global process*/
var debug = process.argv.indexOf('--debug') > 0,
    requiredCoverage = 0.5,
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    modify = require('gulp-modify'),
    replace = require('gulp-replace'),
    jshint = require('gulp-jshint'),
    gulpif = require('gulp-if'),
    //minifycss = require('gulp-minify-css'),
    //sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    fs = require('fs'),
    path = require('path'),
    karma = require('gulp-karma'),
    isWatching = false,
    SRC = 'app/',
    SRC_LIB = 'lib/',
    SRC_NPM = 'node_modules/',
    DEST = getArgumentValue('dest', '../server/lib/public/'),
    libFiles = [
//        SRC_NPM + 'angular2/angular2.js'
    ],
    appJsFiles = {
        app: [
            SRC + 'catalinkerApp.js',
            SRC + 'components/**/*.js',
            SRC + 'views/**/*.js'
        ]
    },
    styleFiles = [
        SRC + 'style/*.css'
    ],
    specfiles = [
            SRC + 'lib/angular.min.js',
            SRC + 'lib/angular-animate.min.js',
            SRC + 'lib/angular-aria.min.js',
            SRC + 'lib/angular-route.min.js',
            SRC + 'lib/*.js',
            SRC + 'specs/lib/angular-mocks.js',
            SRC + 'app/catalinkerApp.js',
            SRC + 'app/components/**/*.js',
            SRC + 'specs/**/*Spec.js'
    ],
    jsSrcFiles = [
        'app/**/*.js',
        'specs/*.js',
        'specs/components/**/*.js'
    ],
    mockfiles = [
        'specs/mocks/*.json'
    ],
    //livereload = '<script>document.write(\' <script src="http://\' + (location.host || \'localhost\').split(\':\')[0] + \':35729/livereload.js?snipver=1"></\' + \'script>\')</script>';
    livereload = '<script>document.write(\' <script src="http://\' + \'localhost:35729/livereload.js?snipver=1"></\' + \'script>\')</script>';

function copy(src, dest) {
    dest = DEST + (dest ? dest : '');
    
    gulp.src(SRC + src)
        .pipe(gulp.dest(dest));
}

function buildHtmlApp(indexhtml, views) {
    gulp.src(SRC + indexhtml);
}

function addTemplateTag(content) {
    return content;
}


gulp.task('buildLibs', function () {
    gulp.src(libFiles, { base: './' })
        .pipe(rename(function (path) {
            //    path.dirname = path.dirname.replace('ContentSrc', 'Content');
    }))
        //.pipe(sourcemaps.init())
        //.pipe(uglify())
        .pipe(concat('libs.js'))
        //.pipe(sourcemaps.write('', { includeContent: debug, sourceRoot: '/' }))
        .pipe(gulp.dest(DEST + 'js/'));
    
    //copy('Shared/style/style.css', 'Shared/style/');
});


gulp.task('buildApp', function () {
    var version = Date.now(), scripts, jsfiles = [];
    console.log(debug ? 'building App in debug mode': 'building App in live mode');

    gulp.src(appJsFiles.app, { base: './' })
        .pipe(rename(function (path) { //i just care about the filenames
            jsfiles.push(path.dirname.replace('\\','/')  + '/' + path.basename  + path.extname);
        }))
        //.pipe(sourcemaps.init())
        .pipe(gulpif(!debug, uglify()))
        .pipe(gulpif(!debug, concat('app/catalinkerApp.js')))
        //.pipe(sourcemaps.write('/', { includeContent: debug, sourceRoot: '/' }))
        .pipe(gulp.dest(DEST))
        .pipe(rename(function() { // i just care about the callback
            if (debug) {
                console.log(jsfiles);
                    scripts = '<script src="app/libs.js?%version%"></script>' 
                            + '<script src="' + jsfiles.join('?%version%"></script>\n<script src="') + '?%version%"></script>' 
                            + livereload;
            } else {
                scripts = '<script src="app/libs.js?%version%"></script><script src="app/catalinkerApp.js?%version%"></script>\n';
            }
            gulp.src([SRC + 'index.html'])
                .pipe(replace('<!--scripts-->', scripts))
                .pipe(replace('%version%', version))
                .pipe(gulp.dest(DEST));
        }));

    gulp.src(styleFiles)
        .pipe(gulp.dest(DEST));

    if (debug) {
        gulp.src(mockfiles)
            .pipe(gulp.dest(DEST + 'mocks/'));
    }
    //copy('Shared/style/style.css', 'Shared/style/');
    //copy('Apps/Flows/style/flowsApp.css', 'Apps/Flows/style/');
    //copy('index.html');
    //copy('Apps/Flows/views/**/*.html', 'Apps/Flows/views/');


});

gulp.task('clean', function() {
    rmdir(DEST, true);
});

gulp.task('lint', function() {
    return gulp.src(jsSrcFiles)
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('specs', function () {
    // Be sure to return the stream 
    return gulp.src(specfiles)
      .pipe(karma({
        configFile: 'specs/karma.conf.js',
        action: (isWatching ? 'start' :'run')
    }))
      .on('error', function (err) {
        // Make sure failed tests cause gulp to exit non-zero 
        console.log(err);
        if(!isWatching) {
            throw err;            
        }
    })
      .on('end', function() {
        var coverage = getCoverage();
        console.log('Coverage: ' + (coverage.avg * 100).toFixed(1) + '%');
        //console.log(coverage);
        if(coverage.avg < requiredCoverage) {
            if(isWatching) {
                console.log('Coverage too low! Coverage is ' + (coverage.avg * 100).toFixed(1) +'%, it should be at least ' + (requiredCoverage * 100).toFixed(1) + '%');
            } else {
                throw new Error('Coverage too low! Coverage is ' + (coverage.avg * 100).toFixed(1) +'%, it should be at least ' + (requiredCoverage * 100).toFixed(1) + '%');
            }
        }
    });
});

gulp.task('watch', function () {
    isWatching = true;
    debug = true; // always debug when in watch mode
    gulp.watch(jsSrcFiles, ['lint']);
    gulp.watch([SRC + '**/*'], ['buildApp']);
    gulp.watch(SRC_LIB + '**/*', ['buildLibs']);
    gulp.start('specs');
    gulp.watch('specs/coverage/coverage.json', function(){
        var coverage = getCoverage();
        console.log('Coverage: ' + (coverage.avg * 100).toFixed(1) + '% ' + coverageWord(coverage.avg));
        if(coverage.avg < requiredCoverage){
            console.log('Coverage too low! It should be at least ' + (requiredCoverage * 100).toFixed(1) + '%');            
        }
    });
    //gulp.watch('specs/**/*Spec.js', ['specs']);
    //gulp.src(specfiles)
    //  .pipe(karma({
    //      configFile: 'Specs/karma.conf.js',
    //      action: 'watch'
    //  }));
});

function rmdir(dir, leaveRootDirectory) {
    var list = fs.readdirSync(dir);
    for(var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);
        
        if(filename == "." || filename == "..") {
            // pass these files
        } else if(stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    leaveRootDirectory || fs.rmdirSync(dir);
};

function getArgumentValue(arg, defaultValue) {
    var result = defaultValue,
        args = process.argv,
        i;
    //args[0] =='node', args[1] == path, args[2 + i] = params
    for (i = 2; i < args.length; i++) {
        if (args[i].indexOf('--' + arg + '=') == 0) {
            result = args[i].split('=')[1];
            break;
        }        
    }
    return result;
}

function getCoverage() {
    var coverage = JSON.parse(fs.readFileSync('specs/coverage/coverage.json')),
        keys = [],
        sum = {name:'sum', s:0, sl:0, sp:0, f:0, fl:0, fp:0, b:0, bl:0, bp:0, l:0, ll:0, lp:0};
    Object.keys(coverage).forEach(function(key) {
        keys.push(calculateCoverage(key, coverage[key]) );
    });
    keys.forEach(function(cov) {
        sum.s+=cov.s;
        sum.sl+=cov.sl;
        sum.f+=cov.f;
        sum.fl+=cov.fl;
        sum.b+=cov.b;
        sum.bl+=cov.bl;
        sum.l+=cov.l;
        sum.ll+=cov.ll;
    });
    sum.sp = sum.s / sum.sl;
    sum.fp = sum.f / sum.fl;
    sum.bp = sum.b / sum.bl;
    sum.lp = sum.l / sum.ll;
    sum.avg = ((sum.sp + sum.fp + sum.bp + sum.lp) / 4);
    //keys.push(sum);
    return sum;
}

function calculateCoverage(filename, obj) {
    var s=0, sl = obj.s ? Object.keys(obj.s).length : 0, //statements
        f=0, fl = obj.f ? Object.keys(obj.f).length : 0, //functions
        b=0, bl = 0, //branches has sub-arrays that needs to be calculated
        l=0, ll = obj.l ? Object.keys(obj.l).length : 0; //lines

    Object.keys(obj.s).forEach(function(key) {
        s += obj.s[key] && 1;
    });
    Object.keys(obj.f).forEach(function(key) {
        f += obj.f[key] && 1;
    });
    Object.keys(obj.b).forEach(function(key) {
        obj.b[key].forEach(function(v){
            b += v && 1;
            bl++;
        });
        //bl += obj.b[key].length;
    }); 
    Object.keys(obj.l).forEach(function(key) {
        l += obj.l[key] && 1;
    });           

    return {
        name: filename,
        s: s,
        sl: sl,
        f: f,
        fl: fl,
        b: b,
        bl: bl,
        l: l,
        ll: ll
    };
}

function coverageWord(c) {
    if(c >= 1) {
        return 'Unreal!';
    }
    if(c > 0.9) {
        return 'Awesome!';
    }
    if(c > 0.8) {
        return 'Pretty good!';
    }
    if(c > 0.8) {
        return 'Getting there...';
    }      
    if(c > 0.5) {
        return 'Approved...';
    }
    if(c > 0.2) {
        return 'You can do better than this..';
    }

    return 'This stinks!';
}
