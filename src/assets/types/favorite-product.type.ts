export type FavoriteProductType = {
  id: number,
  name: string,
  price: number,
  image: string,
  url: string,
  count: number,
  disabled: boolean,
  ends: boolean,//Маркер того, что товар заканчивается
  countInCart?: number,//флаг корзины фронтенда
  isInCart?: boolean,
}
