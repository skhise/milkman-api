import { billingService } from './billing.service.js';

export const generateMonthlyBill = async (req, res, next) => {
  try {
    const bill = await billingService.generate(req.params.sellerId, req.params.customerId, req.query);
    res.json(bill);
  } catch (error) {
    next(error);
  }
};

export const issueBill = async (req, res, next) => {
  try {
    const bill = await billingService.issueBill(req.params.billId);
    res.json(bill);
  } catch (error) {
    next(error);
  }
};

export const generateAllBills = async (req, res, next) => {
  try {
    const result = await billingService.generateMonthlyBillsForSeller(
      req.params.sellerId,
      req.query.month,
      req.query.year,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateBill = async (req, res, next) => {
  try {
    const bill = await billingService.update(req.params.billId, req.body);
    res.json(bill);
  } catch (error) {
    next(error);
  }
};

export const sendReminder = async (req, res, next) => {
  try {
    await billingService.sendReminder(req.params.billId, req.body);
    res.json({ message: 'Reminder sent' });
  } catch (error) {
    next(error);
  }
};

export const markPaid = async (req, res, next) => {
  try {
    const payment = await billingService.markPaid(req.params.billId, req.body);
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

export const markUnpaid = async (req, res, next) => {
  try {
    const bill = await billingService.markUnpaid(req.params.billId);
    res.json(bill);
  } catch (error) {
    next(error);
  }
};

export const listBills = async (req, res, next) => {
  try {
    const bills = await billingService.listBills(req.params.sellerId, req.query);
    res.json(bills);
  } catch (error) {
    next(error);
  }
};

export const deleteBill = async (req, res, next) => {
  try {
    await billingService.deleteBill(req.params.billId);
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getBillDetails = async (req, res, next) => {
  try {
    const bill = await billingService.getBillWithItems(req.params.billId);
    res.json(bill);
  } catch (error) {
    next(error);
  }
};

export const downloadBillPdf = async (req, res, next) => {
  try {
    const { buffer, filename } = await billingService.generateInvoicePdf(req.params.billId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
