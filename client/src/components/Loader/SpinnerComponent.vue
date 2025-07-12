<template>
  <div class="lds-dual-ring"></div>
</template>

<style scoped>
.lds-dual-ring,
.lds-dual-ring:after {
  box-sizing: border-box;
}
.lds-dual-ring {
  display: inline-block;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 3px solid currentColor;
  border-color: currentColor transparent currentColor transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>