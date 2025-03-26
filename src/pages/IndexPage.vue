<!-- src/pages/IndexPage.vue -->
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

      <!-- 選中區域的座位表 -->
      <q-dialog v-model="showDialog" maximized>
        <q-card>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ selectedArea?.name }} 區 - NT$ {{ selectedArea?.price }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <!-- 座位預覽組件 -->
            <div class="seat-preview-wrapper">
              <!-- 舞台區域 -->
              <div class="stage">舞台 Stage</div>
              
              <!-- 座位表格 -->
              <div class="seat-table">
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th v-for="col in 26" :key="`col-${col}`">{{ col }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in 26" :key="`row-${row}`">
                      <th>{{ row }}排</th>
                      <td 
                        v-for="col in 26" 
                        :key="`${row}-${col}`"
                        :class="['seat-cell', getSeatStatus(row, col)]"
                      ></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- 座位圖例 -->
              <div class="seat-legend">
                <div class="legend-item">
                  <div class="seat-example available"></div>
                  <div>可選</div>
                </div>
                <div class="legend-item">
                  <div class="seat-example sold"></div>
                  <div>已售</div>
                </div>
                <div class="legend-item">
                  <div class="seat-example empty"></div>
                  <div>無效位置</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- 懸浮提示 -->
      <q-tooltip
        v-if="showTooltipFlag"
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
import { ref, onMounted } from 'vue';

// 座位圖背景
const seatMapImage = '/images/seat-map.jpg';

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
    name: 'VIPA',
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
    name: 'VIPB',
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
    name: 'VIPC',
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
    name: 'VIPD',
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
];

const showDialog = ref(false);
const selectedArea = ref(null);
const seatname = ref('');
const showTooltipFlag = ref(false);
const tooltipContent = ref('');
const seatData = ref({
  seats: [],
  none_positions: []
});

// 選擇區域，顯示座位表
const selectArea = async (area) => {
  selectedArea.value = area;
  if (area.name.includes('區')) {
        seatname.value = area.name.replace('區', '_')+area.price;

  } else {

    seatname.value = area.name;
  }
  console.log(selectedArea.value);
  
  // 嘗試加載座位數據
  try {
    // 實際應用需通過API從後端獲取
  
  const response = await fetch(`/data/${seatname.value}.json`);
    seatData.value = await response.json();
  } catch (error) {
    console.error('Error loading seat data:', error);
    // 如果加載失敗，使用空數據
    seatData.value = { seats: [], none_positions: [] };
  }
  
  // 顯示對話框
  showDialog.value = true;
};

// 顯示懸浮提示
const showTooltip = (area) => {
  tooltipContent.value = `${area.name}\nNT$ ${area.price}`;
  showTooltipFlag.value = true;
};

// 隱藏懸浮提示
const hideTooltip = () => {
  showTooltipFlag.value = false;
};

// 獲取座位狀態
const getSeatStatus = (row, col) => {
  // 檢查是否無效座位
  const isNonePosition = seatData.value.none_positions.some(
    pos => pos.row === row && pos.position === col
  );
  
  if (isNonePosition) return 'empty';
  
  const seat = seatData.value.seats.find(
    s => s.row === row && s.position === col
  );
  
  if (!seat) return 'empty';
  
  // empty類型的座位也算作available
  if (seat.type === 'empty') return 'available';
  
  return seat.type || 'available'; // 'sold' 或 'available'
};

// Google Sheet 相關配置
const sheetId = "286354388";
const apiKey = "14810b2e8b23ad6214403318f1aa55c2ba8c6f85";
const sheetRange = "A:C"; // 假設 A 欄是時間戳記，B 欄是照片連結，C 欄是座位區域

// 獲取 Google Sheet 數據
const fetchSheetData = async () => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.values || []; // 返回整個表格資料或空陣列
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    return [];
  }
};

// 存儲區域照片
const seatPhotos = ref({});

// 加載座位照片資料
const loadSeatPhotos = async () => {
  try {
    const data = await fetchSheetData();
    
    // 跳過表頭行 (如果有)
    const rows = data.length > 1 ? data.slice(1) : data;
    
    seatPhotos.value = rows.reduce((acc, row) => {
      if (row.length >= 2) {
        const [photoLink, seat] = row;
        if (seat && photoLink) {
          acc[seat] = photoLink; // 根據座位名存儲照片連結
        }
      }
      return acc;
    }, {});
    
    console.log('Loaded seat photos:', seatPhotos.value);
  } catch (error) {
    console.error('Error loading seat photos:', error);
  }
};

onMounted(() => {
  loadSeatPhotos();
});
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

// 座位預覽相關樣式
.seat-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 10px;
}

.stage {
  background: #333;
  color: white;
  padding: 15px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 40px;
  border-radius: 8px;
  width: 80%;
  max-width: 500px;
}

.seat-table {
  overflow-x: auto;
  width: 100%;
  max-width: 900px;
  
  table {
    border-collapse: separate;
    border-spacing: 2px;
    
    th {
      padding: 5px;
      font-size: 12px;
      text-align: center;
      min-width: 30px;
    }
    
    td {
      width: 18px;
      height: 18px;
      border-radius: 2px;
    }
  }
}

.seat-cell {
  &.available {
    background-color: #4CAF50;
  }
  
  &.sold {
    background-color: #9E9E9E;
    opacity: 0.6;
  }
  
  &.empty {
    background-color: #f5f5f5;
  }
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.seat-example {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  
  &.available {
    background-color: #4CAF50;
  }
  
  &.sold {
    background-color: #9E9E9E;
    opacity: 0.6;
  }
  
  &.empty {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
  }
}
</style>