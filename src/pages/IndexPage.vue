<!-- src/pages/IndexPage.vue -->
<template>
  <q-page class="flex flex-column">
    <div class="seat-map-container">
      <!-- 座位圖容器 -->
      <q-card-section class="text-center">
        <div class="text-h5 text-blue-10 text-bold">🎫 2024 SUPER JUNIOR-D&E WORLD TOUR ECLIPSE in KAOHSIUNG</div>
        <div class="text-caption text-grey">請選擇您要查看的座位區域與資訊</div>
      </q-card-section>
      <!-- 選中區域的座位表 -->
      <q-card-section>
        <!-- 使用 q-col-gutter 提供間距，更改 row 與 column 的佈局方式 -->
        <div class="row q-col-gutter-md " :class="{'wrap': $q.screen.lt.md}">
          <!-- 左側座位圖 - 在小屏幕上佔滿寬度，大屏幕上佔 40% -->
          <div class="col-xs-12 col-md-5 flex items-center ">
            <div class="seat-area" :style="{ backgroundImage: `url(${seatMapImage})` }">
              <template v-for="area in areas" :key="area.id">
                <q-btn
                  :class="['area-btn', area.type,{ 'area-selected': selectedArea?.id === area.id } ]"
                  :style="area.style"
                  flat
                  @click="selectArea(area)"
                  @mouseover="showTooltip(area)"
                  @mouseleave="hideTooltip"
                >
                </q-btn>
              </template>
            </div>
          </div>

          <!-- 右側座位表 + 座位照片 - 在小屏幕上佔滿寬度，大屏幕上佔 60% -->
          <div class="col-xs-12 col-md-7">
            <q-tabs
              v-model="tab"
              dense
              align="justify"
              class="text-white bg-blue-9 shadow-1 rounded-borders"
            >
              <q-tab name="map" label="從座位圖查看" />
              <q-tab name="select" label="從列表查看" />
            </q-tabs>

            <q-tab-panels v-model="tab" animated class="bg-white q-pa-md shadow-1 rounded-borders">
              <!-- Tab 1: 從座位圖選擇 -->
              <q-tab-panel name="map" style="height: 60vh; overflow-y: auto;">
                <div v-if="!selectedArea" class="text-subtitle2 text-grey text-center q-mt-md">
                  請點選左側圖片的任一區域
                </div>
                <div v-else class="seat-table q-mb-md">
                  <table>
                    <tbody>
                      <tr v-for="row in 26" :key="`row-${row}`">
                        <td
                          v-for="col in 26"
                          :key="`${row}-${col}`"
                          :class="['seat-cell', getSeatStatus(row, col)]"
                          @click="onSeatClick(row, col)"
                        >
                          {{ getSeatLabel(row, col) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </q-tab-panel>

              <!-- Tab 2: 下拉選單選擇 -->
              <q-tab-panel name="select" style="height: 60vh; overflow-y: auto;">
                <!-- 下拉選單選擇區域 -->
                <q-select
                  v-model="selectedAreaFilter"
                  :options="areaOptions"
                  label="選擇區域"
                  clearable
                  outlined
                  dense
                  class="q-mb-md"
                />

                <!-- 按鈕呈現每個區域有照片的座位 -->
                <div v-if="groupedSeats.length">
                  <div
                    v-for="group in groupedSeats"
                    :key="group.area"
                    class="q-mb-md"

                  >
                    <div class="text-subtitle2 q-mb-xs">{{ group.area }}</div>
                    <div class="q-gutter-sm">
                      <q-btn
                      v-for="seat in group.seats"
                      :key="`${seat.row}-${seat.num}`"
                      :label="`${seat.name}(${seat.row}排${seat.num}號)`"
                      @click="onTagClick(seat)"
                      size="md"
                      color="blue-10"
                      unelevated
                      rounded
                      outline
                      class="q-px-md q-my-xs text-white"
                    />
                    </div>
                  </div>
                </div>
                <div v-else class="text-grey">目前無資料</div>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </q-card-section>

      <q-dialog v-model="photoDialog">
        <q-card style="width: 700px; max-width: 90vw;" >
          <q-card-section class="q-pa-sm">
            <div class="row items-center justify-between">
              <div class="text-h6">座位照片</div>
              <q-btn flat icon="close" v-close-popup />
            </div>
          </q-card-section>


          <q-card-section class="q-pa-sm">
            <div class="text-h6">
              {{ selectedSeatInfo.name }} ({{ selectedSeatInfo.provider }})
            </div>

          </q-card-section>
          <q-card-section style="max-width: 500px; margin: auto;" class="q-pa-sm">
            <q-carousel
              v-if="showPhotos.length > 0"
              v-model="activeSlide"
              animated
              arrows
              swipeable
              infinite
              height="300px"
              control-type="flat"
              control-color="primary"
            >
            <q-carousel-slide
            v-for="(photo, index) in showPhotos"
            :name="index"
            :key="index"
          >
            <div class="column items-center q-gutter-xs">
              <q-img
                :src="photo.content"
                :alt="photo.description"
                style="height: 300px; object-fit: contain;"
              />
            </div>
          </q-carousel-slide>

            </q-carousel>
            <div v-else class="text-center q-pa-md">目前沒有照片</div>
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
import { ref, onMounted, computed } from 'vue';

// 座位圖背景
const seatMapImage = '/images/seat-map.jpg';
const activeSlide = ref(0);
const tab = ref('map');
const selectedAreaFilter = ref(null);
const seatPhotoData = ref([]); // 原始 JSON 資料


const onTagClick = (item) => {
  console.log(item);
  selectedSeatInfo.value = {
    name: `${item.area}-${item.row}排-${item.num}號`,
    row: item.row,
    col: item.num,
    provider: item.name
  };
  showPhotos.value = item.photos || [];
  photoDialog.value = true;
};

// 初始化時載入 seatphoto.json
const loadSeatPhotoData = async () => {
  const res = await fetch('/data/seatphoto.json');
  const json = await res.json();
  seatPhotoData.value = json.座位資料;
};
onMounted(loadSeatPhotoData);

// 所有區域選項（不重複）
const areaOptions = computed(() => {
  const vipOrder = ['VIPA', 'VIPB', 'VIPC', 'VIPD'];

  // 收集有照片的區域
  const areaSet = new Set(
    seatPhotoData.value
      .filter(item => item.photos?.length)
      .map(item => item.area)
  );

  const areas = Array.from(areaSet);

  return areas.sort((a, b) => {
    const isVIPa = vipOrder.includes(a);
    const isVIPb = vipOrder.includes(b);

    if (isVIPa && isVIPb) {
      return vipOrder.indexOf(a) - vipOrder.indexOf(b);
    }
    if (isVIPa) return -1;
    if (isVIPb) return 1;

    // 價格排序（從 area 名稱中解析價格）
    const getPrice = (areaName) => {
      const parts = areaName.split('_');
      return parts.length > 1 ? parseInt(parts[1]) : 0;
    };

    return getPrice(b) - getPrice(a); // 價格由高到低
  });
});

const groupedSeats = computed(() => {
  const groups = {};
  seatPhotoData.value.forEach(item => {
    if (!item.photos?.length) return;

    const matchArea = !selectedAreaFilter.value || item.area === selectedAreaFilter.value;
    if (matchArea) {
      if (!groups[item.area]) groups[item.area] = [];
      groups[item.area].push(item);
    }
  });

  const vipOrder = ['VIPA', 'VIPB', 'VIPC', 'VIPD'];

  const parsePrice = (area) => {
    const parts = area.split('_');
    return parts.length > 1 ? parseInt(parts[1]) : 99999;
  };

  return Object.entries(groups)
    .sort((a, b) => {
      const nameA = a[0];
      const nameB = b[0];

      const isVIPa = vipOrder.includes(nameA);
      const isVIPb = vipOrder.includes(nameB);

      if (isVIPa && isVIPb) {
        return vipOrder.indexOf(nameA) - vipOrder.indexOf(nameB);
      }

      if (isVIPa) return -1;
      if (isVIPb) return 1;

      return parsePrice(nameB) - parsePrice(nameA);
    })
    .map(([area, seats]) => ({ area, seats }));
});



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
      width: '16%',
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
const showPhotos = ref([]);
const selectedSeatInfo = ref({ name: '', row: 0, col: 0 });

const photoDialog = ref(false);
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

  // 嘗試加載座位數據
  try {
    const response = await fetch(`/data/${seatname.value}.json`);
    seatData.value = await response.json();
    await loadPhotoMap();
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

const onSeatClick = (row, col) => {
  const seat = seatData.value.seats.find(
    s => s.row === row && s.position === col
  );
  if (!seat) return;

  const info = photoMap.value[seat.id];
  console.log('info:', info);
  if (info) {
    selectedSeatInfo.value = {
      name: seat.id,
      row,
      col,
      provider: info.name
    };
    showPhotos.value = info.photos;
    photoDialog.value = true;
  } else {
    selectedSeatInfo.value = {
      name: seat.id,
      row,
      col,
      provider: '無'
    };
    showPhotos.value = [];
    photoDialog.value = true;
  }
  console.log('Selected seat:', selectedSeatInfo.value);
};

// 獲取座位狀態
const getSeatStatus = (row, col) => {
  const isNonePosition = seatData.value.none_positions.some(
    pos => pos.row === row && pos.position === col
  );
  if (isNonePosition) return 'empty';

  const seat = seatData.value.seats.find(
    s => s.row === row && s.position === col
  );
  if (!seat) return 'empty';

  if (photoMap.value[seat.id]) {
    return 'available'; // 有照片：綠色
  }

  return 'sold'; // 沒照片：灰色
};

const getSeatLabel = (row, col) => {
  const seat = seatData.value.seats.find(
    s => s.row === row && s.position === col
  );
  if (seat && seat.id) {
    const seatId = seat.id.split('-');
    const seatRow = seatId[1].replace('排', '');
    const seatCol = seatId[2].replace('號', '');

    return `${seatRow}-${seatCol}`;
  }
  return ``;
};

// 存儲區域照片
const photoMap = ref({});
const loadPhotoMap = async () => {
  const res = await fetch('/data/seatphoto.json');
  const photoJson = await res.json();
  const photos = photoJson.座位資料;

  const map = {};

  photos.forEach(({ area, row, num, name, photos }) => {
    if (!photos || photos.length === 0) return;
    if (area !== seatname.value) return;

    // 找出該區域座位資料中，id 包含 `${row}排-${num}號` 的那個
    const seat = seatData.value.seats.find(s => {
      const idMatch = `${row}排-${num}號`;
      return s.id.includes(idMatch);
    });

    // if (seat) {
    //   map[seat.id] = { name, photos };
    // }
    if (seat) {
  const enrichedPhotos = photos.map(photo => ({
    ...photo,
    provider: name // 將 name 視為提供者
  }));
  map[seat.id] = { name, photos: enrichedPhotos };
}
  });

  photoMap.value = map;
};
onMounted(async () => {
  const res = await fetch('/data/seatphoto.json');
  const photoJson = await res.json();

  // 把所有 seat data 都載入一份（可以是 cached or latest selectedArea）
  const seatRes = await fetch(`/data/${seatname.value}.json`);
  const seatJson = await seatRes.json();
  const seatList = seatJson.seats;

  const map = {};

  photoJson.座位資料.forEach(({ area, row, num, photos, name }) => {
    const matchSeat = seatList.find(s => {
      return (
        s.row === row &&
        s.position === num &&
        seatname.value === area
      );
    });

    if (matchSeat && photos.length) {
      map[matchSeat.id] = {
        name,
        photos
      };
    }
  });

  photoMap.value = map;
});
</script>

<style lang="scss">
html, body, #q-app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden; // ⭕ 只隱藏橫向捲動，允許垂直捲動
  overflow-y: auto;   // ⭕ 啟用垂直捲動
}

.seat-map-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.seat-map {
  width: 100%;
  background: #f5f5f5;
}

.seat-area {
  width: 100%;
  aspect-ratio: 1.2;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  margin-bottom: 20px;
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
  font-size: 10px;
  font-weight: bold;
}

.area-price {
  font-size: 10px;
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
  max-width: 100%;

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
      padding: 2px 2px;
      font-size: 8px;
      text-align: center;
      border-radius: 2px;
      white-space: nowrap; // 避免換行
    }
  }
}

.seat-cell {
  cursor: pointer;

  &.available {
    background-color: #4CAF50;
    color: white;
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

/* 響應式樣式調整 */
@media (max-width: 767px) {
  .seat-map-container {
    padding: 10px;
    margin: 0;
  }

  .seat-area {
    aspect-ratio: 1;
    max-height: 70vh;
  }

  .seat-table {
    margin-top: 15px;
  }

  /* 對話框在手機上佔據更多空間 */
  .q-dialog__inner--minimized > div {
    max-width: 95vw !important;
  }
}

/* 確保大螢幕上的佈局比例合理 */
@media (min-width: 1024px) {
  .seat-map-container {
    max-width: 90%;
  }
}

.area-selected {
  border: 2px solid #1976d2 !important; // 或用 primary 顏色
  box-shadow: 0 0 6px rgba(25, 118, 210, 0.8);
}
</style>
