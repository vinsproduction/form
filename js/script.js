var scroll;

$.datepicker.regional.ru = {
  closeText: "Закрыть",
  prevText: "&#x3C;Пред",
  nextText: "След&#x3E;",
  currentText: "Сегодня",
  monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  monthNamesShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
  dayNames: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
  dayNamesShort: ["вск", "пнд", "втр", "срд", "чтв", "птн", "сбт"],
  dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  weekHeader: "Нед",
  dateFormat: "yy-mm-dd",
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: ""
};

$.datepicker.setDefaults($.datepicker.regional['ru']);

scroll = function(el) {
  var $options, $select, $selected, browserMobile, scrollbar;
  $select = el;
  $selected = $select.find('[data-selected]');
  $options = $select.find('[data-options]');
  if (!$select.find('.scrollbar').size()) {
    $options.wrapInner("<div class=\"viewport\"><div class=\"overview\"></div></div>");
    $options.prepend("<div class=\"scrollbar\"><div class=\"track\"><div class=\"thumb\"><div class=\"end\"></div></div></div></div>");
  }
  browserMobile = false;
  scrollbar = $options.tinyscrollbar({
    sizethumb: 40,
    wheel: (browserMobile ? 2 : 40),
    invertscroll: browserMobile
  });
  $selected.click(function() {
    return scrollbar.tinyscrollbar_update();
  });
  return scrollbar.tinyscrollbar_update();
};

$(function() {
  var $form, fields, fieldsOptions;
  window.forms = {};
  $form = $('.form');
  fields = {
    'id': false,
    'login': {
      placeholder: 'login',
      rules: {
        required: true
      }
    },
    'password-confirmation': {
      rules: {
        compare: {
          field: 'login',
          reason: 'Не совпадает с полем {field}'
        }
      }
    },
    'dropdown': {
      placeholder: 'Выбрать',
      style: true,
      rules: {
        required: {
          not: 'Выбрать'
        }
      }
    }
  };
  fieldsOptions = {
    style: true,
    clearErrorsInFocus: true,
    autoErrors: true,
    escape: true,
    rules: {
      required: true
    }
  };
  window.forms['form-1'] = new Form({
    logs: true,
    autoFields: true,
    disableSubmit: false,
    formName: 'test form',
    formEl: $form,
    submitEl: $form.find('.submit a'),
    fields: fields,
    fieldsOptions: fieldsOptions,
    onInit: function() {
      var self;
      self = this;
      this.fields['test'].activate(false);
      this.fields['date'].el.datepicker();
      this.fields['phone'].el.mask("+7 (999) 999-99-99");
      this.form.on('Click', '[data-field]', function(e, field) {
        return console.log('click', field);
      });
      this.form.on('Reset', '[data-field]', function(e, field) {
        return console.log('reset', field);
      });
      this.form.on('Error', '[data-field]', function(e, field) {
        return console.log('error', field);
      });
      this.form.on('Change', '[data-field]', function(e, field) {
        return console.log(' change', field);
      });
      this.form.on('Style', '[data-field]', function(e, field) {
        return console.log('style', field);
      });
      return this.form.on('Style', '[data-field][data-type="select"]', function(e, field) {
        scroll(field.sel);
      });
    },
    onSubmit: function(data) {
      return $form.find('.errors').empty();
    },
    onSuccess: function(data) {
      this.submit(false);
      return this.preloader(true);
    },
    onFail: function(errors) {
      return $form.find('.errors').html("Исправьте ошибки в форме");
    },
    onReset: function() {
      this.submit(true);
      this.preloader(false);
      return $form.find('.errors').empty();
    }
  });
  window.addfield = function() {
    var clone, fieldName;
    clone = forms['form-1'].form.find('.example').eq(0).clone();
    fieldName = Date.now();
    clone.find('.label .name').html(fieldName);
    clone.find('.error').removeAttr('class').addClass('error error-' + fieldName);
    clone.find('select').attr('name', fieldName);
    clone.show();
    clone.addClass('new');
    $form.find('.error-list').before(clone);
    clone.find('.remove').click(function() {
      $(this).parents().eq(1).remove();
      forms['form-1'].removeField(fieldName);
      return false;
    });
    return forms['form-1'].addField(fieldName, {
      placeholder: "Выбрать",
      rules: {
        required: {
          not: 'Выбрать',
          reason: 'Своя ошибка'
        }
      },
      onInit: function() {
        forms['form-1'].fields[fieldName].el.on('Change', function(e, field) {
          return console.log('change new', field.val);
        });
        return forms['form-1'].fields[fieldName].el.on('Style', function(e, field) {
          return console.log('style new', field.name);
        });
      }
    });
  };
  window.reset = function() {
    forms['form-1'].reset();
    return forms['form-1'].form.find('.example.new').remove();
  };
});
