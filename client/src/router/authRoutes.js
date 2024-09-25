import RefreshTestView from "@/views/RefreshTestView.vue";
import SignInView from "@/views/Auth/SignInView.vue";
import SignUpView from "@/views/Auth/SignUpView.vue";

export default [
    {
        path: '/refresh',
        name: 'refresh',
        meta: {
            title: 'Refresh',
            description: 'Refresh Test Page'
        },
        component: RefreshTestView
    },
    {
        path: '/signin',
        name: 'signin',
        meta: {
            title: 'Sign In',
            description: 'Page to sign in'
        },
        component: SignInView
    },
    {
        path: '/signup',
        name: 'signup',
        meta: {
            title: 'Sign Up',
            description: 'Page to sign up'
        },
        component: SignUpView
    }
]