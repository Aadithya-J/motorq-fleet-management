import { Router, Request, Response } from 'express';
import prisma from '../utils/prismaClient'

const router = Router();

router.post('/createOwner',async(req:Request,res:Response) => {
    const name = req.body.name;
    try {
        const owner = await prisma.owner.create({
            data : {
                name
            }
        })
        res.json(owner);
    } catch(error){
        console.log(error);
        res.json(error);
    }
});

export default router;