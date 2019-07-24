const express = require('express');
const router = express.Router();
const config = require('config');
const logger = require('../utils/logger').logger;

const _ = require('lodash');
// bnb configuration value
const BnbApiClient = require('@binance-chain/javascript-sdk');
let asset = config.get("bnbAsset");
let bnbRestApiUrl = config.get("bnbRestApiUrl");
let address = config.get('address')
let privateKey = config.get("privateKey");
let fee = config.get("bnbFee");
let bnbClient = new BnbApiClient(bnbRestApiUrl);

bnbClient.chooseNetwork(config.get("bnbNetwork")); // or this can be "mainnet"
bnbClient.setPrivateKey(privateKey);
bnbClient.initChain();

let checkBnbAddress = require('../utils/checkBnbAddress');

/**
 * bnb 주소 유효성 체크
 **/
router.get('/address/check/:address', function (req, res, next) {
	let checkAddress = req.params.address;
	logger.info("[Binance Address Validation Check] START -> check address is " + checkAddress);
	
	if (checkBnbAddress.isValidAddress(checkAddress)) {
		logger.info("[Binance Address Validation Check] Success");
		res.send({
			resultCode: "OK",
			message: "Valid Address."
		});
	}
	else {
		logger.info("[Binance Address Validation Check] Invalid Address -> " + checkAddress);
		res.send({
			resultCode: "FAIL",
			message: "Invalid Address."
		});
	}
});

/**
 *  BNB 지갑 주소 생성
 **/
router.get('/address/create', function (req, res, next) {

	logger.info("[Create Address] START");

	try {
		logger.info("[Create Address] END --> Create Address is " + address);
		res.send({
			resultCode: "OK",
			address: address,
			privateKey: privateKey,
			message: "Create Address Successfully"
		});
	} catch (error) {
		logger.error("[Create Address] ERROR : " + error);
		res.send({
			resultCode: "FAIL",
			message: "Fail Create Address"
		});
	}
});

/**
 *  바이낸스 코인 출금 지갑 발란스 조회 API
 **/
router.get('/address/balance',  function  (req, res, next) {
	logger.info("[Inquire Address Balance] START : address --> " + address);
	bnbClient.getBalance(address).then(info => {
													let result = _.filter(info, { 'symbol': asset });
													res.send({
														resultCode: "OK",
														amount: result[0].free,
														address: address
													});
									}).then(() => {
										logger.info("[Inquire Address Balance] END");
									}).catch((error) => {
															logger.error("[Inquire Address Balance] ERROR : " + error);
															res.send({
																	resultCode: "FAIL",
																	message: "error"
															});
									});
});

/**
 *  바이낸스 코인 출금
 **/
router.post('/withdraw', function (req, res, next) {
	let requestData = req.body;

	logger.info("[Withdraw Binance Coin] --> START");
    logger.info("[Withdraw Binance Coin] Request Data : " + JSON.stringify(requestData));

    let requestPrivateKey = requestData.privateKey;
    if(requestPrivateKey != privateKey) {
        res.send({
            resultCode: "FAIL",
            message: "not Match privateKey."
        });
        return;
    }
    // 보낼 주소와 메모 가져오기
    let toAddress = requestData.requestAddress;
    let memo = requestData.memo;
    let amount = requestData.amount;
    
    bnbClient.getAccount(address).then(info => {
        const sequence = info.result.sequence || 0 ;
        return bnbClient.transfer(address, toAddress, amount, asset, memo, sequence) ;
    }).then((result) => {
        if (result.status === 200) {
        	logger.info("[Withdraw Binance Coin] Transfer Result Data : " + JSON.stringify(result));
        	logger.info("[Withdraw Binance Coin] Success");
        	res.send({
                resultCode: "OK",
                txid: result.result[0].hash,
                transactionFee: 0
            });
        } else {
        	logger.info("[Withdraw Binance Coin] Fail");
        	res.send({
                resultCode: "OK",
                message: "Withdraw Fail"
            });
        }
    }).catch((error) => {
        logger.error(error);
        logger.info("[Withdraw Binance Coin] Fail");
        res.send({
            resultCode: "OK",
            message: "Withdraw Fail"
        });
    });

});

///**
// * 회사의 지갑에 남아있는 코인 전부를 입금 지갑으로 옮긴다.
// **/
//router.post('/gathering', function (req, res, next) {
//
//    logger.info("=======================================================================================");
//    logger.info("[바이낸스 코인 게더링] --> START");
//
//    let depositAddress = config.get("depositAddress");
//    let gatheringAddress = config.get("gatheringAddress");
//
//    let depositV;
//
//    bnbClient.getAccount(depositAddress).then(info => {
//        const result = _.filter(info.result.balances, { 'symbol': asset });
//        const sequence = info.result.sequence || 0 ;
//        depositV = result[0].free - fee;
//        return bnbClient.transfer(depositAddress, gatheringAddress, depositV, asset, "gathering", sequence)
//
//    }).then((result) => {
//        if (result.status === 200) {
//            quit(result)
//        } else {
//            fail(result);
//        }
//        logger.info("[바이낸스 코인 게더링] 종료");
//    }).catch(function (error) {
//        logger.error("[바이낸스 코인 게더링] ERROR --> error : " + error);
//        TelegramBotApi.sendErrorMessage(error);
//        res.send({
//            resultCode: "9999",
//            message: "error"
//        });
//    });
//
//    function quit(result) {
//
//        logger.info("[바이낸스 코인 게더링] Success --> message : " + JSON.stringify(result));
//
//        let dbInsertData = {
//            mb_no: 0,
//            account: 'BNB-WALLET',
//            server: 'BNB-WALLET',
//            txid: result.result[0].hash,
//            category: 'gathering',
//            address: gatheringAddress,
//            amount: depositV,
//            confirmations: 1,
//            reg_dt: new Date().toFormat('YYYY-MM-DD HH24:MI:SS'),
//            coin_flag: coin_flag
//        };
//
//        BlockTransactionsDao.insert(dbInsertData, function (error, row) {
//            if (error) {
//                logger.error("[바이낸스 코인 게더링] --> DB INSERT FAIL error  : " + error);
//                TelegramBotApi.sendErrorMessage(error);
//            } else {
//                logger.info("[바이낸스 코인 게더링] --> DB INSERT SUCCESS row : " + JSON.stringify(row));
//            }
//        });
//
//        BlockTransactionsDao.update({
//            coin_flag: coin_flag,
//            category: 'receive',
//            gathering_yn: 'N'
//        }, {gathering_yn: 'Y'}, function (error, row) {
//            if (error) {
//                logger.info("[바이낸스 코인 게더링] --> DB UPDATE FAIL error  : " + error);
//                TelegramBotApi.sendErrorMessage(error);
//            } else {
//                logger.info("[바이낸스 코인 게더링] --> DB UPDATE SUCCESS row  : " + JSON.stringify(row));
//            }
//        });
//
//        res.send({
//            resultCode: "0000",
//            message: "ok"
//        });
//    }
//
//    function fail(result) {
//        TelegramBotApi.sendErrorMessage(message);
//        logger.error("[바이낸스 코인 게더링] ERROR --> message : " + JSON.stringify(result));
//
//        res.send({
//            resultCode: "9999",
//            message: "error"
//        });
//    }
//
//});

module.exports = router;
