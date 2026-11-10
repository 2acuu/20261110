const IDLE_FRAME_COUNT = 3; // 設定待機精靈表中的影格數量
const WALK_FRAME_COUNT = 6; // 設定行走精靈表中的影格數量
const MAGIC_FRAME_COUNT = 15; // 設定魔法精靈表中的影格數量
const EFFECT_FRAME_COUNT = 9; // 設定特效精靈表中的影格數量
const FRAME_INTERVAL = 120; // 設定每張影格顯示的毫秒數
const MOVE_SPEED = 5; // 設定角色每幀移動的像素距離
let idleSheet; // 儲存角色待機動畫的精靈表
let walkSheet; // 儲存角色行走動畫的精靈表
let magicSheet; // 儲存角色魔法動畫的精靈表
let effectSheet; // 儲存魔法完成後播放的特效精靈表
let characterCenterX; // 儲存角色中心點的水平位置
let facingDirection = 1; // 儲存角色朝向並以正值代表面向右邊
let actionState = "idle"; // 儲存角色目前的待機、行走、魔法或特效狀態
let actionStartedAt = 0; // 記錄目前一次性動畫開始播放的時間
let spaceKeyHeld = false; // 記錄空白鍵是否仍按住以避免鍵盤自動重複觸發
function preload() { // 在畫布啟動前載入所有角色素材
  idleSheet = loadImage("2/stop/stop.png"); // 載入角色待機精靈表
  walkSheet = loadImage("2/walk/waik.png"); // 載入資料夾中實際存在的行走精靈表
  magicSheet = loadImage("2/magic/magic.png"); // 載入角色魔法精靈表
  effectSheet = loadImage("2/circle/circle.png"); // 載入魔法完成後使用的特效精靈表
} // 結束素材預載函式
function setup() { // 初始化全螢幕畫布與角色位置
  createCanvas(windowWidth, windowHeight); // 建立符合目前視窗尺寸的畫布
  imageMode(CORNER); // 以圖片左上角作為繪製座標
  frameRate(60); // 設定畫面更新頻率以維持流暢繪製
  characterCenterX = width * (2 / 3); // 將角色初始位置設在畫面寬度的三分之二處
} // 結束初始化函式
function draw() { // 每個畫面更新時繪製背景與角色
  background(135, 206, 235); // 使用天空藍作為畫布背景
  const isActionPlaying = actionState === "magic" || actionState === "effect"; // 判斷魔法或特效動畫是否正在播放
  const actionFrameCount = actionState === "magic" ? MAGIC_FRAME_COUNT : EFFECT_FRAME_COUNT; // 取得目前一次性動畫的影格總數
  const actionDuration = actionFrameCount * FRAME_INTERVAL; // 計算目前一次性動畫完整播放所需時間
  if (isActionPlaying && millis() - actionStartedAt >= actionDuration) { // 判斷目前一次性動畫是否已經播放完畢
    actionState = actionState === "magic" ? "effect" : "idle"; // 魔法播放完接續特效，特效播放完返回待機
    actionStartedAt = millis(); // 記錄接續動畫或待機狀態的開始時間
  } // 結束一次性動畫播放完成的判斷
  const isMovingRight = !isActionPlaying && keyIsDown(RIGHT_ARROW); // 在一次性動畫以外檢查是否按住向右鍵
  const isMovingLeft = !isActionPlaying && keyIsDown(LEFT_ARROW) && !isMovingRight; // 在一次性動畫以外檢查是否按住向左鍵
  const isWalking = isMovingRight || isMovingLeft; // 判斷目前是否需要播放行走動畫
  if (isMovingRight) facingDirection = 1; // 向右移動時更新角色朝右
  if (isMovingLeft) facingDirection = -1; // 向左移動時更新角色朝左
  const currentSheet = actionState === "magic" ? magicSheet : actionState === "effect" ? effectSheet : isWalking ? walkSheet : idleSheet; // 依角色狀態選擇要繪製的精靈表
  const frameCount = actionState === "magic" ? MAGIC_FRAME_COUNT : actionState === "effect" ? EFFECT_FRAME_COUNT : isWalking ? WALK_FRAME_COUNT : IDLE_FRAME_COUNT; // 取得目前精靈表的影格數量
  const frameWidth = currentSheet.width / frameCount; // 計算目前精靈表中單格影格的寬度
  const frameElapsed = isActionPlaying ? millis() - actionStartedAt : millis(); // 取得一次性動畫或循環動畫的播放時間
  const frameIndex = isActionPlaying ? min(floor(frameElapsed / FRAME_INTERVAL), frameCount - 1) : floor(frameElapsed / FRAME_INTERVAL) % frameCount; // 一次性動畫播放到尾格後等待切換，其他動畫持續循環
  const characterHeight = min(height * 0.42, width * 0.68); // 依裝置大小調整角色高度
  const characterWidth = characterHeight * (frameWidth / currentSheet.height); // 依影格比例計算角色寬度
  const sourceX = frameIndex * frameWidth; // 計算目前影格在精靈表中的水平位置
  const direction = isMovingRight ? 1 : isMovingLeft ? -1 : 0; // 依按鍵方向決定角色移動方向
  characterCenterX += direction * MOVE_SPEED; // 按住方向鍵時更新角色水平位置
  characterCenterX = constrain(characterCenterX, characterWidth / 2, width - characterWidth / 2); // 限制角色不超出畫布左右邊界
  const characterY = height - characterHeight; // 將角色底部對齊畫布底端
  push(); // 暫存畫布座標狀態以便控制角色轉向
  translate(characterCenterX, characterY); // 將座標原點移至角色底部中心
  if (facingDirection === -1) scale(-1, 1); // 角色朝左時水平翻轉目前動畫圖片
  image(currentSheet, -characterWidth / 2, 0, characterWidth, characterHeight, sourceX, 0, frameWidth, currentSheet.height); // 裁切並繪製目前角色影格
  pop(); // 還原畫布座標狀態
} // 結束每幀繪製函式
function keyPressed() { // 處理空白鍵並開始播放一次性魔法動畫
  if (key === " ") { // 僅處理空白鍵按下事件
    if (!spaceKeyHeld && actionState !== "magic" && actionState !== "effect") { // 僅在新按下且沒有播放其他動作時開始施法
      actionState = "magic"; // 切換至魔法動畫狀態
      actionStartedAt = millis(); // 記錄魔法動畫的開始時間
    } // 結束新按下空白鍵的施法判斷
    spaceKeyHeld = true; // 標記空白鍵已按住以忽略自動重複事件
    return false; // 阻止空白鍵造成瀏覽器頁面捲動
  } // 結束空白鍵施法判斷
} // 結束鍵盤按下事件函式
function keyReleased() { // 處理空白鍵放開並允許下次施法
  if (key === " ") spaceKeyHeld = false; // 放開空白鍵後清除按住狀態
} // 結束鍵盤放開事件函式
function windowResized() { // 視窗或裝置方向改變時重新調整畫布
  resizeCanvas(windowWidth, windowHeight); // 讓畫布重新填滿目前視窗
  characterCenterX = constrain(characterCenterX, 0, width); // 將角色位置限制在新畫布範圍內
} // 結束視窗尺寸更新函式
