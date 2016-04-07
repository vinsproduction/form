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
		
		self = @
	
		self.submit(false)
		self.preloader(true)

		api({ method: 'POST', url:"login", data: data})
			.error (res) -> console.error res
			.success (res) ->
				self.submit(true)
				self.preloader(false)
	


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
Ниже приведены настройки по умолчанию
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
#####
Ниже приведены настройки по умолчанию
#####
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
	###
	
	@autoFields = true
	
	fields: {} # Проверяемые поля
	fieldsOptions: {} # Настройки полей


 	logs: true # Логи
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
			placeholder: 'default' # Класс селекта значения по умолчанию, например 'Выбрать'		
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


## Валидация

##### 
Примерь настройки обработки полей
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
				
### Правила валидации

Имя | Пояснение
------------ | -------------
required | Обязательное поле
required.not | Обязательное поле + значение кроме (значение или массив)
numeric | Разрешены только цифры
alpha | Разрешены только буквы
eng | Разрешены только английские буквы
rus | Разрешены только русские буквы
max | Максимум символов (true или число)
max.count | Кол-во символов (если указыается причина)
min | Минимум символов (true или число)
min.count | Кол-во символов (если указыается причина)
email | Email
url | Url
compare | Сравнение
compare.field | Имя поля для сравнения
compare.val | Значение или функция
not | Исключение (значение или массив)
only | Обьект условий. Разрешены любые указанные значения (см. patterns)
sctict | Обьект условий. Обязательны все указанные условия! (см. patterns)


### Patterns (only,sctict)
#####
Каждому значению можно выставить или true или массив.
Например: [0,2] ,где первое значение Минимум символов данного типа, а второе, если передано, Максимум
##### 

Имя | Пояснение
------------ | -------------
numeric | цифры
alpha | буквы
rus | русские буквы
rusLowercase | русские маленькой буквы
rusUppercase | русские большие буквы
eng | английские буквы
engLowercase | английские маленькие буквы
engUppercase | английские большие буквы
dot | точки
hyphen | дефисы
dash | подчеркивания
space | пробелы
slash | слэшы
comma | запятые
special	| специальныe символы


### Добавление правила валидации к полю

```
form.addFieldRule(name,ruleName,rule={})

```

### Добавление Нового правила валидации
```
rule = 
	condition: (val) -> return true //Условие
	reason: 'Причина' 

form.newRule(name,rule)

```
	
## События формы

Инициализация формы
```
form.onInit ->
```

Нажатие кнопки Отправить (data - данные для работы. list - данные исходные - не экранированные)
```
form.onSubmit (data, list) -> 
```

Валидация пройдена  (data - данные для работы. list - данные исходные - не экранированные)
```
form.onSuccess (data, list) -> # Отправка данных на серверх 
```

Валидация НЕ пройдена 
```
form.onFail (errors) ->
```

Сброс формы
```
form.onReset: ->
```

## Методы формы

Сброс формы
```
form.reset()
```

## Методы полей формы

Добавление поля
```
form.addField('название поля', options={},onInit: -> )

```

Удаление поля
```
form.removeField('название поля')

```

Сброс поля
```
form.fields['название поля'].reset()
```

Сделать поле обязательным
```
form.fields['название поля'].require(opt={})
```

Сделать поле активным и наоборот
```
form.fields['название поля'].activate(flag=true)
```

Вывести ошибку или удалить
На вход строка или массив или false (если удалить ошибку)
```
form.fields['название поля'].error(errors=false)
```

Установка значения поля
```
form.fields['название поля'].val('значение')
```

Получение значения поля
```
form.fields['название поля'].val()
```

Стилизация поля (Применяется, в основном, к select)
```
form.fields['название поля'].stylize()
```

Проверить валидность поля
```

form.fields['название поля'].validate(ruleName,opt={})
```

## Триггеры полей

Следить за ошибками поля
```
form.fields['название поля'].on 'Error', (e,data) ->

Или

form.on 'Error', '[data-field][data-name="название поля"]', (e,data) ->
```

Следить за сбросом поля
```
form.fields['название поля'].on 'Reset', (e,data) ->

Или

form.on 'Reset', '[data-field][data-name="название поля"]', (e,data) ->
```

Следить за изменениями значения поля
```
form.fields['название поля'].on 'Change', (e,data) ->

Или

form.on 'Change', '[data-field][data-name="название поля"]', (e,data) ->
```

Следить за стилизацией поля (Например для навешивания скролла)
```
form.fields['название поля'].on 'Style', (e,sel) ->

(Пример слежения за всеми полями одного типа)
form.on 'Style', '[data-field][data-type="тип поля"]', (e,data) -> # data.sel - стилизованный селектор dom
```

Следить за кликом по полю
```
form.on 'Click', '[data-name="название поля"]', ->

Или

form.on 'Click', '[data-field][data-name="название поля"]', (e,data) ->
```

Следить за нажатием на поле
```
form.on 'Keyup', '[data-name="название поля"]', ->

Или

form.on 'Keyup', '[data-field][data-name="название поля"]', (e,data) ->
```

## Дополнения

```
formValidator.submit(true) # Активировать кнопку отправки
formValidator.submit(false) # Заблокировать кнопку отправки 

formValidator.preloader(true) # Показать прелоадер формы
formValidator.preloader(false) # Скрыть прелоадер формы
```
