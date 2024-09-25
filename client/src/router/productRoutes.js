import ProductFormView from "@/views/Product/ProductFormView.vue";
import ProductView from "@/views/Product/ProductView.vue";
import ProductDetailView from "@/views/Product/ProductDetailView.vue";
import ProductBisView from "@/views/Product/ProductBisView.vue";

export default [
    {
        path: '/product/new',
        name: 'productNew',
        meta: {
            title: 'Product',
            description: 'This is the product page'
        },
        component: ProductFormView
    },
    {
        path: '/product',
        name: 'product',
        meta: {
            title: 'ProductListView',
            description: 'This is the product page'
        },
        component: ProductView
    },
    {
        path: '/productbis',
        name: 'productbis',
        meta: {
            title: 'ProductListView',
            description: 'This is the product page'
        },
        component: ProductBisView
    },
    {
        path: '/product/:id',
        name: 'productDetail',
        meta: {
            title: 'ProductDetailView',
            description: 'This is the product page'
        },
        component: ProductDetailView
    },
    {
        path: '/product/:id/edit',
        name: 'productEdit',
        meta: {
            title: 'ProductDetailView',
            description: 'This is the product page'
        },
        component: ProductFormView
    }
]