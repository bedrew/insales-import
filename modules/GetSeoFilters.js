const request = require("request-promise");

let RequestHandler = async ( task , collections ) => {

        let filters = [];
        let pageSize = API.settings.page_size;

        collections = API.chunk( collections )

        // only array of collection ids
    
        for ( let pack of collections ) {

            let pages = []

            for ( let collection of pack ) {
                
                let options = {
                    method: 'GET',
                    url: `http://${task.shopurl}/admin/collection_filters.json?per_page=${pageSize}&collection_id=${collection}`,
                    auth: { user: task.apikey, password: task.password },
                    headers: {'Cache-Control': 'no-cache','Content-Type': 'application/json'},
                    json: true
                }
                
                let book = await API.request( options )
                
                if ( book.length == pageSize ) {
                    book = _.concat( book , await API.PageIteration(options) )
                } 

                pages.push(book)

            }

            filters.push( pages )

            if ( collections.length > 1 ) 
              await API.timeout()
           
        }
            
    return _.flattenDeep(filters)

}

module.exports = RequestHandler;