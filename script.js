// JavaScript 程式碼 - 抓取資料並渲染畫面

const API_URL = 'https://nutc-web-vic-peng.zeabur.app/api/weather/kaohsiung';
const mainForecastEl = document.getElementById('main-forecast');
const futureForecastsEl = document.getElementById('future-forecasts');
const cityNameEl = document.getElementById('city-name');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message');

/**
 * 根據天氣描述返回對應的 Emoji icon。
 * @param {string} weatherText 天氣狀況文字
 * @returns {string} 對應的 Emoji
 */
function getWeatherIcon(weatherText) {
    if (weatherText.includes('晴')) return '☀️';
    if (weatherText.includes('多雲') || weatherText.includes('陰')) return '☁️';
    if (weatherText.includes('雨')) return '🌧️';
    if (weatherText.includes('雷')) return '⛈️';
    if (weatherText.includes('雪')) return '❄️';
    if (weatherText.includes('霧')) return '🌫️';
    return '❓'; // 預設
}

/**
 * 根據時間判斷時段文字。
 * @param {string} startTime ISO 格式時間字串 (e.g., "2025-12-11 06:00:00")
 * @returns {string} 時段描述 (如：早晨、下午、晚上)
 */
function getTimePeriod(startTime) {
    // 將 YYYY-MM-DD HH:MM:SS 格式轉換為 Date 物件
    const date = new Date(startTime.replace(/-/g, "/")); 
    const hour = date.getHours();

    if (hour >= 6 && hour < 12) return '🌅 早晨';
    if (hour >= 12 && hour < 18) return '🏙️ 下午';
    if (hour >= 18 || hour < 6) return '🌃 晚上';
    return '時段';
}

/**
 * 渲染主要時段的天氣資訊 (醒目顯示)。
 * @param {object} forecast 第一個預報時段資料
 * @param {string} periodText 時段描述
 */
function renderMainForecast(forecast, periodText) {
    mainForecastEl.innerHTML = `
        <div class="main-time-text">${periodText}</div>
        <div class="main-icon">${getWeatherIcon(forecast.weather)}</div>
        <div class="main-weather-text">${forecast.weather}</div>
        <div class="main-temp-text">${forecast.minTemp.replace('°C', '')}~${forecast.maxTemp}</div>
        <div class="main-detail-row">
            <div>
                ☔ 降雨機率: <strong>${forecast.rain}</strong>
            </div>
        </div>
        <div class="comfort-text">
            😊 舒適度：${forecast.comfort}
        </div>
    `;
    mainForecastEl.style.display = 'flex'; // 顯示主要區塊
}

/**
 * 渲染未來時段的天氣資訊 (區塊顯示)。
 * @param {Array<object>} forecasts 未來預報時段陣列
 */
function renderFutureForecasts(forecasts) {
    futureForecastsEl.innerHTML = '';
    // 處理除了第一個以外的其他時段
    const future = forecasts.slice(1); 
    
    future.forEach(forecast => {
        const periodText = getTimePeriod(forecast.startTime);
        const block = document.createElement('div');
        block.className = 'future-block';
        block.innerHTML = `
            <div class="future-time-text">${periodText}</div>
            <div class="future-icon">${getWeatherIcon(forecast.weather)}</div>
            <div class="future-weather-text">${forecast.weather}</div>
            <div class="future-temp-text">${forecast.minTemp.replace('°C', '')}~${forecast.maxTemp}</div>
            <div class="future-rain-text">☔ 降雨: ${forecast.rain}</div>
        `;
        futureForecastsEl.appendChild(block);
    });
    futureForecastsEl.style.display = 'grid'; // 顯示未來區塊
}

/**
 * 抓取 API 資料並渲染網頁。
 */
async function fetchWeather() {
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    mainForecastEl.style.display = 'none';
    futureForecastsEl.style.display = 'none';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
        }
        const json = await response.json();
        
        if (json.success && json.data && json.data.forecasts && json.data.forecasts.length > 0) {
            const data = json.data;
            const forecasts = data.forecasts;

            // 1. 設置城市名稱
            cityNameEl.textContent = `${data.city} 天氣預報`;
            
            // 2. 判斷當前時段 (取第一個時段作為當前/即將到來的時段)
            const currentForecast = forecasts[0];
            const currentPeriodText = getTimePeriod(currentForecast.startTime);

            // 3. 渲染主要時段
            renderMainForecast(currentForecast, currentPeriodText);

            // 4. 渲染未來時段 (從第二個時段開始)
            if (forecasts.length > 1) {
                renderFutureForecasts(forecasts);
            }
            
        } else {
            throw new Error('API 回傳資料格式錯誤或無預報資料。');
        }

    } catch (error) {
        console.error('抓取天氣資料失敗:', error);
        errorEl.textContent = `🚫 資料載入失敗: ${error.message}，請檢查 API 網址是否正確。`;
        errorEl.style.display = 'block';
    } finally {
        loadingEl.style.display = 'none';
    }
}

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', fetchWeather);