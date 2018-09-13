/*
 * note that some of the tasks defined here may not be used in EVERY project
 * I build.
 *
 * @todo figure out how to rtlcss, cssmin and ugligy things in vendor (since some of those
 *       packages don't do that in their official distributions)
 */

/**
 * Extract dependencies from package.json for use in a 'src:' property of a task
 *
 * @param {object} pkg The parsed package.json
 * @returns array
 *
 * @link https://stackoverflow.com/a/34629499/7751811
 */
function getDependencies( pkg ) {
	'use strict';

	if ( ! pkg.hasOwnProperty( 'dependencies' ) ) {
		return [];
	}

	return Object.keys( pkg.dependencies ).map( function( val ) {
		return 'node_modules/' + val + '/**';
	} );
}

module.exports = function( grunt ) {
	'use strict';

	var pkg = grunt.file.readJSON( 'package.json' );

	// Project configuration.
	grunt.initConfig( {
        pkg: pkg,

        // cleanup
        clean: {
            build: ['<%= pkg.name %>', '<%= pkg.name %>.zip', 'assets/**/*.min.*', 'assets/css/**/*-rtl.css'],
            release: ['<%= pkg.name %>'],
        },

        // minify JS files
        uglify: {
            build: {
	            files: [
	            	{
		                expand: true,
		                src: ['assets/js/**/*.js', '!assets/js/**/*.min.js'],
		                dest: '.',
		                ext: '.min.js',
		            	}
	            ],
            },
        },

        // create RTL CSS files
        rtlcss: {
            options: {
                // borrowed from Core's Gruntfile.js, with a few mods
                // 1. reformated (e.g., [\n\t{ -> [ {, etc)
                // 2. dashicon content strings changed from '"\\f140"'
                //    to "'\\f140'", etc
                opts: {
                    clean: false,
                    processUrls: {
                        atrule: true,
                        decl: false,
                    },
                    stringMap: [
                    	{
                            name: 'import-rtl-stylesheet',
                            priority: 10,
                            exclusive: true,
                            search: ['.css'],
                            replace: ['-rtl.css'],
                            options: {
                                scope: 'url',
                                ignoreCase: false
                            },
                    	},
                    ],
                },
                plugins: [
                	{
                        name: 'swap-dashicons-left-right-arrows',
                        priority: 10,
                        directives: {
                            control: {},
                            value: []
                        },
                        processors: [
                        	{
	                            expr: /content/im,
	                            action: function( prop, value ) {
		                            if ( value === "'\\f141'" ) { // dashicons-arrow-left
			                            value = "'\\f139'";
		                            }
		                            else if ( value === "'\\f340'" ) { // dashicons-arrow-left-alt
			                            value = "'\\f344'";
		                            }
		                            else if ( value === "'\\f341'" ) { // dashicons-arrow-left-alt2
			                            value = "'\\f345'";
		                            }
		                            else if ( value === "'\\f139'" ) { // dashicons-arrow-right
			                            value = "'\\f141'";
		                            }
		                            else if ( value === "'\\f344'" ) { // dashicons-arrow-right-alt
			                            value = "'\\f340'";
		                            }
		                            else if ( value === "'\\f345'" ) { // dashicons-arrow-right-alt2
			                            value = "'\\f341'";
		                            }

		                            return {
		                                prop: prop,
		                                value: value
		                            };
	                            },
	                        }
                        ],
                    }
                ],
            },
            build: {
                files: [
                	{
	                    expand: true,
	                    src: ['assets/css/**/*.css',
	                        '!assets/css/**/*-rtl.css',
	                        '!assets/css/**/*.min.css'],
	                    dest: '.',
	                    ext: '-rtl.css',
	                	}
                ],
            },
        },

        // SASS pre-process CSS files
        sass: {
            options: {
                style: 'expanded',
            },
            build: {
                files: [
                	{
	                    expand: true,
	                    src: ['assets/css/**/*.scss'],
	                    dest: '.',
	                    ext: '.css',
                	}
                ],
            },
        },

        // minify CSS files
        cssmin: {
            build: {
	            files: [
	            	{
		                expand: true,
		                src: ['assets/css/**/*.css',
		                    '!assets/css/**/*.min.css'],
		                dest: '.',
		                ext: '.min.css',
	            	}
	            ],
            },
        },

        // copy files from one place to another
        copy: {
            release: {
                expand: true,
                src: ['plugin.php', 'readme.txt', 'assets/**', 'includes/**', 'utils/**', 'languages/**',
                    '!assets/css/**/*.scss', '!languages/*.*~'],
                dest: '<%= pkg.name %>',
            },
            node_modules: {
                expand: true,
                src: getDependencies( pkg ),
                dest: 'vendor',
                rename: function( dest, src ) {
                    return dest + '/' + src.substring( src.indexOf( '/' ) + 1 );
                },
            },
        },

        // package into a zip
        zip: {
            build: {
                expand: true,
                cwd: '.',
                src: '<%= pkg.name %>/**',
                dest: '<%= pkg.name %>.<%= pkg.version %>.zip',
            },
        },

        replace: {
            version_readme_txt: {
                src: ['readme.txt'],
                overwrite: true,
                replacements: [
                	{
                        from: /^(Stable tag:) (.*)/m,
                        to: '$1 <%= pkg.version %>',
                	},
                ],
            },
            version_plugin: {
                src: ['plugin.php'],
                overwrite: true,
                replacements: [
                    // this is for the plugin_data comment
                    {
                        from: /^( \* Version:) (.*)/mg,
                        to: '$1 <%= pkg.version %>',
                    },
                    // this is for plugins that use a static class var
                    // instead of the dynamic $this->version that SHC Framework allows
                    {
                        from: /^(.*static \$VERSION =) '(.*)'/m,
                        to: "$1 '<%= pkg.version %>'",
                    },
                    // this is for plugins that use a class const
                    // instead of the dynamic $this->version that SHC Framework allows
                    {
                        from: /^(.*const VERSION =) '(.*)'/m,
                        to: "$1 '<%= pkg.version %>'",
                    },
                ],
            },
            plugin_uri: {
                src: ['plugin.php'],
                overwrite: true,
                replacements: [
                	// this is for the plugin_uri comment
                	{
                        from: /^( \* Plugin URI:) (.*)/m,
                        to: '$1 https:/github/pbiron/<%= pkg.name %>',
                	},
                	// this is for the github_plugin_uri comment
                	{
                        from: /^( \* GitHub Plugin URI:) (.*)/m,
                        to: '$1 https:/github/pbiron/<%= pkg.name %>',
                	},
                ],
            },
            description_readme_txt: {
                src: ['readme.txt'],
                overwrite: true,
                replacements: [
                	{
                        // note the look ahead. Also, the repeat on the
                        // newline char class MUST be {2,2}, using just {2} always
                        // fails
                        from: /.*(?=[\n\r]{2,2}== Description ==)/m,
                        to: '<%= pkg.description %>',
                	},
                ],
            },
            description_readme_md: {
                src: ['README.md'],
                overwrite: true,
                replacements: [
                	{
                        // note the look ahead. Also, the repeat on the
                        // newline char class MUST be {2,2}...{2} always
                        // fails
                        from: /.*(?=[\n\r]{2,2}## Description)/m,
                        to: '<%= pkg.description %>',
                	},
                ],
            },
            description_plugin: {
                src: ['plugin.php'],
                overwrite: true,
                replacements: [
                	{
                        from: /^( \* Description:) (.*)/m,
                        to: '$1 <%= pkg.description %>',
                	},
                ],
            },
            plugin_name_readme_txt: {
                src: ['readme.txt'],
                overwrite: true,
                replacements: [
                	{
                        from: /^=== (.*) ===/m,
                        to: '=== <%= pkg.plugin_name %> ==='
                	},
                ],
            },
            plugin_name_readme_md: {
                src: ['README.md'],
                overwrite: true,
                replacements: [
                	{
                        from: /^# (.*)/m,
                        to: '# <%= pkg.plugin_name %>',
                	},
                ],
            },
            plugin_name_plugin: {
                src: ['plugin.php'],
                overwrite: true,
                replacements: [
                    {
                        from: /^( \* Plugin Name:) (.*)/m,
                        to: '$1 <%= pkg.plugin_name %>',
                    },
                ],
            },
            license_uri_readme: {
                src: ['readme.txt'],
                overwrite: true,
                replacements: [
                	{
                        from: /^(License URL:) (.*)/m,
                        to: '$1 <%= pkg.license_uri %>',
                	},
                ],
            },
            license_uri_plugin: {
                src: ['plugin.php'],
                overwrite: true,
                replacements: [
                    {
                        from: /^( \* License URI:) (.*)/m,
                        to: '$1 <%= pkg.license_uri %>',
                    },
                ],
            },
            text_domain: {
                src: ['plugin.php'],
                overwrite: true,
                replacements: [
                    // this is for the text domain comment
                    {
                        from: /^( \* Text Domain:) (.*)/m,
                        to: '$1 <%= pkg.name %>',
                    },
                    // this is for __() and cousins
                    {
                        from: /<%= TextDomain %>/g,
                        to: '<%= pkg.name %>',
                    },
                ],
            },
        },

        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            assets: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['assets/**/*.js', '!assets/**/*.min.js']
            },
            tests: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['tests/**/*.js', '!tests/**/*.min.js']
            },
        },

        watch: {
        	css: {
        		files: ['assets/css/**/*.scss'],
        		tasks: ['sass'],
        		options: {
        			spawn: false,
        		},
        	},
        	js: {
        		files: ['assets/js/**/*.js', '!assets/js/**/*.min.js'],
        		tasks: ['jshint'],
        		options: {
        			spawn: false,
        		},
        	},
        },
    } );

	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-text-replace' );
	grunt.loadNpmTasks( 'grunt-rtlcss' );
	grunt.loadNpmTasks( 'grunt-zip' );

	grunt.registerTask( 'default', ['build'] );
	grunt.registerTask( 'build', ['clean', 'replace', 'copy:node_modules', 'sass', 'rtlcss', 'cssmin', 'uglify'] );

	grunt.registerTask( 'prerelease', ['jshint'] );
	grunt.registerTask( 'release', ['build', 'copy', 'zip:build', 'clean:release'] );
};
