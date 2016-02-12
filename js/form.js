
/* Form Validator */

/*

Правила валидации
required — Обязательное поле
numeric — Разрешены только цифры
numericDash — Разрешены только цифры и подчеркивания
alpha — Разрешены только буквы
alphaDash — Разрешены только буквы и подчеркивания
alphaNumeric — Разрешены только буквы и цифры
max — Максимум символов
min — Минимум символов
email — Email
url — Url
ip — Ip
 */

/*

Инициализация формы

formValidator = new Form({
 
 logs: true, // Логировать форму
 autoHideErrors: false // Автоматическое скрытие ошибок
 
 formName: 'nice form', // Имя формы (опционально, проще дебажить если на странице много форм)
 formEl: '#form', // Элемент формы (можно передавать элемент DOM)
 submitEl: '.submit', // Элемент кнопки отправки (можно передавать элемент DOM)
 
 fields:{
  'firstname' : {
   useErrorTemplate: true, // Использовать темплейт с ошибками
   checkErrorsOnFocus: true, // Валидировать поле сразу в фокусе
   placeholder: 'placeholder firstname', // Плейсхолдер (Не значение!)
   rules: {
    required:{ // Правило
     reason: 'Обязательное поле для заполнения' // Установка причины ошибки (опционально)
    },
    min: {
     count: 2, // Миниальное кол-во символов
     reason: 'Минимум {count} символа' // Установка причины ошибки (опционально)
    },
    max: {
     count: 10, // Максимальное кол-во символов
     reason: 'Максимум {count} символов'
    }
   }
  },
  'password' : {
   useErrorTemplate: true,
   hideErrorsOnFocus: true, // Скрывать ошибки в фокусе
   //focus: true, // Фокусировать на это поле
   rules: {
    required:{
     reason: 'Обязательное поле для заполнения'
    },
    numeric:{
     reason: 'Разрешены только цифры'
    }
   }
  },
  'url' : {
   rules: {
    required:{
     reason: 'Обязательное поле для заполнения'
    },
    url: {
     reason: 'Неправильно заполненный url'
    }
   },
   
   // Ручная работа над ошибками, без использования темплейтов
   onError: function(fieldName,errors){
    for(i in errors){
     $(".error-custom-url").append(errors[i]);
    };
   }
  },
  'email' : {
   rules: {
    required:{
     reason: 'Обязательное поле для заполнения'
    },
    email: {
     reason: 'Неправильно заполненный email'
    }
   },
   onError: function(fieldName,errors){
    for(i in errors){
     $(".error-custom-email").append(errors[i]);
    };
   }
  },
  'text' : {
   enterSubmit: true, // Отправка по Enter, если элмент в фокусе
   hideErrorsOnFocus: true,
   useErrorTemplate: true,
   escape: true, // Экранировать ввод символов
   placeholder: 'placeholder text',
   rules: {
    required:{
     reason: 'Обязательное поле для заполнения'
    }
   }
  },
  'checkbox_1' : {
  	style: true, // Стилизация элемента
   	rules: {
    required:{
     reason: 'Обязательное поле для заполнения'
    }
   },
   onError: function(fieldName,errors){
    for(i in errors){
     $(".error-custom-checkbox_1").append(errors[i]);
    };
   }
  },
  'checkbox_2' : {
  	style: true, // Стилизация элемента
   rules: {
    required:{
     reason: 'Обязательное поле для заполнения'
    }
   },
   onError: function(fieldName,errors){
    for(i in errors){
     $(".error-custom-checkbox_2").append(errors[i]);
    };
   }
  },
  'radiobutton' : {
  	style: true, // Стилизация элемента
   rules: {
    required:{
     reason: 'Обязательное поле для заполнения'
    }
   },
   onError: function(fieldName,errors){
    for(i in errors){
     $(".error-custom-radiobutton").append(errors[i]);
    };
   }
  },
  'dropdown' : {
  	style: true, // Стилизация элемента
   rules: {
    required:{
     not: '- Выбрать -', // Это значение НЕ валидируется!
     reason: 'Обязательное поле для заполнения'
    }
   },
   onError: function(fieldName,errors){
    for(i in errors){
     $(".error-custom-dropdown").append(errors[i]);
    };
   }
  }
 },
 
 // Событие отправки формы
 onSubmit: function(data){
  $(".error-custom-alert").empty();
 },
 
 // Событие неудачной отправки формы
 onFail: function(errors){},
 
 // Событие сброса формы
 onReset: function(){
  $(".error-custom-alert").empty();
 },
 
 // Событие загрузки формы
 onLoad: function(){},
 
 // Событие инициализации формы. Полезно когда необходимо навешать на форму еще событий.
 // До и после отправки, происходит сброс формы и переинициализация, в также новый bind элементов
 onInit: function(){},
 
 // Событие успешной отправки формы
 onSuccess: function(data){
  $(".error-custom-alert").empty();
 }
})
 
// Добавление нового правила
formValidator.addRule({
 field: 'firstname', // Имя поля
 rule: 'custom rule', // Название правила
 reason: 'Введите слово "хорошо"', // Описание причины ошибки
 condition: function(val){ // Условие исполнения - должно возвращать или true или false
  return val == 'хорошо';
 }
});
 */
var Form;

Form = (function() {
  Form.prototype.logs = false;

  Form.prototype.formName = false;

  Form.prototype.formEl = false;

  Form.prototype.submitEl = false;

  Form.prototype.autoHideErrors = false;

  Form.prototype.errorAlertClass = "error-alert";

  Form.prototype.errorAlertExtClass = "error";

  Form.prototype.errorInputClass = "error-field";

  Form.prototype.placeholderClass = "placeholder";

  Form.prototype.errorHideMethod = "display";

  Form.prototype.errorFadeIn = 300;

  Form.prototype.errorFadeOut = 800;

  Form.prototype.fields = {};

  Form.prototype.data = {};

  Form.prototype.errors = {};

  Form.prototype.onFail = function(errors) {};

  Form.prototype.onSuccess = function(data) {};

  Form.prototype.onSubmit = function(data) {};

  Form.prototype.onReset = function() {};

  Form.prototype.onLoad = function() {};

  Form.prototype.onInit = function() {};

  function Form(options) {
    var k, ref, v;
    this.options = options != null ? options : {};
    ref = this.options;
    for (k in ref) {
      v = ref[k];
      this[k] = v;
    }
    this.errorTemplate = "<div class=\"" + this.errorAlertClass + "\"></div>";
    this.errorTemplateList = "{error}<br/>";
    $((function(_this) {
      return function() {
        if (!_this.formEl) {
          return _this.log('Warning! formEl not set');
        }
        if (!_this.submitEl) {
          return _this.log('Warning! submitEl not set');
        }
        _this.form = _this.isObject(_this.formEl) ? _this.formEl : $(_this.formEl);
        _this.submitBtn = _this.isObject(_this.submitEl) ? _this.submitEl : _this.form.find(_this.submitEl);
        if (!_this.form.size()) {
          return _this.log('Warning! formEl not found in DOM');
        }
        if (!_this.submitBtn.size()) {
          return _this.log('Warning! submitEl not found in DOM');
        }
        _this.init();
        _this.log("onLoad", "options", _this.options);
        return _this.onLoad();
      };
    })(this));
  }

  Form.prototype.init = function() {
    var el, errorAlert, name, ref, ref1, ref2, ref3, ref4, ref5, self;
    self = this;
    this.form.unbind();
    this.submitBtn.unbind();
    for (name in this.fields) {
      el = this.form.find("[name='" + name + "']").eq(0);
      el.unbind();
      if ((ref = el.attr('type')) === 'checkbox' || ref === 'radio') {
        this.fields[name].originVal = el.filter(":checked").val() || false;
      } else {
        this.fields[name].originVal = el.val();
      }
      this.fields[name].style = (ref1 = this.fields[name].style) != null ? ref1 : false;
      this.fields[name].useErrorTemplate = (ref2 = this.fields[name].useErrorTemplate) != null ? ref2 : false;
      this.fields[name].hideErrorsOnFocus = (ref3 = this.fields[name].hideErrorsOnFocus) != null ? ref3 : false;
      this.fields[name].checkErrorsOnFocus = (ref4 = this.fields[name].checkErrorsOnFocus) != null ? ref4 : false;
      this.fields[name].focus = (ref5 = this.fields[name].focus) != null ? ref5 : false;
      if (!this.fields[name].onError) {
        this.fields[name].onError = function(fieldName, errors) {};
      }

      /* placeholder */
      if (this.fields[name].placeholder && (el.is("input[type='text']") || el.is('textarea'))) {
        this.placeholder(el, this.fields[name].placeholder);
      }

      /* Отправка по Enter */
      if (this.fields[name].enterSubmit) {
        el.keydown((function(_this) {
          return function(event) {
            if (event.keyCode === 13) {
              return _this.submit();
            }
          };
        })(this));
      }
      if (this.fields[name].useErrorTemplate && this.fields[name].rules) {
        errorAlert = $("." + this.errorAlertExtClass + "-" + name);
        if (!errorAlert.size()) {
          errorAlert = $(this.errorTemplate);
          errorAlert.addClass(this.errorAlertExtClass + "-" + name);
          el.after(errorAlert);
        }
        errorAlert.unbind();
        if (this.errorHideMethod === "visibility") {
          errorAlert.css('visibility', 'hidden').show();
        } else {
          errorAlert.hide();
        }
        if (this.fields[name].hideErrorsOnFocus) {
          el.focus(function() {
            el = $(this);
            name = el.attr('name');
            return self.removeErrorAlert(name);
          });
        }
        if (this.fields[name].checkErrorsOnFocus) {
          el.keyup(function() {
            var ref6, rule, ruleName, val, valid;
            self.errors[name] = [];
            self.data[name] = [];
            el = $(this);
            name = el.attr('name');
            val = self.getVal(name);
            self.setData(name, val);
            self.removeErrorAlert(name);
            ref6 = self.fields[name].rules;
            for (ruleName in ref6) {
              rule = ref6[ruleName];
              valid = self.validate[ruleName](val, rule);
              if (!valid.state) {
                self.setError(name, valid.reason);
              }
            }
            if (!self.isEmpty(self.errors[name])) {
              self.log("onError", name, self.errors[name]);
              self.addErrorAlert(name);
              return self.fields[name].onError(name, self.errors[name]);
            }
          });
        }
      }
      if (this.fields[name].style && el.is("select")) {
        this.createSelect(el);
        el.change((function(_this) {
          return function() {
            return _this.createSelect(el);
          };
        })(this));
      }
      if (this.fields[name].style && (el.attr('type') === 'radio')) {
        self.createRadio(name);
      }
      if (this.fields[name].style && (el.attr('type') === 'checkbox')) {
        self.createCheckbox(name);
      }
      if (this.fields[name].focus) {
        el.focus();
      }
    }
    this.form.submit(function(e) {
      return e.preventDefault();
    });
    this.submitBtn.click((function(_this) {
      return function() {
        _this.submit();
        return false;
      };
    })(this));
    return this.onInit();
  };

  Form.prototype.createCheckbox = function(name) {
    var $checkbox, el, self, value;
    el = this.form.find("[name='" + name + "']");
    el.hide();
    name = el.attr('name');
    value = el.attr('value');
    self = this;
    if (this.form.find(".checkbox[data-name=" + name + "][data-value=" + value + "]").size()) {
      this.form.find(".checkbox[data-name=" + name + "][data-value=" + value + "]").remove();
    }
    el.click(function() {
      if (!$(this).is(':checked')) {
        return self.form.find(".checkbox[data-name=" + name + "]").removeClass('checked');
      } else {
        return self.form.find(".checkbox[data-name=" + name + "]").addClass('checked');
      }
    });
    $checkbox = $("<div class='checkbox' data-name='" + name + "' data-value='" + value + "'></div>");
    if (el.attr('checked')) {
      $checkbox.addClass('checked');
    }
    el.after($checkbox);
    return $checkbox.click(function() {
      if ($(this).hasClass('checked')) {
        $(this).removeClass('checked');
        return self.setVal(name, false);
      } else {
        $(this).addClass('checked');
        return self.setVal(name, value);
      }
    });
  };

  Form.prototype.createRadio = function(name) {
    var $radioEl, self;
    $radioEl = this.form.find("[name='" + name + "']");
    self = this;
    return $radioEl.each(function() {
      var $radio, el, value;
      el = $(this);
      el.hide();
      name = el.attr('name');
      value = el.attr('value');
      if (self.form.find(".radio[data-name=" + name + "][data-value=" + value + "]").size()) {
        self.form.find(".radio[data-name=" + name + "][data-value=" + value + "]").remove();
      }
      el.click(function() {
        self.form.find(".radio[data-name=" + name + "]").removeClass('checked');
        return self.form.find(".radio[data-name=" + name + "][data-value=" + value + "]").addClass('checked');
      });
      $radio = $("<div class='radio' data-name='" + name + "' data-value='" + value + "'></div>");
      if (el.attr('checked')) {
        $radio.addClass('checked');
      }
      el.after($radio);
      return $radio.click(function() {
        self.form.find(".radio[data-name=" + name + "]").removeClass('checked');
        $(this).addClass('checked');
        return self.setVal(name, value);
      });
    });
  };

  Form.prototype.createSelect = function(el) {
    var $options, $select, $selected, name, selectClose, selectedText, self;
    el.hide();
    name = el.attr('name');
    self = this;
    if (this.form.find(".select[data-name='" + name + "']").size()) {
      this.form.find(".select[data-name='" + name + "']").remove();
    }
    $select = $("<div class='select' data-name='" + name + "'></div>");
    $options = $("<div class='options' style='display:none;'></div>");
    selectedText = el.find('option[selected]').size() ? el.find('option:selected').text() : el.find('option:first-child').text();
    $selected = $("<div class='selected default'>" + selectedText + "</div>");
    $select.append($selected);
    $select.append($options);
    el.after($select);
    selectClose = false;
    $select.mouseover(function() {
      return selectClose = false;
    });
    $select.mouseout(function() {
      return selectClose = true;
    });
    $(document).click(function() {
      if (selectClose) {
        $select.removeClass('open');
        return $options.hide();
      }
    });
    $selected.click(function() {
      if ($select.hasClass('open')) {
        $select.removeClass('open');
        return $options.hide();
      } else {
        $select.addClass('open');
        return $options.show();
      }
    });
    return el.find('option').each(function() {
      var $option;
      if ($(this).attr('value')) {
        $option = $("<div class='option' data-value='" + ($(this).attr('value')) + "'><span>" + ($(this).text()) + "</span></div>");
      } else {
        $option = $("<div class='option'><span>" + ($(this).text()) + "</span></div>");
      }
      $option.click((function(_this) {
        return function() {
          if ($(_this).attr('value')) {
            self.setVal(name, $(_this).attr('value'));
            $selected.removeClass('default');
          } else {
            self.setVal(name, self.fields[name].originVal);
            $selected.addClass('default');
          }
          $select.find('.selected').html($(_this).text());
          $select.removeClass('open');
          return $options.hide();
        };
      })(this));
      return $options.append($option);
    });
  };

  Form.prototype.setVal = function(name, val) {
    var el, ref;
    el = this.form.find("[name='" + name + "']");
    if ((ref = el.attr('type')) === 'checkbox' || ref === 'radio') {
      el.prop("checked", false);
      el.filter("[value='" + val + "']").prop("checked", true);
    } else {
      el.val(this.trim(val));
    }
    if (this.fields[name].placeholder && (el.is("input[type='text']") || el.is('textarea'))) {
      if (val === "" || val === this.fields[name].placeholder) {
        this.placeholder(el, this.fields[name].placeholder);
      } else {
        el.removeClass(this.placeholderClass);
      }
    }
    if (this.fields[name].useErrorTemplate) {
      return this.removeErrorAlert(name);
    }
  };

  Form.prototype.getVal = function(name) {
    var el, ref, val;
    el = this.form.find("[name='" + name + "']");
    name = el.attr('name');
    if ((ref = el.attr('type')) === 'checkbox' || ref === 'radio') {
      val = el.filter(":checked").val() || false;
    } else if (el.is('select')) {
      val = el.val();
    } else {
      el.val(this.trim(el.val()));
      if (this.fields[name].escape) {
        el.val(this.stripHTML(el.val()));
      }
      val = this.trim(el.val());
      if (this.fields[name]['placeholder'] && val === this.fields[name]['placeholder']) {
        val = "";
      }
    }
    return val;
  };

  Form.prototype.submit = function() {
    var name, ref, rule, ruleName, val, valid;
    this.log("SUBMIT!");
    this.resetData();
    this.resetErorrs();
    for (name in this.fields) {
      val = this.getVal(name);
      this.setData(name, val);
      this.removeErrorAlert(name);
      if (this.fields[name].rules) {
        ref = this.fields[name].rules;
        for (ruleName in ref) {
          rule = ref[ruleName];
          valid = this.validate[ruleName](val, rule);
          if (!valid.state) {
            this.setError(name, valid.reason);
          }
        }
      }
    }
    this.log("onSubmit", "data", this.data);
    this.onSubmit(this.data);
    if (this.isEmpty(this.errors)) {
      return this.success();
    } else {
      return this.fail();
    }
  };

  Form.prototype.fail = function() {
    var field, name, ref;
    ref = this.fields;
    for (name in ref) {
      field = ref[name];
      if (this.errors[name]) {
        this.log("onError", name, this.errors[name]);
        this.addErrorAlert(name);
        this.fields[name].onError(name, this.errors[name]);
      }
    }
    if (this.autoHideErrors) {
      setTimeout((function(_this) {
        return function() {
          var ref1, results;
          ref1 = _this.fields;
          results = [];
          for (name in ref1) {
            field = ref1[name];
            results.push(_this.removeErrorAlert(name));
          }
          return results;
        };
      })(this), 1000);
    }
    this.log("onFail", "errors", this.errors);
    return this.onFail(this.errors);
  };

  Form.prototype.success = function() {
    this.log("onSuccess", "data", this.data);
    return this.onSuccess(this.data);
  };

  Form.prototype.reset = function() {
    var name;
    this.resetData();
    this.resetErorrs();
    for (name in this.fields) {
      this.setVal(name, this.fields[name].originVal);
    }
    this.log("onReset");
    this.onReset();
    this.init();
    return false;
  };

  Form.prototype.resetErorrs = function() {
    return this.errors = {};
  };

  Form.prototype.resetData = function() {
    return this.data = {};
  };

  Form.prototype.setData = function(name, val) {
    if (!this.data[name]) {
      return this.data[name] = val;
    }
  };

  Form.prototype.setError = function(name, val) {
    if (!this.errors[name]) {
      this.errors[name] = [];
    }
    return this.errors[name].push(val);
  };

  Form.prototype.addErrorAlert = function(name) {
    var el, errorAlert, i;
    if (this.fields[name].useErrorTemplate) {
      el = this.form.find("[name='" + name + "']");
      el.addClass(this.errorInputClass);
      if (el.is('select') && this.fields[name].style) {
        this.form.find(".select[data-name='" + name + "']").addClass(this.errorInputClass);
      }
      errorAlert = this.form.find("." + this.errorAlertExtClass + "-" + name);
      errorAlert.stop().empty();
      for (i in this.errors[name]) {
        errorAlert.append(this.errorTemplateList.replace(/\{error\}/g, this.errors[name][i]));
      }
      if (this.errorHideMethod === "visibility") {
        errorAlert.css('visibility', 'visible');
      }
      if (this.errorFadeIn) {
        return errorAlert.hide().fadeIn(this.errorFadeIn);
      }
    }
  };

  Form.prototype.removeErrorAlert = function(name) {
    var el, errorAlert;
    if (this.fields[name].useErrorTemplate) {
      el = this.form.find("[name='" + name + "']");
      el.removeClass(this.errorInputClass);
      if (el.is('select') && this.fields[name].style) {
        this.form.find(".select[data-name='" + name + "']").removeClass(this.errorInputClass);
      }
      errorAlert = this.form.find("." + this.errorAlertExtClass + "-" + name);
      if (this.errorHideMethod === "visibility") {
        errorAlert.css('visibility', 'hidden').show();
        return errorAlert.empty();
      } else if (this.errorFadeOut) {
        return errorAlert.stop().css({
          'opacity': '1'
        }).fadeOut(this.errorFadeOut, function() {
          return errorAlert.empty();
        });
      } else {
        errorAlert.empty();
        return errorAlert.hide();
      }
    }
  };

  Form.prototype.placeholder = function(el, val) {
    el.focus((function(_this) {
      return function() {
        if (el.val() === val) {
          return el.val("").removeClass(_this.placeholderClass);
        }
      };
    })(this)).blur((function(_this) {
      return function() {
        if (el.val() === "") {
          return el.val(val).addClass(_this.placeholderClass);
        }
      };
    })(this));
    return el.blur();
  };


  /* VALIDATION FUNCTIONS */

  Form.prototype.validate = {
    required: function(val, rule) {
      var valid;
      valid = {
        state: val !== "" && val !== false && val !== rule.not,
        reason: rule.reason || 'Не заполнено'
      };
      return valid;
    },
    numeric: function(val, rule) {
      var valid;
      valid = {
        state: /^[0-9]+$/.test(val) || val === "",
        reason: rule.reason || 'Не цифры'
      };
      return valid;
    },
    numericDash: function(val, rule) {
      var valid;
      valid = {
        state: /^[\d\-\s]+$/.test(val) || val === "",
        reason: rule.reason || 'Не цифры и подчеркивания'
      };
      return valid;
    },
    alpha: function(val, rule) {
      var valid;
      valid = {
        state: /^[a-zа-я]+$/i.test(val) || val === "",
        reason: rule.reason || 'Не буквы'
      };
      return valid;
    },
    alphaDash: function(val, rule) {
      var valid;
      valid = {
        state: /^[a-z0-9_\-]+$/i.test(val) || val === "",
        reason: rule.reason || 'Не буквы и подчеркивания'
      };
      return valid;
    },
    alphaNumeric: function(val, rule) {
      var valid;
      valid = {
        state: /^[a-z0-9]+$/i.test(val) || val === "",
        reason: rule.reason || 'Не буквы и не цифры'
      };
      return valid;
    },
    max: function(val, rule) {
      var valid;
      if (rule.reason) {
        rule.reason = rule.reason.replace(/\{count\}/g, rule.count);
      }
      valid = {
        state: val.length <= rule.count || val === "",
        reason: rule.reason || ("Максимум " + rule.count)
      };
      return valid;
    },
    min: function(val, rule) {
      var valid;
      if (rule.reason) {
        rule.reason = rule.reason.replace(/\{count\}/g, rule.count);
      }
      valid = {
        state: val.length >= rule.count || val === "",
        reason: rule.reason || ("Минимум " + rule.count)
      };
      return valid;
    },
    email: function(val, rule) {
      var valid;
      valid = {
        state: /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/.test(val) || val === "",
        reason: rule.reason || 'Не email'
      };
      return valid;
    },
    url: function(val, rule) {
      var valid;
      valid = {
        state: /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(val) || val === "",
        reason: rule.reason || 'Не url'
      };
      return valid;
    },
    ip: function(val, rule) {
      var valid;
      valid = {
        state: /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i.test(val) || val === "",
        reason: rule.reason || 'Не ip'
      };
      return valid;
    }
  };


  /* ДОБАВЛЕНИЕ НОВОГО ПРАВИЛА */

  Form.prototype.addRule = function(opt) {
    this.fields[opt.field]['rules'][opt.rule] = opt.reason;
    return this.validate[opt.rule] = function(val, args, description) {
      var valid;
      valid = {
        state: opt.condition(val) || val === "",
        reason: opt.reason || 'custom reason'
      };
      return valid;
    };
  };


  /* HELPERS */

  Form.prototype.log = function() {
    var argument, formName, j, len, newArgs;
    if (console && this.logs) {
      formName = this.formName || this.formEl;
      newArgs = ["[Form]", "'" + formName + "'"];
      for (j = 0, len = arguments.length; j < len; j++) {
        argument = arguments[j];
        newArgs.push(argument);
      }
      return console.log.apply(console, newArgs);
    }
  };

  Form.prototype.trim = function(text) {
    if (text == null) {
      text = "";
    }
    return text.replace(/^\s+|\s+$/g, '');
  };

  Form.prototype.stripHTML = function(text) {
    if (text == null) {
      text = "";
    }
    return text.replace(/<(?:.|\s)*?>/g, '');
  };

  Form.prototype.isFunction = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
  };

  Form.prototype.isString = function(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
  };

  Form.prototype.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  Form.prototype.isObject = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };

  Form.prototype.isEmpty = function(o) {
    var i;
    if (this.isString(o)) {
      if (this.trim(o) === "") {
        return true;
      } else {
        return false;
      }
    }
    if (this.isArray(o)) {
      if (o.length === 0) {
        return true;
      } else {
        return false;
      }
    }
    if (this.isObject(o)) {
      for (i in o) {
        if (o.hasOwnProperty(i)) {
          return false;
        }
      }
      return true;
    }
  };

  Form.prototype.declOfNum = function(number, titles) {
    var cases;
    cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20 ? 2 : cases[(number % 10 < 5 ? number % 10 : 5)])];
  };

  return Form;

})();
