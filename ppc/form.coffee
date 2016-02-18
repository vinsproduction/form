### Form ###
### https://github.com/vinsproduction/form ###

class Form

	logs: false

	formName: false
	formEl: false
	submitEl: false

	enter: true  # Отправка на Enter

	disableSubmit: false # Заблокировать сабмит

	classes: 
	
		disableSubmitClass: 'disabled-submit' # Класс заблокированного сабмита
		placeholderClass: "placeholder"
		errorFieldClass: "error-field" # Стиль ошибки поля
		errorClass: "error-" # Класс элемента вывода ошибки поля
		preloaderClass: "preloader" # Класс прелоадера формы

	fields: {}

	fieldsOptions:
		style: true # Cтилизовать поле
		focus: false # Поставить фокус на поле
		clearErrorsInFocus: false # Удалять ошибки в фокусе
		autoErrors: false # Автоматически показывать ошибку валидации конкретного поля, если 'all' - то все ошибки поля
		escape: false # Очищать инпут от тегов в отправке
		onError: (fieldName, errors) ->

	data: {}
	errors: {}

	onFail: (errors) ->
	onSuccess: (data)   ->
	onSubmit: (data) ->
	onReset: ->
	onLoad: ->
	onInit: ->

	onChange: (fieldname, callback) ->

		@form.on fieldname, (event,v) ->
			callback(v)

		return

	constructor: (@options={}) ->

		self = @

		$.extend(true, @, @options)

		$ ->

			if !self.formEl and self.logs then return self.log 'Warning! formEl not set'
			if !self.submitEl and self.logs then return self.log 'Warning! submitEl not set'

			self.form 		= if self.isObject(self.formEl) then self.formEl else $(self.formEl)
			self.submitBtn 	= if self.isObject(self.submitEl) then self.submitEl else self.form.find(self.submitEl)

			if !self.form.size() and self.logs then return self.log 'Warning! formEl not found in DOM'
			if !self.submitBtn.size() and self.logs then return self.log 'Warning! submitEl not found in DOM'

			if self.enter

				$(window).keydown (event) ->
					if self.form.inFocus and event.keyCode is 13
						self.submit() if !self.disableSubmit

			do self.init

			do self.onLoad

			return

	init: ->

		self = @

		@form.unbind()
		@submitBtn.unbind()

		@form.submit (e) -> e.preventDefault()

		@form.mouseover -> self.form.inFocus = true
		@form.mouseout  -> self.form.inFocus = false

		@lockSubmit() if @options.disableSubmit

		@submitBtn.click ->
			self.submit() if !self.disableSubmit
			return false

		$.each @fields, (name, opt) -> 
			self.initSelector(name, opt)

		opts = {
			@formName
			@logs
			@fields
			@fieldsOptions
			@enter
			@disableSubmit
			@form
			@submitBtn
			@classes
		}


		console.log("[Form: #{@formName}] init",opts) if self.logs
		
		do @onInit

		return

	initSelector: (name,opt) ->

		self = @

		el  = @form.find("[name='#{name}']").eq(0)

		if !el.size()
			self.log "Warning! selector '#{name}' not found"
			return

		el.unbind()

		opt.el = el
		opt.sel = el

		opt.style = opt.style || @fieldsOptions.style
		opt.focus = opt.focus || @fieldsOptions.focus
		opt.hideErrorInFocus = opt.hideErrorInFocus || @fieldsOptions.hideErrorInFocus
		opt.clearErrorsInFocus = opt.clearErrorsInFocus || @fieldsOptions.clearErrorsInFocus
		opt.autoErrors = opt.autoErrors || @fieldsOptions.autoErrors
		opt.onError = opt.onError || @fieldsOptions.onError

		opt._onError = (fieldName,errors,callback) ->
			callback()
			opt.onError(fieldName,errors)

		if el.is("select")

			opt.type = 'select'

			if opt.style 
				@createSelect(el)
				el.change => @createSelect(el)

		else if el.attr('type') is 'radio'

			opt.type = 'radio'

			if opt.style
				@createRadio(name)

		else if el.attr('type') is 'checkbox'

			opt.type = 'checkbox'

			if opt.style
				@createCheckbox(name)

		else if el.is("textarea")
			
			opt.type = 'textarea'

		else

			opt.type = 'text'

		if opt.type in ['checkbox','radio']
			opt.originVal = el.filter(":checked").val() or false
		else
			opt.originVal = el.val()
	
		if opt.placeholder and (opt.type in ['text','textarea'])
			@placeholder(el,opt.placeholder)

		el.focus() if opt.focus

		opt.el.removeClass(@classes.errorFieldClass)
		opt.sel.removeClass(@classes.errorFieldClass)

		if opt.autoErrors
			@form.find('.' + @classes.errorClass + name).empty()

		opt.sel.click ->

			if opt.clearErrorsInFocus
				opt.el.removeClass(self.classes.errorFieldClass)
				opt.sel.removeClass(self.classes.errorFieldClass)
			if opt.autoErrors
				self.form.find('.' + self.classes.errorClass + name).empty()

		return

	add: (name,opt = @fieldsOptions) ->

		console.log 

		@fields[name] = opt
		@initSelector(name,opt)

		console.log("[Form: #{@formName}] add", name) if @logs

		return

	delete: (name) ->

		@fields[name].sel.remove()
		@fields[name].el.show() if @fields[name].style

		console.log("[Form: #{@formName}] delete", name) if @logs

		delete @fields[name]

		return

	createCheckbox: (name) ->

		el = @form.find("[name='#{name}']")

		el.hide()

		name 	= el.attr('name')
		value = el.attr('value')

		self = @

		@form.find(".checkbox[data-name=#{name}][data-value=#{value}]").remove() if @form.find(".checkbox[data-name=#{name}][data-value=#{value}]").size()

		el.click ->
			if !$(@).is(':checked')
				self.form.find(".checkbox[data-name=#{name}]").removeClass 'checked'
			else
				self.form.find(".checkbox[data-name=#{name}]").addClass 'checked'

		$checkbox = $("<div class='checkbox' data-name='#{name}' data-value='#{value}'></div>")

		$checkbox.addClass 'checked' if el.attr('checked')

		el.after $checkbox

		@fields[name].sel = $checkbox

		$checkbox.click ->
			if el.is(':checked')
				$(@).removeClass 'checked'
				self.setVal(name, false)
			else
				$(@).addClass 'checked'
				self.setVal(name, value)

		return

	createRadio: (name) ->

		self = @

		@fields[name].el =  @form.find("[name='#{name}']")

		@fields[name].el.each ->

			el = $(this)

			el.hide()

			name 	= el.attr('name')
			value = el.attr('value')

			self.form.find(".radio[data-name=#{name}][data-value=#{value}]").remove() if self.form.find(".radio[data-name=#{name}][data-value=#{value}]").size()

			el.click ->
				self.form.find(".radio[data-name=#{name}]").removeClass 'checked'
				self.form.find(".radio[data-name=#{name}][data-value=#{value}]").addClass 'checked'

			$radio 	= $("<div class='radio' data-name='#{name}' data-value='#{value}'></div>")

			$radio.addClass 'checked' if el.attr('checked')

			el.after $radio

			self.fields[name].sel = self.form.find("[data-name='#{name}']")

			$radio.click ->
				self.form.find(".radio[data-name=#{name}]").removeClass 'checked'
				$(@).addClass 'checked'
				self.setVal(name, value)

		return

	createSelect: (el) ->

		el.hide()

		name 	= el.attr('name')

		self = @

		@form.find(".select[data-name='#{name}']").remove() if @form.find(".select[data-name='#{name}']").size()

		$select 	= $("<div class='select' data-name='#{name}'></div>")
		$options 	= $("<div class='options' style='display:none;'></div>")

		selectedText 	= if el.find('option[selected]').size()
				el.find('option:selected').text()
			else
				el.find('option:first-child').text()

		$selected = $("<div class='selected'>#{selectedText}</div>")

		if el.find('option:selected').is(':first-child')
			$selected.addClass 'default'


		$select.append $selected
		$select.append $options

		el.after $select

		@fields[name].sel = $select

		selectClose = false

		$select.mouseover -> selectClose = false
		$select.mouseout  -> selectClose = true

		$(document).click ->
			if selectClose
				$select.removeClass('open')
				$options.hide()

		$selected.click ->
			if $select.hasClass('open')
				$select.removeClass('open')
				$options.hide()
			else
				$select.addClass('open')
				$options.show()

		el.find('option').each ->

			if $(@).attr('value')
				$option = $("<div class='option' data-value='#{$(@).attr('value')}'><span>#{$(@).text()}</span></div>")
			else
				$option = $("<div class='option'><span>#{$(@).text()}</span></div>")

			$option.click =>
	
				if $(@).attr('value')
					self.setVal(name, $(@).attr('value'))
					$selected.removeClass 'default'
				else
					self.setVal(name,self.fields[name].originVal)
					$selected.addClass 'default'

				$select.find('.selected').html($(@).text())

				$select.removeClass('open')
				$options.hide()

			$options.append $option

		return

	setVal: (name,val) ->

		opt  = @fields[name]

		if opt.type is 'radio'
			opt.el.prop("checked", false)
			opt.el.filter("[value='#{val}']").prop("checked", val)

		else if opt.type is 'checkbox'
			opt.el.prop("checked", val)

		else if opt.type is 'select'
			opt.el.val(val)

		else
			opt.el.val(@trim(val))

		if opt.placeholder and opt.type in ['text','textarea']
			if val in ["",opt.placeholder]
				@placeholder(opt.el,opt.placeholder)
			else
				opt.el.removeClass(@classes.placeholderClass)

		@form.trigger(name,[{name,val}])

		return

	getVal: (name) ->

		opt = @fields[name]

		if opt.type in ['checkbox','radio']
			val = opt.el.filter(":checked").val() or false

		else if opt.type is 'select'
			val = opt.el.val()

		else
			opt.el.val @trim(opt.el.val())

			opt.el.val @stripHTML(opt.el.val()) if opt.escape
			val = @trim(opt.el.val())

			#if placeholder
			val = "" if opt.placeholder and (val is opt.placeholder)

		return val

	set: (name,val=false) ->

		return if !@fields[name]

		el   = @fields[name].el
		sel  = @fields[name].sel

		@setVal(name,val)

		if @fields[name].type is 'select'
			if !val
				val = el.find('option').eq(0).val()
			el.trigger('change')

		if @fields[name].type is 'checkbox'
			if val
				sel.addClass('checked')
			else
				sel.removeClass('checked')

		if @fields[name].type is 'radio'
			sel.removeClass('checked')
			if val
				sel.filter("[data-value='#{val}']").addClass 'checked'
			else
				val = el.eq(0).val()
				sel.eq(0).addClass 'checked'

		console.log("[Form: #{@formName}] set", name + ': ' + val) if @logs

		return

	get: (name) ->

		val = @getVal(name)

		return val

	submit: ->

		self = @

		do @resetData
		do @resetErorrs

		console.groupCollapsed("[Form: #{@formName}] submit")

		$.each @fields, (name, opt) ->

			val = self.getVal(name)

			self.setData(name,val)

			console.log(name + ': ' + val) if self.logs

			opt.el.removeClass(self.classes.errorFieldClass)
			opt.sel.removeClass(self.classes.errorFieldClass)

			if opt.autoErrors
				self.form.find('.' + self.classes.errorClass + name).empty()

			if opt.rules

				for ruleName,rule of opt.rules
					valid = self.validate[ruleName](val, rule)
					if !valid.state
						self.setError(name,valid.reason)

		console.log("data",@data) if @logs

		console.groupEnd()

		@onSubmit(@data)

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
				# self.log "onError", name, @errors[name]
				console.log(name + ': ', self.errors[name]) if self.logs

				opt.el.addClass(self.classes.errorFieldClass)
				opt.sel.addClass(self.classes.errorFieldClass)
		
				opt._onError name, self.errors[name], ->

					if self.fields[name].autoErrors
						if self.fields[name].autoErrors is 'all'
							for i,error of self.errors[name]
								self.form.find('.' + self.classes.errorClass + name).append(error + "<br/>")
						else
							self.form.find('.' + self.classes.errorClass + name).html(self.errors[name][0])

		console.log("data",@errors) if @logs

		console.groupEnd()

		@onFail(@errors)

		return

	success: ->

		console.groupCollapsed("[Form: #{@formName}] onSuccess")

		for name,val of @data
			console.log(name, val) if @logs

		console.groupEnd()

		@onSuccess(@data)

		return

	reset: ->

		self = @

		do @resetData
		do @resetErorrs

		$.each @fields, (name, opt) ->
			self.setVal(name,opt.originVal)

			if !self.options.fields[name]
				self.delete name

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
				state:  val.length <= rule.count ||  val == ""
				reason: rule.reason || "Максимум #{rule.count} #{@declOfNum(rule.count, ['символ', 'символа', 'символов'])}"

			return valid

		min : (val,rule) ->

			rule.reason = rule.reason.replace(/\{count\}/g, rule.count) if rule.reason

			valid = 
				state: val.length >= rule.count ||  val == ""
				reason: rule.reason || "Минимум #{rule.count} #{@declOfNum(rule.count, ['символ', 'символа', 'символов'])}"

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


	### HELPERS ###

	log: () ->
		if console and @logs

			formName = @formName || @formEl
			
			newArgs = ["[Form]","'#{formName}'"]
			for argument in arguments
				newArgs.push argument
			console.log.apply(console,newArgs)

	trim: (text="") -> text.replace(/^\s+|\s+$/g, '')
	stripHTML: (text="") -> text.replace(/<(?:.|\s)*?>/g, '')
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


