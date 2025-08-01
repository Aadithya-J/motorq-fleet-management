import { Router, Request, Response } from 'express';
import prisma from '../utils/prismaClient'

const router = Router();

router.post('/createFleet',async(req:Request,res:Response) => {
    const {name} = req.body;
    const OwnerId = Number(req.body.OwnerId);
    try {
        const fleet = await prisma.fleet.create({
            data : {
                OwnerId,
                name
            }
        })
        res.json(fleet);
    } catch (error){
        console.log(error);
        res.json(error);
    }
});

export default router;