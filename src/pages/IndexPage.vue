# src/pages/IndexPage.vue
<template>
  <q-page class="flex flex-center">
    <div class="seat-map-container">
      <!-- 座位圖容器 -->
      <q-card class="seat-map" flat bordered>
        <q-card-section>
          <div class="seat-area" :style="{ backgroundImage: `url(${seatMapImage})` }">
            <!-- 動態生成區域按鈕 -->
            <template v-for="area in areas" :key="area.id">
              <q-btn
                :class="['area-btn', area.type]"
                :style="area.style"
                flat
                @click="selectArea(area)"
                @mouseover="showTooltip(area)"
                @mouseleave="hideTooltip"
              >
                <div class="area-content">
                  <div class="area-name">{{ area.name }}</div>
                  <div class="area-price">NT$ {{ area.price }}</div>
                </div>
              </q-btn>
            </template>
          </div>
        </q-card-section>
      </q-card>

      <!-- 選中區域的詳細信息 -->
      <q-dialog v-model="showDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <div class="text-h6">{{ selectedArea?.name }} 區</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <div class="text-h5 q-mb-md">NT$ {{ selectedArea?.price }}</div>
            <q-btn
              color="primary"
              label="查看座位"
              @click="viewSeats"
              class="full-width"
            />
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- 懸浮提示 -->
      <q-tooltip
        v-model="showTooltip"
        :offset="[10, 10]"
        anchor="top middle"
        self="bottom middle"
      >
        {{ tooltipContent }}
      </q-tooltip>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
// import { useQuasar } from 'quasar'

// const $q = useQuasar()

// 座位圖背景
const seatMapImage = '/images/seat-map.jpg'

// 區域數據
const areas = [
  // 橙色區域
  {
    id: 'orange-207',
    name: '橙207區',
    type: 'orange',
    price: 6280,
    style: {
      top: '33%',
      left: '33%',
      width: '12%',
      height: '12%'
    }
  },
  {
    id: 'orange-208-high',
    name: '橙208區',
    type: 'orange',
    price: 6280,
    style: {
      top: '45%',
      left: '33%',
      width: '12%',
      height: '12%'
    }
  },
  {
    id: 'orange-208-low',
    name: '橙208區',
    type: 'orange',
    price: 4200,
    style: {
      top: '45%',
      left: '20%',
      width: '12%',
      height: '12%'
    }
  },
  {
    id: 'orange-209-high',
    name: '橙209區',
    type: 'orange',
    price: 6280,
    style: {
      top: '58%',
      left: '33%',
      width: '12%',
      height: '12%'
    }
  },
  {
    id: 'orange-209-low',
    name: '橙209區',
    type: 'orange',
    price: 4200,
    style: {
      top: '58%',
      left: '20%',
      width: '12%',
      height: '12%'
    }
  },

  // VIP區域
  {
    id: 'vip-a',
    name: 'VIP A區',
    type: 'vip',
    price: 6280,
    style: {
      top: '36%',
      left: '45%',
      width: '5%',
      height: '18%'
    }
  },
  {
    id: 'vip-b',
    name: 'VIP B區',
    type: 'vip',
    price: 6280,
    style: {
      top: '36%',
      right: '38%',
      width: '5%',
      height: '18%'
    }
  },
  {
    id: 'vip-c',
    name: 'VIP C區',
    type: 'vip',
    price: 6280,
    style: {
      top: '56%',
      left: '45%',
      width: '8%',
      height: '13%'
    }
  },
  {
    id: 'vip-d',
    name: 'VIP D區',
    type: 'vip',
    price: 6280,
    style: {
      top: '56%',
      right: '38%',
      width: '8%',
      height: '13%'
    }
  },

  // 紅色區域
  {
    id: 'red-220',
    name: '紅220區',
    type: 'red',
    price: 6280,
    style: {
      top: '33%',
      right: '26%',
      width: '12%',
      height: '12%'
    }
  },
  {
    id: 'red-219-high',
    name: '紅219區',
    type: 'red',
    price: 6280,
    style: {
      top: '45%',
      right: '26%',
      width: '12%',
      height: '12%'
    }
  },
  {
    id: 'red-219-low',
    name: '紅219區',
    type: 'red',
    price: 4200,
    style: {
      top: '45%',
      right: '10%',
      width: '16%',
      height: '12%'
    }
  },
  {
    id: 'red-218-high',
    name: '紅218區',
    type: 'red',
    price: 6280,
    style: {
      top: '58%',
      right: '26%',
      width: '12%',
      height: '12%'
    }
  },
  {
    id: 'red-218-low',
    name: '紅218區',
    type: 'red',
    price: 4200,
    style: {
      top: '58%',
      right: '10%',
      width: '12%',
      height: '12%'
    }
  },

  // 綠色區域
  {
    id: 'green-212-high',
    name: '綠212區',
    type: 'green',
    price: 5280,
    style: {
      bottom: '16%',
      left: '41%',
      width: '6%',
      height: '12%'
    }
  },
  {
    id: 'green-212-low',
    name: '綠212區',
    type: 'green',
    price: 4200,
    style: {
      bottom: '5%',
      left: '33%',
      width: '10%',
      height: '10%'
    }
  },
  {
    id: 'green-213-high',
    name: '綠213區',
    type: 'green',
    price: 5280,
    style: {
      bottom: '14%',
      left: '48%',
      width: '6%',
      height: '12%'
    }
  },
  {
    id: 'green-213-low',
    name: '綠213區',
    type: 'green',
    price: 4200,
    style: {
      bottom: '2%',
      left: '45%',
      width: '8%',
      height: '10%'
    }
  },
  {
    id: 'green-214-high',
    name: '綠214區',
    type: 'green',
    price: 5280,
    style: {
      bottom: '14%',
      right: '40%',
      width: '6%',
      height: '12%'
    }
  },
  {
    id: 'green-214-low',
    name: '綠214區',
    type: 'green',
    price: 4200,
    style: {
      bottom: '2%',
      right: '38%',
      width: '8%',
      height: '10%'
    }
  },
  {
    id: 'green-215-high',
    name: '綠215區',
    type: 'green',
    price: 5280,
    style: {
      bottom: '16%',
      right: '33%',
      width: '6%',
      height: '12%'
    }
  },
  {
    id: 'green-215-low',
    name: '綠215區',
    type: 'green',
    price: 4200,
    style: {
      bottom: '5%',
      right: '25%',
      width: '10%',
      height: '10%'
    }
  }
]

const showDialog = ref(false)
const selectedArea = ref(null)
const showTooltip = ref(false)
const tooltipContent = ref('')

// 選擇區域
const selectArea = (area) => {
  selectedArea.value = area
  showDialog.value = true
}

// 查看座位
const viewSeats = () => {
  // 導航到座位選擇頁面
  // router.push(`/seats/${selectedArea.value.id}`)
}

// 顯示懸浮提示
// const showTooltipInfo = (area) => {
//   tooltipContent.value = `${area.name}\nNT$ ${area.price}`
//   showTooltip.value = true
// }

// // 隱藏懸浮提示
// const hideTooltipInfo = () => {
//   showTooltip.value = false
// }
</script>

<style lang="scss">
.seat-map-container {
  width: 100%;
  max-width: 1000px;
  margin: 20px;
  position: relative;
}

.seat-map {
  width: 100%;
  background: #f5f5f5;
}

.seat-area {
  aspect-ratio: 1.2;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
}

.area-btn {
  position: absolute;
  border: 2px solid transparent;
  transition: all 0.3s;

  &:hover {
    border-color: white;
    background: rgba(0, 0, 0, 0.5) !important;

    .area-content {
      opacity: 1;
    }
  }
}

.area-content {
  opacity: 0;
  color: white;
  text-align: center;
  transition: opacity 0.3s;
}

.area-name {
  font-size: 1.2rem;
  font-weight: bold;
}

.area-price {
  font-size: 1rem;
}

// 區域顏色
.orange { background: rgba(255, 152, 0, 0.2); }
.red { background: rgba(244, 67, 54, 0.2); }
.green { background: rgba(76, 175, 80, 0.2); }
.vip { background: rgba(33, 150, 243, 0.2); }
</style>
