export const calculateAQI = (pm25) => {
    // Round to 1 decimal place as per standard
    const c = Math.floor(pm25 * 10) / 10;

    // Breakpoints for PM2.5 (US EPA standard)
    // C_low - C_high -> I_low - I_high
    // 0.0 - 12.0 -> 0 - 50
    // 12.1 - 35.4 -> 51 - 100
    // 35.5 - 55.4 -> 101 - 150
    // 55.5 - 150.4 -> 151 - 200
    // 150.5 - 250.4 -> 201 - 300
    // 250.5 - 350.4 -> 301 - 400
    // 350.5 - 500.4 -> 401 - 500

    let ilow, ihigh, clow, chigh;

    if (c <= 12.0) {
        clow = 0.0; chigh = 12.0; ilow = 0; ihigh = 50;
    } else if (c <= 35.4) {
        clow = 12.1; chigh = 35.4; ilow = 51; ihigh = 100;
    } else if (c <= 55.4) {
        clow = 35.5; chigh = 55.4; ilow = 101; ihigh = 150;
    } else if (c <= 150.4) {
        clow = 55.5; chigh = 150.4; ilow = 151; ihigh = 200;
    } else if (c <= 250.4) {
        clow = 150.5; chigh = 250.4; ilow = 201; ihigh = 300;
    } else if (c <= 350.4) {
        clow = 250.5; chigh = 350.4; ilow = 301; ihigh = 400;
    } else {
        // Cap or extrapolate
        clow = 350.5; chigh = 500.4; ilow = 401; ihigh = 500;
    }

    const aqi = Math.round(((ihigh - ilow) / (chigh - clow)) * (c - clow) + ilow);

    // Determine category
    let category = "Good";
    let color = "#00e400"; // Green

    if (aqi > 50) {
        category = "Moderate";
        color = "#ffff00"; // Yellow
    }
    if (aqi > 100) {
        category = "Unhealthy for Sensitive Groups";
        color = "#ff7e00"; // Orange
    }
    if (aqi > 150) {
        category = "Unhealthy";
        color = "#ff0000"; // Red
    }
    if (aqi > 200) {
        category = "Very Unhealthy";
        color = "#8f3f97"; // Purple
    }
    if (aqi > 300) {
        category = "Hazardous";
        color = "#7e0023"; // Maroon
    }

    return { aqi, category, color };
};
