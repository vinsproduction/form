# Form.js

[Пример test form] (http://vinsproduction.com/dev/form)

[Пример login form] (http://vinsproduction.com/dev/form/login.html)

[Пример registration form](http://vinsproduction.com/dev/form/registration.html)

### Пример простой формы

##### Coffee-script

``` 

new Form

	formName: 'login'
	formEl: $('.form')
	submitEl: $('.form').find('.submit a')
	fields:
		'email':
			rules:
				email: true
	fieldsOptions:
		rules:
			required: true
	
	onSuccess: (data) ->
		@submit(false)
		@preloader(true)

		api({ method: 'POST', url:"login", data: data})
			.error (res) -> console.error res
			.success (res) ->
				@submit(true)
				@preloader(false)
	


```

##### Jade

```

.form

	.field
		.label Email
		input(type='text' name='email')
		.error.error-email

	.field
		.label Пароль
		input(type='password' name='password')
		.error.error-password


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
		placeholder: 'Выбрать'
		rules:
			required:
				not: 'Выбрать'
				
```

### fieldsOptions - общие настройки для всех полей. (Опционально)
#####
Настройки самого поля приоритетней!
Ниже приведены настройки по-умолчанию
##### 

```

fieldsOptions:
	
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

```

### Настройки формы
##### Ниже приведены настройки по-умолчанию 
```
Form
	
	# Обязательные атрибуты

	formEl = false # Элемент формы или класс
	submitEl = false # Элемент кнопки отправки или класс
	
	# Опционально

	###
	autoFields
	Автоматическая сборка полей для отправки. Элементы с атрибутом [name]
	Если false - обрабатываться будут только указанные поля!
	По умолчанию - true
	###
	
	@autoFields = true
	
	fields: {} # Проверяемые поля
	fieldsOptions: {} # Настройки полей


 	logs: true # Логи. По умолчанию false
	formName: 'nice form' Имя формы (опционально)

	enter: true  # Отправка на Enter (В фокусе формы)
	noSubmitEmpty: false # Не отправлять пустые значение и false
	disableSubmit: false # Заблокировать сабмит

	classes:
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
	
	templates:
		hidden: """<div style='position:absolute;width:0;height:0;overflow:hidden;'></div>"""
		checkbox: """<div></div>"""
		radio: """<div></div>"""
		select:
			select: """<div></div>"""
			selected: """<div><span>{selected}</span></div>"""
			options: """<div></div>"""
			option: """<div><span>{text}</span></div>"""
		error: """<div>{error}</div>"""

```
## Вариант настройки обработки полей

##### 
У каждого правила (rules) может быть указана причина (reason).
По умолчанию reason устанавливается form.js
##### 

```
fields = 

	'login':
		placeholder: "login"
		rules:
			required:
				reason: 'Своя причина'
			alpha:
				reason: 'Своя причина'
			max:
				count: 4
				reason: 'Максимум {count}'
			min:
				count: 2
				reason: 'Минимум {count}'


```
				
## Правила валидации

```
required — Обязательное поле
	not: Значение кроме
numeric — Разрешены только цифры
alpha — Разрешены только буквы
eng — Разрешены только английские буквы
rus — Разрешены только русские буквы
max — Максимум символов
	count - кол-во символов
min — Минимум символов
	count - кол-во символов
email — Email
url — Url
compare - Сравнение
	val: значение или функция
	field: или имя поля для сравнения
not - занчение или массив значений исключения

only - Обьект условий. Разрешены любые указанные значения (см. patterns)
sctict - Обьект условий. Обязательны все указанные условия! (см. patterns)


```

### Patterns (only,sctict)
#####
Каждому значению можно выставить или true или массив.
Например [0,2] ,где первое значние Минимум символов данного типа, а второе, если передано - Максимум
##### 

```
numeric 	- цифры
alpha  		- буквы
rus 		- русские буквы
rusLowercase 	- русские маленькой буквы
rusUppercase 	- русские большие буквы
eng 		- английские буквы
engLowercase 	- английские маленькие буквы
engUppercase 	- английские большие буквы
dot 		- точки
hyphen 		- дефисы
dash 		- подчеркивания
space 		- пробелы
slash 		- слэшы
comma 		- запятые
special		- специальныe символы

```

## Добавление своего правила валидации

```

formValidator.addFieldRule(name,ruleName,rule={})

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
formValidator.addField('название поля', options={},onInit: -> )

```

Удаление поля
```
formValidator.removeField('название поля')

```

Сброс поля
```
formValidator.fields['название поля'].reset()
```

Сделать обязательным
```
formValidator.fields['название поля'].require(opt={})
```

Сделать активным или наооборот
```
formValidator.fields['название поля'].activate(flag=true)
```

Вывести ошибку или удалить
На вход или значение или массив или false (если очистить)
```
formValidator.fields['название поля'].error(errors=false)
```

Установка значения поля
```
formValidator.fields['название поля'].val('значение')
```

Получение значения поля
```
formValidator.fields['название поля'].val()
```

Стилизация поля
```
formValidator.fields['название поля'].stylize()
```

Следить за ошибками поля
```
formValidator.fields['название поля'].on 'Error', (e,data) ->

Или
formValidator.on 'Error', '[data-field][data-name="название поля"]', (e,data) ->
```

Следить за сбросом поля
```
formValidator.fields['название поля'].on 'Reset', (e,data) ->

Или
formValidator.on 'Reset', '[data-field][data-name="название поля"]', (e,data) ->
```

Следить за изменениями поля
```
formValidator.fields['название поля'].on 'Change', (e,data) ->

Или
formValidator.on 'Change', '[data-field][data-name="название поля"]', (e,data) ->
```

Следить за стилизацией поля
```
formValidator.fields['название поля'].on 'Style', (e,sel) ->

(Пример слежения за всеми полями одного типа)
formValidator.on 'Style', '[data-field][data-type="тип поля"]', (e,sel) ->
	# sel - стилизованный селектор dom
```

Следить за кликом по полю
```
formValidator.on 'Click', '[data-name="название поля"]', ->

Или
formValidator.on 'Click', '[data-field][data-name="название поля"]', (e,data) ->
```

Следить за нажатие на поле
```
formValidator.on 'Keyup', '[data-name="название поля"]', ->

Или
formValidator.on 'Keyup', '[data-field][data-name="название поля"]', (e,data) ->
```

## Дополнения

```
formValidator.submit(true) # Заблокировать кнопку отправки
formValidator.submit(false)  # Активировать кнопку отправки

formValidator.preloader(true) # Показать прелоадер формы
formValidator.preloader(false) # Скрыть прелоадер формы
```
