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

$(function() {
  var $form, fields, fieldsOptions;
  $form = $('.form');
  fields = {
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
    'password': {
      rules: {
        required: true
      }
    },
    'password-confirmation': {
      rules: {
        compare: {
          val: function() {
            return $form.find('input[name="password"]').val();
          }
        }
      }
    },
    'phone': {
      rules: {
        required: true
      }
    },
    'date': {
      rules: {
        required: true
      }
    },
    'email': {
      rules: {
        required: true,
        email: true
      }
    },
    'text': {
      rules: {
        required: true
      }
    },
    'checkbox_1': {
      rules: {
        required: true
      }
    },
    'checkbox_2': {
      rules: {
        required: true
      }
    },
    'radiobutton': {
      rules: {
        required: true
      }
    },
    'dropdown': {
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
    escape: true
  };
  window.formValidator = new Form({
    logs: true,
    disableSubmit: false,
    formName: 'nice form',
    formEl: $form,
    submitEl: $form.find('.submit a'),
    fields: fields,
    fieldsOptions: fieldsOptions,
    onInit: function() {
      this.fields['date'].el.datepicker();
      this.fields['phone'].el.mask("+7 (999) 999-99-99");
      window.scrollbars = {};
      window.scroll = function(el) {
        var select;
        select = el ? el : $form.find('.select');
        return select.each(function() {
          var $options, $select, $selected, selectName;
          $select = $(this);
          if ($select.find('.viewport').size()) {
            return;
          }
          selectName = $select.attr('data-name');
          $selected = $select.find('.selected');
          $options = $select.find('.options');
          $options.wrapInner("<div class=\"viewport\"><div class=\"overview\"></div></div>");
          $options.prepend("<div class=\"scrollbar\"><div class=\"track\"><div class=\"thumb\"><div class=\"end\"></div></div></div></div>");
          scrollbars[selectName] = $options.tinyscrollbar({
            sizethumb: 40
          });
          return $selected.click(function() {
            return scrollbars[selectName].tinyscrollbar_update();
          });
        });
      };
      return window.scroll();
    },
    onSubmit: function(data) {
      return $form.find('.errors').empty();
    },
    onSuccess: function(data) {
      this.disableSubmit();
      return this.showPreloader();
    },
    onFail: function(errors) {
      return $form.find('.errors').html("Исправьте ошибки в форме");
    },
    onReset: function() {
      this.unlockSubmit();
      return this.hidePreloader();
    }
  });
  window.addfield = function() {
    var clone, fieldName;
    clone = $form.find('.example').eq(0).clone();
    fieldName = Date.now();
    clone.find('.label').html(fieldName);
    clone.find('.error').removeAttr('class').addClass('error error-' + fieldName);
    clone.find('[name]').attr('name', fieldName);
    clone.show();
    $form.find('.error-list').before(clone);
    formValidator.add(fieldName, {
      rules: {
        required: {
          not: 'Выбрать'
        }
      }
    });
    return window.scroll();
  };
  window.reset = function() {
    formValidator.reset();
    return $form.find('.example').remove();
  };
});
