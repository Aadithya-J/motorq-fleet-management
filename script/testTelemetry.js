const axios = require("axios");

const num = 10;
const vin = 3;
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}
for(let i = 0;i < num;i++){
    let latitude = generateString(10);
    let longitude = generateString(10);
    let speed = Math.ran
                speed,
                engineStatus,
                fuelPercentage,
                odometerReading,
                errorCode,
                timestamp,
                vehicleVin
}