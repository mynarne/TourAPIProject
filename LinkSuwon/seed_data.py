# LinkSuwon API 장애 대응용 로컬 백업 데이터 (Seed Data)

# 각 명소의 기본 정보 및 언어별 매핑 (8개 관광 명소)
SEED_PLACES = {
    'kor': [
        {
            'contentid': '126227',
            'title': '방화수류정 (동북각루)',
            'addr1': '경기도 수원시 팔달구 수원천로392번길 44-6',
            'firstimage': '/static/images/banghwasuryujeong.jpg',
            'mapx': '127.017778',
            'mapy': '37.287222',
            'overview': '수원화성에서 가장 아름다운 장소로 꼽히며, 절벽 아래 연못인 용연과의 조화가 매우 뛰어납니다. 밤에는 야경 명소로 큰 인기를 끌고 있습니다.',
            'pronunciation': ''
        },
        {
            'contentid': '126228',
            'title': '화성행궁',
            'addr1': '경기도 수원시 팔달구 행궁로 11',
            'firstimage': '/static/images/hwaseong_haenggung.jpg',
            'mapx': '127.013611',
            'mapy': '37.282778',
            'overview': '정조대왕이 현륭원에 능행차를 올 때 머물던 임시 궁궐로, 한국 행궁 중 가장 규모가 크고 아름답습니다. 대장금 등 다양한 드라마의 촬영지로도 유명합니다.',
            'pronunciation': ''
        },
        {
            'contentid': '126229',
            'title': '창룡문',
            'addr1': '경기도 수원시 팔달구 경수대로 697',
            'firstimage': '',
            'mapx': '127.025278',
            'mapy': '37.287222',
            'overview': '수원화성의 동문으로, 동쪽으로 넓은 잔디밭이 펼쳐져 있어 헬륨기구 체험(플라잉수원)과 연날리기를 즐기기에 최적의 장소입니다.',
            'pronunciation': ''
        },
        {
            'contentid': '126230',
            'title': '장안문',
            'addr1': '경기도 수원시 팔달구 정조로 910',
            'firstimage': '',
            'mapx': '127.013889',
            'mapy': '37.289444',
            'overview': '수원화성의 북문이자 정문으로, 서울에서 내려오는 왕을 맞이하던 문입니다. 옹성과 적대를 갖추어 군사적 방어력을 극대화한 독특한 구조를 가집니다.',
            'pronunciation': ''
        },
        {
            'contentid': '126231',
            'title': '팔달문',
            'addr1': '경기도 수원시 팔달구 정조로 780',
            'firstimage': '',
            'mapx': '127.016944',
            'mapy': '37.277222',
            'overview': '수원화성의 남문으로, 성곽과 떨어져 도심 한가운데 섬처럼 보존되어 있습니다. 주변으로 역사 깊은 남문시장과 지동시장 등 전통시장이 형성되어 있습니다.',
            'pronunciation': ''
        },
        {
            'contentid': '126232',
            'title': '연무대 (동장대)',
            'addr1': '경기도 수원시 팔달구 창룡대로103번길 8',
            'firstimage': '',
            'mapx': '127.023333',
            'mapy': '37.286944',
            'overview': '군사들이 무예를 훈련하던 장소로, 탁 트인 시야를 자랑합니다. 현재는 국궁 체험을 할 수 있는 관광 명소로 운영되고 있습니다.',
            'pronunciation': ''
        },
        {
            'contentid': '126233',
            'title': '수원화성박물관',
            'addr1': '경기도 수원시 팔달구 창룡대로 21',
            'firstimage': '',
            'mapx': '127.019444',
            'mapy': '37.282778',
            'overview': '세계문화유산 수원화성의 독창성과 역사성을 보여주는 전문 박물관으로, 화성 축성 과정과 정조대왕의 사상 및 군사 개혁 등을 전시하고 있습니다.',
            'pronunciation': ''
        },
        {
            'contentid': '126234',
            'title': '서장대',
            'addr1': '경기도 수원시 팔달구 행궁로 11-1',
            'firstimage': '',
            'mapx': '127.008889',
            'mapy': '37.283889',
            'overview': '팔달산 정상에 위치하여 수원 시내와 화성 전체를 한눈에 내려다볼 수 있는 군사 지휘소입니다. 일몰과 야경이 특히 아름다운 장소입니다.',
            'pronunciation': ''
        },
        {
            'contentid': '900001',
            'title': '머니박스 환전소 수원역점',
            'addr1': '경기도 수원시 팔달구 매산로 6',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0016',
            'mapy': '37.2657',
            'overview': '수원역 인근에 위치한 사설 환전소입니다. 은행보다 높은 환율 우대율을 제공하며, 평일 및 주말/공휴일 늦은 시간까지 운영하여 외국인 관광객이 편리하게 이용할 수 있습니다.',
            'pronunciation': ''
        },
        {
            'contentid': '900002',
            'title': '하나은행 수원지점 (수수료 면제 ATM)',
            'addr1': '경기도 수원시 팔달구 덕영대로 905',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0002',
            'mapy': '37.2664',
            'overview': '수원역 8번 출구 앞 하나은행 내부에 위치한 ATM 기기입니다. 외국인 관광객들이 대중적으로 사용하는 트래블로그(TravelLog) 및 트래블월렛(TravelWallet) 카드로 원화를 인출할 시 인출 수수료가 전액 면제됩니다.',
            'pronunciation': ''
        },
        {
            'contentid': '900003',
            'title': '세븐일레븐 수원행궁점 (롯데 글로벌 ATM)',
            'addr1': '경기도 수원시 팔달구 신풍로23번길 4',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0135',
            'mapy': '37.2831',
            'overview': '수원화성 행궁 광장 인근 세븐일레븐 편의점 내부에 비치된 롯데 글로벌 ATM입니다. 트래블월렛(TravelWallet) 카드로 한화 현금을 인출할 때 수수료 혜택을 적용받을 수 있어 유용합니다.',
            'pronunciation': ''
        }
    ],
    'eng': [
        {
            'contentid': '126227',
            'title': 'Banghwasuryujeong (Dongbukgarlu)',
            'addr1': '44-6, Suwoncheon-ro 392beon-gil, Paldal-gu, Suwon-si, Gyeonggi-do',
            'firstimage': '/static/images/banghwasuryujeong.jpg',
            'mapx': '127.017778',
            'mapy': '37.287222',
            'overview': 'One of the most scenic spots of Hwaseong Fortress. It harmonizes beautifully with Yongyeon Pond below the cliff. A popular night view attraction.',
            'pronunciation': 'Pronounce: Bang-hwa-su-ryu-jeong'
        },
        {
            'contentid': '126228',
            'title': 'Hwaseong Haenggung Palace',
            'addr1': '11, Haenggung-ro, Paldal-gu, Suwon-si, Gyeonggi-do',
            'firstimage': '/static/images/hwaseong_haenggung.jpg',
            'mapx': '127.013611',
            'mapy': '37.282778',
            'overview': 'A temporary palace where King Jeongjo stayed during his royal processions. It is the largest and most beautiful haenggung in Korea, and a popular filming site.',
            'pronunciation': 'Pronounce: Hwa-seong Haeng-gung'
        },
        {
            'contentid': '126229',
            'title': 'Changnyongmun Gate',
            'addr1': '697, Gyeongsu-daero, Paldal-gu, Suwon-si, Gyeonggi-do',
            'firstimage': '',
            'mapx': '127.025278',
            'mapy': '37.287222',
            'overview': 'The eastern gate of Hwaseong Fortress. It features a wide grassy field, making it the best spot for flying kites and experiencing the helium balloon (Flying Suwon).',
            'pronunciation': 'Pronounce: Chang-nyong-mun'
        },
        {
            'contentid': '126230',
            'title': 'Janganmun Gate',
            'addr1': '910, Jeongjo-ro, Paldal-gu, Suwon-si, Gyeonggi-do',
            'firstimage': '',
            'mapx': '127.013889',
            'mapy': '37.289444',
            'overview': 'The northern and main gate of Hwaseong Fortress, serving to welcome kings coming from Seoul. It has a unique semi-circular defensive wall called Ongseong.',
            'pronunciation': 'Pronounce: Jan-gan-mun'
        },
        {
            'contentid': '126231',
            'title': 'Paldalmun Gate',
            'addr1': '780, Jeongjo-ro, Paldal-gu, Suwon-si, Gyeonggi-do',
            'firstimage': '',
            'mapx': '127.016944',
            'mapy': '37.277222',
            'overview': 'The southern gate of Hwaseong Fortress, standing like an island in the middle of a bustling commercial district, surrounded by traditional markets.',
            'pronunciation': 'Pronounce: Pal-dal-mun'
        },
        {
            'contentid': '126232',
            'title': 'Yeonmudae (Dongjangdae)',
            'addr1': '8, Changnyong-daero 103beon-gil, Paldal-gu, Suwon-si, Gyeonggi-do',
            'firstimage': '',
            'mapx': '127.023333',
            'mapy': '37.286944',
            'overview': 'A military training ground offering open views. Today, it serves as a popular tourist spot where visitors can experience traditional Korean archery.',
            'pronunciation': 'Pronounce: Yeon-mu-dae'
        },
        {
            'contentid': '126233',
            'title': 'Suwon Hwaseong Museum',
            'addr1': '21, Changnyong-daero, Paldal-gu, Suwon-si, Gyeonggi-do',
            'firstimage': '',
            'mapx': '127.019444',
            'mapy': '37.282778',
            'overview': 'A specialized museum showcasing the history and construction of the UNESCO World Heritage Hwaseong Fortress and King Jeongjo\'s military reforms.',
            'pronunciation': 'Pronounce: Su-won Hwa-seong Museum'
        },
        {
            'contentid': '126234',
            'title': 'Seojangdae (Western Command Post)',
            'addr1': '11-1, Haenggung-ro, Paldal-gu, Suwon-si, Gyeonggi-do',
            'firstimage': '',
            'mapx': '127.008889',
            'mapy': '37.283889',
            'overview': 'Located at the peak of Paldal Mountain, this command post offers a panoramic view of Suwon city and the entire fortress. Highly recommended for sunset views.',
            'pronunciation': 'Pronounce: Seo-jang-dae'
        },
        {
            'contentid': '900001',
            'title': 'Moneybox Currency Exchange (Suwon Station)',
            'addr1': '6, Maesan-ro, Paldal-gu, Suwon-si, Gyeonggi-do',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0016',
            'mapy': '37.2657',
            'overview': 'A private currency exchange office located near Suwon Station. It offers better exchange rates than traditional banks and operates late into the night, even on weekends and holidays.',
            'pronunciation': ''
        },
        {
            'contentid': '900002',
            'title': 'Hana Bank Suwon (Fee-Free ATM)',
            'addr1': '905, Deogyeong-daero, Paldal-gu, Suwon-si, Gyeonggi-do',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0002',
            'mapy': '37.2664',
            'overview': 'Located inside Hana Bank right outside Suwon Station Exit 8. Withdrawal fees are fully waived when pulling KRW cash using TravelLog or TravelWallet cards.',
            'pronunciation': ''
        },
        {
            'contentid': '900003',
            'title': 'Seven-Eleven Haenggung (Lotte Global ATM)',
            'addr1': '4, Sinpung-ro 23beon-gil, Paldal-gu, Suwon-si, Gyeonggi-do',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0135',
            'mapy': '37.2831',
            'overview': 'A Lotte Global ATM inside the Seven-Eleven convenience store near Hwaseong Haenggung. It provides fee-free KRW withdrawals for TravelWallet card users.',
            'pronunciation': ''
        }
    ],
    'jpn': [
        {
            'contentid': '126227',
            'title': '訪華随柳亭 (東北閣楼)',
            'addr1': '京畿道 水原市 八達区 水原川路392番ギル 44-6',
            'firstimage': '/static/images/banghwasuryujeong.jpg',
            'mapx': '127.017778',
            'mapy': '37.287222',
            'overview': '水原華城で最も美しい場所とされ、崖の下にある池「龍池」との調和が素晴らしいです。夜には美しい夜景スポットとして人気です。',
            'pronunciation': '読み方: パンファスリュジョン'
        },
        {
            'contentid': '126228',
            'title': '華城行宮',
            'addr1': '京畿道 水原市 八達区 行宮路 11',
            'firstimage': '/static/images/hwaseong_haenggung.jpg',
            'mapx': '127.013611',
            'mapy': '37.282778',
            'overview': '正祖大王が父親の陵墓を参拝する際に滞在した臨時の宮殿で、韓国の行宮の中で最も規模が大きく美しいです。「宮廷女官チャングムの誓い」などのロケ地としても有名です。',
            'pronunciation': '読み方: ファソンヘングン'
        },
        {
            'contentid': '126229',
            'title': '蒼龍門',
            'addr1': '京畿道 水原市 八達区 京水大路 697',
            'firstimage': '',
            'mapx': '127.025278',
            'mapy': '37.287222',
            'overview': '水原華城の東門で、東側には広大な芝生が広がっており、ヘリウム気球体験（フライング水原）や凧揚げを楽しむのに最適な場所です。',
            'pronunciation': '読み方: チャンニョンムン'
        },
        {
            'contentid': '126230',
            'title': '長安門',
            'addr1': '京畿道 水原市 八達区 正祖路 910',
            'firstimage': '',
            'mapx': '127.013889',
            'mapy': '37.289444',
            'overview': '水原華城の北門であり正門で、ソウルから下る王を迎えるための門でした。半円形の擁壁（翁城）を持つユニークな防衛構造を誇ります。',
            'pronunciation': '読み方: チャンアンムン'
        },
        {
            'contentid': '126231',
            'title': '八達門',
            'addr1': '京畿道 水原市 八達区 正祖路 780',
            'firstimage': '',
            'mapx': '127.016944',
            'mapy': '37.277222',
            'overview': '水原華城의 南門で、城壁から離れて都心の真ん中に島のように保存されています。周囲には歴史ある八達門市場などの伝統市場が形成されています。',
            'pronunciation': '読み方: パルダルムン'
        },
        {
            'contentid': '126232',
            'title': '練武台 (東将台)',
            'addr1': '京畿道 水原市 八達区 蒼龍大路103番ギル 8',
            'firstimage': '',
            'mapx': '127.023333',
            'mapy': '37.286944',
            'overview': '兵士たちが武芸を訓練した場所で、非常に見晴らしが良いです。現在は韓国の伝統弓（国弓）体験ができる観光スポットとなっています。',
            'pronunciation': '読み方: ヨンムデ'
        },
        {
            'contentid': '126233',
            'title': '水原華城博物館',
            'addr1': '京畿道 水原市 八達区 蒼龍大路 21',
            'firstimage': '',
            'mapx': '127.019444',
            'mapy': '37.282778',
            'overview': '世界文化遺産である水原華城の歴史と建築プロセスを紹介する専門博物館です。正祖大王の思想や軍事改革に関する展示もあります。',
            'pronunciation': '読み方: スウォンファソン博物館'
        },
        {
            'contentid': '126234',
            'title': '西将台',
            'addr1': '京畿道 水原市 八達区 行宮路 11-1',
            'firstimage': '',
            'mapx': '127.008889',
            'mapy': '37.283889',
            'overview': '八達山の山頂に位置し、水原市内と華城全体を一望できる軍事指揮所です。特に夕日と夜景が美しい場所です。',
            'pronunciation': '読み方: ソジャンデ'
        },
        {
            'contentid': '900001',
            'title': 'マネーボックス両替所 水原駅店',
            'addr1': '京畿道水原市八達区梅山路6',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0016',
            'mapy': '37.2657',
            'overview': '水原駅の近くにある私設両替所です。銀行よりも高い優遇レートを提供しており、平日や週末・祝日の遅い時間まで営業しているため、外国人観光客に便利です。',
            'pronunciation': ''
        },
        {
            'contentid': '900002',
            'title': 'ハナ銀行 水原支店 (手数料無料ATM)',
            'addr1': '京畿道水原市八達区徳栄大路905',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0002',
            'mapy': '37.2664',
            'overview': '水原駅8番出口前のハナ銀行内にあるATMです。外国人観光客が広く利用するTravelLogやTravelWalletカードでウォン紙幣を引き出す際、手数料が全額免除されます。',
            'pronunciation': ''
        },
        {
            'contentid': '900003',
            'title': 'セブンイレブン 水原行宮店 (ロッテグローバルATM)',
            'addr1': '京畿道水原市八達区新豊路23番ギル4',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0135',
            'mapy': '37.2831',
            'overview': '華城行宮広場近くのセブンイレブン店内にあるロッテグローバルATMです。TravelWalletカードで韓国ウォンを現金を引出す際、手数料優待が適用されます。',
            'pronunciation': ''
        }
    ],
    'chs': [
        {
            'contentid': '126227',
            'title': '访花随柳亭 (东北角楼)',
            'addr1': '京畿道 水原市 八达区 水原川路392番街 44-6',
            'firstimage': '/static/images/banghwasuryujeong.jpg',
            'mapx': '127.017778',
            'mapy': '37.287222',
            'overview': '被誉为水原华城中最美丽的景点，与悬崖下名为“龙池”的莲花池融为一体，极为迷人。夜景也是深受游客喜爱的观赏圣地。',
            'pronunciation': '韩语发音: Banghwasuryujeong'
        },
        {
            'contentid': '126228',
            'title': '华城行宫',
            'addr1': '京畿道 水原市 八达区 行宫路 11',
            'firstimage': '/static/images/hwaseong_haenggung.jpg',
            'mapx': '127.013611',
            'mapy': '37.282778',
            'overview': '正祖大王出行到父王陵墓参拜时居住的临时宫殿，是韩国现存规模最大、最精美的行宫。著名电视剧《大长今》也曾在此取景拍摄。',
            'pronunciation': '韩语发音: Hwaseong Haenggung'
        },
        {
            'contentid': '126229',
            'title': '苍龙门',
            'addr1': '京畿道 水原市 八达区 京水大路 697',
            'firstimage': '',
            'mapx': '127.025278',
            'mapy': '37.287222',
            'overview': '水原华城的东门。东侧有一片开阔的草坪，非常适合放风筝以及体验氦气球（热气球飞越水原）。',
            'pronunciation': '韩语发音: Changnyongmun'
        },
        {
            'contentid': '126230',
            'title': '长安门',
            'addr1': '京畿道 水原市 八达区 正祖路 910',
            'firstimage': '',
            'mapx': '127.013889',
            'mapy': '37.289444',
            'overview': '水原华城的北门，也是正门，是用来迎接从汉城（首尔）南下的国王的大门。独特的半圆形“瓮城”赋予其卓越的军事防卫力。',
            'pronunciation': '韩语发音: Janganmun'
        },
        {
            'contentid': '126231',
            'title': '八达门',
            'addr1': '京畿道 水原市 八达区 正祖路 780',
            'firstimage': '',
            'mapx': '127.016944',
            'mapy': '37.277222',
            'overview': '水原华城的南门，与城墙脱离，像一座岛屿般矗立在都市中心。周边环绕着拥有悠久历史的传统集市如八达门市场。',
            'pronunciation': '韩语发音: Paldalmun'
        },
        {
            'contentid': '126232',
            'title': '练武台 (东将台)',
            'addr1': '京畿道 水原市 八达区 苍龙大路103番街 8',
            'firstimage': '',
            'mapx': '127.023333',
            'mapy': '37.286944',
            'overview': '过去士兵们训练武艺的场所，视野开阔。现为游客体验韩国传统国弓射箭的热门景点。',
            'pronunciation': '韩语发音: Yeonmudae'
        },
        {
            'contentid': '126233',
            'title': '水原华城博物馆',
            'addr1': '京畿道 水原市 八达区 苍龙大路 21',
            'firstimage': '',
            'mapx': '127.019444',
            'mapy': '37.282778',
            'overview': '向游客展示联合国教科文组织世界文化遗产水原华城的筑城历史、建筑过程以及正祖大王思想的专业博物馆。',
            'pronunciation': '韩语发音: Suwon Hwaseong Museum'
        },
        {
            'contentid': '126234',
            'title': '西将台',
            'addr1': '京畿道 水原市 八达区 行宫路 11-1',
            'firstimage': '',
            'mapx': '127.008889',
            'mapy': '37.283889',
            'overview': '坐落在八达山山顶的军事指挥所。在此可以俯瞰整个水原市中心及水原华城全景，夕阳和夜景极其迷人。',
            'pronunciation': '韩语发音: Seojangdae'
        },
        {
            'contentid': '900001',
            'title': 'Moneybox 私人换钱所 (水原站店)',
            'addr1': '京畿道水原市八达区梅山路6',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0016',
            'mapy': '37.2657',
            'overview': '位于水原站附近的私人换钱所。提供比传统银行更优惠的汇率，且在周末和节假日也营业至深夜，非常方便外国游客使用。',
            'pronunciation': ''
        },
        {
            'contentid': '900002',
            'title': '韩亚银行 水原支行 (免手续费 ATM)',
            'addr1': '京畿道水原市八达区德荣大路905',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0002',
            'mapy': '37.2664',
            'overview': '位于水原站8号出口前的韩亚银行内。使用外国游客常用的 TravelLog 或 TravelWallet 卡提取韩币现金时，免除全部ATM手续费。',
            'pronunciation': ''
        },
        {
            'contentid': '900003',
            'title': '7-Eleven 水原行宫店 (乐天全球 ATM)',
            'addr1': '京畿道水原市八达区新丰路23街4',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0135',
            'mapy': '37.2831',
            'overview': '位于华城行宫广场附近的7-Eleven便利店内。使用 TravelWallet 卡提取韩币现金时，可享受免手续费优惠。',
            'pronunciation': ''
        }
    ],
    'cht': [
        {
            'contentid': '126227',
            'title': '訪花隨柳亭 (東北角樓)',
            'addr1': '京畿道 水原市 八達區 水原川路392番街 44-6',
            'firstimage': '/static/images/banghwasuryujeong.jpg',
            'mapx': '127.017778',
            'mapy': '37.287222',
            'overview': '被譽為水原華城中最美麗的景點，與懸崖下名為“龍池”的蓮花池融為一體，極為迷人。夜景也是深受遊客喜愛的觀賞聖地。',
            'pronunciation': '韓語發音: Banghwasuryujeong'
        },
        {
            'contentid': '126228',
            'title': '華城行宮',
            'addr1': '京畿道 水原市 八達區 行宮路 11',
            'firstimage': '/static/images/hwaseong_haenggung.jpg',
            'mapx': '127.013611',
            'mapy': '37.282778',
            'overview': '正祖大王出行到父王陵墓參拜時居住的臨時宮殿，是韓國現存規模最大、最精美的行宮。著名電視劇《大長今》也曾在此取景拍攝。',
            'pronunciation': '韓語發音: Hwaseong Haenggung'
        },
        {
            'contentid': '126229',
            'title': '蒼龍門',
            'addr1': '京畿道 水原市 八達區 京水大路 697',
            'firstimage': '',
            'mapx': '127.025278',
            'mapy': '37.287222',
            'overview': '水原華城的東門。東側有一片開闊的草坪，非常適合放風箏以及體驗氦氣球（熱氣球飛越水原）。',
            'pronunciation': '韓語發音: Changnyongmun'
        },
        {
            'contentid': '126230',
            'title': '長安門',
            'addr1': '京畿道 水原市 八達區 正祖路 910',
            'firstimage': '',
            'mapx': '127.013889',
            'mapy': '37.289444',
            'overview': '水原華城的北門，也是正門，是用來迎接從漢城（首爾）南下的國王的大門。獨特的半圓形“甕城”賦予其卓越的軍事防衛力。',
            'pronunciation': '韓語發音: Janganmun'
        },
        {
            'contentid': '126231',
            'title': '八達門',
            'addr1': '京畿道 水原市 八達區 正祖路 780',
            'firstimage': '',
            'mapx': '127.016944',
            'mapy': '37.277222',
            'overview': '水原華城的南門，與城牆脫離，像一座島嶼般矗立在都市中心。周邊環繞著擁有悠久歷史的傳統集市如八達門市場。',
            'pronunciation': '韓語發音: Paldalmun'
        },
        {
            'contentid': '126232',
            'title': '練武台 (東將台)',
            'addr1': '京畿道 水原市 八達區 蒼龍大路103番街 8',
            'firstimage': '',
            'mapx': '127.023333',
            'mapy': '37.286944',
            'overview': '過去士兵們訓練武藝的場所，視野開闊。現為遊客體驗韓國傳統國弓射箭的熱門景點。',
            'pronunciation': '韓語發音: Yeonmudae'
        },
        {
            'contentid': '126233',
            'title': '水原華城博物館',
            'addr1': '京畿道 水原市 八達區 蒼龍大路 21',
            'firstimage': '',
            'mapx': '127.019444',
            'mapy': '37.282778',
            'overview': '向遊客展示聯合國教科文組織世界文化遺產水原華城的築城歷史、建築過程以及正祖大王思想的專業博物館。',
            'pronunciation': '韓語發音: Suwon Hwaseong Museum'
        },
        {
            'contentid': '126234',
            'title': '西將台',
            'addr1': '京畿道 水原市 八達區 行宮路 11-1',
            'firstimage': '',
            'mapx': '127.008889',
            'mapy': '37.283889',
            'overview': '坐落在八達山山頂的軍事指揮所。在此可以俯瞰整個水原市中心及水原華城全景，夕陽和夜景極其迷人。',
            'pronunciation': '韓語發音: Seojangdae'
        },
        {
            'contentid': '900001',
            'title': 'Moneybox 私人換錢所 (水原站店)',
            'addr1': '京畿道水原市八達區梅山路6',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0016',
            'mapy': '37.2657',
            'overview': '位於水原站附近的私人換錢所。提供比傳統銀行更優惠的匯率，且在週末和節假日也營業至深夜，非常方便外國遊客使用。',
            'pronunciation': ''
        },
        {
            'contentid': '900002',
            'title': '韓亞銀行 水原分行 (免手續費 ATM)',
            'addr1': '京畿道水原市八達區德榮大路905',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0002',
            'mapy': '37.2664',
            'overview': '位於水原站8號出口前的韓亞銀行內。使用外國遊客常用的 TravelLog 或 TravelWallet 卡提取韓幣現金時，免除全部ATM手續費。',
            'pronunciation': ''
        },
        {
            'contentid': '900003',
            'title': '7-Eleven 水原行宮店 (樂天全球 ATM)',
            'addr1': '京畿道水原市八達區新豐路23街4',
            'firstimage': '/static/images/default.png',
            'mapx': '127.0135',
            'mapy': '37.2831',
            'overview': '位於華城行宮廣場附近的7-Eleven便利店內。使用 TravelWallet 卡提取韓幣現金時，可享受免手續費優惠。',
            'pronunciation': ''
        }
    ]
}

def get_seed_places(lang='kor'):
    """
    지정된 언어에 해당하는 로컬 백업 관광지 리스트를 반환합니다.
    """
    from LinkSuwon.i18n import get_validated_lang
    valid_lang = get_validated_lang(lang)
    return SEED_PLACES.get(valid_lang, SEED_PLACES['kor'])
