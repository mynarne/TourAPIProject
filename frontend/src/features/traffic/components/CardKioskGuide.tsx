import { useState } from 'react';
import type { TrafficLanguage } from '../../../api/trafficApi';

type CardKioskGuideProps = {
  language: TrafficLanguage;
};

type CardType = 'wowpass' | 'namane' | 'tmoney' | 'single';

const COPY = {
  kor: {
    title: '💳 외국인 전용 교통패스 단말기 & 실물 카드 안내',
    subtitle: '한국 입국 후 즉시 발급 가능한 대표 교통 및 결제 카드 완벽 가이드',
    kioskTitle: '발급 키오스크 머신',
    wowpassKiosk: '🟠 WOWPASS 오렌지 키오스크',
    wowpassDesc: '여권 스캔 · 외화 투입 즉시 발급',
    namaneKiosk: '💗 NAMANE 핑크 키오스크',
    namaneDesc: '내 사진 인쇄 · 커스텀 카드 발급',
    stepTitle: '📋 키오스크 이용 순서 (4단계)',
    step1: '1. 여권 스캐너에 여권을 올려 본인 확인 (자동 인식)',
    step2: '2. 외화 지폐(달러, 엔화, 위안화, 대만달러 등)를 투입구에 넣기',
    step3: '3. 화면에서 원화(KRW) 충전 금액 확인 후 결제 승인',
    step4: '4. 카드 배출구(CARD DISPENSER)에서 실물 카드 수령',
    tabWowpass: 'WOWPASS',
    tabNamane: 'NAMANE',
    tabTmoney: 'T-money',
    tabSingle: '1회용 지하철 카드',
    locationsTitle: '📍 주요 발급처 설치 위치 상세 안내',
    suwonStation: '수원역 (Suwon Station) - 1호선 지하 대합실',
    suwonStationDesc: '1호선 지하 개찰구를 나와서 4번 출구 방향 전철 고객센터(Customer Office) 바로 맞은편에 오렌지색 WOWPASS 키오스크가 설치되어 있습니다. (운영시간 06:00 ~ 23:30)',
    incheonT1: '인천국제공항 제1여객터미널 (T1)',
    incheonT1Desc: '• 지하 1층 공항철도 개찰구 옆 직통열차 게이트 진입로\n• 1층 입국장 2번 및 11번 게이트 근처 트래블센터 매장 안쪽',
    incheonT2: '인천국제공항 제2여객터미널 (T2)',
    incheonT2Desc: '• 지하 1층 공항철도 교통센터 철도 매표소 및 충전소 우측 진입로',
    seoulStation: '서울역 (Seoul Station)',
    seoulStationDesc: '• 지하 2층 공항철도 도심공항 터미널 고객안내센터 바로 앞\n• 2층 서울역 대합실 중앙 트래블스토어 옆',
  },
  eng: {
    title: '💳 Foreign Tourist Pass & Kiosk Guide',
    subtitle: 'Complete guide to transit and payment cards available immediately upon arrival in Korea',
    kioskTitle: 'Issuance Kiosk Machine',
    wowpassKiosk: '🟠 WOWPASS Orange Kiosk',
    wowpassDesc: 'Instant issuance via passport scan & cash',
    namaneKiosk: '💗 NAMANE Pink Kiosk',
    namaneDesc: 'Custom photo printing card issuance',
    stepTitle: '📋 Kiosk Usage Steps (4 Steps)',
    step1: '1. Place your passport on the scanner for automated ID verification',
    step2: '2. Insert foreign cash (USD, JPY, CNY, TWD, etc.) into the slot',
    step3: '3. Confirm the KRW top-up amount on screen and approve',
    step4: '4. Collect your physical card from the CARD DISPENSER slot',
    tabWowpass: 'WOWPASS',
    tabNamane: 'NAMANE',
    tabTmoney: 'T-money',
    tabSingle: 'Single-use Subway Card',
    locationsTitle: '📍 Key Kiosk Installation Locations',
    suwonStation: 'Suwon Station - Line 1 B1 Subway Concourse',
    suwonStationDesc: 'Exit the Line 1 subway gates. The orange WOWPASS kiosk is directly in front of the Customer Office, near Exit 4. (06:00 ~ 23:30)',
    incheonT1: 'Incheon International Airport Terminal 1 (T1)',
    incheonT1Desc: '• B1F Airport Railroad Gate: near the Express Train entrance\n• 1F Arrivals Hall: inside Travel Center near Gates 2 & 11',
    incheonT2: 'Incheon International Airport Terminal 2 (T2)',
    incheonT2Desc: '• B1F Transit Center: right side of the train ticket counter & gates',
    seoulStation: 'Seoul Station',
    seoulStationDesc: '• B2F City Airport Terminal: directly in front of the Service Desk\n• 2F Main Concourse: next to the central Travel Store',
  },
  jpn: {
    title: '💳 外国人専用交通パス発券機＆実物カード案内',
    subtitle: '韓国到着後すぐに発行できる代表的な交通・決済カードの完全ガイド',
    kioskTitle: '発券キオスク端末',
    wowpassKiosk: '🟠 WOWPASS オレンジ発券機',
    wowpassDesc: 'パスポートスキャン＆外貨直接投入で即時発行',
    namaneKiosk: '💗 NAMANE ピンク発券機',
    namaneDesc: '写真印刷・カスタムカード発行',
    stepTitle: '📋 発券機の使い方（4ステップ）',
    step1: '1. パスポートをスキャナーに置いて本人確認（自動認識）',
    step2: '2. 外貨紙幣（円、ドル、元、台湾ドルなど）を投入口へ入れる',
    step3: '3. 画面でウォン（KRW）のチャージ金額を確認して確定',
    step4: '4. カード排出口から実物カードを受け取る',
    tabWowpass: 'WOWPASS',
    tabNamane: 'NAMANE',
    tabTmoney: 'T-money',
    tabSingle: '1回用地下鉄カード',
    locationsTitle: '📍 主な発券機設置場所の詳細',
    suwonStation: '水原駅（Suwon Station）- 1号線 地下コンコース',
    suwonStationDesc: '1号線地下改札を出て、4番出口方面にある案内窓口（Customer Office）の目の前にオレンジ色のWOWPASS発券機があります。（06:00〜23:30）',
    incheonT1: '仁川国際空港 第1旅客ターミナル (T1)',
    incheonT1Desc: '• 地下1階 空港鉄道改札口横：直通列車ゲート付近\n• 1階 到着ロビー内：2番・11番ゲート付近のトラベルセンター内',
    incheonT2: '仁川国際空港 第2旅客ターミナル (T2)',
    incheonT2Desc: '• 地下1階 交通センター：鉄道切符売り場の右側通路',
    seoulStation: 'ソウル駅 (Seoul Station)',
    seoulStationDesc: '• 地下2階 都心空港ターミナル：案内デスク正面\n• 2階 ソウル駅待合室中央：トラベルストア横',
  },
  chs: {
    title: '💳 外国人专用交通卡自助发卡机与实体卡指南',
    subtitle: '入境韩国后可即时办理的主流交通与支付卡完整指南',
    kioskTitle: '自助发卡机设备',
    wowpassKiosk: '🟠 WOWPASS 橙色自助机',
    wowpassDesc: '扫描护照·存入外币即时出卡',
    namaneKiosk: '💗 NAMANE 粉色自助机',
    namaneDesc: '打印自选照片·定制专属卡',
    stepTitle: '📋 自助发卡机使用步骤（4步）',
    step1: '1. 将护照放在扫描仪上进行身份验证（自动识别）',
    step2: '2. 将外币纸币（美元、日元、人民币、新台币等）放入投币口',
    step3: '3. 在屏幕上核对韩币（KRW）充值金额并点击确认',
    step4: '4. 从出卡口（CARD DISPENSER）取出您的实体卡',
    tabWowpass: 'WOWPASS',
    tabNamane: 'NAMANE',
    tabTmoney: 'T-money',
    tabSingle: '单程地铁卡',
    locationsTitle: '📍 主要发卡机安装位置详细说明',
    suwonStation: '水原站 (Suwon Station) - 1号线地下大厅',
    suwonStationDesc: '走出1号线地下闸机，橙色WOWPASS自助机位于地铁客服中心（Customer Office）正对面，靠近4号出口。（服务时间 06:00 ~ 23:30）',
    incheonT1: '仁川国际机场第1航站楼 (T1)',
    incheonT1Desc: '• 地下1层 机场快线出站口旁：直达列车进站通道\n• 1层 入境大厅：靠近2号与11号门附近的旅游服务中心内部',
    incheonT2: '仁川国际机场第2航站楼 (T2)',
    incheonT2Desc: '• 地下1层 交通中心：售票处与充值机右侧通道',
    seoulStation: '首尔站 (Seoul Station)',
    seoulStationDesc: '• 地下2层 城市航站楼：服务中心正前方\n• 2层 候车大厅中央：旅游商店隔壁',
  },
  cht: {
    title: '💳 外國人專用交通卡自助發卡機與實體卡指南',
    subtitle: '入境韓國後可即時辦理的主流交通與支付卡完整指南',
    kioskTitle: '自助發卡機設備',
    wowpassKiosk: '🟠 WOWPASS 橙色自助機',
    wowpassDesc: '掃描護照·存入外幣即時出卡',
    namaneKiosk: '💗 NAMANE 粉色自助機',
    namaneDesc: '列印自選照片·定製專屬卡',
    stepTitle: '📋 自助發卡機使用步驟（4步）',
    step1: '1. 將護照放在掃描儀上進行身分驗證（自動識別）',
    step2: '2. 將外幣紙幣（美元、日圓、人民幣、新台幣等）放入投幣口',
    step3: '3. 在螢幕上核對韓幣（KRW）儲值金額並點擊確認',
    step4: '4. 從出卡口（CARD DISPENSER）取出您的實體卡',
    tabWowpass: 'WOWPASS',
    tabNamane: 'NAMANE',
    tabTmoney: 'T-money',
    tabSingle: '單程地鐵卡',
    locationsTitle: '📍 主要發卡機安裝位置詳細說明',
    suwonStation: '水原站 (Suwon Station) - 1號線地下大廳',
    suwonStationDesc: '走出1號線地下閘機，橙色WOWPASS自助機位於地鐵客服中心（Customer Office）正對面，靠近4號出口。（服務時間 06:00 ~ 23:30）',
    incheonT1: '仁川國際機場第1航廈 (T1)',
    incheonT1Desc: '• 地下1層 機場快線出站口旁：直達列車進站通道\n• 1層 入境大廳：靠近2號與11號門附近的旅遊服務中心內部',
    incheonT2: '仁川國際機場第2航廈 (T2)',
    incheonT2Desc: '• 地下1層 交通中心：售票處與加值機右側通道',
    seoulStation: '首爾站 (Seoul Station)',
    seoulStationDesc: '• 地下2層 城市航站樓：服務中心正前方\n• 2層 候車大廳中央：旅遊商店隔壁',
  },
};

const CARD_DETAILS = {
  kor: {
    wowpass: {
      tag: '올인원 선불카드 + T-money',
      badge: '외화 즉시 환전 충전',
      summary: '여권 스캔 후 외화 지폐(달러, 엔화 등)를 넣어 원화로 자동 환전 및 충전하는 외국인 전용 체크카드입니다.',
      points: [
        '신용카드 가맹점(음식점, 카페 등) 결제 + T-money 대중교통 탑재',
        '원화 현금 출금(ATM) 및 남은 잔액 환불 가능',
        '모바일 앱으로 실시간 잔액 조회 및 결제 캐시백 혜택',
      ],
      caution: '※ T-money 교통 잔액은 지하철역 충전기나 편의점에서 원화 현금으로 별도 충전해야 합니다.',
    },
    namane: {
      tag: '커스텀 포토 카드 + 교통',
      badge: '원하는 사진 인쇄',
      summary: '스마트폰 사진을 카드 앞면에 직접 인쇄하여 나만의 소장용 교통카드를 제작할 수 있습니다.',
      points: [
        '전용 앱 QR 코드로 키오스크에서 1분 만에 인쇄 및 즉시 발급',
        '페이 잔액(쇼핑/식당)과 교통 잔액(지하철/버스)을 앱에서 자유롭게 전환',
        '국내외 신용카드 및 외화로 간편 충전 지원',
      ],
      caution: '※ 발급 전 NAMANE 모바일 앱에서 미리 카드 디자인을 완료하고 QR 코드를 생성해 두면 편리합니다.',
    },
    tmoney: {
      tag: '전국 표준 대중교통 카드',
      badge: '편의점 즉시 구매',
      summary: '한국에서 가장 널리 쓰이는 표준 교통카드로 전국 모든 지하철, 버스, 택시에서 사용 가능합니다.',
      points: [
        '전국 편의점(CU, GS25, 세븐일레븐) 및 지하철역에서 3,000원~5,000원에 구매',
        '지하철역 무인 충전기나 편의점에서 현금으로 간편 충전',
        '귀국 시 편의점이나 역사 고객센터에서 잔액 환불 가능 (수수료 500원)',
      ],
      caution: '※ 카드 구매비(3,000~5,000원)는 환불되지 않으며 잔액만 환불됩니다.',
    },
    single: {
      tag: '1회용 지하철 티켓',
      badge: '보증금 500원 환급',
      summary: '교통카드가 없을 때 지하철역 발급기에서 현금으로 발급받아 1회 승차하는 종이형 RF 카드입니다.',
      points: [
        '역사 내 발급기에서 언어(ENG/JPN/CHN) 선택 후 목적지 역 검색',
        '운임 + 보증금 500원을 현금으로 투입하여 발급',
        '도착역 개찰구 밖 [보증금 환급기]에 카드를 넣으면 500원 즉시 환급',
      ],
      caution: '※ 버스 환승 할인이 적용되지 않으므로 하루 3회 이상 이동 시 T-money나 WOWPASS 구매를 권장합니다.',
    },
  },
  eng: {
    wowpass: {
      tag: 'All-in-One Prepaid Card + T-money',
      badge: 'Direct Foreign Cash Top-up',
      summary: 'All-in-one debit card for foreign tourists that converts your foreign cash into KRW balance instantly.',
      points: [
        'Accepted at all card stores (restaurants, cafes) + T-money transit built-in',
        'KRW cash withdrawal at ATMs & easy balance refund',
        'Mobile app for live balance tracking and cashback rewards',
      ],
      caution: '※ The T-money transit balance must be topped up separately with KRW cash at subway stations or convenience stores.',
    },
    namane: {
      tag: 'Custom Photo Card + Transit',
      badge: 'Print Your Own Photo',
      summary: 'Print any photo from your phone on the front of the card to create a personalized souvenir transit card.',
      points: [
        'Issue in 1 minute at kiosks using a QR code from the NAMANE app',
        'Split balance management: Pay balance (stores) & Transit balance (subway/bus)',
        'Top up easily with international credit cards or foreign currency',
      ],
      caution: '※ We recommend designing your card and generating a QR code in the NAMANE app before visiting a kiosk.',
    },
    tmoney: {
      tag: 'National Standard Transit Card',
      badge: 'Available at Convenience Stores',
      summary: 'The most widely used transit card in Korea, accepted on all subways, city buses, and taxis nationwide.',
      points: [
        'Purchase at convenience stores (CU, GS25, 7-Eleven) for 3,000 ~ 5,000 KRW',
        'Top up with cash at subway vending machines or convenience stores',
        'Refund remaining balance at convenience stores or station offices (500 KRW fee)',
      ],
      caution: '※ Card purchase price (3,000 ~ 5,000 KRW) is non-refundable; only remaining balance is refunded.',
    },
    single: {
      tag: 'Single-use Subway Card',
      badge: '500 KRW Deposit Refundable',
      summary: 'Single-ride RF ticket purchased with cash at subway station machines when you do not have a transit card.',
      points: [
        'Select language (ENG/JPN/CHN) on the machine and search destination station',
        'Insert fare + 500 KRW deposit in KRW cash to receive card',
        'Insert card into the Deposit Refund Machine at the destination to get 500 KRW back',
      ],
      caution: '※ Does not support bus transfer discounts; T-money or WOWPASS is recommended if making 3+ trips a day.',
    },
  },
  jpn: {
    wowpass: {
      tag: 'オールインワン前払いカード + T-money',
      badge: '外貨直接チャージ対応',
      summary: 'パスポートをスキャンして外貨紙幣を入れるだけでウォン（KRW）に両替・チャージできる外国人専用プリペイドカードです。',
      points: [
        '韓国内のすべての加盟店決済 + T-money交通カード機能を1枚に凝縮',
        'ウォン現金のATM引き出しおよび残高の払い戻しが可能',
        '専用アプリで残高確認やキャッシュバック特典が利用可能',
      ],
      caution: '※ T-money交通残高は、地下鉄駅の券売機またはコンビニにてウォン現金で別途チャージが必要です。',
    },
    namane: {
      tag: 'カスタム写真カード + 交通',
      badge: 'お好きな写真を印刷',
      summary: 'スマートフォンの写真をカード表面に直接印刷し、自分だけのオリジナル交通カードを作ることができます。',
      points: [
        '専用アプリのQRコードを使ってキオスクで約1分で即時発行',
        'ペイ残高（買い物・飲食）と交通残高（地下鉄・バス）をアプリで自由に振り分け',
        '海外クレジットカードや外貨でのチャージに対応',
      ],
      caution: '※ 発行前にNAMANEアプリでカードデザインを完了し、QRコードを生成しておくとスムーズです。',
    },
    tmoney: {
      tag: '全国共通の標準交通カード',
      badge: 'コンビニで即時購入',
      summary: '韓国で最も普及している交通カードで、全国の地下鉄・バス・タクシーで利用できます。',
      points: [
        '全国のコンビニ（CU、GS25、セブンイレブン）で3,000〜5,000ウォンで購入可能',
        '地下鉄駅のチャージ機やコンビニでウォン現金で簡単チャージ',
        '帰国時にコンビニや駅の窓口で残高の払い戻しが可能（手数料500ウォン）',
      ],
      caution: '※ カード本体の購入代金（3,000〜5,000ウォン）は返金されません。残高のみ返金されます。',
    },
    single: {
      tag: '1回用地下鉄チケット',
      badge: '保証金500ウォン返金',
      summary: '交通カードをお持ちでない場合、駅の券売機で現金購入して1回乗車できるカードです。',
      points: [
        '券売機で言語（ENG/JPN/CHN）を選択し、目的地の駅を検索',
        '運賃に保証金500ウォンを加えた現金を投入して発券',
        '到着駅の改札を出た後、「保証金払い戻し機」にカードを入れると500ウォンが返金',
      ],
      caution: '※ バスの乗り継ぎ割引は適用されません。1日に3回以上乗車する場合はT-moneyやWOWPASSをおすすめします。',
    },
  },
  chs: {
    wowpass: {
      tag: '多功能预付卡 + T-money',
      badge: '支持外币直接充值',
      summary: '专为外国游客打造的借记卡，只需扫描护照并存入外币现金，即可自动兑换并充值韩币。',
      points: [
        '支持所有刷卡消费（餐饮、购物）+ 内置T-money公交功能',
        '可在ATM提取韩币现金，支持未用余额退款',
        '手机App实时查询余额并享受消费现金返还优惠',
      ],
      caution: '※ T-money交通账户需在地铁站充值机或便利店使用韩币现金单独充值。',
    },
    namane: {
      tag: '定制照片卡 + 交通卡',
      badge: '自选照片定制卡面',
      summary: '可将手机里的照片直接打印在卡面上，打造专属纪念交通卡。',
      points: [
        '通过专用App生成QR码，在发卡机上1分钟内完成打印和出卡',
        '支付账户（购物）与交通账户（公交地铁）可在App内自由划转',
        '支持海外信用卡及外币便捷充值',
      ],
      caution: '※ 建议在前往自助机前提前在NAMANE App内设计好卡面并生成QR码。',
    },
    tmoney: {
      tag: '韩国通用标准交通卡',
      badge: '便利店即买即用',
      summary: '韩国使用最广泛的标准交通卡，适用于全国所有地铁、市内公交和出租车。',
      points: [
        '在全国便利店（CU、GS25、7-Eleven）以3,000~5,000韩元购买',
        '在地铁站自助机或便利店使用韩币现金轻松充值',
        '回国前可在便利店或地铁客服中心办理余额退款（手续费500韩元）',
      ],
      caution: '※ 购卡费（3,000~5,000韩元）不予退还，仅退还卡内充值余额。',
    },
    single: {
      tag: '单程地铁票卡',
      badge: '500韩元押金可退',
      summary: '没有交通卡时，可在地铁站自助售票机使用现金购买的单次乘车卡。',
      points: [
        '在售票机选择语言（ENG/JPN/CHN）并搜索目的地车站',
        '投入车费 + 500韩元押金现金出卡',
        '到站出闸后，将卡放入“押金退还机”即可取回500韩元现金',
      ],
      caution: '※ 不享受公交换乘优惠；如一天出行3次以上，建议购买T-money或WOWPASS。',
    },
  },
  cht: {
    wowpass: {
      tag: '多功能預付卡 + T-money',
      badge: '支援外幣直接儲值',
      summary: '專為外國遊客打造的金融卡，只需掃描護照並存入外幣現金，即可自動兌換並儲值韓幣。',
      points: [
        '支援所有刷卡消費（餐飲、購物）+ 內建T-money大眾運輸功能',
        '可在ATM提取韓幣現金，支援未用餘額退款',
        '手機App即時查詢餘額並享受消費現金回饋優惠',
      ],
      caution: '※ T-money交通帳戶需在地鐵站加值機或便利店使用韓幣現金單獨加值。',
    },
    namane: {
      tag: '定製照片卡 + 交通卡',
      badge: '自選照片定製卡面',
      summary: '可將手機裡的照片直接列印在卡面上，打造專屬紀念交通卡。',
      points: [
        '透過專用App生成QR碼，在發卡機上1分鐘內完成列印和出卡',
        '支付帳戶（購物）與交通帳戶（公車地鐵）可在App內自由劃轉',
        '支援海外信用卡及外幣便捷儲值',
      ],
      caution: '※ 建議在前往自助機前提前在NAMANE App內設計好卡面並生成QR碼。',
    },
    tmoney: {
      tag: '韓國通用標準交通卡',
      badge: '便利店隨買隨用',
      summary: '韓國使用最廣泛的標準交通卡，適用於全國所有地鐵、市區公車和計程車。',
      points: [
        '在全國便利店（CU、GS25、7-Eleven）以3,000~5,000韓元購買',
        '在地鐵站自助機或便利店使用韓幣現金輕鬆加值',
        '回國前可在便利店或地鐵客服中心辦理餘額退款（手續費500韓元）',
      ],
      caution: '※ 購卡費（3,000~5,000韓元）不予退還，僅退還卡內儲值餘額。',
    },
    single: {
      tag: '單程地鐵票卡',
      badge: '500韓元押金可退',
      summary: '沒有交通卡時，可在地鐵站自助售票機使用現金購買的單次乘車卡。',
      points: [
        '在售票機選擇語言（ENG/JPN/CHN）並搜尋目的地車站',
        '投入車資 + 500韓元押金現金出卡',
        '到站出閘後，將卡放入「押金退還機」即可取回500韓元現金',
      ],
      caution: '※ 不享受公車轉乘優惠；如一天出行3次以上，建議購買T-money或WOWPASS。',
    },
  },
};

export function CardKioskGuide({ language }: CardKioskGuideProps) {
  const [selectedCard, setSelectedCard] = useState<CardType>('wowpass');
  const copy = COPY[language] || COPY.kor;
  const details = CARD_DETAILS[language] || CARD_DETAILS.kor;
  const currentCardInfo = details[selectedCard];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <header className="mb-6">
        <h2 className="text-xl font-black text-slate-900">{copy.title}</h2>
        <p className="mt-1 text-xs text-slate-500">{copy.subtitle}</p>
      </header>

      {/* Kiosk SVG Illustrations */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* WOWPASS Kiosk */}
        <div className="flex flex-col items-center rounded-2xl border border-amber-200/60 bg-gradient-to-b from-orange-50/50 to-amber-50/30 p-5">
          <svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg" className="h-48 w-auto drop-shadow-lg">
            <defs>
              <linearGradient id="wowGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff8c00" />
                <stop offset="100%" stopColor="#cc4a00" />
              </linearGradient>
              <linearGradient id="cardGrad2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff8c42" />
                <stop offset="100%" stopColor="#8d1a00" />
              </linearGradient>
            </defs>
            <rect x="15" y="10" width="90" height="200" rx="10" fill="url(#wowGrad)" />
            <rect x="15" y="10" width="8" height="200" rx="8" fill="white" opacity="0.15" />
            <rect x="22" y="18" width="76" height="28" rx="6" fill="#fff3e0" />
            <text x="60" y="29" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="9" fill="#cc4a00">WOWPASS</text>
            <text x="60" y="40" textAnchor="middle" fontFamily="sans-serif" fontSize="5" fill="#e07030">PREPAID · TRANSIT</text>
            <rect x="22" y="52" width="76" height="72" rx="5" fill="#1a1a2e" />
            <rect x="24" y="54" width="72" height="68" rx="4" fill="#0f1a35" />
            <rect x="36" y="64" width="48" height="28" rx="4" fill="url(#cardGrad2)" />
            <text x="60" y="74" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize="5" fill="white">WOWPASS</text>
            <text x="60" y="84" textAnchor="middle" fontFamily="monospace" fontSize="4" fill="#ffccaa">•••• 4321</text>
            <text x="60" y="102" textAnchor="middle" fontFamily="sans-serif" fontSize="5" fill="#7ec8ff">INSERT PASSPORT</text>
            <text x="60" y="111" textAnchor="middle" fontFamily="sans-serif" fontSize="4.5" fill="#5ba3d9">여권 스캔</text>
            <rect x="30" y="130" width="60" height="8" rx="2" fill="#222240" />
            <text x="60" y="136" textAnchor="middle" fontFamily="sans-serif" fontSize="4" fill="#6699cc">PASSPORT SCAN ▶</text>
            <rect x="30" y="145" width="60" height="10" rx="3" fill="#3d2200" />
            <text x="60" y="153" textAnchor="middle" fontFamily="sans-serif" fontSize="4" fill="#ff9933">💵 CASH INSERT</text>
            <rect x="30" y="162" width="60" height="12" rx="3" fill="#2a1500" />
            <text x="60" y="170" textAnchor="middle" fontFamily="sans-serif" fontSize="4" fill="#ffaa44">CARD DISPENSER ⬇</text>
            <rect x="8" y="205" width="104" height="8" rx="4" fill="#8b3a00" />
          </svg>
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-900">
              {copy.wowpassKiosk}
            </span>
            <p className="mt-1 text-[11px] text-slate-500">{copy.wowpassDesc}</p>
          </div>
        </div>

        {/* NAMANE Kiosk */}
        <div className="flex flex-col items-center rounded-2xl border border-pink-200/60 bg-gradient-to-b from-pink-50/50 to-rose-50/30 p-5">
          <svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg" className="h-48 w-auto drop-shadow-lg">
            <defs>
              <linearGradient id="namaneGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff80b0" />
                <stop offset="100%" stopColor="#a0245a" />
              </linearGradient>
            </defs>
            <rect x="15" y="10" width="90" height="200" rx="10" fill="url(#namaneGrad)" />
            <rect x="15" y="10" width="8" height="200" rx="8" fill="white" opacity="0.15" />
            <rect x="22" y="18" width="76" height="28" rx="6" fill="#fff0f5" />
            <text x="60" y="29" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="10" fill="#a0245a">NAMANE</text>
            <text x="60" y="40" textAnchor="middle" fontFamily="sans-serif" fontSize="5" fill="#c06080">CUSTOM CARD</text>
            <rect x="22" y="52" width="76" height="72" rx="5" fill="#1a0a1a" />
            <rect x="24" y="54" width="72" height="68" rx="4" fill="#140814" />
            <rect x="36" y="58" width="48" height="34" rx="4" fill="#2d0d2d" />
            <rect x="55" y="61" width="22" height="28" rx="3" fill="#1a051a" />
            <circle cx="66" cy="70" r="5" fill="#ff80b0" opacity="0.6" />
            <text x="44" y="70" textAnchor="middle" fontFamily="sans-serif" fontSize="4" fill="#ff80b0">PHOTO</text>
            <text x="60" y="104" textAnchor="middle" fontFamily="sans-serif" fontSize="5" fill="#ffb0d8">QR CODE SCAN</text>
            <rect x="30" y="130" width="60" height="8" rx="2" fill="#2a0a2a" />
            <text x="60" y="136" textAnchor="middle" fontFamily="sans-serif" fontSize="4" fill="#ff80b0">[ QR SCAN ] ▶</text>
            <rect x="30" y="145" width="60" height="10" rx="3" fill="#2a0a2a" />
            <text x="60" y="153" textAnchor="middle" fontFamily="sans-serif" fontSize="4" fill="#ffaacc">💵 CASH INSERT</text>
            <rect x="30" y="162" width="60" height="12" rx="3" fill="#1a051a" />
            <text x="60" y="170" textAnchor="middle" fontFamily="sans-serif" fontSize="4" fill="#ffaacc">CARD DISPENSER ⬇</text>
            <rect x="8" y="205" width="104" height="8" rx="4" fill="#80103a" />
          </svg>
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-xs font-black text-pink-900">
              {copy.namaneKiosk}
            </span>
            <p className="mt-1 text-[11px] text-slate-500">{copy.namaneDesc}</p>
          </div>
        </div>
      </div>

      {/* 4-Step Stepper */}
      <div className="mb-8 rounded-2xl bg-slate-50 p-5">
        <p className="text-sm font-black text-slate-900">{copy.stepTitle}</p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-200/70">
            <span className="text-[10px] font-black text-suwon uppercase">Step 01</span>
            <p className="mt-1 text-xs font-semibold text-slate-700 leading-snug">{copy.step1}</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-200/70">
            <span className="text-[10px] font-black text-suwon uppercase">Step 02</span>
            <p className="mt-1 text-xs font-semibold text-slate-700 leading-snug">{copy.step2}</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-200/70">
            <span className="text-[10px] font-black text-suwon uppercase">Step 03</span>
            <p className="mt-1 text-xs font-semibold text-slate-700 leading-snug">{copy.step3}</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-200/70">
            <span className="text-[10px] font-black text-suwon uppercase">Step 04</span>
            <p className="mt-1 text-xs font-semibold text-slate-700 leading-snug">{copy.step4}</p>
          </div>
        </div>
      </div>

      {/* Interactive Card Selection Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {(['wowpass', 'namane', 'tmoney', 'single'] as CardType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedCard(type)}
              className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                selectedCard === type
                  ? 'bg-suwon text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'wowpass'
                ? copy.tabWowpass
                : type === 'namane'
                ? copy.tabNamane
                : type === 'tmoney'
                ? copy.tabTmoney
                : copy.tabSingle}
            </button>
          ))}
        </div>

        {/* Selected Card Visual & Details */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-black text-suwon">
                {currentCardInfo.tag}
              </span>
              <span className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">
                {currentCardInfo.badge}
              </span>
            </div>
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-800 leading-relaxed">
            {currentCardInfo.summary}
          </p>

          <ul className="mt-4 space-y-2 text-xs font-medium text-slate-600">
            {currentCardInfo.points.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-suwon">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs font-bold text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200/80">
            {currentCardInfo.caution}
          </p>
        </div>
      </div>

      {/* Detailed Kiosk Installation Locations */}
      <div className="mt-8">
        <h3 className="text-base font-black text-slate-900 mb-4">{copy.locationsTitle}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Suwon Station */}
          <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4">
            <p className="text-xs font-black text-orange-950 flex items-center gap-1">
              <span>📍</span> {copy.suwonStation}
            </p>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {copy.suwonStationDesc}
            </p>
          </div>

          {/* Incheon Airport T1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black text-slate-900 flex items-center gap-1">
              <span>✈️</span> {copy.incheonT1}
            </p>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {copy.incheonT1Desc}
            </p>
          </div>

          {/* Incheon Airport T2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black text-slate-900 flex items-center gap-1">
              <span>✈️</span> {copy.incheonT2}
            </p>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {copy.incheonT2Desc}
            </p>
          </div>

          {/* Seoul Station */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black text-slate-900 flex items-center gap-1">
              <span>🚆</span> {copy.seoulStation}
            </p>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {copy.seoulStationDesc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
