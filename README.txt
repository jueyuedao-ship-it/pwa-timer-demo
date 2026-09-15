PWA Timer Demo
==============


構成
----

index.html
style.css
app.js
manifest.webmanifest
sw.js

icons/icon-192.png
icons/icon-512.png


重要
----

PWAのService Workerは、
基本的にHTTPS環境でのみ動作します。

PC上の index.html を直接

file://

で開いただけでは、
PWAのオフライン機能は確認できません。


iPhoneで確認するおすすめ手順
----------------------------

1.
このフォルダをGitHubリポジトリへアップロード

2.
GitHub Pagesを有効化

3.
iPhoneのSafariで公開URLを開く

4.
一度オンライン状態でページを開く

5.
Safariの共有メニュー
→「ホーム画面に追加」

6.
ホーム画面のTimerアイコンから起動

7.
機内モード等でネットを切る

8.
再びホーム画面からTimerを起動

9.
オフラインでもタイマーが開けば成功


補足
----

タイマー状態はlocalStorageに保存します。

iPhoneで画面を閉じている間も、
終了予定時刻から残り時間を再計算します。

このデモは通知機能を実装していません。