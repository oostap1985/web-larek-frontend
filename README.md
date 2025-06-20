# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении


Тип данных товара

```
interface ICard {
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
```
Интерфейс для модели данных товара

```
interface ICardsBlock {
    cards: ICard[];
    getCard(id: string): ICard;
    //preview: string | null;
}
```

Тип выбора оплаты

```
type IPaymentType = 'card' | 'cash' | null;
```
Тип данных, которые заполняет пользователь

```
interface IOrderData {
    address: string;
    email: string;
    payment: IPaymentType;
    phone: string;
}

export interface IOrder extends IOrderData {
    clear(): void;
    getOrderData(): IOrderData;
}
```

Категории товаров

```
export type CardCategory = 'софт-скил' | 'хард-скил' | 'другое' | 'кнопка' | 'дополнительное';

export const categoryType: Record<CardCategory, string> = {
    'софт-скил': 'soft',
    'хард-скил': 'hard',
    'другое': 'other',
    'кнопка': 'button',
    'дополнительное': 'additional',
}
```

Корзина

```
export interface IBasket {
    cards: ICard[];
    addCard(card: ICard): void;
    alreadyInBasket(cardId: string) : boolean;
    clear(): void;
    getTotal(): number;
    getCount(): number;
    removeCard(cardId: string): void;
}
```

Для API

```
export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    baseUrl: string;
    get<T>(uri: string): Promise<T>;
    post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}
```

Ответ сервера на отправленный заказ

```
export interface IOrderResponse {
  id?: string;
  total?: number;
  error?: string;
  code?: number;
}
```



## Архитектура приложения

Согласно парадигме MVP, код разделен на слои:
- слой данных, отвечает за хранение и работу с данными.
- слой представления, отвечает за отображение данных на странице(экране).
- эти два слоя связывает брокер(EventEmitter), устанавливая слушатели событий и обрабатывая их.
- API - отправляет запрос на сервер и принимает результат.

## Базовый код

#### Класс API

Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов. Методы:

- get - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- post - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется POST запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter

Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.
Основные методы, реализуемые классом описаны интерфейсом IEvents:

- on - подписка на событие
- emit - инициализация события

#### Класс Component

Класс является дженериком и родителем всех компонентов слоя представления.(*Комментарий для ревьюера Ирины: Извините, изначально думал, что классы (которые отвечают за отображение карточек товаров) будут иметь метод "render"(каждый), поэтому и написал(кроме карточек), потом переделывал и не исправил.*) В дженерик принимает тип объекта, в котором данные будут передаваться в метод render для отображения данных в компоненте. В конструктор принимает элемент разметки, являющийся основным родительским контейнером компонента. Содержит метод render, отвечающий за сохранение полученных в параметре данных в полях компонентов через их сеттеры, возвращает обновленный контейнер компонента.

abstract class Component:

- constructor(protected readonly container: HTMLElement)

- changeClassState( element: HTMLElement,  className: string,  state?: boolean ): void - Изменяет состояние CSS класса элемента

- changeDisabledState(element: HTMLElement, isDisabled: boolean): void - Управляет состоянием disabled атрибута

- render(data?: Partial<T>): HTMLElement - получение данных и отрисовка содержимого

## Слой работы с данными (Model)

### Класс CardsBlockModel

Класс отвечает за хранение карточек товаров и работу с ними.

 - constructor(events: IEvents) - конструктор принимает экземпляр класса EventEmitter, чтобы устанавливать события там, где посчитаем нужным, и потом подписываться на них(слушать).

Класс имеет два защищенных поля, геттер, сеттер и метод:

 - protected _cards: ICard[ ] - хранение массива катрочек товаров
 - protected events: IEvents - экземпляр класса EventEmitter 

 - set cards(cards:ICard[ ]) - сохраняем массив карточек в поле _cards. Будем вызывать событие изменения массива.
 - get cards () - получаем массив карточек
 - getCard(cardId:string) - получаем одну карточку товара по её id

### Класс BasketModel

Класс отвечает за хранение и работу с карточками товаров, попавших в корзину.

 - protected _cards: ICard[ ] - поле, в котором хранятся товары в корзине
 - constructor(events: IEvents) - конструктор
 - get cards() - возврвщает список товаров в корзине
 - addCard(card: ICard) - добавляет товар в корзину
 - removeCard(cardId: string) - удаляет товар из корзины
 - alreadyInBasket(cardId: string) - проверяет, есть ли товар в корзине
 - clear() - очищает корзину от товаров
 - getTotal() - сумма товаров в корзине
 - getCount() - количество товаров в корзине

### Класс OrderModel

Класс отвечает за хранение информации, необходимой для оформления заказов.

 - constructor(events: IEvents) - конструктор
 - validateOrderForm( ) - функция валидации формы с адресом и выбором оплаты
 - validateContactForm( ) - функция валидации формы с почтой и телефоном
 - setFieldData<T extends keyof IOrderData>(field: T, value: IOrderData[T]) - принимает и сохраняет данные, заполненные пользователем
 - getOrderData( ) - возвращает объект с данными от пользователя

 ## Слой представления (View)

Классы представления будут расширять базовый класс component, в котором есть чудесный метод render( ).\
Все классы отвечают за отображение(представление) передаваемых в них данных.

 ### class Modal

 Этот класс реализует модальное окно, в котором другие классы представления будут отрисовывать свою разметку(формы)

 - constructor(container: HTMLElement, events: IEvents) - конструктор. Экземпляр EventEmitter для инициализации событий.
 - open() - открывает модальное окно
 - close() - закрывает модальное окно

Так же в этом классе реализовано закрытие модального окна по нажатию кнопки "ESC", клику по "крестику" и по клику в оверлей.

### class FormView

Обобщённый класс формы. Отрисовывается внутри класса Modal. Содержит кнопку Submit и элементы ввода Input. Генерирует сообщения при вводе информации пользователем.

Содержит сеттеры valid( блокирует кнопку, если форма не валидна) и errors (выводит сообщения, если форма не валидна)

### class FormOrderView

Расширяет класс FormView.
 - constructor(container: HTMLFormElement, events: IEvents) - конструктор
 - set address - сеттер адреса
 - set payment - сеттер способа оплаты
 - clear( ) - очищает кнопки выбора оплаты(снимает класс 'button_alt-active' с обеих кнопок)

 ### class FormContactsView

Расширяет класс FormView.
 - constructor(container: HTMLFormElement, events: IEvents) - конструктор
 - set email - сеттер почты
 - set phone - сеттер телефона

 ### class SuccessView

Реализует содержимое окошка с результатом оформления заказа.
 - constructor(container: HTMLElement, protected events: IEvents) - конструктор
 - set total - выводит колличество списаных "синапсов"


### class BasketView

Класс отвечает за отображение корзины

 - constructor(container: HTMLElement, protected events: IEvents) - конструктор
 - set items - принимает карточки товаров и выводит в HTML-элемент корзины.
 - set total - отвечает за вывод суммы товаров и блокирует кнопку, если корзина пуста.

 ### class CardView

 От этого класса будут наследоваться другие классы представления карточек товаров

 - constructor(protected container: HTMLElement, events: IEvents) - конструктор
 - set category - изменияет цвет категории путем добавления класса.
 - set image - устанавливает картинку товара
 - set price - устанавливает цену товара
 - set description - описание товара
 - set id - id товара
 - set title - название товара
 - set itemIndex - номер товара в корзине
 - set inBasket - находится ли товар в корзине
 - set canBuy - можно ли купить товар(блокирует кнопку добавления в корзину)

 ### class CardModalView

Расширяет класс CardView
Класс отвечает за отображение товара в окне просмотра

 ### class CardBasket

Расширяет класс CardView
Класс отвечает за отображение товара в корзине

 ### class CardGallery

Расширяет класс CardView
Класс отвечает за отображение товара на главной странице

### class PageView

Класс отвечает за отобразение данных на главной странице

 - constructor(container: HTMLElement, events: IEvents) - конструктор
 - set galleryCards - выводит масив карточек на главную страницу
 - set postOrder - количество товаров в корзине

### class AppApi

Принимает в конструктор экземпляр класса Api и предоставляет методы реализующие взаимодействие с сервером
 - constructor(baseApi: IApi) - конструктор
 - getCards() - возращает все доступные карточки
 - getCardById()- возвращает одну карточку её id
 - postOrder() - отправляет на сервер данные заказа и получает потдверждение этого заказа.

 ## Взаимодействие компонентов

Код, описывающий взаимодействие представления и данных между собой находится в файле index.ts, выполняющем роль презентера.
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в index.ts
В index.ts сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

## События изменения данных (генерируются классами моделей данных)

 - order: FormContacts NewData - новые данные для contactsForm из orderModel
 - order: FormOrder NewData - новые данные для orderForm из orderModel.

## События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)
 - formView: contactsForm.submit - нажата кнопка Оплатить в contactsForm

 - formView: orderForm.submit - нажата кнопка Далее в orderForm

 - basketView: showOrderForm - нажата кнопка Оформить в корзине

 - formView: orderForm.change - изменен адрес (formView) или способ оплаты (orderFormView) в orderForm

 - formView: contactsForm.change - изменен телефон или email в contactsForm

 - CardModalView: move_item_to_basket - нажата кнопка В корзину в предпросмотре карточки

 - CardGallery: show_preview - кликнули по карточке на витрине

 - CardBasket: delete_from_basket - в корзинной карточке нажали кнопку удаления

 - modal: page.scrollLocked - блокировка/разблокировка прокрутки при открытии/закрытии модалки

 - page: openBasket - нажали изображение корзины на главной странице

 - successView: submit - нажали кнопку За новыми покупками в successView.
