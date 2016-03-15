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
        required: true,
        alpha: true,
        max: {
          count: 4
        },
        min: {
          count: 2
        }
      }
    },
    'password-confirmation': {
      rules: {
        compare: {
          val: function() {
            return $form.find('input[name="password"]').val();
          },
          reason: 'Не совпадает с полем password'
        }
      },
      onError: function(name, errors) {
        return $form.find("[name='password']").addClass('error-field');
      }
    },
    'dropdown': {
      placeholder: 'Выбрать',
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
      this.form.on('change', '[data-field][data-name="dropdown"]', function(e, data) {});
      this.form.on('style', '[data-field][data-name="dropdown"]', function(e, sel) {});
      return this.form.on('style', '[data-field][data-type="select"]', function(e, sel) {
        scroll(sel);
      });
    },
    onSubmit: function(data) {
      return $form.find('.errors').empty();
    },
    onSuccess: function(data) {
      this.lockSubmit();
      return this.showPreloader();
    },
    onFail: function(errors) {
      return $form.find('.errors').html("Исправьте ошибки в форме");
    },
    onReset: function() {
      this.unlockSubmit();
      this.hidePreloader();
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
      forms['form-1'].removeField(fieldName);
      return false;
    });
    return forms['form-1'].addField({
      name: fieldName,
      options: {
        placeholder: "Выбрать",
        rules: {
          required: {
            not: 'Выбрать',
            reason: 'Своя ошибка'
          }
        }
      },
      onInit: function() {
        forms['form-1'].fields[fieldName].el.on('change', function(e, v) {
          return console.log('change new', v.val);
        });
        return forms['form-1'].fields[fieldName].el.on('style', function(e, sel) {
          return console.log('style new');
        });
      }
    });
  };
  window.reset = function() {
    forms['form-1'].reset();
    return forms['form-1'].form.find('.example.new').remove();
  };
});
