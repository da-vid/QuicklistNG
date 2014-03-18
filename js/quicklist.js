
window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);

angular.module("quicklist", ["firebase", "linkify", "ui.sortable", "mgcrea.ngStrap"])

    .factory("listName", ["$firebase", function($firebase) {
        var ref = new Firebase("https://qwiklist.firebaseio.com/listAttrs/" + getListID() + "/listName");
        return $firebase(ref);
    }])

    .factory("listAttrs", ["$firebase", function($firebase) {
        var ref = new Firebase("https://qwiklist.firebaseio.com/listAttrs/" + getListID());
        return $firebase(ref);
    }])

    .controller("listController", ["$scope", "$firebase", "$modal",  "listName", "listAttrs",
        function($scope, $firebase, $modal, listName, listAttrs) {       
            getListID();     
            $scope.listName = listName;
            $scope.listAttrs = listAttrs;
            var listsRef = new Firebase("https://qwiklist.firebaseio.com/lists/" + getListID());            
            $scope.items = $firebase(listsRef);
            $scope.loaded = false;
            $scope.title = "blah";
            $scope.content ="contentblah";

            //Handle timeouts
            var timeOut = 10800000; //in milliseconds: three hours
            var timeOutID = setTimeout(goOffline, timeOut);
            $scope.offline = false;

            document.addEventListener('keydown', stuffIsHappening);
            document.addEventListener('mousedown', stuffIsHappening);
            document.addEventListener('mousemove', stuffIsHappening);            
            document.addEventListener('touchstart', stuffIsHappening);

            var shareModal = $modal({scope: $scope, template: 'shareModal.html', animation:'am-fade-and-slide-top', show: false});
            var newListModal = $modal({scope: $scope, template: 'newListModal.html', animation:'am-fade-and-slide-top', show: false});

            //form validation pattern: http://stackoverflow.com/a/18747273
            $scope.moreThanWhitespace = /\S/;
            $scope.defaultPageTitle = "qList.cc | quick lists";
            $scope.defaultListName = "my list";
            $scope.pageURL = document.location.href;
            $scope.pageDisplayURL = document.location.hostname + document.location.pathname;

            $scope.sortableOptions = {
                start: function (e, ui) {
                    stuffIsHappening();
                },
                handle: ".gripper",
                disabled: false
            };

            $scope.addItem = function() {                
                stuffIsHappening();
                if ($scope.addItemForm.addItemBox.$valid) {
                    listsRef.child($scope.nextItemID()).setWithPriority({ID: $scope.nextItemID(), name: $scope.itemName, checked: false}, $scope.nextPriority());
                }
                $scope.itemName = "";                
                setLastMod();
            };

            $scope.deleteItem = function(itemID) {                
                stuffIsHappening();
                var keys = $scope.items.$getIndex();
                keys.forEach(function (key, i) {
                    if($scope.items[key].ID === itemID) {
                        $scope.items.$remove(key); 
                    }
                });                   
                setLastMod();             
            };

            $scope.checkItem = function(item) {                
                stuffIsHappening();
                item.checked = !item.checked;
                $scope.items.$save();                     
                setLastMod();
            };

            $scope.items.$on("loaded", function() {
                $scope.loaded = true;
            });

            $scope.getListName = function() {
                if(!$scope.listName.$value) 
                    return $scope.defaultPageTitle;
                return $scope.listName.$value;
            };

            $scope.setListName = function() {                
                stuffIsHappening();
                $scope.listName.$set($scope.listName.$value);                 
                setLastMod();
            };

            function stuffIsHappening() {
                if($scope.offline) { 
                    Firebase.goOnline();
                    console.log("Went Online.");
                    $scope.offline = false;
                }
                resetTimeoutClock();
            }

            function resetTimeoutClock() {
                clearTimeout(timeOutID);
                timeOutID = setTimeout(goOffline, timeOut);
            }

            function goOffline() {
                Firebase.goOffline();
                $scope.offline = true;
                console.log("Went offline.");
            }

            function setLastMod() {
                $scope.listAttrs.$update({lastMod: Math.floor(new Date().getTime()/1000) });
            }

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

            $scope.nextPriority = function() {
                var maxPriority = 0;
                var keys = $scope.items.$getIndex();

                keys.forEach(function (key, i) {
                    if($scope.items[key].$priority > maxPriority) {
                        maxPriority = $scope.items[key].$priority;
                    }
                });
                return maxPriority + 1;
            };

            $scope.fbCount = function(list) {
                var count = 0;
                var keys = list.$getIndex();

                keys.forEach(function (key, i) {
                    count++;
                });
                return count;
            };

            $scope.showShareModal = function () {
                shareModal.$promise.then(function() {
                    shareModal.show();
                    // // // document.getElementById("pageBox").focus();
                    //  if (document.selection) {
                    //     var range = document.body.createTextRange();
                    //     range.moveToElementText(document.getElementById("pageBox"));
                    //     range.select();
                    //  } else /*if (window.getSelection())*/ {
                    //     var range = document.createRange();
                    //     range.selectNode(document.getElementById("pageBox"));
                    //     window.getSelection().removeAllRanges();
                    //     window.getSelection().addRange(range);
                    //  }
                });
            };

            $scope.showNewListModal = function() {
                $scope.showModal(newListModal);
            };

            $scope.showModal = function (modalObj) {
                modalObj.$promise.then(function() {
                    modalObj.show();
                });
            };


            // $scope.sharePopover = {
            //   "title": "Share things",
            //   "content": "Share it!"
            // };

            // $scope.newPopover = {
            //   "title": "New List",
            //   "content": "Remember to save your list URL!"
            // };
        }


    ])

    .directive('selectOnClick', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', function () {
                    this.select();
                });
            }
        };
    })

    .directive('selectPageBox', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', function () {
                    document.getElementById("pageBox").select();
                });
            }
        };
    });



