### Form ###
### https://github.com/vinsproduction/form ###

class Form

	constructor: (@params={}) ->

		if !window.console
			window.console = {}

		if !window.console.groupCollapsed
			window.console.groupCollapsed = () ->

		if !window.console.groupEnd
			window.console.groupEnd = ->

		self = @

		@logs = false

		@formName = false
		@formEl = false
		@submitEl = false

		###
		autoFields
		Автоматическая сборка полей для отправки. Элементы с атрибутом [name]
		Если false - обрабатываться будут только указанные поля!
		###

		@autoFields = true

		@enter = true  # Отправка на Enter

		@disableSubmit = false # Заблокировать сабмит

		@classes = 
		
			disableSubmitClass: 'disabled-submit' # Класс заблокированного сабмита
			placeholderClass: "placeholder"
			errorFieldClass: "error-field" # Стиль ошибки поля
			errorClass: "error" # Класс элемента вывода ошибки поля
			preloaderClass: "preloader" # Класс прелоадера формы

			select:
				open: 'open' # Класс открытого селекта
				default: 'default' # Класс селекта значения по умолчанию, например 'Выбрать'

		@templates =
			checkbox: """<div class="checkbox"></div>"""
			radio: """<div class="radio"></div>"""
			select:
				select: """<div class="select"></div>"""
				selected: """<div class="selected"><span>{selected}</span></div>"""
				options: """<div class="options"></div>"""
				option: """<div class="option"><span>{text}</span></div>"""

		@fields = {}

		@fieldsOptions =
			style: true # Cтилизовать поле
			focus: false # Поставить фокус на поле
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

		$ ->

			if !self.formEl and self.logs then return console.log "[Form: #{self.formName}] Warning! formEl not set"
			if !self.submitEl and self.logs then return console.log "[Form: #{self.formName}] Warning! submitEl not set"

			self.form 		= if self.isObject(self.formEl) then self.formEl else $(self.formEl)
			self.submitBtn 	= if self.isObject(self.submitEl) then self.submitEl else self.form.find(self.submitEl)

			if !self.form.size() and self.logs then return console.log "[Form: #{self.formName}] Warning! formEl not found in DOM"
			if !self.submitBtn.size() and self.logs then return console.log "[Form: #{self.formName}] Warning! submitEl not found in DOM"

			self.form.attr('data-form', self.formName || 'data-form')
			self.submitBtn.attr('data-submit','data-submit')

			self.form.mouseover -> self.form.inFocus = true
			self.form.mouseout  -> self.form.inFocus = false

			if self.enter

				$(window).keydown (event) ->
					if self.form.inFocus and event.keyCode is 13
						self.submit() if !self.disableSubmit


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

		@form.find('[data-field]').off('change').off('style')
		@form.off('_style').off('_change')
		@submitBtn.off('click')

		# Add Events!

		@form.on 'click', '[data-field]', ->

			name = $(@).attr('data-name') || $(@).attr('name')

			return if !self.fields[name]

			if self.fields[name].clearErrorsInFocus
				$(@).removeClass(self.classes.errorFieldClass)

			if self.fields[name].autoErrors
				self.form.find('.' + self.classes.errorClass + '-' + name).empty()

			return true

		@form.on '_style', '[data-field="original"]', ->

			el = $(@)
			name = el.attr('name')

			return if !self.fields[name]

			el.removeClass(self.classes.errorFieldClass)
			self.fields[name].sel.removeClass(self.classes.errorFieldClass)

			if self.fields[name].autoErrors
				self.form.find('.' + self.classes.errorClass + '-' + name).empty()

			if el.is("select")
				self.createSelect(name)

			else if el.attr('type') is 'radio'
				self.createRadio(name)

			else if el.attr('type') is 'checkbox'
				self.createCheckbox(name)

			el.trigger('style', [self.fields[name].sel])

			return true
		
		@form.on '_change', '[data-field="original"]', (e,data) ->

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

		if @params.disableSubmit
			@lockSubmit() 
		else
			@unlockSubmit()

		@submitBtn.click ->
			self.submit() if !self.disableSubmit
			return false

		opts = {
			@autoFields
			@fields
			@fieldsOptions
			@enter
			@disableSubmit
			@classes
		}

		console.log("[Form: #{@formName}] init",opts) if self.logs
		
		# Init Fields
		$.each @fields, (name) ->
			self.initField(name)

		do @onInit

		# Init Event
		$.each @fields, (name) ->
			self.fields[name].el.trigger('_style') if self.fields[name].style

		return

	initField: (name,isNew) ->

		self = @

		el = @form.find("[name='#{name}']")

		if !el.size()
			console.log "[Form: #{@formName}] Warning! selector '#{name}' not found"
			return

		@fields[name] = $.extend(true, {}, @fieldsOptions, @fields[name])

		@fields[name].el = el
		@fields[name].sel = $([])

		@fields[name].el.attr('data-field','original')

		@fields[name].new = true if isNew

		@fields[name].type = @fields[name].el.attr('type') || 'text'

		@fields[name].stylize = ->
			self.fields[name].el.trigger('_style')
			return

		@fields[name].val = (val) ->
			if val?
				self.setVal(name, val)
				return
			else 
				return self.getVal(name)

		@fields[name].originVal = @fields[name].val()

		if @fields[name].placeholder and (@fields[name].type in ['text','textarea'])
			@placeholder(@fields[name].el,@fields[name].placeholder)

		@fields[name].el.focus() if @fields[name].focus

		return

	addField: (name,opt = @fieldsOptions, onInit) ->

		@fields[name] = opt
		@initField(name,true)

		onInit() if onInit

		console.log("[Form: #{@formName}] add field: #{name}", @fields[name]) if @logs

		@fields[name].el.trigger('_style') if @fields[name].style
		
		return

	removeField: (name) ->

		return if !@fields[name]

		@fields[name].el.removeAttr('data-field')
		@fields[name].el.removeAttr('style') if @fields[name].style
		@fields[name].sel.remove() if @fields[name].sel

		console.log("[Form: #{@formName}] delete field", name) if @logs

		delete @fields[name]

		return

	createCheckbox: (name,change) ->

		self = @

		@fields[name].el.attr('style','opacity:0;width:0;height:0;border:0;margin:0;padding:0;position:absolute;-webkit-appearance:none;')


		checkboxTemplate = @templates.checkbox

		if change

			if @fields[name].val()
				@fields[name].sel.attr('data-checked','data-checked')
			else
				@fields[name].sel.removeAttr('data-checked')

		else

			@form.find("[data-checkbox][data-name='#{name}']").remove()

			val = @fields[name].el.attr('value')

			$checkbox = $(checkboxTemplate)
			$checkbox.attr('data-field','styled')
			$checkbox.attr('data-checkbox','data-checkbox')
			$checkbox.attr('data-name',name)
			$checkbox.attr('data-value',val)

			@fields[name].sel = $checkbox

			@fields[name].el.after $checkbox

			$checkbox.attr('data-checked','data-checked') if @fields[name].el.attr('checked')

			$checkbox.on 'click', ->

				if self.fields[name].el.is(':checked')
					self.setVal(name, false)
				else
					self.setVal(name, val)

		return

	createRadio: (name,change) ->

		self = @

		@fields[name].el.attr('style','opacity:0;width:0;height:0;border:0;margin:0;padding:0;position:absolute;-webkit-appearance:none;')

		radioTemplate = @templates.radio

		if change

			@fields[name].sel.removeAttr('data-checked')
			@fields[name].sel.filter("[data-value='#{@fields[name].val()}']").attr('data-checked','data-checked')

		else

			@form.find("[data-radio][data-name='#{name}']").remove()

			@fields[name].sel = $([])

			@fields[name].el.each ->

				el = $(@)

				el.hide()

				val = el.attr('value')

				$radio 	= $(radioTemplate)

				$radio.attr('data-field','styled')
				$radio.attr('data-radio','data-radio')
				$radio.attr('data-name',name)
				$radio.attr('data-value',val)

				$radio.attr('data-checked','data-checked') if el.attr('checked')

				self.fields[name].sel = self.fields[name].sel.add($radio)

				el.after $radio

				$radio.on 'click', ->
					self.setVal(name, val)


		return

	createSelect: (name,change) ->

		self = @

		@fields[name].el.attr('style','opacity:0;width:0;height:0;border:0;margin:0;padding:0;position:absolute;-webkit-appearance:none;')

		selectTemplate		= @templates.select.select
		selectedTemplate	= @templates.select.selected
		optionsTemplate 	= @templates.select.options
		optionTemplate 		= @templates.select.option

		if change

			@fields[name].sel.removeClass(@classes.select.open)

			@fields[name].sel.find("[data-selected]").html @fields[name].sel.find("[data-option][data-value='#{@fields[name].val()}']").html()

			if @fields[name].defaultStyle and @fields[name].defaultStyle is @fields[name].el.val()
				@fields[name].sel.find("[data-selected]").addClass(self.classes.select.default)
			else
				@fields[name].sel.find("[data-selected]").removeClass(self.classes.select.default)

			@fields[name].sel.find("[data-options]").hide()

			@fields[name].sel.find("[data-option]").removeAttr('data-checked')
			@fields[name].sel.find("[data-option][data-value='#{@fields[name].val()}']").attr('data-checked','data-checked')

	
		else

			@form.find("[data-select][data-name='#{name}']").remove()

			$select  = $(selectTemplate)
			$select.attr('data-field', 'styled')
			$select.attr('data-select', 'data-select')
			$select.attr('data-name', name)

			if @fields[name].el.find('option[selected]').size()
				selectedText 	= @fields[name].el.find('option:selected').text()
			else
				selectedText 	= @fields[name].el.find('option:first-child').text()

			selectedTemplate = selectedTemplate.replace('{selected}',selectedText)
			$selected = $(selectedTemplate)
			$selected.attr('data-selected','data-selected')

			$options = $(optionsTemplate)
			$options.attr('data-options','data-options')
			$options.hide()

			$select.append $selected
			$select.append $options

			@fields[name].el.after $select
			@fields[name].sel = $select

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

			if @fields[name].defaultStyle and @fields[name].defaultStyle is selectedText
				$selected.addClass self.classes.select.default

			@fields[name].el.find('option').each ->

				if !$(@).attr('value') || self.isEmpty($(@).attr('value'))
					$(@).attr('value', $(@).text())

				val = $(@).attr('value')

				text = $(@).text()

				option = optionTemplate.replace('{text}',text)
				$option = $(option)
				$option.attr('data-option', 'data-option')
				$option.attr('data-value', val)

				if $(@).is(':first-child')
					$option.attr('data-checked','data-checked')

				$option.on 'click', ->
					self.setVal(name,$(@).attr('data-value'))

				$options.append $option

		return

	setVal: (name,val) ->

		opt  = @fields[name]

		if opt.type is 'radio'
			opt.el.prop("checked", false)
			opt.el.filter("[value='#{val}']").prop("checked", val)

		else if opt.type is 'checkbox'
			opt.el.prop("checked", val)

		else if opt.type in ['text','password','textarea']
			opt.el.val(@trim(val))

			if opt.placeholder
				if val in ["",opt.placeholder]
					@placeholder(opt.el,opt.el.placeholder)
				else
					opt.el.removeClass(@classes.placeholderClass)

		else
			opt.el.val(val)


		opt.el.trigger('_change',[{name,val,el:opt.el}])

		return

	getVal: (name) ->

		opt = @fields[name]

		if opt.type in ['checkbox','radio']
			val = opt.el.filter(":checked").val() || false

		else if opt.type in ['text','password','textarea']
			val = @trim(opt.el.val())
			val = "" if opt.placeholder and (val is opt.placeholder)

		else
			val = opt.el.val()

		return val

	submit: ->

		self = @

		do @resetData
		do @resetErorrs

		data = {} # для отправки данных

		console.groupCollapsed("[Form: #{@formName}] submit")

		$.each @fields, (name, opt) ->

			val = self.getVal(name)

			if opt.name
				data[opt.name] = if opt.escape then self.escapeText(val) else val
			else
				data[name] = if opt.escape then self.escapeText(val) else val

			self.setData(name,val)

			console.log(name + ': ' + val) if self.logs

			opt.el.removeClass(self.classes.errorFieldClass)
			opt.sel.removeClass(self.classes.errorFieldClass) if opt.sel

			if opt.autoErrors
				self.form.find('.' + self.classes.errorClass + '-' + name).empty()

			if opt.rules and !self.isEmpty(opt.rules)

				$.each opt.rules, (ruleName,rule) ->
					if rule
						valid = self.validate[ruleName](val, rule)
						if !valid.state
							self.setError(name,valid.reason)

		console.log("data",data) if @logs

		console.groupEnd()

		@onSubmit(data)

		if @isEmpty(@errors)
			do @success
		else
			do @fail

		return

	fail: ->

		self = @

		console.groupCollapsed("[Form: #{@formName}] fail")

		$.each @fields, (name, opt) ->

			if self.errors[name]
				console.log(name + ': ', self.errors[name]) if self.logs

				opt.el.addClass(self.classes.errorFieldClass)
				opt.sel.addClass(self.classes.errorFieldClass) if opt.sel

				if self.fields[name].autoErrors
					if self.fields[name].autoErrors is 'all'
						for i,error of self.errors[name]
							self.form.find('.' + self.classes.errorClass + '-' + name).append(error + "<br/>")
					else
						self.form.find('.' + self.classes.errorClass + '-' + name).html(self.errors[name][0])


				opt.onError(name, self.errors[name])

		console.log("data",@errors) if @logs

		console.groupEnd()

		@onFail(@errors)

		return

	success: ->

		console.groupCollapsed("[Form: #{@formName}] success")

		for name,val of @data
			console.log(name, val) if @logs

		console.log("data",@data) if @logs

		console.groupEnd()

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
				self.setVal(name,opt.originVal)

		console.log("[Form: #{@formName}] reset") if @logs

		do @onReset

		do @init

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

	placeholder: (el,val) ->

		el.focus =>
			if el.val() is val then el.val("").removeClass(@classes.placeholderClass)      
		.blur =>
			if el.val() is "" then el.val(val).addClass(@classes.placeholderClass)
		el.blur()

		return

	lockSubmit: ->

		@disableSubmit = true
		@submitBtn.addClass(@classes.disableSubmitClass)
		return

	unlockSubmit: ->

		@disableSubmit = false
		@submitBtn.removeClass(@classes.disableSubmitClass)
		return

	showPreloader: ->
		@form.find('.' + @classes.preloaderClass).show()
		return

	hidePreloader: ->
		@form.find('.' + @classes.preloaderClass).hide()
		return

	### VALIDATION FUNCTIONS ###

	validate:

		isFunction: (obj) -> Object.prototype.toString.call(obj) is '[object Function]'
	
		declOfNum: (number, titles) ->
			cases = [2, 0, 1, 1, 1, 2]
			titles[(if (number % 100 > 4 and number % 100 < 20) then 2 else cases[(if (number % 10 < 5) then number % 10 else 5)])]
		

		required: (val,rule) ->
			valid = 
				state: val not in ["", false, rule.not]
				reason: rule.reason || 'Обязательное поле для заполнения'

			return valid

		numeric : (val,rule) ->
			valid = 
				state: /^[0-9]+$/.test(val) ||  val == ""
				reason: rule.reason  || 'Допустимы только цифры'

			return valid

		numericDash : (val,rule) ->
			valid = 
				state: /^[\d\-\s]+$/.test(val) ||  val == ""
				reason: rule.reason  || 'Допустимы только цифры и подчеркивания'

			return valid

		alpha : (val,rule) ->
			valid = 
				state: /^[a-zа-я]+$/i.test(val) ||  val == ""
				reason: rule.reason  || 'Допустимы только буквы'

			return valid

		eng : (val,rule) ->
			valid = 
				state: /^[a-z]+$/i.test(val) ||  val == ""
				reason: rule.reason  || 'Допустимы только английские буквы'

			return valid

		cyrillic: (val, rule) ->
			valid =
				state: /^[а-я]+$/i.test(val) ||  val == ""
				reason: rule.reason || 'Допустимы только русские буквы'

			return valid

		alphaDash : (val,rule) ->
			valid = 
				state: /^[a-z0-9_\-]+$/i.test(val) ||  val == ""
				reason: rule.reason  || 'Допустимы только буквы и подчеркивания'

			return valid

		alphaNumeric : (val,rule) ->
			valid = 
				state: /^[a-z0-9]+$/i.test(val) ||  val == ""
				reason: rule.reason  || 'Допустимы только буквы и цифры'

			return valid

		max: (val,rule) ->

			rule.reason = rule.reason.replace(/\{count\}/g, rule.count) if rule.reason

			valid = 
				state:  val.length <= (rule.count || rule) ||  val == ""
				reason: rule.reason || "Максимум #{(rule.count || rule)} #{@declOfNum((rule.count || rule), ['символ', 'символа', 'символов'])}"

			return valid

		min : (val,rule) ->

			rule.reason = rule.reason.replace(/\{count\}/g, rule.count) if rule.reason

			valid = 
				state: val.length >= (rule.count || rule) ||  val == ""
				reason: rule.reason || "Минимум #{(rule.count || rule)} #{@declOfNum((rule.count || rule), ['символ', 'символа', 'символов'])}"

			return valid

		email: (val,rule) ->
			valid = 
				state: /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/.test(val) ||  val == ""
				reason: rule.reason  || 'Неправильно заполненный E-mail'

			return valid

		url: (val,rule) ->
			valid = 
				state: /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(val) ||  val == ""
				reason: rule.reason  || 'Неправильно заполненный url'

			return valid

		compare: (val,rule) ->

			valid =
				state: val is (if @isFunction(rule.val) then rule.val() else rule.val)
				reason: rule.reason || "Поля не совпадают"

				
			return valid


	### ДОБАВЛЕНИЕ НОВОГО ПРАВИЛА ###

	addRule: (opt) ->

		@fields[opt.field]['rules'][opt.rule] = opt.reason

		@validate[opt.rule] = (val,args,description) ->

			valid = 
				state: opt.condition(val) ||  val == ""
				reason: opt.reason || 'custom reason'

			return valid

		console.log("[Form: #{@formName}] add rule", opt)


	### HELPERS ###

	log: () ->
		if console and @logs

			formName = @formName || @formEl
			
			newArgs = ["[Form]","'#{formName}'"]
			for argument in arguments
				newArgs.push argument
			console.log.apply(console,newArgs)

	trim: (text="") ->
		return text if !@isString(text)
		text.replace(/^\s+|\s+$/g, '')
	stripHTML: (text="") ->
		return text if !@isString(text)
		text.replace(/<(?:.|\s)*?>/g, '')
	escapeText: (text="") ->
		return text if !@isString(text)
		text.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
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


