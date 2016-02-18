

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
			placeholder: 'login'
			rules:
				required: true
				alpha: true
				max:
					count: 4
				min:
					count: 2


		'password':
			rules:
				required: true

		'password-confirmation':
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

		# 'dropdown-2':
		# 	rules:
		# 		required:
		# 			not: 'Выбрать'
	

	fieldsOptions = 
		style: true
		clearErrorsInFocus: true
		autoErrors: true
		escape: true


	window.formValidator = new Form

		logs: true

		disableSubmit: false

		formName: 'nice form'
		formEl: $form
		submitEl: $form.find('.submit a')
		fields: fields
		fieldsOptions: fieldsOptions

		onInit: ->

			@fields['date'].el.datepicker()

			@fields['phone'].el.mask("+7 (999) 999-99-99")

			# @add 'dropdown-2',
			# 	rules:
			# 		required:
			# 			not: 'Выбрать'


			# setTimeout(=>
			# 	@delete('dropdown-2')
			# ,2000)


			# @onChange 'dropdown', (v) =>
			# 	@set('dropdown-2', 3)

			# @onChange 'checkbox_1', (v) ->
			# 	console.log v

			# @get('login')


			# @set('dropdown', 2)
			# @set('checkbox_1',false)
			# @set('checkbox_2',true)

			# @get('checkbox_2')

			# @set('radiobutton',2)
			# @set('text','тест')

			# Скролл бар

			window.scrollbars = {}

			window.scroll = (el) ->

				select 	= if el then el else $form.find('.select')
				select.each ->

					$select = $(@)

					return if $select.find('.viewport').size()

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

			window.scroll()

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

			@unlockSubmit()
			@hidePreloader()

	# formValidator.addRule 
	# 	field: 'password-confirmation'
	# 	rule: 'password confirmation rule'
	# 	reason: 'Пароли не совпадают'
	# 	condition: (val) ->
	# 		return $form.find('input[name="password"]').val() is val


	window.addfield = ->

		clone = $form.find('.example').eq(0).clone()

		fieldName = Date.now()

		clone.find('.label').html(fieldName)
		clone.find('.error').removeAttr('class').addClass('error error-' + fieldName)
		clone.find('[name]').attr('name', fieldName)
		clone.show()

		$form.find('.error-list').before clone

		formValidator.add fieldName,
			rules:
				required:
					not: 'Выбрать'

		window.scroll()


	window.reset = ->
		formValidator.reset()
		$form.find('.example').remove()

	return