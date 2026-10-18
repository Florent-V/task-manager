import SignInView from "@/views/Auth/SignInView.vue";

export default [
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
        // L'inscription se fait sur le serveur OAuth2 (lien « Créer un compte » de sa page de connexion)
        path: '/signup',
        name: 'signup',
        redirect: { name: 'signin' }
    }
]
