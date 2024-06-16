export type IProduct = {
  id: string,
  title: string,
  description: string,
  price: number,
};


export type ICartItem = {
  product: IProduct,
  count: number,
}

export type ICart = {
  id: string,
  items: ICartItem[],
}
