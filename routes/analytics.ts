import { Router, Request, Response } from 'express';
import prisma from '../utils/prismaClient'

const router = Router();


router.get('/getFleetAnalytics',async(req:Request,res: Response) => {
    const fleetId = Number(req.query.fleetid);
    try {
        const fleetData = await prisma.fleet.findUnique({
            where : {id:fleetId},
            select : {
                vehicles : {
                    select : {
                        telemtries : {
                            orderBy : {timestamp : 'desc'},
                            take: 1
                        },
                        vin : true
                    }
                }
            }
        })
        console.log(fleetData)

        let sumFuel = 0.00;
        let n = fleetData?.vehicles.length;
        let count = 0;
        let inactive = 0;
        let totalSpeedLimitAlert = 0;
        let totalLowFuelAlert = 0;
        if(n === undefined || fleetData?.vehicles === undefined){
            res.json([]);
        } else {
            // console.log("total length:"+n);
            const now = new Date();
            for(let i = 0;i < n;i++){
                // console.log("index:" +i);
                if(fleetData.vehicles[i].telemtries.length > 0){
                    sumFuel += fleetData.vehicles[i].telemtries[0].fuelPercentage;
                    const vnow = new Date(fleetData.vehicles[i].telemtries[0].timestamp);
                    const diff = now.getTime()-vnow.getTime();
                    const oneDay = 24 * 60 * 60 * 1000;
                    if(diff > oneDay){
                        inactive+=1;
                    }
                } else {
                    console.log("no telemetry")
                    count++;
                }

                let vehicleVin = fleetData.vehicles[i].vin;
                console.log(vehicleVin);
                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const alerts = await prisma.alert.findMany({
                    where: {
                        vehicleid: vehicleVin,
                        timestamp : {
                            gte: twentyFourHoursAgo
                        }
                    }
                });
                let speedLimitAlertCount = 0;
                let lowFuelAlertCount = 0;
                alerts.forEach((alert,index)=>{
                    if(alert.alert == "speed limit exceeded"){
                        speedLimitAlertCount++;
                    }
                    if(alert.alert == "low fuel"){
                        lowFuelAlertCount++;
                    }
                })
                totalSpeedLimitAlert+=speedLimitAlertCount;
                totalLowFuelAlert+=lowFuelAlertCount;
            }
            console.log(n);
            console.log(sumFuel);
            let avgFuel = sumFuel/(n-count);
            let active = n-inactive;


            res.json({
                avgFuel,
                active,
                inactive,
                totalLowFuelAlert,
                totalSpeedLimitAlert
            });
        }
    } catch (error){
        console.log(error);
        res.json(error);
    }
});

export default router;