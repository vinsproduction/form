

$.datepicker.regional.ru =
	closeText: "Закрыть",
	prevText: "&#x3C;Пред",
	nextText: "След&#x3E;",
	currentText: "Сегодня",
	monthNames: [ "Январь","Февраль","Март","Апрель","Май","Июнь",
	"Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь" ],
	monthNamesShort: [ "Янв","Фев","Мар","Апр","Май","Июн",
	"Июл","Авг","Сен","Окт","Ноя","Дек" ],
	dayNames: [ "воскресенье","понедельник","вторник","среда","четверг","пятница","суббота" ],
	dayNamesShort: [ "вск","пнд","втр","срд","чтв","птн","сбт" ],
	dayNamesMin: [ "Вс","Пн","Вт","Ср","Чт","Пт","Сб" ],
	weekHeader: "Нед",
	dateFormat: "yy-mm-dd",
	firstDay: 1,
	isRTL: false,
	showMonthAfterYear: false,
	yearSuffix: ""

$.datepicker.setDefaults($.datepicker.regional['ru'])

# Скролл бар

scroll = (el) ->

	$select = el

	$selected = $select.find('[data-selected]')
	$options 	= $select.find('[data-options]')

	if !$select.find('.scrollbar').size()
		$options.wrapInner """
			<div class="viewport"><div class="overview"></div></div>
		"""
		$options.prepend """
			<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>
		"""

	browserMobile = false

	scrollbar = $options.tinyscrollbar({sizethumb: 40,wheel: (if browserMobile then 2 else 40),invertscroll:browserMobile})
	$selected.click -> scrollbar.tinyscrollbar_update()
	scrollbar.tinyscrollbar_update()

$ ->

	window.forms = {}

	$form = $('.form')

	fields = 

		'id': false

		'login':
			placeholder: 'login'
			rules:
				required: true
				alpha: true
				max: 2
				# max:
				# 	count: 4
				# min:
				# 	count: 2


		'password':
			rules:
				required: true

		'password-confirmation':
			rules:
				compare:
					field: 'password'
					# val: -> $form.find('input[name="password"]').val()
					reason: 'Не совпадает с полем {field}'

		# 'phone':
		# 	rules:
		# 		required: true

		# 'date':
		# 	rules:
		# 		required: true

		'email':
			rules:
				email: true
		
		'text':
			rules:
				required: true
				min: 2

		# 'checkbox_1':
			# name: 'checkbox new'
			# rules:
			# 	required: true


		# 'checkbox_2': false

		# 'radiobutton':
		# 	rules:
		# 		required: true

		'dropdown':
			placeholder: 'Выбрать'
			style:true
			rules:
				required:
					not: 'Выбрать'


	fieldsOptions = 
		# style: true
		# clearErrorsOnClick: true
		# validateOnKeyup: true
		# autoErrors: true
		# escape: true
		rules:
			required: true
		# 		# reason: 'ошибка'


	window.forms['form-1'] = new Form

		logs: true

		autoFields: true

		disableSubmit: false

		formName: 'test form'
		formEl: $form
		submitEl: $form.find('.submit a')
		fields: fields
		fieldsOptions: fieldsOptions

		onInit: ->


			self = @

			@fields['test'].activate(false)

			
			# @fields['login'].addRule
			# 	name: 'test'
			# 	condition: (val) ->
			# 		return parseInt(val) is 1

			# @addFieldRule 'login',
			# 	name: 'test'
			# 	reason: 'Какая то ошибка'
			# 	condition: (val) ->
			# 		return parseInt(val) is 1
			

			@fields['date'].el.datepicker()

			@fields['phone'].el.mask("+7 (999) 999-99-99")

			# @form.on 'Click', '[data-field]', (e,field) ->
			# 	console.log 'click', field

			@form.on 'Reset', '[data-field]', (e,field) ->
				# console.log 'reset',field

			# @form.on 'Keyup', '[data-field]', (e,field) ->
			# 	console.log 'keyup',field

			@form.on 'Error', '[data-field]', (e,field) ->
				# console.log 'error',field

			@form.on 'Change', '[data-field]', (e,field) ->
				console.log 'change', field

			@form.on 'Style', '[data-field]', (e,field) ->
				# console.log 'style',field

			@form.on 'Style', '[data-field][data-type="select"]', (e,field) ->
				scroll(field.sel)
				return


		onSubmit: (data) ->

			$form.find('.errors').empty()

		onSuccess: (data) ->

			@submit(false)
			@preloader(true)

			# API.success ->
			# self.submit(true)
			# self.preloader(false)


		onFail: (errors) ->

			$form.find('.errors').html "Исправьте ошибки в форме"

		onReset: ->

			@submit(true)
			@preloader(false)

			$form.find('.errors').empty()


	window.addfield = ->

		clone = forms['form-1'].form.find('.example').eq(0).clone()

		fieldName = Date.now()

		clone.find('.label .name').html(fieldName)
		clone.find('.error').removeAttr('class').addClass('error error-' + fieldName)
		clone.find('select').attr('name', fieldName)
		clone.show()
		clone.addClass('new')

		$form.find('.error-list').before clone

		clone.find('.remove').click ->
			$(@).parents().eq(1).remove()
			forms['form-1'].removeField(fieldName)
			return false

		forms['form-1'].addField fieldName,
			placeholder: "Выбрать"
			rules:
				required:
					not: 'Выбрать'
					reason: 'Своя ошибка'

			onInit: ->
				forms['form-1'].fields[fieldName].el.on 'Change', (e,field) ->
					console.log 'change new',field.val

				forms['form-1'].fields[fieldName].el.on 'Style', (e,field) ->
					console.log 'style new', field.name

	window.reset = ->
		forms['form-1'].reset()
		forms['form-1'].form.find('.example.new').remove()

	return