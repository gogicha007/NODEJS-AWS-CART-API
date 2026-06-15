import { CartStatus } from "../entities/cart-status.enum";
import { CartItem } from "../models";

export class CartWithItemsResponseDto {
    id!: string;
    userId!: string;
    createdAt?: Date;
    updatedAt?: Date;
    status!: CartStatus
    items!: CartItem[]
}