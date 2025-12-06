## Error Code 400-499
- 400
  - Email not valid!
    > Email не валиден (не верный формат)
  - EMail is busy!
    > Пользователь с таким Email уже зарегистрирован
  - Request parameters not recognized! (paramName)
    >Передаваемый в запрос параметр не найден или имеет не верный формат

- 401 (ReqErrorTypes.authLogin)
  - Access token not found or has not valid format!
    >Токен не найден в заголовке, либо имеет не корректный формат по RegEx=/^[a-zA-Z0-9]{100}$/
  - Refresh token not found or has not valid format!
    >Токен не найден в заголовке, либо имеет не корректный формат по RegEx=/^[a-zA-Z0-9]{120}$/
  - Access token invalid!
    >Access Token не соответствует хранящемуся в базе
  - Refresh token invalid!
    >Refresh Token не соответствует хранящемуся в базе
  - Access token out of date!
    >  Срок действия Access Token истек
  - Refresh token out of date!
    >  Срок действия Refresh Token истек
  - Email not valid!
    >  Email не валиден (не верный формат)
  - Password wrong!
    >  Пароль не валиден (не верный формат)  
    Пароль не соответствует сохраненному в БД
  - E-mail not found in DB!
    >  Пользователь с таким E-Mail адресом не зарегистрирован

- 403 User blocked!
- 406 Data not acceptable!
  >Некоторые данные не соответствуют требованиям! + messages['string'];

### orders.php (post)
- 400
  - Delivery identifier not found!
    > Выбран не существующий метод доставки!
  - Selected Delivery Type not possible now!
    > Выбранный метод доставки не доступен в данный момент. Disabled флаг у метода доставки
  - Payment method identifier not found!
    > Выбранный несуществующий метод доставки!
  - Selected Payment method not possible now!
    > Выбранный метод оплаты не доступен в данный момент. Disabled флаг у метода оплаты
  - Unrecognized products were removed.
    > Один или несколько продуктов не были найден в БД и были удален из корзины пользователя
- 406 ошибки валидации
  - Data not acceptable!
    > Ошибка валидации.  
     Для данной ошибки доступна переменная messages со следующими сообщениями:
    - Invalid delivery type! - Метод доставки не корректен (0 спосле конвертации)
    - Invalid payment type! - Метод оплаты не корректен (0 спосле конвертации)
    - Invalid first name! - Имя не корректно или отсутствует.
    - Invalid last name! - Фамилия не корректно или отсутствует.
    - Invalid phone! - Номер телефона не корректно или отсутствует.
    - E-Mail is incorrect - E-Mail не корректен или отсутствует.
    - Invalid ZIP code! - Почтовый индекс не корректен или отсутствует.
    - Invalid region! - Регион не корректен или отсутствует.
    - Invalid city! - Город не корректен или отсутствует.
    - Invalid street! - Улица не корректен или отсутствует.
    - Invalid house! - Номер дома не корректен или отсутствует.
- 409 указывает на редирект на корзину
  - User cart empty!
    > Корзина пользователя пустая. Не возможно создать заказ.
  - All products from cart were not found in the database and were removed from the cart.
    > Все продукты из корзины не найдены в БД. Корзина была очищена.
  - Create order error.
    > Ошибка при создании заказа связанная с продуктами в корзине.  
     Для данной ошибки доступна переменная messages со следующими сообщениями:
    - Not enough product in stock. (Имя продукта) - Продукта не хватает на складе для заказа
    - Product from cart is not available. (Name) - Продукт не доступен для продажи.
### user.php (post)
  - 400
    - Nothing to change!
    > Нет данных для изменения. Массив входящих параметров пуст
- 406 ошибки валидации
  - Data not acceptable!
    > Ошибка валидации.  
    Для данной ошибки доступна переменная messages со следующими сообщениями:
    - Current password not found! - Действующий пароль не указан.
    - Current password wrong. - Действующий пароль не верный.
    - New passwords do not match! - Новые пароли не совпадают.
    - New password not acceptable! - Новый пароль не соответствует минимальным требованиям.
    - Invalid region! - Регион не корректен или отсутствует.
    - Invalid first name! - Имя не корректно или отсутствует.
    - Invalid last name! - Фамилия не корректно или отсутствует.
    - E-Mail is incorrect - E-Mail не корректен или отсутствует.
    - Invalid phone! - Номер телефона не корректно или отсутствует.
    - Invalid ZIP code! - Почтовый индекс не корректен.
    - Invalid house! - Номер дома не корректен.
    - E-Mail is busy! - Указанный E-Mail уже занят.
    - Delivery identifier not found! - Такого способа доставки не существует
    - Payment method identifier not found! - Такого способа оплаты не существует
    - Invalid delivery type! - Способ доставки не корректен (0 спосле конвертации)
    - Invalid payment type! - Метод оплаты не корректен (0 спосле конвертации)

## Code 200 (Ok) with Errors

## Code 200 (Ok)
- Request success!
- Record changed!
- Record deleted!
- Cart has been rebased!
  if (errorResponse.status !==401 && errorResponse.status !== 403)
