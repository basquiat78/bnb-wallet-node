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

module.exports = router;
