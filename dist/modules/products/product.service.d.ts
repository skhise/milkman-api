declare class ProductService {
    private mapProductRow;
    private mapExtraProductRow;
    create(sellerId: string, payload: unknown): Promise<{
        id: any;
        sellerId: any;
        name: any;
        pricePerUnit: number;
        unit: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    list(sellerId: string): Promise<{
        id: any;
        sellerId: any;
        name: any;
        pricePerUnit: number;
        unit: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    update(productId: string, payload: unknown): Promise<{
        id: any;
        sellerId: any;
        name: any;
        pricePerUnit: number;
        unit: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    addExtraProduct(sellerId: string, payload: unknown): Promise<{
        id: any;
        sellerId: any;
        customerId: any;
        productName: any;
        price: number;
        quantity: number;
        unit: any;
        saleDate: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }>;
    listExtraProducts(sellerId: string, customerId?: string, dateFrom?: string, dateTo?: string): Promise<{
        id: any;
        sellerId: any;
        customerId: any;
        productName: any;
        price: number;
        quantity: number;
        unit: any;
        saleDate: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
}
export declare const productService: ProductService;
export {};
//# sourceMappingURL=product.service.d.ts.map