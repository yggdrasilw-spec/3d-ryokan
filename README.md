# くらべるラボ

このリポジトリを、くらべるラボの唯一の正式な開発・公開先とします。

- GitHub: https://github.com/yggdrasilw-spec/3d-ryokan
- 公開サイト: https://yggdrasilw-spec.github.io/3d-ryokan/
- ローカル実行: `python scripts/serve.py --no-browser`

## 検証

`node --test scripts/catalog.test.mjs scripts/units.test.mjs scripts/character.test.mjs scripts/fields.test.mjs scripts/navigation.test.mjs`

## 内容

`app/` に、長さ・重さ・かさを体験する教材を収録しています。`data/` は教材データ、`docs/` は制作・調査資料、`models/` はモデルとライセンス情報、`scripts/` は生成・検証用ツールです。

2026-09-26: 最新版を `sonohoka/3d-ryokan` から移行しました。旧リポジトリの開発履歴もこのリポジトリの履歴に保持しています。
