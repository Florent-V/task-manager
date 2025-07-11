<template>
  <div class="loader"></div>
</template>

<style scoped>
.loader {
  width: 10px;
  aspect-ratio: 1;
  border-radius: 50%;
  animation: l5 1s infinite linear alternate;
}

@keyframes l5 {
  0% {
    box-shadow: 20px 0 #3498db, -20px 0 #3498db20;
    background: #3498db;
  }
  33% {
    box-shadow: 20px 0 #3498db, -20px 0 #3498db20;
    background: #3498db20;
  }
  66% {
    box-shadow: 20px 0 #3498db20, -20px 0 #3498db;
    background: #3498db20;
  }
  100% {
    box-shadow: 20px 0 #3498db20, -20px 0 #3498db;
    background: #3498db;
  }
}
</style>
