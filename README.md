# BNB Wallet Node Version

## Prerequisites

### Configuration

```
$ npm i @binance-chain/javascript-sdk --no-optional
```

## BNB 지갑 만들기   

메인넷 거래소 지갑 주소를 생성하기 위한 방법이다.


https://www.binance.org/kr

사이트로 이동한다. 

지갑 만들기를 누르면 지갑 생성 가이드가 팝업으로 뜨게 되며 next를 누를때마다 스텝별로 가지고 있는 의미를 보여준다.


### 키 스토어 파일 + 비밀번호 생성

    - private key를 생성하는 mnemonic을 생성하기 위한 단계로 비밀번호를 생성하고 제약 조건 체크 박스에 체크한 이후 키 스토어 파일 다운로드를 누른다.
    - 다운로드된 키 스토어 파일은 프라이빗 키 생성에 필요한 정보들을 담고 있기 때문에 따로 보관한다. 그리고 계속 버튼을 누른다.
    - 누르며 니모닉 정보를 보여준다. 이것은 실제 프라이빗 키를 생성하는 정보들이기 때문에 복사해서 파일로 저장해 역시 따로 저장한다. 
    - 위 화면에서 니모닉 정보을 보여주는 하단 우측에 내 프라이빗 키 보기 버튼이 있다. 눌러서 당연히 프라이빗 키를 따로 저장한다.    
    - 다음을 누르게 되면 지금까지 보여준 정보 저장을 잘 했는지 묻는 팝업이 뜨고 예를 누르면 전 단계에서 받았던 니모닉 정보를 입력하는 부분이 나온다.
    - 정확하게 입력했다면 지갑 잠금 해제 화면이 뜨게 된다.
    - 어드레스를 확인하는 방식은 총 4 가지 방식이 있는데 그중 우리는  Trust Wallet, CoolWallet S라는 어플을 통해 스캔으로 어드레스를 바이낸스 블록체인에 임포트하는 방식과
       키 스토어 파일과 키 스토어 파일 생성시에 입력한 비번으로 올리는 방식으로 한다.
    - 어플보다는 키 스토어 파일 방식으로 한다.
    - 키 스토어 파일을 업로드 하고 이전에 입력했던 비번을 입력하고 지금 지갑 잠금 해제 버튼을 누른다. 
    - https://www.binance.org 페이지로 이동하게 되며 이때 상단 우측의 잔액 탭 옆의 유저 정보를 누르게 되면 지갑 주소가 생성된 것을 볼 수 있다.
    - 지갑 주소를 카피하면 지갑 생성 완료

이렇게 해서 거래소 대표 입금 주소와 게더링을 할 주소를 발급받고 application.yml에 설정을 하면 된다.

주소를 발급받을 때 단계별로 얻게 되는 모든 정보는 전부 보관을 해야 한다. <---- 가장 중요!!!!!!!!!!!!!!!!!!!!


테스트넷의 경우에는 다음 주소에서 생성한다.    

https://testnet.binance.org/kr    

테스트용 코인을 받기 위해서는 바이낸스 거래소에 계정이 있어야한다.    

로그인을 한 이후에 아래 주소로 이동한다.    

https://www.binance.vision/ko/tutorials/binance-dex-funding-your-testnet-account    

화면에 보이는 [테스트넷 수도꼭지]링크로 이동하면  주소를 입력하는 인풋창이 있다.

위에서 생성한 주소를 입력하면 해당 주소로 200BNB를 준다.   

테스트를 위해서는 3개 정도의 계정을 생성하고 테스트용 코인을 받자.