# 專案佈署說明

教你如何把這個專案佈署到主機上。

※注意：此版本尚未解決 logs 目錄的權限問題，將於後續版本解決 (TODO:解決後移除此行)。

## 注意事項

請勿在此目錄內執行 `deploy.sh`。請先讀完說明。

## 建立目錄結構

建議建立以下的目錄結構，以便 `建立 Image` 和 `佈署專案`：

```
/app
  ├─ build
  │  └─ my-project【專案目錄】
  │     └─ deployment
  │        ├─ build-image.sh
  │        ├─ build-image.bat
  │        ├─ update.sh.example
  │        └─ (其他檔案...)
  └─ deploy
     └─ my-project【佈署目錄】
        ├─ update.sh
        ├─ deploy.sh
        └─ (其他檔案...)
```

說明：

- `/app` 可為主機上的任意目錄，建議為 `/app` 或 `/home/{使用者名稱}`。
- `build` 目錄用於放置各專案的原始碼，並進行 Image 的建立。
- `deploy` 目錄用於放置各專案的佈署檔案，並進行專案的佈署。

## 準備步驟

1. 於 `/app` 目錄下建立 `build` 和 `deploy` 目錄。
2. 將專案複製到 `build` 目錄下。可使用 `git clone` 或其他方式。
3. 於 `deploy` 目錄下建立一個空目錄作為【佈署目錄】，並將 `update.sh.example` 複製到該目錄下，並改名為 `update.sh`。
4. 修改 `update.sh` 檔案中的 `PROJ_DIR` 變數，指向【專案目錄】的實際路徑。
5. 不用複製 `deploy.sh` 及其他檔案，只要執行 `update.sh` 即可自動從【專案目錄】複製佈署所需之檔案到【佈署目錄】。

## 建立 Image

1. 可先執行 `sudo git pull` 確保專案為最新版本。
2. 執行 `build-image.sh` (Ubuntu) 或 `build-image.bat` (Windows) 以建立 Image 並自動將 Image 推送到 GAR 的 Docker Registry。

## 佈署及更新

> 📣 注意：必須先建立 Image 才能佈署專案。

1. 如果專案版本有更新，請先執行 `update.sh` 以更新佈署檔案。
2. 執行 `deploy.sh` 佈署專案，將會自動從 GAR 的 Docker Registry 拉取 Image 並執行 Docker Compose。
3. 用 `sudo docker ps` 指令確認 `my-project` 服務是否正常運行。

## 佈署指定版本

- 如果需要佈署指定版本的專案，可以修改【佈署目錄】中 `version.env` 的版本號，然後執行 `deploy.sh`。

## 補充說明

### 設定檔案/目錄權限

- 若你有在專案中新增「會在執行時讀/寫」的檔案或目錄，請修改 `set-permission.sh` 以設定讀寫權限。

### 關於 `version.env`

- 通常不需要 (也不建議) 手動修改此檔案。
- 此檔案用於記錄專案版本。`docker-compose.yml`, `build-image.sh` 和 `deploy.sh` 皆依賴此檔案以取得版本號。
- 當執行 `npm run version x.x.x` 指令更新專案版本時，此檔案也會被自動更新。詳見專案根目錄的 `README.md`。

---

2025.01 楊以宏
