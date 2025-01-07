# src/components/SeatMapDebug.vue
<template>
  <div class="debug-container">
    <div class="seat-map" ref="mapRef">
      <img :src="seatMapImage" @load="onImageLoad" ref="imageRef" />
      <div
        v-for="area in areas"
        :key="area.id"
        class="debug-area"
        :style="area.style"
        @mousedown="startDrag($event, area)"
        @mousemove="onDrag($event)"
        @mouseup="stopDrag"
      >
        {{ area.name }}
        <div class="resize-handle" @mousedown.stop="startResize($event, area)"></div>
      </div>
    </div>

    <!-- 調試面板 -->
    <div class="debug-panel">
      <div v-if="selectedArea">
        <h3>{{ selectedArea.name }}</h3>
        <div class="control-group">
          <label>Left: <input type="number" v-model.number="selectedArea.style.left" @input="updateStyle" />%</label>
          <label>Top: <input type="number" v-model.number="selectedArea.style.top" @input="updateStyle" />%</label>
          <label>Width: <input type="number" v-model.number="selectedArea.style.width" @input="updateStyle" />%</label>
          <label>Height: <input type="number" v-model.number="selectedArea.style.height" @input="updateStyle" />%</label>
        </div>
        <button @click="copyStyles">Copy Styles</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import areas from 'app/public/data/area.js'  // 導入區域數據

const mapRef = ref(null)
const imageRef = ref(null)
const selectedArea = ref(null)
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// 圖片載入後調整容器大小
const onImageLoad = () => {
  const img = imageRef.value
  const container = mapRef.value
  container.style.width = img.width + 'px'
  container.style.height = img.height + 'px'
}

// 開始拖動
const startDrag = (event, area) => {
  isDragging.value = true
  selectedArea.value = area
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    left: parseFloat(area.style.left) || 0,
    top: parseFloat(area.style.top) || 0
  }
}

// 拖動中
const onDrag = (event) => {
  if (!isDragging.value || !selectedArea.value) return

  const dx = event.clientX - dragStart.value.x
  const dy = event.clientY - dragStart.value.y
  const container = mapRef.value
  const percentX = (dx / container.offsetWidth) * 100
  const percentY = (dy / container.offsetHeight) * 100

  selectedArea.value.style.left = dragStart.value.left + percentX + '%'
  selectedArea.value.style.top = dragStart.value.top + percentY + '%'
}

// 停止拖動
const stopDrag = () => {
  isDragging.value = false
  isResizing.value = false
}

// 開始調整大小
const startResize = (event, area) => {
  isResizing.value = true
  selectedArea.value = area
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    width: parseFloat(area.style.width) || 0,
    height: parseFloat(area.style.height) || 0
  }
}

// 複製樣式到剪貼板
const copyStyles = () => {
  const styles = {
    top: selectedArea.value.style.top,
    left: selectedArea.value.style.left,
    width: selectedArea.value.style.width,
    height: selectedArea.value.style.height
  }
  navigator.clipboard.writeText(JSON.stringify(styles, null, 2))
}
</script>

<style scoped>
.debug-container {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.seat-map {
  position: relative;
  margin: auto;
}

.seat-map img {
  max-width: 100%;
  height: auto;
}

.debug-area {
  position: absolute;
  border: 2px solid rgba(255, 0, 0, 0.5);
  background: rgba(255, 255, 255, 0.2);
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: red;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  background: red;
  cursor: se-resize;
}

.debug-panel {
  min-width: 300px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 10px 0;
}

input {
  width: 60px;
  margin-left: 8px;
}
</style>
