import {MainTranslationType} from '../../../assets/types/translations/main-translation.type';
import {AppLanguages} from '../../../assets/enums/app-languages.enum';
import {ReviewType} from '../../../assets/types/review.type';

export const mainTranslations: { [key in AppLanguages]:  MainTranslationType } = {
  [AppLanguages.ru]: {
    mainTitle: "Создадим сад \n в вашем доме и офисе",
    mainText: 'Если в большом городе вы скучаете по природе, ничто не мешает вам превратить в оазис квартиру или офис. И мы поможем вам это сделать!',
    discountOfferTitle: 'Получи скидку 10% в нашем инстаграме!',
    discountOfferText: 'Подпишись на наш аккаунт и напиши в direct “хочу промокод”',
    discountOfferButton: 'Получить промокод',
    potOfferTitle: 'Новая коллекция керамических кашпо в наличии',
    potOfferButton: 'В каталог',
    topPurposesTitle:'Лучшие предложения месяца',
    infoTitle: 'Доставка и оплата',
    infoDeliveryMain: 'Доставка курьером (по г. Саарбрюккен)',
    infoDeliveryExtra: 'На следующий день после оформления заказа',
    infoPickupMain: 'Самовывоз',
    infoPickupExtra: 'Пункт выдачи товаров: г. Саарбрюккен, ул. Триерер 1, ТЦ "Европа Галерея", 1 этаж',
    infoCashPayment:'Наличный расчет при получении',
    infoCashlessPayment:'Безналичный расчет при получении',
    infoCardPayment:'Оплата банковской картой в интернет-магазине',
    reviewsTitle:'Отзывы о Amora Flowers',
  },
  [AppLanguages.en]: {
    mainTitle: 'We create a garden in your home and office',
    mainText: 'If you miss nature in a big city, nothing stops you from turning your apartment or office into a green oasis. And we are here to help!',
    discountOfferTitle: 'Get 10% off on Instagram!',
    discountOfferText: 'Follow our account and send us a direct message saying “I want a promo code”',
    discountOfferButton: 'Get promo code',
    potOfferTitle: 'New collection of ceramic planters now available',
    potOfferButton: 'Go to catalog',
    topPurposesTitle: 'Best offers of the month',
    infoTitle: 'Delivery and Payment',
    infoDeliveryMain: 'Courier delivery (within Saarbrücken)',
    infoDeliveryExtra: 'Next day after placing the order',
    infoPickupMain: 'Store pickup',
    infoPickupExtra: 'Pickup point: Saarbrücken, Trierer Street 1, Europa-Galerie, 1st floor',
    infoCashPayment: 'Cash payment upon delivery',
    infoCashlessPayment: 'Cashless payment upon delivery',
    infoCardPayment: 'Card payment in the online store',
    reviewsTitle: 'Amora Flowers reviews',
  },
  [AppLanguages.de]: {
    mainTitle: 'Wir schaffen einen Garten in Ihrem  Zuhause und Büro',
    mainText: 'Wenn Sie in der Großstadt die Natur vermissen, steht nichts im Weg, Ihre Wohnung oder Ihr Büro in eine grüne Oase zu verwandeln. Und wir helfen Ihnen dabei!',
    discountOfferTitle: 'Erhalten Sie 10 % Rabatt auf Instagram!',
    discountOfferText: 'Abonnieren Sie unseren Account und schreiben Sie uns im Direct „Ich möchte einen Promocode“',
    discountOfferButton: 'Promocode erhalten',
    potOfferTitle: 'Neue Kollektion keramischer Blumentöpfe jetzt verfügbar',
    potOfferButton: 'Zum Katalog',
    topPurposesTitle: 'Die besten Angebote des Monats',
    infoTitle: 'Lieferung und Zahlung',
    infoDeliveryMain: 'Kurierlieferung (innerhalb von Saarbrücken)',
    infoDeliveryExtra: 'Am nächsten Tag nach der Bestellung',
    infoPickupMain: 'Selbstabholung',
    infoPickupExtra: 'Abholstelle: Saarbrücken, Trierer Straße 1, Europa-Galerie, 1. Etage',
    infoCashPayment: 'Barzahlung bei Erhalt',
    infoCashlessPayment: 'Unbare Zahlung bei Erhalt',
    infoCardPayment: 'Zahlung per Bankkarte im Online-Shop',
    reviewsTitle: 'Bewertungen zu Amora Flowers',
  }

};

export const reviewsTranslations:{[key in AppLanguages]:ReviewType[]} = {
  [AppLanguages.ru]:[
    {
      name:'Ирина',
      image:'review1.png',
      text:'В ассортименте я встретила все комнатные растения, которые меня интересовали. Цены - лучшие в городе. Доставка - очень быстрая и с заботой о растениях.',
    },
    {
      name:'Анастасия',
      image:'review2.png',
      text:'Спасибо огромное! Цветок арека невероятно красив - просто бомба! От него все в восторге! Спасибо за сервис - все удобно сделано, доставили быстро. И милая открыточка приятным бонусом.',
    },
    {
      name:'Илья',
      image:'review3.png',
      text:'Магазин супер! Второй раз заказываю курьером, доставлено в лучшем виде. Ваш ассортимент комнатных растений впечатляет! Спасибо вам за хорошую работу!',
    },
    {
      name:'Аделина',
      image:'review4.jpg',
      text:'Хочу поблагодарить всю команду за помощь в подборе подарка для моей мамы! Все просто в восторге от мини-сада! А самое главное, что за ним удобно ухаживать, ведь в комплекте мне дали целую инструкцию.',
    },
    {
      name:'Яника',
      image:'review5.jpg',
      text:'Спасибо большое за мою обновлённую коллекцию суккулентов! Сервис просто на 5+: быстро, удобно, недорого. Что ещё нужно клиенту для счастья?',
    },
    {
      name:'Марина',
      image:'review6.jpg',
      text:'Для меня всегда важным аспектом было наличие не только физического магазина, но и онлайн-маркета, ведь не всегда есть возможность прийти на место. Ещё нигде не встречала такого огромного ассортимента!',
    },
    {
      name:'Станислав',
      image:'review7.jpg',
      text:'Хочу поблагодарить консультанта Ирину за помощь в выборе цветка для моей жены. Я ещё никогда не видел такого трепетного отношения к весьма непростому клиенту, которому сложно угодить! Сервис – огонь!',
    },
  ],
  [AppLanguages.en]: [
    {
      name: 'Irina',
      image: 'review1.png',
      text: 'I found all the houseplants I was looking for in the assortment. The prices are the best in the city. Delivery was very fast and handled with great care for the plants.',
    },
    {
      name: 'Anastasia',
      image: 'review2.png',
      text: 'Thank you so much! The areca palm is incredibly beautiful — absolutely stunning! Everyone is in love with it. Thanks for the great service: everything is convenient and delivery was fast. The lovely card was a very nice bonus.',
    },
    {
      name: 'Ilya',
      image: 'review3.png',
      text: 'Amazing shop! This is my second time ordering via courier — everything arrived in perfect condition. Your selection of houseplants is truly impressive. Thank you for your great work!',
    },
    {
      name: 'Adelina',
      image: 'review4.jpg',
      text: 'I would like to thank the entire team for helping me choose a gift for my mom! Everyone was delighted with the mini garden. Most importantly, it’s very easy to take care of — I even received a detailed care guide.',
    },
    {
      name: 'Janika',
      image: 'review5.jpg',
      text: 'Thank you so much for my renewed succulent collection! The service is simply 5 stars: fast, convenient, and affordable. What more could a customer ask for?',
    },
    {
      name: 'Marina',
      image: 'review6.jpg',
      text: 'For me, it has always been important to have not only a physical store but also an online shop, since it’s not always possible to visit in person. I have never seen such a huge assortment anywhere else!',
    },
    {
      name: 'Stanislav',
      image: 'review7.jpg',
      text: 'I would like to thank the consultant Irina for helping me choose a plant for my wife. I have never experienced such attentive and caring service for a rather demanding client! The service is outstanding!',
    },
  ],
  [AppLanguages.de]: [
    {
      name: 'Irina',
      image: 'review1.png',
      text: 'Im Sortiment habe ich alle Zimmerpflanzen gefunden, die mich interessiert haben. Die Preise sind die besten in der Stadt. Die Lieferung war sehr schnell und mit viel Sorgfalt für die Pflanzen.',
    },
    {
      name: 'Anastasia',
      image: 'review2.png',
      text: 'Vielen Dank! Die Areca-Palme ist unglaublich schön – einfach der Wahnsinn! Danke für den tollen Service: alles ist sehr bequem organisiert und die Lieferung war schnell. Die süße Karte war ein besonders netter Bonus.',
    },
    {
      name: 'Ilja',
      image: 'review3.png',
      text: 'Super Shop! Ich bestelle bereits zum zweiten Mal per Kurier – alles kam in einwandfreiem Zustand an. Das Sortiment an Zimmerpflanzen ist wirklich beeindruckend. Vielen Dank für eure tolle Arbeit!',
    },
    {
      name: 'Adelina',
      image: 'review4.jpg',
      text: 'Ich möchte dem gesamten Team für die Hilfe bei der Auswahl eines Geschenks für meine Mutter danken! Besonders schön ist, dass er sehr pflegeleicht ist – ich habe sogar eine ausführliche Anleitung dazu bekommen.',
    },
    {
      name: 'Janika',
      image: 'review5.jpg',
      text: 'Vielen Dank für meine erneuerte Sukkulenten-Kollektion! Der Service ist einfach 5+: schnell, bequem und preiswert. Was braucht ein Kunde mehr zum Glücklichsein?',
    },
    {
      name: 'Marina',
      image: 'review6.jpg',
      text: 'Für mich war es immer wichtig, dass es neben dem stationären Geschäft auch einen Online-Shop gibt, da man nicht immer vor Ort sein kann. Einen so großen und vielfältigen Sortiment habe ich bisher nirgendwo gesehen!',
    },
    {
      name: 'Stanislaw',
      image: 'review7.jpg',
      text: 'Ich möchte der Beraterin Irina für ihre Hilfe bei der Auswahl einer Pflanze für meine Frau danken. So viel Geduld und Aufmerksamkeit gegenüber einem nicht ganz einfachen Kunden habe ich noch nie erlebt! Der Service ist einfach top!',
    },
  ]
};
