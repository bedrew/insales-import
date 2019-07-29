$(() => {

    let $collections = $('[data-collections]')

    if ( $collections.length > 0 ) {

    let collections = $collections.data('collections')

    collections.forEach(function (o) {
      delete Object.assign(o, { ['parent']: o['parent_id'] })['parent_id'];
      delete Object.assign(o, { ['text']: o['title'] })['title'];
      if (o.parent == null) o.parent = "#"
    })

    $collections.jstree({
      'plugins': ['checkbox'],
      'checkbox': {
        "cascade_to_disabled": false,
        'three_state': false
      },
      'core': {
        'data': collections
      }

    })

    $collections.on('changed.jstree', function (e, data) {

      let current_ids = []

      data
        .instance
        .get_selected(true)
        .forEach(function (i) {
          current_ids.push(i.id)
        })

      $('[data-selected]').html(`Всего выбранно ${current_ids.length} категорий на экспорт`)
      $('[data-selected-input]').val(current_ids)

    })

    $collections.on('click', '.jstree-icon', function (e) {
      $collections.jstree(true).toggle_node(e.target.nextSibling);
    })

    $(document).on('click', '.select-all-tree', function (e) {

      $(this).toggleClass('checked_all')

      if ( $(this).hasClass('checked_all') ) {
        $collections.jstree(true).check_all()
      } else {
        $collections.jstree(true).uncheck_all()
      }
      
    }).on('click', '.submit-tree', async function (e) {

      $('.request-result').jsonViewer(
        await $.post(
          location.pathname, $('form').serialize()),{collapsed: true}
        );
      
    })
  }


  })
