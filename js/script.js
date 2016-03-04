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
  var $options, $select, $selected, browserIsMobile, scrollbar;
  $select = el;
  $selected = $select.find('[data-selected]');
  $options = $select.find('[data-options]');
  if (!$select.find('.scrollbar').size()) {
    $options.wrapInner("<div class=\"viewport\"><div class=\"overview\"></div></div>");
    $options.prepend("<div class=\"scrollbar\"><div class=\"track\"><div class=\"thumb\"><div class=\"end\"></div></div></div></div>");
  }
  browserIsMobile = false;
  scrollbar = $options.tinyscrollbar({
    sizethumb: 44,
    invertscroll: browserIsMobile
  });
  $selected.click(function() {
    return scrollbar.tinyscrollbar_update();
  });
};

$(function() {
  var $form, fields, fieldsOptions;
  window.forms = {};
  $form = $('.form');
  fields = {
    'checkbox_1': {
      name: 'checkbox new',
      rules: {
        required: false,
        alpha: true
      }
    },
    'dropdown': {
      defaultStyle: 'Выбрать',
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
      required: {
        reason: 'ошибка'
      }
    }
  };
  window.forms['form'] = new Form({
    logs: true,
    autoFields: true,
    disableSubmit: false,
    formName: 'nice form',
    formEl: $form,
    submitEl: $form.find('.submit a'),
    fields: fields,
    fieldsOptions: fieldsOptions,
    onInit: function() {
      var self;
      self = this;
      this.fields['date'].el.datepicker();
      this.fields['phone'].el.mask("+7 (999) 999-99-99");
      this.fields['dropdown'].el.on('change', function() {
        return console.log('dropdown change');
      });
      return this.fields['dropdown'].el.on('style', function() {
        console.log('dropdown style');
        return scroll(self.fields['dropdown'].sel);
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
      return this.hidePreloader();
    }
  });
  window.addfield = function() {
    var clone, fieldName, onInit, options;
    clone = forms['form'].form.find('.example').eq(0).clone();
    fieldName = Date.now();
    clone.find('.label').html(fieldName);
    clone.find('.error').removeAttr('class').addClass('error error-' + fieldName);
    clone.find('select').attr('name', fieldName);
    clone.show();
    clone.addClass('new');
    $form.find('.error-list').before(clone);
    options = {
      rules: {
        required: {
          reason: 'Своя ошибка'
        }
      }
    };
    onInit = function() {
      forms['form'].fields[fieldName].el.on('change', function(e, v) {
        return console.log('change', v.val);
      });
      return forms['form'].fields[fieldName].el.on('style', function() {
        return scroll(forms['form'].fields[fieldName].sel);
      });
    };
    return forms['form'].addField(fieldName, options, onInit);
  };
  window.reset = function() {
    forms['form'].reset();
    return forms['form'].form.find('.example.new').remove();
  };
});
