#!/usr/bin/env node
const program = require('commander');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');

function fetch(module, others=[]) {
  let modules = [module, ...others].filter(Boolean);
  if (modules.length === 0) {
    if (fs.existsSync(path.resolve('./package.json'))) {
      let packages = require(path.resolve('./package.json'));
      modules = [...modules, ...Object.keys(packages.dependencies)];
    }
  }
  shell.mkdir('-p', '~/.npmsource');
  modules.forEach(module => {
    shell.exec(`npm view ${module} repository --json`, { async: true, silent: true }, (code, stdout, stderr) => {
      let repo = stdout && JSON.parse(stdout);
      if (repo && repo.type === 'git' && repo.url) {
        shell.exec(
          `git clone https://${repo.url.split('//')[1]} ~/.npmsource/${module}`,
          { async: true },
          (code, stdout, stderr) => { console.log(stdout); }
        );
      }
    })
  });
}

program
  .version('0.0.1')

program
  .command('fetch [module] [others...]')
  .description('fetch node module source code')
  .option('-p, --package [path]', 'file path of package.json', './package.json')
  .action(fetch);

program.parse(process.argv);
