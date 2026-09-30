# くらべるラボ

このリポジトリを、くらべるラボの唯一の正式な開発・公開先とします。

- GitHub: https://github.com/yggdrasilw-spec/3d-ryokan
- 公開サイト: https://yggdrasilw-spec.github.io/3d-ryokan/
- ローカル実行: `python scripts/serve.py --no-browser`

## 検証

`node --test scripts/catalog.test.mjs scripts/units.test.mjs scripts/character.test.mjs scripts/fields.test.mjs scripts/navigation.test.mjs`

## 内容

アプリ本体はリポジトリ直下にあります。`data/` は教材データ、`docs/` は制作・調査資料、`models/` はモデルとライセンス情報、`scripts/` は生成・検証用ツールです。

2026-09-26: 最新版を `sonohoka/3d-ryokan` から移行しました。旧リポジトリの開発履歴もこのリポジトリの履歴に保持しています。

## 素材・出典・クレジット

アプリ画面の「寸法の根拠と素材」「寸法と実寸表示について」に、寸法の参照元やモデル・ライブラリのクレジットを表示しています。詳しくは [`models/README.md`](models/README.md)、[`models/animals/README.md`](models/animals/README.md)、[`vendor/THREE-LICENSE.txt`](vendor/THREE-LICENSE.txt) を参照してください。画面内に表示される商品寸法の参照URLも、各項目の出典として扱っています。

## 権利と免責

このリポジトリの作者が権利を持つコード・文章・素材について、作者は可能な限り著作権その他の権利を放棄し、パブリックドメインとして提供します。誰でも、複製・改変・再配布・商用利用を含め、自由に利用できます。権利放棄が法律上有効でない場合は、同じ目的で最大限無償・無制限の利用を許諾します。

提供物は現状有姿で、明示または黙示の保証はありません。作者は、法律上許される最大限の範囲で、本ソフトウェアや素材の利用・利用不能から生じる損害その他の責任を負いません。

第三者素材（MakeHuman/MPFB由来モデル、水着、動物モデル、Three.js等）は作者の権利放棄の対象外です。それぞれの出典・ライセンス・クレジット表示に従ってください。
