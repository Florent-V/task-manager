import UserDetailView from "@/views/User/UserDetailView.vue";
export default [
    {
        path: '/profile',
        name: 'userProfile',
        meta: {
            title: 'User Profile',
            description: 'This is the user profile page',
        },
        component: UserDetailView
    },
]