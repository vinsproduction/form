###
	Form
	https://github.com/vinsproduction/form
###

if !window.console
	window.console = {}

if !window.console.log
	window.console.log = ->

if !window.console.groupCollapsed
	window.console.groupCollapsed = window.console.log

if !window.console.groupEnd
	window.console.groupEnd = ->

class Form

	constructor: (@params={}) ->

		@logs = false # Логи отключены

		@formName = 'form'
		@formEl = false
		@submitEl = false

		# autoFields
		# Автоматическая сборка полей для отправки. Элементы с атрибутом [name]
		# Если false - обрабатываться будут только указанные поля!
		@autoFields = true

		@enter = true  # Отправка на Enter

		@disableSubmit = false # Заблокировать сабмит

		@classes =
			input:
				placeholder: "placeholder" # Класс плейсхолдера
			checkbox: 'checkbox'
			radio: 'radio'			
			select:
				select: 'select'
				selected: 'selected'
				options: 'options'
				option: 'option'
				open: 'open' # Класс открытого селекта
				placeholder: 'default' # Класс селекта значения по-умолчанию, например 'Выбрать'		
			submit:
				disable: 'disabled' # Класс заблокированного сабмита
			errorField: "error-field" # Класс ошибки поля
			error: "error" # Класс элемента вывода ошибки поля
			preloader: "preloader" # Класс прелоадера формы

		@templates =
			hidden: """<div style='position:absolute;width:0;height:0;overflow:hidden;'></div>"""
			checkbox: """<div></div>"""
			radio: """<div></div>"""
			select:
				select: """<div></div>"""
				selected: """<div><span>{selected}</span></div>"""
				options: """<div></div>"""
				option: """<div><span>{text}</span></div>"""
			error: """<div>{error}</div>"""

		@fields = {}

		@fieldsOptions =
			active: true # Активное поле
			style: true # Cтилизовать поле
			clearErrorsInFocus: true # Удалять ошибки в фокусе
			autoErrors: true # Автоматически показывать ошибку валидации конкретного поля, если 'all' - то все ошибки поля
			escape: false # Очищать инпут от тегов в отправке
			rules: {}

		@data = {}
		@errors = {}

		@onFail = (errors) ->
		@onSuccess = (data)   ->
		@onSubmit = (data) ->
		@onReset = ->
		@onInit = ->

		@mobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

		$.extend(true, @, @params)

		self = @

		$ ->

			if !self.formEl and self.logs then return console.log "[Form: #{self.formName}] Warning! formEl not set"
			if !self.submitEl and self.logs then return console.log "[Form: #{self.formName}] Warning! submitEl not set"

			self.form 		= if self.h.isObject(self.formEl) then self.formEl else $(self.formEl)
			self.submitBtn 	= if self.h.isObject(self.submitEl) then self.submitEl else self.form.find(self.submitEl)

			if !self.form.size() and self.logs then return console.log "[Form: #{self.formName}] Warning! formEl not found in DOM"
			if !self.submitBtn.size() and self.logs then return console.log "[Form: #{self.formName}] Warning! submitEl not found in DOM"

			self.form.attr('data-form', self.formName)
			self.submitBtn.attr('data-submit','data-submit')

			if self.autoFields
				self.form.find('[name]').each ->
					name = $(@).attr('name')
					if self.params.fields and self.params.fields[name] is false
						delete self.fields[name]
					else
						self.fields[name] = if self.params.fields and self.params.fields[name] then self.params.fields[name] else {}

			do self.init

			return

	init: ->

		self = @

		# Reset data!
		@resetData()
		
		# Reset errors!
		@clearErrors()
		@resetErorrs()

		# Remove Events!

		@form.find('[data-field]').off()
		@form.off()
		@submitBtn.off()

		# Add Events!

		@form.on 'click', '[data-field]', ->

			el = $(@)
			name = el.attr('data-name') || el.attr('name')

			return if !self.fields[name]

			if self.fields[name].clearErrorsInFocus
				self.errorField(name,false)

			el.trigger('Click',{name:name})

			return true

		@form.on 'style', '[data-field]', ->

			el = $(@)
			name = el.attr('name')

			return if !self.fields[name]

			if el.is("select")
				self.createSelect(name)

			else if el.attr('type') is 'radio'
				self.createRadio(name)

			else if el.attr('type') is 'checkbox'
				self.createCheckbox(name)

			if self.fields[name].sel.size()
				el.trigger('Style', {name:name,sel:self.fields[name].sel})

			return true

		@form.on 'change', '[data-field]', (e,data,withoutTrigger) ->

			el = $(@)
			name = el.attr('name')

			return if !self.fields[name]

			if el.is("select")
				self.createSelect(name,true)

			else if el.attr('type') is 'radio'
				self.createRadio(name,true)

			else if el.attr('type') is 'checkbox'
				self.createCheckbox(name,true)

			if !withoutTrigger
				el.trigger('Change',{name:name,val:el.val()})

			return true

		@form.on 'error', '[data-field]', (e,errors) ->

			el = $(@)
			name = el.attr('name')

			return if !self.fields[name]

			el.trigger('Error', {name:name,errors})

			return true

		@form.on 'reset', '[data-field]', ->

			el = $(@)
			name = el.attr('name')

			return if !self.fields[name]

			el.trigger('Reset', {name:name})

			return true

		# Submit

		@form.submit (e) -> e.preventDefault()

		if @disableSubmit
			@submit(false)
		else
			@submit(true)

		@form.mouseover -> self.form.inFocus = true
		@form.mouseout  -> self.form.inFocus = false

		if @enter
			$(window).keydown (event) ->
				if self.form.inFocus and event.keyCode is 13
					self.Submit() if !self._disableSubmit

		@submitBtn.click ->
			self.Submit() if !self._disableSubmit
			return false

		if @logs

			opts = {
				@autoFields
				@fields
				@fieldsOptions
				@enter
				@disableSubmit
				@classes
			}

			console.groupCollapsed("[Form: #{@formName}] init")
			console.log(opts)
			console.groupEnd()
		
		# Init Fields
		$.each @fields, (name) ->
			self.initField(name)

		do @onInit

		# Run triggers
		$.each @fields, (name) ->
			self.fields[name].el.eq(0).trigger('style') if self.fields[name].style

		# Init validation
		@validation.init(@)

		return

	initField: (name) ->

		self = @

		el = @form.find("[name='#{name}']")

		if !el.size()
			console.log "[Form: #{@formName}] Warning! selector '#{name}' not found"
			return

		@fields[name] = $.extend(true, {}, @fieldsOptions, @fields[name])

		@fields[name].form = @

		@fields[name].el = el
		@fields[name].sel = $([])

		@fields[name].el.attr('data-name',name)
		@fields[name].el.attr('data-field','original')

		if !@fields[name].el.attr('type')
			@fields[name].el.attr('type','text')

		@fields[name].type = if @fields[name].el.is('select') then 'select' else @fields[name].el.attr('type')

		@fields[name].el.attr('data-type',@fields[name].type)

		@fields[name].originalVal = self.getVal(name)
		if @fields[name].type is 'select'
			@fields[name].mobileKeyboard = true

		if @fields[name].placeholder and (@fields[name].type in ['text','textarea','password'])
			@placeholder(name)

		if @fields[name].rules.required
			@fields[name]._required = @fields[name].rules.required

		# Добавление кастомного правила, если его нет в библиотеке

		$.each @fields[name].rules, (ruleName,rule) ->
			if !self.validation[ruleName]
				self.addFieldRule(name,ruleName,rule)

		# Field functions

		@fields[name].val = (val) ->
			if val?
				self.setVal(name, val)
				return @
			else
				return self.getVal(name)

		@fields[name].activate = (flag=true) ->
			self.activate(name,flag)
			return @

		@fields[name].require = (opt={}) ->
			self.require(name,opt)
			return @

		@fields[name].stylize = ->
			self.fields[name].el.eq(0).trigger('style')
			return @

		@fields[name].reset = ->
			self.resetField(name)
			return @

		@fields[name].error = (errors=false) ->
			self.errorField(name,errors)
			return @

		@fields[name].validate = (ruleName,opt={}) ->
			return if !self.validation[ruleName]
			valid = self.validation[ruleName](self.getVal(name),opt)
			return valid.state

		@fields[name].addRule = (ruleName,rule) ->
			self.addFieldRule(name,ruleName,rule)
			return @

		return

	Submit: ->

		self = @

		do @resetData
		do @resetErorrs

		data = {} # для отправки данных

		console.groupCollapsed("[Form: #{@formName}] submit") if @logs

		$.each @fields, (name, opt) ->

			val = self.getVal(name)

			if opt.name
				data[opt.name] = if opt.escape then self.h.escapeText(val) else val
			else
				data[name] = if opt.escape then self.h.escapeText(val) else val

			if !opt.active

				delete data[name]

			else

				self.setData(name,val)

				console.log(name + ': ' + val) if self.logs

				self.errorField(name,false)

				if opt.rules and !self.h.isEmpty(opt.rules)

					$.each opt.rules, (ruleName,rule) ->
						if rule and self.validation[ruleName]
							if !self.h.isEmpty(val) or ruleName is 'required'
								valid = self.validation[ruleName](val, rule)
								if !valid.state
									self.setError(name,valid.reason)

		console.log("data",data) if @logs

		console.groupEnd() if @logs

		@onSubmit(data)

		if @h.isEmpty(@errors)
			do @Success
		else
			do @Fail

		return

	Fail: ->

		self = @

		console.groupCollapsed("[Form: #{@formName}] fail") if @logs

		$.each @fields, (name, opt) ->

			if self.errors[name]
				console.log(name + ': ', self.errors[name]) if self.logs
				if self.fields[name].autoErrors
					if self.fields[name].autoErrors is 'all'
						self.errorField(name,self.errors[name])
					else if self.errors[name][0]
						self.errorField(name,self.errors[name][0])

		console.log("data",@errors) if @logs

		console.groupEnd() if @logs

		$.each @fields, (name, opt) ->
			if self.errors[name]
				self.fields[name].el.eq(0).trigger('error',[self.errors[name]])

		@onFail(@errors)

		return

	Success: ->

		console.groupCollapsed("[Form: #{@formName}] success") if @logs

		for name,val of @data
			console.log(name, val) if @logs

		console.log("data",@data) if @logs

		console.groupEnd() if @logs

		@onSuccess(@data)

		return


	createCheckbox: (name,change) ->

		self = @

		checkboxTemplate = @templates.checkbox

		if change

			if @fields[name].val()
				@fields[name].sel.attr('data-checked','data-checked')
			else
				@fields[name].sel.removeAttr('data-checked')

		else

			if @form.find("[data-field='original'][data-type='checkbox'][data-name='#{name}']").parent().attr('data-wrap')
				@form.find("[data-field='original'][data-type='checkbox'][data-name='#{name}']").unwrap()

			@form.find("[data-field='styled'][data-type='checkbox'][data-name='#{name}']").remove()

			val = @fields[name].el.attr('value')

			$checkbox = $(checkboxTemplate)
			$checkbox.addClass(@classes.checkbox)
			$checkbox.attr('data-field','styled')
			$checkbox.attr('data-type','checkbox')
			$checkbox.attr('data-name',name)
			$checkbox.attr('data-value',val)

			@fields[name].el.after $checkbox
			@fields[name].sel = $checkbox

			$hiddenWrap = $(@templates.hidden)
			$hiddenWrap.attr('data-wrap',name)
			@fields[name].el.wrap($hiddenWrap)

			$checkbox.attr('data-checked','data-checked') if @fields[name].el.prop( "checked" )

			$checkbox.on 'click', ->

				if self.fields[name].el.prop("checked")
					self.setVal(name, false)
				else
					self.setVal(name, val)

		return

	createRadio: (name,change) ->

		self = @

		if change

			@fields[name].sel.removeAttr('data-checked')
			@fields[name].sel.filter("[data-value='#{@fields[name].val()}']").attr('data-checked','data-checked')

		else

			if @form.find("[data-field='original'][data-type='radio'][data-name='#{name}']").parent().attr('data-wrap')
				@form.find("[data-field='original'][data-type='radio'][data-name='#{name}']").unwrap()
			
			@form.find("[data-field='styled'][data-type='radio'][data-name='#{name}']").remove()

			@fields[name].sel = $([])

			@fields[name].el.each ->

				el = $(@)

				val = el.attr('value')

				$radio 	= $(self.templates.radio)

				$radio.addClass(self.classes.radio)
				$radio.attr('data-field','styled')
				$radio.attr('data-type','radio')
				$radio.attr('data-name',name)
				$radio.attr('data-value',val)

				$radio.attr('data-checked','data-checked') if el.attr('checked')

				el.after $radio
				self.fields[name].sel = self.fields[name].sel.add($radio)

				$hiddenWrap = $(self.templates.hidden)
				$hiddenWrap.attr('data-wrap',name)
				el.wrap($hiddenWrap)

				$radio.on 'click', ->
					self.setVal(name, val)


		return

	createSelect: (name,change) ->

		self = @

		if change

			@fields[name].sel.removeClass(@classes.select.open)

			@fields[name].sel.find("[data-selected]").html @fields[name].sel.find("[data-option][data-value='#{@fields[name].val()}']").html()

			if @fields[name].placeholder and @fields[name].placeholder is @fields[name].el.val()
				@fields[name].sel.find("[data-selected]").addClass(self.classes.select.placeholder)
			else
				@fields[name].sel.find("[data-selected]").removeClass(self.classes.select.placeholder)

			@fields[name].sel.find("[data-options]").hide()

			@fields[name].sel.find("[data-option]").removeAttr('data-checked')
			@fields[name].sel.find("[data-option][data-value='#{@fields[name].val()}']").attr('data-checked','data-checked')

	
		else

			if @form.find("[data-field='original'][data-type='select'][data-name='#{name}']").parent().attr('data-wrap')
				@form.find("[data-field='original'][data-type='select'][data-name='#{name}']").unwrap()
			
			@form.find("[data-field='styled'][data-type='select'][data-name='#{name}']").remove()

			$select  = $(@templates.select.select)

			$select.addClass(@classes.select.select)
			$select.attr('data-field', 'styled')
			$select.attr('data-type', 'select')
			$select.attr('data-name', name)

			if @fields[name].el.find('option[selected]').size()
				selectedText 	= @fields[name].el.find('option:selected').text()
			else
				selectedText 	= @fields[name].el.find('option:first-child').text()

			selectedTemplate = @templates.select.selected.replace('{selected}',selectedText)
			$selected = $(selectedTemplate)

			$selected.addClass(@classes.select.selected)
			$selected.attr('data-selected','data-selected')

			$options = $(@templates.select.options)

			$options.addClass(@classes.select.options)
			$options.attr('data-options','data-options')
			$options.hide()

			$select.append $selected
			$select.append $options

			@fields[name].el.after $select
			@fields[name].sel = $select

			$hiddenWrap = $(self.templates.hidden)
			$hiddenWrap.attr('data-wrap',name)
			@fields[name].el.wrap($hiddenWrap)

			if @fields[name].mobileKeyboard and @mobileBrowser
				$select.on 'click', ->
					self.fields[name].el.focus()
				@fields[name].el.on 'blur', ->
					self.setVal(name,self.fields[name].el.val())

			else
				$selected.on 'click', ->
					if $select.hasClass(self.classes.select.open)
						$select.removeClass(self.classes.select.open)
						$options.hide()
					else
						$select.addClass(self.classes.select.open)
						$options.show()

			$(window).click (event) ->

				if !$(event.target).closest($select).length and !$(event.target).is($select)
					$select.removeClass(self.classes.select.open)
					$options.hide()

			if @fields[name].placeholder and @fields[name].placeholder is selectedText
				$selected.addClass self.classes.select.placeholder

			@fields[name].el.find('option').each ->

				if !$(@).attr('value') || self.h.isEmpty($(@).attr('value'))
					$(@).attr('value', $(@).text())

				val = $(@).attr('value')

				text = $(@).text()

				option = self.templates.select.option.replace('{text}',text)
				$option = $(option)

				$option.addClass(self.classes.select.option)
				$option.attr('data-option', 'data-option')
				$option.attr('data-value', val)

				if $(@).is(':first-child')
					$option.attr('data-checked','data-checked')

				$option.on 'click', ->
					self.setVal(name,$(@).attr('data-value'))

				$options.append $option

		return

	setVal: (name,val,withoutTrigger=false) ->

		return if !@fields[name]

		opt  = @fields[name]

		if opt.type is 'radio'
			opt.el.prop("checked", false)
			opt.el.filter("[value='#{val}']").prop("checked", val)

		else if opt.type is 'checkbox'
			opt.el.prop("checked", val)

		else if opt.type in ['text','password','textarea']
			opt.el.val(@h.trim(val))

			if opt.placeholder
				opt.el.trigger('blur')

		else
			opt.el.val(val)

		opt.el.eq(0).trigger('change',[{name,val},withoutTrigger])

		return

	getVal: (name) ->

		return if !@fields[name]

		opt = @fields[name]

		if opt.type in ['checkbox','radio']
			val = opt.el.filter(":checked").val() || false

		else if opt.type in ['text','password','textarea']
			val = if opt.el.hasClass(@classes.input.placeholder) then "" else @h.trim(opt.el.val())

		else
			val = opt.el.val()

		return val

	reset: ->

		self = @

		do @resetData
		do @resetErorrs

		$.each @fields, (name, opt) ->

			if self.fields[name].new
				self.removeField name
			else
				self.fields[name].reset()

		console.log("[Form: #{@formName}] reset") if @logs

		do @onReset

		return

	resetErorrs: -> @errors = {}

	resetData: -> @data = {}

	setData: (name,val) ->

		if !@data[name] then @data[name] = val

		return

	getData: -> @data

	setError: (name,val) ->

		if !@errors[name]
			@errors[name] = []

		@errors[name].push val

		return

	getErrors: -> @errors

	clearErrors: ->

		self = @

		@form.find('.' + @classes.error).empty()
		@form.find('[data-field]').removeClass(@classes.errorField)

		return

	errorField: (name,errors) ->

		return if !@fields[name]

		self = @

		if errors

			@fields[name].el.addClass(@classes.errorField)
			@fields[name].sel.addClass(@classes.errorField) if @fields[name].sel

			if @fields[name].autoErrors
				$error = @form.find('.' + @classes.error + '-' + name)

				if @h.isArray(errors)
					$error.empty()
					$.each errors, (k,v) ->
						error  = self.templates.error.replace('{error}',v)
						$error.append(error)
				else
					error = self.templates.error.replace('{error}',errors)
					$error.html(error)

		else

			@fields[name].el.removeClass(@classes.errorField)
			@fields[name].sel.removeClass(@classes.errorField) if @fields[name].sel

			if @fields[name].autoErrors
				@form.find('.' + @classes.error + '-' + name).empty()

		return

	resetField: (name) ->

		return if !@fields[name]

		@setVal(name,@fields[name].originalVal,true)
		@errorField(name,false)
		@fields[name].el.eq(0).trigger('reset')

		return

	addField: (name,opt) ->

		@fields[name] = opt
		@initField(name,true)

		@validation.init(@)

		@fields[name].new = true

		opt.onInit() if opt.onInit

		console.log("[Form: #{@formName}] add field", name) if @logs

		@fields[name].el.trigger('style') if @fields[name].style
		
		return

	removeField: (name) ->

		return if !@fields[name]

		@fields[name].el.removeAttr('data-field')
		@fields[name].el.unwrap() if @fields[name].style
		@fields[name].sel.remove() if @fields[name].sel

		console.log("[Form: #{@formName}] delete field", name) if @logs

		delete @fields[name]

		return

	require: (name,opt) ->

		return if !@fields[name]

		if opt and @fields[name]._required
			@fields[name].rules.required = @fields[name]._required
		else
			@fields[name].rules.required = opt

		return

	newRule: (name,rule) ->

		@validation[name] = (val) ->

			obj =
				state: false
				reason: rule.reason || 'unknown reason'

			valid = ->

				if rule.condition(val)
					obj.state = true

				return obj

			return valid()

		return

	addFieldRule: (name,ruleName,rule={}) ->

		return if !@fields[name] or !ruleName

		if !@validation[ruleName] and rule.condition
			@newRule(ruleName, rule)

		@fields[name].rules[ruleName] = rule

		console.log("[Form: #{@formName}] add rule '#{ruleName}'") if @logs

		return 

	activate: (name,flag) ->

		return if !@fields[name]

		@fields[name].active = flag

		return

	placeholder: (name) ->

		return if !@fields[name]

		self = @

		@fields[name].el
			.focus ->
				if $(@).hasClass(self.classes.input.placeholder)
					$(@).val("").removeClass(self.classes.input.placeholder)
			.blur ->
				if self.h.isEmpty($(@).val())
					$(@).val(self.fields[name].placeholder).addClass(self.classes.input.placeholder)
				else
					$(@).removeClass(self.classes.input.placeholder)
		
		@fields[name].el.blur()

		return

	submit: (flag=true) ->

		if flag
			@_disableSubmit = false
			@submitBtn.removeClass(@classes.submit.disable)
		else
			@_disableSubmit = true
			@submitBtn.addClass(@classes.submit.disable)

		return

	preloader: (flag=true) ->

		preloader = @form.find('.' + @classes.preloader)

		if flag
			preloader.show()
		else
			preloader.hide()
		return

	### Helpers ###

	h:

		trim: (text="") ->
			return text if !@isString(text)
			text.replace(/^\s+|\s+$/g, '')
		stripHTML: (text="") ->
			return text if !@isString(text)
			text.replace(/<(?:.|\s)*?>/g, '')
		escapeText: (text="") ->
			return text if !@isString(text)
			text.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
		isFunction: (obj) -> Object.prototype.toString.call(obj) is '[object Function]'
		isString: (obj) -> Object.prototype.toString.call(obj) is '[object String]'
		isArray: (obj) -> Object.prototype.toString.call(obj) is '[object Array]'
		isObject: (obj) -> Object.prototype.toString.call(obj) is '[object Object]'
		isEmpty: (o) ->
			if @isString(o)
				return if @trim(o) is "" then true else false
			if @isArray(o)
				return if o.length is 0 then true else false
			if @isObject(o)
				for i of o
					if o.hasOwnProperty(i)
						return false
				return true
		declOfNum: (number, titles) ->
			cases = [2, 0, 1, 1, 1, 2]
			titles[(if (number % 100 > 4 and number % 100 < 20) then 2 else cases[(if (number % 10 < 5) then number % 10 else 5)])]

		###  Validation ###

	validation:

		init: (form) ->

			@form = $.extend(true, {}, @, form)

		required: (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Обязательное поле для заполнения"

			valid = ->

				if rule.not
					if self.h.isArray(rule.not)
						if val? and !self.h.isEmpty(val) and (val not in rule.not)
							obj.state = true
					else
						if val? and !self.h.isEmpty(val) and (val isnt rule.not)
							obj.state = true

				else
					if val? and !self.h.isEmpty(val)
						obj.state = true

				return obj

			return valid()

		not: (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Недопустимое значение"

			valid = ->

				if rule.val?

					if self.h.isArray(rule.val)
						if val not in rule.val
							obj.state = true
						else
							if val isnt rule.val
								obj.state = true

				else

					if self.h.isArray(rule)
						if val not in rule
							obj.state = true
					else
						if val isnt rule
							obj.state = true

				return obj

			return valid()

		numeric : (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Допустимы только цифры"

			valid = ->

				if /^[0-9]+$/.test(val)
					obj.state = true

				return obj

			return valid()

		alpha : (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Допустимы только буквы"

			valid = ->

				if /^[a-zа-я]+$/i.test(val)
					obj.state = true

				return obj

			return valid()

		eng : (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Допустимы только английские буквы"

			valid = ->

				if /^[a-z]+$/i.test(val)
					obj.state = true

				return obj

			return valid()

		rus: (val, rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Допустимы только русские буквы"

			valid = ->

				if /^[а-я]+$/i.test(val)
					obj.state = true

				return obj

			return valid()

		alphaSpace : (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Допустимы только буквы и пробелы"

			valid = ->

				if /^[a-zа-я\s]+$/i.test(val)
					obj.state = true

				return obj

			return valid()

		engSpace : (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Допустимы только английские буквы и пробелы"

			valid = ->

				if /^[a-z\s]+$/i.test(val)
					obj.state = true

				return obj

			return valid()

		rusSpace: (val, rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Допустимы только русские буквы и пробелы"

			valid = ->

				if /^[а-я\s]+$/i.test(val)
					obj.state = true

				return obj

			return valid()

		engDash : (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Допустимы только английские буквы и подчеркивания"

			valid = ->

				if /^[a-z_]+$/i.test(val)
					obj.state = true

				return obj

			return valid()

		engNumeric : (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Допустимы только английские буквы и цифры"

			valid = ->

				if /^[a-z0-9]+$/i.test(val)
					obj.state = true

				return obj

			return valid()

		engDashNumeric : (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Допустимы только английские буквы, цифры и подчеркивания"

			valid = ->

				if /^[a-z0-9_]+$/i.test(val)
					obj.state = true

				return obj

			return valid()

		alphaNumeric : (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Допустимы только буквы и цифры"

			valid = ->

				if /^[a-zа-я0-9\s]+$/i.test(val)
					obj.state = true

				return obj

			return valid()

		max: (val,rule) ->

			self = @form

			obj = {state: false}

			count = rule.count || rule

			if rule.reason
				obj.reason = rule.reason.replace(/\{count\}/g, rule.count) 
			else
				obj.reason = "Максимум #{count} #{self.h.declOfNum(count, ['символ', 'символа', 'символов'])}"

			valid = ->

				if val.length <= count
					obj.state = true

				return obj

			return valid()

		min : (val,rule) ->

			self = @form

			obj = {state: false}

			count = rule.count || rule

			if rule.reason
				obj.reason = rule.reason.replace(/\{count\}/g, rule.count) 
			else
				obj.reason = "Минимум #{count} #{self.h.declOfNum(count, ['символ', 'символа', 'символов'])}"

			valid = ->

				if val.length >= count
					obj.state = true

				return obj

			return valid()

		email: (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason  || 'Неправильно заполненный E-mail'

			valid = ->

				if /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/.test(val)
					obj.state = true

				return obj

			return valid()

		url: (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason  || 'Неправильно заполненный url'

			valid = ->

				if /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(val)
					obj.state = true

				return obj

			return valid()

		compare: (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason || "Поля не совпадают"

			valid = ->

				if rule.field and self.fields[rule.field]

					if rule.reason
						obj.reason = rule.reason.replace(/\{rule.field\}/g, rule.field)
					else
						obj.reason = "Поле не совпадает с #{rule.field}"

					console.log '_____', self.fields

					if val is self.fields[rule.field].val()
							obj.state = true
						return obj

				if rule.val
					if self.h.isFunction(rule.val)
						if val is rule.val()
							obj.state = true
					else
						if val is rule.val
							obj.state = true

					return obj

			return valid()

		
		### 1 Alphabet and 1 Number ###	
		pass1: (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason  || '1 Alphabet and 1 Number'

			valid = ->

				if /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]/.test(val)
					obj.state = true

				return obj

			return valid()

		### 1 Alphabet, 1 Number and 1 Special Character ###	
		pass2: (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason  || '1 Alphabet, 1 Number and 1 Special Character'

			valid = ->

				if /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]/.test(val)
					obj.state = true

				return obj

			return valid()

		### 1 Uppercase Alphabet, 1 Lowercase Alphabet and 1 Number ###	
		pass3: (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason  || '1 Uppercase Alphabet, 1 Lowercase Alphabet and 1 Number'

			valid = ->

				if /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/.test(val)
					obj.state = true

				return obj

			return valid()

		### 1 Uppercase Alphabet, 1 Lowercase Alphabet, 1 Number and 1 Special Character ###	
		pass4: (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason  || '1 Uppercase Alphabet, 1 Lowercase Alphabet, 1 Number and 1 Special Character'

			valid = ->

				if /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]/.test(val)
					obj.state = true

				return obj

			return valid()

		### 1 Uppercase Alphabet, 1 Lowercase Alphabet, 1 Number and 1 Special Character ###	
		pass5: (val,rule) ->

			self = @form

			obj =
				state: false
				reason: rule.reason  || '1 Uppercase Alphabet, 1 Lowercase Alphabet, 1 Number and 1 Special Character'

			valid = ->

				if /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]/.test(val)
					obj.state = true

				return obj

			return valid()



