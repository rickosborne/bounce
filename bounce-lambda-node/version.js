'use strict';

require('child_process').exec('git rev-parse --short HEAD', function (err, stdout, stderr) {
  require('console').log(require('./package.json').version + '-' + String(stdout).replace(/^\s+|\s+$/g, ''));
});

