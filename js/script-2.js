$(function() {
  var $form, fields;
  window.forms = {};
  $form = $('.form');
  fields = {
    'name-1': {},
    'name-2': {
      fieldGroup: 'group-1'
    },
    'name-3': {
      fieldGroup: 'group-1.group-2.group-3'
    },
    'name-4': {
      fieldGroup: 'group-1.group-2.group-3'
    },
    'name-5': {
      fieldGroup: 'group-2'
    }
  };
  window.forms['form-group'] = new Form({
    formName: 'test group',
    formEl: $form,
    submitEl: $form.find('.submit a'),
    autoFields: false,
    fields: fields,
    onSubmit: function(data) {
      return console.log('group', data);
    }
  });
});
