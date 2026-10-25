# Small unit tests for grade normalization and allowed_grades union logic
import json

from api import _shared


def test_translation_bundle_reloads_when_file_changes(monkeypatch, tmp_path):
    bundle_path = tmp_path / 'curriculum_translations.json'
    monkeypatch.setattr(_shared, 'CURRICULUM_TRANSLATIONS_PATH', str(bundle_path))
    bundle_path.write_text(json.dumps({
        'schema_version': 1,
        'locales': {'fr': {'key': 'bonjour'}},
    }), encoding='utf-8')

    assert _shared._load_curriculum_translations()['fr']['key'] == 'bonjour'

    bundle_path.write_text(json.dumps({
        'schema_version': 1,
        'locales': {'fr': {'key': 'salutations'}},
    }), encoding='utf-8')

    assert _shared._load_curriculum_translations()['fr']['key'] == 'salutations'


def test_normalize_grade_tokens_union_contains_one():
    # descriptive (range/band) string that may not enumerate '1'
    descriptive = "Elementary Schools (PK–5/PK–8)"
    # explicit list that includes '1'
    explicit = "PK, 0K, 1, 2, 3, 4, 5"

    desc_tokens = set(_shared._normalize_grade_tokens(descriptive))
    exp_tokens = set(_shared._normalize_grade_tokens(explicit))

    allowed = desc_tokens.union(exp_tokens)

    # allowed_grades should include '1' when explicit fields are present
    assert '1' in allowed, f"expected '1' in allowed grades, got {allowed}"


def test_normalize_grade_tokens_basic_range():
    tokens = set(_shared._normalize_grade_tokens("K-2"))
    # ensure range parsing includes K and upper bound 2
    assert 'K' in tokens
    assert '2' in tokens


def test_unavailable_curriculum_response_has_safe_rendering_contract(monkeypatch):
    monkeypatch.setattr(
        _shared,
        '_fetch_schools_csv',
        lambda: [{
            'school_name': 'J.H.S. 278 Marine Park',
            'district_#': '22',
            'grade': 'Middle Schools (6–8)',
            'grade_level': '6, 7, 8',
            'curriculum': 'N/A',
        }],
    )

    for grade in ['K', *[str(value) for value in range(1, 9)]]:
        response = _shared.build_search({
            'school': 'J.H.S. 278 Marine Park',
            'district': '22',
            'grade': grade,
        })

        assert response['message_type'] == 'curriculum_not_rolled_out'
        assert 'NYC Reads has not yet rolled out at this school.' in response['message']
        assert '<a ' not in response['message']


def test_build_search_returns_saved_translations_and_keeps_original_book_title(monkeypatch):
    module_title = 'Building a Community of Learners'
    question = 'How do we become a community of learners?'
    genres = 'Informational text'
    book_title = 'The Name Jar'
    translations = {
        'fr': {
            _shared.curriculum_text_key(module_title): 'Créer une communauté d’apprenants',
            _shared.curriculum_text_key(question): 'Comment créer une communauté d’apprenants ?',
            _shared.curriculum_text_key(genres): 'Texte informatif',
            _shared.curriculum_text_key(book_title): 'Le bocal des prénoms',
        }
    }
    monkeypatch.setattr(_shared, '_fetch_schools_csv', lambda: [{
        'school_name': 'PS 001',
        'district_#': '1',
        'grade_level': '1',
        'curriculum': 'HMH Into Reading',
    }])
    monkeypatch.setattr(_shared, '_fetch_pacing_csv', lambda: [{
        'curriculum': 'HMH Into Reading',
        'grade_level': '1',
        'module': '1',
        'theme': module_title,
        'essential_questions': question,
        'text_genres': genres,
        'start_md': '08-01',
        'end_md': '09-15',
        'reading_list_1': book_title,
    }])
    monkeypatch.setattr(_shared, '_load_curriculum_translations', lambda: translations)

    response = _shared.build_search({
        'school': 'PS 001',
        'district': '1',
        'grade': '1',
        'language': 'fr',
    })

    result = response['results'][0]
    assert result['module_title'] == module_title
    assert result['books'][0]['title'] == book_title
    assert result['translations']['fr']['module_title'] == 'Créer une communauté d’apprenants'
    assert result['translations']['fr']['essential_question'] == 'Comment créer une communauté d’apprenants ?'
    assert result['translations']['fr']['text_genres'] == 'Texte informatif'
    assert result['translations']['fr']['books'][book_title] == 'Le bocal des prénoms'


def test_build_modules_includes_saved_module_title_translation(monkeypatch):
    title = 'The Renaissance'
    translation = 'La Renaissance'
    monkeypatch.setattr(_shared, '_fetch_pacing_csv', lambda: [{
        'curriculum': 'HMH Into Reading',
        'grade_level': '4',
        'module': '2',
        'theme': title,
        'start_md': '10-01',
        'end_md': '11-15',
    }])
    monkeypatch.setattr(_shared, '_load_curriculum_translations', lambda: {
        'fr': {_shared.curriculum_text_key(title): translation}
    })

    response = _shared.build_modules('HMH Into Reading', '4', 'fr')

    assert response['modules'][0]['module_title'] == title
    assert response['modules'][0]['translations']['fr']['module_title'] == translation


def test_search_and_module_routes_forward_selected_language(monkeypatch):
    from api import index as api_index

    monkeypatch.setattr(api_index, 'build_search', lambda params: {'language': params['language']})
    monkeypatch.setattr(
        api_index, 'build_modules',
        lambda curriculum, grade, language: {'language': language},
    )
    client = api_index.app.test_client()

    search_response = client.get('/api/search?language=fr')
    modules_response = client.get('/api/modules?curriculum=HMH&grade=3&language=fr')

    assert search_response.get_json() == {'language': 'fr'}
    assert modules_response.get_json() == {'language': 'fr'}
