import { ref } from 'vue';

export default function useFormErrors(fields) {
  // Initialise les erreurs pour chaque champ et une erreur générale
  const errors = ref({});
  const defaultError = ref('');

  const setErrors = (error) => {
    // Réinitialise les erreurs spécifiques et le message d'erreur général
    clearErrors();
    console.log('fields', fields);

    if (error.response) {
      // Si l'erreur contient des erreurs de validation
      if (error.response.data.errors.length) {
        const errorDetails = error.response.data.errors;
        console.log('errorDetails', errorDetails);
        // Remplit les erreurs pour chaque champ ou le message général
        errorDetails.forEach((err) => {
          if (fields.hasOwnProperty(err.field)) {
            errors.value[err.field] = (errors.value[err.field] || '') + ` ${err.message}`;
          } else {
            defaultError.value += `${err.field} - ${err.message} `;
          }
        });
      }
      // Si l'objet errors est vide, on ajoute le message d'erreur par défaut
      if (Object.keys(errors.value).length === 0) {
        setDefaultError(`Une erreur s'est produite lors de la soumission du formulaire : ${error.response.data.message}`);
      }
      return;
    }
    setDefaultError(`Une erreur s'est produite lors de la soumission du formulaire : ${error.message}`);
  };

  // Fonction pour réinitialiser toutes les erreurs
  const clearErrors = () => {
    errors.value = {};
    defaultError.value = '';
  };

  // Fonction pour ajouter un message d'erreur par défaut
  const setDefaultError = (errorMessage) => {
    defaultError.value += errorMessage;
  };

  return {
    errors,
    defaultError,
    setDefaultError,
    setErrors,
    clearErrors,
  };
}
