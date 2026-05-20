from flask import Blueprint, request, render_template, redirect, url_for, current_app, jsonify
from LinkSuwon.api_manager import TourAPIManager

# 명소 전용 블루프린트 등록 (URL 접두사: /spot)
bp = Blueprint('spot', __name__, url_prefix='/spot')

api_manager = TourAPIManager()

# 명소 안내 메인 페이지 라우트 (/spot)
@bp.route('/')
def spot_home():
    lang = request.args.get('lang', 'kor')
    valid_lang = ['kor', 'eng', 'jpn', 'chs', 'cht']

    if lang not in valid_lang:
        lang = 'kor'

    data = api_manager.get_suwon_data(lang)
    items = []

    try:
        if data and isinstance(data, dict):
            response = data.get('response', {})
            body = response.get('body', {})
            items_container = body.get('items')
            
            if items_container and isinstance(items_container, dict):
                items = items_container.get('item', [])
                if isinstance(items, dict):
                    items = [items]
            elif not items_container:
                print("--- [DEBUG] 검색 결과가 존재하지 않습니다. ---")

        print(f"--- [DEBUG] 현재 언어: {lang} / 가져온 데이터: {len(items)}개 ---")
    except Exception as e:
        print(f"데이터 처리 중 에러 발생: {e}")
    
    NCP_CLIENT_ID = current_app.config['NCP_CLIENT_ID']
    return render_template('spot.html', items=items, current_lang=lang, ncp_id=NCP_CLIENT_ID)

# 비동기 상세 가이드 정보 반환 API 엔드포인트
@bp.route('/api/detail/<content_id>')
def api_detail(content_id):
    lang = request.args.get('lang', 'kor')
    detail_data = api_manager.get_detail_info(content_id, lang)
    
    if detail_data and 'response' in detail_data:
        try:
            body = detail_data['response'].get('body', {})
            items_container = body.get('items', {})
            
            if items_container and 'item' in items_container:
                item_list = items_container['item']
                item = item_list[0] if isinstance(item_list, list) else item_list
                
                # 가이드 소개글 및 주소 데이터를 JSON 규격으로 전송
                return jsonify({
                    "success": True,
                    "title": item.get('title', ''),
                    "overview": item.get('overview', '상세 설명 정보가 존재하지 않습니다.'),
                    "addr1": item.get('addr1', ''),
                    "homepage": item.get('homepage', '')
                })
        except Exception as e:
            return jsonify({"success": False, "error": str(e)})
            
    return jsonify({"success": False, "error": "데이터를 찾을 수 없습니다."})

# 상세페이지 라우트 (/spot/detail/<content_id>)
@bp.route('/detail/<content_id>')
def detail(content_id):
    print(f"--- [접속 시도] ID: {content_id} ---")
    lang = request.args.get('lang', 'kor')
    
    # API 매니저를 통해 상세 데이터 수신
    detail_data = api_manager.get_detail_info(content_id, lang)
    print(f"--- [DEBUG] 상세 데이터 응답: {detail_data} ---")

    if detail_data and 'response' in detail_data:
        try:
            body = detail_data['response'].get('body', {})
            items_container = body.get('items', {})
            
            if items_container and 'item' in items_container:
                item_list = items_container['item']
                # 단일 객체 예외 처리 방어 코드 적용
                item = item_list[0] if isinstance(item_list, list) else item_list
                
                NCP_CLIENT_ID = current_app.config['NCP_CLIENT_ID']
                return render_template('detail.html', item=item, current_lang=lang, ncp_id=NCP_CLIENT_ID)
            
            print("--- [DEBUG] 상세 데이터 'item' 항목이 없음 ---")
        except Exception as e:
            print(f"--- [DEBUG] 상세 데이터 파싱 중 예외 발생: {e} ---")
    
    # 데이터 조회 실패 시 메인 랜딩 페이지로 안전하게 퇴각
    return redirect(url_for('main.index', lang=lang))