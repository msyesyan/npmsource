#!/usr/bin/env node
const program = require('commander');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');

function fetch(module, others=[]) {
  let modules = [module, ...others].filter(Boolean);
  if (modules.length === 0) {
    modules = ['angular'];
  }
  fs.existsSync('~/.npmsource', (exists) => {
    if (!exists) {
      shell.mkdir('~/.npmsource');
    }
  })
  modules.forEach(module => {
    shell.exec(`npm view ${module} repository --json`, { async: true, silent: true }, (code, stdout, stderr) => {
      let repo = stdout && JSON.parse(stdout);
      if (repo && repo.type === 'git' && repo.url) {
        shell.exec(`git clone https://${repo.url.split('//')[1]} ~/.npmsource/${module}`, { async: true }, (code, stdout, stderr) => {
          console.log(stdout);
        })
      }
    })
  });
}

program
  .version('0.0.1')

program
  .command('fetch [module] [others...]')
  .description('fetch node module source code')
  .action(fetch);

program.parse(process.argv);
