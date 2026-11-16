# CHANGELOG

## [1.97] - 2026-11-16

### Added
- 日英切り替え機能を追加（画面右上の「日本語 / English」ボタン、URLパラメータ `?lang=en`、端末保存）。
- ハッシュリンク（`#tab1` `#tab1-trend` `#tab2` `#tab2-total` `#tab2-cash` `#tab3`）の日英両対応。
- 英語表示での金額換算（¥bn表記）および年度換算（FY3/表記）。
- `i18n_core_v1.1.js` および `i18n_en_fuji_v1.0.js` を追加。
- 日本語表示は Ver 1.96 から変更なし。

## [1.96] - 2026-11-15

### Added
- URLハッシュによるタブ・グラフ直接遷移機能を追加（#tab1, #tab1-trend, #tab2, #tab2-total, #tab2-cash, #tab3）。数字・グラフデータに変更なし。

## [1.95] - 2026-11-14

### Changed
- リポジトリ名変更と単独ページ化：`broadcaster-financials` から `broadcaster-financials-fuji-media-hd` にリポジトリ名を変更。
- 入口ページ（ポータル）構成を廃止し、ルート `index.html` にフジ・メディアHD単独ダッシュボード（v1.95）を直接配置。
- `data/` および `social-preview.png` をルート直下に再配置。
- sitemap.xml、README.md、メタ情報を新しいURLに整合。

## [1.94] - 2026-11-14

### Added
- 初回公開：フジ・メディアHD 事業別の収益とキャッシュフロー――実績と試算（2017〜2036年度）ダッシュボードを追加（公開用にタイトル・リード文・OGP設定を更新）。
