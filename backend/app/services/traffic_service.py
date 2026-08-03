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
