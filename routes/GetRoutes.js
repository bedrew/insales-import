module.exports = function(router){

    const fs = require('fs-extra')
    const RemoveSeoFilters = require('../modules/RemoveSeoFilters');
    const GetProperties = require('../modules/GetProperties');
    const GetOptions = require('../modules/GetOptions');
    
    router.get('/', async ctx => {
        await ctx.render('index', {
            shop: tasks.export(),
        })
    }).get('/tasks', async ctx => {

        let files = await fs.readdir(`./files`)

        await ctx.render('files', {
            files: files,
            tasks: tasks.export()
        })

    }).get('/collections/import/:taskID', async ctx => {

        let shop = tasks[ctx.params.taskID]
        let task = shop.queue[Object.keys(shop.queue)[0]];

        if ( task.file ) {

            task.file.parsed = await Excel.ReadFile( task )

            await ctx.render('collections', {
                line: task.file.parsed[0],
            });

        } else {
            ctx.redirect('/');
        }

    }).get('/filters/import/:taskID', async ctx => {

        let shop = tasks[ctx.params.taskID]
        
        let task = shop.queue[Object.keys(shop.queue)[0]];
       
        task.file.parsed = await Excel.ReadFile( task )

        if (  task.file &&  task.file.parsed.length > 0 ) {

            let Properties = ( await GetProperties( shop ) ).map( property => property.title )

            let Options = ( await GetOptions( shop ) ).map( option => option.title )

            await ctx.render('filters_import', {
                    line: task.file.parsed[0],
                    Properties: Properties,
                    Options: Options
            });

        } else {
                ctx.redirect('/');    
        }

    }).get('/filters/remove/:taskID', async ctx => {

        let shop = tasks[ctx.params.taskID];
        let task = shop.queue[Object.keys(shop.queue)[0]];
        let taskID = uniqueID();

        shop.queue[taskID] = {
            info: "seo filters remove",
            time: `~ ${API.timeCalculate( shop.collections , 'export' )} minutes`,
            startTime: new Date().toLocaleString()
        }

        ctx.body = shop

        ctx.redirect('/tasks');

        // waiting for redirect needs fix

        await RemoveSeoFilters( shop, shop.collections )

        delete shop.queue[taskID]

    }).get('/filters/export/:taskID', async ctx => {

        let task = tasks[ctx.params.taskID]

        if (task) {
            await ctx.render('filters', {
                collections: task.collections,
                template: 'filters'
            });
        } else {
            ctx.redirect('/');
        }

    })

}
