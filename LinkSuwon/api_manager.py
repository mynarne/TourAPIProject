import os
import requests
import re
import urllib3
from urllib.parse import unquote

# SSL Verification 비활성화 시 터미널 경고 메세지 억제
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
from korean_romanizer.romanizer import Romanizer
import pykakasi

from LinkSuwon.config import Config
from LinkSuwon.seed_data import get_seed_places

class TourAPIManager():
    def __init__(self):
        # Config 클래스로부터 설정값 주입
        self.api_key = unquote(Config.TOUR_API_KEY) if Config.TOUR_API_KEY else None
        self.base_url = 'https://apis.data.go.kr/B551011'
        self.gemini_api_key = Config.GEMINI_API_KEY
        self.ssl_verify = Config.SSL_VERIFY

        # 일본어 변환기 설정
        self.kks = pykakasi.kakasi()

        # 언어별 서비스 경로 매핑
        self.service_map = {
            'kor': 'KorService2',  # 국문
            'eng': 'EngService2',  # 영문
            'jpn': 'JpnService2',  # 일문
            'chs': 'ChsService2',  # 중문_간체
            'cht': 'ChtService2'   # 중문_번체
        }

    def force_https(self, url_str):
        if not url_str:
            return url_str
        if url_str.startswith('http://'):
            return url_str.replace('http://', 'https://', 1)
        return url_str

    def get_suwon_data(self, lang='kor'):
        service_map = self.service_map.get(lang, 'KorService2')
        url = f'{self.base_url}/{service_map}/areaBasedList2'

        content_type = '12' if lang == 'kor' else '76'

        params = {
            'serviceKey': self.api_key,
            'areaCode': '31',         # 경기도
            'sigunguCode': '13',      # 수원시
            'contentTypeId': content_type,    # 관광지
            'MobileOS': 'ETC',
            'MobileApp': 'LinkSuwon',
            '_type': 'json',
            'numOfRows': 20,
            'pageNo': 1,
        }

        # API 호출 실패 또는 오류 발생 시 사용될 Fallback 생성 헬퍼
        def make_fallback_response():
            print(f"--- [DEBUG] API 장애 감지. {lang} 언어용 로컬 Seed Data를 로드합니다. ---")
            local_items = get_seed_places(lang)
            return {
                "response": {
                    "header": {
                        "resultCode": "0000",
                        "resultMsg": "SUCCESS (LOCAL FALLBACK)"
                    },
                    "body": {
                        "items": {
                            "item": local_items
                        },
                        "numOfRows": len(local_items),
                        "pageNo": 1,
                        "totalCount": len(local_items)
                    }
                }
            }

        if not self.api_key:
            return make_fallback_response()

        try:
            # [보안 적용] 전역 SSL 검증 옵션 바인딩
            response = requests.get(url, params=params, timeout=10, verify=self.ssl_verify)
            
            if response.status_code == 200:
                res_data = response.json()
                
                # API 응답 헤더 확인
                header = res_data.get('response', {}).get('header', {})
                if header.get('resultCode') != '0000':
                    print(f"--- [DEBUG] API 응답 에러 코드: {header.get('resultCode')} ---")
                    return make_fallback_response()

                # 아이템별 발음 및 설명(Seed) 주입
                items_wrapper = res_data.get('response', {}).get('body', {}).get('items')
                if items_wrapper and 'item' in items_wrapper:
                    items = items_wrapper['item']
                    # 단일 아이템일 경우 리스트화
                    if isinstance(items, dict):
                        items = [items]
                        items_wrapper['item'] = items

                    # [이미지 수혈] 외국어 환경(lang != 'kor')이고 API 호출 성공 시 국문 이미지 사전 구축
                    kor_images = {}
                    if lang != 'kor':
                        try:
                            # 1. 로컬 국문 시드 데이터에서 이미지 수집
                            for seed in get_seed_places('kor'):
                                c_id = seed.get('contentid')
                                img = seed.get('firstimage')
                                img2 = seed.get('firstimage2')
                                if c_id and img:
                                    kor_images[c_id] = (img, img2)
                            
                            # 2. 국문 API 목록에서 이미지 수집 (1회 호출)
                            kor_res = self.get_suwon_data(lang='kor')
                            if kor_res:
                                kor_items = kor_res.get('response', {}).get('body', {}).get('items', {}).get('item', [])
                                if isinstance(kor_items, dict):
                                    kor_items = [kor_items]
                                for k_item in kor_items:
                                    c_id = k_item.get('contentid')
                                    img = k_item.get('firstimage')
                                    img2 = k_item.get('firstimage2')
                                    if c_id and img:
                                        kor_images[c_id] = (img, img2)
                        except Exception as img_err:
                            print(f"--- [DEBUG] 국문 이미지 수집 실패 (무시): {img_err} ---")

                    for item in items:
                        title = item.get('title', '')
                        ko_name = title.split('(')[-1].replace(')', '').strip() if '(' in title else title
                        c_id = item.get('contentid')

                        # 만약 해당 명소의 외국어 이미지가 누락된 경우 국문 이미지 수혈
                        if lang != 'kor' and c_id in kor_images:
                            if not item.get('firstimage'):
                                item['firstimage'] = kor_images[c_id][0]
                                print(f"--- [DEBUG] 리스트 이미지 수혈 완료 (firstimage): {title} ({c_id}) ---")
                            if not item.get('firstimage2') and kor_images[c_id][1]:
                                item['firstimage2'] = kor_images[c_id][1]

                        # 발음 변환 (영문 로마자 위주)
                        if lang == 'eng':
                            r = Romanizer(ko_name)
                            item['pronunciation'] = f"Pronounce: {r.romanize()}"
                        elif lang == 'jpn':
                            item['pronunciation'] = f"読み方: {ko_name}"
                        elif lang in ['chs', 'cht']:
                            item['pronunciation'] = f"韩语发音: {ko_name}"
                        else:
                            item['pronunciation'] = ""

                        # 설명(Overview) 주입: 기본적으로 주소를 사용하되, 대표적인 곳은 하드코딩 백업
                        if not item.get('overview'):
                            if '방화수류정' in ko_name or 'Banghwasuryujeong' in title:
                                item['overview'] = "수원화성에서 가장 경관이 아름다운 곳으로, 연못인 용연과의 조화가 일품."
                            elif '창룡문' in ko_name or 'Changnyongmun' in title:
                                item['overview'] = "수원화성의 동문으로, 주변에 넓은 잔디밭이 있어 나들이하기 딱 좋습니다."
                            elif '본수원갈비' in ko_name or 'Bonsuwon' in title:
                                item['overview'] = "수원을 대표하는 갈비 명가로, 풍부한 육즙과 깊은 맛이 일품입니다."
                            else:
                                item['overview'] = item.get('addr1', '수원의 정취를 느낄 수 있는 멋진 장소!')

                # 최종 반환 전 혼합 콘텐츠(Mixed Content) 대응을 위한 모든 이미지 URL https 강제 전환
                if items_wrapper and 'item' in items_wrapper:
                    for item in items_wrapper['item']:
                        if item.get('firstimage'):
                            item['firstimage'] = self.force_https(item['firstimage'])
                        if item.get('firstimage2'):
                            item['firstimage2'] = self.force_https(item['firstimage2'])

                # 데이터 개수 로그로 확인
                body = res_data.get('response', {}).get('body', {})
                total = body.get('totalCount', 0)
                print(f"--- [DEBUG] 수원 데이터 수신 성공! 총 {total}개 ---")
                
                return res_data
            else:
                print(f"--- [DEBUG] HTTP 에러 발생: {response.status_code} ---")
                return make_fallback_response()
                
        except requests.exceptions.SSLError as ssl_err:
            print(f"🚨 [SSL ERROR] get_suwon_data HTTPS 인증서 검증 실패: {ssl_err}")
            print("   (자가 서명 개발 환경인 경우 .env에 SSL_VERIFY=False 설정을 적용하고 재시도하십시오.)")
            return make_fallback_response()
        except Exception as e:
            print(f"--- [DEBUG] 예외 발생: {str(e)} ---")
            return make_fallback_response()
        
    def get_detail_info(self, content_id, lang='kor', content_type_id=None):
        # content_id가 로컬 Seed Data에 해당하는 경우 로컬에서 즉시 리턴
        if str(content_id) in ['126227', '126228', '126229', '126230', '126231', '126232', '126233', '126234']:
            local_items = get_seed_places(lang)
            matched = next((item for item in local_items if item['contentid'] == str(content_id)), None)
            if matched:
                # [이미지 수혈] 외국어 시드 데이터의 이미지가 누락된 경우 국문 시드 데이터의 이미지 매핑 적용
                if lang != 'kor' and not matched.get('firstimage'):
                    try:
                        kor_seeds = get_seed_places('kor')
                        k_matched = next((k for k in kor_seeds if k['contentid'] == str(content_id)), None)
                        if k_matched and k_matched.get('firstimage'):
                            matched['firstimage'] = k_matched.get('firstimage')
                            if k_matched.get('firstimage2'):
                                matched['firstimage2'] = k_matched.get('firstimage2')
                            print(f"--- [DEBUG] 시드 명소 이미지 수혈 완료: {content_id} ---")
                    except Exception as seed_img_err:
                        print(f"--- [DEBUG] 시드 명소 이미지 수혈 실패: {seed_img_err} ---")
                if matched.get('firstimage'):
                    matched['firstimage'] = self.force_https(matched['firstimage'])
                if matched.get('firstimage2'):
                    matched['firstimage2'] = self.force_https(matched['firstimage2'])
                return {
                    "response": {
                        "header": {"resultCode": "0000", "resultMsg": "SUCCESS (LOCAL DETAIL)"},
                        "body": {
                            "items": {"item": [matched]}
                        }
                    }
                }

        service_map = self.service_map.get(lang, 'KorService2')
        c_type = content_type_id
        if not c_type:
            c_type = '12' if lang == 'kor' else '76' # 기본 관광지 분류로 폴백
            
        base_params = {
            'serviceKey': self.api_key,
            'contentId': content_id,
            'contentTypeId': c_type,
            'MobileOS': 'ETC',
            'MobileApp': 'LinkSuwon',
            '_type': 'json',
        }

        if not self.api_key:
            return None

        try:
            # 1차: detailCommon2 — overview, 주소, 이미지
            common_url = f'{self.base_url}/{service_map}/detailCommon2'
            # 다국어 서비스는 파라미터명 끝자리가 소문자 'Yn'인 스펙 충돌 보정
            if lang == 'kor':
                common_params = {**base_params, 'overviewYN': 'Y', 'addrinfoYN': 'Y', 'firstImageYN': 'Y', 'mapinfoYN': 'Y'}
            else:
                common_params = {**base_params, 'overviewYn': 'Y', 'addrinfoYn': 'Y', 'firstImageYn': 'Y', 'mapinfoYn': 'Y'}
            common_res = requests.get(common_url, params=common_params, timeout=10, verify=self.ssl_verify)

            if common_res.status_code != 200:
                return None

            res_data = common_res.json()
            header = res_data.get('response', {}).get('header', {})
            if header.get('resultCode') != '0000':
                print(f"--- [DEBUG] detailCommon2 API 응답 에러: {header.get('resultMsg')} (코드: {header.get('resultCode')}) ---")
                return None

            # item 추출
            body = res_data.get('response', {}).get('body', {})
            items_container = body.get('items', {})
            if not items_container or 'item' not in items_container:
                return res_data

            item_list = items_container['item']
            item = item_list[0] if isinstance(item_list, list) else item_list

            # [이미지 수혈] 외국어 환경에서 상세 정보의 이미지가 누락된 경우 국문 상세 API를 동기식으로 찔러서 이미지 수혈
            if lang != 'kor' and not item.get('firstimage'):
                try:
                    kor_common_params = {**base_params, 'overviewYN': 'Y', 'addrinfoYN': 'Y', 'firstImageYN': 'Y', 'mapinfoYN': 'Y'}
                    # 국문 서비스 경로 (KorService2) 강제 호출
                    kor_common_url = f'{self.base_url}/KorService2/detailCommon2'
                    kor_common_res = requests.get(kor_common_url, params=kor_common_params, timeout=10, verify=self.ssl_verify)
                    if kor_common_res.status_code == 200:
                        kor_res_data = kor_common_res.json()
                        kor_item_list = kor_res_data.get('response', {}).get('body', {}).get('items', {}).get('item', [])
                        if kor_item_list:
                            kor_item = kor_item_list[0] if isinstance(kor_item_list, list) else kor_item_list
                            if kor_item.get('firstimage'):
                                item['firstimage'] = kor_item.get('firstimage')
                                if kor_item.get('firstimage2'):
                                    item['firstimage2'] = kor_item.get('firstimage2')
                                print(f"--- [DEBUG] 외국어 상세 정보 이미지 수혈 완료 (detailCommon2): {content_id} ---")
                except Exception as detail_img_err:
                    print(f"--- [DEBUG] 국문 상세 정보 이미지 수혈 실패: {detail_img_err} ---")

            # 2차: detailIntro2 — 한국어 서비스인 경우에만 전화번호, 영업시간, 휴무일, 주차, 입장료 등 추가 병합
            if lang == 'kor':
                try:
                    intro_url = f'{self.base_url}/{service_map}/detailIntro2'
                    intro_res = requests.get(intro_url, params=base_params, timeout=8, verify=self.ssl_verify)
                    if intro_res.status_code == 200:
                        intro_data = intro_res.json()
                        intro_header = intro_data.get('response', {}).get('header', {})
                        if intro_header.get('resultCode') == '0000':
                            intro_items = intro_data.get('response', {}).get('body', {}).get('items', {})
                            if intro_items and 'item' in intro_items:
                                intro_item_list = intro_items['item']
                                intro_item = intro_item_list[0] if isinstance(intro_item_list, list) else intro_item_list
                                # intro 정보를 main item에 병합
                                item.update({
                                    'infocenter': intro_item.get('infocenter', intro_item.get('infocenterfood', intro_item.get('infocenterculture', ''))),
                                    'usetime': intro_item.get('usetime', intro_item.get('usetimefood', intro_item.get('usetimeculture', ''))),
                                    'restdate': intro_item.get('restdate', intro_item.get('restdatefood', intro_item.get('restdateculture', ''))),
                                    'parking': intro_item.get('parking', intro_item.get('parkingfood', intro_item.get('parkingculture', ''))),
                                    'usefee': intro_item.get('usefee', intro_item.get('usefeeculture', '')),
                                    'accomcount': intro_item.get('accomcount', ''),
                                })
                                print(f"--- [DEBUG] detailIntro2 병합 성공: {content_id} ---")
                except Exception as intro_err:
                    print(f"--- [DEBUG] detailIntro2 병합 실패 (무시): {intro_err} ---")

            # 최종 반환 전 혼합 콘텐츠(Mixed Content) 대응을 위한 이미지 URL https 강제 전환
            if item.get('firstimage'):
                item['firstimage'] = self.force_https(item['firstimage'])
            if item.get('firstimage2'):
                item['firstimage2'] = self.force_https(item['firstimage2'])

            # 병합된 item을 원래 구조에 다시 넣어서 반환
            if isinstance(items_container.get('item'), list):
                items_container['item'][0] = item
            else:
                items_container['item'] = item

            return res_data

        except requests.exceptions.SSLError as ssl_err:
            print(f"🚨 [SSL ERROR] get_detail_info HTTPS 인증서 검증 실패: {ssl_err}")
            print("   (자가 서명 개발 환경인 경우 .env에 SSL_VERIFY=False 설정을 적용하고 재시도하십시오.)")
            return None
        except Exception as e:
            print(f"--- [DEBUG] 상세정보 예외 발생: {str(e)} ---")
            return None

    # 제미나이 호출 함수
    def ask_gemini_multilingual(self, user_input: str, target_language: str, user_name: str = None) -> str:
        if not self.gemini_api_key:
            return "API key is missing. Please check your .env file."

        from datetime import datetime
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 시스템 프롬프트: 챗봇의 정체성을 '수원 관광 가이드'로 강제 고정
        system_instruction = (
            "너는 수원시 공식 관광 가이드 AI야. "
            "오직 수원 관광, 대중교통, 여행 팁에 관한 질문에만 답변해. "
            "만약 사용자가 수원 관광과 관련 없는 질문(정치, 사회, 개인적인 잡담 등)을 하면, "
            "정중하게 '수원 관광에 대해서만 도와드릴 수 있습니다'라고 해당 언어로 답변하고 대화를 종료해. "
            f"현재 기준 날짜와 시간은 {current_time} 이며, 모든 날짜/시간 관련 답변은 이 기준을 바탕으로 처리해야 해.\n\n"
            "[중요] 만약 사용자가 수원 여행 일정 추천, 코스 설계, 경로 등을 요청하는 질문을 한다면, "
            "친절히 마크다운으로 일정을 정리한 뒤, 답변의 '가장 마지막 줄'에 반드시 아래 규격의 코스 메타데이터를 덧붙여줘. "
            "단, JSON 포맷은 한 줄로 표현해야 하며 양 끝의 괄호와 문법이 완벽해야 해. "
            "포맷 예시: [COURSE_DATA: {\"title\": \"수원 핵심 1박 2일 코스\", \"places\": [\"화성행궁\", \"방화수류정\", \"수원화성박물관\", \"수원통닭거리\"]}]"
        )

        if user_name:
            system_instruction += (
                f" The user's name is '{user_name}'. Greet them or refer to them by name naturally in the target language "
                f"(e.g., '{user_name}님' in Korean, or '{user_name}' in English)."
            )

        # 언어 코드에 따른 시스템 지시문 정의
        lang_map = {
            'kor': "You must answer in Korean.",
            'eng': "You must answer in English.",
            'jpn': "You must answer in Japanese.",
            'chs': "You must answer in Simplified Chinese.",
            'cht': "You must answer in Traditional Chinese."
        }
        
        system_prompt = lang_map.get(target_language, "You must answer in Korean.")
        
        # [보안 강화] 악성 프롬프트 인젝션 및 개행 필터링
        safe_input = re.sub(r'[\r\n\t]+', ' ', user_input).strip()
        if len(safe_input) > 1000:
            safe_input = safe_input[:1000]

        # REST API 직접 호출 — gemini-2.5-flash (최신 고성능 모델)
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        headers = {
            "Content-Type": "application/json"
        }
        params = {
            "key": self.gemini_api_key
        }
        
        full_system = f"{system_instruction}\n{system_prompt}"
        
        payload = {
            "systemInstruction": {
                "parts": [{"text": full_system}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": safe_input}]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 2048
            }
        }

        
        try:
            # [보안 적용] 전역 SSL 검증 옵션 바인딩
            response = requests.post(url, headers=headers, params=params, json=payload, timeout=15, verify=self.ssl_verify)
            
            if response.status_code == 200:
                res_data = response.json()
                candidates = res_data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "답변을 생성하지 못했습니다.")
                return "답변을 생성하지 못했습니다."
            else:
                print(f"--- [DEBUG] Gemini API 오류 {response.status_code}: {response.text} ---")
                lang_err = {
                    'kor': "죄송합니다. AI 응답에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                    'eng': "Sorry, a temporary error occurred. Please try again shortly.",
                    'jpn': "申し訳ありません。一時的なエラーが発生しました。しばらくしてから再試行してください。",
                    'chs': "抱歉，发生了临时错误。请稍后再试。",
                    'cht': "抱歉，發生了臨時錯誤。請稍後再試。"
                }
                return lang_err.get(target_language, lang_err['eng'])
                
        except Exception as e:
            print(f"--- [DEBUG] 예외 발생: {str(e)} ---")
            return f"에러 발생: {str(e)}"
