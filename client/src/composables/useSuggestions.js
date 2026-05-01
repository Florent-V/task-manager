import { ref, watch } from 'vue';

export function useSuggestions(toDoItemsRef, titleRef) {
  const suggestions = ref([]);

  watch([() => toDoItemsRef.value || [], titleRef], ([toDoItems, newTitle]) => {
    if (newTitle && newTitle.trim()) {
      suggestions.value = toDoItems.filter(item =>
        item.title.toLowerCase().includes(newTitle.toLowerCase())
      );
    } else {
      suggestions.value = [];
    }
  });

  const selectSuggestion = (suggestion, callback) => {
    suggestions.value = [];
    if (callback) callback(suggestion.title);
  };

  return { suggestions, selectSuggestion };
}
