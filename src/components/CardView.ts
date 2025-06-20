import { categoryType, ICard, CardCategory } from "../types";
import { CDN_URL } from "../utils/constants";
import { Component } from "./base/component";
import { IEvents } from "./base/events";



export class CardView<ICard> extends Component<ICard> {
    protected events: IEvents;
    protected _cardID: string;
    protected _itemIndex: HTMLElement;
    protected _price: HTMLElement;
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _category?: HTMLElement;
    protected _toBasketButton?: HTMLButtonElement;

 	constructor(protected container: HTMLElement, events: IEvents) {
		super(container);
        this.events = events;
        this._title = this.container.querySelector('.card__title');
        this._price = this.container.querySelector('.card__price');

        //this._image = null;
        //this._description = null;
        //this._category = null;
        //this._itemIndex = null;
        //this._toBasketButton = null;
    }

    set category(value: CardCategory) { 
        if( this._category) {
            this._category.textContent = value;
            this._category.className = "card__category"; // сброс классов
            this._category.classList.add(`card__category_${categoryType[value]}`);
        }
    }

    set image(value: string) {
        if (this._image) {
            this._image.src = CDN_URL + value;
        }
    }

    set price(value: number | null) {
        this._price.textContent = (value ? `${value} синапсов` : 'Бесценно');
    }

    set description(value: string) {
        if (this._description) { 
            this._description.textContent = value;
        }
    }

    set id(value:string) {
        this._cardID = value;
    }

    set title( value:string) {
        this._title.textContent = value;
    }

    set itemIndex( value: number) {
        if (this._itemIndex) { 
            console.log(value);
            this._itemIndex.textContent = String(value);
        }
    }

    set inBasket( value: boolean) {
        if(this._toBasketButton) {
            this.changeDisabledState(this._toBasketButton, value);
            this._toBasketButton.textContent = ( value ? 'Уже в корзине' : 'В корзину');
        }
    }
    
    set canBuy(value: number | null) {
        if(value === null) {
            this.changeDisabledState(this._toBasketButton, true);
            this._toBasketButton.textContent = "Увы, это бесценно!"
        }
    }
}

export class CardModalView<ICard> extends CardView<ICard> {
    constructor(protected container: HTMLElement, events: IEvents) {
        super(container, events);
        this._image = this.container.querySelector('.card__image');
        this._category = this.container.querySelector('.card__category');
        this._description = this.container.querySelector('.card__text');
        this._toBasketButton = this.container.querySelector('.card__button');
        
        //this.inBasket = false;

        this._toBasketButton.addEventListener('click', () => {
	        this.events.emit('CardModalView: move_item_to_basket', { itemID: this._cardID });
        });
    }
}

export class CardBasket<ICard> extends CardView<ICard> {
    protected itemDelete: HTMLButtonElement;
    
    constructor(protected container: HTMLElement, events: IEvents) {
        super(container, events);
        this._itemIndex = this.container.querySelector('.basket__item-index');
        this.itemDelete = this.container.querySelector('.basket__item-delete');

        this.itemDelete.addEventListener('click', () =>
	        this.events.emit('CardBasket: delete_from_basket', { itemID: this._cardID })
	    );
    };
}

export class CardGallery<ICard> extends CardView<ICard> {
    constructor(protected container: HTMLElement, events: IEvents) {
        super(container, events);
        this._image = this.container.querySelector('.card__image');
        this._category = this.container.querySelector('.card__category');

        
        this.container.addEventListener('click', () =>
	        this.events.emit('CardGallery: show_preview', { itemID: this._cardID })
	    );
    };
}