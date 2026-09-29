# jf open 粉圓 2.1 (jf-openhuninn)

由 justfont 釋出，SIL Open Font License 1.1 授權，允許嵌入與再散布。
來源：https://github.com/justfont/open-huninn-font

`jf-openhuninn-subset.woff2` 是子集化後的版本，只保留這個 app 介面用到的
字元加上常用中文字（525 字，103 KB；完整字型為 11,988 字、4.7 MB）。

要重新產生（例如新增了含新字的文案）：

```bash
pyftsubset jf-openhuninn-2.1.ttf \
  --text-file=chars.txt \
  --output-file=jf-openhuninn-subset.woff2 \
  --flavor=woff2 --layout-features='*' --no-hinting --desubroutinize
```
