const request = require("request-promise");

let GetOptions = async ( task ) =>{

    let options = {
        method: 'GET',
        url: `http://${task.shopurl}/admin/option_names.json?per_page=250`,
        auth: { user: task.apikey, password: task.password },
        headers: {'Cache-Control': 'no-cache','Content-Type': 'application/json'},
        json: true
    }

    let book = await request(options)
    let pageSize = API.settings.page_size;

    if ( book.length == pageSize ) {
        book = _.concat( book , await API.PageIteration(options) )
    } 

    return book
}

module.exports = GetOptions;