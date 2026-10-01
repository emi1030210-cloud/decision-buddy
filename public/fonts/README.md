# jf open 粉圓 2.1 (jf-openhuninn)

由 justfont 釋出，SIL Open Font License 1.1 授權（見 `OFL.txt`），允許嵌入與再散布。
來源：https://github.com/justfont/open-huninn-font

這裡的 `huninn-*.woff2` 是用 `scripts/build-font.mjs` 從完整字型切出來的
unicode-range 區塊，CSS 在 `app/huninn.css`。不要手動編輯這兩者，改用腳本重新產生：

```bash
node scripts/build-font.mjs path/to/jf-openhuninn-2.1.ttf
```
