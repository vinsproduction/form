
/* Form Validator */
var Form;

Form = (function() {
  Form.prototype.logs = false;

  Form.prototype.formName = false;

  Form.prototype.formEl = false;

  Form.prototype.submitEl = false;

  Form.prototype.showErrors = true;

  Form.prototype.hideErrorInFocus = true;

  Form.prototype.clearErrorInFocus = true;

  Form.prototype.placeholderClass = "placeholder";

  Form.prototype.errorFieldClass = "error-field";

  Form.prototype.errorClass = "error-";

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
        if (!_this.formEl && _this.logs) {
          return _this.log('Warning! formEl not set');
        }
        if (!_this.submitEl && _this.logs) {
          return _this.log('Warning! submitEl not set');
        }
        _this.form = _this.isObject(_this.formEl) ? _this.formEl : $(_this.formEl);
        _this.submitBtn = _this.isObject(_this.submitEl) ? _this.submitEl : _this.form.find(_this.submitEl);
        if (!_this.form.size() && _this.logs) {
          return _this.log('Warning! formEl not found in DOM');
        }
        if (!_this.submitBtn.size() && _this.logs) {
          return _this.log('Warning! submitEl not found in DOM');
        }
        if (_this.logs) {
          console.log("[Form: " + _this.formName + "] init", _this.options);
        }
        _this.init();
        return _this.onLoad();
      };
    })(this));
  }

  Form.prototype.init = function() {
    var fn, name, self;
    self = this;
    this.form.unbind();
    this.submitBtn.unbind();
    fn = (function(_this) {
      return function(name) {
        var el, ref, ref1, ref2, ref3;
        el = _this.form.find("[name='" + name + "']").eq(0);
        el.unbind();
        _this.fields[name].el = el;
        _this.fields[name].sel = el;
        _this.fields[name].style = (ref = _this.fields[name].style) != null ? ref : true;
        _this.fields[name].focus = (ref1 = _this.fields[name].focus) != null ? ref1 : false;
        if (!_this.fields[name].onError) {
          _this.fields[name].onError = function(fieldName, errors) {};
        }
        if (el.is("select")) {
          _this.fields[name].type = 'select';
          if (_this.fields[name].style) {
            _this.createSelect(el);
            el.change(function() {
              return _this.createSelect(el);
            });
          }
        } else if (el.attr('type') === 'radio') {
          _this.fields[name].type = 'radio';
          if (_this.fields[name].style) {
            self.createRadio(name);
          }
        } else if (el.attr('type') === 'checkbox') {
          _this.fields[name].type = 'checkbox';
          if (_this.fields[name].style) {
            self.createCheckbox(name);
          }
        } else if (el.is("textarea")) {
          _this.fields[name].type = 'textarea';
        } else {
          _this.fields[name].type = 'text';
        }
        if ((ref2 = _this.fields[name].type) === 'checkbox' || ref2 === 'radio') {
          _this.fields[name].originVal = el.filter(":checked").val() || false;
        } else {
          _this.fields[name].originVal = el.val();
        }
        if (_this.fields[name].placeholder && ((ref3 = _this.fields[name].type) === 'text' || ref3 === 'textarea')) {
          _this.placeholder(el, _this.fields[name].placeholder);
        }
        if (_this.fields[name].focus) {
          el.focus();
        }
        _this.fields[name].sel.removeClass(_this.errorFieldClass);
        if (_this.showErrors) {
          _this.form.find('.' + _this.errorClass + name).empty();
        }
        _this.fields[name].sel.click(function() {
          if (_this.hideErrorInFocus) {
            _this.fields[name].sel.removeClass(_this.errorFieldClass);
          }
          if (_this.clearErrorInFocus && _this.showErrors) {
            return _this.form.find('.' + _this.errorClass + name).empty();
          }
        });
      };
    })(this);
    for (name in this.fields) {
      fn(name);
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
    this.fields[name].sel = $checkbox;
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
    var self;
    self = this;
    this.fields[name].el = this.form.find("[name='" + name + "']");
    return this.fields[name].el.each(function() {
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
    el = this.fields[name].el;
    if ((ref = this.fields[name].type) === 'checkbox' || ref === 'radio') {
      el.prop("checked", false);
      el.filter("[value='" + val + "']").prop("checked", val);
    } else if (this.fields[name].type === 'select') {
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
    el = this.fields[name].el;
    if ((ref = this.fields[name].type) === 'checkbox' || ref === 'radio') {
      val = el.filter(":checked").val() || false;
    } else if (this.fields[name].type === 'select') {
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
      return this.log("[Form: " + this.formName + "] set", name + ': ' + val);
    }
  };

  Form.prototype.get = function(name) {
    var val;
    val = this.getVal(name);
    if (this.logs) {
      console.log("[Form: " + this.formName + "] get", name + ": " + val);
    }
    return val;
  };

  Form.prototype.submit = function() {
    var name, ref, rule, ruleName, val, valid;
    this.resetData();
    this.resetErorrs();
    console.groupCollapsed("[Form: " + this.formName + "] submit");
    for (name in this.fields) {
      val = this.getVal(name);
      this.setData(name, val);
      if (this.logs) {
        console.log(name + ': ' + val);
      }
      this.fields[name].sel.removeClass(this.errorFieldClass);
      if (this.showErrors) {
        this.form.find('.' + this.errorClass + name).empty();
      }
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
    if (this.logs) {
      console.log("data", this.data);
    }
    console.groupEnd();
    this.onSubmit(this.data);
    if (this.isEmpty(this.errors)) {
      return this.success();
    } else {
      return this.fail();
    }
  };

  Form.prototype.fail = function() {
    var error, field, i, name, ref, ref1;
    console.groupCollapsed("[Form: " + this.formName + "] fail");
    ref = this.fields;
    for (name in ref) {
      field = ref[name];
      if (this.errors[name]) {
        if (this.logs) {
          console.log(name + ': ', this.errors[name]);
        }
        this.fields[name].sel.addClass(this.errorFieldClass);
        if (this.showErrors) {
          if (this.showErrors === 'all') {
            ref1 = this.errors[name];
            for (i in ref1) {
              error = ref1[i];
              this.form.find('.' + this.errorClass + name).append(error + "<br/>");
            }
          } else {
            this.form.find('.' + this.errorClass + name).html(this.errors[name][0]);
          }
        }
        this.fields[name].onError(name, this.errors[name]);
      }
    }
    if (this.logs) {
      console.log("data", this.errors);
    }
    console.groupEnd();
    return this.onFail(this.errors);
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
    return this.onSuccess(this.data);
  };

  Form.prototype.reset = function() {
    var name;
    this.resetData();
    this.resetErorrs();
    for (name in this.fields) {
      this.setVal(name, this.fields[name].originVal);
    }
    if (this.logs) {
      console.log("[Form: " + this.formName + "] reset");
    }
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
    ip: function(val, rule) {
      var valid;
      valid = {
        state: /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i.test(val) || val === "",
        reason: rule.reason || 'Неправильно заполненный ip'
      };
      return valid;
    },
    compare: function(val, rule) {
      var valid;
      if (this.isFunction(rule.val)) {
        rule.val = rule.val();
      }
      console.log(val, rule.val);
      valid = {
        state: val === rule.val,
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
