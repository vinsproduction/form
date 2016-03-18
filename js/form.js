
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
    this.logs = false;
    this.formName = 'form';
    this.formEl = false;
    this.submitEl = false;
    this.autoFields = true;
    this.enter = true;
    this.disableSubmit = false;
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
      preloader: "preloader"
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
    this.fieldsOptions = {
      active: true,
      style: true,
      clearErrorsInFocus: true,
      autoErrors: true,
      escape: false,
      rules: {}
    };
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
        return console.log("[Form: " + self.formName + "] Warning! formEl not set");
      }
      if (!self.submitEl && self.logs) {
        return console.log("[Form: " + self.formName + "] Warning! submitEl not set");
      }
      self.form = self.h.isObject(self.formEl) ? self.formEl : $(self.formEl);
      self.submitBtn = self.h.isObject(self.submitEl) ? self.submitEl : self.form.find(self.submitEl);
      if (!self.form.size() && self.logs) {
        return console.log("[Form: " + self.formName + "] Warning! formEl not found in DOM");
      }
      if (!self.submitBtn.size() && self.logs) {
        return console.log("[Form: " + self.formName + "] Warning! submitEl not found in DOM");
      }
      self.form.attr('data-form', self.formName);
      self.submitBtn.attr('data-submit', 'data-submit');
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
      self.init();
    });
  }

  Form.prototype.init = function() {
    var opts, self;
    self = this;
    this.resetData();
    this.clearErrors();
    this.resetErorrs();
    this.form.find('[data-field]').off();
    this.form.off();
    this.submitBtn.off();
    this.form.on('click', '[data-field]', function() {
      var el, name;
      el = $(this);
      name = el.attr('data-name') || el.attr('name');
      if (!self.fields[name]) {
        return;
      }
      if (self.fields[name].clearErrorsInFocus) {
        self.errorField(name, false);
      }
      el.trigger('Click', {
        name: name
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
      var el, name;
      el = $(this);
      name = el.attr('name');
      if (!self.fields[name]) {
        return;
      }
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
          val: el.val()
        });
      }
      return true;
    });
    this.form.on('error', '[data-field]', function(e, errors) {
      var el, name;
      el = $(this);
      name = el.attr('name');
      if (!self.fields[name]) {
        return;
      }
      el.trigger('Error', {
        name: name,
        errors: errors
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
          if (!self._disableSubmit) {
            return self.Submit();
          }
        }
      });
    }
    this.submitBtn.click(function() {
      if (!self._disableSubmit) {
        self.Submit();
      }
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
    $.each(this.fields, function(name) {
      return self.initField(name);
    });
    this.onInit();
    $.each(this.fields, function(name) {
      if (self.fields[name].style) {
        return self.fields[name].el.eq(0).trigger('style');
      }
    });
    this.validation.init(this);
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
    if (!this.fields[name].el.attr('type')) {
      this.fields[name].el.attr('type', 'text');
    }
    this.fields[name].type = this.fields[name].el.is('select') ? 'select' : this.fields[name].el.attr('type');
    this.fields[name].el.attr('data-type', this.fields[name].type);
    this.fields[name].originalVal = self.getVal(name);
    if (this.fields[name].type === 'select') {
      this.fields[name].mobileKeyboard = true;
    }
    if (this.fields[name].placeholder && ((ref = this.fields[name].type) === 'text' || ref === 'textarea' || ref === 'password')) {
      this.placeholder(name);
    }
    if (this.fields[name].rules.required) {
      this.fields[name]._required = this.fields[name].rules.required;
    }
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
      return valid.state;
    };
    this.fields[name].addRule = function(ruleName, rule) {
      self.addFieldRule(name, ruleName, rule);
      return this;
    };
  };

  Form.prototype.Submit = function() {
    var data, self;
    self = this;
    this.resetData();
    this.resetErorrs();
    data = {};
    if (this.logs) {
      console.groupCollapsed("[Form: " + this.formName + "] submit");
    }
    $.each(this.fields, function(name, opt) {
      var val;
      val = self.getVal(name);
      if (opt.name) {
        data[opt.name] = opt.escape ? self.h.escapeText(val) : val;
      } else {
        data[name] = opt.escape ? self.h.escapeText(val) : val;
      }
      if (!opt.active) {
        return delete data[name];
      } else {
        self.setData(name, val);
        if (self.logs) {
          console.log(name + ': ' + val);
        }
        self.errorField(name, false);
        if (opt.rules && !self.h.isEmpty(opt.rules)) {
          return $.each(opt.rules, function(ruleName, rule) {
            var valid;
            if (rule && self.validation[ruleName]) {
              if (!self.h.isEmpty(val) || ruleName === 'required') {
                valid = self.validation[ruleName](val, rule);
                if (!valid.state) {
                  return self.setError(name, valid.reason);
                }
              }
            }
          });
        }
      }
    });
    if (this.logs) {
      console.log("data", data);
    }
    if (this.logs) {
      console.groupEnd();
    }
    this.onSubmit(data);
    if (this.h.isEmpty(this.errors)) {
      this.Success();
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
      if (self.errors[name]) {
        if (self.logs) {
          console.log(name + ': ', self.errors[name]);
        }
        if (self.fields[name].autoErrors) {
          if (self.fields[name].autoErrors === 'all') {
            return self.errorField(name, self.errors[name]);
          } else if (self.errors[name][0]) {
            return self.errorField(name, self.errors[name][0]);
          }
        }
      }
    });
    if (this.logs) {
      console.log("data", this.errors);
    }
    if (this.logs) {
      console.groupEnd();
    }
    $.each(this.fields, function(name, opt) {
      if (self.errors[name]) {
        return self.fields[name].el.eq(0).trigger('error', [self.errors[name]]);
      }
    });
    this.onFail(this.errors);
  };

  Form.prototype.Success = function() {
    var name, ref, val;
    if (this.logs) {
      console.groupCollapsed("[Form: " + this.formName + "] success");
    }
    ref = this.data;
    for (name in ref) {
      val = ref[name];
      if (this.logs) {
        console.log(name, val);
      }
    }
    if (this.logs) {
      console.log("data", this.data);
    }
    if (this.logs) {
      console.groupEnd();
    }
    this.onSuccess(this.data);
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
    this.resetErorrs();
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

  Form.prototype.clearErrors = function() {
    var self;
    self = this;
    this.form.find('.' + this.classes.error).empty();
    this.form.find('[data-field]').removeClass(this.classes.errorField);
  };

  Form.prototype.errorField = function(name, errors) {
    var $error, error, self;
    if (!this.fields[name]) {
      return;
    }
    self = this;
    if (errors) {
      this.fields[name].el.addClass(this.classes.errorField);
      if (this.fields[name].sel) {
        this.fields[name].sel.addClass(this.classes.errorField);
      }
      if (this.fields[name].autoErrors) {
        $error = this.form.find('.' + this.classes.error + '-' + name);
        if (this.h.isArray(errors)) {
          $error.empty();
          $.each(errors, function(k, v) {
            var error;
            error = self.templates.error.replace('{error}', v);
            return $error.append(error);
          });
        } else {
          error = self.templates.error.replace('{error}', errors);
          $error.html(error);
        }
      }
    } else {
      this.fields[name].el.removeClass(this.classes.errorField);
      if (this.fields[name].sel) {
        this.fields[name].sel.removeClass(this.classes.errorField);
      }
      if (this.fields[name].autoErrors) {
        this.form.find('.' + this.classes.error + '-' + name).empty();
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
    this.validation.init(this);
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

  Form.prototype.validation = {
    init: function(form) {
      return this.form = $.extend(true, {}, this, form);
    },
    required: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Обязательное поле для заполнения"
      };
      valid = function() {
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
        return obj;
      };
      return valid();
    },
    not: function(val, rule) {
      var obj, self, valid;
      self = this.form;
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
    numeric: function(val, rule) {
      var obj, self, valid;
      self = this.form;
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
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Допустимы только буквы"
      };
      valid = function() {
        if (/^[a-zа-я]+$/i.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },
    eng: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Допустимы только английские буквы"
      };
      valid = function() {
        if (/^[a-z]+$/i.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },
    rus: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Допустимы только русские буквы"
      };
      valid = function() {
        if (/^[а-я]+$/i.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },
    alphaSpace: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Допустимы только буквы и пробелы"
      };
      valid = function() {
        if (/^[a-zа-я\s]+$/i.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },
    alphaNumericSpace: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Допустимы только буквы, цифры и пробелы"
      };
      valid = function() {
        if (/^[a-zа-я0-9\s]+$/i.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },
    engSpace: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Допустимы только английские буквы и пробелы"
      };
      valid = function() {
        if (/^[a-z\s]+$/i.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },
    rusSpace: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Допустимы только русские буквы и пробелы"
      };
      valid = function() {
        if (/^[а-я\s]+$/i.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },
    engDash: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Допустимы только английские буквы и подчеркивания"
      };
      valid = function() {
        if (/^[a-z_]+$/i.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },
    engNumeric: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Допустимы только английские буквы и цифры"
      };
      valid = function() {
        if (/^[a-z0-9]+$/i.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },
    engDashNumeric: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Допустимы только английские буквы, цифры и подчеркивания"
      };
      valid = function() {
        if (/^[a-z0-9_]+$/i.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },
    alphaNumeric: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Допустимы только буквы и цифры"
      };
      valid = function() {
        if (/^[a-zа-я0-9\s]+$/i.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },
    max: function(val, rule) {
      var count, obj, self, valid;
      self = this.form;
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
      var count, obj, self, valid;
      self = this.form;
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
      var obj, self, valid;
      self = this.form;
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
      var obj, self, valid;
      self = this.form;
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
    compare: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || "Поля не совпадают"
      };
      valid = function() {
        if (rule.field && self.fields[rule.field]) {
          if (rule.reason) {
            obj.reason = rule.reason.replace(/\{rule.field\}/g, rule.field);
          } else {
            obj.reason = "Поле не совпадает с " + rule.field;
          }
          console.log('_____', self.fields);
          if (val === self.fields[rule.field].val()) {
            obj.state = true;
          }
          return obj;
        }
        if (rule.val) {
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
      };
      return valid();
    },

    /* 1 Alphabet and 1 Number */
    pass1: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || '1 Alphabet and 1 Number'
      };
      valid = function() {
        if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]/.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },

    /* 1 Alphabet, 1 Number and 1 Special Character */
    pass2: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || '1 Alphabet, 1 Number and 1 Special Character'
      };
      valid = function() {
        if (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]/.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },

    /* 1 Uppercase Alphabet, 1 Lowercase Alphabet and 1 Number */
    pass3: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || '1 Uppercase Alphabet, 1 Lowercase Alphabet and 1 Number'
      };
      valid = function() {
        if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },

    /* 1 Uppercase Alphabet, 1 Lowercase Alphabet, 1 Number and 1 Special Character */
    pass4: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || '1 Uppercase Alphabet, 1 Lowercase Alphabet, 1 Number and 1 Special Character'
      };
      valid = function() {
        if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]/.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    },

    /* 1 Uppercase Alphabet, 1 Lowercase Alphabet, 1 Number and 1 Special Character */
    pass5: function(val, rule) {
      var obj, self, valid;
      self = this.form;
      obj = {
        state: false,
        reason: rule.reason || '1 Uppercase Alphabet, 1 Lowercase Alphabet, 1 Number and 1 Special Character'
      };
      valid = function() {
        if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]/.test(val)) {
          obj.state = true;
        }
        return obj;
      };
      return valid();
    }
  };

  return Form;

})();
