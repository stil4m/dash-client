angular.module('DashClient', [])
  .controller('MainCtrl', function ($http, $timeout) {
    var self = this;

    self.dateFormat = 'yyyy-MM-dd HH:mm:ss';

    $http.get('data').success(function (data) {
      self.reportData = data;
      $timeout(function() {
        self.reportData.forEach(function(item) {
          var total = 0;
          item.transactions.forEach(function(transaction) {
            total += transaction.duration;
          });
          item.average = Math.round(total / item.transactions.length);

          item.transactions.forEach(function(transaction) {
              transaction.strangeDuration = (Math.abs(item.average - transaction.duration) > item.average * 0.25)
          });
        })
      }, 300);
    }).error(function () {
      self.failedToLoad = true;
    })
  }
);