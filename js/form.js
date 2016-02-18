
/* Form */

/* https://github.com/vinsproduction/form */
var Form;

Form = (function() {
  Form.prototype.logs = false;

  Form.prototype.formName = false;

  Form.prototype.formEl = false;

  Form.prototype.submitEl = false;

  Form.prototype.enter = true;

  Form.prototype.disableSubmit = false;

  Form.prototype.classes = {
    disableSubmitClass: 'disabled-submit',
    placeholderClass: "placeholder",
    errorFieldClass: "error-field",
    errorClass: "error-",
    preloaderClass: "preloader"
  };

  Form.prototype.fields = {};

  Form.prototype.fieldsOptions = {
    style: true,
    focus: false,
    clearErrorsInFocus: false,
    autoErrors: false,
    escape: false,
    onError: function(fieldName, errors) {}
  };

  Form.prototype.data = {};

  Form.prototype.errors = {};

  Form.prototype.onFail = function(errors) {};

  Form.prototype.onSuccess = function(data) {};

  Form.prototype.onSubmit = function(data) {};

  Form.prototype.onReset = function() {};

  Form.prototype.onLoad = function() {};

  Form.prototype.onInit = function() {};

  Form.prototype.onChange = function(fieldname, callback) {
    this.form.on(fieldname, function(event, v) {
      return callback(v);
    });
  };

  function Form(options) {
    var self;
    this.options = options != null ? options : {};
    self = this;
    $.extend(true, this, this.options);
    $(function() {
      if (!self.formEl && self.logs) {
        return self.log('Warning! formEl not set');
      }
      if (!self.submitEl && self.logs) {
        return self.log('Warning! submitEl not set');
      }
      self.form = self.isObject(self.formEl) ? self.formEl : $(self.formEl);
      self.submitBtn = self.isObject(self.submitEl) ? self.submitEl : self.form.find(self.submitEl);
      if (!self.form.size() && self.logs) {
        return self.log('Warning! formEl not found in DOM');
      }
      if (!self.submitBtn.size() && self.logs) {
        return self.log('Warning! submitEl not found in DOM');
      }
      if (self.enter) {
        $(window).keydown(function(event) {
          if (self.form.inFocus && event.keyCode === 13) {
            if (!self.disableSubmit) {
              return self.submit();
            }
          }
        });
      }
      self.init();
      self.onLoad();
    });
  }

  Form.prototype.init = function() {
    var opts, self;
    self = this;
    this.form.unbind();
    this.submitBtn.unbind();
    this.form.submit(function(e) {
      return e.preventDefault();
    });
    this.form.mouseover(function() {
      return self.form.inFocus = true;
    });
    this.form.mouseout(function() {
      return self.form.inFocus = false;
    });
    if (this.options.disableSubmit) {
      this.lockSubmit();
    }
    this.submitBtn.click(function() {
      if (!self.disableSubmit) {
        self.submit();
      }
      return false;
    });
    $.each(this.fields, function(name, opt) {
      return self.initSelector(name, opt);
    });
    opts = {
      formName: this.formName,
      logs: this.logs,
      fields: this.fields,
      fieldsOptions: this.fieldsOptions,
      enter: this.enter,
      disableSubmit: this.disableSubmit,
      form: this.form,
      submitBtn: this.submitBtn,
      classes: this.classes
    };
    if (self.logs) {
      console.log("[Form: " + this.formName + "] init", opts);
    }
    this.onInit();
  };

  Form.prototype.initSelector = function(name, opt) {
    var el, ref, ref1, self;
    self = this;
    el = this.form.find("[name='" + name + "']").eq(0);
    if (!el.size()) {
      self.log("Warning! selector '" + name + "' not found");
      return;
    }
    el.unbind();
    opt.el = el;
    opt.sel = el;
    opt.style = opt.style || this.fieldsOptions.style;
    opt.focus = opt.focus || this.fieldsOptions.focus;
    opt.hideErrorInFocus = opt.hideErrorInFocus || this.fieldsOptions.hideErrorInFocus;
    opt.clearErrorsInFocus = opt.clearErrorsInFocus || this.fieldsOptions.clearErrorsInFocus;
    opt.autoErrors = opt.autoErrors || this.fieldsOptions.autoErrors;
    opt.onError = opt.onError || this.fieldsOptions.onError;
    opt._onError = function(fieldName, errors, callback) {
      callback();
      return opt.onError(fieldName, errors);
    };
    if (el.is("select")) {
      opt.type = 'select';
      if (opt.style) {
        this.createSelect(el);
        el.change((function(_this) {
          return function() {
            return _this.createSelect(el);
          };
        })(this));
      }
    } else if (el.attr('type') === 'radio') {
      opt.type = 'radio';
      if (opt.style) {
        this.createRadio(name);
      }
    } else if (el.attr('type') === 'checkbox') {
      opt.type = 'checkbox';
      if (opt.style) {
        this.createCheckbox(name);
      }
    } else if (el.is("textarea")) {
      opt.type = 'textarea';
    } else {
      opt.type = 'text';
    }
    if ((ref = opt.type) === 'checkbox' || ref === 'radio') {
      opt.originVal = el.filter(":checked").val() || false;
    } else {
      opt.originVal = el.val();
    }
    if (opt.placeholder && ((ref1 = opt.type) === 'text' || ref1 === 'textarea')) {
      this.placeholder(el, opt.placeholder);
    }
    if (opt.focus) {
      el.focus();
    }
    opt.el.removeClass(this.classes.errorFieldClass);
    opt.sel.removeClass(this.classes.errorFieldClass);
    if (opt.autoErrors) {
      this.form.find('.' + this.classes.errorClass + name).empty();
    }
    opt.sel.click(function() {
      if (opt.clearErrorsInFocus) {
        opt.el.removeClass(self.classes.errorFieldClass);
        opt.sel.removeClass(self.classes.errorFieldClass);
      }
      if (opt.autoErrors) {
        return self.form.find('.' + self.classes.errorClass + name).empty();
      }
    });
  };

  Form.prototype.add = function(name, opt) {
    if (opt == null) {
      opt = this.fieldsOptions;
    }
    console.log;
    this.fields[name] = opt;
    this.initSelector(name, opt);
    if (this.logs) {
      console.log("[Form: " + this.formName + "] add", name);
    }
  };

  Form.prototype["delete"] = function(name) {
    this.fields[name].sel.remove();
    if (this.fields[name].style) {
      this.fields[name].el.show();
    }
    if (this.logs) {
      console.log("[Form: " + this.formName + "] delete", name);
    }
    delete this.fields[name];
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
    this.fields[name].sel = $checkbox;
    $checkbox.click(function() {
      if (el.is(':checked')) {
        $(this).removeClass('checked');
        return self.setVal(name, false);
      } else {
        $(this).addClass('checked');
        return self.setVal(name, value);
      }
    });
  };

  Form.prototype.createRadio = function(name) {
    var self;
    self = this;
    this.fields[name].el = this.form.find("[name='" + name + "']");
    this.fields[name].el.each(function() {
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
      self.fields[name].sel = self.form.find("[data-name='" + name + "']");
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
    $selected = $("<div class='selected'>" + selectedText + "</div>");
    if (el.find('option:selected').is(':first-child')) {
      $selected.addClass('default');
    }
    $select.append($selected);
    $select.append($options);
    el.after($select);
    this.fields[name].sel = $select;
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
    el.find('option').each(function() {
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
    var opt, ref;
    opt = this.fields[name];
    if (opt.type === 'radio') {
      opt.el.prop("checked", false);
      opt.el.filter("[value='" + val + "']").prop("checked", val);
    } else if (opt.type === 'checkbox') {
      opt.el.prop("checked", val);
    } else if (opt.type === 'select') {
      opt.el.val(val);
    } else {
      opt.el.val(this.trim(val));
    }
    if (opt.placeholder && ((ref = opt.type) === 'text' || ref === 'textarea')) {
      if (val === "" || val === opt.placeholder) {
        this.placeholder(opt.el, opt.placeholder);
      } else {
        opt.el.removeClass(this.classes.placeholderClass);
      }
    }
    this.form.trigger(name, [
      {
        name: name,
        val: val
      }
    ]);
  };

  Form.prototype.getVal = function(name) {
    var opt, ref, val;
    opt = this.fields[name];
    if ((ref = opt.type) === 'checkbox' || ref === 'radio') {
      val = opt.el.filter(":checked").val() || false;
    } else if (opt.type === 'select') {
      val = opt.el.val();
    } else {
      opt.el.val(this.trim(opt.el.val()));
      if (opt.escape) {
        opt.el.val(this.stripHTML(opt.el.val()));
      }
      val = this.trim(opt.el.val());
      if (opt.placeholder && (val === opt.placeholder)) {
        val = "";
      }
    }
    return val;
  };

  Form.prototype.set = function(name, val) {
    var el, sel;
    if (val == null) {
      val = false;
    }
    if (!this.fields[name]) {
      return;
    }
    el = this.fields[name].el;
    sel = this.fields[name].sel;
    this.setVal(name, val);
    if (this.fields[name].type === 'select') {
      if (!val) {
        val = el.find('option').eq(0).val();
      }
      el.trigger('change');
    }
    if (this.fields[name].type === 'checkbox') {
      if (val) {
        sel.addClass('checked');
      } else {
        sel.removeClass('checked');
      }
    }
    if (this.fields[name].type === 'radio') {
      sel.removeClass('checked');
      if (val) {
        sel.filter("[data-value='" + val + "']").addClass('checked');
      } else {
        val = el.eq(0).val();
        sel.eq(0).addClass('checked');
      }
    }
    if (this.logs) {
      console.log("[Form: " + this.formName + "] set", name + ': ' + val);
    }
  };

  Form.prototype.get = function(name) {
    var val;
    val = this.getVal(name);
    return val;
  };

  Form.prototype.submit = function() {
    var self;
    self = this;
    this.resetData();
    this.resetErorrs();
    console.groupCollapsed("[Form: " + this.formName + "] submit");
    $.each(this.fields, function(name, opt) {
      var ref, results, rule, ruleName, val, valid;
      val = self.getVal(name);
      self.setData(name, val);
      if (self.logs) {
        console.log(name + ': ' + val);
      }
      opt.el.removeClass(self.classes.errorFieldClass);
      opt.sel.removeClass(self.classes.errorFieldClass);
      if (opt.autoErrors) {
        self.form.find('.' + self.classes.errorClass + name).empty();
      }
      if (opt.rules) {
        ref = opt.rules;
        results = [];
        for (ruleName in ref) {
          rule = ref[ruleName];
          valid = self.validate[ruleName](val, rule);
          if (!valid.state) {
            results.push(self.setError(name, valid.reason));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    });
    if (this.logs) {
      console.log("data", this.data);
    }
    console.groupEnd();
    this.onSubmit(this.data);
    if (this.isEmpty(this.errors)) {
      this.success();
    } else {
      this.fail();
    }
  };

  Form.prototype.fail = function() {
    var self;
    self = this;
    console.groupCollapsed("[Form: " + this.formName + "] fail");
    $.each(this.fields, function(name, opt) {
      if (self.errors[name]) {
        if (self.logs) {
          console.log(name + ': ', self.errors[name]);
        }
        opt.el.addClass(self.classes.errorFieldClass);
        opt.sel.addClass(self.classes.errorFieldClass);
        return opt._onError(name, self.errors[name], function() {
          var error, i, ref, results;
          if (self.fields[name].autoErrors) {
            if (self.fields[name].autoErrors === 'all') {
              ref = self.errors[name];
              results = [];
              for (i in ref) {
                error = ref[i];
                results.push(self.form.find('.' + self.classes.errorClass + name).append(error + "<br/>"));
              }
              return results;
            } else {
              return self.form.find('.' + self.classes.errorClass + name).html(self.errors[name][0]);
            }
          }
        });
      }
    });
    if (this.logs) {
      console.log("data", this.errors);
    }
    console.groupEnd();
    this.onFail(this.errors);
  };

  Form.prototype.success = function() {
    var name, ref, val;
    console.groupCollapsed("[Form: " + this.formName + "] onSuccess");
    ref = this.data;
    for (name in ref) {
      val = ref[name];
      if (this.logs) {
        console.log(name, val);
      }
    }
    console.groupEnd();
    this.onSuccess(this.data);
  };

  Form.prototype.reset = function() {
    var self;
    self = this;
    this.resetData();
    this.resetErorrs();
    $.each(this.fields, function(name, opt) {
      self.setVal(name, opt.originVal);
      if (!self.options.fields[name]) {
        return self["delete"](name);
      }
    });
    if (this.logs) {
      console.log("[Form: " + this.formName + "] reset");
    }
    this.onReset();
    this.init();
  };

  Form.prototype.resetErorrs = function() {
    return this.errors = {};
  };

  Form.prototype.resetData = function() {
    return this.data = {};
  };

  Form.prototype.setData = function(name, val) {
    if (!this.data[name]) {
      this.data[name] = val;
    }
  };

  Form.prototype.getData = function() {
    return this.data;
  };

  Form.prototype.setError = function(name, val) {
    if (!this.errors[name]) {
      this.errors[name] = [];
    }
    this.errors[name].push(val);
  };

  Form.prototype.getErrors = function() {
    return this.errors;
  };

  Form.prototype.placeholder = function(el, val) {
    el.focus((function(_this) {
      return function() {
        if (el.val() === val) {
          return el.val("").removeClass(_this.classes.placeholderClass);
        }
      };
    })(this)).blur((function(_this) {
      return function() {
        if (el.val() === "") {
          return el.val(val).addClass(_this.classes.placeholderClass);
        }
      };
    })(this));
    el.blur();
  };

  Form.prototype.lockSubmit = function() {
    this.disableSubmit = true;
    this.submitBtn.addClass(this.classes.disableSubmitClass);
  };

  Form.prototype.unlockSubmit = function() {
    this.disableSubmit = false;
    this.submitBtn.removeClass(this.classes.disableSubmitClass);
  };

  Form.prototype.showPreloader = function() {
    this.form.find('.' + this.classes.preloaderClass).show();
  };

  Form.prototype.hidePreloader = function() {
    this.form.find('.' + this.classes.preloaderClass).hide();
  };


  /* VALIDATION FUNCTIONS */

  Form.prototype.validate = {
    isFunction: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    },
    declOfNum: function(number, titles) {
      var cases;
      cases = [2, 0, 1, 1, 1, 2];
      return titles[(number % 100 > 4 && number % 100 < 20 ? 2 : cases[(number % 10 < 5 ? number % 10 : 5)])];
    },
    required: function(val, rule) {
      var valid;
      valid = {
        state: val !== "" && val !== false && val !== rule.not,
        reason: rule.reason || 'Обязательное поле для заполнения'
      };
      return valid;
    },
    numeric: function(val, rule) {
      var valid;
      valid = {
        state: /^[0-9]+$/.test(val) || val === "",
        reason: rule.reason || 'Допустимы только цифры'
      };
      return valid;
    },
    numericDash: function(val, rule) {
      var valid;
      valid = {
        state: /^[\d\-\s]+$/.test(val) || val === "",
        reason: rule.reason || 'Допустимы только цифры и подчеркивания'
      };
      return valid;
    },
    alpha: function(val, rule) {
      var valid;
      valid = {
        state: /^[a-zа-я]+$/i.test(val) || val === "",
        reason: rule.reason || 'Допустимы только буквы'
      };
      return valid;
    },
    eng: function(val, rule) {
      var valid;
      valid = {
        state: /^[a-z]+$/i.test(val) || val === "",
        reason: rule.reason || 'Допустимы только английские буквы'
      };
      return valid;
    },
    cyrillic: function(val, rule) {
      var valid;
      valid = {
        state: /^[а-я]+$/i.test(val) || val === "",
        reason: rule.reason || 'Допустимы только русские буквы'
      };
      return valid;
    },
    alphaDash: function(val, rule) {
      var valid;
      valid = {
        state: /^[a-z0-9_\-]+$/i.test(val) || val === "",
        reason: rule.reason || 'Допустимы только буквы и подчеркивания'
      };
      return valid;
    },
    alphaNumeric: function(val, rule) {
      var valid;
      valid = {
        state: /^[a-z0-9]+$/i.test(val) || val === "",
        reason: rule.reason || 'Допустимы только буквы и цифры'
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
        reason: rule.reason || ("Максимум " + rule.count + " " + (this.declOfNum(rule.count, ['символ', 'символа', 'символов'])))
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
        reason: rule.reason || ("Минимум " + rule.count + " " + (this.declOfNum(rule.count, ['символ', 'символа', 'символов'])))
      };
      return valid;
    },
    email: function(val, rule) {
      var valid;
      valid = {
        state: /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/.test(val) || val === "",
        reason: rule.reason || 'Неправильно заполненный E-mail'
      };
      return valid;
    },
    url: function(val, rule) {
      var valid;
      valid = {
        state: /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(val) || val === "",
        reason: rule.reason || 'Неправильно заполненный url'
      };
      return valid;
    },
    compare: function(val, rule) {
      var valid;
      valid = {
        state: val === (this.isFunction(rule.val) ? rule.val() : rule.val),
        reason: rule.reason || "Поля не совпадают"
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

  return Form;

})();
