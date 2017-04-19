var app = angular.module('App', ['pascalprecht.translate']);

app.config(function($translateProvider) {

  $translateProvider.useStaticFilesLoader({
    prefix: 'locales/',
    suffix: '.json',
  });

  $translateProvider.preferredLanguage('pt');

});

app.controller('MainCtrl',
  ['$scope', '$translate',
  function($scope, $translate) {

  $scope.accountRS = '';
  $scope.alias = '';
  $scope.loggedIn = false;
  $scope.loginForm = {
    account: '',
    error: '',
  };


  $scope.login = function() {

    $scope.loginForm.error = '';
    var regex = /NXT\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{5}/i;

    if (regex.test($scope.loginForm.account)) {

      return Nxt.request({
        requestType: 'getAccount',
        account: $scope.loginForm.account,
      },
      function(err, result) {
        if (err || !result.data.accountRS) {
          $translate('ERROR_ACCOUNT').then(string => {
            $scope.loginForm.error = string;
            $scope.$apply();
          });
          return $scope.$apply();
        }
        if (!responseIsValid(result)) { return; }
        $scope.loggedIn = true;
        $scope.accountRS = result.data.accountRS;
        getTransactions();
      });

    }

    Nxt.request({
      requestType: 'getAlias',
      aliasName: $scope.loginForm.account,
    },
    function(err, result) {
      if (err || !result.data.accountRS) {
        $translate('ERROR_ALIAS').then(string => {
          $scope.loginForm.error = string;
        });
        return $scope.$apply();
      }
      if (!responseIsValid(result)) { return; }
      $scope.loggedIn = true;
      $scope.alias = $scope.loginForm.alias;
      $scope.accountRS = result.data.accountRS;
      getTransactions();
    });

  };


  var transfers = [];
  function getAssetTransfers(callback) {
    if (!config.assetId && !config.showAllAssets) {
      return callback();
    }
    Nxt.request({
      requestType: 'getAssetTransfers',
      account: $scope.accountRS,
      includeAssetInfo: true,
      asset: config.assetId,
    },
    function(err, result) {
      if (err || !result.data.transfers) {
        return callback('ERROR_ASSET');
      }
      if (!responseIsValid(result)) { return; }
      processTransfers(result.data, callback);
    });
  };


  function getCurrencyTransfers(callback) {
    if (!config.currencyId && !config.showAllCurrencies) {
      return callback();
    }
    Nxt.request({
      requestType: 'getCurrencyTransfers',
      account: $scope.accountRS,
      includeCurrencyInfo: true,
      currency: config.currencyId,
    },
    function(err, result) {
      if (err || !result.data.transfers) {
        return callback('ERROR_CURRENCY');
      }
      if (!responseIsValid(result)) { return; }
      processTransfers(result.data, callback);
    });
  };


  function processTransfers(data, callback) {
    var count = 0;
    data.transfers.forEach(function(e) {
      getAccountAlias(e, function(transfer) {
        transfers.push(e);
        count++;
        if (count === data.transfers.length) {
          callback();
        }
      });
    });
  };


  function getAccountAlias(transfer, callback) {
    Nxt.request({
      requestType: 'getAliases',
      account: transfer.senderRS,
    },
    function(err, result) {
      if (err || !result.data || result.data.aliases.length === 0) {
        return callback(transfer);
      }
      if (!responseIsValid(result)) { return; }
      transfer._aliasName = result.data.aliases[0].aliasName;
      return callback(transfer);
    });
  };


  function getTransactions() {
    getAssetTransfers(function(err) {
      if (err) {
        $translate(err).then(string => alert(string));
      }
      getCurrencyTransfers(function(err) {
        if (err) {
          $translate(err).then(string => alert(string));
        }
        transfers.sort(function(a, b) {
          return b.timestamp - a.timestamp;
        });
        $scope.transactions = transfers;
        $scope.$apply();
      });
    });

    if (config.assetId) {

      Nxt.request({
        requestType: 'getAccountAssets',
        account: $scope.accountRS,
        asset: config.assetId,
        includeAssetInfo: true,
      },
      function(err, result) {
        if (!responseIsValid(result)) { return; }
        $scope.total = {
          name: result.data.name,
          code: result.data.name,
          amount: $scope.getCoinAmount(result.data),
        };
        $scope.$apply();
      });

    } else if (config.currencyId) {

      Nxt.request({
        requestType: 'getAccountCurrencies',
        account: $scope.accountRS,
        currency: config.currencyId,
        includeCurrencyInfo: true,
      },
      function(err, result) {
        if (!responseIsValid(result)) { return; }
        $scope.total = {
          name: result.data.name,
          code: result.data.code,
          amount: $scope.getCoinAmount(result.data),
        };
        $scope.$apply();
      });

    }
  };


  function responseIsValid(resp) {
    return resp.score > 0.6;
  };


  $scope.getCoinName = function(transfer) {
    if (transfer.assetTransfer) {
      return transfer.name;
    }
    return transfer.code;
  };


  $scope.getCoinAmount = function(transfer) {
    var amount = transfer.quantityQNT || transfer.units;
    return amount / Math.pow(10, transfer.decimals);
  };


  $scope.getTimestamp = function(transfer) {
    return (transfer.timestamp + 1385294400) * 1000;
  };


  $scope.isNaN = isNaN;


},]);
