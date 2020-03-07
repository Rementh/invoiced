export interface Product {
    name: string;
    unit: string;
    quantity: number;
    unitNetValue: number;
    taxRate: number;
}

export interface Invoice {
    products: {
        no: number;
        name: string;
        unit: string;
        quantity: number;
        unitNetValue: number;
        totalNetValue: number;
        taxRate: number;
        totalGrossValue: number;
    }[];
    taxRatesSummary: {
        taxRate: number;
        netValue: number;
        taxValue: number;
        grossValue: number;
    }[];
    totalNetValue: number;
    totalTaxValue: number;
    totalGrossValue: number;
}
