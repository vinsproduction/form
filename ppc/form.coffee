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

		@logs = true # Логи отключены

		@formName = 'form' # Имя формы
		@formEl = false # Элемент формы или класс
		@submitEl = false # Элемент кнопки отправки или класс

		# autoFields
		# Автоматическая сборка полей для отправки. Элементы с атрибутом [name]
		# Если false - обрабатываться будут только указанные поля!
		@autoFields = true

		@autoInit = true # Автоматическая инициализация формы

		@enter = true  # Отправка на Enter

		@noSubmitEmpty = false # Не отправлять пустые значение и false

		@disableSubmit = false # Заблокировать сабмит

		@fieldsOptions =
			active: true # Активное поле
			style: true # Cтилизовать поле
			autoErrors: true # Автоматически показывать ошибку валидации конкретного поля, если 'all' - то все ошибки поля
			escape: true # Очищать инпут от тегов в отправке
			clearErrorsOnClick: true # Удалять ошибки по клику на поле
			validateOnKeyup: false # Валидировать на keyup
			errorGroup: false # Имя группы полей errors
			fieldGroup: false # Имя группы полей data
			attrs: {} # Атрибуты поля
			rules: {} # Правила поля

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
			validation: "valid" # Класс успешного поля

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

			if !self.formEl and self.logs
				console.warn "[Form: #{self.formName}] formEl not set"

			self.form = if self.h.isObject(self.formEl) then self.formEl else $(self.formEl)

			if !self.form.size() and self.logs
				console.warn "[Form: #{self.formName}] formEl not found in DOM"
				return

			self.form.attr('data-form', self.formName)


			if !self.submitEl? and self.logs
				console.warn "[Form: #{self.formName}] submitEl not set"

			self.submitBtn = if self.h.isObject(self.submitEl) then self.submitEl else self.form.find(self.submitEl)

			if !self.submitBtn.size() and self.logs 
				console.warn "[Form: #{self.formName}] submitEl not found in DOM"
			else
				self.submitBtn.attr('data-submit','data-submit')
		
			if self.autoFields
				self.form.find('[name]').each ->
					name = $(@).attr('name')
					if self.params.fields and self.params.fields[name] is false
						delete self.fields[name]
					else
						self.fields[name] = if self.params.fields and self.params.fields[name] then self.params.fields[name] else {}

			self.initForm() if self.autoInit

			return

	initForm: ->

		self = @

		# Reset data!
		@resetData()
		
		# Reset errors!
		@clearErrors()
		@resetErrors()

		# Remove Events!

		@form.find('[data-field]').off()
		@form.off()
		@submitBtn.off()

		# Add Events!

		@form.on 'click', '[data-field]', ->

			el = $(@)
			name = el.attr('data-name') || el.attr('name')

			return if !self.fields[name]

			val  = self.getVal(name)

			if self.fields[name].clearErrorsOnClick
				self.deleteError(name)
				self.errorField(name,false)

			el.trigger('Click',{name:name,val:val,errors:self.errors[name] || []})

			return true

		@form.on 'keyup', '[data-field]', ->

			el = $(@)
			name = el.attr('data-name') || el.attr('name')

			return if !self.fields[name]

			val  = self.getVal(name)

			if self.fields[name].validateOnKeyup
				self.validateField(name,'keyup')

			el.trigger('Keyup',{name:name, val:val, errors: self.errors[name] || []})

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

			val = self.getVal(name)

			self.validateField(name,'change')

			self.setData(name,val)

			if el.is("select")
				self.createSelect(name,true)

			else if el.attr('type') is 'radio'
				self.createRadio(name,true)

			else if el.attr('type') is 'checkbox'
				self.createCheckbox(name,true)

			if !withoutTrigger
				el.trigger('Change',{name:name,val:val,errors: self.errors[name] || []})

			return true

		@form.on 'error', '[data-field]', (e,errors) ->

			el = $(@)
			name = el.attr('name')

			return if !self.fields[name]

			val  = self.getVal(name)

			el.trigger('Error', {name:name,val:val,errors: errors || []})

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
					self.Submit()

		@submitBtn.click ->
			self.Submit()
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

		# Init validation
		do @initValidation

		# Init Fields
		$.each @fields, (name) ->
			self.initField(name)

		do @onInit

		# Run triggers
		$.each @fields, (name) ->
			self.fields[name].el.eq(0).trigger('style') if self.fields[name].style

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

		if !@fields[name].el.attr('type') and !@fields[name].el.is('select') and !@fields[name].el.is('textarea')
			@fields[name].el.attr('type','text')

		if @fields[name].el.is('select')
			@fields[name].type = 'select'

		else if @fields[name].el.is('textarea')
			@fields[name].type = 'textarea'

		else
			@fields[name].type = @fields[name].el.attr('type')

		@fields[name].el.attr('data-type',@fields[name].type)

		@fields[name].originalVal = self.getVal(name)

		if @fields[name].type is 'select'
			@fields[name].mobileKeyboard = true

		if @fields[name].type in ['text','textarea','password']

			if @fields[name].placeholder
				@placeholder(name)

		if @fields[name].rules.required
			@fields[name]._required = @fields[name].rules.required

		$.each @fields[name].attrs, (name,val) ->
			el.attr(name,val)

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
			return valid

		@fields[name].addRule = (ruleName,rule) ->
			self.addFieldRule(name,ruleName,rule)
			return @

		return

	initValidation: ->

		self = @

		self.validation = 
		
			patterns: 
				numeric :
					exp: '0-9'
					type: ['цифра','цифры','цифр','цифры']
				alpha 	:
					exp: 'а-яёА-ЯЁa-zA-Z'
					type: ['буква','буквы','букв','буквы']
				rus 		:
					exp: 'а-яёА-ЯЁ'
					type: ['русская буква','русские буквы','русских букв','русские буквы']
				rusLowercase:
					exp: 'а-яё'
					type: ['русская маленькая буква','русские маленькой буквы','русских маленьких букв','русские маленькие буквы']
				rusUppercase:
					exp: 'А-ЯЁ'
					type: ['русская большая буква','русские большие буквы','русских больших букв','русские большие буквы']
				eng 		:
					exp: 'a-zA-Z'
					type: ['английская буква','английские буквы','английских букв','английские буквы']
				engLowercase:
					exp: 'a-z'
					type: ['английская маленькая буква','английские маленькие буквы','английских маленьких букв','английские маленькие буквы']
				engUppercase:
					exp: 'A-Z'
					type: ['английская большая буква','английские большие буквы','английских больших букв','английские большие буквы']
				dot 		:
					exp: '.'
					type: ['точка','точки','точек','точки']
				hyphen 	:
					exp: '-'
					type: ['дефис','дефиса','дефисов','дефисы']
				dash 		:
					exp: '_'
					type: ['подчеркивание','подчеркивания','подчеркиваний','подчеркивания']
				space 	:
					exp: '\\s'
					type: ['пробел','пробела','пробелов','пробелы']
				slash 	:
					exp: '\\/'
					type: ['слэш','слэша','слэшей','слэшы']
				comma 	:
					exp: ','
					type: ['запятая','запятой','запятых','запятые']
				special :
					exp: '$@$!%*#?&'
					type: ['специальный символ','специальных символа','специальных символов','специальныe символы']

			required: (val,rule) ->

				obj =
					state: false
					reason: rule.reason || "Обязательное поле для заполнения"

				valid = ->

					if val isnt false

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

			numeric : (val,rule) ->

				obj =
					state: false
					reason: rule.reason || "Допустимы только цифры"

				valid = ->

					if /^[0-9]+$/.test(val)
						obj.state = true

					return obj

				return valid()

			alpha : (val,rule) ->

				obj =
					state: false
					reason: rule.reason || "Допустимы только буквы"

				valid = ->

					if /^[a-zA-Zа-яёА-ЯЁ]+$/.test(val)
						obj.state = true

					return obj

				return valid()

			eng : (val,rule) ->

				obj =
					state: false
					reason: rule.reason || "Допустимы только английские буквы"

				valid = ->

					if /^[a-zA-Z]+$/.test(val)
						obj.state = true

					return obj

				return valid()

			rus: (val, rule) ->

				obj =
					state: false
					reason: rule.reason || "Допустимы только русские буквы"

				valid = ->

					if /^[а-яёА-ЯЁ]+$/.test(val)
						obj.state = true

					return obj

				return valid()

			max: (val,rule) ->

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

				obj =
					state: false
					reason: rule.reason  || 'Неправильно заполненный E-mail'

				valid = ->

					if /^[a-zA-Z0-9.!#$%&amp;'*+\-\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/.test(val)
						obj.state = true

					return obj

				return valid()

			url: (val,rule) ->

				obj =
					state: false
					reason: rule.reason  || 'Неправильно заполненный url'

				valid = ->

					if /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(val)
						obj.state = true

					return obj

				return valid()

			not: (val,rule) ->

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
		
			compare: (val,rule) ->

				obj =
					state: false
					reason: rule.reason || "Поля не совпадают"

				valid = ->

					if rule.field and self.fields[rule.field]

						if rule.reason
							obj.reason = rule.reason.replace(/\{field\}/g, rule.field)
						else
							obj.reason = "Поле не совпадает с #{rule.field}"

						if val is self.fields[rule.field].val()
							obj.state = true
							return obj

					if rule.val?
						if self.h.isFunction(rule.val)
							if val is rule.val()
								obj.state = true
						else
							if val is rule.val
								obj.state = true

						return obj

					return obj

				return valid()

			only: (val,rule) ->

				patterns = @patterns

				obj = state: true

				if rule.reason
					obj.reason = rule.reason
		
				valid = ->

					# MAIN PATTERN

					_patterns = []
					_reasons = []
			
					$.each rule.exp, (k,v) ->

						if patterns[k]
							_reasons.push patterns[k].type[3]
							_patterns.push patterns[k].exp

					reason  = _reasons.join(', ')
					pattern = _patterns.join('')
					pattern = "^[" + pattern + "]+$"

					if !rule.reason
						obj.reason = 'Допустимы только ' + reason

					if !new RegExp(pattern).test(val)
						obj.state = false
						return obj

					# RANGE

					_reasons = []
					range = true

					$.each rule.exp, (k,v) ->

						if k is 'range' and self.h.isArray(v)

							if v[0]
								if val.length < v[0]
									_reasons.push 'минимум ' + v[0] + " " + self.h.declOfNum(v[0], ['символ', 'символа', 'символов'])
									range = false
									return false

							if v[1]
								if val.length > v[1]
									_reasons.push 'максимум ' + v[1] + " " + self.h.declOfNum(v[1], ['символ', 'символа', 'символов'])
									range = false
									return false

					if !range

						reason  = _reasons.join(', ')
											
						if !rule.reason
							obj.reason = 'Допустимы ' + reason

						obj.state = false
						
						return obj

					# MAX - MIN

					_reasons = []
					maxmin = true

					$.each rule.exp, (k,v) ->

						if patterns[k]

							if self.h.isArray(v)

								reg  =  new RegExp("[" + patterns[k].exp + "]",'g')
								match =  val.match(reg)

								if v[0]

									if match and match.length < v[0]
										_reasons.push 'Допустимы минимум ' + v[0] + " " + self.h.declOfNum(v[0], patterns[k].type)
										
										maxmin = false
										return false

									else if !match
										_reasons.push 'Требуется минимум ' + v[0] + " " + self.h.declOfNum(v[0], patterns[k].type)
										
										maxmin = false
										return false



								if v[1]
									if match and match.length > v[1]
										_reasons.push 'Допустимы максимум ' + v[1] + " " + self.h.declOfNum(v[1], patterns[k].type)
										maxmin = false
										return false

					if !maxmin

						reason  = _reasons.join(', ')
											
						if !rule.reason
							obj.reason = reason

						obj.state = false
						
						return obj

					return obj

				return valid()

			strict: (val,rule) ->

				patterns = @patterns

				obj = state: true

				if rule.reason
					obj.reason = rule.reason
		
				valid = ->

					# MAIN PATTERN

					_patterns = []
					_reasons = []
			
					$.each rule.exp, (k,v) ->

						if patterns[k]
							_reasons.push patterns[k].type[3]
							_patterns.push "(?=.*[" + patterns[k].exp + "])"

					reason  = _reasons.join(', ')
					pattern = _patterns.join('')

					if !rule.reason
						obj.reason = 'Требуется ' + reason

					if !new RegExp(pattern).test(val)
						obj.state = false
						return obj

					# RANGE

					_reasons = []
					range = true

					$.each rule.exp, (k,v) ->

						if k is 'range' and self.h.isArray(v)

							if v[0]
								if val.length < v[0]
									_reasons.push 'минимум ' + v[0] + " " + self.h.declOfNum(v[0], ['символ', 'символа', 'символов'])
									range = false
									return false

							if v[1]
								if val.length > v[1]
									_reasons.push 'максимум ' + v[1] + " " + self.h.declOfNum(v[1], ['символ', 'символа', 'символов'])
									range = false
									return false

					if !range

						reason  = _reasons.join(', ')
											
						if !rule.reason
							obj.reason = 'Требуется ' + reason

						obj.state = false
						
						return obj

					# MAX - MIN

					_reasons = []
					maxmin = true

					$.each rule.exp, (k,v) ->

						if patterns[k]

							if self.h.isArray(v)

								reg  =  new RegExp("[" + patterns[k].exp + "]",'g')
								match =  val.match(reg)

								if v[0]
									if match and match.length < v[0]
										_reasons.push 'минимум ' + v[0] + " " + self.h.declOfNum(v[0], patterns[k].type)
										maxmin = false
										return false

								if v[1]
									if match and match.length > v[1]
										_reasons.push 'максимум ' + v[1] + " " + self.h.declOfNum(v[1], patterns[k].type)
										maxmin = false
										return false

					if !maxmin

						reason  = _reasons.join(', ')
											
						if !rule.reason
							obj.reason = 'Требуется ' + reason

						obj.state = false
						
						return obj

					return obj

				return valid()

	init: ->
		self = @
		$ -> self.initForm()	

	Submit: ->

		self = @

		return if self._disableSubmit

		do @resetData
		do @resetErrors

		list = {}

		console.groupCollapsed("[Form: #{@formName}] submit") if @logs

		$.each @fields, (name, opt) ->

			return if !opt.active

			val = self.getVal(name)
			self.setData(name,val)
			list[name] = val

			console.log(name + ': ' + (val || '""')) if self.logs

			self.data[name] = if opt.escape then self.h.escapeText(val) else val

			if self.noSubmitEmpty

				if opt.type is 'select'
					if opt.rules.required.not
						if self.h.isArray(opt.rules.required.not)
							if val in opt.rules.required.not
								self.deleteData(name)
						else
							if val is opt.rules.required.not
								self.deleteData(name)

				if opt.type in ['text','password', 'textarea']
					if self.h.isEmpty(val)
						self.deleteData(name)

			if opt.fieldGroup
				if self.data.hasOwnProperty(name)
					if !self.data[opt.fieldGroup]
						self.data[opt.fieldGroup] = {}
					self.data[opt.fieldGroup][name] = self.data[name]
					self.deleteData(name)


		console.log(@data) if @logs

		console.groupEnd() if @logs

		$.each @fields, (name, opt) ->
			if opt.active
				self.validateField(name)

		@onSubmit(@data,list)

		if @h.isEmpty(@errors)
			@Success(list)
		else
			@Fail()

		return

	Fail: ->

		self = @

		console.groupCollapsed("[Form: #{@formName}] fail") if @logs

		$.each @fields, (name, opt) ->

			errors = self.errors[name]

			if errors

				console.log(name + ': ' + errors[0].reason) if self.logs

				if opt.errorGroup
					if self.errors.hasOwnProperty(name)
						if !self.errors[opt.errorGroup]
							self.errors[opt.errorGroup] = {}
						self.errors[opt.errorGroup][name] = errors
						self.deleteError(name)

		console.log(@errors) if @logs

		console.groupEnd() if @logs

		@onFail(@errors)

		return

	Success: (list) ->

		console.groupCollapsed("[Form: #{@formName}] success") if @logs

		$.each @data, (name,val) ->
			console.log(name + ': ' + (val || '""')) if self.logs

		console.log(@data) if @logs

		console.groupEnd() if @logs

		@onSuccess(@data,list)

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

	validateField: (name,event) ->

		if !@fields[name] or !@fields[name].rules or @h.isEmpty(@fields[name].rules)
			return

		self = @

		val = self.getVal(name)

		self.deleteError(name)
		self.errorField(name,false)

		self.fields[name].el.removeClass(self.classes.validation)
		self.fields[name].sel.removeClass(self.classes.validation)

		showErrors = true

		if !self.fields[name].rules.required and self.h.isEmpty(val)
			return

		if event is 'keyup' or event is 'change'
			
			if self.fields[name].type in ['checkbox','radio']
				if val is false then showErrors = false
	
			else if self.fields[name].type is 'select'
				if self.fields[name].rules.required and self.fields[name].rules.required.not
					if self.h.isArray(self.fields[name].rules.required.not)
						if val in self.fields[name].rules.required.not
							showErrors = false
					else
						if val is self.fields[name].rules.required.not
							showErrors = false

			else if self.h.isEmpty(val)
				showErrors = false
				

		$.each self.fields[name].rules, (ruleName,rule) ->

			if rule and self.validation[ruleName]
				valid = self.validation[ruleName](val, rule)
				if !valid.state
					self.setError(name,{ruleName,reason:valid.reason})

					if showErrors

						if self.fields[name].autoErrors
							if self.fields[name].autoErrors is 'all'
								self.errorField(name,self.errors[name])
							else if self.errors[name][0]
								self.errorField(name,self.errors[name][0])

		if showErrors

			if !self.errors[name] or self.h.isEmpty(self.errors[name])
				self.fields[name].el.addClass(self.classes.validation)
				self.fields[name].sel.addClass(self.classes.validation)

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
		do @resetErrors

		$.each @fields, (name, opt) ->

			if self.fields[name].new
				self.removeField name
			else
				self.fields[name].reset()

		console.log("[Form: #{@formName}] reset") if @logs

		do @onReset

		return

	resetErrors: -> @errors = {}

	resetData: -> @data = {}

	setData: (name,val) ->

		@data[name] = val

		return

	deleteData: (name) ->

		delete @data[name]

		return

	getData: -> @data

	setError: (name,opt) ->

		if !@errors[name]
			@errors[name] = []

		@errors[name].push opt

		return

	deleteError: (name) ->

		delete @errors[name]

		return

	getErrors: -> @errors

	clearErrors: ->

		self = @

		@form.find('.' + @classes.error).empty()
		@form.find('[data-field]').removeClass(@classes.errorField)

		return

	errorField: (name,errors,withoutTrigger) ->

		return if !@fields[name]

		self = @

		if errors

			if @fields[name].errorGroup

				$.each @fields, (fieldName) ->

					if self.fields[fieldName].errorGroup is self.fields[name].errorGroup
						self.fields[fieldName].el.addClass(self.classes.errorField)
						self.fields[fieldName].sel.addClass(self.classes.errorField)
			else

				@fields[name].el.addClass(@classes.errorField)
				@fields[name].sel.addClass(@classes.errorField)

			if @fields[name].autoErrors

				if @fields[name].errorGroup
					$error = @form.find('.' + @classes.error + '-' + @fields[name].errorGroup)
				else
					$error = @form.find('.' + @classes.error + '-' + name)

				if @h.isArray(errors)
					$error.empty()

					$.each errors, (k,v) ->

						if !self.h.isObject(v)
							v = {reason:v}

						error  = self.templates.error.replace('{error}',v.reason)
						$error.append(error)

				else

					if !self.h.isObject(errors)
						errors = {reason:errors}

					error = self.templates.error.replace('{error}',errors.reason)
					$error.html(error)

			
			if !withoutTrigger
				self.fields[name].el.eq(0).trigger('error',[errors])

		else

			if @fields[name].errorGroup

				$.each @fields, (fieldName) ->

					if self.fields[fieldName].errorGroup is self.fields[name].errorGroup
						self.fields[fieldName].el.removeClass(self.classes.errorField)
						self.fields[fieldName].sel.removeClass(self.classes.errorField)

			else

				@fields[name].el.removeClass(@classes.errorField)
				@fields[name].sel.removeClass(@classes.errorField)

			if @fields[name].autoErrors

				if @fields[name].errorGroup
					@form.find('.' + @classes.error + '-' + @fields[name].errorGroup).empty()

				else
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


