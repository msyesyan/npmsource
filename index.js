#!/usr/bin/env node
const program = require('commander');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');

const homedir = require('os').homedir();
const npmsourceHome = `${homedir}/.npmsource`;

function fetch(module, others=[], options) {
  let modules = [module, ...others].filter(Boolean);
  if (modules.length === 0) {
    let packageFile = options.package;
    if (packageFile && fs.existsSync(path.resolve(packageFile))) {
      let packages = require(path.resolve('./package.json'));
      modules = [...modules, ...Object.keys(
        Object.assign({}, packages.dependencies, (options.all || options.dev) ? packages.devDependencies : {}, (options.all || options.peer) ? packages.peerDependencies : {})
      )];
    }
  }
  shell.mkdir('-p', npmsourceHome);
  modules.forEach(module => {
    shell.exec(`npm view ${module} repository --json`, { async: true, silent: true }, (code, stdout, stderr) => {
      let repo = stdout && JSON.parse(stdout);
      if (repo && repo.type === 'git' && repo.url) {
        let moduleDir = `${npmsourceHome}/${module}`;
        if (fs.existsSync(moduleDir)) {
          shell.cd(moduleDir);
          shell.exec('git pull');
        } else {
          shell.exec(
            `git clone https://${repo.url.split('//')[1]} ${moduleDir}`,
            { async: true },
            (code, stdout, stderr) => { console.log(stdout); }
          );
        }
      }
    })
  });
}

program
  .version('0.0.1')

program
  .command('fetch [module] [others...]')
  .description('fetch node module source code')
  .option('-p, --package [path]', 'file path of package.json')
  .option('-a, --all', 'fetch all dependencies, work when --package')
  .option('-d, --dev', 'fetch devDependencies, work when --package')
  .option('-P, --peer', 'fetch peerDependencies, work when --package')
  .action(fetch);

program
  .command('edit [module]')
  .description('alias for npm edit, only work for ./node_modules')
  .action((module) => { shell.exec(`npm edit ${module}`) });

program
  .command('browse [module]')
  .description('alias of npm repo')
  .action((module) => { shell.exec(`npm repo ${module}`) });

program
  .command('open [module]')
  .description('open soruce code of module')
  .option('-e, --editor', 'editor, default will be atom', 'atom')
  .action((module, options) => {
    shell.cd(`${npmsourceHome}/${module}`);
    let editor = options.editor || 'atom';
    shell.exec(`${editor} .`);
  })

program
  .command('checkout <module> <tag|commit>')
  .alias('co')
  .description('checkout module version by git tag or commit hash')
  .action((module, version) => {
    shell.cd(`${npmsourceHome}/${module}`);
    shell.exec(`git checkout ${version}`);
  })

program.parse(process.argv);
