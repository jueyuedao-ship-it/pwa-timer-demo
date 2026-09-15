const timerEl =
  document.querySelector("#timer");

const startPauseBtn =
  document.querySelector("#startPause");

const resetBtn =
  document.querySelector("#reset");

const presetButtons = [
  ...document.querySelectorAll(".preset")
];

const pwaStatus =
  document.querySelector("#pwaStatus");

const networkStatus =
  document.querySelector("#networkStatus");


const STORAGE_KEY =
  "pwa-timer-demo-v1";


let selectedSeconds = 5 * 60;

let remainingSeconds =
  selectedSeconds;

let running = false;

let endAt = null;

let tickHandle = null;


/* ------------------------------
   時間表示
------------------------------ */

function formatTime(seconds) {

  const safe =
    Math.max(
      0,
      Math.ceil(seconds)
    );

  const min =
    Math.floor(safe / 60);

  const sec =
    safe % 60;

  return (
    `${String(min).padStart(2, "0")}:` +
    `${String(sec).padStart(2, "0")}`
  );
}


/* ------------------------------
   保存
------------------------------ */

function saveState() {

  const data = {
    selectedSeconds,
    remainingSeconds,
    running,
    endAt
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}


/* ------------------------------
   読み込み
------------------------------ */

function loadState() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEY
        )
      );


    if (!saved) {
      return;
    }


    selectedSeconds =
      Number(saved.selectedSeconds)
      || selectedSeconds;


    running =
      Boolean(saved.running);


    endAt =
      saved.endAt
        ? Number(saved.endAt)
        : null;


    /*
      タイマー実行中だった場合

      「残り秒数」を単純保存するのではなく、
      終了予定時刻との差から再計算する。

      そのため画面を閉じても、
      再度開いた際に時間が進んでいる。
    */

    if (
      running &&
      endAt
    ) {

      remainingSeconds =
        Math.max(
          0,
          Math.ceil(
            (
              endAt -
              Date.now()
            )
            / 1000
          )
        );


      if (
        remainingSeconds <= 0
      ) {

        running = false;

        endAt = null;
      }

    } else {

      remainingSeconds =
        Number(
          saved.remainingSeconds
        );


      if (
        !Number.isFinite(
          remainingSeconds
        )
      ) {

        remainingSeconds =
          selectedSeconds;
      }
    }

  } catch {

    localStorage.removeItem(
      STORAGE_KEY
    );
  }
}


/* ------------------------------
   プリセット表示
------------------------------ */

function updatePresetUI() {

  presetButtons.forEach(
    (button) => {

      const seconds =
        Number(
          button.dataset.minutes
        )
        * 60;


      button.classList.toggle(
        "active",
        seconds === selectedSeconds
      );
    }
  );
}


/* ------------------------------
   UI描画
------------------------------ */

function render() {

  timerEl.textContent =
    formatTime(
      remainingSeconds
    );


  if (running) {

    startPauseBtn.textContent =
      "一時停止";

  } else if (
    remainingSeconds === 0
  ) {

    startPauseBtn.textContent =
      "再開";

  } else {

    startPauseBtn.textContent =
      "開始";
  }


  updatePresetUI();

  saveState();
}


/* ------------------------------
   interval停止
------------------------------ */

function stopTicking() {

  if (!tickHandle) {
    return;
  }


  clearInterval(
    tickHandle
  );


  tickHandle = null;
}


/* ------------------------------
   interval開始
------------------------------ */

function startTicking() {

  stopTicking();


  tickHandle =
    setInterval(
      () => {

        if (
          !running ||
          !endAt
        ) {
          return;
        }


        remainingSeconds =
          Math.max(
            0,
            Math.ceil(
              (
                endAt -
                Date.now()
              )
              / 1000
            )
          );


        if (
          remainingSeconds <= 0
        ) {

          running = false;

          endAt = null;

          stopTicking();


          /*
            Androidなどでは振動する可能性がある。
            iPhone Safariでは制限される場合がある。
          */

          if (
            "vibrate"
            in navigator
          ) {

            navigator.vibrate?.([
              150,
              80,
              150
            ]);
          }
        }


        render();

      },
      250
    );
}


/* ------------------------------
   タイマー開始
------------------------------ */

function startTimer() {

  if (
    remainingSeconds <= 0
  ) {

    remainingSeconds =
      selectedSeconds;
  }


  running = true;


  endAt =
    Date.now()
    +
    remainingSeconds
    * 1000;


  startTicking();

  render();
}


/* ------------------------------
   一時停止
------------------------------ */

function pauseTimer() {

  if (endAt) {

    remainingSeconds =
      Math.max(
        0,
        Math.ceil(
          (
            endAt -
            Date.now()
          )
          / 1000
        )
      );
  }


  running = false;

  endAt = null;


  stopTicking();

  render();
}


/* ------------------------------
   開始 / 一時停止
------------------------------ */

startPauseBtn.addEventListener(
  "click",
  () => {

    if (running) {

      pauseTimer();

    } else {

      startTimer();
    }
  }
);


/* ------------------------------
   リセット
------------------------------ */

resetBtn.addEventListener(
  "click",
  () => {

    running = false;

    endAt = null;


    stopTicking();


    remainingSeconds =
      selectedSeconds;


    render();
  }
);


/* ------------------------------
   プリセット
------------------------------ */

presetButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        selectedSeconds =
          Number(
            button.dataset.minutes
          )
          * 60;


        remainingSeconds =
          selectedSeconds;


        running = false;

        endAt = null;


        stopTicking();

        render();
      }
    );
  }
);


/* ------------------------------
   ネットワーク状態
------------------------------ */

function updateNetworkStatus() {

  networkStatus.textContent =
    navigator.onLine
      ? "オンライン"
      : "オフライン";
}


window.addEventListener(
  "online",
  updateNetworkStatus
);


window.addEventListener(
  "offline",
  updateNetworkStatus
);


/* ------------------------------
   PWA起動判定
------------------------------ */

const standalone =

  window
    .matchMedia(
      "(display-mode: standalone)"
    )
    .matches

  ||

  window.navigator
    .standalone === true;


pwaStatus.textContent =
  standalone
    ? "PWA表示"
    : "ブラウザ表示";


updateNetworkStatus();


/* ------------------------------
   バックグラウンド復帰
------------------------------ */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState
      !== "visible"
    ) {
      return;
    }


    if (
      running &&
      endAt
    ) {

      remainingSeconds =
        Math.max(
          0,
          Math.ceil(
            (
              endAt -
              Date.now()
            )
            / 1000
          )
        );


      if (
        remainingSeconds <= 0
      ) {

        running = false;

        endAt = null;

        stopTicking();
      }


      render();
    }
  }
);


/* ------------------------------
   初期化
------------------------------ */

loadState();

render();


if (running) {
  startTicking();
}


/* ------------------------------
   Service Worker登録
------------------------------ */

if (
  "serviceWorker"
  in navigator
) {

  window.addEventListener(
    "load",
    async () => {

      try {

        await navigator
          .serviceWorker
          .register(
            "./sw.js"
          );

      } catch (error) {

        console.error(
          "Service Worker registration failed:",
          error
        );
      }
    }
  );
}