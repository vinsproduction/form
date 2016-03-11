# Form.js

[Пример test form] (http://vinsproduction.com/projects/form)

[Пример login form] (http://vinsproduction.com/projects/form/login.html)

[Пример registration form](http://vinsproduction.com/projects/form/registration.html)

### Пример простой формы

##### Coffee-script

``` 

$form = $('.form')

fields = 
	'email':
		rules:
			required: true
			email: true

	'password':
		rules:
			required: true

formValidator = new Form

	logs: true
	formName: 'login'
	formEl: $form
	submitEl: $form.find('.submit a')
	fields: fields
	fieldsOptions:
		escape: true
	
	onInit: ->
	
	onSubmit: (data) ->
		$form.find('.errors').empty()
		
	onSuccess: (data) ->
		@lockSubmit()
		@showPreloader()

		api({ method: 'POST', url:"login", data: data})
			.error (res) -> console.error res
			.success (res) ->
				@unlockSubmit()
				@hidePreloader()
	
	onFail: (errors) ->
		$form.find('.errors').html "Исправьте ошибки в форме"

```

##### Jade

```

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

```

## Установки формы (пример)

```

fields = 

	'id': false # Если не надо чтобы поле участвовало в форме!

	'email':
		escape: false 
		rules:
			required: true
			email: true

	###
		Если это выпадющий список, можно указать дефолтное значение для подсветки
		и правило валидации not - для значения по умолчанию
	###

	'dropdown'
		defaultStyle: 'Выбрать'
		rules:
			required:
				not: 'Выбрать'

# fieldsOptions - настройки для всех полей. Опционально
# Такие же настройки внутри самого поля приоритетней! Как например escape выше

fieldsOptions:
	style: false # Cтилизовать поле. По умолчанию true
	focus: false # Поставить фокус на поле. . По умолчанию false
	clearErrorsInFocus: false # Удалять ошибки в фокусе. По умолчанию true
	autoErrors: false # Автоматически показывать ошибку валидации конкретного поля, если 'all' - то все ошибки поля. По умолчанию true
	escape: false # Очищать инпут от тегов в отправке. По умолчанию false
	onError: (fieldName, errors) -> # Опционально

formValidator = new Form
	
	# Обязательные атрибуты

	formEl: '.form' # Элемент формы (Класс или элемент DOM)
	submitEl: '.submit' # Элемент отправки формы (Класс или элемент DOM)

	###
	autoFields
	Автоматическая сборка полей для отправки. Элементы с атрибутом [name]
	Если false - обрабатываться будут только указанные поля!
	По умолчанию - true
	###

	@autoFields = true
	
	fields: fields # Проверяемые поля
	fieldsOptions: fieldsOptions # Настройки полей

 	# Опционально

 	logs: true # Логи. По умолчанию false
	formName: 'nice form' Имя формы (опционально)

	enter: true  # Отправка на Enter (В фокусе формы). По умолчанию true
	disableSubmit: false # Заблокировать сабмит. По умолчанию false

	classes:
		disableSubmitClass: 'disabled' # Класс заблокированного сабмита
		placeholderClass: "placeholder" # Класс плейсхолдера
		errorFieldClass: "error-field" # Стиль ошибки поля
		errorClass: "error" # Класс элемента вывода ошибки поля
		preloaderClass: "preloader" # Класс прелоадера формы

```
## Вариант настройки обработки полей

У каждого правила (rules) может быть указана причина (reason).
По умолчанию reason устанавливается form.js

```
fields = 

	'login':
		escape: true
		placeholder: "login"
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

```
				
## Правила валидации

```
required — Обязательное поле
	not: Значение кроме
numeric — Разрешены только цифры
numericDash — Разрешены только цифры и подчеркивания
alpha — Разрешены только буквы
alphaDash — Разрешены только буквы и подчеркивания
alphaNumeric — Разрешены только буквы и цифры
eng — Разрешены только английские буквы
cyrillic — Разрешены только кириллические буквы
max — Максимум символов
	count - кол-во символов
min — Минимум символов
	count - кол-во символов
email — Email
url — Url
compare - Сравнение
	val: значение или функция
```
	
	
## Добавление своего правила валидации

```

formValidator.addRule 
	field: 'password-confirmation'
	rule: 'password confirmation rule'
	reason: 'Пароли не совпадают'
	condition: (val) ->
		return $form.find('input[name="password"]').val() is val

```
	
## Методы формы

Событие - инициализация формы
```
formValidator.onInit ->
```

Событие - нажатие кнопки Отправить
```
formValidator.onSubmit (data) ->
```

Событие - валидация пройдена 
```
formValidator.onSuccess (data) ->
 	# Отправка данных на серверх 
```

Событие - валидация НЕ пройдена 
```
formValidator.onFail (errors) ->
```

Событие - сброс формы
```
formValidator.onReset: ->
```

Сброс формы
```
formValidator.reset()
```

## Методы полей формы

Добавление поля
```
formValidator.addField
	name: 'название поля'
	options:
		rules:
			required: true
	onInit: -> 

```

Удаление поля
```
formValidator.removeField 'название поля'

```

Стилизация поля
```
formValidator.fields['название поля'].stylize()
```

Следить за изменениями поля
```
formValidator.fields['название поля'].on 'change', (e,data) ->

Или
formValidator.on 'change', '[data-field][data-name="название поля"]', (e,data) ->
```

Следить за стилизацией поля
```
formValidator.fields['название поля'].on 'style', (e,sel) ->

(Пример слежения за всеми полями одного типа)
formValidator.on 'style', '[data-field][data-type="тип поля"]', (e,sel) ->
	# sel - стилизованный селектор dom
```

Клик по полю
```
formValidator.on 'click', '[data-name="название поля"]', ->
```

Установка значения поля
```
formValidator.fields['название поля'].val('значение')
```

Получение значения поля
```
formValidator.fields['название поля'].val()
```


## Дополнения

```
formValidator.lockSubmit() # Заблокировать кнопку отправки
formValidator.unlockSubmit()  # Активировать кнопку отправки

formValidator.showPreloader() # Показать прелоадер формы
formValidator.hidePreloader() # Скрыть прелоадер формы
```
