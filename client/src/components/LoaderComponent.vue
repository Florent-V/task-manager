<template>
  <div class="loader-wrapper">
    <div class="dot-loader">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</template>

<style scoped>
.loader-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5rem;
}

.dot-loader {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 13px;
}

.dot-loader div {
  position: absolute;
  top: 0;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #3498db;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}

.dot-loader div:nth-child(1) {
  left: 8px;
  animation: dot1 0.6s infinite;
}

.dot-loader div:nth-child(2) {
  left: 8px;
  animation: dot2 0.6s infinite;
}

.dot-loader div:nth-child(3) {
  left: 32px;
  animation: dot2 0.6s infinite;
}

.dot-loader div:nth-child(4) {
  left: 56px;
  animation: dot3 0.6s infinite;
}

@keyframes dot1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes dot2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}

@keyframes dot3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
</style>
