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
    'checkbox_1': {
      rules: {
        required: false,
        alpha: true
      }
    }
  };
  fieldsOptions = {
    style: true,
    clearErrorsInFocus: true,
    autoErrors: true,
    escape: true,
    rules: {
      required: {
        reason: 'ошибка'
      }
    }
  };
  window.formValidator = new Form({
    logs: true,
    autoFields: true,
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
      this.lockSubmit();
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
    clone.find('select').attr('name', fieldName);
    clone.show();
    clone.addClass('new');
    $form.find('.error-list').before(clone);
    formValidator.addField(fieldName, {
      rules: {
        required: {
          reason: 'Своя ошибка'
        }
      }
    });
    return window.scroll();
  };
  window.reset = function() {
    formValidator.reset();
    return $form.find('.example.new').remove();
  };
});
