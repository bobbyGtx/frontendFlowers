## Алгоритм вывода сообщения пользователю при обработке ответа сервера
### Код 200 (Ok)
```ts
response={
  error:false,
  message:"Response Message",
  messages:["message1","message2"],
  responseData:any
}
```

#### Ок + ошибка нет данных (Если error=true и нет responseData)
```ts
response={
  error:true,
  message:"Error Message",
}
```
- Выводим сообщение об ошибке, которое заготовлено в сервисе этого запроса на нескольких языках и типизировано. Так мы скрываем подробности ошибки от пользователя.
- Генерируем ошибку с описанием response.message. Текст сообщения message попадет в консоль.
```ts
if (data.error && !data.cart) {
    this.showSnackService.error(this.cartService.getCartError);//сообщение об ошибке
    throw new Error(data.message);//генерация ошибки
}
```
#### Ок + ошибка + данные (Если error=true и есть responseData)
```ts
response={
  error:true,
  message:"Response Message",
  responseData:any
}
```
Сервер столкнулся с проблемами и что-то изменил. 
> **⚠️ Warning:**
>На данный момент единственная такая ошибка в запросах с получением корзины. "Cart has been cleared by the system."
>Этот вид инфосообщения перехватывается в сервисе "CartServise" в теле запросов и выводится как ошибка!
```ts
if (data.cart && data.cart.count >= 0) {
  if (data.error) this.showSnackService.error(data.message, ReqErrorTypes.cartGetCart);
}
```
#### Ок + данные + массив сообщений (Если есть messages[])
```ts
response={
  error:false,
  message:"Response Message",
  messages:["message1","message2"],
  responseData:any
}
```
При наличии массива сообщений, сервер столкнулся с одной или несколькими проблемами.
- Выводим эти сообщения как информационные через сервис сообщений "ShowSnackService". Передать в него нужно весь ответ.
  - Сервис принимает ответ и обрабатывает только свойства "message:string" и "messages:string[]". Все строки для перевода ищутся в переменной "userInfos".
  - Если в "message" находится стандартный ответ от сервера, который указан в настройках, и массив "messages" содержит только 1 сообщение, то "message" игнорируется. Сервис выводит простой снэкбар с переведенным текстом "messages[0]";
  - Если в "message" находится стандартный ответ от сервера, который указан в настройках, а массив "messages" содержит несколько строк, то "message" переводится как "Информация:" и служит заголовком уведомления. Выводится расширенный снекбар с переведенными "messages"
  - Если в "message" находится не стандартный ответ от сервера, который указан в настройках, а массив "messages" содержит несколько строк, то "message" переводится и служит заголовком уведомления. Выводится расширенный снекбар с переведенными "messages"
---
### Код 400-599
#### Ошибка с вероятным получением списка ошибок в переменной "messages[]"
```ts
response={
  error:true,
  message:"Response Message",
  messages:["message1","message2"],//только при валидации полей. На данный момент SignUp, Order и EditUserData
}
```
 - Выводим сообщение об ошибке с передачей в функцию всего ответа и типа запроса!
   - Если есть только message, её перевод ищется в "userGroupErrors", где ошибки сгруппированы по типу запроса. Если перевод не найден, выводится последний свойство Default с заглушкой ошибки.
   - Если есть "messages" - то выводится расширенное сообщение, а переводы строк из массива берутся из переменной "userMessages"
   - Некоторые запросы, которые не зависят от пользователя, при получении ошибок выводят сообщение из сервиса этого запроса! "this.showSnackService.error(this.productService.getBestProductsError);"
```ts
   error: (errorResponse:HttpErrorResponse)=> {
    console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected Sign Up error! Code:${errorResponse.status}`);
    this.showSnackService.errorObj(errorResponse.error,ReqErrorTypes.authSignUp);
    }
```
 - Ошибки в запросах требующих авторизации обрабатываются иначе. 
  >В интерцепторе перехватываются ошибки авторизации с кодами 401 и 403. Во избежание дублирования сообщений, вывод сообщений у этих кодов исключается
```ts
  if (errorResponse.error.status !== 401 && errorResponse.status !== 403) {
  this.showSnackService.error(this.favoriteService.removeFavoriteError);
  }
  ```
### Пример кода обработки ответа
```ts
        this.authService.signUp(this.signUpForm.value.email,this.signUpForm.value.password,this.signUpForm.value.passwordRepeat)
  .subscribe({
    next: (data:DefaultResponseType)=> {
      if (data.error){
        this.showSnackService.error(data.message,ReqErrorTypes.authSignUp);
        throw new Error(data.message);
      }
      this.showSnackService.success(data.message);
      this.router.navigate(['/login']);
    },
    error: (errorResponse:HttpErrorResponse)=> {
      console.error(errorResponse.error.message?errorResponse.error.message:`Unexpected Sign Up error! Code:${errorResponse.status}`);
      this.showSnackService.errorObj(errorResponse.error,ReqErrorTypes.authSignUp);
    },
  })
```
