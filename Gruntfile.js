module.exports = function(grunt) {

    function pad(n) {
        return (n < 10) ? ("0" + n) : n;
    }

    var tStart = new Date();
    tStart.setDate(tStart.getDate() - 1);

    var startStr = tStart.getFullYear() + '-' + (pad(tStart.getMonth() + 1)) + '-' + pad(tStart.getDate());

    var globalConfig = {
        months: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ],
        dateCollected: tStart,
        sorn: 'https://www.performance.service.gov.uk/data/sorn/realtime?start_at=' + startStr + 'T00%3A00%3A00%2B00%3A00&end_at=' + startStr + 'T23%3A59%3A59%2B00%3A00',
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        globalConfig: globalConfig,

        // CSS
        sass: {
            dev : {
                options: {
                    style: 'expanded'
                },
                files: {
                    'public/css/main.css': 'assets/scss/main.scss'
                }
            },
            dist : {
                options: {
                    style: 'compressed'
                },
                files: {
                    'public/css/main.css': 'assets/scss/main.scss'
                }
            } 
        },

        // JS
        concat: {
            dist: {
                // the files to concatenate
                src: [
                    'assets/js/vendor/jquery-2.0.3.js',
                    'assets/js/vendor/raphael.js',
                    'assets/js/vendor/g.raphael-min.js',
                    'assets/js/vendor/g.pie.js',
                    'assets/js/items/*.js',
                    'assets/js/main.js'
                ],
                // the location of the resulting JS file
                dest: 'public/js/app.js'
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= concat.dist.dest %>': ['<%= concat.dist.dest %>']
                }
            }
        },
        
        clean: ["public/css/*", "public/js/*"],

        hashres: {
          options: {
            fileNameFormat: '${name}-${hash}.${ext}'
          },
          prod: {
            src: [
              'public/js/app.js',
              'public/css/main.css'],
            dest: 'public/index.html',
          }
        },
    
        watch: {
            scripts: {
                files: ['assets/js/*.js', 'assets/js/items/*.js'],
                tasks: ['concat', 'hashres'],
                options: {
                    spawn: false,
                },
            },
            css: {
                files: ['assets/scss/*.scss'],
                tasks: ['sass:dev', 'hashres'],
                options: {
                    spawn: false,
                }
            }
        },

        smoosher: {
            options: {
                jsTags: { // optional
                    start: '<script type="text/javascript">', // default: <script>
                    end: '</script>'                          // default: </script>
                },
            },
            all: {
                files: {
                    'public/offline-index.html': 'public/index.html',
                },
            },
        },

        curl: {
            'public/data/sorn-users.json': '<%= globalConfig.sorn %>',
            'public/data/satisfaction.json': 'https://www.performance.service.gov.uk/data/vehicle-licensing/customer-satisfaction?limit=1&sort_by=_id%3Adescending'
        },

        appendData: {
            files: ['public/data/*.json']
        },
    
    });
    
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-hashres');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-html-smoosher');
    grunt.loadNpmTasks('grunt-curl');

    
    grunt.registerTask('default', ['watch']);
    
    grunt.registerTask('test', ['clean', 'sass:dev', 'concat', 'hashres']);
    grunt.registerTask('build', ['clean', 'sass:dist', 'concat', 'uglify', 'hashres']);

    grunt.registerMultiTask('appendData', 'Appends JSON data into the single offline document.', function() {

        var allTheThings = '<script type="text/javascript">\n';
        allTheThings += 'var offline = true;\n\n';

        this.files.forEach(function(file) {
            var items = file.src.map(function(filepath) {

                var jsonBlockName = filepath.split('/');
                jsonBlockName = jsonBlockName[jsonBlockName.length-1];
                jsonBlockName = jsonBlockName.replace(/[-\.]/g, "_");

                var jsonBlock = grunt.file.read(filepath);

                allTheThings += 'var ' + jsonBlockName + ' = ';
                allTheThings += jsonBlock;
                allTheThings += ';\n';

            });
        });

        allTheThings += '</script>\n';

        var existing = grunt.file.read('public/offline-index.html');
        var splitSrc = existing.split('<script type="text/javascript">');

        var newSrc = splitSrc[0] + '\n' + allTheThings + '\n' + '<script type="text/javascript">' + splitSrc[1];

        // add in some small print
        var small = '<small class="offline-demo">This offline demo uses data from ';
        small += globalConfig.dateCollected.getDate() + ' ' + globalConfig.months[globalConfig.dateCollected.getMonth()] + ' ' + globalConfig.dateCollected.getFullYear();
        small += '</small>';

        var landmark = 'Powered by www.gov.uk/performance';

        newSrc = newSrc.split(landmark);

        var finalSrc = '';

        for (var i=0; i<newSrc.length-1; i++) {
          finalSrc += newSrc[i] + landmark + '\n' + small + '\n';
        }
        finalSrc += newSrc[newSrc.length-1];
        

        grunt.file.write('public/offline-index.html', finalSrc);

    });

    grunt.registerTask('offline', 'Creates a single html file with everything inlined.', function() {
        
        grunt.log.writeln('Beginning offline build.');
        grunt.task.run('build');

        grunt.log.writeln('Inlining...');
        grunt.task.run('smoosher');

        grunt.log.writeln('Downloading and appending JSON data...');
        grunt.task.run('curl');
        grunt.task.run('appendData');

    });

};