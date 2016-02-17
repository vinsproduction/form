

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



$ ->

	$form = $('.form')

	fields = 

		'login':
			escape: true
			placeholder: 'login'
			rules:
				required: true
				alpha: true
				max:
					count: 4
				min:
					count: 2

		'password':
			escape: true
			rules:
				required: true

		'password-confirmation':
			escape: true
			rules:
				compare:
					val: -> $form.find('input[name="password"]').val()

		'phone':
			rules:
				required: true

		'date':
			rules:
				required: true

		'email':
			rules:
				required: true
				email: true
		'text':
			rules:
				required: true

		'checkbox_1':
			rules:
				required: true

		'checkbox_2':
			rules:
				required: true

		'radiobutton':
			rules:
				required: true

		'dropdown':
			rules:
				required:
					not: 'Выбрать'

		'dropdown-2':
			rules:
				required:
					not: 'Выбрать'
					

	formValidator = new Form

		logs: true
		showErrors: 'all'

		formName: 'nice form'
		formEl: $form
		submitEl: $form.find('.submit a')
		fields: fields

		onInit: ->

			@fields['date'].el.datepicker()

			@fields['phone'].el.mask("+7 (999) 999-99-99")


			# formValidator.onChange 'dropdown', (v) ->
			# 	formValidator.set('dropdown-2', 3)
			# 	console.log v

			# formValidator.onChange 'checkbox_1', (v) ->
			# 	console.log v

			#formValidator.get('login')


			# formValidator.set('dropdown', 2)
			# formValidator.set('checkbox_1',false)
			# formValidator.set('checkbox_2',true)
			# formValidator.set('radiobutton',2)
			# formValidator.set('text','тест')

			# Скролл бар

			scrollbars = {}

			scroll = (el) ->

				select 	= if el then el else $form.find('.select')

				select.each ->

					$select = $(@)

					selectName = $select.attr('data-name')

					$selected = $select.find('.selected')
					$options 	= $select.find('.options')
					$options.wrapInner """
						<div class="viewport"><div class="overview"></div></div>
					"""
					$options.prepend """
						<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>
					"""
					scrollbars[selectName] = $options.tinyscrollbar({sizethumb: 40})
					$selected.click -> scrollbars[selectName].tinyscrollbar_update()

			scroll()

		onSubmit: (data) ->

			$form.find('.errors').empty()

		onSuccess: (data) ->

			@disableSubmit()
			@showPreloader()

			# API.success ->
			# @enableSubmit()
			# @hidePreloader()

		onFail: (errors) ->

			$form.find('.errors').html "Исправьте ошибки в форме"

		onReset: ->

			@enableSubmit()
			@hidePreloader()

	# formValidator.addRule 
	# 	field: 'password-confirmation'
	# 	rule: 'password confirmation rule'
	# 	reason: 'Пароли не совпадают'
	# 	condition: (val) ->
	# 		return $form.find('input[name="password"]').val() is val



	window.reset = ->
		formValidator.reset()

	return