
$(()=>{

    ClickEvents.redirect = function(){
        
      $('[name="redirect"]').val($(this).data('redirect'))
      
      if ( !$(this).data('import') ) {
          $('#import-document').prop("disabled",true)
      }

      console.log(this)

      document
        .querySelector('form')
         .submit()
    }

    $(document).on("click","[data-redirect]",  ClickEvents.redirect )


})  