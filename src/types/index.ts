//export interface ICardsFromServer {
//    total: number;
//    items: ICard[];
//}

export interface ICard {
    id: string;
    itemIndex: number;
    description: string;
    image: string;
    title: string;
    category: CardCategory;
    price: number | null;
    inBasket: boolean;
    canBuy: number | null;
}


export interface ICardsBlock {
    cards: ICard[];
    getCard(cardId: string): ICard;
    //preview: string | null;
}


export type CardCategory = 'софт-скил' | 'хард-скил' | 'другое' | 'кнопка' | 'дополнительное';

export const categoryType: Record<CardCategory, string> = {
    'софт-скил': 'soft',
    'хард-скил': 'hard',
    'другое': 'other',
    'кнопка': 'button',
    'дополнительное': 'additional',
}


export interface IBasket {
    cards: ICard[];
    addCard(card: ICard): void;
    alreadyInBasket(cardId: string) : boolean;
    clear(): void;
    getTotal(): number;
    getCount(): number;
    removeCard(cardId: string): void;
}


export type PaymentType = 'card' | 'cash' | null;

export interface IOrderData {
    address: string;
    email: string;
    payment: PaymentType;
    phone: string;
}

export interface IOrder extends IOrderData {
    clear(): void;
    getOrderData(): IOrderData;
}


export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    baseUrl: string;
    get<T>(uri: string): Promise<T>;
    post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface IOrderResponse {
  id?: string;
  total?: number;
  error?: string;
  code?: number;
}









//export type CardBasketMODAL = Pick<ICard, 'title' | 'price'>;
//export type PayAddressMODAL = Pick<IOrderData, 'payment' | 'address'>;
//export type EmailPhoneMODAL = Pick<IOrderData, 'email' | 'phone'>;