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
  var $form, fields, formValidator;
  $form = $('.form');
  fields = {
    'login': {
      escape: true,
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
      escape: true,
      rules: {
        required: true
      }
    },
    'password-confirmation': {
      escape: true,
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
    },
    'dropdown-2': {
      rules: {
        required: {
          not: 'Выбрать'
        }
      }
    }
  };
  formValidator = new Form({
    logs: true,
    showErrors: 'all',
    formName: 'nice form',
    formEl: $form,
    submitEl: $form.find('.submit a'),
    fields: fields,
    onInit: function() {
      var scroll, scrollbars;
      this.fields['date'].el.datepicker();
      this.fields['phone'].el.mask("+7 (999) 999-99-99");
      scrollbars = {};
      scroll = function(el) {
        var select;
        select = el ? el : $form.find('.select');
        return select.each(function() {
          var $options, $select, $selected, selectName;
          $select = $(this);
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
      return scroll();
    },
    onSubmit: function(data) {
      return $form.find('.errors-all').empty();
    },
    onSuccess: function(data) {
      return this.disableSubmit();
    },
    onFail: function(errors) {
      return $form.find('.errors-all').html("Исправьте ошибки в форме");
    },
    onReset: function() {
      this.enableSubmit();
      return this.hidePreloader();
    }
  });
  window.reset = function() {
    return formValidator.reset();
  };
});
