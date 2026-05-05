const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');
const pdfService = require('../services/pdfService');

const prisma = new PrismaClient();
const addRecord = async (req, res) => {
    try {
        console.log("────────── ADD RECORD START ──────────");
        console.log("RAW REQUEST BODY:", req.body);

        const {
            supplierId,
            quantity,
            fat,
            clr,
            date,
            shift,
            rate
        } = req.body;

        const supplier = await prisma.milkSupplier.findUnique({
            where: { id: supplierId }
        });

        console.log("SUPPLIER:", supplier);

        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }

      
        const quantityDec = new Decimal(quantity || 0);
        const fatDec = new Decimal(fat || 0);
        const clrDec = new Decimal(clr || 0);

        console.log("DECIMALS:", {
            quantityDec: quantityDec.toString(),
            fatDec: fatDec.toString(),
            clrDec: clrDec.toString()
        });

        const usedRate = rate
            ? new Decimal(rate)
            : new Decimal(supplier.rate || 0);

        console.log("USED RATE:", usedRate.toString());

        let fatKg = new Decimal(0);
        let snfKg = new Decimal(0);
        let amount = new Decimal(0);
        let snfVal = new Decimal(0);

      
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
            console.log("PATH: CLR = 0");

            fatKg = quantityDec.mul(fatDec).div(1000).toDecimalPlaces(3);
            snfKg = fatKg.mul(8.5).div(6.5).toDecimalPlaces(3);
            snfVal = new Decimal(0);

            amount = quantityDec
                .mul(fatDec.div(10))
                .mul(usedRate)
                .floor();

            console.log("FINAL AMOUNT (CLR = 0):", amount.toString());
        }

        console.log("SAVING RECORD:", {
            supplierId,
            quantity: quantityDec.toString(),
            fat: fatDec.toString(),
            clr: clrDec.toString(),
            snf: snfVal.toString(),
            fatKg: fatKg.toString(),
            snfKg: snfKg.toString(),
            rate: usedRate.toString(),
            amount: amount.toString(),
            date,
            shift
        });

        const record = await prisma.milkRecord.create({
            data: {
                supplierId,
                quantity: quantityDec,
                fat: fatDec,
                clr: clrDec,
                snf: snfVal,
                fatKg,
                snfKg,
                rate: usedRate,
                amount,
                date: new Date(date),
                shift
            }
        });

        console.log("────────── ADD RECORD END ──────────");

        return res.status(201).json({
            message: "Record added successfully",
            record
        });

    } catch (error) {
        console.error("ADD RECORD ERROR:", error);
        return res.status(500).json({
            message: "Error adding record",
            error: error.message
        });
    }
};


const updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("────────── UPDATE RECORD START ──────────");
        console.log("RAW REQUEST BODY:", req.body);

        const {
            quantity,
            fat,
            clr,
            date,
            shift,
            rate
        } = req.body;

        const existingRecord = await prisma.milkRecord.findUnique({
            where: { id },
            include: { supplier: true }
        });

        if (!existingRecord) {
            return res.status(404).json({ message: "Record not found" });
        }

        const supplier = existingRecord.supplier;

        
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
            : (existingRecord.rate ?? supplier.rate);

        console.log("DECIMALS:", {
            quantityDec: quantityDec.toString(),
            fatDec: fatDec.toString(),
            clrDec: clrDec.toString(),
            usedRate: usedRate.toString()
        });

        let fatKg = new Decimal(0);
        let snfKg = new Decimal(0);
        let amount = new Decimal(0);
        let snfVal = new Decimal(0);

        
        if (clrDec.greaterThan(0)) {
            console.log("PATH: CLR > 0");

           
            snfVal = clrDec
                .mul(25)
                .plus(14)
                .plus(fatDec)
                .plus(fatDec)
                .floor(); 

            console.log("CALCULATED SNF:", snfVal.toString());

           
            const rawFat = quantityDec.mul(fatDec);
            const rawSnf = quantityDec.mul(snfVal).div(10);

            console.log("RAW VALUES:", {
                rawFat: rawFat.toString(),
                rawSnf: rawSnf.toString()
            });

           
            fatKg = rawFat.div(1000).toDecimalPlaces(3);
            snfKg = rawSnf.div(1000).toDecimalPlaces(3);

            console.log("STORED KG VALUES:", {
                fatKg: fatKg.toString(),
                snfKg: snfKg.toString()
            });

            
            const gheeRate = usedRate.mul(6).div(65).toDecimalPlaces(2);
            const snfRate  = usedRate.mul(4).div(85).toDecimalPlaces(2);

            console.log("RATES:", {
                gheeRate: gheeRate.toString(),
                snfRate: snfRate.toString()
            });

           
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

            console.log("AMOUNT PARTS:", {
                gheeAmount: gheeAmount.toString(),
                snfAmount: snfAmount.toString()
            });

            amount = gheeAmount.plus(snfAmount);

            console.log("FINAL AMOUNT (CLR > 0):", amount.toString());
        }

       
        else {
            console.log("PATH: CLR = 0");

            fatKg = quantityDec.mul(fatDec).div(1000).toDecimalPlaces(3);
            snfKg = fatKg.mul(8.5).div(6.5).toDecimalPlaces(3);
            snfVal = new Decimal(0);

            amount = quantityDec
                .mul(fatDec.div(10))
                .mul(usedRate)
                .floor();

            console.log("FINAL AMOUNT (CLR = 0):", amount.toString());
        }

        console.log("UPDATING RECORD:", {
            quantity: quantityDec.toString(),
            fat: fatDec.toString(),
            clr: clrDec.toString(),
            snf: snfVal.toString(),
            fatKg: fatKg.toString(),
            snfKg: snfKg.toString(),
            rate: usedRate.toString(),
            amount: amount.toString(),
            date,
            shift
        });

        const updatedRecord = await prisma.milkRecord.update({
            where: { id },
            data: {
                quantity: quantityDec,
                fat: fatDec,
                clr: clrDec,
                snf: snfVal,
                fatKg,
                snfKg,
                rate: usedRate,
                amount,
                date: date ? new Date(date) : existingRecord.date,
                shift: shift || existingRecord.shift
            }
        });

        console.log("────────── UPDATE RECORD END ──────────");

        res.json({
            message: "Record updated successfully",
            record: updatedRecord
        });

    } catch (error) {
        console.error("UPDATE RECORD ERROR:", error);
        res.status(500).json({
            message: "Error updating record",
            error: error.message
        });
    }
};


const deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.milkRecord.delete({
            where: { id },
        });
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting record', error: error.message });
    }
};

const getAllRecords = async (req, res) => {
    try {
        const { shift, startDate, endDate, supplierName } = req.query;

        const where = {};

        if (shift) {
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

        if (supplierName) {
            where.supplier = {
                name: {
                    contains: supplierName,
                    mode: 'insensitive',
                },
            };
        }

        const records = await prisma.milkRecord.findMany({
            where,
            include: {
                supplier: {
                    select: { name: true, rate: true },
                },
            },
            orderBy: { date: 'desc' },
        });
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching records', error: error.message });
    }
};



const getRecordsSummary = async (req, res) => {
    try {
        const { shift, startDate, endDate, supplierName } = req.query;
        const where = buildWhereClause({ shift, startDate, endDate, supplierName });

        const records = await prisma.milkRecord.findMany({
            where,
            include: {
                supplier: {
                    select: { name: true, rate: true },
                },
            },
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
        res.status(500).json({ message: 'Error fetching summary', error: error.message });
    }
};

const generatePdf = async (req, res) => {
    try {
        const { shift, startDate, endDate, supplierName } = req.query;
        const where = buildWhereClause({ shift, startDate, endDate, supplierName });

        const records = await prisma.milkRecord.findMany({
            where,
            include: {
                supplier: {
                    select: { name: true, rate: true },
                },
            },
            orderBy: { date: 'asc' },
        });

        const totals = records.reduce((acc, record) => {
            acc.quantity += parseFloat(record.quantity);
            acc.fatKg += parseFloat(record.fatKg);
            acc.snfKg += parseFloat(record.snfKg);
            acc.amount += parseFloat(record.amount);
            return acc;
        }, { quantity: 0, fatKg: 0, snfKg: 0, amount: 0 });

        // Stream PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=milk-records-bill.pdf');

        pdfService.generateBillPdf(records, totals, { shift, startDate, endDate, supplierName }, res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
};

const buildWhereClause = ({ shift, startDate, endDate, supplierName }) => {
    const where = {};
    if (shift && shift !== 'All') {
        where.shift = shift;
    }
    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }
    if (supplierName) {
        where.supplier = {
            name: {
                contains: supplierName,
                mode: 'insensitive',
            },
        };
    }
    return where;
};
const bulkUpdateRecords = async (req, res) => {
    try {
        const { ids, updates } = req.body;
    

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No records selected" });
        }

        console.log("────────── BULK UPDATE START ──────────");
        console.log(`Updating ${ids.length} records with:`, updates);

        
        const results = await prisma.$transaction(async (tx) => {
            const updatePromises = ids.map(async (id) => {
              
                const currentRecord = await tx.milkRecord.findUnique({
                    where: { id },
                    include: { supplier: true } 
                });

                if (!currentRecord) return null; 

                
                const newDate = updates.date ? new Date(updates.date) : currentRecord.date;
                const newShift = updates.shift || currentRecord.shift;
                
               
                let newRateDec = currentRecord.rate;
                let shouldRecalculateAmount = false;

                if (updates.rate !== undefined && updates.rate !== '') {
                    newRateDec = new Decimal(updates.rate);
                    shouldRecalculateAmount = true;
                }

               
                let newAmount = currentRecord.amount;

                if (shouldRecalculateAmount) {
                    const quantityDec = currentRecord.quantity;
                    const fatDec = currentRecord.fat;
                    const clrDec = currentRecord.clr;
                    
                    
                    let snfVal = currentRecord.snf; 
                    let rawFat, rawSnf, gheeAmount, snfAmount;

                    if (clrDec.greaterThan(0)) {
                        
                         snfVal = clrDec.mul(25).plus(14).plus(fatDec).plus(fatDec).floor();
                         rawFat = quantityDec.mul(fatDec);
                         rawSnf = quantityDec.mul(snfVal).div(10);

                        const gheeRate = newRateDec.mul(6).div(65).toDecimalPlaces(2);
                        const snfRate = newRateDec.mul(4).div(85).toDecimalPlaces(2);

                        gheeAmount = rawFat.mul(gheeRate).floor().div(1000).floor();
                        snfAmount = rawSnf.mul(snfRate).floor().div(1000).floor();
                        
                        newAmount = gheeAmount.plus(snfAmount);
                    } else {
                        
                        newAmount = quantityDec.mul(fatDec.div(10)).mul(newRateDec).floor();
                    }
                }

               
                return tx.milkRecord.update({
                    where: { id },
                    data: {
                        date: newDate,
                        shift: newShift,
                        rate: newRateDec,
                        amount: newAmount
                    }
                });
            });

            return Promise.all(updatePromises);
        });

        console.log("────────── BULK UPDATE END ──────────");
        res.json({ message: "Bulk update successful", count: results.length });

    } catch (error) {
        console.error("BULK UPDATE ERROR:", error);
        res.status(500).json({ message: "Error performing bulk update", error: error.message });
    }
};
const bulkDeleteRecords = async (req, res) => {
    try {
        const { ids } = req.body;


        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No records selected for deletion" });
        }

        console.log(`────────── BULK DELETE START (${ids.length} records) ──────────`);

       
        const result = await prisma.milkRecord.deleteMany({
            where: {
                id: { in: ids }
            }
        });

        console.log(`Deleted ${result.count} records.`);
        console.log("────────── BULK DELETE END ──────────");

        res.json({ 
            message: `Successfully deleted ${result.count} records`,
            count: result.count 
        });

    } catch (error) {
        console.error("BULK DELETE ERROR:", error);
        res.status(500).json({ message: "Error deleting records", error: error.message });
    }
};
module.exports = {
    addRecord,
    updateRecord,
    deleteRecord,
    getAllRecords,
    getRecordsSummary,
    generatePdf,
    bulkUpdateRecords,
    bulkDeleteRecords
};