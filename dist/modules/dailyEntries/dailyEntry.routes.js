"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dailyEntry_controller_1 = require("./dailyEntry.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/:sellerId', dailyEntry_controller_1.listEntries);
router.post('/:sellerId', dailyEntry_controller_1.createEntry);
router.post('/:sellerId/generate', dailyEntry_controller_1.generateDailyEntries);
router.put('/:entryId', dailyEntry_controller_1.updateEntry);
router.delete('/:entryId', dailyEntry_controller_1.deleteEntry);
router.post('/:entryId/delivery', dailyEntry_controller_1.markDelivery);
exports.default = router;
//# sourceMappingURL=dailyEntry.routes.js.map