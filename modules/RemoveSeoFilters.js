const request = require("request-promise");

const GetSeoFilters = require('./GetSeoFilters');

let RemoveSeofilters = async ( task, collections ) => {

    let filters = API.chunk(
        ( await GetSeoFilters( task , collections.map( collection => collection.id ) ) )
           .map( filter => filter.id )
    )

    for ( let pack of filters ) {

        for ( let collection of pack ) {
            
            let options = {
                method: 'DELETE',
                url: `http://${task.shopurl}/admin/collection_filters/${collection}.json`,
                auth: { user: task.apikey, password: task.password },
                headers: {'Cache-Control': 'no-cache','Content-Type': 'application/json'},
                json: true
            }
            
            console.log( await API.request( options ) )

        }

        if ( filters.length > 1 ) 
            await API.timeout()

    }

    return false;

}


module.exports = RemoveSeofilters;