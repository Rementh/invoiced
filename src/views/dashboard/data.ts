import { Product } from './models';
import { of, Observable } from 'rxjs';

export const fetchProducts = (): Observable<Product[]> =>
    of([
        {
            name: 'Monitoring antywłamaniowy',
            unit: 'szt.',
            quantity: 1,
            unitNetValue: 16.67,
            taxRate: 0.23,
        },
        {
            name: 'Internet światłowód',
            unit: 'szt.',
            quantity: 1,
            unitNetValue: 40,
            taxRate: 0.23,
        },
        {
            name: 'Gaz',
            unit: 'szt.',
            quantity: 1,
            unitNetValue: 179.61,
            taxRate: 0.23,
        },
        {
            name: 'Energia elektryczna wspólna',
            unit: 'szt.',
            quantity: 1,
            unitNetValue: 8.22,
            taxRate: 0.23,
        },
        {
            name: 'Energia elektryczna własna',
            unit: 'szt.',
            quantity: 1,
            unitNetValue: 179.3,
            taxRate: 0.23,
        },
        // {
        //     name: 'Usługa programistyczna',
        //     unit: ProductUnit.Hour,
        //     quantity: 160,
        //     unitNetValue: 26,
        //     taxRate: 0.23,
        // },
        {
            name: 'Dostarczanie wody',
            unit: 'szt.',
            quantity: 1,
            unitNetValue: 63.36,
            taxRate: 0.08,
        },
        {
            name: 'Odprowadzanie ścieków',
            unit: 'szt.',
            quantity: 1,
            unitNetValue: 58.14,
            taxRate: 0.08,
        },
    ]);
