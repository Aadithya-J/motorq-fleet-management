import { Router, Request, Response } from 'express';
import { Alert } from '../generated/prisma/client';
import prisma from '../utils/prismaClient';
import redisClient from '../utils/redisClient';

const router = Router();


router.get('/getFleetAnalytics',async(req:Request,res: Response) => {
    const fleetId = Number(req.query.fleetid);
    const cacheKey = `analytics:${fleetId}`;
    try {
        const cachedAnalytics = await redisClient.get(cacheKey);
        if (cachedAnalytics) {
            console.log("Cache hit");
            return res.json(JSON.parse(cachedAnalytics));
        }

        console.log("Cache miss");
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
                alerts.forEach((alert: Alert,index: number)=>{
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

            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const fleetDataEarliestIn24Hours = await prisma.fleet.findUnique({
                where : {id:fleetId},
                select : {
                    vehicles : {
                        select : {
                            telemtries : {
                                orderBy : {timestamp : 'asc'},
                                take: 1,
                                where : {
                                    timestamp : {
                                        gte : twentyFourHoursAgo
                                    }
                                }
                            },
                            vin : true,
                        },
                        orderBy : {
                            vin : 'asc'
                        }
                    }
                },
            });
            const fleetDataLatestIn24Hours = await prisma.fleet.findUnique({
                where : {id:fleetId},
                select : {
                    vehicles : {
                        select : {
                            telemtries : {
                                orderBy : {timestamp : 'desc'},
                                take: 1,
                                where : {
                                    timestamp : {
                                        gte : twentyFourHoursAgo
                                    }
                                }
                            },
                            vin : true,
                        },
                        orderBy : {
                            vin : 'asc'
                        }
                    }
                },
            })

            let totalDistanceTraveled = 0;
            for(let i = 0;i < n;i++){
                if(fleetDataEarliestIn24Hours?.vehicles[i].telemtries != undefined && fleetDataEarliestIn24Hours?.vehicles[i].telemtries.length > 0 && fleetDataLatestIn24Hours?.vehicles[i].telemtries != undefined && fleetDataLatestIn24Hours?.vehicles[i].telemtries.length > 0){
                    let distance = fleetDataEarliestIn24Hours?.vehicles[i].telemtries[0].odometerReading - fleetDataLatestIn24Hours?.vehicles[i].telemtries[0].odometerReading;
                    totalDistanceTraveled += distance;
                }
            }

            totalDistanceTraveled = totalDistanceTraveled*-1;

            const analyticsData = {
                avgFuel,
                active,
                inactive,
                totalLowFuelAlert,
                totalSpeedLimitAlert,
                totalDistanceTraveled
            };

            await redisClient.set(cacheKey, JSON.stringify(analyticsData), {
                EX: 600, // 10 minutes
            });

            res.json(analyticsData);
        }
    } catch (error){
        console.log(error);
        res.json(error);
    }
});

export default router;