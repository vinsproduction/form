### Form ###
### https://github.com/vinsproduction/form ###

class Form

	logs: false

	formName: false
	formEl: false
	submitEl: false

	enter: true  # Отправка на Enter

	showErrors: true # 'all' # Показывать ошибку валидации конкретного поля, если all - то все ошибки поля
	hideErrorInFocus: true # Удалять класс ошибки в фокусе
	clearErrorInFocus: true # Очищать ошибку по клику поля

	disableSubmitBtn: false # Заблокировать сабмит
	disableSubmitClass: 'disabled-submit' # Класс заблокированного сабмита

	placeholderClass: "placeholder"
	errorFieldClass: "error-field" # Стиль ошибки поля
	errorClass: "error-" # Класс элемента вывода ошибки поля

	preloaderClass: "preloader" # Класс прелоадера формы

	fields: {}
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

		for k,v of @options
			@[k] = v


		$ =>

			if !@formEl and @logs then return @log 'Warning! formEl not set'
			if !@submitEl and @logs then return @log 'Warning! submitEl not set'

			@form 		= if @isObject(@formEl) then @formEl else $(@formEl)
			@submitBtn 	= if @isObject(@submitEl) then @submitEl else @form.find(@submitEl)

			if !@form.size() and @logs then return @log 'Warning! formEl not found in DOM'
			if !@submitBtn.size() and @logs then return @log 'Warning! submitEl not found in DOM'

			@_disableSubmitBtn = @disableSubmitBtn

			if @enter

				$(window).keydown (event) =>
					if @form.inFocus and event.keyCode is 13
						@submit() if !@disableSubmitBtn

			#@log "onLoad", "options", @options
			console.log("[Form: #{@formName}] init", @options) if @logs

			do @init

			do @onLoad

			return

	init: ->

		self = @

		@form.unbind()
		@submitBtn.unbind()

		for name of @fields

			do (name) =>

				el  = @form.find("[name='#{name}']").eq(0)

				el.unbind()

				@fields[name].el = el
				@fields[name].sel = el

				@fields[name].style = @fields[name].style ? true
				@fields[name].focus = @fields[name].focus ? false

				if !@fields[name].onError
					@fields[name].onError = (fieldName,errors) ->


				if el.is("select")

					@fields[name].type = 'select'

					if @fields[name].style 
						@createSelect(el)
						el.change => @createSelect(el)

				else if el.attr('type') is 'radio'

					@fields[name].type = 'radio'

					if @fields[name].style
						self.createRadio(name)

				else if el.attr('type') is 'checkbox'

					@fields[name].type = 'checkbox'

					if @fields[name].style
						self.createCheckbox(name)

				else if el.is("textarea")
					
					@fields[name].type = 'textarea'

				else

					@fields[name].type = 'text'

				if @fields[name].type in ['checkbox','radio']
					@fields[name].originVal = el.filter(":checked").val() or false
				else
					@fields[name].originVal = el.val()
			
				if @fields[name].placeholder and (@fields[name].type in ['text','textarea'])
					@placeholder(el,@fields[name].placeholder)

				el.focus() if @fields[name].focus


				@fields[name].el.removeClass(@errorFieldClass)
				@fields[name].sel.removeClass(@errorFieldClass)

				if @showErrors
					@form.find('.' + @errorClass + name).empty()

				@fields[name].sel.click =>

					if @hideErrorInFocus
						@fields[name].el.removeClass(@errorFieldClass)
						@fields[name].sel.removeClass(@errorFieldClass)

					if @clearErrorInFocus and @showErrors
						@form.find('.' + @errorClass + name).empty()

				return

		@form.submit (e) -> e.preventDefault()

		@form.mouseover => @form.inFocus = true
		@form.mouseout  => @form.inFocus = false

		@disableSubmit() if @_disableSubmitBtn

		@submitBtn.click =>
			@submit() if !@disableSubmitBtn
			return false

		do @onInit

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

		el  = @fields[name].el

		if @fields[name].type in ['checkbox','radio']
			el.prop("checked", false)
			el.filter("[value='#{val}']").prop("checked", val)

		else if @fields[name].type is 'select'
			el.val(val)

		else
			el.val(@trim(val))

		if @fields[name].placeholder and (el.is("input[type='text']") or el.is('textarea'))
			if val in ["",@fields[name].placeholder]
				@placeholder(el,@fields[name].placeholder)
			else
				el.removeClass(@placeholderClass)

		@form.trigger(name,[{name,val}])

		return

	getVal: (name) ->

		el  = @fields[name].el

		if @fields[name].type in ['checkbox','radio']
			val = el.filter(":checked").val() or false

		else if @fields[name].type is 'select'
			val = el.val()

		else
			el.val @trim(el.val()) # trim val

			el.val @stripHTML(el.val()) if @fields[name].escape # escape HTML
			val = @trim(el.val())

			#if placeholder
			val = "" if @fields[name]['placeholder'] and val is @fields[name]['placeholder']

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

		@log("[Form: #{@formName}] set", name + ': ' + val) if @logs

		return

	get: (name) ->

		val = @getVal(name)

		# @log "GET", name, val

		console.log("[Form: #{@formName}] get", name + ": " + val) if @logs

		return val

	submit: ->

		do @resetData
		do @resetErorrs

		console.groupCollapsed("[Form: #{@formName}] submit")

		for name of @fields

			val = @getVal(name)
	
			@setData(name,val)

			console.log(name + ': ' + val) if @logs

			@fields[name].el.removeClass(@errorFieldClass)
			@fields[name].sel.removeClass(@errorFieldClass)

			if @showErrors
				@form.find('.' + @errorClass + name).empty()

			# validate rules
			if @fields[name].rules

				for ruleName,rule of @fields[name].rules
					valid = @validate[ruleName](val, rule)
					if !valid.state
						@setError(name,valid.reason)

		# @log "onSubmit", "data", @data

		console.log("data",@data) if @logs

		console.groupEnd()

		@onSubmit(@data)

		if @isEmpty(@errors)
			do @success
		else
			do @fail

		return

	fail: ->

		console.groupCollapsed("[Form: #{@formName}] fail")

		for name,field of @fields

			if @errors[name]
				# @log "onError", name, @errors[name]
				console.log(name + ': ', @errors[name]) if @logs

				@fields[name].el.addClass(@errorFieldClass)
				@fields[name].sel.addClass(@errorFieldClass)

				if @showErrors
					if @showErrors is 'all'
						for i,error of @errors[name]
							@form.find('.' + @errorClass + name).append(error + "<br/>")
					else
						@form.find('.' + @errorClass + name).html(@errors[name][0])
	
				@fields[name].onError(name,@errors[name])


		# @log "onFail","errors", @errors
		console.log("data",@errors) if @logs

		console.groupEnd()

		@onFail(@errors)

		return

	success: ->

		console.groupCollapsed("[Form: #{@formName}] onSuccess")

		for name,val of @data
			console.log(name, val) if @logs

		# @log "onSuccess","data", @data

		console.groupEnd()

		@onSuccess(@data)

		return

	reset: ->

		do @resetData
		do @resetErorrs

		for name of @fields

			@setVal(name,@fields[name].originVal)

		# @log "onReset"

		console.log("[Form: #{@formName}] reset") if @logs

		do @onReset

		do @init

		return

	resetErorrs: -> @errors = {}

	resetData: -> @data = {}

	setData: (name,val) ->

		if !@data[name] then @data[name] = val

		return

	setError: (name,val) ->

		if !@errors[name]
			@errors[name] = []

		@errors[name].push val

		return

	placeholder: (el,val) ->

		el.focus =>
			if el.val() is val then el.val("").removeClass(@placeholderClass)      
		.blur =>
			if el.val() is "" then el.val(val).addClass(@placeholderClass)
		el.blur()

		return

	disableSubmit: ->

		@disableSubmitBtn = true
		@submitBtn.addClass(@disableSubmitClass)
		return

	enableSubmit: ->

		@disableSubmitBtn = false
		@submitBtn.removeClass(@disableSubmitClass)
		return

	showPreloader: ->
		@form.find('.' + @preloaderClass).show()

	hidePreloader: ->
		@form.find('.' + @preloaderClass).hide()

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

			rule.val = rule.val() if @isFunction(rule.val)

			valid =
				state: val is rule.val
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


