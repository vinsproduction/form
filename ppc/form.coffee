### Form Validator ###


class Form

	logs: false

	formName: false
	formEl: false
	submitEl: false

	placeholderClass: "placeholder"

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

	constructor: (@options={}) ->

		for k,v of @options
			@[k] = v


		$ =>

			if !@formEl then return @log 'Warning! formEl not set'
			if !@submitEl then return @log 'Warning! submitEl not set'

			@form 		= if @isObject(@formEl) then @formEl else $(@formEl)
			@submitBtn 	= if @isObject(@submitEl) then @submitEl else @form.find(@submitEl)

			if !@form.size() then return @log 'Warning! formEl not found in DOM'
			if !@submitBtn.size() then return @log 'Warning! submitEl not found in DOM'

			do @init

			@log "onLoad", "options", @options

			do @onLoad

	init: ->

		self = @

		@form.unbind()
		@submitBtn.unbind()

		for name of @fields

			el  = @form.find("[name='#{name}']").eq(0)

			el.unbind()

			if el.attr('type') in ['checkbox','radio']
				@fields[name].originVal = el.filter(":checked").val() or false
			else
				@fields[name].originVal = el.val()

			@fields[name].style = @fields[name].style ? false
			@fields[name].focus = @fields[name].focus ? false

			if !@fields[name].onError then @fields[name].onError = (fieldName,errors) ->

			### placeholder ###
			if @fields[name].placeholder and (el.is("input[type='text']") or el.is('textarea'))
				@placeholder(el,@fields[name].placeholder)

			### Отправка по Enter ###
			if @fields[name].enterSubmit
				el.keydown (event) =>
					if event.keyCode is 13
						do @submit

			if @fields[name].style and el.is("select")

				@createSelect(el)
				el.change => @createSelect(el)

			if @fields[name].style and (el.attr('type') is 'radio')
				self.createRadio(name)

			if @fields[name].style and (el.attr('type') is 'checkbox')
				self.createCheckbox(name)

			el.focus() if @fields[name].focus


		@form.submit (e) -> e.preventDefault()

		@submitBtn.click =>
			@submit()
			return false

		do @onInit

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

		$checkbox.click ->
			if el.is(':checked')
				$(@).removeClass 'checked'
				self.setVal(name, false)
			else
				$(@).addClass 'checked'
				self.setVal(name, value)

	createRadio: (name) ->

		$radioEl = @form.find("[name='#{name}']")

		self = @

		$radioEl.each ->

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

			$radio.click ->
				self.form.find(".radio[data-name=#{name}]").removeClass 'checked'
				$(@).addClass 'checked'
				self.setVal(name, value)

	createSelect: (el) ->

		el.hide()

		name 	= el.attr('name')

		self = @

		@form.find(".select[data-name='#{name}']").remove() if @form.find(".select[data-name='#{name}']").size()

		$select 	= $("<div class='select' data-name='#{name}'></div>")
		$options 		= $("<div class='options' style='display:none;'></div>")
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

	setVal: (name,val) ->

		el  = @form.find("[name='#{name}']")

		if el.attr('type') in ['checkbox','radio']
			el.prop("checked", false)
			el.filter("[value='#{val}']").prop("checked", val)

		else if el.is("select")
			el.val(val)

		else
			el.val(@trim(val))

		if @fields[name].placeholder and (el.is("input[type='text']") or el.is('textarea'))
			if val in ["",@fields[name].placeholder]
				@placeholder(el,@fields[name].placeholder)
			else
				el.removeClass(@placeholderClass)

		@form.trigger(name,[{name,val}])

	getVal: (name) ->

		el  = @form.find("[name='#{name}']")

		name 	= el.attr('name')

		if el.attr('type') in ['checkbox','radio']
			val = el.filter(":checked").val() or false

		else if el.is('select')
			val = el.val()

		else
			el.val @trim(el.val()) # trim val

			el.val @stripHTML(el.val()) if @fields[name].escape # escape HTML
			val = @trim(el.val())

			#if placeholder
			val = "" if @fields[name]['placeholder'] and val is @fields[name]['placeholder']

		return val

	set: (name,val=false) ->

		el   = @form.find("[name='#{name}']")
		sel  = @form.find("[data-name='#{name}']")

		if el.is("select")
			if !val
				val = el.find('option').eq(0).val()
			@setVal(name,val)
			el.trigger('change')
			return

		if el.attr('type') is 'checkbox'
			if val
				sel.addClass('checked')
			else
				sel.removeClass('checked')

		if el.attr('type') is 'radio'
			sel.removeClass('checked')
			if val
				sel.filter("[data-value='#{val}']").addClass 'checked'
			else
				val = el.eq(0).val()
				sel.eq(0).addClass 'checked'

		@setVal(name,val)

		@log "SET", name, '=', val

	get: (name) ->

		el  = @form.find("[name='#{name}']")

		if el.attr('type') in ['checkbox','radio']
			return el.filter(':checked').val()

		val = el.val()

		@log "GET", name, '=', val

		return val

	submit: ->

		@log "SUBMIT!"

		do @resetData
		do @resetErorrs

		for name of @fields

			val = @getVal(name)
	
			@setData(name,val)

			# validate rules
			if @fields[name].rules
				for ruleName,rule of @fields[name].rules
					valid = @validate[ruleName](val, rule)
					if !valid.state
						@setError(name,valid.reason)

		@log "onSubmit", "data", @data
		@onSubmit(@data)

		if @isEmpty(@errors)
			do @success
		else
			do @fail

	fail: ->

		for name,field of @fields

			if @errors[name]
				@log "onError", name, @errors[name]
	
				@fields[name].onError(name,@errors[name])

		@log "onFail","errors", @errors
		@onFail(@errors)

	success: ->
		@log "onSuccess","data", @data
		@onSuccess(@data)

	reset: ->

		do @resetData
		do @resetErorrs

		for name of @fields

			@setVal(name,@fields[name].originVal)

		@log "onReset"
		do @onReset

		do @init

		return false

	resetErorrs: -> @errors = {}

	resetData: -> @data = {}

	setData: (name,val) ->

		if !@data[name] then @data[name] = val

	setError: (name,val) ->

		if !@errors[name]
			@errors[name] = []

		@errors[name].push val
	
	placeholder: (el,val) ->

		el.focus =>
			if el.val() is val then el.val("").removeClass(@placeholderClass)      
		.blur =>
			if el.val() is "" then el.val(val).addClass(@placeholderClass)
		el.blur()

	### VALIDATION FUNCTIONS ###

	validate:

		required: (val,rule) ->
			valid = 
				state: val not in ["", false, rule.not]
				reason: rule.reason || 'Не заполнено'

			return valid

		numeric : (val,rule) ->
			valid = 
				state: /^[0-9]+$/.test(val) ||  val == ""
				reason: rule.reason  || 'Не цифры'

			return valid

		numericDash : (val,rule) ->
			valid = 
				state: /^[\d\-\s]+$/.test(val) ||  val == ""
				reason: rule.reason  || 'Не цифры и подчеркивания'

			return valid

		alpha : (val,rule) ->
			valid = 
				state: /^[a-zа-я]+$/i.test(val) ||  val == ""
				reason: rule.reason  || 'Не буквы'

			return valid

		alphaDash : (val,rule) ->
			valid = 
				state: /^[a-z0-9_\-]+$/i.test(val) ||  val == ""
				reason: rule.reason  || 'Не буквы и подчеркивания'

			return valid

		alphaNumeric : (val,rule) ->
			valid = 
				state: /^[a-z0-9]+$/i.test(val) ||  val == ""
				reason: rule.reason  || 'Не буквы и не цифры'

			return valid

		max: (val,rule) ->

			rule.reason = rule.reason.replace(/\{count\}/g, rule.count) if rule.reason

			valid = 
				state:  val.length <= rule.count ||  val == ""
				reason: rule.reason || "Максимум #{rule.count}"

			return valid

		min : (val,rule) ->

			rule.reason = rule.reason.replace(/\{count\}/g, rule.count) if rule.reason

			valid = 
				state: val.length >= rule.count ||  val == ""
				reason: rule.reason || "Минимум #{rule.count}"

			return valid

		email: (val,rule) ->
			valid = 
				state: /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/.test(val) ||  val == ""
				reason: rule.reason  || 'Не email'

			return valid

		url: (val,rule) ->
			valid = 
				state: /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(val) ||  val == ""
				reason: rule.reason  || 'Не url'

			return valid

		ip: (val,rule) ->
			valid = 
				state: /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i.test(val) ||  val == ""
				reason: rule.reason  || 'Не ip'

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
	

