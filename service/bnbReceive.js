const config = require('config');
const logger = require('../utils/logger').logger;//로깅

let axios = require('axios');
let bnbWssUrl = config.get("bnbWssUrl");
let bnbRestApiUrl = config.get("bnbRestApiUrl");
let address = config.get("address");

const WebSocket = require('ws');
const httpClient = axios.create({ baseURL: bnbRestApiUrl });

/**
 * websocket connection
 * @returns
 */
function connectingWebSocket(){
	
	// address로 들어오는 트랜잭션을 읽기 위한 설정
	let ws = new WebSocket(bnbWssUrl + address);

    // Websocket 연결
	ws.on('open', (error) => {
    	// 에러 발생시 5초후에 다시 연결 시도 
		if(error) {
            setInterval(function(){
            	connectingWebSocket();
            },5000);
            return;
        } else {
            logger.info('connected Binance Node WebSocket');
            logger.info("[Binance Node Listner Registration] -->  address : " + address);
            // 토픽은 해당 주소로 입출금이 발생하는 transfers 이벤트 발생시 구독을 요청한다.
            ws.send(JSON.stringify( {method: "subscribe", topic: "transfers", address: address } ));
        }
    });

	// WebSocket close
    ws.on('close', (error) => {
        if(error) {
            setInterval(function(){
            	connectingWebSocket();
            },5000);
            return;
        }
    });

    ws.on('message', (data) => {
        data = JSON.parse(data);
        logger.info("data : " + JSON.stringify( data ));
        logger.info("[Binance Node Listner Event] -->  address : " + address);
        if(data.error) {
        	logger.info(data.error);
    	// 밑에 이 조건은 해당 주소로 transaction이 In인 경우이다. 즉 이 주소로 코인이 들어왔을 경우에만 조건을 타게 한다.
        // 애초에 이것은 이 주소로 입금된 경우만 체크할 예정이기 때문이다.	
        } else if(data.stream === "transfers" && data.data.t[0].o === address ) {
        	let txHash = data.data.H;
        	let getURL = `${bnbRestApiUrl}/api/v1/tx/${txHash}?format=json`;
            setTimeout(function(){
                httpClient.get(getURL).then((res) => {
                    doEvent(res.data);
                })
            },5000);
        }
    });
}

/**
 * transaction 정보 로그 찍기
 * @param transaction
 * @returns
 */
function doEvent(transaction) {
    logger.info("Transaction Data : " + JSON.stringify(transaction));
    logger.info("Memo 정보 : " + transaction.tx.value.memo);
}

connectingWebSocket();
