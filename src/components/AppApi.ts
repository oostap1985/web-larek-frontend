import { IApi, ICard, IOrderData, IOrderResponse } from "../types";

export class AppApi {
	private _baseApi: IApi;

	constructor(baseApi: IApi) {
		this._baseApi = baseApi;
	}

    getCards(): Promise<ICard[]> {
		return this._baseApi.get<{ total: number; items: ICard[] }>(`/product`)
			.then((response) => response.items);
	}

	getCardById(id: string): Promise<ICard> {
    	return this._baseApi.get<ICard>(`/product/${id}`).then((item: ICard) => item);
	}

	postOrder(order: IOrderData, items: ICard[], cost: number): Promise<IOrderResponse> {
		const payload = {
    		...order,
			total: cost,
			items: items.map(item => item.id),
		};
  		return this._baseApi.post<IOrderResponse>('/order', payload);
	}
}