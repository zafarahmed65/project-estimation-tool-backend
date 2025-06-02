// routes/dropdownOptions.js

import express from 'express';
import DropdownOptions from '../models/DropdownOptions.js';

const router = express.Router();


// GET dropdown options
router.get('/', async (req, res, next) => {
    try {
        const options = await DropdownOptions.findOne().sort({ createdAt: -1 });

        if (!options) {
            const defaultOptions = new DropdownOptions();
            await defaultOptions.save();
            return res.status(200).json(defaultOptions);
        }

        res.status(200).json(options);
    } catch (error) {
        next(error);
    }
});


// UPDATE dropdown options
router.put('/', async (req, res, next) => {
    try {
        const { capability, pillar, executiveSponsor } = req.body;

        const latestOptions = await DropdownOptions.findOne().sort({ createdAt: -1 });

        if (!latestOptions) {
            const newOptions = new DropdownOptions({ capability, pillar, executiveSponsor });
            await newOptions.save();
            return res.status(200).json(newOptions);
        }

        latestOptions.capability = capability;
        latestOptions.pillar = pillar;
        latestOptions.executiveSponsor = executiveSponsor;
        await latestOptions.save();

        res.status(200).json(latestOptions);
    } catch (error) {
        next(error);
    }
});


export default router;
