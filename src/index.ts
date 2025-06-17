import { EventEmitter } from './components/base/events';
import { BasketModel } from './components/Model/BasketModel';
import { CardsBlockModel } from './components/Model/CardsBlockModel';
import { OrderModel } from './components/Model/OrderModel';
import './scss/styles.scss';
import { IApi, ICard, IOrderData, PaymentType } from './types';
import { API_URL, settings } from './utils/constants';
import { Modal } from './components/Modal';
import { SuccessView } from './components/SuccessView';
import { IFormState } from './components/FormView';
import { FormOrderView } from './components/FormOrderView';
import { FormContactsView } from './components/FormContactsView';
import { CardBasket, CardModalView, CardGallery } from './components/CardView';
import { BasketView } from './components/BasketView';
import { PageView } from './components/PageView';
import { AppApi } from './components/AppApi';
import { Api } from './components/base/api';
import { cloneTemplate } from './utils/utils';

const events = new EventEmitter();

const cardsBlock = new CardsBlockModel(events);
const basket = new BasketModel(events);
const order = new OrderModel(events);


const baseApi: IApi = new Api(API_URL, settings);
const api = new AppApi(baseApi);

//events.onAll((event) => {
//    console.log('msg->', event.eventName, event.data)
//})

const modal = new Modal(document.querySelector('#modal-container'), events);
const page = new PageView(document.body, events);

const cardCatalogTemplate: HTMLTemplateElement = document.querySelector('#card-catalog');
const cardPreviewTemplate: HTMLTemplateElement = document.querySelector('#card-preview');
const cardBasketTemplate: HTMLTemplateElement = document.querySelector('#card-basket');

const formContactsTemplate: HTMLTemplateElement = document.querySelector('#contacts');
const formOrderTemplate: HTMLTemplateElement = document.querySelector('#order');

const basketContainerTemplate: HTMLTemplateElement = document.querySelector('#basket');
const successContainerTemplate: HTMLTemplateElement = document.querySelector('#success');


const basketView = new BasketView( cloneTemplate(basketContainerTemplate), events);
const orderFormView = new FormOrderView( cloneTemplate(formOrderTemplate), events)
const contactsFormView = new FormContactsView( cloneTemplate(formContactsTemplate), events)
const successView = new SuccessView(cloneTemplate(successContainerTemplate), events);


//--------------------------------------------------------------------------------------------

api.getCards()
	.then((items) => {
		cardsBlock.cards = items;
		const cardsArray = cardsBlock.cards.map((item)=> {
		const cardView = new CardGallery( cloneTemplate(cardCatalogTemplate), events);
		return cardView.render(item);
		});

		page.render({ basketCount: basket.getCount(), galleryCards : cardsArray });

	})
	.catch((err) => {
		console.error('Ошибка при получении товаров:', err);
});



//------------------------------------------------------------------------------------------
function showBasket() {
	const items = basket.cards.map((item, index) => {
		const card = new CardBasket( cloneTemplate(cardBasketTemplate), events);
		return card.render({
			...item,
			itemIndex: index + 1
		});
	});

	modal.content = basketView.render({
			items: items,
			total: basket.getTotal()
		});
}

//--------------------------------------------------------------------------------------------


// кликнули по карточке товара на главной странице
events.on('CardGallery: show_preview', ({ itemID }: { itemID: string }) => {
	const card = cardsBlock.getCard(itemID);
	card.inBasket = basket.alreadyInBasket(card.id);
	card.canBuy = card.price;
	modal.content = new CardModalView(
		cloneTemplate(cardPreviewTemplate), 
		events
	).render(card);
	modal.open();
});

// кликнули по кнопке "В корзину" в окне просмотра карточки
events.on('CardModalView: move_item_to_basket', ({ itemID }: { itemID: string }) => {
	const card = cardsBlock.getCard(itemID);
	basket.addCard(card);
	page.basketCount = basket.getCount();
	modal.close();
});

// в корзинной карточке нажали кнопку удаления
events.on('CardBasket: delete_from_basket', ({ itemID }: { itemID: string }) => {
	basket.removeCard(itemID);
	showBasket();
	page.basketCount = basket.getCount();
});

// кликнули по кнопке "Оформить" в корзине
events.on('basketView: showOrderForm', () => {
	modal.content = orderFormView.render();
	order.validateOrderForm('Способ оплаты, адрес');
	//	modal.open();
});

// клик по изображению корзины на главной странице
events.on('page: openBasket', () => {
	showBasket();
	modal.open();
});


// изменен адрес или способ оплаты в FormOrder
events.on('formView: orderForm.change', (data: { field: keyof IOrderData; value: string }) => {
	order.setFieldData(data.field, data.value);
	order.validateOrderForm( '***')
});

// изменен телефон или email в FormContacts
events.on('formView: contactsForm.change', (data: { field: keyof IOrderData; value: string }) => {
	order.setFieldData(data.field, data.value);
	order.validateContactForm( '+++')
});


// новые данные для orderForm из orderModel
events.on('orderModel: orderForm NewData', (data: Partial<IOrderData> & IFormState) => {
	orderFormView.render( data);
});


// новые данные для contactsForm из orderModel
events.on('orderModel: contactsForm NewData', (data: Partial<IOrderData> & IFormState) => {
	contactsFormView.render( data);
});

// нажата кнопка Далее в orderForm
events.on('formView: orderForm.submit', () => {
	modal.content = contactsFormView.render();	
	order.validateContactForm('SSS')
});

// нажата кнопка Оплатить в contactsForm
events.on('formView: contactsForm.submit', () => {
	successView.total = 0;
	api.postOrder(order.getOrderData(), basket.cards, basket.getTotal())
		.then((data) => {
			basket.clear();
			successView.total = data.total;
			modal.content = successView.render();
			modal.open();
		})
		.catch((err) => {
			console.error('Ошибка при отправке заказа:', err);
		});	

});

// нажали кнопку **За новыми покупками** в successView
events.on('successView: submit', () => {
	basket.clear();
	order.clear();// Добавил очистку полей форм
	modal.close();
	page.basketCount = basket.getCount();
});


// блокировка/разблокировка прокрутки при открытии/закрытии модалки
events.on('modal: page.scrollLocked', ({ lock }: { lock: boolean }) => {
	page.scrollLocked = lock;
});






























//api.getShowcase()
//    .then((items) => {
//        console.log(items)
//    })

//api.getItemById('6a834fb8-350a-440c-ab55-d0e9b959b6e3')
//    .then((item) => {
//        console.log(item)
//    })
