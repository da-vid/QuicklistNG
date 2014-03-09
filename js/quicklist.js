
window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);

angular.module("quicklist", ["firebase", "linkify", "ui"])

    .factory("list", ["$firebase", function($firebase) {
        getListID();
        var ref = new Firebase("https://qwiklist.firebaseio.com/lists/" + getListID());
        return $firebase(ref);
    }])


    .factory("listName", ["$firebase", function($firebase) {
        getListID();
        var ref = new Firebase("https://qwiklist.firebaseio.com/listNames/" + getListID());
        return $firebase(ref);
    }])

    .controller("listController", ["$scope", "list", "listName",
        function($scope, list, listName) {
            $scope.items = list;
            $scope.listName = listName;
            //$scope.titleText = getListName();
            $scope.loaded = false;


            //form validation pattern: http://stackoverflow.com/a/18747273
            $scope.moreThanWhitespace = /\S/;
            $scope.defaultProductName = "quicklist";

            $scope.addItem = function() {
                if ($scope.addItemForm.addItemBox.$valid) {
                    $scope.items.$add({ID: $scope.nextItemID(), name: $scope.itemName, checked: false});
                }
                $scope.itemName = "";
            };

            $scope.deleteItem = function(itemID) {
                var keys = $scope.items.$getIndex();
                keys.forEach(function (key, i) {
                    if($scope.items[key].ID === itemID) {
                        $scope.items.$remove(key); 
                    }
                });
            };

            $scope.checkItem = function(item) {
                item.checked = !item.checked;
                $scope.items.$save();
            };

            $scope.items.$on("loaded", function() {
                $scope.loaded = true;
            });

            $scope.getListName = function() {
                if(!$scope.listName.$value) 
                    return $scope.defaultProductName;
                return $scope.listName.$value;
            };

            $scope.setListName = function() {
                $scope.listName.$set($scope.listName.$value);
            };

            $scope.nextItemID = function() {
                var maxItemID = 0;
                var keys = $scope.items.$getIndex();

                //https://www.firebase.com/docs/angular/reference.html#getindex
                keys.forEach(function (key, i) {
                    if($scope.items[key].ID > maxItemID) {
                        maxItemID = $scope.items[key].ID;
                    }
                });
                return maxItemID + 1;
            };

            $scope.fbCount = function(list) {
                var count = 0;
                var keys = list.$getIndex();

                keys.forEach(function (key, i) {
                    count++;
                });
                return count;
            };
        }
    ]);



