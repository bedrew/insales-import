$(()=>{

    $(document).on('click', '.submit-import-config', async function (e) {

        $('.request-result').jsonViewer(
          await $.post(location.pathname, $('form').serialize()),
          {collapsed: true});
        
      })

})