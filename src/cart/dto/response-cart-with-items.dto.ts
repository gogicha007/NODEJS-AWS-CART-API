import { CartStatus } from "../entities/cart-status.enum";
export type CartItem = {
    productId: string
    count: number
}

export class CartWithItemsResponseDto {
    id!: string;
    userId!: string;
    createdAt?: Date;
    updatedAt?: Date;
    status!: CartStatus
    items!: CartItem[]
}