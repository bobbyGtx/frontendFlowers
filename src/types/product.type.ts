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
  count: number,
  disabled: boolean,
  type: {
    id: number,
    name: string,
    url: string
  }
}
