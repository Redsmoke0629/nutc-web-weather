// JavaScript 程式碼 - 抓取資料並渲染畫面

const API_URL = 'https://nutc-web-vic-peng.zeabur.app/api/weather/kaohsiung';
const mainForecastEl = document.getElementById('main-forecast');
const futureForecastsEl = document.getElementById('future-forecasts');
const cityNameEl = document.getElementById('city-name');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message');
const updateInfoEl = document.getElementById('update-info');

/**
 * 根據天氣描述返回對應的 Emoji icon。
 */
function getWeatherIcon(weatherText) {
    if (weatherText.includes('晴')) return '🌞';
    if (weatherText.includes('多雲') || weatherText.includes('陰')) return '🌥️';
    if (weatherText.includes('雨')) return '💧';
    if (weatherText.includes('雷')) return '🌩️';
    if (weatherText.includes('雪')) return '❄️';
    if (weatherText.includes('霧')) return '🌫️';
    return '🛰️'; // 衛星數據未定義
}

/**
 * 根據時間判斷時段文字 (科技描述)。
 * @param {string} startTime ISO 格式時間字串
 * @returns {string} 時段描述
 */
function getTimePeriod(startTime) {
    // 將 YYYY-MM-DD HH:MM:SS 格式轉換為 Date 物件
    const date = new Date(startTime.replace(/-/g, "/")); 
    const hour = date.getHours();

    if (hour >= 6 && hour < 12) return '🌅 數據啟動: 清晨';
    if (hour >= 12 && hour < 18) return '🏙️ 日間天氣數據';
    if (hour >= 18 || hour < 6) return '🌃 夜間天氣傳輸';
    return '時段訊號';
}

/**
 * 渲染主要時段的天氣資訊 (醒目顯示)。
 */
function renderMainForecast(forecast, periodText) {
    const minTemp = forecast.minTemp.replace('°C', '');
    const maxTemp = forecast.maxTemp;

    mainForecastEl.innerHTML = `
        <div class="main-time-text">${periodText}</div>
        <div class="main-icon">${getWeatherIcon(forecast.weather)}</div>
        <div class="main-weather-text">${forecast.weather}</div>
        <div class="main-temp-text">${minTemp}°C / ${maxTemp}</div>
        <div class="main-detail-row">
            <p>
                ☔ 降雨概率: <strong style="color: var(--accent-blue);">${forecast.rain}</strong>
            </p>
        </div>
        <div class="comfort-text">
            [系統回饋] 舒適度分析：${forecast.comfort}
        </div>
    `;
    mainForecastEl.style.display = 'flex';
}

/**
 * 渲染未來時段的天氣資訊 (區塊顯示)。
 */
function renderFutureForecasts(forecasts) {
    futureForecastsEl.innerHTML = '';
    const future = forecasts.slice(1); 
    
    future.forEach(forecast => {
        const periodText = getTimePeriod(forecast.startTime);
        const minTemp = forecast.minTemp.replace('°C', '');
        const maxTemp = forecast.maxTemp;
        
        const block = document.createElement('div');
        block.className = 'future-block';
        block.innerHTML = `
            <div class="future-time-text">${periodText}</div>
            <div class="future-icon">${getWeatherIcon(forecast.weather)}</div>
            <div class="future-weather-text">${forecast.weather}</div>
            <div class="future-temp-text">${minTemp}~${maxTemp}</div>
            <div class="future-rain-text">💧 降雨機率: ${forecast.rain}</div>
        `;
        futureForecastsEl.appendChild(block);
    });
    futureForecastsEl.style.display = 'grid';
}

/**
 * 抓取 API 資料並渲染網頁。
 */
async function fetchWeather() {
    // **確保這裡的載入元素被設定為 block**
    loadingEl.style.display = 'block'; 
    errorEl.style.display = 'none';
    mainForecastEl.style.display = 'none';
    futureForecastsEl.style.display = 'none';
    updateInfoEl.style.display = 'none';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
        }
        const json = await response.json();
        
        if (json.success && json.data && json.data.forecasts && json.data.forecasts.length >= 3) {
            const data = json.data;
            const forecasts = data.forecasts.slice(0, 3); 

            // 1. 設置城市名稱和更新時間
            cityNameEl.textContent = `${data.city} 天氣數據`;
            updateInfoEl.textContent = `[系統] 氣象數據更新頻率：${data.updateTime}`;
            updateInfoEl.style.display = 'block';
            
            // 2. 渲染主要時段 (第一個)
            const currentForecast = forecasts[0];
            const currentPeriodText = getTimePeriod(currentForecast.startTime);
            renderMainForecast(currentForecast, currentPeriodText);

            // 3. 渲染未來時段 (第二和第三個)
            renderFutureForecasts(forecasts);
            
        } else {
            throw new Error('數據核心回傳格式錯誤或預報時段不足三個。');
        }

    } catch (error) {
        console.error('抓取天氣資料失敗:', error);
        // **確保這裡的錯誤訊息也是科技風格**
        errorEl.textContent = `🚫 數據流中斷: ${error.message}，請檢查 API 連結。`; 
        errorEl.style.display = 'block';
    } finally {
        loadingEl.style.display = 'none';
    }
}

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', fetchWeather);