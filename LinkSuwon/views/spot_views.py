from flask import Blueprint, request, render_template, redirect, url_for, current_app, jsonify
from LinkSuwon.api_manager import TourAPIManager
from LinkSuwon.database import get_db_connection

# 명소 전용 블루프린트 등록 (URL 접두사: /spot)
bp = Blueprint('spot', __name__, url_prefix='/spot')

api_manager = TourAPIManager()

# 명소 안내 메인 페이지 라우트 (/spot)
@bp.route('/')
def spot_home():
    lang = request.args.get('lang', 'kor')
    search_query = request.args.get('search', '').strip()
    valid_lang = ['kor', 'eng', 'jpn', 'chs', 'cht']

    if lang not in valid_lang:
        lang = 'kor'

    items = []

    try:
        items = api_manager.get_suwon_catalog(lang)
        if not items:
            print("--- [DEBUG] 검색 결과가 존재하지 않습니다. ---")

        # 언제나 로컬 시드 데이터를 로드하고, TourAPI 데이터가 있으면 중복되지 않는 것만 병합
        from LinkSuwon.seed_data import get_seed_places
        seed_items = get_seed_places(lang)

        if items:
            def normalize_title(value):
                return ''.join(str(value or '').lower().split())

            api_ids = {str(item.get('contentid', '')) for item in items}
            api_titles = [normalize_title(item.get('title')) for item in items]
            seed_only = []
            for seed in seed_items:
                seed_id = str(seed.get('contentid', ''))
                seed_title = normalize_title(seed.get('title'))
                title_exists = any(
                    seed_title and (seed_title in api_title or api_title in seed_title)
                    for api_title in api_titles
                    if api_title
                )
                if seed_id not in api_ids and not title_exists:
                    seed_only.append(seed)
            items = items + seed_only
            print(f"--- [데이터 병합] TourAPI {len(items) - len(seed_only)}개 + 로컬 보완 데이터 {len(seed_only)}개 로드 완료 ---")
        else:
            items = seed_items
            print(f"--- [데이터 로드] TourAPI 결손으로 로컬 시드 명소 {len(items)}개 단독 로드 ---")

        # 검색어가 있는 경우 서버사이드에서 1차 필터링 (클라이언트에서도 2차 필터링 수행)
        if search_query and items:
            q = search_query.lower().replace(' ', '')
            
            # "수원화성" 특별 검색 키워드 보정 (8대 명소 ID 강제 매핑 통과)
            if q in ['수원화성', 'suwonhwaseong', '화성', 'hwaseong']:
                hwasung_ids = ['126227', '126228', '126229', '126230', '126231', '126232', '126233', '126234']
                items = [
                    item for item in items
                    if str(item.get('contentid', '')) in hwasung_ids
                ]
            else:
                items = [
                    item for item in items
                    if q in item.get('title', '').lower() or q in item.get('addr1', '').lower()
                ]

        print(f"--- [DEBUG] 현재 언어: {lang} / 가져온 데이터: {len(items)}개 (검색어: {search_query or 'N/A'}) ---")
    except Exception as e:
        print(f"데이터 처리 중 에러 발생: {e}")
    
    NCP_CLIENT_ID = current_app.config['NCP_CLIENT_ID']
    return render_template('spot.html', items=items, current_lang=lang, ncp_id=NCP_CLIENT_ID, search_query=search_query)

# 비동기 상세 가이드 정보 반환 API 엔드포인트
@bp.route('/api/detail/<content_id>')
def api_detail(content_id):
    lang = request.args.get('lang', 'kor')
    detail_data = api_manager.get_detail_info(content_id, lang)
    
    item = None
    if detail_data and 'response' in detail_data:
        try:
            body = detail_data['response'].get('body', {})
            items_container = body.get('items', {})
            if items_container and 'item' in items_container:
                item_list = items_container['item']
                item = item_list[0] if isinstance(item_list, list) else item_list
        except Exception as e:
            print(f"API 파싱 실패: {e}")

    # [오프라인 폴백] API 호출 실패 시 로컬 시드 데이터 우선 매핑
    if not item:
        item = api_manager.catalog_cache.get((lang, str(content_id)))

    if not item:
        from LinkSuwon.seed_data import get_seed_places
        seed_items = get_seed_places(lang)
        item = next((x for x in seed_items if str(x['contentid']) == str(content_id)), None)

    # 시드 데이터조차 없는 경우 (기타 명소 등) 플레이스홀더 폴백
    if not item:
        item = {
            'title': '상세 정보를 준비 중입니다.',
            'overview': '이 장소의 상세 설명을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.',
            'addr1': '',
            'homepage': '',
            'infocenter': '',
            'usetime': '',
            'restdate': '',
            'parking': '',
            'usefee': ''
        }

    return jsonify({
        "success": True,
        "title": item.get('title', ''),
        "overview": item.get('overview', ''),
        "addr1": item.get('addr1', ''),
        "homepage": item.get('homepage', ''),
        "infocenter": item.get('infocenter', ''),
        "usetime": item.get('usetime', ''),
        "restdate": item.get('restdate', ''),
        "parking": item.get('parking', ''),
        "usefee": item.get('usefee', ''),
    })

# 상세페이지 라우트 (/spot/detail/<content_id>)
@bp.route('/detail/<content_id>')
def detail(content_id):
    print(f"--- [접속 시도] ID: {content_id} ---")
    lang = request.args.get('lang', 'kor')
    
    # API 매니저를 통해 상세 데이터 수신
    detail_data = api_manager.get_detail_info(content_id, lang)
    print(f"--- [DEBUG] 상세 데이터 응답: {detail_data} ---")

    NCP_CLIENT_ID = current_app.config['NCP_CLIENT_ID']

    if detail_data and 'response' in detail_data:
        try:
            body = detail_data['response'].get('body', {})
            items_container = body.get('items', {})
            
            if items_container and 'item' in items_container:
                item_list = items_container['item']
                # 단일 객체 예외 처리 방어 코드 적용
                item = item_list[0] if isinstance(item_list, list) else item_list
                return render_template('detail.html', item=item, current_lang=lang, ncp_id=NCP_CLIENT_ID)
            
            print("--- [DEBUG] 상세 데이터 'item' 항목이 없음 ---")
        except Exception as e:
            print(f"--- [DEBUG] 상세 데이터 파싱 중 예외 발생: {e} ---")

    # [오프라인 폴백] API 호출 실패 시 시드 데이터 우선 매핑
    from LinkSuwon.seed_data import get_seed_places
    seed_items = get_seed_places(lang)
    matched_seed = next((x for x in seed_items if str(x['contentid']) == str(content_id)), None)
    if not matched_seed:
        matched_seed = api_manager.catalog_cache.get((lang, str(content_id)))
    if matched_seed:
        print("--- [오프라인 폴백] 시드 데이터 매핑 성공 ---")
        return render_template('detail.html', item=matched_seed, current_lang=lang, ncp_id=NCP_CLIENT_ID)

    # 시드 데이터조차 없는 기타 장소(예: 추가된 맛집)인 경우, 프론트엔드가 LocalStorage에서 복구하도록 가짜 뼈대 전송
    placeholder_item = {
        'contentid': content_id,
        'title': '상세 정보를 준비 중입니다.',
        'addr1': '',
        'firstimage': '',
        'overview': '이 장소의 상세 설명을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.',
        'mapx': '127.014',
        'mapy': '37.282',
        'is_offline_placeholder': True
    }
    print("--- [오프라인 폴백] 플레이스홀더 데이터 전송 ---")
    return render_template('detail.html', item=placeholder_item, current_lang=lang, ncp_id=NCP_CLIENT_ID)

@bp.route('/api/talk/<content_id>', methods=['GET'])
def get_spot_talks(content_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT nickname, message, congestion, created_at FROM spot_talks WHERE contentid = ? ORDER BY id DESC LIMIT 20",
            (content_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        
        talks = []
        for r in rows:
            talks.append({
                'nickname': r['nickname'],
                'message': r['message'],
                'congestion': r['congestion'],
                'created_at': r['created_at']
            })
        return jsonify({'success': True, 'talks': talks})
    except Exception as e:
        print(f"❌ [Get Talks Error] {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@bp.route('/api/talk/<content_id>', methods=['POST'])
def add_spot_talk(content_id):
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
        
    nickname = data.get('nickname', '').strip()
    message = data.get('message', '').strip()
    congestion = data.get('congestion', 'normal').strip()
    
    if not nickname or not message:
        return jsonify({'success': False, 'message': 'Nickname and message are required'}), 400
        
    if len(nickname) > 20:
        return jsonify({'success': False, 'message': 'Nickname must be under 20 characters'}), 400
        
    if len(message) > 100:
        return jsonify({'success': False, 'message': 'Message must be under 100 characters'}), 400
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO spot_talks (contentid, nickname, message, congestion) VALUES (?, ?, ?, ?)",
            (content_id, nickname, message, congestion)
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        print(f"❌ [Add Talk Error] {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
