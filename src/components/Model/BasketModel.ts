import { IBasket, ICard } from "../../types";
import { IEvents } from "../base/events";

export class BasketModel implements IBasket {
    protected _cards: ICard[];
    protected events: IEvents;

    constructor(events: IEvents) {
        this._cards = [];
        this.events = events;
    }
    
    get cards() {
        return this._cards;
    }

    addCard(card: ICard) {
        if (this.alreadyInBasket(card.id)) {
            console.log("По одной в руки!");
            return
        }
        if (card.price === null) {
            console.log("Нельзя купить бесценное!");
            return
        }
        this._cards.push(card);
    };

    removeCard(cardId: string) {
        if ( !this.alreadyInBasket(cardId)) {
            console.log("Нельзя удалить товар, если его нет в корзине!");
            return
        }
        this._cards = this._cards.filter(item => item.id !== cardId);
    }

    alreadyInBasket(cardId: string) {
        return this._cards.some(item => item.id === cardId);
    }

    clear() {
        this._cards = [];
    }

    getTotal() {
        return this._cards.reduce((sum, item) => sum + item.price, 0);
    }

    getCount() {
        return this._cards.length;
    }
}