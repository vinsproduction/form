module.exports = function(grunt) {

	grunt.initConfig({


		stylus: {
			compile: {
				options: {
					compress: false,
				},
				files: {
					'css/form.css': 'ppc/form.styl',
				}
			}
		},


		jade: {
			compile: {
				options: {
					pretty: true,
					data: {
						debug: false
					}
				},
				files: [ {
          cwd: "ppc",
          src: "*.jade",
          dest: ".",
          expand: true,
          ext: ".html"
        } ]
			}
		},

		coffee: {
			compileBare: {
				options: {
       		bare: true
       	},
       	files: {
       		'js/form.js': 'ppc/form.coffee',
       		'js/script.js': 'ppc/script.coffee',
	    	}
    	}
		},

		uglify: {
			options: {
	      mangle: false
	    },
			js: {
				files: {
					'js/form.min.js': 'js/form.js',
				}
			}
		},



		watch: {
			options: {
				livereload: 777,
				dateFormat: function(time) {
					grunt.log.writeln('______ The watch finished in ' + time + 'ms at' + (new Date()).toString());
					grunt.log.writeln('______ Waiting for more changes...');
				},
			},


			stylus: {

				files: [
					'ppc/*.styl',
				],
				tasks: ['stylus']
			},

			jade: {
				files: [
					'ppc/*.jade',
				],
				tasks: ['jade']
			},

			coffee: {
				files: [
					'ppc/*.coffee',
				],
				tasks: ['coffee','uglify:js']
			},

			
		},
	});
	

	grunt.file.expand('node_modules/grunt-*/tasks').forEach(grunt.loadTasks);

	grunt.registerTask('default', ['coffee', 'stylus', 'jade', 'uglify', 'watch']);


};