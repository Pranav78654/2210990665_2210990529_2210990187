const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');
const pdfService = require('../services/pdfService');

const prisma = new PrismaClient();

const calculateMilkValues = (quantity, fat, clr, rate) => {
    const quantityDec = new Decimal(quantity || 0);
    const fatDec = new Decimal(fat || 0);
    const clrDec = clr ? new Decimal(clr) : new Decimal(0);
    const usedRate = rate ? new Decimal(rate) : new Decimal(10);

    let fatKg = fatDec.mul(quantityDec).div(1000).toDecimalPlaces(3);
    let snfVal = new Decimal(0);
    let snfKg = new Decimal(0);
    let amount = new Decimal(0);

    // CLR > 0 Logic
    if (clrDec.greaterThan(0)) {
        snfVal = clrDec.mul(25).plus(14).plus(fatDec).plus(fatDec).floor();

        const rawFat = quantityDec.mul(fatDec);
        const rawSnf = quantityDec.mul(snfVal).div(10);

        fatKg = rawFat.div(1000).toDecimalPlaces(3);
        snfKg = rawSnf.div(1000).toDecimalPlaces(3);

        const gheeRate = usedRate.mul(6).div(65).toDecimalPlaces(2);
        const snfRate = usedRate.mul(4).div(85).toDecimalPlaces(2);

        const gheeAmount = rawFat.mul(gheeRate).floor().div(1000).floor();
        const snfAmount = rawSnf.mul(snfRate).floor().div(1000).floor();

        amount = gheeAmount.plus(snfAmount);
    } 
    // CLR = 0 Logic
    else {
        snfKg = fatKg.mul(8.5).div(6.5).toDecimalPlaces(3);
        amount = quantityDec.mul(fatDec.div(10)).mul(usedRate).floor();
        snfVal = new Decimal(0);
    }

    return { quantityDec, fatDec, clrDec, usedRate, snfVal, fatKg, snfKg, amount };
};

const addSaleRecord = async (req, res) => {
    try {
        const {
            purchaserName,
            quantity,
            fat,
            clr,
            rate,
            date,
            shift,
            customerId,
            paymentStatus
        } = req.body;

        const quantityDec = new Decimal(quantity || 0);
        const fatDec = new Decimal(fat || 0);
        const clrDec = clr ? new Decimal(clr) : new Decimal(0);
        const usedRate = rate ? new Decimal(rate) : new Decimal(10);

   
        let fatKg = fatDec.mul(quantityDec).div(1000).toDecimalPlaces(3);

        let snfVal = new Decimal(0);
        let snfKg = new Decimal(0);
        let amount = new Decimal(0);

       
        if (clrDec.greaterThan(0)) {

           
            snfVal = clrDec
                .mul(25)
                .plus(14)
                .plus(fatDec)
                .plus(fatDec)
                .floor(); 

           
            const rawFat = quantityDec.mul(fatDec);
            const rawSnf = quantityDec.mul(snfVal).div(10);

           
            fatKg = rawFat.div(1000).toDecimalPlaces(3);
            snfKg = rawSnf.div(1000).toDecimalPlaces(3);

            
            const gheeRate = usedRate.mul(6).div(65).toDecimalPlaces(2);
            const snfRate  = usedRate.mul(4).div(85).toDecimalPlaces(2);

          
            const gheeAmount = rawFat
                .mul(gheeRate)
                .floor()
                .div(1000)
                .floor();

            const snfAmount = rawSnf
                .mul(snfRate)
                .floor()
                .div(1000)
                .floor();

            amount = gheeAmount.plus(snfAmount);
        }

       
        else {
            snfKg = fatKg.mul(8.5).div(6.5).toDecimalPlaces(3);

            amount = quantityDec
                .mul(fatDec.div(10))
                .mul(usedRate)
                .floor();

            snfVal = new Decimal(0);
        }

        const record = await prisma.milkSaleRecord.create({
            data: {
                purchaserName: purchaserName || "Cash",
                quantity: quantityDec,
                fat: fatDec,
                clr: clrDec,
                snf: snfVal,
                fatKg,
                snfKg,
                rate: usedRate,
                amount,
                date: new Date(date),
                shift,
                customerId: customerId || null,
                paymentStatus: paymentStatus || 'PAID',
            },
        });

        res.status(201).json({
            message: 'Sale record added successfully',
            record
        });

    } catch (error) {
        console.error("ADD SALE RECORD ERROR:", error);
        res.status(500).json({
            message: 'Error adding sale record',
            error: error.message
        });
    }
};


const updateSaleRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            purchaserName,
            quantity,
            fat,
            clr,
            rate,
            date,
            shift,
            customerId,
            paymentStatus
        } = req.body;

        const existingRecord = await prisma.milkSaleRecord.findUnique({
            where: { id },
        });

        if (!existingRecord) {
            return res.status(404).json({ message: 'Record not found' });
        }

        
        const quantityDec = quantity !== undefined
            ? new Decimal(quantity)
            : existingRecord.quantity;

        const fatDec = fat !== undefined
            ? new Decimal(fat)
            : existingRecord.fat;

        const clrDec = clr !== undefined
            ? new Decimal(clr)
            : existingRecord.clr;

        const usedRate = rate !== undefined && rate !== ''
            ? new Decimal(rate)
            : existingRecord.rate;

        
        let fatKg = fatDec
            .mul(quantityDec)
            .div(1000)
            .toDecimalPlaces(3);

        let snfVal = new Decimal(0);
        let snfKg = new Decimal(0);
        let amount = new Decimal(0);

       
        if (clrDec.greaterThan(0)) {

           
            snfVal = clrDec
                .mul(25)
                .plus(14)
                .plus(fatDec)
                .plus(fatDec)
                .floor(); // 799.5 → 799

           
            const rawFat = quantityDec.mul(fatDec);
            const rawSnf = quantityDec.mul(snfVal).div(10);

          
            fatKg = rawFat.div(1000).toDecimalPlaces(3);
            snfKg = rawSnf.div(1000).toDecimalPlaces(3);

            
            const gheeRate = usedRate.mul(6).div(65).toDecimalPlaces(2);
            const snfRate = usedRate.mul(4).div(85).toDecimalPlaces(2);

           
            const gheeAmount = rawFat
                .mul(gheeRate)
                .floor()
                .div(1000)
                .floor();

            const snfAmount = rawSnf
                .mul(snfRate)
                .floor()
                .div(1000)
                .floor();

          

            amount = gheeAmount.plus(snfAmount);

        }

        
        else {
            snfKg = fatKg
                .mul(8.5)
                .div(6.5)
                .toDecimalPlaces(3);

            snfVal = new Decimal(0);

            amount = quantityDec
                .mul(fatDec.div(10))
                .mul(usedRate)
                .floor();
        }

        const updatedRecord = await prisma.milkSaleRecord.update({
            where: { id },
            data: {
                purchaserName: purchaserName || existingRecord.purchaserName,
                quantity: quantityDec,
                fat: fatDec,
                clr: clrDec,
                snf: snfVal,
                fatKg,
                snfKg,
                rate: usedRate,
                amount,
                date: date ? new Date(date) : existingRecord.date,
                shift: shift || existingRecord.shift,
                customerId: customerId !== undefined
                    ? customerId
                    : existingRecord.customerId,
                paymentStatus: paymentStatus || existingRecord.paymentStatus,
            },
        });

        res.json({
            message: 'Sale record updated successfully',
            record: updatedRecord
        });

    } catch (error) {
        console.error("UPDATE SALE RECORD ERROR:", error);
        res.status(500).json({
            message: 'Error updating sale record',
            error: error.message
        });
    }
};


const deleteSaleRecord = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.milkSaleRecord.delete({
            where: { id },
        });
        res.json({ message: 'Sale record deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting sale record', error: error.message });
    }
};

const getAllSaleRecords = async (req, res) => {
    try {
        const { shift, startDate, endDate, purchaserName } = req.query;

        const where = {};

        if (shift && shift !== 'All') {
            where.shift = shift;
        }

        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                where.date.lte = new Date(endDate);
            }
        }

        if (purchaserName) {
            where.purchaserName = {
                contains: purchaserName,
                mode: 'insensitive',
            };
        }

        const records = await prisma.milkSaleRecord.findMany({
            where,
            orderBy: { date: 'desc' },
        });
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching sale records', error: error.message });
    }
};

const getSaleSummary = async (req, res) => {
    try {
        const { shift, startDate, endDate, purchaserName } = req.query;

        const where = {};
        if (shift && shift !== 'All') where.shift = shift;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }
        if (purchaserName) {
            where.purchaserName = { contains: purchaserName, mode: 'insensitive' };
        }

        const records = await prisma.milkSaleRecord.findMany({
            where,
            orderBy: { date: 'asc' },
        });

        // Calculate Totals
        const totals = records.reduce((acc, record) => {
            acc.quantity = acc.quantity.plus(record.quantity);
            acc.fatKg = acc.fatKg.plus(record.fatKg);
            acc.snfKg = acc.snfKg.plus(record.snfKg);
            acc.amount = acc.amount.plus(record.amount);
            return acc;
        }, {
            quantity: new Decimal(0),
            fatKg: new Decimal(0),
            snfKg: new Decimal(0),
            amount: new Decimal(0),
        });

        res.json({
            records,
            totals: {
                quantity: parseFloat(totals.quantity),
                fatKg: parseFloat(totals.fatKg),
                snfKg: parseFloat(totals.snfKg),
                amount: parseFloat(totals.amount),
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching sale summary', error: error.message });
    }
};

const generatePdf = async (req, res) => {
    try {
        const { shift, startDate, endDate, purchaserName } = req.query;

        const where = {};
        if (shift && shift !== 'All') where.shift = shift;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }
        if (purchaserName) {
            where.purchaserName = { contains: purchaserName, mode: 'insensitive' };
        }

        const records = await prisma.milkSaleRecord.findMany({
            where,
            orderBy: { date: 'asc' },
        });

        const totals = records.reduce((acc, record) => {
            acc.quantity += parseFloat(record.quantity);
            acc.fatKg += parseFloat(record.fatKg);
            acc.snfKg += parseFloat(record.snfKg);
            acc.amount += parseFloat(record.amount);
            return acc;
        }, { quantity: 0, fatKg: 0, snfKg: 0, amount: 0 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=milk-sales-bill.pdf');

        pdfService.generateSalePdf(records, totals, { shift, startDate, endDate, purchaserName }, res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
};

const bulkUpdateSaleRecords = async (req, res) => {
    try {
        const { ids, updates } = req.body; 

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No records selected for update." });
        }

       
        const recordsToUpdate = await prisma.milkSaleRecord.findMany({
            where: { id: { in: ids } }
        });

       
        const transactions = recordsToUpdate.map((record) => {
            
            
            const newRate = (updates.rate !== undefined && updates.rate !== '') ? updates.rate : record.rate;
            const newDate = updates.date ? new Date(updates.date) : record.date;
            const newShift = updates.shift ? updates.shift : record.shift;

           
            const calculated = calculateMilkValues(
                record.quantity, 
                record.fat,      
                record.clr,      
                newRate         
            );

          
            return prisma.milkSaleRecord.update({
                where: { id: record.id },
                data: {
                    date: newDate,
                    shift: newShift,
                    rate: calculated.usedRate,
                    
                    
                    amount: calculated.amount,
                    fatKg: calculated.fatKg,
                    snfKg: calculated.snfKg,
                    snf: calculated.snfVal,
                }
            });
        });

        await prisma.$transaction(transactions);

        res.json({ 
            message: `Successfully updated ${ids.length} records.`,
            count: ids.length 
        });

    } catch (error) {
        console.error("BULK UPDATE ERROR:", error);
        res.status(500).json({ message: "Error performing bulk update", error: error.message });
    }
};

const bulkDeleteSaleRecords = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No records selected for deletion." });
        }

        const result = await prisma.milkSaleRecord.deleteMany({
            where: {
                id: { in: ids }
            }
        });

        res.json({ 
            message: `Successfully deleted ${result.count} records.`,
            count: result.count 
        });

    } catch (error) {
        console.error("BULK DELETE ERROR:", error);
        res.status(500).json({ message: "Error deleting records", error: error.message });
    }
};
module.exports = {
    addSaleRecord,
    updateSaleRecord,
    deleteSaleRecord,
    getAllSaleRecords,
    getSaleSummary,
    generatePdf,
    bulkUpdateSaleRecords,
    bulkDeleteSaleRecords
};
