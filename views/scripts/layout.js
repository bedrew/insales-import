$(()=>{

    alertify.defaults.transition = 'zoom'

    ClickEvents = {}

    ClickEvents.alert = function(e){

        e.preventDefault();
        e.stopImmediatePropagation();

        let AlertInfo = $(this).data('alert')

        alertify.confirm(
            AlertInfo.title, 
            AlertInfo.message,
            ()=> {ClickEvents[AlertInfo.callback].call(this,e)},
            ()=> {}
        );
    }

    $(document).on('click','[data-alert]', ClickEvents.alert )

    $('[data-tasks]').jsonViewer(
        $('[data-tasks]').data('tasks'),
        {collapsed: true}
    );

    if ( $('.file-link.button').length > 0 ) {

    let files = []

    $('.file-link.button').each(function(){

        let _date = $(this).data('date')

        let date = _date.split('...')[0].split('.')
        let hours = _date.split('...')[1].split('-')

        files.push({
            element : this,
            date: new Date(date[2],date[1],date[0],hours[0],hours[1],hours[2])
        })

    })

    $('.files-body').empty()
    
    files.sort((a,b) => new Date(b.date) - new Date(a.date) );

    files.forEach(e=> $('.files-body').append( $(e.element) ) )
    }
$('.content-wrapper').addClass('ready')

})