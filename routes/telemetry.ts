import { Router, Request, Response } from 'express';
import prisma from '../utils/prismaClient'

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
            console.log(alert);
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