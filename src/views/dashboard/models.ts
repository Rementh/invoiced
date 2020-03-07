export enum ProductUnit {
    Piece = 'szt.',
    Hour = 'godz.',
}

export interface Product {
    name: string;
    unit: ProductUnit;
    quantity: number;
    netUnitPrice: number;
    tax: number;
}
