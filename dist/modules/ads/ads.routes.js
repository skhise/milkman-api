"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ads_controller_1 = require("./ads.controller");
const ads_upload_1 = require("./ads.upload");
const router = (0, express_1.Router)();
router.get('/', ads_controller_1.listAds); // List active ads (for public)
router.get('/all', ads_controller_1.listAllAds); // List all ads (for admin)
router.post('/upload', ads_upload_1.uploadAdImage); // Upload ad image
router.post('/', ads_controller_1.createAd);
router.put('/:adId', ads_controller_1.updateAd);
router.delete('/:adId', ads_controller_1.deleteAd);
router.post('/:adId/click', ads_controller_1.recordClick);
router.get('/:adId/stats', ads_controller_1.getAdStats);
exports.default = router;
//# sourceMappingURL=ads.routes.js.map