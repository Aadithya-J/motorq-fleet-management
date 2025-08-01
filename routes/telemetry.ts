import { Router, Request, Response } from 'express';
import prisma from '../utils/prismaClient';
import redisClient from '../utils/redisClient';

const router = Router();

router.post("/data", async (req: Request,res: Response) => {
    const { latitude,longitude,engineStatus,errorCode} = req.body;
    const speed = parseFloat(req.body.speed);
    const fuelPercentage = parseFloat(req.body.fuelPercentage);
    const odometerReading = Number(req.body.odometerReading);
    const timestamp = new Date(req.body.timestamp);
    const vehicleVin = Number(req.body.vehicleVin)
    let date = new Date();
    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { vin: vehicleVin },
            select: { fleetID: true }
        });

        if (vehicle && vehicle.fleetID) {
            const cacheKey = `analytics:${vehicle.fleetID}`;
            await redisClient.del(cacheKey);
            console.log(`Cache invalidated for fleet: ${vehicle.fleetID}`);
        }
        
        const telemetry = await prisma.telemetry.create({
            data: {
                latitude,
                longitude,
                speed,
                engineStatus,
                fuelPercentage,
                odometerReading,
                errorCode,
                timestamp,
                vehicleVin
            }
        })
        let alert1 = undefined;
        let alert2 = undefined;

        if(speed > 70) {
            const vehicleUpdate = await prisma.vehicle.update({
                where : {
                    vin : vehicleVin
                },
                data : {
                    currentAlertCount: {
                        increment : 1
                    }
                }
            })
            if (vehicleUpdate.currentAlertCount >= 5) {
                const alert = await prisma.alert.create({
                    data : {
                        alert : "speed limit exceeded",
                        telemetryid : telemetry.id,
                        vehicleid : vehicleVin
                    }
                })
                await redisClient.del('alerts:all');
                await redisClient.del(`alerts:vehicle:${vehicleVin}`);
                const vehicleUpdate2 = await prisma.vehicle.update({
                    where : {
                        vin : vehicleVin
                    },
                    data :{
                        currentAlertCount : 0,
                        // lastDataReceivedTime: date.toDateString()
                    }
                })
                console.log(alert);
                // publish new alert to pub/sub channel
                await redisClient.publish('alerts', JSON.stringify(alert));
                alert1 = alert;
            }
        } else {
            const vehicleUpdate2 = await prisma.vehicle.update({
                where : {
                    vin : vehicleVin
                },
                data :{
                    currentAlertCount : 0,
                    // lastDataReceivedTime: date.toDateString()
                }
            });
        }

        if(fuelPercentage <= 20) {
            const alert = await prisma.alert.create({
                data : {
                    alert : "low fuel",
                    telemetryid : telemetry.id,
                    vehicleid : vehicleVin
                }
            })
            await redisClient.del('alerts:all');
            await redisClient.del(`alerts:vehicle:${vehicleVin}`);
            console.log(alert);
            // publish new alert to pub/sub channel
            await redisClient.publish('alerts', JSON.stringify(alert));
        }
        if(alert1 != undefined){
            const final1  = {
                ...telemetry,
                alert1
            }
            res.json(final1);
        } else {
            res.json(telemetry);
        }
    } catch (error){
        console.log(error);
        res.json(error);
    }
});

router.post("/multipleData", async (req: Request, res: Response) => {
    const telemetries = req.body.telemetries;
    console.log(telemetries);
    const telemetryResult : any = [];
    // console.log("start")
    for (var i = 0;i < telemetries.length;i++){
        const telemetry = telemetries[i];
        const { latitude,longitude,engineStatus,errorCode} = telemetry;
        const speed = parseFloat(telemetry.speed);
        const fuelPercentage = parseFloat(telemetry.fuelPercentage);
        const odometerReading = Number(telemetry.odometerReading);
        const timestamp = new Date(telemetry.timestamp);
        const vehicleVin = Number(telemetry.vehicleVin);
        const telemetryRes = await prisma.telemetry.create({
            data: {
                latitude,
                longitude,
                speed,
                engineStatus,
                fuelPercentage,
                odometerReading,
                errorCode,
                timestamp,
                vehicleVin
            }
        })
        telemetryResult.push(telemetryRes);
        console.log(telemetryRes);
        // console.log("complete1");
    }
    // console.log("complete");
    res.json(telemetryResult);
})

router.get("/getDataById", async (req: Request, res: Response) => {
    const vin = Number(req.query.vin);
    const limit = Number(req.query.limit) || 10;
    try {
        const telemetries = await prisma.telemetry.findMany({
            where: {vehicleVin : vin},
            orderBy : {
                timestamp : "desc"
            },
            take: limit
        })
        res.json(telemetries);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

export default router;