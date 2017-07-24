import * as gulp from 'gulp';
import * as prettier from 'gulp-plugin-prettier';
import * as prettier_options from 'tslint-config-ikatyang/prettier';

// tslint:disable-next-line:no-var-requires
const sources = require('./tsconfig.json').include;

gulp.task('format', () =>
  gulp
    .src(sources)
    .pipe(prettier.format(prettier_options, { filter: true }))
    .pipe(gulp.dest(file => file.base)),
);

gulp.task('format-check', () =>
  gulp
    .src(sources)
    .pipe(
      prettier.format(prettier_options, { reporter: prettier.Reporter.Error }),
    ),
);
