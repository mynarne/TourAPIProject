from copy import deepcopy


SUPPORTED_TRAFFIC_LANGUAGES = {'kor', 'eng', 'jpn', 'chs', 'cht'}

DEFAULT_CENTER = {'latitude': 37.2664, 'longitude': 127.0002}

DESTINATIONS = [
    {
        'id': 'suwon_station',
        'coordinates': {'latitude': 37.2664, 'longitude': 127.0002},
        'name': {'kor': '수원역', 'eng': 'Suwon Station', 'jpn': '水原駅', 'chs': '水原站', 'cht': '水原站'},
        'description': {'kor': '지하철 1호선·KTX 환승 거점', 'eng': 'Line 1 and KTX transport hub', 'jpn': '地下鉄1号線・KTXの乗換拠点', 'chs': '1号线及KTX换乘中心', 'cht': '1號線及KTX轉乘中心'},
    },
    {
        'id': 'haenggung',
        'coordinates': {'latitude': 37.2823, 'longitude': 127.0141},
        'name': {'kor': '화성행궁', 'eng': 'Hwaseong Haenggung', 'jpn': '華城行宮', 'chs': '华城行宫', 'cht': '華城行宮'},
        'description': {'kor': '행리단길과 수원화성 주변', 'eng': 'Near Haengnidan-gil and Hwaseong Fortress', 'jpn': 'ヘンリダンギル・水原華城周辺', 'chs': '行李坛路及水原华城周边', 'cht': '行李壇路及水原華城周邊'},
    },
    {
        'id': 'starfield',
        'coordinates': {'latitude': 37.2858, 'longitude': 126.9897},
        'name': {'kor': '스타필드 수원', 'eng': 'Starfield Suwon', 'jpn': 'スターフィールド水原', 'chs': '水原星聚汇', 'cht': '水原星聚匯'},
        'description': {'kor': '수원 화서역 인근 복합 쇼핑몰', 'eng': 'Shopping mall near Hwaseo Station', 'jpn': '華西駅近くの複合ショッピングモール', 'chs': '华西站附近的综合购物中心', 'cht': '華西站附近的綜合購物中心'},
    },
    {
        'id': 'gwanggyo',
        'coordinates': {'latitude': 37.2818, 'longitude': 127.0658},
        'name': {'kor': '광교호수공원', 'eng': 'Gwanggyo Lake Park', 'jpn': '光教湖水公園', 'chs': '光教湖水公园', 'cht': '光教湖水公園'},
        'description': {'kor': '신분당선 광교중앙역 인근', 'eng': 'Near Gwanggyo Jungang Station', 'jpn': '光教中央駅近く', 'chs': '光教中央站附近', 'cht': '光教中央站附近'},
    },
    {
        'id': 'banghwasuryu',
        'coordinates': {'latitude': 37.2874, 'longitude': 127.0187},
        'name': {'kor': '방화수류정', 'eng': 'Banghwasuryujeong Pavilion', 'jpn': '訪花随柳亭', 'chs': '访花随柳亭', 'cht': '訪花隨柳亭'},
        'description': {'kor': '용연과 함께 즐기는 수원화성 명소', 'eng': 'A Hwaseong Fortress landmark by Yongyeon Pond', 'jpn': '龍淵と水原華城を楽しめる名所', 'chs': '可欣赏龙渊与水原华城的景点', 'cht': '可欣賞龍淵與水原華城的景點'},
    },
    {
        'id': 'yeonmudae',
        'coordinates': {'latitude': 37.2872, 'longitude': 127.0234},
        'name': {'kor': '연무대', 'eng': 'Yeonmudae', 'jpn': '練武台', 'chs': '练武台', 'cht': '練武台'},
        'description': {'kor': '국궁 체험과 플라잉수원 주변', 'eng': 'Near archery experiences and Flying Suwon', 'jpn': '国弓体験とフライング水原周辺', 'chs': '国弓体验及Flying Suwon附近', 'cht': '國弓體驗及Flying Suwon附近'},
    },
    {
        'id': 'paldal_market',
        'coordinates': {'latitude': 37.2778, 'longitude': 127.0175},
        'name': {'kor': '팔달문 시장', 'eng': 'Paldalmun Market', 'jpn': '八達門市場', 'chs': '八达门市场', 'cht': '八達門市場'},
        'description': {'kor': '통닭거리와 전통시장 먹거리', 'eng': 'Traditional market and chicken street', 'jpn': 'チキン通りと伝統市場グルメ', 'chs': '炸鸡街及传统市场美食', 'cht': '炸雞街及傳統市場美食'},
    },
    {
        'id': 'wolhwawon',
        'coordinates': {'latitude': 37.2618, 'longitude': 127.0319},
        'name': {'kor': '효원공원 월화원', 'eng': 'Wolhwawon Garden', 'jpn': '孝園公園・粤華苑', 'chs': '孝园公园粤华苑', 'cht': '孝園公園粵華苑'},
        'description': {'kor': '전통 정원과 나무 그늘을 즐기는 산책 명소', 'eng': 'A peaceful garden for a shaded walk', 'jpn': '伝統庭園と木陰の散策スポット', 'chs': '适合欣赏传统园林和树荫散步的景点', 'cht': '適合欣賞傳統庭園與樹蔭散步的景點'},
    },
]

GUIDES = {
    'cards': {
        'title': {'kor': '외국인 교통카드 안내', 'eng': 'Transit Card Guide', 'jpn': '外国人向け交通カード案内', 'chs': '外国游客交通卡指南', 'cht': '外國旅客交通卡指南'},
        'items': [
            {'title': {'kor': 'WOWPASS', 'eng': 'WOWPASS', 'jpn': 'WOWPASS', 'chs': 'WOWPASS', 'cht': 'WOWPASS'}, 'description': {'kor': '외화 현금으로 원화 충전 후 결제와 T-money 교통 기능을 함께 사용할 수 있습니다.', 'eng': 'Top up with foreign cash and use payment plus T-money transit functions.', 'jpn': '外貨現金をチャージし、決済とT-money交通機能を利用できます。', 'chs': '可用外币现金充值，同时使用支付和T-money交通功能。', 'cht': '可用外幣現金儲值，同時使用支付與T-money交通功能。'}},
            {'title': {'kor': 'NAMANE', 'eng': 'NAMANE', 'jpn': 'NAMANE', 'chs': 'NAMANE', 'cht': 'NAMANE'}, 'description': {'kor': '카드 디자인을 선택하고 결제 잔액과 교통 잔액을 나누어 관리할 수 있습니다.', 'eng': 'Choose a card design and manage payment and transit balances separately.', 'jpn': 'カードデザインを選び、決済残高と交通残高を分けて管理できます。', 'chs': '可选择卡片设计，并分别管理支付余额和交通余额。', 'cht': '可選擇卡片設計，並分別管理支付餘額與交通餘額。'}},
        ],
    },
    'locations': {
        'title': {'kor': '주요 교통카드 발급처', 'eng': 'Key Card Locations', 'jpn': '主なカード発行場所', 'chs': '主要发卡地点', 'cht': '主要發卡地點'},
        'items': [
            {'title': {'kor': '수원역', 'eng': 'Suwon Station', 'jpn': '水原駅', 'chs': '水原站', 'cht': '水原站'}, 'description': {'kor': '1호선 지하 대합실 고객센터와 4번 출구 방향을 확인하세요.', 'eng': 'Check the subway customer office and the area toward Exit 4.', 'jpn': '1号線地下コンコースの案内所と4番出口方面を確認してください。', 'chs': '请查看1号线地下大厅客服中心及4号出口方向。', 'cht': '請查看1號線地下大廳客服中心及4號出口方向。'}},
            {'title': {'kor': '인천공항', 'eng': 'Incheon Airport', 'jpn': '仁川空港', 'chs': '仁川机场', 'cht': '仁川機場'}, 'description': {'kor': '공항철도 교통센터와 입국장 여행자 안내소 주변을 확인하세요.', 'eng': 'Check the Airport Railroad transit center and arrival travel centers.', 'jpn': '空港鉄道交通センターと到着ロビーの案内所周辺を確認してください。', 'chs': '请查看机场铁路交通中心及入境大厅旅游服务中心附近。', 'cht': '請查看機場鐵路交通中心及入境大廳旅客服務中心附近。'}},
            {'title': {'kor': '서울역', 'eng': 'Seoul Station', 'jpn': 'ソウル駅', 'chs': '首尔站', 'cht': '首爾站'}, 'description': {'kor': '공항철도 도심공항터미널과 종합안내소 주변을 확인하세요.', 'eng': 'Check the Airport Railroad city terminal and information desk.', 'jpn': '空港鉄道都心空港ターミナルと案内所周辺を確認してください。', 'chs': '请查看机场铁路城市航站楼及综合服务台附近。', 'cht': '請查看機場鐵路城市航站樓及綜合服務台附近。'}},
        ],
    },
    'tips': {
        'title': {'kor': '외국인 여행자 대중교통 팁', 'eng': 'Transit Tips for Travelers', 'jpn': '旅行者向け公共交通のヒント', 'chs': '外国游客公共交通提示', 'cht': '外國旅客公共交通提示'},
        'items': [
            {'title': {'kor': 'T-money 충전', 'eng': 'T-money top-up', 'jpn': 'T-moneyのチャージ', 'chs': 'T-money充值', 'cht': 'T-money儲值'}, 'description': {'kor': '편의점이나 지하철역 충전기에서 현금으로 충전하고 승하차 때 단말기에 태그하세요.', 'eng': 'Top up with cash at convenience stores or subway machines and tap when boarding and exiting.', 'jpn': 'コンビニや地下鉄駅の機械で現金をチャージし、乗降時にタッチしてください。', 'chs': '可在便利店或地铁站机器使用现金充值，乘车和下车时刷卡。', 'cht': '可在便利商店或地鐵站機器使用現金儲值，乘車和下車時刷卡。'}},
            {'title': {'kor': '일회용 지하철 카드', 'eng': 'Single-use subway ticket', 'jpn': '使い捨て地下鉄カード', 'chs': '一次性地铁卡', 'cht': '一次性地鐵卡'}, 'description': {'kor': '운임과 보증금 500원을 현금으로 결제하고 도착 후 환급기에 카드를 넣어 보증금을 돌려받습니다.', 'eng': 'Pay the fare and a 500 KRW deposit in cash, then return the card for a refund.', 'jpn': '運賃と保証金500ウォンを現金で支払い、到着後に返却して保証金を受け取ります。', 'chs': '用现金支付车费和500韩元押金，到站后在退卡机退还押金。', 'cht': '用現金支付車費和500韓元押金，到站後在退卡機退還押金。'}},
            {'title': {'kor': '택시 호출', 'eng': 'Taxi apps', 'jpn': 'タクシーアプリ', 'chs': '出租车应用', 'cht': '計程車應用'}, 'description': {'kor': 'Kakao T 또는 Uber를 이용하면 목적지를 미리 입력하고 결제 방법을 확인할 수 있습니다.', 'eng': 'Use Kakao T or Uber to set the destination in advance and check payment options.', 'jpn': 'Kakao TまたはUberで目的地を先に設定し、決済方法を確認できます。', 'chs': '可使用Kakao T或Uber提前输入目的地并确认支付方式。', 'cht': '可使用Kakao T或Uber提前輸入目的地並確認支付方式。'}},
        ],
    },
    'arrival': {
        'title': {'kor': '수원 도착과 주요 이동 방법', 'eng': 'Getting to and around Suwon', 'jpn': '水原へのアクセスと市内移動', 'chs': '前往水原及市内交通', 'cht': '前往水原及市內交通'},
        'items': [
            {'title': {'kor': '인천공항에서 수원역으로', 'eng': 'Incheon Airport to Suwon Station', 'jpn': '仁川空港から水原駅へ', 'chs': '从仁川机场前往水原站', 'cht': '從仁川機場前往水原站'}, 'description': {'kor': '공항철도 또는 공항버스로 서울 도심에 이동한 뒤 1호선·KTX·광역버스를 이용해 수원으로 이동할 수 있습니다. 짐이 많다면 공항버스 노선과 도착 터미널을 먼저 확인하고, 길찾기에서 현재 위치와 수원역을 입력하세요.', 'eng': 'Travel from the airport to central Seoul by Airport Railroad or airport bus, then continue to Suwon by Line 1, KTX, or an express bus. If you have heavy luggage, check the bus route and terminal first, then set your current location and Suwon Station in Naver Map.', 'jpn': '空港鉄道または空港リムジンバスでソウル中心部へ移動し、1号線・KTX・広域バスで水原へ向かえます。荷物が多い場合はバスの路線とターミナルを確認し、Naverマップで現在地と水原駅を検索してください。', 'chs': '可先乘机场铁路或机场大巴前往首尔市中心，再换乘1号线、KTX或城际巴士前往水原。行李较多时请先确认巴士路线和航站楼，并在Naver地图中输入当前位置和水原站。', 'cht': '可先搭乘機場鐵路或機場巴士前往首爾市中心，再轉乘1號線、KTX或廣域巴士前往水原。行李較多時請先確認巴士路線和航廈，並在Naver地圖中輸入目前位置與水原站。'}},
            {'title': {'kor': '서울역에서 수원으로', 'eng': 'Seoul Station to Suwon', 'jpn': 'ソウル駅から水原へ', 'chs': '从首尔站前往水原', 'cht': '從首爾站前往水原'}, 'description': {'kor': '서울역에서 1호선 병점·천안 방면 열차를 타고 수원역에서 내리세요. KTX를 이용하면 더 빠르게 이동할 수 있지만, 목적지에 따라 일반 1호선이나 광역버스가 더 편리할 수 있으므로 출발 전 소요시간과 환승 횟수를 비교하세요.', 'eng': 'Take a Line 1 train toward Byeongjeom or Cheonan from Seoul Station and get off at Suwon Station. KTX is faster, while Line 1 or an express bus may be more convenient depending on your destination. Compare travel time and transfers before leaving.', 'jpn': 'ソウル駅から1号線の餅店・天安方面行きに乗り、水原駅で降ります。KTXは速いですが、目的地によっては1号線や広域バスの方が便利な場合もあるため、所要時間と乗換回数を確認してください。', 'chs': '从首尔站乘坐1号线病店或天安方向列车，在水原站下车。KTX速度更快，但根据目的地，1号线或城际巴士可能更方便，请出发前比较时间和换乘次数。', 'cht': '從首爾站搭乘1號線餅店或天安方向列車，在水原站下車。KTX速度較快，但依目的地不同，1號線或廣域巴士可能更方便，出發前請比較時間與轉乘次數。'}},
            {'title': {'kor': '수원역에서 주요 관광지로', 'eng': 'From Suwon Station to attractions', 'jpn': '水原駅から主要観光地へ', 'chs': '从水原站前往主要景点', 'cht': '從水原站前往主要景點'}, 'description': {'kor': '수원화성·화성행궁은 버스나 택시로 이동할 수 있고, 행리단길과 팔달문 시장은 화성행궁 주변에서 함께 둘러보기 좋습니다. 광교호수공원은 신분당선 광교중앙역 또는 버스를 이용하고, 최종 도보 경로는 Naver Map으로 확인하세요.', 'eng': 'Reach Hwaseong Fortress and Haenggung Palace by bus or taxi, then explore Haengnidan-gil and Paldalmun Market on foot nearby. Use Gwanggyo Jungang Station on the Shinbundang Line or a bus for Gwanggyo Lake Park, and check the final walking route in Naver Map.', 'jpn': '水原華城・華城行宮へはバスまたはタクシーで移動でき、周辺のヘンリダンギルと八達門市場も徒歩で楽しめます。光教湖水公園へは新盆唐線の光教中央駅またはバスを利用し、最後の徒歩ルートはNaverマップで確認してください。', 'chs': '可乘巴士或出租车前往水原华城和华城行宫，再步行游览附近的行李坛路和八达门市场。前往光教湖水公园可乘新盆唐线到光教中央站或乘巴士，最后的步行路线请用Naver地图确认。', 'cht': '可搭乘巴士或計程車前往水原華城與華城行宮，再步行遊覽附近的行李壇路與八達門市場。前往光教湖水公園可搭乘新盆唐線至光教中央站或搭巴士，最後的步行路線請用Naver地圖確認。'}},
        ],
    },
    'card_details': {
        'title': {'kor': '교통카드 발급·충전·환불 안내', 'eng': 'Transit card issue, top-up and refund', 'jpn': '交通カードの発行・チャージ・払い戻し', 'chs': '交通卡购买、充值与退款', 'cht': '交通卡購買、加值與退款'},
        'items': [
            {'title': {'kor': 'T-money 구매와 충전', 'eng': 'Buying and topping up T-money', 'jpn': 'T-moneyの購入とチャージ', 'chs': '购买及充值T-money', 'cht': '購買及加值T-money'}, 'description': {'kor': '편의점이나 지하철역에서 T-money 카드를 구입하고, 충전 가능한 편의점 또는 지하철 충전기에서 원화 현금으로 충전하세요. 버스와 지하철을 탈 때와 내릴 때 단말기에 태그하며, 잔액이 부족하면 환승이 적용되지 않을 수 있습니다.', 'eng': 'Buy a T-money card at a convenience store or subway station and top it up with Korean cash at a participating store or subway machine. Tap when boarding and exiting buses or trains; an insufficient balance may prevent transfer discounts.', 'jpn': 'T-moneyカードはコンビニや地下鉄駅で購入し、対応するコンビニまたは駅の機械でウォン現金をチャージします。バスや地下鉄の乗車時と降車時にタッチし、残高不足の場合は乗換割引が適用されないことがあります。', 'chs': '可在便利店或地铁站购买T-money卡，并在支持充值的便利店或地铁机器上使用韩元现金充值。乘坐公交和地铁时上下车都要刷卡，余额不足可能无法享受换乘优惠。', 'cht': '可在便利商店或地鐵站購買T-money卡，並在支援加值的便利商店或地鐵機器使用韓元現金加值。搭乘公車與地鐵時上下車都要刷卡，餘額不足可能無法享有轉乘優惠。'}},
            {'title': {'kor': 'WOWPASS 발급 순서', 'eng': 'WOWPASS issuance steps', 'jpn': 'WOWPASSの発行手順', 'chs': 'WOWPASS发卡步骤', 'cht': 'WOWPASS發卡步驟'}, 'description': {'kor': '키오스크에서 여권을 스캔하고 달러·엔·위안 등 외화 현금을 투입한 뒤 원화 충전 금액을 확인하고 카드를 수령합니다. 결제 잔액과 T-money 교통 잔액은 별도로 관리되므로 교통 기능은 지하철 충전기나 편의점에서 원화로 따로 충전해야 합니다.', 'eng': 'Scan your passport at a kiosk, insert foreign cash such as USD, JPY or CNY, confirm the KRW amount and collect the card. The payment balance and T-money transit balance are separate, so top up the transit balance separately with KRW at a subway machine or convenience store.', 'jpn': 'キオスクでパスポートをスキャンし、ドル・円・人民元などの外貨を投入してウォンのチャージ額を確認し、カードを受け取ります。決済残高とT-money交通残高は別管理のため、交通機能は駅の機械やコンビニでウォンを別途チャージします。', 'chs': '在自助机扫描护照，投入美元、日元或人民币等外币现金，确认韩元充值金额后取卡。支付余额与T-money交通余额分开管理，交通余额需要在地铁机器或便利店使用韩元单独充值。', 'cht': '在自助機掃描護照，投入美元、日圓或人民幣等外幣現金，確認韓元加值金額後取卡。支付餘額與T-money交通餘額分開管理，交通餘額需在地鐵機器或便利商店使用韓元另外加值。'}},
            {'title': {'kor': 'NAMANE 발급과 잔액 관리', 'eng': 'NAMANE issuance and balances', 'jpn': 'NAMANEの発行と残高管理', 'chs': 'NAMANE发卡与余额管理', 'cht': 'NAMANE發卡與餘額管理'}, 'description': {'kor': 'NAMANE 앱 또는 키오스크에서 카드 디자인을 선택하고, 필요하면 사진을 카드 앞면에 인쇄할 수 있습니다. 결제 잔액과 교통 잔액을 나누어 관리하므로 사용 목적에 맞는 잔액을 선택해 충전하세요.', 'eng': 'Choose a card design in the NAMANE app or at a kiosk, and print a photo on the front if available. Payment and transit balances are managed separately, so top up the balance that matches how you plan to use the card.', 'jpn': 'NAMANEアプリまたはキオスクでカードデザインを選び、対応していれば写真を表面に印刷できます。決済残高と交通残高は別管理なので、用途に合う残高を選んでチャージしてください。', 'chs': '可在NAMANE应用或自助机选择卡片设计，支持时还可将照片印在卡片正面。支付余额与交通余额分开管理，请根据用途选择相应余额充值。', 'cht': '可在NAMANE應用或自助機選擇卡片設計，支援時還可將照片印在卡片正面。支付餘額與交通餘額分開管理，請依用途選擇相應餘額加值。'}},
            {'title': {'kor': '일회용 지하철 카드 환급', 'eng': 'Single-use subway card refund', 'jpn': '使い捨て地下鉄カードの払い戻し', 'chs': '一次性地铁卡退款', 'cht': '一次性地鐵卡退款'}, 'description': {'kor': '역의 일회용 카드 발급·충전기에서 언어를 선택하고 목적지와 인원수를 입력합니다. 운임과 보증금 500원을 원화 현금으로 결제한 뒤, 목적지 개찰구를 나와 환급기에 카드를 넣으면 보증금을 돌려받습니다.', 'eng': 'Select a language on the station ticket machine, enter your destination and passenger count, then pay the fare plus a 500 KRW deposit in cash. After leaving through the destination gates, insert the card into a refund machine to receive the deposit back.', 'jpn': '駅の発売・チャージ機で言語を選び、目的地と人数を入力します。運賃と保証金500ウォンを現金で支払い、到着駅の改札を出た後に返却機へカードを入れると保証金が戻ります。', 'chs': '在车站售票充值机选择语言，输入目的地和人数，用韩元现金支付车费及500韩元押金。到达后出闸，将卡放入退卡机即可退回押金。', 'cht': '在車站售票加值機選擇語言，輸入目的地與人數，以韓元現金支付車費及500韓元押金。抵達後出閘，將卡放入退卡機即可退回押金。'}},
        ],
    },
    'traveler_guides': {
        'title': {'kor': '외국인 여행자 필수 교통·안전 안내', 'eng': 'Essential transit and safety guides', 'jpn': '旅行者向け交通・安全ガイド', 'chs': '外国游客交通与安全指南', 'cht': '外國旅客交通與安全指南'},
        'items': [
            {'title': {'kor': 'Naver Map을 이용하세요', 'eng': 'Use Naver Map for navigation', 'jpn': 'Naver Mapを利用しましょう', 'chs': '建议使用Naver地图', 'cht': '建議使用Naver地圖'}, 'description': {'kor': '한국에서는 도보와 대중교통 경로가 Naver Map에 더 자세하게 표시됩니다. 영어·중국어·일본어 지도를 지원하며, 앱이 없어도 모바일 웹으로 목적지와 환승 정보를 확인할 수 있습니다.', 'eng': 'Naver Map generally provides more detailed walking and transit routes in Korea. It supports English, Chinese and Japanese, and the mobile web version can be used without the app.', 'jpn': '韓国では徒歩と公共交通のルートがNaver Mapに詳しく表示されます。英語・中国語・日本語に対応し、アプリがなくてもモバイルWebで目的地と乗換情報を確認できます。', 'chs': '在韩国，Naver地图通常能提供更详细的步行及公共交通路线。支持英语、中文和日语，即使没有安装应用也可使用移动网页查询目的地和换乘信息。', 'cht': '在韓國，Naver地圖通常能提供更詳細的步行與大眾運輸路線。支援英語、中文與日語，即使未安裝應用程式也可使用行動網頁查詢目的地與轉乘資訊。'}},
            {'title': {'kor': '택시 호출과 요금 확인', 'eng': 'Taxi apps and fare checks', 'jpn': 'タクシー配車と料金確認', 'chs': '叫车应用与费用确认', 'cht': '叫車應用與費用確認'}, 'description': {'kor': 'Kakao T나 Uber(UT)에 목적지를 미리 입력하면 언어 소통을 줄이고 결제 방법을 확인할 수 있습니다. 택시 탑승 시 미터기 작동을 확인하고, 부당한 요금이 의심되면 영수증과 차량 번호를 보관하세요.', 'eng': 'Set your destination in Kakao T or Uber (UT) before calling a taxi to reduce language barriers and check payment options. Confirm that the meter is running and keep the receipt and plate number if you suspect an unfair charge.', 'jpn': 'Kakao TやUber（UT）で目的地を先に入力すると、言葉の壁を減らして決済方法も確認できます。乗車時はメーターを確認し、不当な料金が疑われる場合は領収書と車両番号を保管してください。', 'chs': '在Kakao T或Uber（UT）中提前输入目的地，可减少沟通障碍并确认支付方式。乘车时请确认计价器运行，如怀疑收费不当，请保留收据和车牌号。', 'cht': '在Kakao T或Uber（UT）中提前輸入目的地，可減少溝通障礙並確認付款方式。搭車時請確認計程表運作，如懷疑收費不當，請保留收據與車牌號碼。'}},
            {'title': {'kor': '긴급 연락과 관광 불편 신고', 'eng': 'Emergency and tourist assistance', 'jpn': '緊急連絡と観光相談', 'chs': '紧急电话与旅游投诉', 'cht': '緊急電話與旅遊申訴'}, 'description': {'kor': '경찰은 112, 화재·구급은 119, 관광 통역과 불편 신고는 1330입니다. 문제가 생기면 위치·영수증·택시 번호를 기록해 두고, 필요한 경우 다국어 통역을 요청하세요.', 'eng': 'Call 112 for police, 119 for fire or ambulance, and 1330 for tourist information and complaints. Record your location, receipt and taxi plate number and request interpretation when needed.', 'jpn': '警察は112、火災・救急は119、観光通訳と相談は1330です。問題が起きたら場所・領収書・タクシー番号を記録し、必要に応じて多言語通訳を依頼してください。', 'chs': '警察请拨112，火灾和急救请拨119，旅游咨询及投诉请拨1330。遇到问题时请记录位置、收据和车牌号，必要时请求多语种翻译。', 'cht': '警察請撥112，火災與急救請撥119，旅遊諮詢與申訴請撥1330。遇到問題時請記錄位置、收據與車牌號碼，必要時請求多語翻譯。'}},
            {'title': {'kor': '기후동행카드 사용 범위 확인', 'eng': 'Check Climate Card coverage', 'jpn': '気候同行カードの利用範囲', 'chs': '确认气候同行卡适用范围', 'cht': '確認氣候同行卡適用範圍'}, 'description': {'kor': '기후동행카드는 서울 시내 중심의 교통 패스이므로 수원과 서울 외곽 이동에서는 적용 범위와 추가 요금을 확인하세요. 여행 구간이 수원을 포함한다면 T-money 일반 교통카드가 더 단순할 수 있습니다.', 'eng': 'The Climate Card mainly covers Seoul services. Check coverage and possible extra fares when travelling to Suwon or outside Seoul. A regular T-money card may be simpler for trips that include Suwon.', 'jpn': '気候同行カードは主にソウル市内の交通パスです。水原やソウル市外へ移動する場合は対象範囲と追加料金を確認してください。水原を含む旅行では通常のT-moneyカードの方が簡単な場合があります。', 'chs': '气候同行卡主要适用于首尔市内交通。前往水原或首尔市外时，请确认适用范围和可能产生的额外费用。包含水原的行程使用普通T-money卡可能更方便。', 'cht': '氣候同行卡主要適用於首爾市內交通。前往水原或首爾市外時，請確認適用範圍與可能產生的額外費用。包含水原的行程使用一般T-money卡可能更方便。'}},
            {'title': {'kor': '공공 와이파이 이용', 'eng': 'Using public Wi-Fi', 'jpn': '公衆Wi-Fiの利用', 'chs': '使用公共Wi-Fi', 'cht': '使用公共Wi-Fi'}, 'description': {'kor': '관광지·지하철역·공공시설의 무료 Wi-Fi를 이용할 때는 공식 네트워크 이름을 확인하세요. 금융 결제나 비밀번호 입력은 보안이 확인된 통신망에서 진행하고, 이용 후에는 자동 연결을 해제하는 것이 안전합니다.', 'eng': 'When using free Wi-Fi at attractions, subway stations or public facilities, confirm the official network name. Use a trusted connection for payments or passwords and disable automatic connection afterward.', 'jpn': '観光地・地下鉄駅・公共施設の無料Wi-Fiを利用する際は、公式ネットワーク名を確認してください。決済やパスワード入力は安全な通信環境で行い、利用後は自動接続を解除すると安心です。', 'chs': '使用景点、地铁站和公共设施的免费Wi-Fi时，请确认官方网络名称。支付或输入密码时请使用可信网络，使用后关闭自动连接更安全。', 'cht': '使用景點、地鐵站與公共設施的免費Wi-Fi時，請確認官方網路名稱。付款或輸入密碼時請使用可信任的網路，使用後關閉自動連線更安全。'}},
            {'title': {'kor': '요금 확인과 부당 청구 대응', 'eng': 'Checking fares and handling unfair charges', 'jpn': '料金確認と不当請求への対応', 'chs': '确认费用与应对不当收费', 'cht': '確認費用與應對不當收費'}, 'description': {'kor': '택시·관광 상품·식당을 이용하기 전에 예상 요금과 결제 금액을 확인하세요. 부당한 요금이나 분쟁이 생기면 영수증, 결제 내역, 차량 번호와 시간을 보관하고 관광 통역·불편 신고 1330 또는 긴급 상황 112에 문의하세요.', 'eng': 'Check the expected fare and final amount before using a taxi, tour service or restaurant. If an unfair charge or dispute occurs, keep the receipt, payment record, plate number and time, then contact 1330 for tourist assistance or 112 in an emergency.', 'jpn': 'タクシー・観光商品・飲食店を利用する前に、目安の料金と支払額を確認してください。不当な請求やトラブルがあれば、領収書・決済履歴・車両番号・時間を保管し、観光相談は1330、緊急時は112へ連絡してください。', 'chs': '使用出租车、旅游产品或餐厅服务前，请确认预计费用和最终金额。如遇不当收费或纠纷，请保留收据、支付记录、车牌号和时间，并联系1330旅游咨询，紧急情况拨打112。', 'cht': '使用計程車、旅遊商品或餐廳服務前，請確認預估費用與最終金額。如遇不當收費或糾紛，請保留收據、付款紀錄、車牌號碼與時間，並聯絡1330旅遊諮詢，緊急情況撥打112。'}},
        ],
    },
}


class TrafficService:
    """수원 교통 안내용 정적 데이터와 목적지 정보를 제공합니다."""

    def get_traffic_data(self, language='kor'):
        if language not in SUPPORTED_TRAFFIC_LANGUAGES:
            raise ValueError('지원하지 않는 언어입니다.')

        def localized(value):
            if isinstance(value, dict):
                return value.get(language) or value.get('kor', '')
            return value

        destinations = []
        for item in DESTINATIONS:
            destinations.append({
                'id': item['id'],
                'name': localized(item['name']),
                'description': localized(item['description']),
                'latitude': item['coordinates']['latitude'],
                'longitude': item['coordinates']['longitude'],
            })

        guides = {}
        for key, guide in deepcopy(GUIDES).items():
            guides[key] = {
                'title': localized(guide['title']),
                'items': [
                    {'title': localized(item['title']), 'description': localized(item['description'])}
                    for item in guide['items']
                ],
            }

        return {'center': DEFAULT_CENTER, 'destinations': destinations, 'guides': guides}
