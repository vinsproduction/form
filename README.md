# Form.js

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

	'email':
		escape: false 
		rules:
			required: true
			email: true

# fieldsOptions - настройки для всех полей.
# Такие же настройки внутри поля приоритетней! См. выше escape

fieldsOptions:
	style: true # Cтилизовать поле. По умолчанию false
	focus: false # Поставить фокус на поле. . По умолчанию false
	clearErrorsInFocus: true # Удалять ошибки в фокусе. По умолчанию false
	autoErrors: true # Автоматически показывать ошибку валидации конкретного поля, если 'all' - то все ошибки поля. По умолчанию false
	escape: true # Очищать инпут от тегов в отправке. По умолчанию false
	onError: (fieldName, errors) -> # Опционально

formValidator = new Form
	
	# Обязательные атрибуты

	formEl: '.form' # Элемент формы (Класс или элемент DOM)
	submitEl: '.submit' # Элемент отправки формы (Класс или элемент DOM)
	
	fields: fields # Проверяемы поля
	fieldsOptions: fieldsOptions # Настройки полей

 	# Опционально

 	logs: true # Логи. По умолчанию false
	formName: 'nice form' Имя формы (опционально)

	enter: true  # Отправка на Enter (В фокусе формы). По умолчанию true
	disableSubmit: false # Заблокировать сабмит. По умолчанию false

	classes:
		disableSubmitClass: 'disabled-submit' # Класс заблокированного сабмита
		placeholderClass: "placeholder"
		errorFieldClass: "error-field" # Стиль ошибки поля
		errorClass: "error-" # Класс элемента вывода ошибки поля
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

Сброс формы
```
formValidator.reset()
```

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

## Методы полей формы

Добавление поля
```
formValidator.add 'название поля',
	rules:
		required: true

```

Удаление поля
```
formValidator.delete 'название поля'

```

Изменение значение поля
```
formValidator.onChange 'название поля', (v) ->
```

Установка значения поля
```
formValidator.set('название поля', 2)
```

Получние значения поля
```
formValidator.get('название поля')
```


## Дополнения

```
formValidator.lockSubmit() # Заблокировать кнопку отправки
formValidator.unlockSubmit()  # Активировать кнопку отправки

formValidator.showPreloader() # Показать прелоадер формы
formValidator.hidePreloader() # Скрыть прелоадер формы
```
