

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
	$options.wrapInner """
		<div class="viewport"><div class="overview"></div></div>
	"""
	$options.prepend """
		<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>
	"""

	browserIsMobile = false

	scrollbar = $options.tinyscrollbar({sizethumb: 44,invertscroll:browserIsMobile})
	$selected.click -> scrollbar.tinyscrollbar_update()
	return

$ ->

	window.forms = {}

	$form = $('.form')

	fields = 

		# 'login':
		# 	placeholder: 'login'
		# 	rules:
		# 		required: true
		# 		alpha: true
		# 		max:
		# 			count: 4
		# 		min:
		# 			count: 2


		# 'password':
		# 	rules:
		# 		required: true

		# 'password-confirmation':
		# 	rules:
		# 		compare:
		# 			val: -> $form.find('input[name="password"]').val()

		# 'phone':
		# 	rules:
		# 		required: true

		# 'date':
		# 	rules:
		# 		required: true

		# 'email':
		# 	rules:
		# 		required: true
		# 		email: true
		
		# 'text':
		# 	rules:
		# 		required: true

		'checkbox_1':
			name: 'checkbox new'
			rules:
				required: false
				alpha: true
			# onError: (name,errors) ->
			# 	console.log 22


		# 'checkbox_2': false

		# 'radiobutton':
		# 	rules:
		# 		required: true

		'dropdown':
			defaultStyle: 'Выбрать'
			rules:
				required:
					not: 'Выбрать'


	fieldsOptions = 
		style: true
		clearErrorsInFocus: true
		autoErrors: true
		escape: true
		rules:
			required:
				reason: 'ошибка'
		# onError: (name,errors) ->
		# 	console.log 11



	window.forms['form'] = new Form

		logs: true

		autoFields: true

		disableSubmit: false

		formName: 'nice form'
		formEl: $form
		submitEl: $form.find('.submit a')
		fields: fields
		fieldsOptions: fieldsOptions

		onInit: ->

			self = @

			@fields['date'].el.datepicker()

			@fields['phone'].el.mask("+7 (999) 999-99-99")

			@fields['dropdown'].el.on 'change', ->
				console.log 'dropdown change'

			@fields['dropdown'].el.on 'style', ->
				console.log 'dropdown style'
				scroll(self.fields['dropdown'].sel)


		onSubmit: (data) ->

			$form.find('.errors').empty()

		onSuccess: (data) ->

			@lockSubmit()
			@showPreloader()

			# API.success ->
			# @unlockSubmit()
			# @hidePreloader()

		onFail: (errors) ->

			$form.find('.errors').html "Исправьте ошибки в форме"

		onReset: ->

			@unlockSubmit()
			@hidePreloader()

	# formValidator.addRule 
	# 	field: 'password-confirmation'
	# 	rule: 'password confirmation rule'
	# 	reason: 'Пароли не совпадают'
	# 	condition: (val) ->
	# 		return $form.find('input[name="password"]').val() is val


	window.addfield = ->

		clone = forms['form'].form.find('.example').eq(0).clone()

		fieldName = Date.now()

		clone.find('.label').html(fieldName)
		clone.find('.error').removeAttr('class').addClass('error error-' + fieldName)
		clone.find('select').attr('name', fieldName)
		clone.show()
		clone.addClass('new')

		$form.find('.error-list').before clone

		options = 
			rules:
				required:
					reason: 'Своя ошибка'

		onInit = ->
			forms['form'].fields[fieldName].el.on 'change', (e,v) ->
				console.log 'change',v.val

			forms['form'].fields[fieldName].el.on 'style', ->
				scroll(forms['form'].fields[fieldName].sel)


		forms['form'].addField(fieldName, options, onInit)

	window.reset = ->
		forms['form'].reset()
		forms['form'].form.find('.example.new').remove()

	return