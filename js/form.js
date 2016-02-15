
/* Form Validator */
var Form;

Form = (function() {
  Form.prototype.logs = false;

  Form.prototype.formName = false;

  Form.prototype.formEl = false;

  Form.prototype.submitEl = false;

  Form.prototype.placeholderClass = "placeholder";

  Form.prototype.fields = {};

  Form.prototype.data = {};

  Form.prototype.errors = {};

  Form.prototype.onFail = function(errors) {};

  Form.prototype.onSuccess = function(data) {};

  Form.prototype.onSubmit = function(data) {};

  Form.prototype.onReset = function() {};

  Form.prototype.onLoad = function() {};

  Form.prototype.onInit = function() {};

  Form.prototype.onChange = function(fieldname, callback) {
    return this.form.on(fieldname, function(event, v) {
      return callback(v);
    });
  };

  function Form(options) {
    var k, ref, v;
    this.options = options != null ? options : {};
    ref = this.options;
    for (k in ref) {
      v = ref[k];
      this[k] = v;
    }
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
    var el, name, ref, ref1, ref2, self;
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
      this.fields[name].focus = (ref2 = this.fields[name].focus) != null ? ref2 : false;
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
    $selected = $("<div class='selected'>" + selectedText + "</div>");
    if (el.find('option:selected').is(':first-child')) {
      $selected.addClass('default');
    }
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
      el.filter("[value='" + val + "']").prop("checked", val);
    } else if (el.is("select")) {
      el.val(val);
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
    return this.form.trigger(name, [
      {
        name: name,
        val: val
      }
    ]);
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

  Form.prototype.set = function(name, val) {
    var el, sel;
    if (val == null) {
      val = false;
    }
    el = this.form.find("[name='" + name + "']");
    sel = this.form.find("[data-name='" + name + "']");
    if (el.is("select")) {
      if (!val) {
        val = el.find('option').eq(0).val();
      }
      this.setVal(name, val);
      el.trigger('change');
      return;
    }
    if (el.attr('type') === 'checkbox') {
      if (val) {
        sel.addClass('checked');
      } else {
        sel.removeClass('checked');
      }
    }
    if (el.attr('type') === 'radio') {
      sel.removeClass('checked');
      if (val) {
        sel.filter("[data-value='" + val + "']").addClass('checked');
      } else {
        val = el.eq(0).val();
        sel.eq(0).addClass('checked');
      }
    }
    this.setVal(name, val);
    return this.log("SET", name, '=', val);
  };

  Form.prototype.get = function(name) {
    var el, ref, val;
    el = this.form.find("[name='" + name + "']");
    if ((ref = el.attr('type')) === 'checkbox' || ref === 'radio') {
      return el.filter(':checked').val();
    }
    val = el.val();
    this.log("GET", name, '=', val);
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
        this.fields[name].onError(name, this.errors[name]);
      }
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
