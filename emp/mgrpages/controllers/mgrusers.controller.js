//User Accounts Page get all users / Clear filter (on mgrusers.html)
angular.module('emp').controller('userCtrl', ['$scope', '$http', '$window', '$modal', function ($scope, $http, $window, $modal) {
    $scope.orderByUserField = 'lastname';
    $scope.reverseUserSort = false;

    if ($window.jwtToken) $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

    loadUserData();

    function loadUserData() {
        $scope.users = [];
        $http.get('/api/protected/users').then(function (res) {
            $scope.users = res.data;
            angular.forEach($scope.users, function (obj) {
                if (obj.group == 1) {
                    obj.Membership = "Employee";
                } else if (obj.group == 2) {
                    obj.Membership = "Manager";
                } else {
                    obj.Membership = "Customer";
                }
            });
        });
    };



    $scope.clearUserFilter = function () {
        $scope.txtUserFilter = null;
    };
    // MODAL WINDOW
    $scope.openUser = function (_user) {
        var modalInstance = $modal.open({
            controller: "ModalInstanceCtrl",
            templateUrl: '/emp/mgrpages/mgrusers.modal.html',
            resolve: {
                user: function () {
                    return _user;
                }
            }
        });
        modalInstance.result.then(function () {
            loadUserData();
        });
    };
}]);

//Mgrusers.modal.html
app.controller('ModalInstanceCtrl', function ($scope, user, $modalInstance, $http) {
    if (user == "new") {
        $scope.newUser = true;
        //temp user
        user = {
            firstname: "",
            lastname: "",
            dob: "",
            phone: "",
            email: "",
            address: "",
            password: "password",
            group: 0
        }

    }
    $scope.mbrs = [{Membership: "Customer", group: 0}, {Membership: "Employee", group: 1},{Membership: "Manager", group: 2}];


    $scope.user = user;
    console.clear();
    console.log(user);

    $scope.origUser = angular.copy($scope.user);

    $scope.cancelUser = function () {
        if (!$scope.newUser) {
            angular.copy($scope.origUser, $scope.user);
        }
        $modalInstance.dismiss('cancel');
    };

    $scope.deleteUser = function (request, response) {
        $http.delete('/api/protected/users/' + user._id, {
                _id: user._id
            })
            .then(
                function (response) {
                    // success callback
                },
                function (response) {
                    // failure callback
                    console.log("falied to delete");
                }
            );
        $modalInstance.close();
    };

    $scope.okUser = function (request, response) {
        console.log(user);
        user = _.omit(user, 'Membership');
        console.log(user);
        if (!$scope.newUser) {
            $http.put('/api/protected/users/' + user._id, user)
                .then(
                    function (response) {
                        // success callback
                    },
                    function (response) {
                        // failure callback
                        console.log(JSON.stringify(response));
                    }
                );
        } else {
            $http.post('/api/public/users/register/', user).then(
                function (response) {
                    // success callback
                    console.log("Post Sucessful");
                    console.log(JSON.stringify(response));
                },
                function (response) {
                    // failure callback
                    console.log("Failed to Post");
                    console.log(JSON.stringify(response));
                }
            );
        }
        $modalInstance.close();
    };
});