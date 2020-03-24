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

export interface ExchangeRate {
    no: string;
    effectiveDate: string;
    mid: number;
    currency: string;
}

export interface EntryInvoiceData {
    placeOfIssue: string;
    dateOfIssue: Date;
    seller: LegalEntity;
    buyer: LegalEntity;
    invoiceNumber: number;
    products: {
        name: string;
        unit: string;
        quantity: number;
        unitNetValue: number;
        taxRate: number;
    }[];
    currency: string;
    paymentMethod: string;
    paymentDeadlineInDays: number;
    accountNumber: string;
    exchangeRate?: ExchangeRate;
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
    total: {
        netValue: number;
        taxValue: number;
        grossValue: number;
        grossText: string;
    };
    currency: string;
    paymentMethod: string;
    paymentDeadline: Date;
    accountNumber: string;
    exchangeRate?: ExchangeRate;
    totalExchanged?: {
        netValue: number;
        taxValue: number;
        grossValue: number;
    };
}
