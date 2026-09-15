const CACHE_NAME =
  "pwa-timer-demo-v1";


const APP_SHELL = [

  "./",

  "./index.html",

  "./style.css",

  "./app.js",

  "./manifest.webmanifest",

  "./icons/icon-192.png",

  "./icons/icon-512.png"
];


/* ------------------------------
   初回インストール
------------------------------ */

self.addEventListener(
  "install",
  (event) => {

    event.waitUntil(

      caches
        .open(
          CACHE_NAME
        )
        .then(
          (cache) =>
            cache.addAll(
              APP_SHELL
            )
        )
    );


    self.skipWaiting();
  }
);


/* ------------------------------
   古いキャッシュ削除
------------------------------ */

self.addEventListener(
  "activate",
  (event) => {

    event.waitUntil(

      caches
        .keys()
        .then(
          (keys) =>

            Promise.all(

              keys

                .filter(
                  (key) =>
                    key
                    !== CACHE_NAME
                )

                .map(
                  (key) =>
                    caches.delete(
                      key
                    )
                )
            )
        )
    );


    self.clients.claim();
  }
);


/* ------------------------------
   リクエスト処理
------------------------------ */

self.addEventListener(
  "fetch",
  (event) => {

    if (
      event.request.method
      !== "GET"
    ) {
      return;
    }


    event.respondWith(

      caches
        .match(
          event.request
        )
        .then(
          (cached) => {

            /*
              キャッシュがあれば
              キャッシュを優先
            */

            if (cached) {
              return cached;
            }


            /*
              なければネットワーク
            */

            return fetch(
              event.request
            )

              .then(
                (response) => {

                  const copy =
                    response.clone();


                  caches
                    .open(
                      CACHE_NAME
                    )
                    .then(
                      (cache) => {

                        cache.put(
                          event.request,
                          copy
                        );
                      }
                    );


                  return response;
                }
              )

              /*
                ネットワークも失敗した場合
                index.htmlを返す
              */

              .catch(
                () =>
                  caches.match(
                    "./index.html"
                  )
              );
          }
        )
    );
  }
);