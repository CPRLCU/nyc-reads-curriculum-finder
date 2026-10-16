#!/usr/bin/env python3
"""Export curriculum copy and generate stored translations with Meta M2M100."""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from api import _shared  # noqa: E402

DEFAULT_MANIFEST = ROOT / 'data' / 'curriculum_translation_sources.json'
DEFAULT_BUNDLE = ROOT / 'data' / 'curriculum_translations.json'
MODEL_NAME = 'facebook/m2m100_418M'
LOCALE_CODES = {
    'ar': 'ar',
    'bn': 'bn',
    'fr': 'fr',
    'ht': 'ht',
    'ko': 'ko',
    'zh': 'zh',
    'ru': 'ru',
    'es': 'es',
    'ur': 'ur',
}


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def export_sources(path):
    rows = _shared._fetch_pacing_csv()
    if not rows:
        raise RuntimeError('The pacing guide sheet returned no rows; no translation manifest was written.')

    entries = {}
    for row in rows:
        for header, fallback in (
            ('theme', 'module_title'),
            ('essential_questions', 'essential_question'),
            ('text_genres', 'text_genres'),
        ):
            text = _shared.normalize_text(
                row.get(_shared._normalize_header(header)) or row.get(fallback) or ''
            )
            if text:
                entries[_shared.curriculum_text_key(text)] = text
        for book in _shared._collect_reading_list_items_strict(row):
            title = _shared.normalize_text(book.get('title') or '')
            if title:
                entries[_shared.curriculum_text_key(title)] = title

    write_json(path, {'schema_version': 1, 'entries': dict(sorted(entries.items()))})
    print(f'Wrote {len(entries)} unique strings to {path}')


def load_object(path, description):
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except OSError as exc:
        raise RuntimeError(f'Unable to read {description} at {path}: {exc}') from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f'Invalid JSON in {description} at {path}: {exc}') from exc
    if not isinstance(data, dict):
        raise RuntimeError(f'{description} must be a JSON object: {path}')
    return data


def translate_missing(manifest_path, bundle_path, locales, model_name, batch_size, device):
    manifest = load_object(manifest_path, 'translation source manifest')
    entries = manifest.get('entries')
    if manifest.get('schema_version') != 1 or not isinstance(entries, dict):
        raise RuntimeError('Translation source manifest must have schema_version 1 and an entries object.')
    sources = {
        key: value
        for key, value in entries.items()
        if isinstance(key, str) and isinstance(value, str) and value.strip()
        and _shared.curriculum_text_key(value) == key
    }
    bundle = load_object(bundle_path, 'translation bundle') if bundle_path.exists() else {
        'schema_version': 1,
        'locales': {},
    }
    if bundle.get('schema_version') != 1 or not isinstance(bundle.get('locales'), dict):
        raise RuntimeError('Translation bundle must have schema_version 1 and a locales object.')

    try:
        import torch
        from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
    except ImportError as exc:
        raise RuntimeError(
            'Install scripts/requirements-translation.txt into the translation environment first.'
        ) from exc

    tokenizer = M2M100Tokenizer.from_pretrained(model_name)
    model = M2M100ForConditionalGeneration.from_pretrained(model_name).to(device)
    model.eval()
    bundle['locales'].setdefault('en', {})
    for locale in locales:
        locale_map = bundle['locales'].setdefault(locale, {})
        if not isinstance(locale_map, dict):
            raise RuntimeError(f'Translation bundle locale {locale} must be an object.')
        missing = [(key, text) for key, text in sources.items() if not locale_map.get(key)]
        if not missing:
            print(f'{locale}: already current')
            continue
        try:
            target_language_id = tokenizer.get_lang_id(LOCALE_CODES[locale])
        except (KeyError, ValueError) as exc:
            raise RuntimeError(
                f'The configured M2M100 tokenizer does not support locale {locale}. '
                'Do not publish until a compatible open-source model is configured.'
            ) from exc
        tokenizer.src_lang = 'en'
        for offset in range(0, len(missing), batch_size):
            batch = missing[offset:offset + batch_size]
            encoded = tokenizer(
                [text for _, text in batch],
                return_tensors='pt',
                padding=True,
                truncation=True,
                max_length=512,
            ).to(device)
            with torch.inference_mode():
                generated = model.generate(
                    **encoded,
                    forced_bos_token_id=target_language_id,
                    max_length=512,
                )
            for (key, _), output in zip(batch, generated):
                locale_map[key] = tokenizer.decode(output, skip_special_tokens=True).strip()
            write_json(bundle_path, bundle)
            print(f'{locale}: translated {min(offset + len(batch), len(missing))}/{len(missing)}')
    write_json(bundle_path, bundle)
    print(f'Saved translations to {bundle_path}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest='command', required=True)

    export_parser = subparsers.add_parser('export', help='Fetch the pacing sheet and export source strings')
    export_parser.add_argument('--output', type=Path, default=DEFAULT_MANIFEST)

    translate_parser = subparsers.add_parser('translate', help='Translate missing strings into stored locale files')
    translate_parser.add_argument('--manifest', type=Path, default=DEFAULT_MANIFEST)
    translate_parser.add_argument('--output', type=Path, default=DEFAULT_BUNDLE)
    translate_parser.add_argument('--locales', nargs='+', choices=LOCALE_CODES, default=list(LOCALE_CODES))
    translate_parser.add_argument('--model', default=MODEL_NAME)
    translate_parser.add_argument('--batch-size', type=int, default=8)
    translate_parser.add_argument('--device', default='cpu')

    args = parser.parse_args()
    try:
        if args.command == 'export':
            export_sources(args.output)
        else:
            if args.batch_size < 1:
                raise RuntimeError('--batch-size must be positive.')
            translate_missing(
                args.manifest, args.output, args.locales, args.model, args.batch_size, args.device
            )
    except RuntimeError as exc:
        parser.error(str(exc))


if __name__ == '__main__':
    main()
