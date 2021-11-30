# CRM front end

## Installation

### Clone repo

``` bash
# clone the repo
$ git clone <reposit origin> my-project

# go into app's directory
$ cd my-project

# install app's dependencies
$ npm install
```

### Basic usage

``` bash
# dev server  with hot reload at http://localhost:3000
$ npm start
```

Navigate to [http://localhost:3000](http://localhost:3000). The app will automatically reload if you change any of the source files.

### Build

Run `build` to build the project. The build artifacts will be stored in the `build/` directory.

```bash
# build for production with minification
$ npm run build
```

## Project structure

```
CoreUI-React#v2.0.0
├── public/          #static files
│   ├── assets/      #assets
│   └── index.html   #html temlpate
│
├── src/             #project root
│   ├── actions/     #action source
│   ├── containers/  #container source
│   ├── constants/   #all common constants
│   ├── scss/        #user scss/css source
│   ├── views/       #views source
│   ├── store/       #redux store source
│   ├── App.js
│   ├── App.test.js
│   ├── agentConnect.js
│   ├── _nav.js      #sidebar config
│   └── routes.js    #routes config
│
└── package.json
```

## Reference

The UI is referenced from CoreUI so that we can fetch/use existing feature of CoreUI.
CoreUI Template is hosted at our website [CoreUI for React](https://coreui.io/react/)
