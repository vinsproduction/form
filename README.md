# Form.js

## Простая форма

### SCRIPT

$form = $('.form')

fields = 
	'email':
		rules:
			required: true
			email: true

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

		api({ method: 'POST', url:"login", data: data})
			.error (res) -> console.error res
			.success (res) ->
			  @enableSubmit()
			  @hidePreloader()
	
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

## Варианты настройки обработки полей

У каждого правила (rules) может быть указана причина (reason).
По умолчанию reason устанавливается либой.

fields = 

	'login':
		escape: true # Экранировать отправку
		placeholder: "login"
		style: false # Не стилизовать поле! По умолчанию true
		rules:
			required:
				reason: 'Своя причина'
			alpha:
				reason: 'Своя причина'
			max:
				count: 4
				reason: 'Максимум {count} символа'
			min:
				count: 2
				reason: 'Минимум {count} символа'
				
		onError: (fieldName,errors) ->
			for i of errors
				$form.find(".error-#{fieldName}").append(errors[i] + "<br/>")
				
## Правила валидации

required — Обязательное поле
	not: Значение кроме
numeric — Разрешены только цифры
numericDash — Разрешены только цифры и подчеркивания
alpha — Разрешены только буквы
alphaDash — Разрешены только буквы и подчеркивания
alphaNumeric — Разрешены только буквы и цифры
eng — Разрешены только английские буквы
cyrillic — Разрешены только кириллические буквыч
max — Максимум символов
	count - кол-во символов
min — Минимум символов
	count - кол-во символов
email — Email
url — Url
compare - Сравнение
	val: значение или функция
	
## Добавление своего правила валидации

formValidator.addRule 
	field: 'password-confirmation'
	rule: 'password confirmation rule'
	reason: 'Пароли не совпадают'
	condition: (val) ->
		return $form.find('input[name="password"]').val() is val



## Установки формы

formValidator = new Form

	logs: true # Логи. По умолчанию false
	formName: 'nice form' Имя формы (опционально)
	formEl: '.form' # Элемент формы (Класс или элемент DOM)
	submitEl: '.submit' # Элемент отправки формы (Класс или элемент DOM)
	
	
	enter: true  # Отправка на Enter (В фокусе формы). По умолчанию true
	showErrors: true # 'all' # Показывать ошибку валидации конкретного поля, если all - то все ошибки поля
	hideErrorInFocus: true # Удалять класс ошибки в фокусе
	clearErrorInFocus: true # Очищать ошибку по клику поля
	disableSubmitBtn: false # Заблокировать сабмит
	disableSubmitClass: 'disabled-submit' # Класс заблокированного сабмита
	placeholderClass: "placeholder"
	errorFieldClass: "error-field" # Стиль ошибки поля
	errorClass: "error-" # Класс элемента вывода ошибки поля
	preloaderClass: "preloader" # Класс прелоадера формы
	
## Методы формы

Событие - инициализация формы
formValidator.onInit ->

Событие - нажатие кнопки Отправить
formValidator.onSubmit (data) ->

Событие - валидация пройдена 
formValidator.onSuccess (data) ->
 // Отправка данных на серверх 

Событие - валидация НЕ пройдена 
formValidator.onFail (errors) ->

Событие - сброс формы
formValidator.onReset: ->

## Методы полей формы

Изменение значение поля
formValidator.onChange 'название поля', (v) ->

Установка значения поля
formValidator.set('название поля', 2)

Получние значения поля
formValidator.get('название поля')


## Дополнения

formValidator.disableSubmit() # Заблокировать кнопку отправки
formValidator.enableSubmit()  # Активировать кнопку отправки

formValidator.showPreloader() # Показать прелоадер формы
formValidator.hidePreloader() # Скрыть прелоадер формы
