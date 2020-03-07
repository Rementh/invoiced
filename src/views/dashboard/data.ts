import { Product, ProductUnit } from './models';
import { of, Observable } from 'rxjs';

export const fetchProducts = (): Observable<Product[]> =>
    of([
        {
            name: 'Monitoring antywłamaniowy',
            unit: ProductUnit.Piece,
            quantity: 1,
            netUnitPrice: 16.67,
            tax: 0.23,
        },
        {
            name: 'Internet światłowód',
            unit: ProductUnit.Piece,
            quantity: 1,
            netUnitPrice: 40,
            tax: 0.23,
        },
        {
            name: 'Gaz',
            unit: ProductUnit.Piece,
            quantity: 1,
            netUnitPrice: 179.61,
            tax: 0.23,
        },
        {
            name: 'Energia elektryczna wspólna',
            unit: ProductUnit.Piece,
            quantity: 1,
            netUnitPrice: 8.22,
            tax: 0.23,
        },
        {
            name: 'Energia elektryczna własna',
            unit: ProductUnit.Piece,
            quantity: 1,
            netUnitPrice: 179.3,
            tax: 0.23,
        },
        // {
        //     name: 'Usługa programistyczna',
        //     unit: ProductUnit.Hour,
        //     quantity: 160,
        //     netUnitPrice: 26,
        //     tax: 0.23,
        // },
        {
            name: 'Dostarczanie wody',
            unit: ProductUnit.Piece,
            quantity: 1,
            netUnitPrice: 63.36,
            tax: 0.08,
        },
        {
            name: 'Odprowadzanie ścieków',
            unit: ProductUnit.Piece,
            quantity: 1,
            netUnitPrice: 58.14,
            tax: 0.08,
        },
    ]);
