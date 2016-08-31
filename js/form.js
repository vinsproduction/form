
/*
	Form
	https://github.com/vinsproduction/form
 */
var Form,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

if (!window.console) {
  window.console = {};
}

if (!window.console.log) {
  window.console.log = function() {};
}

if (!window.console.groupCollapsed) {
  window.console.groupCollapsed = window.console.log;
}

if (!window.console.groupEnd) {
  window.console.groupEnd = function() {};
}

Form = (function() {
  function Form(params) {
    var self;
    this.params = params != null ? params : {};
    this.logs = true;
    this.formName = 'form';
    this.formEl = false;
    this.submitEl = false;
    this.autoFields = true;
    this.autoInit = true;
    this.enter = true;
    this.noSubmitEmpty = false;
    this.disableSubmit = false;
    this.fieldsOptions = {
      active: true,
      style: true,
      autoErrors: true,
      escape: true,
      clearErrorsOnClick: true,
      validateOnKeyup: false,
      errorGroup: false,
      fieldGroup: false,
      attrs: {},
      rules: {}
    };
    this.classes = {
      input: {
        placeholder: "placeholder"
      },
      checkbox: 'checkbox',
      radio: 'radio',
      select: {
        select: 'select',
        selected: 'selected',
        options: 'options',
        option: 'option',
        open: 'open',
        placeholder: 'default'
      },
      submit: {
        disable: 'disabled'
      },
      errorField: "error-field",
      error: "error",
      preloader: "preloader",
      validation: "valid"
    };
    this.templates = {
      hidden: "<div style='position:absolute;width:0;height:0;overflow:hidden;'></div>",
      checkbox: "<div></div>",
      radio: "<div></div>",
      select: {
        select: "<div></div>",
        selected: "<div><span>{selected}</span></div>",
        options: "<div></div>",
        option: "<div><span>{text}</span></div>"
      },
      error: "<div>{error}</div>"
    };
    this.fields = {};
    this.data = {};
    this.errors = {};
    this.onFail = function(errors) {};
    this.onSuccess = function(data) {};
    this.onSubmit = function(data) {};
    this.onReset = function() {};
    this.onInit = function() {};
    this.mobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    $.extend(true, this, this.params);
    self = this;
    $(function() {
      if (!self.formEl && self.logs) {
        console.warn("[Form: " + self.formName + "] formEl not set");
      }
      self.form = self.h.isObject(self.formEl) ? self.formEl : $(self.formEl);
      if (!self.form.size() && self.logs) {
        console.warn("[Form: " + self.formName + "] formEl not found in DOM");
        return;
      }
      self.form.attr('data-form', self.formName);
      if ((self.submitEl == null) && self.logs) {
        console.warn("[Form: " + self.formName + "] submitEl not set");
      }
      self.submitBtn = self.h.isObject(self.submitEl) ? self.submitEl : self.form.find(self.submitEl);
      if (!self.submitBtn.size() && self.logs) {
        console.warn("[Form: " + self.formName + "] submitEl not found in DOM");
      } else {
        self.submitBtn.attr('data-submit', 'data-submit');
      }
      if (self.autoFields) {
        self.form.find('[name]').each(function() {
          var name;
          name = $(this).attr('name');
          if (self.params.fields && self.params.fields[name] === false) {
            return delete self.fields[name];
          } else {
            return self.fields[name] = self.params.fields && self.params.fields[name] ? self.params.fields[name] : {};
          }
        });
      }
      if (self.autoInit) {
        self.initForm();
      }
    });
  }

  Form.prototype.initForm = function() {
    var opts, self;
    self = this;
    this.resetData();
    this.clearErrors();
    this.resetErrors();
    this.form.find('[data-field]').off();
    this.form.off();
    this.submitBtn.off();
    this.form.on('click', '[data-field]', function() {
      var el, name, val;
      el = $(this);
      name = el.attr('data-name') || el.attr('name');
      if (!self.fields[name]) {
        return;
      }
      val = self.getVal(name);
      if (self.fields[name].clearErrorsOnClick) {
        self.deleteError(name);
        self.errorField(name, false);
      }
      el.trigger('Click', {
        name: name,
        val: val,
        errors: self.errors[name] || []
      });
      return true;
    });
    this.form.on('keyup', '[data-field]', function() {
      var el, name, val;
      el = $(this);
      name = el.attr('data-name') || el.attr('name');
      if (!self.fields[name]) {
        return;
      }
      val = self.getVal(name);
      if (self.fields[name].validateOnKeyup) {
        self.validateField(name, 'keyup');
      }
      el.trigger('Keyup', {
        name: name,
        val: val,
        errors: self.errors[name] || []
      });
      return true;
    });
    this.form.on('style', '[data-field]', function() {
      var el, name;
      el = $(this);
      name = el.attr('name');
      if (!self.fields[name]) {
        return;
      }
      if (el.is("select")) {
        self.createSelect(name);
      } else if (el.attr('type') === 'radio') {
        self.createRadio(name);
      } else if (el.attr('type') === 'checkbox') {
        self.createCheckbox(name);
      }
      if (self.fields[name].sel.size()) {
        el.trigger('Style', {
          name: name,
          sel: self.fields[name].sel
        });
      }
      return true;
    });
    this.form.on('change', '[data-field]', function(e, data, withoutTrigger) {
      var el, name, val;
      el = $(this);
      name = el.attr('name');
      if (!self.fields[name]) {
        return;
      }
      val = self.getVal(name);
      self.validateField(name, 'change');
      self.setData(name, val);
      if (el.is("select")) {
        self.createSelect(name, true);
      } else if (el.attr('type') === 'radio') {
        self.createRadio(name, true);
      } else if (el.attr('type') === 'checkbox') {
        self.createCheckbox(name, true);
      }
      if (!withoutTrigger) {
        el.trigger('Change', {
          name: name,
          val: val,
          errors: self.errors[name] || []
        });
      }
      return true;
    });
    this.form.on('error', '[data-field]', function(e, errors) {
      var el, name, val;
      el = $(this);
      name = el.attr('name');
      if (!self.fields[name]) {
        return;
      }
      val = self.getVal(name);
      el.trigger('Error', {
        name: name,
        val: val,
        errors: errors || []
      });
      return true;
    });
    this.form.on('reset', '[data-field]', function() {
      var el, name;
      el = $(this);
      name = el.attr('name');
      if (!self.fields[name]) {
        return;
      }
      el.trigger('Reset', {
        name: name
      });
      return true;
    });
    this.form.submit(function(e) {
      return e.preventDefault();
    });
    if (this.disableSubmit) {
      this.submit(false);
    } else {
      this.submit(true);
    }
    this.form.mouseover(function() {
      return self.form.inFocus = true;
    });
    this.form.mouseout(function() {
      return self.form.inFocus = false;
    });
    if (this.enter) {
      $(window).keydown(function(event) {
        if (self.form.inFocus && event.keyCode === 13) {
          return self.Submit();
        }
      });
    }
    this.submitBtn.click(function() {
      self.Submit();
      return false;
    });
    if (this.logs) {
      opts = {
        autoFields: this.autoFields,
        fields: this.fields,
        fieldsOptions: this.fieldsOptions,
        enter: this.enter,
        disableSubmit: this.disableSubmit,
        classes: this.classes
      };
      console.groupCollapsed("[Form: " + this.formName + "] init");
      console.log(opts);
      console.groupEnd();
    }
    this.initValidation();
    $.each(this.fields, function(name) {
      return self.initField(name);
    });
    this.onInit();
    $.each(this.fields, function(name) {
      if (self.fields[name].style) {
        return self.fields[name].el.eq(0).trigger('style');
      }
    });
  };

  Form.prototype.initField = function(name) {
    var el, ref, self;
    self = this;
    el = this.form.find("[name='" + name + "']");
    if (!el.size()) {
      console.log("[Form: " + this.formName + "] Warning! selector '" + name + "' not found");
      return;
    }
    this.fields[name] = $.extend(true, {}, this.fieldsOptions, this.fields[name]);
    this.fields[name].form = this;
    this.fields[name].el = el;
    this.fields[name].sel = $([]);
    this.fields[name].el.attr('data-name', name);
    this.fields[name].el.attr('data-field', 'original');
    if (!this.fields[name].el.attr('type') && !this.fields[name].el.is('select') && !this.fields[name].el.is('textarea')) {
      this.fields[name].el.attr('type', 'text');
    }
    if (this.fields[name].el.is('select')) {
      this.fields[name].type = 'select';
    } else if (this.fields[name].el.is('textarea')) {
      this.fields[name].type = 'textarea';
    } else {
      this.fields[name].type = this.fields[name].el.attr('type');
    }
    this.fields[name].el.attr('data-type', this.fields[name].type);
    this.fields[name].originalVal = self.getVal(name);
    if (this.fields[name].type === 'select') {
      this.fields[name].mobileKeyboard = true;
    }
    if ((ref = this.fields[name].type) === 'text' || ref === 'textarea' || ref === 'password') {
      if (this.fields[name].placeholder) {
        this.placeholder(name);
      }
    }
    if (this.fields[name].rules.required) {
      this.fields[name]._required = this.fields[name].rules.required;
    }
    $.each(this.fields[name].attrs, function(name, val) {
      return el.attr(name, val);
    });
    $.each(this.fields[name].rules, function(ruleName, rule) {
      if (!self.validation[ruleName]) {
        return self.addFieldRule(name, ruleName, rule);
      }
    });
    this.fields[name].val = function(val) {
      if (val != null) {
        self.setVal(name, val);
        return this;
      } else {
        return self.getVal(name);
      }
    };
    this.fields[name].activate = function(flag) {
      if (flag == null) {
        flag = true;
      }
      self.activate(name, flag);
      return this;
    };
    this.fields[name].require = function(opt) {
      if (opt == null) {
        opt = {};
      }
      self.require(name, opt);
      return this;
    };
    this.fields[name].stylize = function() {
      self.fields[name].el.eq(0).trigger('style');
      return this;
    };
    this.fields[name].reset = function() {
      self.resetField(name);
      return this;
    };
    this.fields[name].error = function(errors) {
      if (errors == null) {
        errors = false;
      }
      self.errorField(name, errors);
      return this;
    };
    this.fields[name].validate = function(ruleName, opt) {
      var valid;
      if (opt == null) {
        opt = {};
      }
      if (!self.validation[ruleName]) {
        return;
      }
      valid = self.validation[ruleName](self.getVal(name), opt);
      return valid;
    };
    this.fields[name].addRule = function(ruleName, rule) {
      self.addFieldRule(name, ruleName, rule);
      return this;
    };
  };

  Form.prototype.initValidation = function() {
    var self;
    self = this;
    return self.validation = {
      patterns: {
        numeric: {
          exp: '0-9',
          type: ['цифра', 'цифры', 'цифр', 'цифры']
        },
        alpha: {
          exp: 'а-яёА-ЯЁa-zA-Z',
          type: ['буква', 'буквы', 'букв', 'буквы']
        },
        rus: {
          exp: 'а-яёА-ЯЁ',
          type: ['русская буква', 'русские буквы', 'русских букв', 'русские буквы']
        },
        rusLowercase: {
          exp: 'а-яё',
          type: ['русская маленькая буква', 'русские маленькой буквы', 'русских маленьких букв', 'русские маленькие буквы']
        },
        rusUppercase: {
          exp: 'А-ЯЁ',
          type: ['русская большая буква', 'русские большие буквы', 'русских больших букв', 'русские большие буквы']
        },
        eng: {
          exp: 'a-zA-Z',
          type: ['английская буква', 'английские буквы', 'английских букв', 'английские буквы']
        },
        engLowercase: {
          exp: 'a-z',
          type: ['английская маленькая буква', 'английские маленькие буквы', 'английских маленьких букв', 'английские маленькие буквы']
        },
        engUppercase: {
          exp: 'A-Z',
          type: ['английская большая буква', 'английские большие буквы', 'английских больших букв', 'английские большие буквы']
        },
        dot: {
          exp: '.',
          type: ['точка', 'точки', 'точек', 'точки']
        },
        hyphen: {
          exp: '-',
          type: ['дефис', 'дефиса', 'дефисов', 'дефисы']
        },
        dash: {
          exp: '_',
          type: ['подчеркивание', 'подчеркивания', 'подчеркиваний', 'подчеркивания']
        },
        space: {
          exp: '\\s',
          type: ['пробел', 'пробела', 'пробелов', 'пробелы']
        },
        slash: {
          exp: '\\/',
          type: ['слэш', 'слэша', 'слэшей', 'слэшы']
        },
        comma: {
          exp: ',',
          type: ['запятая', 'запятой', 'запятых', 'запятые']
        },
        special: {
          exp: '$@$!%*#?&',
          type: ['специальный символ', 'специальных символа', 'специальных символов', 'специальныe символы']
        }
      },
      required: function(val, rule) {
        var obj, valid;
        obj = {
          state: false,
          reason: rule.reason || "Обязательное поле для заполнения"
        };
        valid = function() {
          if (val !== false) {
            if (rule.not) {
              if (self.h.isArray(rule.not)) {
                if ((val != null) && !self.h.isEmpty(val) && (indexOf.call(rule.not, val) < 0)) {
                  obj.state = true;
                }
              } else {
                if ((val != null) && !self.h.isEmpty(val) && (val !== rule.not)) {
                  obj.state = true;
                }
              }
            } else {
              if ((val != null) && !self.h.isEmpty(val)) {
                obj.state = true;
              }
            }
          }
          return obj;
        };
        return valid();
      },
      numeric: function(val, rule) {
        var obj, valid;
        obj = {
          state: false,
          reason: rule.reason || "Допустимы только цифры"
        };
        valid = function() {
          if (/^[0-9]+$/.test(val)) {
            obj.state = true;
          }
          return obj;
        };
        return valid();
      },
      alpha: function(val, rule) {
        var obj, valid;
        obj = {
          state: false,
          reason: rule.reason || "Допустимы только буквы"
        };
        valid = function() {
          if (/^[a-zA-Zа-яёА-ЯЁ]+$/.test(val)) {
            obj.state = true;
          }
          return obj;
        };
        return valid();
      },
      eng: function(val, rule) {
        var obj, valid;
        obj = {
          state: false,
          reason: rule.reason || "Допустимы только английские буквы"
        };
        valid = function() {
          if (/^[a-zA-Z]+$/.test(val)) {
            obj.state = true;
          }
          return obj;
        };
        return valid();
      },
      rus: function(val, rule) {
        var obj, valid;
        obj = {
          state: false,
          reason: rule.reason || "Допустимы только русские буквы"
        };
        valid = function() {
          if (/^[а-яёА-ЯЁ]+$/.test(val)) {
            obj.state = true;
          }
          return obj;
        };
        return valid();
      },
      max: function(val, rule) {
        var count, obj, valid;
        obj = {
          state: false
        };
        count = rule.count || rule;
        if (rule.reason) {
          obj.reason = rule.reason.replace(/\{count\}/g, rule.count);
        } else {
          obj.reason = "Максимум " + count + " " + (self.h.declOfNum(count, ['символ', 'символа', 'символов']));
        }
        valid = function() {
          if (val.length <= count) {
            obj.state = true;
          }
          return obj;
        };
        return valid();
      },
      min: function(val, rule) {
        var count, obj, valid;
        obj = {
          state: false
        };
        count = rule.count || rule;
        if (rule.reason) {
          obj.reason = rule.reason.replace(/\{count\}/g, rule.count);
        } else {
          obj.reason = "Минимум " + count + " " + (self.h.declOfNum(count, ['символ', 'символа', 'символов']));
        }
        valid = function() {
          if (val.length >= count) {
            obj.state = true;
          }
          return obj;
        };
        return valid();
      },
      email: function(val, rule) {
        var obj, valid;
        obj = {
          state: false,
          reason: rule.reason || 'Неправильно заполненный E-mail'
        };
        valid = function() {
          if (/^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/.test(val)) {
            obj.state = true;
          }
          return obj;
        };
        return valid();
      },
      url: function(val, rule) {
        var obj, valid;
        obj = {
          state: false,
          reason: rule.reason || 'Неправильно заполненный url'
        };
        valid = function() {
          if (/^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(val)) {
            obj.state = true;
          }
          return obj;
        };
        return valid();
      },
      not: function(val, rule) {
        var obj, valid;
        obj = {
          state: false,
          reason: rule.reason || "Недопустимое значение"
        };
        valid = function() {
          if (rule.val != null) {
            if (self.h.isArray(rule.val)) {
              if (indexOf.call(rule.val, val) < 0) {
                obj.state = true;
              } else {
                if (val !== rule.val) {
                  obj.state = true;
                }
              }
            }
          } else {
            if (self.h.isArray(rule)) {
              if (indexOf.call(rule, val) < 0) {
                obj.state = true;
              }
            } else {
              if (val !== rule) {
                obj.state = true;
              }
            }
          }
          return obj;
        };
        return valid();
      },
      compare: function(val, rule) {
        var obj, valid;
        obj = {
          state: false,
          reason: rule.reason || "Поля не совпадают"
        };
        valid = function() {
          if (rule.field && self.fields[rule.field]) {
            if (rule.reason) {
              obj.reason = rule.reason.replace(/\{field\}/g, rule.field);
            } else {
              obj.reason = "Поле не совпадает с " + rule.field;
            }
            if (val === self.fields[rule.field].val()) {
              obj.state = true;
              return obj;
            }
          }
          if (rule.val != null) {
            if (self.h.isFunction(rule.val)) {
              if (val === rule.val()) {
                obj.state = true;
              }
            } else {
              if (val === rule.val) {
                obj.state = true;
              }
            }
            return obj;
          }
          return obj;
        };
        return valid();
      },
      only: function(val, rule) {
        var obj, patterns, valid;
        patterns = this.patterns;
        obj = {
          state: true
        };
        if (rule.reason) {
          obj.reason = rule.reason;
        }
        valid = function() {
          var _patterns, _reasons, maxmin, pattern, range, reason;
          _patterns = [];
          _reasons = [];
          $.each(rule.exp, function(k, v) {
            if (patterns[k]) {
              _reasons.push(patterns[k].type[3]);
              return _patterns.push(patterns[k].exp);
            }
          });
          reason = _reasons.join(', ');
          pattern = _patterns.join('');
          pattern = "^[" + pattern + "]+$";
          if (!rule.reason) {
            obj.reason = 'Допустимы только ' + reason;
          }
          if (!new RegExp(pattern).test(val)) {
            obj.state = false;
            return obj;
          }
          _reasons = [];
          range = true;
          $.each(rule.exp, function(k, v) {
            if (k === 'range' && self.h.isArray(v)) {
              if (v[0]) {
                if (val.length < v[0]) {
                  _reasons.push('минимум ' + v[0] + " " + self.h.declOfNum(v[0], ['символ', 'символа', 'символов']));
                  range = false;
                  return false;
                }
              }
              if (v[1]) {
                if (val.length > v[1]) {
                  _reasons.push('максимум ' + v[1] + " " + self.h.declOfNum(v[1], ['символ', 'символа', 'символов']));
                  range = false;
                  return false;
                }
              }
            }
          });
          if (!range) {
            reason = _reasons.join(', ');
            if (!rule.reason) {
              obj.reason = 'Допустимы ' + reason;
            }
            obj.state = false;
            return obj;
          }
          _reasons = [];
          maxmin = true;
          $.each(rule.exp, function(k, v) {
            var match, reg;
            if (patterns[k]) {
              if (self.h.isArray(v)) {
                reg = new RegExp("[" + patterns[k].exp + "]", 'g');
                match = val.match(reg);
                if (v[0]) {
                  if (match && match.length < v[0]) {
                    _reasons.push('Допустимы минимум ' + v[0] + " " + self.h.declOfNum(v[0], patterns[k].type));
                    maxmin = false;
                    return false;
                  } else if (!match) {
                    _reasons.push('Требуется минимум ' + v[0] + " " + self.h.declOfNum(v[0], patterns[k].type));
                    maxmin = false;
                    return false;
                  }
                }
                if (v[1]) {
                  if (match && match.length > v[1]) {
                    _reasons.push('Допустимы максимум ' + v[1] + " " + self.h.declOfNum(v[1], patterns[k].type));
                    maxmin = false;
                    return false;
                  }
                }
              }
            }
          });
          if (!maxmin) {
            reason = _reasons.join(', ');
            if (!rule.reason) {
              obj.reason = reason;
            }
            obj.state = false;
            return obj;
          }
          return obj;
        };
        return valid();
      },
      strict: function(val, rule) {
        var obj, patterns, valid;
        patterns = this.patterns;
        obj = {
          state: true
        };
        if (rule.reason) {
          obj.reason = rule.reason;
        }
        valid = function() {
          var _patterns, _reasons, maxmin, pattern, range, reason;
          _patterns = [];
          _reasons = [];
          $.each(rule.exp, function(k, v) {
            if (patterns[k]) {
              _reasons.push(patterns[k].type[3]);
              return _patterns.push("(?=.*[" + patterns[k].exp + "])");
            }
          });
          reason = _reasons.join(', ');
          pattern = _patterns.join('');
          if (!rule.reason) {
            obj.reason = 'Требуется ' + reason;
          }
          if (!new RegExp(pattern).test(val)) {
            obj.state = false;
            return obj;
          }
          _reasons = [];
          range = true;
          $.each(rule.exp, function(k, v) {
            if (k === 'range' && self.h.isArray(v)) {
              if (v[0]) {
                if (val.length < v[0]) {
                  _reasons.push('минимум ' + v[0] + " " + self.h.declOfNum(v[0], ['символ', 'символа', 'символов']));
                  range = false;
                  return false;
                }
              }
              if (v[1]) {
                if (val.length > v[1]) {
                  _reasons.push('максимум ' + v[1] + " " + self.h.declOfNum(v[1], ['символ', 'символа', 'символов']));
                  range = false;
                  return false;
                }
              }
            }
          });
          if (!range) {
            reason = _reasons.join(', ');
            if (!rule.reason) {
              obj.reason = 'Требуется ' + reason;
            }
            obj.state = false;
            return obj;
          }
          _reasons = [];
          maxmin = true;
          $.each(rule.exp, function(k, v) {
            var match, reg;
            if (patterns[k]) {
              if (self.h.isArray(v)) {
                reg = new RegExp("[" + patterns[k].exp + "]", 'g');
                match = val.match(reg);
                if (v[0]) {
                  if (match && match.length < v[0]) {
                    _reasons.push('минимум ' + v[0] + " " + self.h.declOfNum(v[0], patterns[k].type));
                    maxmin = false;
                    return false;
                  }
                }
                if (v[1]) {
                  if (match && match.length > v[1]) {
                    _reasons.push('максимум ' + v[1] + " " + self.h.declOfNum(v[1], patterns[k].type));
                    maxmin = false;
                    return false;
                  }
                }
              }
            }
          });
          if (!maxmin) {
            reason = _reasons.join(', ');
            if (!rule.reason) {
              obj.reason = 'Требуется ' + reason;
            }
            obj.state = false;
            return obj;
          }
          return obj;
        };
        return valid();
      }
    };
  };

  Form.prototype.init = function() {
    var self;
    self = this;
    return $(function() {
      return self.initForm();
    });
  };

  Form.prototype.Submit = function() {
    var list, self;
    self = this;
    if (self._disableSubmit) {
      return;
    }
    this.resetData();
    this.resetErrors();
    list = {};
    if (this.logs) {
      console.groupCollapsed("[Form: " + this.formName + "] submit");
    }
    $.each(this.fields, function(name, opt) {
      var ref, val;
      if (!opt.active) {
        return;
      }
      val = self.getVal(name);
      self.setData(name, val);
      list[name] = val;
      if (self.logs) {
        console.log(name + ': ' + (val || '""'));
      }
      self.data[name] = opt.escape ? self.h.escapeText(val) : val;
      if (self.noSubmitEmpty) {
        if (opt.type === 'select') {
          if (opt.rules.required.not) {
            if (self.h.isArray(opt.rules.required.not)) {
              if (indexOf.call(opt.rules.required.not, val) >= 0) {
                self.deleteData(name);
              }
            } else {
              if (val === opt.rules.required.not) {
                self.deleteData(name);
              }
            }
          }
        }
        if ((ref = opt.type) === 'text' || ref === 'password' || ref === 'textarea') {
          if (self.h.isEmpty(val)) {
            self.deleteData(name);
          }
        }
      }
      if (opt.fieldGroup) {
        if (self.data.hasOwnProperty(name)) {
          if (!self.data[opt.fieldGroup]) {
            self.data[opt.fieldGroup] = {};
          }
          self.data[opt.fieldGroup][name] = self.data[name];
          return self.deleteData(name);
        }
      }
    });
    if (this.logs) {
      console.log(this.data);
    }
    if (this.logs) {
      console.groupEnd();
    }
    $.each(this.fields, function(name, opt) {
      if (opt.active) {
        return self.validateField(name);
      }
    });
    this.onSubmit(this.data, list);
    if (this.h.isEmpty(this.errors)) {
      this.Success(list);
    } else {
      this.Fail();
    }
  };

  Form.prototype.Fail = function() {
    var self;
    self = this;
    if (this.logs) {
      console.groupCollapsed("[Form: " + this.formName + "] fail");
    }
    $.each(this.fields, function(name, opt) {
      var errors;
      errors = self.errors[name];
      if (errors) {
        if (self.logs) {
          console.log(name + ': ' + errors[0].reason);
        }
        if (opt.errorGroup) {
          if (self.errors.hasOwnProperty(name)) {
            if (!self.errors[opt.errorGroup]) {
              self.errors[opt.errorGroup] = {};
            }
            self.errors[opt.errorGroup][name] = errors;
            return self.deleteError(name);
          }
        }
      }
    });
    if (this.logs) {
      console.log(this.errors);
    }
    if (this.logs) {
      console.groupEnd();
    }
    this.onFail(this.errors);
  };

  Form.prototype.Success = function(list) {
    if (this.logs) {
      console.groupCollapsed("[Form: " + this.formName + "] success");
    }
    $.each(this.data, function(name, val) {
      if (self.logs) {
        return console.log(name + ': ' + (val || '""'));
      }
    });
    if (this.logs) {
      console.log(this.data);
    }
    if (this.logs) {
      console.groupEnd();
    }
    this.onSuccess(this.data, list);
  };

  Form.prototype.createCheckbox = function(name, change) {
    var $checkbox, $hiddenWrap, checkboxTemplate, self, val;
    self = this;
    checkboxTemplate = this.templates.checkbox;
    if (change) {
      if (this.fields[name].val()) {
        this.fields[name].sel.attr('data-checked', 'data-checked');
      } else {
        this.fields[name].sel.removeAttr('data-checked');
      }
    } else {
      if (this.form.find("[data-field='original'][data-type='checkbox'][data-name='" + name + "']").parent().attr('data-wrap')) {
        this.form.find("[data-field='original'][data-type='checkbox'][data-name='" + name + "']").unwrap();
      }
      this.form.find("[data-field='styled'][data-type='checkbox'][data-name='" + name + "']").remove();
      val = this.fields[name].el.attr('value');
      $checkbox = $(checkboxTemplate);
      $checkbox.addClass(this.classes.checkbox);
      $checkbox.attr('data-field', 'styled');
      $checkbox.attr('data-type', 'checkbox');
      $checkbox.attr('data-name', name);
      $checkbox.attr('data-value', val);
      this.fields[name].el.after($checkbox);
      this.fields[name].sel = $checkbox;
      $hiddenWrap = $(this.templates.hidden);
      $hiddenWrap.attr('data-wrap', name);
      this.fields[name].el.wrap($hiddenWrap);
      if (this.fields[name].el.prop("checked")) {
        $checkbox.attr('data-checked', 'data-checked');
      }
      $checkbox.on('click', function() {
        if (self.fields[name].el.prop("checked")) {
          return self.setVal(name, false);
        } else {
          return self.setVal(name, val);
        }
      });
    }
  };

  Form.prototype.createRadio = function(name, change) {
    var self;
    self = this;
    if (change) {
      this.fields[name].sel.removeAttr('data-checked');
      this.fields[name].sel.filter("[data-value='" + (this.fields[name].val()) + "']").attr('data-checked', 'data-checked');
    } else {
      if (this.form.find("[data-field='original'][data-type='radio'][data-name='" + name + "']").parent().attr('data-wrap')) {
        this.form.find("[data-field='original'][data-type='radio'][data-name='" + name + "']").unwrap();
      }
      this.form.find("[data-field='styled'][data-type='radio'][data-name='" + name + "']").remove();
      this.fields[name].sel = $([]);
      this.fields[name].el.each(function() {
        var $hiddenWrap, $radio, el, val;
        el = $(this);
        val = el.attr('value');
        $radio = $(self.templates.radio);
        $radio.addClass(self.classes.radio);
        $radio.attr('data-field', 'styled');
        $radio.attr('data-type', 'radio');
        $radio.attr('data-name', name);
        $radio.attr('data-value', val);
        if (el.attr('checked')) {
          $radio.attr('data-checked', 'data-checked');
        }
        el.after($radio);
        self.fields[name].sel = self.fields[name].sel.add($radio);
        $hiddenWrap = $(self.templates.hidden);
        $hiddenWrap.attr('data-wrap', name);
        el.wrap($hiddenWrap);
        return $radio.on('click', function() {
          return self.setVal(name, val);
        });
      });
    }
  };

  Form.prototype.createSelect = function(name, change) {
    var $hiddenWrap, $options, $select, $selected, selectedTemplate, selectedText, self;
    self = this;
    if (change) {
      this.fields[name].sel.removeClass(this.classes.select.open);
      this.fields[name].sel.find("[data-selected]").html(this.fields[name].sel.find("[data-option][data-value='" + (this.fields[name].val()) + "']").html());
      if (this.fields[name].placeholder && this.fields[name].placeholder === this.fields[name].el.val()) {
        this.fields[name].sel.find("[data-selected]").addClass(self.classes.select.placeholder);
      } else {
        this.fields[name].sel.find("[data-selected]").removeClass(self.classes.select.placeholder);
      }
      this.fields[name].sel.find("[data-options]").hide();
      this.fields[name].sel.find("[data-option]").removeAttr('data-checked');
      this.fields[name].sel.find("[data-option][data-value='" + (this.fields[name].val()) + "']").attr('data-checked', 'data-checked');
    } else {
      if (this.form.find("[data-field='original'][data-type='select'][data-name='" + name + "']").parent().attr('data-wrap')) {
        this.form.find("[data-field='original'][data-type='select'][data-name='" + name + "']").unwrap();
      }
      this.form.find("[data-field='styled'][data-type='select'][data-name='" + name + "']").remove();
      $select = $(this.templates.select.select);
      $select.addClass(this.classes.select.select);
      $select.attr('data-field', 'styled');
      $select.attr('data-type', 'select');
      $select.attr('data-name', name);
      if (this.fields[name].el.find('option[selected]').size()) {
        selectedText = this.fields[name].el.find('option:selected').text();
      } else {
        selectedText = this.fields[name].el.find('option:first-child').text();
      }
      selectedTemplate = this.templates.select.selected.replace('{selected}', selectedText);
      $selected = $(selectedTemplate);
      $selected.addClass(this.classes.select.selected);
      $selected.attr('data-selected', 'data-selected');
      $options = $(this.templates.select.options);
      $options.addClass(this.classes.select.options);
      $options.attr('data-options', 'data-options');
      $options.hide();
      $select.append($selected);
      $select.append($options);
      this.fields[name].el.after($select);
      this.fields[name].sel = $select;
      $hiddenWrap = $(self.templates.hidden);
      $hiddenWrap.attr('data-wrap', name);
      this.fields[name].el.wrap($hiddenWrap);
      if (this.fields[name].mobileKeyboard && this.mobileBrowser) {
        $select.on('click', function() {
          return self.fields[name].el.focus();
        });
        this.fields[name].el.on('blur', function() {
          return self.setVal(name, self.fields[name].el.val());
        });
      } else {
        $selected.on('click', function() {
          if ($select.hasClass(self.classes.select.open)) {
            $select.removeClass(self.classes.select.open);
            return $options.hide();
          } else {
            $select.addClass(self.classes.select.open);
            return $options.show();
          }
        });
      }
      $(window).click(function(event) {
        if (!$(event.target).closest($select).length && !$(event.target).is($select)) {
          $select.removeClass(self.classes.select.open);
          return $options.hide();
        }
      });
      if (this.fields[name].placeholder && this.fields[name].placeholder === selectedText) {
        $selected.addClass(self.classes.select.placeholder);
      }
      this.fields[name].el.find('option').each(function() {
        var $option, option, text, val;
        if (!$(this).attr('value') || self.h.isEmpty($(this).attr('value'))) {
          $(this).attr('value', $(this).text());
        }
        val = $(this).attr('value');
        text = $(this).text();
        option = self.templates.select.option.replace('{text}', text);
        $option = $(option);
        $option.addClass(self.classes.select.option);
        $option.attr('data-option', 'data-option');
        $option.attr('data-value', val);
        if ($(this).is(':first-child')) {
          $option.attr('data-checked', 'data-checked');
        }
        $option.on('click', function() {
          return self.setVal(name, $(this).attr('data-value'));
        });
        return $options.append($option);
      });
    }
  };

  Form.prototype.validateField = function(name, event) {
    var ref, self, showErrors, val;
    if (!this.fields[name] || !this.fields[name].rules || this.h.isEmpty(this.fields[name].rules)) {
      return;
    }
    self = this;
    val = self.getVal(name);
    self.deleteError(name);
    self.errorField(name, false);
    self.fields[name].el.removeClass(self.classes.validation);
    self.fields[name].sel.removeClass(self.classes.validation);
    showErrors = true;
    if (!self.fields[name].rules.required && self.h.isEmpty(val)) {
      return;
    }
    if (event === 'keyup' || event === 'change') {
      if ((ref = self.fields[name].type) === 'checkbox' || ref === 'radio') {
        if (val === false) {
          showErrors = false;
        }
      } else if (self.fields[name].type === 'select') {
        if (self.fields[name].rules.required && self.fields[name].rules.required.not) {
          if (self.h.isArray(self.fields[name].rules.required.not)) {
            if (indexOf.call(self.fields[name].rules.required.not, val) >= 0) {
              showErrors = false;
            }
          } else {
            if (val === self.fields[name].rules.required.not) {
              showErrors = false;
            }
          }
        }
      } else if (self.h.isEmpty(val)) {
        showErrors = false;
      }
    }
    $.each(self.fields[name].rules, function(ruleName, rule) {
      var valid;
      if (rule && self.validation[ruleName]) {
        valid = self.validation[ruleName](val, rule);
        if (!valid.state) {
          self.setError(name, {
            ruleName: ruleName,
            reason: valid.reason
          });
          if (showErrors) {
            if (self.fields[name].autoErrors) {
              if (self.fields[name].autoErrors === 'all') {
                return self.errorField(name, self.errors[name]);
              } else if (self.errors[name][0]) {
                return self.errorField(name, self.errors[name][0]);
              }
            }
          }
        }
      }
    });
    if (showErrors) {
      if (!self.errors[name] || self.h.isEmpty(self.errors[name])) {
        self.fields[name].el.addClass(self.classes.validation);
        return self.fields[name].sel.addClass(self.classes.validation);
      }
    }
  };

  Form.prototype.setVal = function(name, val, withoutTrigger) {
    var opt, ref;
    if (withoutTrigger == null) {
      withoutTrigger = false;
    }
    if (!this.fields[name]) {
      return;
    }
    opt = this.fields[name];
    if (opt.type === 'radio') {
      opt.el.prop("checked", false);
      opt.el.filter("[value='" + val + "']").prop("checked", val);
    } else if (opt.type === 'checkbox') {
      opt.el.prop("checked", val);
    } else if ((ref = opt.type) === 'text' || ref === 'password' || ref === 'textarea') {
      opt.el.val(this.h.trim(val));
      if (opt.placeholder) {
        opt.el.trigger('blur');
      }
    } else {
      opt.el.val(val);
    }
    opt.el.eq(0).trigger('change', [
      {
        name: name,
        val: val
      }, withoutTrigger
    ]);
  };

  Form.prototype.getVal = function(name) {
    var opt, ref, ref1, val;
    if (!this.fields[name]) {
      return;
    }
    opt = this.fields[name];
    if ((ref = opt.type) === 'checkbox' || ref === 'radio') {
      val = opt.el.filter(":checked").val() || false;
    } else if ((ref1 = opt.type) === 'text' || ref1 === 'password' || ref1 === 'textarea') {
      val = opt.el.hasClass(this.classes.input.placeholder) ? "" : this.h.trim(opt.el.val());
    } else {
      val = opt.el.val();
    }
    return val;
  };

  Form.prototype.reset = function() {
    var self;
    self = this;
    this.resetData();
    this.resetErrors();
    $.each(this.fields, function(name, opt) {
      if (self.fields[name]["new"]) {
        return self.removeField(name);
      } else {
        return self.fields[name].reset();
      }
    });
    if (this.logs) {
      console.log("[Form: " + this.formName + "] reset");
    }
    this.onReset();
  };

  Form.prototype.resetErrors = function() {
    return this.errors = {};
  };

  Form.prototype.resetData = function() {
    return this.data = {};
  };

  Form.prototype.setData = function(name, val) {
    this.data[name] = val;
  };

  Form.prototype.deleteData = function(name) {
    delete this.data[name];
  };

  Form.prototype.getData = function() {
    return this.data;
  };

  Form.prototype.setError = function(name, opt) {
    if (!this.errors[name]) {
      this.errors[name] = [];
    }
    this.errors[name].push(opt);
  };

  Form.prototype.deleteError = function(name) {
    delete this.errors[name];
  };

  Form.prototype.getErrors = function() {
    return this.errors;
  };

  Form.prototype.clearErrors = function() {
    var self;
    self = this;
    this.form.find('.' + this.classes.error).empty();
    this.form.find('[data-field]').removeClass(this.classes.errorField);
  };

  Form.prototype.errorField = function(name, errors, withoutTrigger) {
    var $error, error, self;
    if (!this.fields[name]) {
      return;
    }
    self = this;
    if (errors) {
      if (this.fields[name].errorGroup) {
        $.each(this.fields, function(fieldName) {
          if (self.fields[fieldName].errorGroup === self.fields[name].errorGroup) {
            self.fields[fieldName].el.addClass(self.classes.errorField);
            return self.fields[fieldName].sel.addClass(self.classes.errorField);
          }
        });
      } else {
        this.fields[name].el.addClass(this.classes.errorField);
        this.fields[name].sel.addClass(this.classes.errorField);
      }
      if (this.fields[name].autoErrors) {
        if (this.fields[name].errorGroup) {
          $error = this.form.find('.' + this.classes.error + '-' + this.fields[name].errorGroup);
        } else {
          $error = this.form.find('.' + this.classes.error + '-' + name);
        }
        if (this.h.isArray(errors)) {
          $error.empty();
          $.each(errors, function(k, v) {
            var error;
            if (!self.h.isObject(v)) {
              v = {
                reason: v
              };
            }
            error = self.templates.error.replace('{error}', v.reason);
            return $error.append(error);
          });
        } else {
          if (!self.h.isObject(errors)) {
            errors = {
              reason: errors
            };
          }
          error = self.templates.error.replace('{error}', errors.reason);
          $error.html(error);
        }
      }
      if (!withoutTrigger) {
        self.fields[name].el.eq(0).trigger('error', [errors]);
      }
    } else {
      if (this.fields[name].errorGroup) {
        $.each(this.fields, function(fieldName) {
          if (self.fields[fieldName].errorGroup === self.fields[name].errorGroup) {
            self.fields[fieldName].el.removeClass(self.classes.errorField);
            return self.fields[fieldName].sel.removeClass(self.classes.errorField);
          }
        });
      } else {
        this.fields[name].el.removeClass(this.classes.errorField);
        this.fields[name].sel.removeClass(this.classes.errorField);
      }
      if (this.fields[name].autoErrors) {
        if (this.fields[name].errorGroup) {
          this.form.find('.' + this.classes.error + '-' + this.fields[name].errorGroup).empty();
        } else {
          this.form.find('.' + this.classes.error + '-' + name).empty();
        }
      }
    }
  };

  Form.prototype.resetField = function(name) {
    if (!this.fields[name]) {
      return;
    }
    this.setVal(name, this.fields[name].originalVal, true);
    this.errorField(name, false);
    this.fields[name].el.eq(0).trigger('reset');
  };

  Form.prototype.addField = function(name, opt) {
    this.fields[name] = opt;
    this.initField(name, true);
    this.fields[name]["new"] = true;
    if (opt.onInit) {
      opt.onInit();
    }
    if (this.logs) {
      console.log("[Form: " + this.formName + "] add field", name);
    }
    if (this.fields[name].style) {
      this.fields[name].el.trigger('style');
    }
  };

  Form.prototype.removeField = function(name) {
    if (!this.fields[name]) {
      return;
    }
    this.fields[name].el.removeAttr('data-field');
    if (this.fields[name].style) {
      this.fields[name].el.unwrap();
    }
    if (this.fields[name].sel) {
      this.fields[name].sel.remove();
    }
    if (this.logs) {
      console.log("[Form: " + this.formName + "] delete field", name);
    }
    delete this.fields[name];
  };

  Form.prototype.require = function(name, opt) {
    if (!this.fields[name]) {
      return;
    }
    if (opt && this.fields[name]._required) {
      this.fields[name].rules.required = this.fields[name]._required;
    } else {
      this.fields[name].rules.required = opt;
    }
  };

  Form.prototype.newRule = function(name, rule) {
    this.validation[name] = function(val) {
      var obj, valid;
      obj = {
        state: false,
        reason: rule.reason || 'unknown reason'
      };
      valid = function() {
        if (rule.condition(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    };
  };

  Form.prototype.addFieldRule = function(name, ruleName, rule) {
    if (rule == null) {
      rule = {};
    }
    if (!this.fields[name] || !ruleName) {
      return;
    }
    if (!this.validation[ruleName] && rule.condition) {
      this.newRule(ruleName, rule);
    }
    this.fields[name].rules[ruleName] = rule;
    if (this.logs) {
      console.log("[Form: " + this.formName + "] add rule '" + ruleName + "'");
    }
  };

  Form.prototype.activate = function(name, flag) {
    if (!this.fields[name]) {
      return;
    }
    this.fields[name].active = flag;
  };

  Form.prototype.placeholder = function(name) {
    var self;
    if (!this.fields[name]) {
      return;
    }
    self = this;
    this.fields[name].el.focus(function() {
      if ($(this).hasClass(self.classes.input.placeholder)) {
        return $(this).val("").removeClass(self.classes.input.placeholder);
      }
    }).blur(function() {
      if (self.h.isEmpty($(this).val())) {
        return $(this).val(self.fields[name].placeholder).addClass(self.classes.input.placeholder);
      } else {
        return $(this).removeClass(self.classes.input.placeholder);
      }
    });
    this.fields[name].el.blur();
  };

  Form.prototype.submit = function(flag) {
    if (flag == null) {
      flag = true;
    }
    if (flag) {
      this._disableSubmit = false;
      this.submitBtn.removeClass(this.classes.submit.disable);
    } else {
      this._disableSubmit = true;
      this.submitBtn.addClass(this.classes.submit.disable);
    }
  };

  Form.prototype.preloader = function(flag) {
    var preloader;
    if (flag == null) {
      flag = true;
    }
    preloader = this.form.find('.' + this.classes.preloader);
    if (flag) {
      preloader.show();
    } else {
      preloader.hide();
    }
  };


  /* Helpers */

  Form.prototype.h = {
    trim: function(text) {
      if (text == null) {
        text = "";
      }
      if (!this.isString(text)) {
        return text;
      }
      return text.replace(/^\s+|\s+$/g, '');
    },
    stripHTML: function(text) {
      if (text == null) {
        text = "";
      }
      if (!this.isString(text)) {
        return text;
      }
      return text.replace(/<(?:.|\s)*?>/g, '');
    },
    escapeText: function(text) {
      if (text == null) {
        text = "";
      }
      if (!this.isString(text)) {
        return text;
      }
      return text.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
    isFunction: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    },
    isString: function(obj) {
      return Object.prototype.toString.call(obj) === '[object String]';
    },
    isArray: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    },
    isObject: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Object]';
    },
    isEmpty: function(o) {
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
    },
    declOfNum: function(number, titles) {
      var cases;
      cases = [2, 0, 1, 1, 1, 2];
      return titles[(number % 100 > 4 && number % 100 < 20 ? 2 : cases[(number % 10 < 5 ? number % 10 : 5)])];
    }

    /*  Validation */
  };

  return Form;

})();
