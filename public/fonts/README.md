# jf open 粉圓 2.1 (jf-openhuninn)

由 justfont 釋出，SIL Open Font License 1.1 授權（全文見 `OFL.txt`），允許嵌入與再散布。
來源：https://github.com/justfont/open-huninn-font

`huninn-*.woff2` 是 `scripts/build-font.mjs` 從完整字型切出來的 unicode-range 區塊，
對應的 `@font-face` 宣告在 `app/huninn.css`。兩者都不要手動編輯——改過介面文案後
重跑腳本即可，它會自己掃描 components/、app/、lib/ 底下的原始碼：

```bash
node scripts/build-font.mjs path/to/jf-openhuninn-2.1.ttf
```

`lib/font-coverage.test.ts` 會檢查介面用到的字都落在第 0 塊裡。忘記重跑腳本時
`npm test` 會失敗，而不是讓那些字默默掉到系統字體。
