module.exports = function(router){

    const GetCollections = require('../modules/GetCollections');
    const GetSeoFilters = require('../modules/GetSeoFilters');
    const PrepareSeoFilters = require('../modules/PrepareSeoFiltersForExport');
    const ImportCollections = require('../modules/ImportCollections');
    const fs = require('fs-extra')

    router.post('/filters/export/:taskID', async ctx => {

        let task = tasks[ctx.params.taskID]
        let taskID = uniqueID();
        let collections = ctx.request.body.collections.split(',') 
        
        if ( Object.keys(task.queue).length > 1 ) {

            ctx.body = task
            ctx.res.end( tasks.export(true) );

        } else {

            task.queue[taskID] = {
                info: "seo filters export",
                time: `~ ${API.timeCalculate( collections , 'export' )} minutes`,
                startTime: new Date().toLocaleString()
            }

            ctx.body = task

            ctx.res.end( tasks.export(true) );

            let SeoFilters = await GetSeoFilters( task, collections )

            await PrepareSeoFilters( SeoFilters, task.collections, task )

            await Excel.MakeFile( SeoFilters, task )

            delete task.queue[taskID]

        }

    }).post('/collections/import/:taskID', async ctx => {

        let shop = tasks[ctx.params.taskID];

        let task = shop.queue[Object.keys(shop.queue)[0]]

        let ReqBody = ctx.request.body

        if (task.file) {

            task.file.relations = {}

            for (let field in ReqBody) {
                if (ReqBody[field] != '' && field.includes('field')) {
                    task.file.relations[ReqBody[field]] = parseInt(field.split("_")[1])
                }
            }

            task.info = {
                info: "import meta info of colllections",
                time: `~ ${API.timeCalculate( task.file.parsed, 'import' )} minutes`,
                startTime: new Date().toLocaleString()
            }

            ctx.body = shop

            ctx.res.end( tasks.export(true) );

            await ImportCollections(shop)

            delete shop.queue[Object.keys(shop.queue)[0]]

        } else {
            ctx.redirect('/');
        }


    }).post('/filters/import/:taskID', async ctx => {

        let shop = tasks[ctx.params.taskID];

        let task = shop.queue[Object.keys(shop.queue)[0]]

        let ReqBody = ctx.request.body

        if (task.file) {

            task.file.relations = {}

            for (let field in ReqBody) {
                if (ReqBody[field] != '' && field.includes('field')) {
                    task.file.relations[ReqBody[field]] = parseInt(field.split("_")[1])
                }
            }

            task.info = {
                info: "import seofilters",
                time: `~ ${API.timeCalculate( task.file.parsed, 'import' )} minutes`,
                startTime: new Date().toLocaleString()
            }

            ctx.body = shop

            ctx.res.end( tasks.export(true) );

            await ImportCollections(shop)

            delete shop.queue[Object.keys(shop.queue)[0]]

        } else {
            ctx.redirect('/');
        }


    }).post('/', async ctx => {

        let ReqBody = ctx.request.body

        tasks[ReqBody.shopurl] = {
            shopurl: ReqBody.shopurl,
            apikey: ReqBody.apikey,
            password: ReqBody.password,
            queue: {}
        }

        let task = tasks[ReqBody.shopurl];

        try {

            task.collections = await GetCollections(task)

            if (JSON.stringify(ctx.request.files) != '{}') {

                let file_link = Object.keys(ctx.request.files)[0];
                task.queue[uniqueID()] = {
                    file: {
                        path: ctx.request.files[file_link].path,
                        filename: ctx.request.files[file_link].name
                    }
                }
            }

            ctx.redirect(`/${ReqBody.redirect}/${ReqBody.shopurl}`)

        } catch (e) {

            delete tasks[ReqBody.shopurl];

            ctx.redirect(`/`)

        }

    }).post('/tasks', async ctx => {

        let CleanUpType = ctx.request.body.clean

        if ( CleanUpType == "files" ) {
            await fs.emptyDir(`${__dirname}/files`)
        }

        if ( CleanUpType == "tasks" ) {
        for ( let task in tasks ) {
            if ( tasks[task].queue && Object.keys( tasks[task].queue ).length == 0 )
                delete tasks[task]
        }
        }

        ctx.redirect(`/tasks`)

    })

}