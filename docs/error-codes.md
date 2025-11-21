## Error Code 400-499
- 400
  - Email not valid!
    > Email не валиден (не верный формат)
  - EMail is busy!
    > Пользователь с таким Email уже зарегистрирован

- 401 
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

## Code 200 (Ok) with Errors
  - Nothing to change!
    > Данные для добавления в базу данных не обнаружены. (updateUserData,prepareNewData) запрос patch->user

//$errors['userIdNotFound'] добавить везде код 500
