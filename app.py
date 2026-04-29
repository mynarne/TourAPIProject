import os
from flask import Flask, redirect, request, render_template, url_for
from dotenv import load_dotenv
from LinkSuwon.api_manager import TourAPIManager

# .env 파일 로드
load_dotenv()

app = Flask(__name__, static_folder = 'LinkSuwon/static', template_folder = 'LinkSuwon/templates')

api_manager = TourAPIManager()
# 네이버 클라이언트 ID 환경 변수 호출
NCP_CLIENT_ID = os.getenv('NAVER_CLIENT_ID')
print(f"--- [DEBUG] 네이버 아이디: {NCP_CLIENT_ID} ---")

@app.route('/')
def index():
    # 사용자가 선택한 언어 감지
    # 기본값은 한국어
    lang = request.args.get('lang', 'kor')

    # 지원하지 않는 언어 사용 시 한국어 강제 고정
    valid_lang = ['kor', 'eng', 'jpn', 'chs', 'cht']

    if lang not in valid_lang:
        lang = 'kor'

    # 구성해둔 api_manager에서 해당 언어 기반 수원 데이터 호출
    data = api_manager.get_suwon_data(lang)
    #print(data)

    # 데이터 파싱
    items = []

    try:
        # API 응답 데이터 구조 확인 및 추출
        # response -> body -> items -> item 순으로 안전하게 접근
        if data and isinstance(data, dict):
            response = data.get('response', {})
            body = response.get('body', {})
            
            # items 내부의 실제 데이터(item) 추출
            # 데이터가 아예 없으면 items가 빈 문자열("")로 올 때가 있어 get을 사용해 방어
            items_container = body.get('items')
            
            if items_container and isinstance(items_container, dict):
                items = items_container.get('item', [])

                # 딱 1개의 데이터가 올 경우 딕셔너리로 반환되는 것 방지 (리스트로 변환)
                if isinstance(items, dict):
                    items = [items]
            elif not items_container:
                # items가 비어있거나 검색 결과가 없을 때의 로그 출력
                print(f"--- [DEBUG] 서버 응답은 성공했으나 검색 결과가 없습니다. ---")

        # 터미널에 가져온 데이터 개수 출력하여 정상 여부 확인
        print(f"--- [DEBUG] 현재 언어: {lang} / 가져온 데이터: {len(items)}개 ---")

    except Exception as e:
        # 만약 에러 발생 시 콘솔에 에러 출력
        print(f"데이터 처리 중 에러 발생: {e}")
    
    # index.html로 데이터, 현재 언어 정보 전달
    return render_template('index.html', items=items, current_lang=lang, ncp_id=NCP_CLIENT_ID)

# 자세히 보기 상세페이지
@app.route('/detail/<content_id>')
def detail(content_id):
    print(f"--- [접속 시도] ID: {content_id} ---")
    lang = request.args.get('lang', 'kor')
    # API 매니저를 통해 상세 데이터 수신
    detail_data = api_manager.get_detail_info(content_id, lang)
    
    # [디버깅 로그] 터미널에 API 응답 결과 출력
    print(f"--- [DEBUG] 상세 데이터 응답: {detail_data} ---")

    # 데이터가 유효한지 겹겹이 확인
    if detail_data and 'response' in detail_data:
        try:
            body = detail_data['response'].get('body', {})
            items_container = body.get('items', {})
            
            if items_container and 'item' in items_container:
                item_list = items_container['item']
                # 리스트면 첫 번째, 딕셔너리면 바로 할당
                item = item_list[0] if isinstance(item_list, list) else item_list
                return render_template('detail.html', item=item, current_lang=lang, ncp_id=NCP_CLIENT_ID)
            
            print("--- [DEBUG] 상세 데이터 'item' 항목이 없음 ---")
        except Exception as e:
            print(f"--- [DEBUG] 상세 데이터 파싱 중 예외 발생: {e} ---")
    
    # 데이터가 없거나 에러나면 메인 페이지로 안전하게 퇴각!
    return redirect(url_for('index', lang=lang))

if __name__ == '__main__':
    # debug True 모드로 실행하여 코드 수정 시 서버 자동 재시작 구현
    # 포트는 5001번을 사용 (맥북 에어 포트 충돌 방지)
    app.run(host='0.0.0.0', port=5001, debug=True)