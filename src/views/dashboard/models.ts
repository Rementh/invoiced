export interface Product {
    name: string;
    unit: string;
    quantity: number;
    unitNetValue: number;
    taxRate: number;
}

interface LegalEntity {
    name: string;
    taxIdNumber: string;
    address: {
        street: string;
        city: string;
        postCode: string;
    };
}

export interface Invoice {
    placeOfIssue: string;
    dateOfIssue: Date;
    seller: LegalEntity;
    buyer: LegalEntity;
    invoiceNumber: string;
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
    totalGrossText: string;
    currency: string;
    paymentMethod: string;
    paymentDate: Date;
    accountNumber: string;
}
