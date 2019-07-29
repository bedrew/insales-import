const Router = require('koa-router')
const fs = require('fs-extra')
const router = new Router()

fs.readdirSync(__dirname).forEach( file => {

    if ( file == "routes.js") return;

    var name = file.substr(0, file.indexOf('.'));

    require(`${__dirname}/${name}`)(router);

});


module.exports = router