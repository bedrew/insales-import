const request = require("request-promise");

let ImportCollections = async (task) => {

    let file = task.queue[Object.keys(task.queue)[0]].file

    let FileParts = _.chunk( file.parsed, API.settings.pack_size )

    for ( let part of FileParts ) {

        for ( let collection of part ) {

            let ReqBody = {collection:{}}

            for ( let relation in file.relations ) {
                ReqBody.collection[relation] = collection[file.relations[relation]]
            }

            let options = {
                method: 'PUT',
                url: `http://${task.shopurl}/admin/collections/${collection[file.relations['id']]}.json`,
                auth: { user: task.apikey, password: task.password },
                headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'application/json' },
                body: ReqBody,
                json: true
            }

            // if first line is text

            try {
                await request( options )
            } catch(e) {}

        }

        if ( FileParts.length > 1 ) 
              await API.timeout()

     }   

     return true;
}


module.exports = ImportCollections;