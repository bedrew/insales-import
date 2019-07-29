const fs = require('fs-extra')
const Koa = require('koa')
const XLSX = require('xlsx')
const loader = new Koa();
const views = require('koa-views')
const serve = require('koa-static');
const router = require('./routes/routes');
const request = require("request-promise");
const bodyParser = require('koa-body');

global._ = require('lodash');
global.tasks = {}
global.Excel = {}
global.API = {}

tasks.export = function( Stringify = false ) {

  let _tasks = JSON.parse(JSON.stringify(this))

  delete _tasks.export

  for (let task in _tasks) {
    delete _tasks[task].shopurl
    delete _tasks[task].collections
    delete _tasks[task].file
  }

  if ( Stringify ) {
    return JSON.stringify(_tasks);
  } else {
    return _tasks
  }

}

Excel.JsontoArrays = json => {

  //to make excel file 

  let Array = []

  let RowTitle = Object.keys(json[0])

  Array.push(RowTitle)

  for (let item of json) {

    let row = [];

    for (entry of Object.entries(item)) {
      row.push(entry[1])
    }

    Array.push(row)
  }

  return Array;

}

Excel.MakeFile = async function( data , task ) {

  if ( data.length == 0 ) return false

  let ws_name = "SheetJS"
  let wb = XLSX.utils.book_new()
  let ws = XLSX.utils.aoa_to_sheet(this.JsontoArrays(data));
  let info = task.queue[Object.keys(task.queue)[0]].info.replaceAll(' ','_')
  
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  await fs.ensureDir(`${__dirname}/files`)

  XLSX.writeFile(
    wb,
    `${__dirname}/files/${task.shopurl}___${FormatDate(new Date())}___${info}.xlsx`
  )

}

Excel.ReadFile = async ( task ) =>{

  let workbook = XLSX.read(
    await fs.readFile(task.file.path, { encoding: null }),
   { type: 'buffer' }
  );

  return XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]], { header: 1 }
  );

}

global.API.GET = {
  method: 'GET',
  headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'application/json' },
  json: true
}

API.settings = {
  page_size: 250,
  timeout: 400000,
  pack_size: 450
}

API.timeout = function () {
  return new Promise(r => setTimeout(r, this.settings.timeout))
}

API.timeCalculate = function( array , type ) {

  if ( type == 'export' ) {
    return Math.round(
      ( this.chunk(array).length  * this.settings.timeout) / 60000
    )
  }

  if ( type == 'import' ) {
    return Math.round(
      ( ( array.length / this.settings.pack_size ) * this.settings.timeout ) / 60000
    )
  }

}

API.request = async function( options ) {

  let response = null

  try {
    response = await request( options);
  } catch (e) {
    console.log(e)
    await this.timeout();
    response = await request( options );
  }

  return response;
}

API.PageIteration = async function (options) {

  let page_count = 2;
  let pages = [];

  let _iteration = async () => {

    options.url += `&page=${page_count}`

    page_count += 1

    let page = await this.request( options )

    if (page.length == this.settings.page_size) {

      pages.push(page);

      await _iteration();

    } else {
      pages.push(page);
    }

  }

  await _iteration()

  return _.flatten(pages)

}

API.chunk = function( array ){
  return _.chunk( array , this.settings.pack_size )
}

global.uniqueID = () => {
  function chr4() {
    return Math.random().toString(16).slice(-4);
  }
  return chr4() + chr4() +
    '-' + chr4() +
    '-' + chr4() +
    '-' + chr4() +
    '-' + chr4() + chr4() + chr4();
}

global.FormatDate = date => {

  let minutes = date.getMinutes()
  let Month = date.getMonth()
  let seconds = date.getSeconds()

  if (minutes < 10) {
    minutes = '0' + date.getMinutes()
  }

  if (Month < 10) {
    Month = '0' + date.getMonth()
  }

  return `${date.getDate()}.${Month}.${date.getFullYear()}...${date.getHours()}-${minutes}-${seconds}`

}

String.prototype.replaceAll = function(search, replacement) {
  return this.split(search).join(replacement);
};

loader.use(serve(`${__dirname}/files`));

loader.use(
  bodyParser({
    formidable: { uploadDir: `${__dirname}/uploads` },
    multipart: true,
    urlencoded: true,
    formLimit: 100000
  })
);


loader.use(views(`${__dirname}/views`, { extension: 'pug' }))
loader.use(router.routes())
loader.use(router.allowedMethods())
loader.listen(3000);