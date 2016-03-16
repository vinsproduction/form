###
	Form
	https://github.com/vinsproduction/form
###

class Form

	constructor: (@params={}) ->

		if !window.console
			window.console = {}

		if !window.console.groupCollapsed
			window.console.groupCollapsed = ->
				console.log.apply(console,arguments) if window.console.log

		if !window.console.groupEnd
			window.console.groupEnd = ->


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
			onError: (fieldName, errors) ->
	
		@data = {}
		@errors = {}

		@onFail = (errors) ->
		@onSuccess = (data)   ->
		@onSubmit = (data) ->
		@onReset = ->
		@onInit = ->

		$.extend(true, @, @params)

		self = @

		do @validation

		$ ->

			if !self.formEl and self.logs then return console.log "[Form: #{self.formName}] Warning! formEl not set"
			if !self.submitEl and self.logs then return console.log "[Form: #{self.formName}] Warning! submitEl not set"

			self.form 		= if self.isObject(self.formEl) then self.formEl else $(self.formEl)
			self.submitBtn 	= if self.isObject(self.submitEl) then self.submitEl else self.form.find(self.submitEl)

			if !self.form.size() and self.logs then return console.log "[Form: #{self.formName}] Warning! formEl not found in DOM"
			if !self.submitBtn.size() and self.logs then return console.log "[Form: #{self.formName}] Warning! submitEl not found in DOM"

			self.form.attr('data-form', self.formName)
			self.submitBtn.attr('data-submit','data-submit')

			self.form.mouseover -> self.form.inFocus = true
			self.form.mouseout  -> self.form.inFocus = false

			if self.enter

				$(window).keydown (event) ->
					if self.form.inFocus and event.keyCode is 13
						self.submit() if !self._disableSubmit

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

		# Remove Events!

		@form.find('[data-field]')
			.off('change')
			.off('style')
			.off('click')

		@form
			.off('Style')
			.off('Change')
			.off('click')

		@submitBtn
			.off('click')

		# Add Events!

		@form.on 'click', '[data-field]', ->

			name = $(@).attr('data-name') || $(@).attr('name')

			return if !self.fields[name]

			if self.fields[name].clearErrorsInFocus
				self.errorField(name,false)

			return true

		@form.on 'Style', '[data-field]', ->

			el = $(@)
			name = el.attr('name')

			return if !self.fields[name]

			self.errorField(name,false)

			if el.is("select")
				self.createSelect(name)

			else if el.attr('type') is 'radio'
				self.createRadio(name)

			else if el.attr('type') is 'checkbox'
				self.createCheckbox(name)

			el.trigger('style', [self.fields[name].sel])

			return true
		
		@form.on 'Change', '[data-field]', (e,data) ->

			el = $(@)
			name = el.attr('name')

			return if !self.fields[name]

			if el.is("select")
				self.createSelect(name,true)

			else if el.attr('type') is 'radio'
				self.createRadio(name,true)

			else if el.attr('type') is 'checkbox'
				self.createCheckbox(name,true)

			self.fields[name].el.trigger('change',data)

			return true

		# Submit

		@form.submit (e) -> e.preventDefault()

		if @disableSubmit
			@lockSubmit()
		else
			@unlockSubmit()

		@submitBtn.click ->
			self.submit() if !self._disableSubmit
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

		# Run Style trigger
		$.each @fields, (name) ->
			self.fields[name].el.eq(0).trigger('Style') if self.fields[name].style

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

		if @fields[name].placeholder and (@fields[name].type in ['text','textarea','password'])
			@placeholder(name)

		if @fields[name].rules.required
			@fields[name]._required = @fields[name].rules.required

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
			self.fields[name].el.eq(0).trigger('Style')
			return @

		@fields[name].reset = ->
			self.resetField(name)
			return @

		@fields[name].error = (errors=false) ->
			self.errorField(name,errors)
			return @

		@fields[name].validate = (ruleName,opt={}) ->
			return if !self.validate[ruleName]
			valid = self.validate[ruleName](self.getVal(name),opt)
			return valid.state

		@fields[name].addRule = (rule) ->
			self.addFieldRule(name,rule)
			return

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

			if @fields[name].native
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

				if !$(@).attr('value') || self.isEmpty($(@).attr('value'))
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

	setVal: (name,val) ->

		return if !@fields[name]

		opt  = @fields[name]

		if opt.type is 'radio'
			opt.el.prop("checked", false)
			opt.el.filter("[value='#{val}']").prop("checked", val)

		else if opt.type is 'checkbox'
			opt.el.prop("checked", val)

		else if opt.type in ['text','password','textarea']
			opt.el.val(@trim(val))

			if opt.placeholder
				opt.el.trigger('blur')

		else
			opt.el.val(val)


		opt.el.trigger('Change',[{name,val}])

		return

	getVal: (name) ->

		return if !@fields[name]

		opt = @fields[name]

		if opt.type in ['checkbox','radio']
			val = opt.el.filter(":checked").val() || false

		else if opt.type in ['text','password','textarea']
			val = if opt.el.hasClass(@classes.input.placeholder) then "" else @trim(opt.el.val())

		else
			val = opt.el.val()

		return val

	activate: (name,flag) ->

		return if !@fields[name]

		@fields[name].active = flag

		return

	submit: ->

		self = @

		do @resetData
		do @resetErorrs

		data = {} # для отправки данных

		console.groupCollapsed("[Form: #{@formName}] submit") if @logs

		$.each @fields, (name, opt) ->

			val = self.getVal(name)

			if opt.name
				data[opt.name] = if opt.escape then self.escapeText(val) else val
			else
				data[name] = if opt.escape then self.escapeText(val) else val

			if !opt.active

				delete data[name]

			else

				self.setData(name,val)

				console.log(name + ': ' + val) if self.logs

				self.errorField(name,false)

				if opt.rules and !self.isEmpty(opt.rules)

					$.each opt.rules, (ruleName,rule) ->
						if rule and self.validate[ruleName]
							if !self.isEmpty(val) or ruleName is 'required'
								valid = self.validate[ruleName](val, rule)
								if !valid.state
									self.setError(name,valid.reason)


		console.log("data",data) if @logs

		console.groupEnd() if @logs

		@onSubmit(data)

		if @isEmpty(@errors)
			do @success
		else
			do @fail

		return

	fail: ->

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


				opt.onError(name, self.errors[name])

		console.log("data",@errors) if @logs

		console.groupEnd() if @logs

		@onFail(@errors)

		return

	success: ->

		console.groupCollapsed("[Form: #{@formName}] success") if @logs

		for name,val of @data
			console.log(name, val) if @logs

		console.log("data",@data) if @logs

		console.groupEnd() if @logs

		@onSuccess(@data)

		return

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

	errorField: (name,errors) ->

		return if !@fields[name]

		self = @

		if errors

			@fields[name].el.addClass(@classes.errorField)
			@fields[name].sel.addClass(@classes.errorField) if @fields[name].sel

			if @fields[name].autoErrors
				$error = @form.find('.' + @classes.error + '-' + name)

				if @isArray(errors)
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

		@setVal(name,@fields[name].originalVal)
		@errorField(name,false)

		return

	addField: (name,opt) ->

		@fields[name] = opt
		@initField(name,true)

		@fields[name].new = true

		opt.onInit() if opt.onInit

		console.log("[Form: #{@formName}] add field", name) if @logs

		@fields[name].el.trigger('Style') if @fields[name].style
		
		return

	removeField: (name) ->

		return if !@fields[name]

		@fields[name].el.removeAttr('data-field')
		@fields[name].el.unwrap() if @fields[name].style
		@fields[name].sel.remove() if @fields[name].sel

		console.log("[Form: #{@formName}] delete field", name) if @logs

		delete @fields[name]

		return

	placeholder: (name) ->

		return if !@fields[name]

		self = @

		@fields[name].el
			.focus ->
				if $(@).hasClass(self.classes.input.placeholder)
					$(@).val("").removeClass(self.classes.input.placeholder)
			.blur ->
				if self.isEmpty($(@).val())
					$(@).val(self.fields[name].placeholder).addClass(self.classes.input.placeholder)
				else
					$(@).removeClass(self.classes.input.placeholder)
		
		@fields[name].el.blur()

		return

	lockSubmit: ->

		@_disableSubmit = true
		@submitBtn.addClass(@classes.submit.disable)
		return

	unlockSubmit: ->
		@_disableSubmit = false
		@submitBtn.removeClass(@classes.submit.disable)
		return

	showPreloader: ->
		@form.find('.' + @classes.preloader).show()
		return

	hidePreloader: ->
		@form.find('.' + @classes.preloader).hide()
		return

	validation: ->

		@validate =

			form: @

			required: (val,rule) ->

				self = @form

				obj =
					state: false
					reason: rule.reason || "Обязательное поле для заполнения"

				valid = ->

					if rule.not
						if self.isArray(rule.not)
							if val? and !self.isEmpty(val) and (val not in rule.not)
								obj.state = true
						else
							if val? and !self.isEmpty(val) and (val isnt rule.not)
								obj.state = true

					else
						if val? and !self.isEmpty(val)
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

						if self.isArray(rule.val)
							if val not in rule.val
								obj.state = true
							else
								if val isnt rule.val
									obj.state = true

					else

						if self.isArray(rule)
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

			numericDash : (val,rule={}) ->

				self = @form

				obj =
					state: false
					reason: rule.reason || "Допустимы только цифры и подчеркивания"

				valid = ->

					if /^[\d\-\s]+$/.test(val)
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

			cyrillic: (val, rule) ->

				self = @form

				obj =
					state: false
					reason: rule.reason || "Допустимы только русские буквы"

				valid = ->

					if /^[а-я]+$/i.test(val)
						obj.state = true

					return obj

				return valid()

			alphaDash : (val,rule) ->

				self = @form

				obj =
					state: false
					reason: rule.reason || "Допустимы только буквы и подчеркивания"

				valid = ->

					if /^[a-z0-9_\-]+$/i.test(val)
						obj.state = true

					return obj

				return valid()

			alphaNumeric : (val,rule) ->

				self = @form

				obj =
					state: false
					reason: rule.reason || "Допустимы только буквы и цифры"

				valid = ->

					if /^[a-z0-9]+$/i.test(val)
						obj.state = true

					return obj

				return valid()

			max: (val,rule) ->

				self = @form

				rule.reason = rule.reason.replace(/\{count\}/g, rule.count) if rule.reason

				obj =
					state: false
					reason: rule.reason || "Максимум #{(rule.count || rule)} #{self.declOfNum((rule.count || rule), ['символ', 'символа', 'символов'])}"

				valid = ->

					if val.length <= (rule.count || rule)
						obj.state = true

					return obj

				return valid()

			min : (val,rule) ->

				self = @form

				rule.reason = rule.reason.replace(/\{count\}/g, rule.count) if rule.reason

				obj =
					state: false
					reason: rule.reason || "Минимум #{(rule.count || rule)} #{self.declOfNum((rule.count || rule), ['символ', 'символа', 'символов'])}"

				valid = ->

					if val.length >= (rule.count || rule)
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
				rule.form = @form

				rule.reason = rule.reason.replace(/\{field\}/g, rule.field) if rule.reason

				obj =
					state: false
					reason: rule.reason || "Поля не совпадают"

				valid = ->

					if rule.field and self.fields[rule.field]
						if val is self.fields[rule.field].val()
							obj.state = true

						return obj

					if rule.val
						if self.isFunction(rule.val)
							if val is rule.val()
								obj.state = true
						else
							if val is rule.val
								obj.state = true

						return obj

				return valid()

	require: (name,opt) ->

		return if !@fields[name]

		if opt and @fields[name]._required
			@fields[name].rules.required = @fields[name]._required
		else
			@fields[name].rules.required = opt

		return

	newRule: (name,rule) ->

		@validate[name] = (val) ->

			obj =
				state: false
				reason: rule.reason || 'unknown reason'

			valid = ->

				if rule.condition(val)
					obj.state = true

				return obj

			return valid()

		return

	addFieldRule: (name,rule={}) ->

		return if !@fields[name] or !rule.name or !rule.condition

		if !@validate[rule.name]
			@newRule(rule.name, rule)
		
		@fields[name].rules[rule.name] = rule

		console.log("[Form: #{@formName}] add rule", rule.name) if @logs

		return 

	# HELPERS

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

