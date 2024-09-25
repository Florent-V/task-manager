import DemoProductView from "@/views/Demo/DemoProductView.vue";
import FeaturedCardsView from "@/views/Demo/DemoFeaturedCardsView.vue";
import ProductCrudView_1 from "@/views/Demo/ProductCrudView_1.vue";
import ProductCrudView_2 from "@/views/Demo/ProductCrudView_2.vue";
export default [
    {
        path: '/demo-product',
        name: 'demo-product',
        meta: {
            title: 'Demo Product',
            description: 'This is the demo product page'
        },
        component: DemoProductView
    },
    {
        path: '/demo-features',
        name: 'demo-features',
        meta: {
            title: 'Demo Features',
            description: 'This is the Demo Features page'
        },
        component: FeaturedCardsView
    },
    {
        path: '/demo-product-crud-1',
        name: 'product1',
        meta: {
            title: 'ProductCrudView_1',
            description: 'This is the ProductCrudView_1 page'
        },
        component: ProductCrudView_1
    },
    {
        path: '/demo-product-crud-2',
        name: 'product2',
        meta: {
            title: 'ProductCrudView_2',
            description: 'This is the ProductCrudView_2 page'
        },
        component: ProductCrudView_2
    },
]