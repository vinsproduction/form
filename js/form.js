
/* Form */

/* https://github.com/vinsproduction/form */
var Form;

Form = (function() {
  function Form(params) {
    var self;
    this.params = params != null ? params : {};
    if (!window.console) {
      window.console = {};
    }
    if (!window.console.groupCollapsed) {
      window.console.groupCollapsed = function() {};
    }
    if (!window.console.groupEnd) {
      window.console.groupEnd = function() {};
    }
    self = this;
    this.logs = false;
    this.formName = false;
    this.formEl = false;
    this.submitEl = false;

    /*
    		autoFields
    		Автоматическая сборка полей для отправки. Элементы с атрибутом [name]
    		Если false - обрабатываться будут только указанные поля!
     */
    this.autoFields = true;
    this.enter = true;
    this.disableSubmit = false;
    this.classes = {
      disableSubmitClass: 'disabled-submit',
      placeholderClass: "placeholder",
      errorFieldClass: "error-field",
      errorClass: "error",
      preloaderClass: "preloader"
    };
    this.templates = {
      checkbox: "<div class=\"checkbox\"></div>",
      radio: "<div class=\"radio\"></div>",
      select: {
        select: "<div class=\"select\"></div>",
        selected: "<div class=\"selected\"><span>{selected}</span></div>",
        options: "<div class=\"options\"></div>",
        option: "<div class=\"option\"><span>{text}</span></div>"
      }
    };
    this.fields = {};
    this.fieldsOptions = {
      style: true,
      focus: false,
      clearErrorsInFocus: true,
      autoErrors: true,
      escape: false,
      rules: {},
      onError: function(fieldName, errors) {}
    };
    this.data = {};
    this.errors = {};
    this.onFail = function(errors) {};
    this.onSuccess = function(data) {};
    this.onSubmit = function(data) {};
    this.onReset = function() {};
    this.onLoad = function() {};
    this.onInit = function() {};
    $.extend(true, this, this.params);
    $(function() {
      if (!self.formEl && self.logs) {
        return console.log("[Form: " + self.formName + "] Warning! formEl not set");
      }
      if (!self.submitEl && self.logs) {
        return console.log("[Form: " + self.formName + "] Warning! submitEl not set");
      }
      self.form = self.isObject(self.formEl) ? self.formEl : $(self.formEl);
      self.submitBtn = self.isObject(self.submitEl) ? self.submitEl : self.form.find(self.submitEl);
      if (!self.form.size() && self.logs) {
        return console.log("[Form: " + self.formName + "] Warning! formEl not found in DOM");
      }
      if (!self.submitBtn.size() && self.logs) {
        return console.log("[Form: " + self.formName + "] Warning! submitEl not found in DOM");
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
    if (this.params.disableSubmit) {
      this.lockSubmit();
    } else {
      this.unlockSubmit();
    }
    this.submitBtn.click(function() {
      if (!self.disableSubmit) {
        self.submit();
      }
      return false;
    });
    $.each(this.fields, function(name) {
      return self.initField(name);
    });
    opts = {
      autoFields: this.autoFields,
      fields: this.fields,
      fieldsOptions: this.fieldsOptions,
      enter: this.enter,
      disableSubmit: this.disableSubmit,
      classes: this.classes
    };
    this.form.find('[data-field]').each(function() {
      var name;
      name = $(this).attr('data-field');
      $(this).removeClass(self.classes.errorFieldClass);
      if (self.fields[name].autoErrors) {
        return self.form.find('.' + self.classes.errorClass + '-' + name).empty();
      }
    });
    this.form.on('style', '[data-field]', function() {
      var name;
      name = $(this).attr('data-field');
      self.fields[name].sel.removeClass(self.classes.errorFieldClass);
      if (self.fields[name].autoErrors) {
        return self.form.find('.' + self.classes.errorClass + '-' + name).empty();
      }
    });
    this.form.on('click', '[data-field]', function() {
      var name;
      name = $(this).attr('data-field');
      if (self.fields[name].clearErrorsInFocus) {
        $(this).removeClass(self.classes.errorFieldClass);
      }
      if (self.fields[name].autoErrors) {
        return self.form.find('.' + self.classes.errorClass + '-' + name).empty();
      }
    });
    if (self.logs) {
      console.log("[Form: " + this.formName + "] init", opts);
    }
    this.onInit();
    $.each(this.fields, function(name) {
      if (self.fields[name].style) {
        return self.fields[name].el.trigger('style');
      }
    });
  };

  Form.prototype.initField = function(name, isNew) {
    var el, ref, self;
    self = this;
    el = this.form.find("[name='" + name + "']");
    if (!el.size()) {
      console.log("[Form: " + this.formName + "] Warning! selector '" + name + "' not found");
      return;
    }
    this.fields[name] = $.extend(true, {}, this.fieldsOptions, this.fields[name]);
    this.fields[name].el = el;
    this.fields[name].sel = $([]);
    this.fields[name].el.unbind();
    this.fields[name].el.attr('data-field', name);
    if (isNew) {
      this.fields[name]["new"] = true;
    }
    this.fields[name].val = function(val) {
      if (val != null) {
        self.setVal(name, val);
      } else {
        return self.getVal(name);
      }
    };
    if (this.fields[name].el.is("select")) {
      this.fields[name].type = 'select';
      this.fields[name].el.on('change', function() {
        return self.createSelect(name, true);
      });
      this.fields[name].el.on('style', function() {
        return self.createSelect(name);
      });
    } else if (this.fields[name].el.attr('type') === 'radio') {
      this.fields[name].type = 'radio';
      this.fields[name].el.on('change', function() {
        return self.createRadio(name, true);
      });
      this.fields[name].el.on('style', function() {
        return self.createRadio(name);
      });
    } else if (this.fields[name].el.attr('type') === 'checkbox') {
      this.fields[name].type = 'checkbox';
      this.fields[name].el.on('change', function() {
        return self.createCheckbox(name, true);
      });
      this.fields[name].el.on('style', function() {
        return self.createCheckbox(name);
      });
    } else if (this.fields[name].el.is("textarea")) {
      this.fields[name].type = 'textarea';
      this.fields[name].style = false;
    } else {
      this.fields[name].type = 'text';
      this.fields[name].style = false;
    }
    if (this.fields[name].style) {
      this.fields[name].stylize = function() {
        return self.fields[name].el.trigger('style');
      };
    }
    this.fields[name].originVal = this.fields[name].val();
    if (this.fields[name].placeholder && ((ref = this.fields[name].type) === 'text' || ref === 'textarea')) {
      this.placeholder(this.fields[name].el, this.fields[name].placeholder);
    }
    if (this.fields[name].focus) {
      this.fields[name].el.focus();
    }
  };

  Form.prototype.addField = function(name, opt) {
    if (opt == null) {
      opt = this.fieldsOptions;
    }
    this.fields[name] = opt;
    this.initField(name, true);
    if (this.fields[name].style) {
      this.fields[name].el.trigger('style');
    }
    if (this.logs) {
      console.log("[Form: " + this.formName + "] add", name);
    }
  };

  Form.prototype.removeField = function(name) {
    if (this.fields[name].sel) {
      this.fields[name].sel.remove();
    }
    if (this.fields[name].style) {
      this.fields[name].el.show();
    }
    if (this.logs) {
      console.log("[Form: " + this.formName + "] delete", name);
    }
    delete this.fields[name];
  };

  Form.prototype.createCheckbox = function(name, change) {
    var $checkbox, checkboxTemplate, self, val;
    self = this;
    this.fields[name].el.hide();
    checkboxTemplate = this.templates.checkbox;
    if (change) {
      if (this.fields[name].val()) {
        this.fields[name].sel.attr('data-checked', 'data-checked');
      } else {
        this.fields[name].sel.removeAttr('data-checked');
      }
    } else {
      this.form.find("[data-checkbox][data-name='" + name + "']").remove();
      val = this.fields[name].el.attr('value');
      $checkbox = $(checkboxTemplate);
      $checkbox.attr('data-field', name);
      $checkbox.attr('data-checkbox', 'data-checkbox');
      $checkbox.attr('data-name', name);
      $checkbox.attr('data-value', val);
      this.fields[name].sel = $checkbox;
      this.fields[name].el.after($checkbox);
      if (this.fields[name].el.attr('checked')) {
        $checkbox.attr('data-checked', 'data-checked');
      }
      $checkbox.click(function() {
        if (self.fields[name].el.is(':checked')) {
          return self.setVal(name, false);
        } else {
          return self.setVal(name, val);
        }
      });
    }
  };

  Form.prototype.createRadio = function(name, change) {
    var radioTemplate, self;
    self = this;
    this.fields[name].el.hide();
    radioTemplate = this.templates.radio;
    if (change) {
      this.fields[name].sel.removeAttr('data-checked');
      this.fields[name].sel.filter("[data-value='" + (this.fields[name].val()) + "']").attr('data-checked', 'data-checked');
    } else {
      this.form.find("[data-radio][data-name='" + name + "']").remove();
      this.fields[name].sel = $([]);
      this.fields[name].el.each(function() {
        var $radio, el, val;
        el = $(this);
        el.hide();
        val = el.attr('value');
        $radio = $(radioTemplate);
        $radio.attr('data-field', name);
        $radio.attr('data-radio', 'data-radio');
        $radio.attr('data-name', name);
        $radio.attr('data-value', val);
        if (el.attr('checked')) {
          $radio.attr('data-checked', 'data-checked');
        }
        self.fields[name].sel = self.fields[name].sel.add($radio);
        el.after($radio);
        return $radio.click(function() {
          return self.setVal(name, val);
        });
      });
    }
  };

  Form.prototype.createSelect = function(name, change) {
    var $options, $select, $selected, optionTemplate, optionsTemplate, selectClose, selectTemplate, selectedTemplate, selectedText, self;
    self = this;
    this.fields[name].el.hide();
    selectTemplate = this.templates.select.select;
    selectedTemplate = this.templates.select.selected;
    optionsTemplate = this.templates.select.options;
    optionTemplate = this.templates.select.option;
    if (change) {
      this.fields[name].sel.find('[data-selected]').html(this.fields[name].sel.find("[data-option][data-val='" + (this.fields[name].val()) + "']").html());
      if (this.fields[name].defaultStyle && this.fields[name].defaultStyle === this.fields[name].el.val()) {
        this.fields[name].sel.find('[data-selected]').addClass('default');
      } else {
        this.fields[name].sel.find('[data-selected]').removeClass('default');
      }
    } else {
      this.form.find("[data-select][data-name='" + name + "']").remove();
      $select = $(selectTemplate);
      $select.attr('data-field', name);
      $select.attr('data-select', 'data-select');
      $select.attr('data-name', name);
      if (this.fields[name].el.find('option[selected]').size()) {
        selectedText = this.fields[name].el.find('option:selected').text();
      } else {
        selectedText = this.fields[name].el.find('option:first-child').text();
      }
      selectedTemplate = selectedTemplate.replace('{selected}', selectedText);
      $selected = $(selectedTemplate);
      $selected.attr('data-selected', 'data-selected');
      $options = $(optionsTemplate);
      $options.attr('data-options', 'data-options');
      $options.hide();
      $select.append($selected);
      $select.append($options);
      this.fields[name].el.after($select);
      this.fields[name].sel = $select;
      $selected.click(function() {
        if ($select.hasClass('open')) {
          $select.removeClass('open');
          return $options.hide();
        } else {
          $select.addClass('open');
          return $options.show();
        }
      });
      if (this.fields[name].defaultStyle && this.fields[name].defaultStyle === selectedText) {
        $selected.addClass('default');
      }
      selectClose = true;
      $select.mouseover(function() {
        return selectClose = false;
      });
      $select.mouseout(function() {
        return selectClose = true;
      });
      $(window).click(function() {
        if (selectClose) {
          $select.removeClass('open');
          return $options.hide();
        }
      });
      this.fields[name].el.find('option').each(function() {
        var $option, option, text, val;
        if (!$(this).attr('value') || self.isEmpty($(this).attr('value'))) {
          $(this).attr('value', $(this).text());
        }
        val = $(this).attr('value');
        text = $(this).text();
        option = optionTemplate.replace('{text}', text);
        $option = $(option);
        $option.attr('data-option', 'data-option');
        $option.attr('data-val', val);
        if ($(this).is(':first-child')) {
          $option.attr('data-checked', 'data-checked');
        }
        $option.click(function() {
          self.setVal(name, $(this).attr('data-val'));
          $options.find('[data-option]').removeAttr('data-checked');
          $(this).attr('data-checked', 'data-checked');
          $select.removeClass('open');
          return $options.hide();
        });
        return $options.append($option);
      });
    }
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
        this.placeholder(opt.el, opt.el.placeholder);
      } else {
        opt.el.removeClass(this.classes.placeholderClass);
      }
    }
    opt.el.trigger('change', [
      {
        name: name,
        val: val,
        el: opt.el
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
      val = this.trim(opt.el.val());
      if (opt.placeholder && (val === opt.placeholder)) {
        val = "";
      }
    }
    return val;
  };

  Form.prototype.submit = function() {
    var data, self;
    self = this;
    this.resetData();
    this.resetErorrs();
    data = {};
    console.groupCollapsed("[Form: " + this.formName + "] submit");
    $.each(this.fields, function(name, opt) {
      var val;
      val = self.getVal(name);
      if (opt.name) {
        data[opt.name] = opt.escape ? self.escapeText(val) : val;
      } else {
        data[name] = opt.escape ? self.escapeText(val) : val;
      }
      self.setData(name, val);
      if (self.logs) {
        console.log(name + ': ' + val);
      }
      opt.el.removeClass(self.classes.errorFieldClass);
      if (opt.sel) {
        opt.sel.removeClass(self.classes.errorFieldClass);
      }
      if (opt.autoErrors) {
        self.form.find('.' + self.classes.errorClass + '-' + name).empty();
      }
      if (opt.rules && !self.isEmpty(opt.rules)) {
        return $.each(opt.rules, function(ruleName, rule) {
          var valid;
          if (rule) {
            valid = self.validate[ruleName](val, rule);
            if (!valid.state) {
              return self.setError(name, valid.reason);
            }
          }
        });
      }
    });
    if (this.logs) {
      console.log("data", data);
    }
    console.groupEnd();
    this.onSubmit(data);
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
      var error, i, ref;
      if (self.errors[name]) {
        if (self.logs) {
          console.log(name + ': ', self.errors[name]);
        }
        opt.el.addClass(self.classes.errorFieldClass);
        if (opt.sel) {
          opt.sel.addClass(self.classes.errorFieldClass);
        }
        if (self.fields[name].autoErrors) {
          if (self.fields[name].autoErrors === 'all') {
            ref = self.errors[name];
            for (i in ref) {
              error = ref[i];
              self.form.find('.' + self.classes.errorClass + '-' + name).append(error + "<br/>");
            }
          } else {
            self.form.find('.' + self.classes.errorClass + '-' + name).html(self.errors[name][0]);
          }
        }
        return opt.onError(name, self.errors[name]);
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
    console.groupCollapsed("[Form: " + this.formName + "] success");
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
      if (self.fields[name]["new"]) {
        return self.removeField(name);
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
        state: val.length <= (rule.count || rule) || val === "",
        reason: rule.reason || ("Максимум " + (rule.count || rule) + " " + (this.declOfNum(rule.count || rule, ['символ', 'символа', 'символов'])))
      };
      return valid;
    },
    min: function(val, rule) {
      var valid;
      if (rule.reason) {
        rule.reason = rule.reason.replace(/\{count\}/g, rule.count);
      }
      valid = {
        state: val.length >= (rule.count || rule) || val === "",
        reason: rule.reason || ("Минимум " + (rule.count || rule) + " " + (this.declOfNum(rule.count || rule, ['символ', 'символа', 'символов'])))
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
    this.validate[opt.rule] = function(val, args, description) {
      var valid;
      valid = {
        state: opt.condition(val) || val === "",
        reason: opt.reason || 'custom reason'
      };
      return valid;
    };
    return console.log("[Form: " + this.formName + "] add rule", opt);
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
    if (!this.isString(text)) {
      return text;
    }
    return text.replace(/^\s+|\s+$/g, '');
  };

  Form.prototype.stripHTML = function(text) {
    if (text == null) {
      text = "";
    }
    if (!this.isString(text)) {
      return text;
    }
    return text.replace(/<(?:.|\s)*?>/g, '');
  };

  Form.prototype.escapeText = function(text) {
    if (text == null) {
      text = "";
    }
    if (!this.isString(text)) {
      return text;
    }
    return text.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
