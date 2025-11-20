export type ProductType = {
  id: number,
  name: string,
  price: number,
  image: string,
  lightning: string,
  humidity: string,
  temperature: string,
  height: number,
  diameter: number,
  url: string,
  category_id:number,
  count: number,
  disabled: boolean,
  type: {
    id: number,
    name: string,
    url: string
  },
  countInCart?: number,//флаг корзины
  isInFavorite?: boolean,//флаг избранного
}
