import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from '../../shared/services/product.service';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ShowSnackService} from '../../core/show-snack.service';
import {OwlOptions} from 'ngx-owl-carousel-o';
import {ProductType} from '../../../assets/types/product.type';
import {BestProductsResponseType} from '../../../assets/types/responses/best-products-response.type';
import {CartResponseType} from '../../../assets/types/responses/cart-response.type';
import {CartService} from '../../shared/services/cart.service';
import {CartItemType} from '../../../assets/types/cart-item.type';

type ReviewType={
  name: string,
  image: string,
  text: string,
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy {
  productService: ProductService=inject(ProductService);
  showSnackService: ShowSnackService=inject(ShowSnackService);
  cartService: CartService=inject(CartService);
  subscriptions$: Subscription=new Subscription();
  bestProducts:ProductType[]=[];
  customOptionsReviews: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 26,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      }
    },
    nav: false
  };
  reviews:Array<ReviewType> = [
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
  ];

  ngOnInit() {
    const combinedRequest$:Observable<[BestProductsResponseType,CartResponseType]> = combineLatest([
      this.productService.getBestProducts(),
      this.cartService.getCart()
    ]);
    this.subscriptions$.add(combinedRequest$.subscribe({
      next: (data:[BestProductsResponseType,CartResponseType]) => {
        if (data[0].error){
          this.showSnackService.error(this.productService.getBestProductsError);
          throw new Error(data[0].message);
        }//Обработка ошибки запроса лучших продуктов
        if (data[1].error) {
          this.showSnackService.error(this.cartService.userErrorMessages.getCart);
          throw new Error(data[1].message);
        }//Обработка ошибки корзины пользователя
        let bestProducts: ProductType[]=data[0].products?data[0].products:[];

        if (data[1].cart && data[1].cart.items.length > 0){
          data[1].cart.items.forEach((cartItem:CartItemType)=>{
            const bestProductIndex:number = bestProducts.findIndex((bestProductItem:ProductType)=> bestProductItem.id==cartItem.product.id);
            if (bestProductIndex!==-1) bestProducts[bestProductIndex].countInCart=cartItem.quantity;
          })
        }
        this.bestProducts = bestProducts;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.showSnackService.error('Request Error!');
        if (errorResponse.error && errorResponse.error.message) console.log(errorResponse.error.message)
        else console.log(`Unexpected error (get Cart + getBestProducts)!` + ` Code:${errorResponse.status}`);
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions$.unsubscribe();
  }
}
