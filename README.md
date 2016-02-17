#form

##Простая форма

###SCRIPT


$form = $('.form')

fields = 
	'login':
		rules:
			required: true
	'password':
		escape: true
		rules:
			required: true

formValidator = new Form

	logs: true
	formName: 'login'
	formEl: $form
	submitEl: $form.find('.submit a')
	fields: fields
	
	onInit: ->
	
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

### JADE

.form

	.field
		.label Email
		input(type='text', name='email')
		.error.error-email

	.field
		.label Пароль
		input(type='password', name='password')
		.error.error-password

	.field
		.errors


	.field
		.submit
			a(href="#"): span Отправить
		.preloader
			div
			div
			div
