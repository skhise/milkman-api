"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ads_controller_1 = require("./ads.controller");
const router = (0, express_1.Router)();
router.get('/', ads_controller_1.listAds);
router.post('/', ads_controller_1.createAd);
router.put('/:adId', ads_controller_1.updateAd);
router.post('/:adId/click', ads_controller_1.recordClick);
router.get('/:adId/stats', ads_controller_1.getAdStats);
exports.default = router;
//# sourceMappingURL=ads.routes.js.map