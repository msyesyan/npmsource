# npmsource - gem-open like command line tools for npm

## preparation

* os/Linux
* git
* node

## install

### Manual

```
git clone git@github.com:msyesyan/npmsource.git
cd npmsource
npm install -g
npm link
```

### NPM

 `npm install -g npmsource`

## Usage

```
Usage: npmsource [options] [command]
  Commands:

    fetch [options] [module] [others...]  fetch node module source code
    edit [module]                         alias for npm edit, only work for ./node_modules
    browse [module]                       alias of npm repo
    open [options] [module]               open soruce code of module
    checkout|co <module> <tag|commit>     checkout module version by git tag or commit hash

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```
