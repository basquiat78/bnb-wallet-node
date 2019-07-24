const bech32 = require('bech32');
const config = require('config');
/**
 * bnb address validation
 *
 * bech32로 디코딩시에 다음과 같이 나와야 한다.
 *
 * e.g testnet -> tbnb
 *     mainnet -> bnb
 *
 * {prefix : "bnb", words : [2, 3, 5 ...........]}
 *
 * 디코딩이후 prefix가 tbnb, 또는 bnb가 아니라면 해당 주소는 유효하지 않다.
 *
 */
exports.isValidAddress = function(address) {
	try {
		let prefix = config.get("bnbPrefix");
        let decodedAddress = bech32.decode(address);
   
        if(decodedAddress.prefix == prefix) {
        	return true;
        } else {
        	return false; // prefix가 맞지 않다면 이것도 false 반환
        }
    } catch (err) {
    	// 에러 발생하면 false반환
		return false;
	}

};