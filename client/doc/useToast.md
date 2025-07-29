# Documentation: Utilisation des Toasts

Ce document explique comment utiliser le système de notifications (toasts) dans l'application.

## 1. Introduction

Le système de toasts est basé sur `vue3-toastify` et est encapsulé dans un composable `useToast` pour une utilisation simplifiée. Il permet d'afficher des messages de succès, d'erreur, d'information ou de chargement.

De plus, un `ToastManager` est intégré avec le hook `useApi` pour afficher automatiquement des toasts lors des appels API.

## 2. Utilisation de base avec `useToast`

Pour afficher un toast manuellement dans un composant, vous pouvez utiliser le composable `useToast`.

### Exemple dans un composant Vue

```vue
<script setup>
import { useToast } from '@/composables/useToast'

const { showSuccess, showError, showLoading, updateToast } = useToast()

const handleSuccess = () => {
  showSuccess('Opération réussie !')
}

const handleError = () => {
  showError('Une erreur est survenue.')
}

const handleLoading = async () => {
  const loadingToastId = showLoading('Sauvegarde en cours...')

  try {
    // Simuler une requête API
    await new Promise(resolve => setTimeout(resolve, 2000))
    updateToast(loadingToastId, 'Sauvegarde réussie !', 'success')
  } catch (error) {
    updateToast(loadingToastId, 'Erreur lors de la sauvegarde', 'error')
  }
}
</script>

<template>
  <button @click="handleSuccess">Toast Succès</button>
  <button @click="handleError">Toast Erreur</button>
  <button @click="handleLoading">Toast Chargement</button>
</template>
```

### Fonctions disponibles

-   `showSuccess(message, options)`: Affiche un toast de succès.
-   `showError(message, options)`: Affiche un toast d'erreur.
-   `showWarning(message, options)`: Affiche un toast d'avertissement.
-   `showInfo(message, options)`: Affiche un toast d'information.
-   `showLoading(message)`: Affiche un toast de chargement qui doit être mis à jour manuellement.
-   `updateToast(toastId, message, type)`: Met à jour un toast existant (utile pour les chargements). `type` peut être 'success', 'error', 'warning', 'info'.
-   `dismiss(toastId)`: Ferme un toast spécifique.
-   `dismissAll()`: Ferme tous les toasts.

## 3. Toasts automatiques pour les appels API

Le hook `useApi` (`@/services/requestHook.js`) intègre un `ToastManager` pour gérer automatiquement les notifications lors des appels réseau.

### Utilisation standard

Lorsque vous utilisez `executeRequest` du hook `useApi`, les toasts ne sont pas affichés par défaut. Pour les activer, vous devez passer des options.

```javascript
// Dans un composant ou un service
import { hookApi } from "@/services/requestHook.js";
import { client } from '@/services/requestMaker.js';

const { executeRequest, isLoading, error } = hookApi();

async function fetchData() {
  try {
    const data = await executeRequest(
      () => client.get('/api/data'),
      {
        showToasts: true,
        loadingMessage: 'Chargement des données...',
        successMessage: 'Données chargées avec succès !',
        errorMessage: 'Erreur lors du chargement des données.'
      }
    );
    // ...
  } catch (err) {
    // L'erreur est déjà gérée et affichée par le hook
  }
}
```

### Options de `executeRequest`

-   `showToasts` (boolean): Mettre à `true` pour activer les toasts pour cette requête.
-   `loadingMessage` (string): Message à afficher pendant le chargement.
-   `successMessage` (string): Message à afficher en cas de succès.
-   `errorMessage` (string): Message à afficher en cas d'erreur.

## 4. Le `ToastManager`

La classe `ToastManager` (`@/services/toastManager.js`) est une surcouche du `useToast` utilisée par `requestHook`.
Elle gère le cycle de vie d'un toast de chargement qui se transforme en succès ou en erreur. Vous n'aurez généralement pas besoin de l'utiliser directement, sauf si vous implémentez une logique d'appel API personnalisée.
