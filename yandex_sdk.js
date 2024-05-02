let ysdk;
function InitGame(params, callback) {
    console.log('Yandex SDK start initialisation');
    YaGames.init(params).then(_sdk => {
        ysdk = _sdk;
        console.log('Yandex SDK initialized');

        ysdk.features.LoadingAPI?.ready();
        console.log('Game initialized');
        
        callback();
    }).catch(e => {
        console.error('Game initialization error: ', e);
    });
}

let lb;
function InitLeaderboard(callback) {
    console.log("Leaderboard start initialization");
    ysdk.getLeaderboards()
      .then(_lb => {
        lb = _lb;
        console.log("Leaderboard initialized");
    
        callback()
    }).catch(e => {
        console.log('Leaderboard initialization error: ', e);
    });

}

let payments;
function InitPayments(full, callback) {
    ysdk.getPayments({ signed: full }).then(_payments => {
        payments = _payments
        console.log("Payments initialized")
        callback()
    }).catch(e => {
        console.error('Payments initialization error: ', e)
    })
}

let player;
function InitPlayer(full, callback) {
    console.log('Player start initialisation');
    ysdk.getPlayer({ signed: full }).then(_player => {
        player = _player;
        console.log('Player initialized');
        callback();
     }).catch(e => {
        console.error('Player initialization error: ', e);
    });
}

function IsDesktop() {
    return ysdk.deviceInfo.isDesktop()
}

function ConnectToTabEvents(focusedCallback, switchedCallback) {
    console.log("ConnectToTabEvents")
    window.addEventListener('blur', switchedCallback)
    window.addEventListener('focus', focusedCallback)
}

function GetFlags(callback) {
    ysdk.getFlags().then(flags => {
        console.log('Flags: ', flags)
        callback("success", flags)
    })
    .catch(e => {
        console.error('GetFlags error: ', e)
        callback("error")
    })
}

function GetPurchases(full, callback) {
    payments.getPurchases({ signed: full }).then(purchases => {
        console.log('Purchases: ', purchases)
        callback("success", purchases)
    }).catch(e => {
        console.error('GetPurchases error: ', e)
        callback("error")
    })
}

function Purchase(id, callback) {
    payments.purchase({ "id": id }).then(purchase => {
        console.log("Purchase: ", purchase)
        callback("success", purchase)
    }).catch(e => {
        console.error('Purchase error: ', e)
        callback("error")
    })
}

function ConsumePurchase(purchaseToken) {
    console.log("consume purchase: ", purchaseToken)
    payments.consumePurchase(purchaseToken)
}

function GetLeaderboardDescription(leaderboardName, callback) {
  lb.getLeaderboardDescription(leaderboardName).then(
      result => {
      console.log("Leaderboard description: ", result);
      callback("loaded", result);
    },
      error => {
          console.error('Leaderboard description load error');
          callback("error");
      }
  );
}

function CheckAuth(callback) {
    ysdk.isAvailableMethod('leaderboards.setLeaderboardScore')
      .then(
      result => {
        callback(result);
      },
      error => {
          console.error("isAvailableMethod setLeaderboardScore error");
          callback(false);
      }
    );
}

function SaveLeaderboardScore(leaderboardName, score, extraData) {
  console.log('Save leaderboard score', score, "on", leaderboardName, "with", extraData);
    lb.setLeaderboardScore(leaderboardName, score, extraData).then(() => {
        console.log('Leaderboard score saved');
    });
}

function LoadLeaderboardPlayerEntry(leaderboardName, callback) {
  lb.getLeaderboardPlayerEntry(leaderboardName)
  .then(res => {
      console.log("Loader leaderboard player entry:", res)
      callback("loaded", res);
    })
  .catch(err => {
    if (err.code === 'LEADERBOARD_PLAYER_NOT_PRESENT') {
      console.error("У игрока нет записи в лидерборде");
    }
    else
      console.error(err);
    callback("error")
  });
}

function LoadLeaderboardEntries(leaderboardName, includeUser, quantityAround, quantityTop, callback) {
  lb.getLeaderboardEntries(leaderboardName, {
    includeUser: includeUser,
    quantityAround: quantityAround,
    quantityTop: quantityTop
  })
  .then(res => {
    console.log("Loaded leaderboard entries:", res);
    callback("loaded", res);
  })
  .catch(e => {
    if (e.code === 'LEADERBOARD_NOT_FOUND') {
      console.error("Лидерборд не найден.");
    } else {
      console.error(e);
    }
    callback("error");
  });
}

function OpenAuthDialog() {
    if (player.getMode() === 'lite') {
        // Игрок не авторизован.
        ysdk.auth.openAuthDialog().then(() => {
            console.log("Игрок успешно авторизован")
            player.catch(e => {
                console.error("Ошибка при инициализации объекта Player ", e)
            });
        }).catch(() => {
            console.error("Игрок не авторизован")
        });
    }
}

function ShowAd(callback) {
    console.log('Show ad');
    ysdk.adv.showFullscreenAdv({
        callbacks: {
            onClose: function(wasShown) {
                callback('closed')
                console.log('Ad shown');
            },
            onError: function(error) {
                callback('error')
                console.error('Ad error: ', error);
            }
        }
    })
}


function ShowAdRewardedVideo(callback) {
    console.log('Show rewarded video');
    ysdk.adv.showRewardedVideo({
        callbacks: {
            onOpen: () => {
                callback("opened")
                console.log('Rewarded video open.');
            },
            onRewarded: () => {
                callback("rewarded")
                console.log('Rewarded!');
            },
            onClose: () => {
                callback("closed")
                console.log('Rewarded video ad closed.');
            }, 
            onError: (e) => {
                callback("error")
                console.error('Error while open rewarded video ad:', e);
            }
        }
    })
}


function SaveData(data, force) {
    console.log('Data save ', data);
    player.setData(data, force).then(() => {
        console.log('Data saved');
    });
}


function SaveStats(data) {
    console.log('Stats save ', data);
    player.setStats(data).then(() => {
            console.log('Stats saved');
    });
}


function LoadData(keys, callback) {
    console.log('Data load ', keys);
    player.getData(keys).then(
        result => {
            console.log('Data loaded');
            callback("loaded", result);
        },
        error => {
            console.error('Data load error');
            callback("error");
        }
    );
}


function LoadStats(keys, callback) {
    console.log('Stats load ', keys);
    player.getStats(keys).then(
        result => {
            console.log('Stats loaded');
            callback("loaded", result);
        },
        error => {
            console.error('Stats load error');
            callback("error");
        }
    );
}

function GetLang() {
    return ysdk.environment.i18n.lang
}

function IsArray(value) {
    return Array.isArray(value)
}
