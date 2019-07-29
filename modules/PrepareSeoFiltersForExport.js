const GetProperties = require('./GetProperties');
const GetOptions = require('./GetOptions');

let PrepareSeoFilters = async (filters, collections, task) => {

    let InsertCollections = () => {
        for (let collection of collections) {
            for (let filter of filters) {
                if (filter.collection_id == collection.id) {
                    filter.collection_url = collection.url
                    filter.collection_title = collection.title
                }
            }
        }
    }
    let formatHelpers = {
        CountReducer(Count) {
            for ( let property in Count ) {

                let max = 0;

                for ( let filter in Count[property] ) {
                    if ( Count[property][filter] > max )
                        max = Count[property][filter]
                }

                Count[property] = max
            }
            return Count;
        },
        CountIncrement( Count, obj , Filter ) {
            if ( Count[obj.title] ) {
                if ( Count[obj.title][Filter.id] ) {
                    Count[obj.title][Filter.id] += 1
                } else {
                    Count[obj.title][Filter.id] = 1
                }
            } else {
                Count[obj.title] = {[Filter.id]:1}
            }
        },
        insertEmptyObj( obj, filter, type ){
            for ( let count in obj ) {
                if ( obj[count] > 1 ) {
                    for (let i = 2; i < ( obj[count] + 1 ); i++) { 
                        filter[`${type} ${count}-${i}`] = null
                    }
                }
            }
        },
        insertNotEmptyObj( obj, char, inserted, filter, type ) {
            if ( inserted.length > 0 ) {
                filter[`${type} ${obj.title}-${inserted.length + 1}`] = char.title
            } else {
                filter[`${type} ${obj.title}`] = char.title
            }
            inserted.push(obj.title)
        },
        objectIterator( filters, obj , callback ){
            for ( let filter of filters ) {
                for ( let element of obj )
                    callback(element,filter)
            }
        },
        buildEntries( type, Entries, filters ){
            
            /* 
                removing empty colums with properties || options &&
                build structure to normalize object for export
            */

            let NotEmptyEntries= [];

            let EntriesCount = {};

            if ( type == "option" ) {
                this.objectIterator( filters, Entries, ( option, filter )=>{
                    for ( let option_value of filter.option_values ) {
                        if ( option_value.option_name_id == option.id ) {
                            NotEmptyEntries.push( option )
                            this.CountIncrement( EntriesCount, option, filter )
                        }
                    }
                })
            } else {
                this.objectIterator( filters, Entries, ( property, filter )=>{
                    for ( let char of filter.characteristis ) {
                        if (char.property_id == property.id) {
                            NotEmptyEntries.push( property )
                            this.CountIncrement( EntriesCount, property, filter )
                        }
                    }
                })
            }

            return {
                Entries: NotEmptyEntries,
                EntriesCount : this.CountReducer(EntriesCount)
            }
        }
    }

    let formatCharacteristics = async (task) => {


        let ChangeFilters = scope =>{

            /* 
               normalize object with adding same properties to all filters
            */

            for ( let filter of filters ) {

                formatHelpers.insertEmptyObj( scope.EntriesCount, filter, 'Параметр' )

                for (let property of scope.Entries ) {

                    let AlreadyInserted = [];

                    filter[`Параметр ${property.title}`] = null

                    for (let char of filter.characteristis) {
                        if (char.property_id == property.id) {
                            formatHelpers.insertNotEmptyObj(
                                property, char, AlreadyInserted , filter , 'Параметр' 
                            )
                        }
                    }

                }
                delete filter.characteristis 
            }

        }

        let properties = formatHelpers.buildEntries('property', await GetProperties( task ), filters )

        ChangeFilters( properties )

    }

    let formatOptions = async (task) => {

        let ChangeFilters = scope =>{

            /* 
               normalize object with adding same properties to all filters
            */

            for ( let filter of filters ) {

                formatHelpers.insertEmptyObj( scope.EntriesCount, filter, 'Свойство' )

                for (let option of scope.Entries ) {

                    let AlreadyInserted = [];

                    filter[`Свойство ${option.title}`] = null

                    for ( let option_value of filter.option_values ) {
                        if ( option_value.option_name_id == option.id ) {
                            formatHelpers.insertNotEmptyObj(
                                option, option_value, AlreadyInserted , filter , 'Свойство' 
                            )
                        }
                    }

                }
                delete filter.option_values 
            }

        }

        let options = formatHelpers.buildEntries('option', await GetOptions( task ), filters )

        ChangeFilters( options )

    }

    InsertCollections();
    await formatCharacteristics( task );
    await formatOptions( task )
}


module.exports = PrepareSeoFilters;